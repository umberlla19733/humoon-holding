<?php
declare(strict_types=1);
header('Cache-Control: no-store, private');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') {http_response_code(403);exit('HTTPS required');}
ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']);session_start();
require_once __DIR__.'/security-accounts.php';
$pending=hamun_pending_accountant();$current=hamun_current_user();
$user=$pending ?: (($current['role']??'')==='accountant'?$current:null);
if (!$user) {header('Location: /accountant-login.php');exit;}
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$error='';
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))) {http_response_code(403);exit('Invalid request');}
    $password=(string)($_POST['password']??'');$repeat=(string)($_POST['repeat']??'');$old=(string)($_POST['old_password']??'');
    try {
        if (!$pending && !password_verify($old,(string)$user['password'])) throw new InvalidArgumentException('رمز فعلی درست نیست.');
        if (!hash_equals($password,$repeat) || !hamun_valid_new_password($password,(string)($user['national_digest']??''))) throw new InvalidArgumentException('رمز جدید و تکرار آن باید یکسان و حداقل ۱۲ نویسه باشند.');
        $updated=hamun_accounts(function (&$users) use ($user,$pending,$password){
            foreach ($users as &$u) {
                if ($u['id']!==$user['id']) continue;
                if (empty($u['enabled']) || ($u['role']??'')!=='accountant' || (int)$u['version']!==(int)$user['version'] || (bool)($u['must_change_password']??false)!==(bool)$pending) throw new RuntimeException('حساب تغییر کرده است؛ دوباره وارد شوید.');
                $u['password']=password_hash($password,PASSWORD_DEFAULT);$u['must_change_password']=false;$u['version']=(int)$u['version']+1;return $u;
            }
            throw new RuntimeException('حساب تغییر کرده است؛ دوباره وارد شوید.');
        });
        session_regenerate_id(true);$_SESSION=['user_id'=>$updated['id'],'user_version'=>$updated['version'],'admin_until'=>time()+1800];
        header('Location: /#/admin');exit;
    } catch (InvalidArgumentException|RuntimeException $e) {$error=$e->getMessage();}
      catch (Throwable $e) {$error='تغییر رمز ممکن نیست؛ با مدیر تماس بگیرید.';}
}
function pw_h($v):string{return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تغییر رمز حسابدار</title><style>body{font:16px sans-serif;background:#121820;color:#eee;display:grid;place-items:center;min-height:95vh;line-height:1.8}main{background:#202a35;padding:2rem;border-radius:1rem;width:min(90vw,25rem);box-sizing:border-box}input,button{box-sizing:border-box;width:100%;padding:.8rem;margin:.5rem 0;border:0;border-radius:.5rem}button{background:#f97316}a{color:#ffb776}.error{color:#ff9b9b}</style><link rel="stylesheet" href="/assets/account-pages.css?v=1"><script defer src="/assets/account-pages.js?v=1"></script><main><h1>تعیین رمز حسابدار</h1><p><?= $pending?'قبل از ورود، رمز شخصی حداقل ۱۲ نویسه‌ای انتخاب کنید.':'برای تغییر رمز، ابتدا رمز فعلی را وارد کنید.' ?></p><?php if($error):?><p class="error"><?=pw_h($error)?></p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=pw_h($_SESSION['csrf'])?>"><?php if(!$pending):?><label>رمز فعلی<input type="password" name="old_password" autocomplete="current-password" required></label><?php endif?><label>رمز جدید<input type="password" name="password" autocomplete="new-password" minlength="12" maxlength="72" required></label><label>تکرار رمز جدید<input type="password" name="repeat" autocomplete="new-password" minlength="12" maxlength="72" required></label><button>ذخیره و ورود</button></form><p><a href="/accountant-login.php">بازگشت به ورود</a></p></main></html>
