<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']); session_start();
require_once __DIR__.'/security-accounts.php'; require_once __DIR__.'/attendance-store.php';
$user=hamun_current_user(); if (!$user) { header('Location: /admin-security.php'); exit; }
if ($user['role']!=='admin') { http_response_code(403); exit('Forbidden'); }
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$error=''; $notice='';
try { $users=hamun_accounts(function (&$users){return $users;}); } catch (Throwable $e) { http_response_code(503); exit('سامانه حساب‌ها در دسترس نیست.'); }
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))) { http_response_code(403); exit('Invalid request'); }
    $id=(string)($_POST['id']??''); $action=(string)($_POST['action']??''); $reason=trim((string)($_POST['reason']??''));
    $matches=array_filter($users,function($u)use($id){return $u['id']===$id;});
    if (!$matches || !in_array($action,['approve','reject','reset','close_shift'],true) || ($action==='close_shift' && ($reason==='' || strlen($reason)>600))) $error='درخواست نامعتبر است.';
    else try {
        attendance_store($id,function (&$data) use ($action,$user,$reason) {
            if ($action==='approve') {
                if (empty($data['pending']) || !empty($data['anchor'])) throw new RuntimeException('درخواست موقعیت قابل تأیید نیست.');
                $data['anchor']=$data['pending']+['approvedAt'=>attendance_time(),'approvedBy'=>$user['username']]; $data['pending']=null;
                $data['events'][]=['type'=>'location_approved','at'=>attendance_time(),'actor'=>$user['username']];
            } elseif ($action==='reject') {
                if (empty($data['pending'])) throw new RuntimeException('درخواست موقعیت وجود ندارد.');
                $old=$data['pending']; $data['pending']=null;
                $data['events'][]=['type'=>'location_rejected','at'=>attendance_time(),'actor'=>$user['username'],'previous'=>$old];
            } elseif ($action==='close_shift') {
                $last=null; for ($i=count($data['events'])-1;$i>=0;$i--) if (in_array($data['events'][$i]['type'],['in','out'],true)) { $last=$data['events'][$i]['type']; break; }
                if ($last!=='in') throw new RuntimeException('شیفت باز برای اصلاح وجود ندارد.');
                $data['events'][]=['type'=>'out','at'=>attendance_time(),'actor'=>$user['username'],'correction'=>true,'reason'=>$reason];
            } else {
                if (empty($data['anchor']) && empty($data['pending'])) throw new RuntimeException('موقعیتی برای بازنشانی وجود ندارد.');
                $data['events'][]=['type'=>'location_reset','at'=>attendance_time(),'actor'=>$user['username'],'previous'=>$data['anchor']??$data['pending']];
                $data['anchor']=null; $data['pending']=null;
            }
        });
        $notice='عملیات ثبت شد.';
    } catch (Throwable $e) { $error=$e->getMessage(); }
}
function h($v): string { return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8'); }
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مدیریت تردد</title><style>body{font:15px sans-serif;line-height:1.8;background:#121820;color:#eee}main{max-width:900px;margin:auto;padding:1rem}section{background:#202a35;padding:1rem;margin:1rem 0;border-radius:12px}form{display:inline}button{padding:.6rem;margin:.3rem;border:0;border-radius:6px;background:#f97316;cursor:pointer}a{color:#ffb776}.error{color:#ff9b9b}code{direction:ltr;display:inline-block}</style><main><h1>مدیریت موقعیت و تردد پرسنل</h1><p><a href="/accounts.php">حساب‌ها</a> | <a href="/attendance.php">ثبت تردد خودم</a></p><p>قبل از تأیید، موقعیت پیشنهادی را با محل واقعی کار بررسی کنید. موقعیت مرورگر ممکن است دستکاری شود؛ تأیید به‌تنهایی اصالت حضور را تضمین نمی‌کند.</p><?php if($error):?><p class="error"><?=h($error)?></p><?php endif?><?php if($notice):?><p><?=h($notice)?></p><?php endif?><?php foreach($users as $person): try { $data=attendance_store($person['id'],function(&$x){return $x;}); } catch(Throwable $e) { continue; } ?><section><h2><?=h($person['username'])?> <?=empty($person['enabled'])?'(غیرفعال)':''?></h2><?php if(!empty($data['pending'])): $p=$data['pending'];?><p>درخواست: <code><?=h($p['lat'])?>, <?=h($p['lon'])?></code> — دقت <?=h($p['accuracy'])?> متر — <?=h($p['requestedAt'])?></p><?php foreach(['approve'=>'تأیید محل','reject'=>'رد درخواست'] as $a=>$label):?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($person['id'])?>"><button name="action" value="<?=h($a)?>"><?=h($label)?></button></form><?php endforeach?><?php elseif(!empty($data['anchor'])): $p=$data['anchor'];?><p>محل تأییدشده: <code><?=h($p['lat'])?>, <?=h($p['lon'])?></code> — تأیید توسط <?=h($p['approvedBy'])?> — <?=h($p['approvedAt'])?></p><?php else:?><p>موقعیتی ثبت نشده است.</p><?php endif?><?php if(!empty($data['anchor'])||!empty($data['pending'])):?><form method="post" onsubmit="return confirm('بازنشانی محل انجام شود؟')"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($person['id'])?>"><button name="action" value="reset">بازنشانی محل</button></form><?php endif?><form method="post" onsubmit="return confirm('این خروج اصلاحی با زمان فعلی و نام مدیر ثبت می‌شود، نه به عنوان تردد تأییدشده. ادامه می‌دهید؟')"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($person['id'])?>"><label>دلیل بستن شیفت باز <input name="reason" maxlength="150" required></label><button name="action" value="close_shift">ثبت خروج اصلاحی مدیر</button></form><h3>آخرین رخدادها</h3><?php foreach(array_slice(array_reverse($data['events']),0,15) as $event):?><p><?=h($event['at']??'')?> — <?=h($event['type']??'')?> — <?=h($event['actor']??'')?><?php if(!empty($event['correction'])):?> — اصلاح مدیر، نه ثبت موقعیت: <?=h($event['reason']??'')?><?php endif?><?php if(isset($event['distance'])):?> — فاصله <?=h($event['distance'])?> متر، دقت <?=h($event['accuracy'])?> متر<?php endif?></p><?php endforeach?></section><?php endforeach?></main></html>
