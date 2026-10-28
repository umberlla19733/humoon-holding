<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']); session_start();
require_once __DIR__.'/security-accounts.php'; require_once __DIR__.'/sms-service.php';
$user=hamun_current_user();
if (!$user) { header('Location: /admin-security.php'); exit; }
if ($user['role']!=='admin') { http_response_code(403); exit('Forbidden'); }
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$error=''; $notice='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf']??''))) { http_response_code(403); exit('Invalid request'); }
    $digits=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹','٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    $phone=str_replace($digits, array_merge(range(0,9),range(0,9)), trim((string)($_POST['phone']??'')));
    $phone=preg_replace('/[\s()-]+/','',$phone); $text=trim((string)($_POST['message']??''));
    if (empty($_POST['consent'])) $error='تأیید رضایت گیرنده ضروری است.';
    else try { hamun_sms_prepare($phone,$text,'manual',$user['username']); $notice='پیش‌نویس ثبت شد؛ هیچ پیامکی ارسال نشده است، زیرا پنل پیامکی انتخاب و متصل نشده است.'; }
    catch (Throwable $e) { $error='ثبت انجام نشد: '.$e->getMessage(); }
}
function h($s): string { return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8'); }
$items=[]; $dir=dirname(__DIR__).'/hamun-private/sms-drafts';
foreach (glob($dir.'/*.json') ?: [] as $path) { $f=@fopen($path,'r'); if (!$f || !flock($f,LOCK_SH)) continue; $entry=json_decode((string)stream_get_contents($f),true); flock($f,LOCK_UN); fclose($f); if (is_array($entry)) $items[]=$entry; }
usort($items, function($a,$b){return ($b['createdAt']??0)<=>($a['createdAt']??0);}); $items=array_slice($items,0,100);
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مرکز پیامک</title><style>body{font:15px sans-serif;background:#121820;color:#eee;line-height:1.8}main{max-width:850px;margin:auto;padding:1rem}section,form{background:#202a35;padding:1rem;border-radius:12px;margin:1rem 0}input:not([type=checkbox]),textarea{width:100%;box-sizing:border-box;padding:.7rem;margin:.5rem 0}button{background:#f97316;border:0;border-radius:6px;padding:.7rem}a{color:#ffb776}.error{color:#ff9b9b}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}</style><main><h1>مرکز پیامک فارسی</h1><p><a href="/accounts.php">حساب و دسترسی‌ها</a> | <a href="/admin-security.php">خروج</a></p><p>هیچ سرویس‌دهنده‌ای متصل نیست. پیام‌ها فقط به‌صورت پیش‌نویس ذخیره می‌شوند و ارسال خودکار یا ارسال گروهی فعال نیست.</p><?php if($error):?><p class="error"><?=h($error)?></p><?php endif?><?php if($notice):?><p><?=h($notice)?></p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><label>شماره گیرنده<input type="tel" name="phone" required dir="ltr"></label><label>متن پیامک<textarea name="message" required rows="4" maxlength="670" id="message"></textarea></label><p id="segments"></p><label><input type="checkbox" name="consent" required> رضایت گیرنده برای این پیام را دریافت کرده‌ام.</label><p><button>ذخیره پیش‌نویس (بدون ارسال)</button></p></form><h2>قالب‌های آماده</h2><p>قالب آماده به معنی فعال‌بودن رویداد یا ارسال نیست. در حال حاضر فقط دو رویداد استعلام به ایجاد پیش‌نویس وصل هستند.</p><?php foreach (hamun_sms_templates() as $template): ?><section><strong><?=h($template[0])?></strong><p><?=h($template[1])?></p></section><?php endforeach?><h2>آخرین پیش‌نویس‌ها</h2><?php foreach($items as $item):?><section><p><?=h($item['phone'])?> — <?=h($item['event'])?> — ارسال نشده</p><pre><?=h($item['text'])?></pre></section><?php endforeach?><script>const m=document.getElementById('message'),s=document.getElementById('segments');function update(){let n=m.value.length;s.textContent='طول تخمینی یونیکد: '+n+' واحد؛ تعداد بخش: '+(n<=70?(n?1:0):Math.ceil(n/67))+' (تعداد نهایی بسته به پنل و خط ارسال متفاوت است).'}m.addEventListener('input',update);update();</script></main></html>
