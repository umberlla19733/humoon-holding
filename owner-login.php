<?php
declare(strict_types=1);
header('Cache-Control: no-store, private');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');header('X-Frame-Options: DENY');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') {http_response_code(403);exit('HTTPS required');}
ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']);session_start();
require_once __DIR__.'/security-accounts.php';require_once __DIR__.'/admin-setup-lib.php';require_once __DIR__.'/owner-account.php';
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if (($origin!=='' && $origin!=='https://'.($_SERVER['HTTP_HOST']??'')) || !hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))) {http_response_code(403);exit('Invalid request');}
    $dir=dirname(__DIR__).'/hamun-private';
    try {
        hamun_setup_private_path($dir,(string)($_SERVER['DOCUMENT_ROOT']??''));
        if (!is_dir($dir) && !@mkdir($dir,0700) && !is_dir($dir)) throw new RuntimeException('Private storage unavailable');
        if (!is_dir($dir.'/rate') && !@mkdir($dir.'/rate',0700) && !is_dir($dir.'/rate')) throw new RuntimeException('Rate storage unavailable');
        $f=@fopen($dir.'/rate/'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown'),'c+');
        if (!$f || !flock($f,LOCK_EX)) throw new RuntimeException('Rate storage unavailable');
        try {
            $now=time();$attempts=json_decode((string)stream_get_contents($f),true);
            $attempts=is_array($attempts)?array_values(array_filter($attempts,function($t)use($now){return is_int($t)&&$t>$now-900;})):[];
            if (count($attempts)>=5) {http_response_code(429);$error='تلاش‌های ناموفق زیاد است؛ ۱۵ دقیقه بعد دوباره تلاش کنید.';}
            else {
                try {
                    $user=hamun_owner_id_only_login((string)($_POST['national_id']??''));
                    rewind($f);ftruncate($f,0);fflush($f);
                    session_regenerate_id(true);$_SESSION=['user_id'=>$user['id'],'user_version'=>$user['version'],'admin_until'=>$now+1800,'owner_id_login'=>true];
                    header('Location: /admin-center.php');exit;
                } catch (InvalidArgumentException|RuntimeException $e) {
                    $attempts[]=$now;rewind($f);$encoded=json_encode($attempts);
                    if (!ftruncate($f,0) || fwrite($f,$encoded)!==strlen($encoded) || !fflush($f)) {http_response_code(503);$error='ثبت محدودیت تلاش ممکن نیست.';}
                    else {http_response_code(401);$error='ورود انجام نشد؛ شناسه یا وضعیت حساب را بررسی کنید.';}
                }
            }
        } finally {flock($f,LOCK_UN);fclose($f);}
    } catch (Throwable $e) {http_response_code(503);$error='فضای خصوصی یا پیکربندی سرور در دسترس نیست.';}
}
function owner_h($v):string{return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ورود توسعه‌دهنده</title><style>body{background:#121820;color:#eee;font:16px sans-serif;line-height:1.8;display:grid;place-items:center;min-height:95vh}main{background:#202a35;padding:2rem;border-radius:1rem;width:min(90vw,27rem);box-sizing:border-box}input,button{box-sizing:border-box;width:100%;padding:.8rem;margin:.5rem 0;border:0;border-radius:.5rem}button{background:#f97316}a{color:#ffb776}.error{color:#ff9b9b}</style><link rel="stylesheet" href="/assets/account-pages.css?v=1"><script defer src="/assets/account-pages.js?v=1"></script><main><h1>ورود توسعه‌دهنده</h1><p>کد ملی را وارد کنید؛ در این مسیر رمز لازم نیست.</p><p class="error">هشدار: هر کسی که کد ملی را بداند می‌تواند به حساب مدیر و اطلاعات سایت دسترسی داشته باشد؛ حتی اگر برای حساب رمز تعیین شود.</p><?php if($error):?><p class="error"><?=owner_h($error)?></p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=owner_h($_SESSION['csrf'])?>"><label>کد ملی<input name="national_id" inputmode="numeric" maxlength="10" autocomplete="username" required></label><button>ورود به مدیریت</button></form><p><a href="/admin-security.php?manual=1">ورود با رمز</a></p></main></html>
