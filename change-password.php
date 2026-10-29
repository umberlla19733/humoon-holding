<?php
declare(strict_types=1);
header('Cache-Control: no-store, private');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');header('X-Frame-Options: DENY');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') {http_response_code(403);exit('HTTPS required');}
ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']);session_start();
require_once __DIR__.'/security-accounts.php';
$user=hamun_current_user();if (!$user) {header('Location: /admin-security.php');exit;}
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$ownerMode=($_SESSION['owner_id_login']??false)===true && ($user['role']??'')==='admin' && !empty($user['developer_access']);
$error='';$notice='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if (($origin!=='' && $origin!=='https://'.($_SERVER['HTTP_HOST']??'')) || !hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))) {http_response_code(403);exit('Invalid request');}
    $dir=dirname(__DIR__).'/hamun-private/rate';if (!is_dir($dir)) @mkdir($dir,0700,true);
    $f=@fopen($dir.'/'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown'),'c+');
    if (!$f || !flock($f,LOCK_EX)) {http_response_code(503);$error='سامانه موقتاً در دسترس نیست.';}
    else {
        $now=time();$attempts=json_decode((string)stream_get_contents($f),true);
        $attempts=is_array($attempts)?array_values(array_filter($attempts,function($t)use($now){return is_int($t)&&$t>$now-900;})):[];
        if (count($attempts)>=5) {http_response_code(429);$error='تلاش‌های ناموفق زیاد است؛ ۱۵ دقیقه بعد تلاش کنید.';}
        else {
            try {
                $new=(string)($_POST['password']??'');
                if (!hash_equals($new,(string)($_POST['repeat']??''))) throw new InvalidArgumentException('رمز جدید و تکرار آن یکسان نیستند.');
                $updated=$ownerMode ? hamun_set_owner_session_password((string)$user['id'],(int)$user['version'],$new) : hamun_change_own_password((string)$user['id'],(int)$user['version'],(string)($_POST['old_password']??''),$new);
                rewind($f);ftruncate($f,0);fflush($f);
                session_regenerate_id(true);$_SESSION=['user_id'=>$updated['id'],'user_version'=>$updated['version'],'admin_until'=>$now+1800,'csrf'=>bin2hex(random_bytes(32))];if ($ownerMode) $_SESSION['owner_id_login']=true;
                $notice='رمز شما تغییر کرد و نشست‌های دیگر این حساب بسته شدند.';
            } catch (InvalidArgumentException|RuntimeException $e) {
                $attempts[]=$now;rewind($f);$encoded=json_encode($attempts);
                if (!ftruncate($f,0) || fwrite($f,$encoded)!==strlen($encoded) || !fflush($f)) {http_response_code(503);$error='ثبت محدودیت تلاش ممکن نیست.';}
                else {http_response_code(400);$error=$e->getMessage();}
            } catch (Throwable $e) {http_response_code(503);$error='تغییر رمز ممکن نیست.';}
        }
        flock($f,LOCK_UN);fclose($f);
    }
}
function pw_change_h($v):string{return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تغییر رمز من</title><style>body{font:16px sans-serif;background:#121820;color:#eee;display:grid;place-items:center;min-height:95vh;line-height:1.8}main{background:#202a35;padding:2rem;border-radius:1rem;width:min(90vw,27rem);box-sizing:border-box}input,button{box-sizing:border-box;width:100%;padding:.8rem;margin:.5rem 0;border:0;border-radius:.5rem}button{background:#f97316}a{color:#ffb776}.error{color:#ff9b9b}</style><link rel="stylesheet" href="/assets/account-pages.css?v=1"><script defer src="/assets/account-pages.js?v=1"></script><main><h1>تغییر رمز من</h1><?php if($ownerMode):?><p>برای ورود با رمز می‌توانید کد ملی خود و رمز جدید را در صفحه ورود مدیریت وارد کنید.</p><?php else:?><p>نام کاربری شما: <b dir="ltr"><?=pw_change_h((string)$user['username'])?></b></p><?php endif?><p><?= $ownerMode ? 'برای این نشست توسعه‌دهنده فقط رمز دلخواه و تکرار آن را وارد کنید.' : 'رمز فعلی و رمز جدید خود را وارد کنید.' ?> رمز جدید باید حداقل ۱۲ نویسه غیرخالی و حداکثر ۷۲ بایت باشد.</p><?php if($ownerMode):?><p class="error">هشدار: تعیین رمز، ورود بدون رمز با کد ملی را نمی‌بندد و دیگران با دانستن آن می‌توانند به مدیریت دسترسی پیدا کنند.</p><?php endif?><?php if($error):?><p class="error"><?=pw_change_h($error)?></p><?php endif?><?php if($notice):?><p><?=pw_change_h($notice)?></p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=pw_change_h($_SESSION['csrf'])?>"><?php if(!$ownerMode):?><label>رمز فعلی<input type="password" name="old_password" autocomplete="current-password" required></label><?php endif?><label>رمز جدید<input type="password" name="password" minlength="12" maxlength="72" autocomplete="new-password" required></label><label>تکرار رمز جدید<input type="password" name="repeat" minlength="12" maxlength="72" autocomplete="new-password" required></label><button>ذخیره رمز جدید</button></form><p><a href="/accounts.php">بازگشت به حساب من</a></p></main></html>
