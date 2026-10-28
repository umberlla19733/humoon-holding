<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') {http_response_code(403);exit('HTTPS required');}
ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']);session_start();
require_once __DIR__.'/security-accounts.php';
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))) {http_response_code(403);exit('Invalid request');}
    $id=hamun_national_id((string)($_POST['national_id']??''));$password=(string)($_POST['password']??'');
    $dir=dirname(__DIR__).'/hamun-private/rate';if (!is_dir($dir)) @mkdir($dir,0700,true);
    $f=@fopen($dir.'/'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown'),'c+');
    if (!$f || !flock($f,LOCK_EX)) {http_response_code(503);$error='سامانه ورود در دسترس نیست.';}
    else {
        $now=time();$history=json_decode((string)stream_get_contents($f),true);
        $history=is_array($history)?array_values(array_filter($history,function($t)use($now){return is_int($t)&&$t>$now-900;})):[];
        if (count($history)>=5) {http_response_code(429);$error='تلاش‌های ناموفق زیاد است؛ ۱۵ دقیقه بعد دوباره تلاش کنید.';}
        else {
            $account=null;
            if (preg_match('/^[0-9]{10}$/D',$id) && strlen($password)<=1024) {
                try { $digest=hamun_national_digest($id);$account=hamun_accounts(function(&$users)use($digest){foreach($users as $u) if (($u['role']??'')==='accountant' && !empty($u['national_digest']) && hash_equals($u['national_digest'],$digest)) return $u;return null;}); } catch(Throwable $e) {$account=null;}
            }
            $candidate=$password==='' && !empty($account['must_change_password'])?$id:$password;
            if (is_array($account) && !empty($account['enabled']) && password_verify($candidate,(string)($account['password']??''))) {
                ftruncate($f,0);fflush($f);flock($f,LOCK_UN);fclose($f);
                session_regenerate_id(true);$_SESSION=[];
                if (!empty($account['must_change_password'])) {$_SESSION['pending_user_id']=$account['id'];$_SESSION['pending_user_version']=$account['version'];$_SESSION['pending_until']=$now+600;header('Location: /accountant-password.php');}
                else {$_SESSION['user_id']=$account['id'];$_SESSION['user_version']=$account['version'];$_SESSION['admin_until']=$now+1800;header('Location: /#/admin');}
                exit;
            }
            $history[]=$now;rewind($f);$encoded=json_encode($history);if(!ftruncate($f,0)||fwrite($f,$encoded)!==strlen($encoded)||!fflush($f)) {$error='ثبت محدودیت ورود ممکن نیست.';http_response_code(503);} else {$error='اطلاعات ورود نادرست است یا حساب فعال نیست.';http_response_code(401);}
        }
        flock($f,LOCK_UN);fclose($f);
    }
}
function login_h($v): string {return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ورود حسابدار</title><style>body{font:16px sans-serif;background:#121820;color:#eee;display:grid;place-items:center;min-height:95vh;line-height:1.8}main{background:#202a35;padding:2rem;border-radius:1rem;width:min(90vw,25rem);box-sizing:border-box}input,button{box-sizing:border-box;width:100%;padding:.8rem;margin:.5rem 0;border:0;border-radius:.5rem}button{background:#f97316}a{color:#ffb776}.error{color:#ff9b9b}</style><main><h1>ورود حسابدار</h1><p>برای حسابی که با ورود اولیه عادی ساخته شده، کد ملی را بنویسید و رمز را خالی بگذارید. اگر مدیر رمز موقت تعیین کرده، آن را وارد کنید. سپس باید رمز جدید تعیین کنید؛ برای ورودهای بعدی کد ملی و رمز جدید لازم است.</p><p>کد ملی محرمانه نیست؛ به محض ایجاد حساب توسط مدیر، ورود اولیه و تغییر رمز را انجام دهید.</p><?php if($error):?><p class="error"><?=login_h($error)?></p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=login_h($_SESSION['csrf'])?>"><label>کد ملی <input name="national_id" inputmode="numeric" autocomplete="username" maxlength="10" dir="ltr" required></label><label>رمز شخصی (فقط پس از نخستین ورود)<input type="password" name="password" autocomplete="current-password"></label><button>ورود</button></form><p><a href="/">بازگشت به سایت</a></p></main></html>
