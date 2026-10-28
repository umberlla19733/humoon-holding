<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']); session_start();
require_once __DIR__.'/security-accounts.php'; require_once __DIR__.'/attendance-store.php';
$user=hamun_current_user(); if (!$user) { header('Location: /admin-security.php'); exit; }
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
if ($_SERVER['REQUEST_METHOD']==='POST') {
    header('Content-Type: application/json; charset=utf-8');
    if (!hash_equals($_SESSION['csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??''))) { http_response_code(403); echo json_encode(['error'=>'درخواست نامعتبر است.']); exit; }
    if (stripos($_SERVER['CONTENT_TYPE']??'','application/json')!==0 || (int)($_SERVER['CONTENT_LENGTH']??0)>4096) { http_response_code(400); echo json_encode(['error'=>'درخواست نامعتبر است.']); exit; }
    $input=json_decode((string)file_get_contents('php://input',false,null,0,4097),true);
    try {
        if (!is_array($input)) throw new InvalidArgumentException('درخواست نامعتبر است.');
        $loc=attendance_location($input['lat']??null,$input['lon']??null,$input['accuracy']??null);
        $result=attendance_store($user['id'],function (&$data) use ($input,$loc,$user) { return attendance_transition($data,(string)($input['action']??''),$loc,$user['username']); });
        echo json_encode($result,JSON_UNESCAPED_UNICODE);
    } catch (InvalidArgumentException|RuntimeException $e) { http_response_code(400); echo json_encode(['error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE); }
    catch (Throwable $e) { http_response_code(500); echo json_encode(['error'=>'ثبت تردد ممکن نیست.'],JSON_UNESCAPED_UNICODE); }
    exit;
}
try { $state=attendance_store($user['id'],function (&$data){return $data;}); } catch (Throwable $e) { http_response_code(503); exit('سامانه تردد در دسترس نیست.'); }
function h($s): string {return htmlspecialchars((string)$s,ENT_QUOTES,'UTF-8');}
$last=array_slice(array_reverse(array_values(array_filter($state['events'],function($e){return in_array($e['type'],['in','out'],true);}))),0,20);
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ثبت ورود و خروج</title><style>body{font:15px sans-serif;line-height:1.9;background:#121820;color:#eee}main{max-width:680px;margin:2rem auto;padding:1rem}section{background:#202a35;padding:1rem;border-radius:12px;margin:1rem 0}button{padding:.8rem;margin:.3rem;border:0;border-radius:8px;background:#f97316;cursor:pointer}button:disabled{opacity:.5}a{color:#ffb776}#msg{white-space:pre-wrap}</style><main><h1>ثبت تردد پرسنل</h1><p><?=h($user['username'])?> | <a href="/accounts.php">حساب کاربری</a> | <a href="/admin-security.php">خروج</a></p><section><p><?php if (!empty($state['anchor'])): ?>موقعیت ثبت‌شده توسط مدیر تأیید شده است.<?php elseif (!empty($state['pending'])): ?>موقعیت در انتظار تأیید مدیر است.<?php else: ?>برای شروع، موقعیت محل کار را ثبت کنید. تأیید مدیر ضروری است.<?php endif ?></p><p>برای هر ثبت به مجوز مکان و دقت حداکثر ۵۰ متر نیاز است. مکان و زمان در سرور ثبت می‌شوند. موقعیت مرورگر به‌تنهایی هویت یا واقعی‌بودن مکان را تضمین نمی‌کند.</p><button data-action="enroll">ثبت موقعیت اولیه</button><button data-action="in">ثبت ورود</button><button data-action="out">ثبت خروج</button><p id="msg" role="status"></p></section><section><h2>آخرین ترددهای شما</h2><?php if (!$last): ?><p>هنوز ترددی ثبت نشده است.</p><?php endif ?><?php foreach($last as $row):?><p><?= $row['type']==='in'?'ورود':'خروج' ?><?= !empty($row['correction'])?' (اصلاح مدیر)':'' ?> — <?=h($row['at'])?></p><?php endforeach ?></section><script>
const csrf=<?=json_encode($_SESSION['csrf'])?>,buttons=[...document.querySelectorAll('button[data-action]')],msg=document.getElementById('msg');
buttons.forEach(button=>button.addEventListener('click',()=>{if(!navigator.geolocation){msg.textContent='موقعیت‌یاب در این دستگاه در دسترس نیست.';return}buttons.forEach(b=>b.disabled=true);msg.textContent='در حال دریافت موقعیت دقیق...';navigator.geolocation.getCurrentPosition(async pos=>{try{const res=await fetch('/attendance.php',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({action:button.dataset.action,lat:pos.coords.latitude,lon:pos.coords.longitude,accuracy:pos.coords.accuracy})});const data=await res.json();if(!res.ok)throw Error(data.error||'خطا در ثبت');msg.textContent=data.message;setTimeout(()=>location.reload(),1200)}catch(e){msg.textContent=e.message;buttons.forEach(b=>b.disabled=false)}},()=>{msg.textContent='دریافت موقعیت ناموفق بود. مجوز مکان و GPS را بررسی کنید.';buttons.forEach(b=>b.disabled=false)},{enableHighAccuracy:true,timeout:20000,maximumAge:0})}));
</script></main></html>
