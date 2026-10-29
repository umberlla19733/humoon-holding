//+------------------------------------------------------------------+
//|                                  GroupTPSL_BreakEven_XAUUSD.mq5  |
//|  Group TakeProfit / StopLoss synchronizer + Auto BreakEven (MT5) |
//|                                                                  |
//|  - Change SL or TP on ONE position -> same setting is applied    |
//|    to all other positions in the same group.                     |
//|  - When a position moves into profit by X pips, its SL is moved  |
//|    automatically to BreakEven (+ optional locked profit).       |
//|  - Designed for Gold (XAUUSD) but works on any symbol.           |
//|                                                                  |
//|  WARNING: This EA MODIFIES live positions (SL/TP). Test it on a  |
//|  demo account / Strategy Tester before using it on a live one.   |
//+------------------------------------------------------------------+
#property copyright "Humoon Holding"
#property version   "1.00"
#property strict
#property description "Group SL/TP sync + Auto BreakEven (Risk-Free) for XAUUSD / MT5"

#include <Trade\Trade.mqh>

//+------------------------------------------------------------------+
//| Enums                                                             |
//+------------------------------------------------------------------+
enum ENUM_GROUP_MODE
{
   GROUP_SYMBOL_DIRECTION = 0, // Same symbol + same direction (BUY with BUY, SELL with SELL) [recommended]
   GROUP_SYMBOL_ONLY      = 1  // Same symbol, all directions together
};

enum ENUM_SYNC_MODE
{
   SYNC_EXACT_PRICE = 0, // Copy the exact SL/TP price to the whole group
   SYNC_DISTANCE    = 1  // Keep the same distance from each position's open price
};

//+------------------------------------------------------------------+
//| Inputs - Position filter                                          |
//+------------------------------------------------------------------+
input group "=== Position Filter ==="
input string         InpSymbol            = "";        // Symbol to manage (empty = chart symbol)
input bool           InpManageAllSymbols  = false;     // Manage ALL symbols (ignore symbol filter)
input bool           InpUseMagicFilter    = false;     // Use Magic Number filter
input long           InpMagicNumber       = 0;         // Magic Number (0 = manual trades)
input bool           InpManageBuys        = true;      // Manage BUY positions
input bool           InpManageSells       = true;      // Manage SELL positions

//+------------------------------------------------------------------+
//| Inputs - Group SL/TP synchronization                              |
//+------------------------------------------------------------------+
input group "=== Group SL/TP Synchronization ==="
input bool           InpSyncEnable        = true;                    // Enable group synchronization
input ENUM_GROUP_MODE InpGroupMode        = GROUP_SYMBOL_DIRECTION;  // Grouping mode
input ENUM_SYNC_MODE InpSyncMode          = SYNC_EXACT_PRICE;        // Synchronization mode
input bool           InpSyncSL            = true;                    // Sync Stop Loss
input bool           InpSyncTP            = true;                    // Sync Take Profit
input bool           InpAllowClearing     = true;                    // Propagate removing SL/TP (setting to 0)

//+------------------------------------------------------------------+
//| Inputs - Auto BreakEven (Risk Free)                               |
//+------------------------------------------------------------------+
input group "=== Auto BreakEven (Risk Free) ==="
input bool           InpBEEnable          = true;      // Enable Auto BreakEven
input double         InpBETriggerPips     = 300.0;     // BreakEven trigger (pips in profit)
input double         InpBELockPips        = 20.0;      // Profit to lock at BreakEven (pips, 0 = pure BE)
input double         InpBEMinStepPips     = 1.0;       // Minimum SL improvement to send a modification (pips)

//+------------------------------------------------------------------+
//| Inputs - Trailing Stop (after BreakEven, optional)                |
//+------------------------------------------------------------------+
input group "=== Trailing Stop (optional) ==="
input bool           InpTrailEnable       = false;     // Enable trailing stop
input double         InpTrailTriggerPips  = 500.0;     // Trailing start (pips in profit)
input double         InpTrailDistancePips = 200.0;     // Trailing distance (pips)
input double         InpTrailStepPips     = 10.0;      // Trailing step (pips)

//+------------------------------------------------------------------+
//| Inputs - Pip definition & general                                 |
//+------------------------------------------------------------------+
input group "=== Pip Definition / General ==="
input double         InpPipSizePrice      = 0.10;      // Pip size in PRICE for XAUUSD (0.10 = 10 cents; set 1.0 if your broker counts $1 as 1 pip)
input int            InpTimerMs           = 250;       // Scan interval (milliseconds)
input bool           InpShowPanel         = true;      // Show info panel on chart
input bool           InpVerboseLog        = true;      // Write detailed log to Journal

//+------------------------------------------------------------------+
//| Globals                                                           |
//+------------------------------------------------------------------+
CTrade g_trade;

struct PosState
{
   ulong  ticket;
   double sl;
   double tp;
   double expected_sl;   // value last set BY THIS EA (to ignore own changes)
   double expected_tp;
   bool   has_expected;
   bool   be_done;
};

PosState g_states[];
datetime g_last_sync_time = 0;
string   g_last_action    = "Waiting...";

//+------------------------------------------------------------------+
//| Helpers                                                           |
//+------------------------------------------------------------------+
double PipSize()
{
   return (InpPipSizePrice > 0.0 ? InpPipSizePrice : _Point);
}

bool PriceEqual(const double a, const double b, const string symbol)
{
   double pt = SymbolInfoDouble(symbol, SYMBOL_POINT);
   if(pt <= 0.0) pt = _Point;
   return (MathAbs(a - b) < pt * 0.5);
}

bool IsManagedSelected()
{
   string symbol = PositionGetString(POSITION_SYMBOL);

   if(!InpManageAllSymbols)
   {
      string wanted = (InpSymbol == "" ? _Symbol : InpSymbol);
      if(symbol != wanted)
         return false;
   }

   long type = PositionGetInteger(POSITION_TYPE);
   if(type == POSITION_TYPE_BUY  && !InpManageBuys)  return false;
   if(type == POSITION_TYPE_SELL && !InpManageSells) return false;

   if(InpUseMagicFilter)
   {
      if(PositionGetInteger(POSITION_MAGIC) != InpMagicNumber)
         return false;
   }
   return true;
}

bool SameGroup(const string sym_a, const long type_a, const string sym_b, const long type_b)
{
   if(InpManageAllSymbols == false && sym_a != sym_b)
      return false;
   if(InpManageAllSymbols && sym_a != sym_b)
      return false; // positions on different symbols can never share exact prices safely
   if(InpGroupMode == GROUP_SYMBOL_DIRECTION && type_a != type_b)
      return false;
   return true;
}

int FindState(const ulong ticket)
{
   for(int i = 0; i < ArraySize(g_states); i++)
      if(g_states[i].ticket == ticket)
         return i;
   return -1;
}

void SetExpected(const ulong ticket, const double sl, const double tp)
{
   int idx = FindState(ticket);
   if(idx < 0)
   {
      idx = ArraySize(g_states);
      ArrayResize(g_states, idx + 1);
      g_states[idx].ticket   = ticket;
      g_states[idx].sl       = 0.0;
      g_states[idx].tp       = 0.0;
      g_states[idx].be_done  = false;
   }
   g_states[idx].expected_sl = sl;
   g_states[idx].expected_tp = tp;
   g_states[idx].has_expected = true;
   g_states[idx].sl = sl;
   g_states[idx].tp = tp;
}

void LogMsg(const string text)
{
   if(InpVerboseLog)
      Print("[GroupTPSL-BE] ", text);
}

// Check SL/TP validity against current market price & broker stops/freeze levels.
bool IsValidSLTP(const string symbol, const long type,
                 const double sl, const double tp, string &why)
{
   double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
   double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
   if(bid <= 0.0 || ask <= 0.0) { why = "no quote"; return false; }

   double pt         = SymbolInfoDouble(symbol, SYMBOL_POINT);
   long   stop_level = SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL);
   long   freeze_lvl = SymbolInfoInteger(symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   double min_dist   = (double)MathMax(stop_level, freeze_lvl) * pt;

   if(type == POSITION_TYPE_BUY)
   {
      if(sl != 0.0 && sl >= bid - min_dist) { why = "SL too close/above Bid for BUY"; return false; }
      if(tp != 0.0 && tp <= bid + min_dist) { why = "TP too close/below Bid for BUY"; return false; }
   }
   else if(type == POSITION_TYPE_SELL)
   {
      if(sl != 0.0 && sl <= ask + min_dist) { why = "SL too close/below Ask for SELL"; return false; }
      if(tp != 0.0 && tp >= ask - min_dist) { why = "TP too close/above Ask for SELL"; return false; }
   }
   return true;
}

bool ModifyPosition(const ulong ticket, const double new_sl, const double new_tp,
                    const string reason)
{
   if(!PositionSelectByTicket(ticket))
      return false;

   string symbol   = PositionGetString(POSITION_SYMBOL);
   long   type     = PositionGetInteger(POSITION_TYPE);
   double cur_sl   = PositionGetDouble(POSITION_SL);
   double cur_tp   = PositionGetDouble(POSITION_TP);
   int    digits   = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);

   double sl = (new_sl == 0.0 ? 0.0 : NormalizeDouble(new_sl, digits));
   double tp = (new_tp == 0.0 ? 0.0 : NormalizeDouble(new_tp, digits));

   if(PriceEqual(sl, cur_sl, symbol) && PriceEqual(tp, cur_tp, symbol))
      return true; // nothing to do

   string why = "";
   if(!IsValidSLTP(symbol, type, sl, tp, why))
   {
      LogMsg(StringFormat("Skip #%I64u (%s): %s | SL=%.5f TP=%.5f",
                          ticket, reason, why, sl, tp));
      return false;
   }

   g_trade.SetExpertMagicNumber(PositionGetInteger(POSITION_MAGIC));
   bool ok = g_trade.PositionModify(ticket, sl, tp);
   if(ok)
   {
      SetExpected(ticket, sl, tp);
      g_last_action = StringFormat("#%I64u -> SL %.2f / TP %.2f (%s)",
                                   ticket, sl, tp, reason);
      LogMsg(g_last_action);
   }
   else
   {
      LogMsg(StringFormat("Modify FAILED #%I64u (%s) retcode=%u %s",
                          ticket, reason, g_trade.ResultRetcode(),
                          g_trade.ResultRetcodeDescription()));
   }
   return ok;
}

//+------------------------------------------------------------------+
//| Group synchronization                                             |
//+------------------------------------------------------------------+
void SyncFromMaster(const ulong master_ticket, const double master_open,
                    const long master_type, const string master_symbol,
                    const double master_sl, const double master_tp,
                    const bool sl_changed, const bool tp_changed,
                    const double old_master_sl, const double old_master_tp)
{
   // Respect clearing rule: optionally ignore "SL/TP removed" (set to zero)
   bool do_sl = (InpSyncSL && sl_changed && (InpAllowClearing || master_sl != 0.0 || old_master_sl == 0.0));
   bool do_tp = (InpSyncTP && tp_changed && (InpAllowClearing || master_tp != 0.0 || old_master_tp == 0.0));
   if(InpSyncSL && sl_changed && master_sl == 0.0 && !InpAllowClearing) do_sl = false;
   if(InpSyncTP && tp_changed && master_tp == 0.0 && !InpAllowClearing) do_tp = false;
   if(!do_sl && !do_tp)
      return;

   long dir_master = (master_type == POSITION_TYPE_BUY ? 1 : -1);
   int changed = 0;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || ticket == master_ticket)
         continue;
      if(!IsManagedSelected())
         continue;

      string symbol = PositionGetString(POSITION_SYMBOL);
      long   type   = PositionGetInteger(POSITION_TYPE);
      if(!SameGroup(symbol, type, master_symbol, master_type))
         continue;

      double open  = PositionGetDouble(POSITION_OPEN);
      double cur_sl = PositionGetDouble(POSITION_SL);
      double cur_tp = PositionGetDouble(POSITION_TP);
      long   dir_target = (type == POSITION_TYPE_BUY ? 1 : -1);

      double new_sl = cur_sl;
      double new_tp = cur_tp;

      if(do_sl)
      {
         if(InpSyncMode == SYNC_EXACT_PRICE || dir_master == dir_target)
            new_sl = master_sl;
         else // mirror the distance for the opposite direction
            new_sl = open + (master_sl - master_open) * (dir_master * dir_target);
         if(master_sl == 0.0) new_sl = 0.0;
      }
      if(do_tp)
      {
         if(InpSyncMode == SYNC_EXACT_PRICE || dir_master == dir_target)
            new_tp = master_tp;
         else
            new_tp = open + (master_tp - master_open) * (dir_master * dir_target);
         if(master_tp == 0.0) new_tp = 0.0;
      }

      if(ModifyPosition(ticket, new_sl, new_tp, "group sync from #" + IntegerToString((long)master_ticket)))
         changed++;
   }

   if(changed > 0)
   {
      g_last_sync_time = TimeCurrent();
      g_last_action = StringFormat("Group sync from #%I64d applied to %d position(s)",
                                   (long)master_ticket, changed);
      LogMsg(g_last_action);
   }
}

//+------------------------------------------------------------------+
//| BreakEven + Trailing for one (already selected) position          |
//+------------------------------------------------------------------+
void ProcessBreakEvenTrailing(const ulong ticket)
{
   string symbol = PositionGetString(POSITION_SYMBOL);
   long   type   = PositionGetInteger(POSITION_TYPE);
   double open   = PositionGetDouble(POSITION_OPEN);
   double cur_sl = PositionGetDouble(POSITION_SL);
   double cur_tp = PositionGetDouble(POSITION_TP);
   double bid    = SymbolInfoDouble(symbol, SYMBOL_BID);
   double ask    = SymbolInfoDouble(symbol, SYMBOL_ASK);
   if(bid <= 0.0 || ask <= 0.0)
      return;

   double pip = PipSize();
   double profit_price = (type == POSITION_TYPE_BUY ? bid - open : open - ask);
   double profit_pips  = profit_price / pip;

   int state_idx = FindState(ticket);
   bool be_done = (state_idx >= 0 && g_states[state_idx].be_done);

   //--- BreakEven
   if(InpBEEnable && profit_pips >= InpBETriggerPips)
   {
      double candidate = (type == POSITION_TYPE_BUY)
                         ? open + InpBELockPips * pip
                         : open - InpBELockPips * pip;

      bool improves = false;
      if(type == POSITION_TYPE_BUY)
         improves = (cur_sl == 0.0 || candidate > cur_sl + InpBEMinStepPips * pip);
      else
         improves = (cur_sl == 0.0 || candidate < cur_sl - InpBEMinStepPips * pip);

      if(improves)
      {
         if(ModifyPosition(ticket, candidate, cur_tp, "auto BreakEven"))
         {
            state_idx = FindState(ticket);
            if(state_idx >= 0) g_states[state_idx].be_done = true;
            be_done = true;
         }
         return; // one modification per scan is enough for this position
      }
      be_done = true; // already at/above BreakEven level
      if(state_idx >= 0) g_states[state_idx].be_done = true;
   }

   //--- Trailing (only once BreakEven is reached, or on its own trigger)
   if(InpTrailEnable && profit_pips >= InpTrailTriggerPips && (be_done || !InpBEEnable))
   {
      double candidate = (type == POSITION_TYPE_BUY)
                         ? bid - InpTrailDistancePips * pip
                         : ask + InpTrailDistancePips * pip;

      // Trailing must never move SL backwards (and never below BreakEven lock)
      double be_floor = (type == POSITION_TYPE_BUY)
                        ? open + InpBELockPips * pip
                        : open - InpBELockPips * pip;
      if(InpBEEnable)
      {
         if(type == POSITION_TYPE_BUY)  candidate = MathMax(candidate, be_floor);
         else                           candidate = MathMin(candidate, be_floor);
      }

      bool improves = false;
      if(type == POSITION_TYPE_BUY)
         improves = (cur_sl == 0.0 || candidate > cur_sl + InpTrailStepPips * pip);
      else
         improves = (cur_sl == 0.0 || candidate < cur_sl - InpTrailStepPips * pip);

      if(improves)
         ModifyPosition(ticket, candidate, cur_tp, "trailing stop");
   }
}

//+------------------------------------------------------------------+
//| Main scan (timer)                                                 |
//+------------------------------------------------------------------+
void RunManager()
{
   //--- 1) Detect a manual SL/TP change on ONE position (the "master")
   ulong  master_ticket = 0;
   double master_sl = 0, master_tp = 0, master_open = 0;
   long   master_type = 0;
   string master_symbol = "";
   bool   sl_changed = false, tp_changed = false;
   double old_sl = 0, old_tp = 0;

   if(InpSyncEnable)
   {
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket == 0 || !IsManagedSelected())
            continue;

         int idx = FindState(ticket);
         if(idx < 0)
            continue; // new position: snapshot is built below, no sync trigger

         double cur_sl = PositionGetDouble(POSITION_SL);
         double cur_tp = PositionGetDouble(POSITION_TP);
         string symbol = PositionGetString(POSITION_SYMBOL);

         // Ignore changes made by THIS EA itself
         if(g_states[idx].has_expected &&
            PriceEqual(cur_sl, g_states[idx].expected_sl, symbol) &&
            PriceEqual(cur_tp, g_states[idx].expected_tp, symbol))
            continue;

         bool s = !PriceEqual(cur_sl, g_states[idx].sl, symbol);
         bool t = !PriceEqual(cur_tp, g_states[idx].tp, symbol);
         if(s || t)
         {
            master_ticket = ticket;
            master_sl     = cur_sl;
            master_tp     = cur_tp;
            old_sl        = g_states[idx].sl;
            old_tp        = g_states[idx].tp;
            master_open   = PositionGetDouble(POSITION_OPEN);
            master_type   = PositionGetInteger(POSITION_TYPE);
            master_symbol = symbol;
            sl_changed    = s;
            tp_changed    = t;
            break; // one master per scan; the rest is applied in this round
         }
      }
   }

   if(master_ticket != 0)
   {
      SyncFromMaster(master_ticket, master_open, master_type, master_symbol,
                     master_sl, master_tp, sl_changed, tp_changed, old_sl, old_tp);
      RefreshSnapshot();
      return; // BreakEven runs on the next scan (avoids fighting the manual change)
   }

   //--- 2) BreakEven / Trailing for every managed position
   if(InpBEEnable || InpTrailEnable)
   {
      for(int i = PositionsTotal() - 1; i >= 0; i--)
      {
         ulong ticket = PositionGetTicket(i);
         if(ticket == 0 || !IsManagedSelected())
            continue;
         ProcessBreakEvenTrailing(ticket);
      }
   }

   //--- 3) Rebuild snapshot of current SL/TP values
   RefreshSnapshot();

   if(InpShowPanel)
      DrawPanel();
}

void RefreshSnapshot()
{
   // keep be_done / expected flags for tickets that still exist
   PosState fresh[];
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0 || !IsManagedSelected())
         continue;

      PosState st;
      st.ticket = ticket;
      st.sl     = PositionGetDouble(POSITION_SL);
      st.tp     = PositionGetDouble(POSITION_TP);

      int old = FindState(ticket);
      if(old >= 0)
      {
         st.be_done      = g_states[old].be_done;
         st.has_expected = g_states[old].has_expected;
         st.expected_sl  = g_states[old].expected_sl;
         st.expected_tp  = g_states[old].expected_tp;
         // if price moved away from what EA set (user/server), drop expectation
         string symbol = PositionGetString(POSITION_SYMBOL);
         if(st.has_expected &&
            (!PriceEqual(st.sl, st.expected_sl, symbol) ||
             !PriceEqual(st.tp, st.expected_tp, symbol)))
            st.has_expected = false;
      }
      else
      {
         st.be_done = false;
         st.has_expected = false;
         st.expected_sl = 0.0;
         st.expected_tp = 0.0;
      }

      int n = ArraySize(fresh);
      ArrayResize(fresh, n + 1);
      fresh[n] = st;
   }
   ArrayResize(g_states, ArraySize(fresh));
   for(int i = 0; i < ArraySize(fresh); i++)
      g_states[i] = fresh[i];
}

//+------------------------------------------------------------------+
//| Info panel                                                        |
//+------------------------------------------------------------------+
void DrawPanel()
{
   int managed = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(PositionGetTicket(i) == 0) continue;
      if(IsManagedSelected()) managed++;
   }

   string text = "=== Group SL/TP + BreakEven (XAUUSD) ===\n";
   text += StringFormat("Managed positions: %d\n", managed);
   text += StringFormat("Group Sync: %s | BreakEven: %s (%.0f pips, lock %.0f) | Trailing: %s\n",
                        InpSyncEnable ? "ON" : "OFF",
                        InpBEEnable ? "ON" : "OFF", InpBETriggerPips, InpBELockPips,
                        InpTrailEnable ? "ON" : "OFF");
   text += "Last action: " + g_last_action + "\n";
   text += "Change SL/TP on ONE position -> applied to the whole group.";
   Comment(text);
}

//+------------------------------------------------------------------+
//| Expert lifecycle                                                  |
//+------------------------------------------------------------------+
int OnInit()
{
   if(InpBETriggerPips <= 0.0)
   {
      Print("[GroupTPSL-BE] InpBETriggerPips must be > 0");
      return INIT_PARAMETERS_INCORRECT;
   }
   if(InpPipSizePrice <= 0.0)
   {
      Print("[GroupTPSL-BE] InpPipSizePrice must be > 0");
      return INIT_PARAMETERS_INCORRECT;
   }

   int ms = (InpTimerMs < 100 ? 100 : InpTimerMs);
   if(!EventSetMillisecondTimer(ms))
      EventSetTimer(1);

   RefreshSnapshot();
   g_last_action = "Started. Snapshot of current positions taken.";
   LogMsg("Initialized on " + _Symbol +
          StringFormat(" | PipSizePrice=%.5f | BE trigger=%.0f pips (price %.2f)",
                       PipSize(), InpBETriggerPips, InpBETriggerPips * PipSize()));
   return INIT_SUCCEEDED;
}

void OnDeinit(const int reason)
{
   EventKillTimer();
   Comment("");
}

void OnTimer()
{
   RunManager();
}

// React faster than the timer when a trade event happens
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
{
   // The timer scan does the real work; this just wakes the panel up sooner.
   if(InpShowPanel)
      DrawPanel();
}
//+------------------------------------------------------------------+
