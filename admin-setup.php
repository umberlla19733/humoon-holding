<?php
declare(strict_types=1);
header('Cache-Control: no-store, private');header('X-Content-Type-Options: nosniff');header('Referrer-Policy: no-referrer');header('X-Frame-Options: DENY');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') {http_response_code(403);exit('HTTPS required');}
ini_set('session.use_strict_mode','1');ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']);session_start();
require_once __DIR__.'/admin-setup-lib.php';
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$dir=dirname(__DIR__).'/hamun-private';$error='';$success=false;$prepared=false;
if ($_SERVER['REQUEST_METHOD']==='POST') {
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if (($origin!=='' && $origin!=='https://'.($_SERVER['HTTP_HOST']??'')) || !hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))) {http_response_code(403);exit('Invalid request');}
    if (($_POST['action']??'')==='prepare') {
        try {hamun_prepare_setup_token($dir,(string)($_SERVER['DOCUMENT_ROOT']??''));$prepared=true;}
        catch (Throwable $e) {http_response_code(503);$error='ساخت خودکار کلید ممکن نیست یا حسابی از قبل وجود دارد. مسیر خصوصی و مجوزهای هاست را بررسی کنید.';}
    } else {
    try {hamun_setup_private_path($dir,(string)($_SERVER['DOCUMENT_ROOT']??''));}
    catch (Throwable $e) {http_response_code(503);exit('Private path unavailable');}
    $rate=$dir.'/rate';if (is_dir($dir) && !is_dir($rate)) @mkdir($rate,0700,true);
    $f=@fopen($rate.'/'.hash('sha256',$_SERVER['REMOTE_ADDR']??'unknown'),'c+');
    if (!$f || !flock($f,LOCK_EX)) {http_response_code(503);$error='فضای خصوصی یا محدودیت تلاش در دسترس نیست.';}
    else {
        $now=time();$past=json_decode((string)stream_get_contents($f),true);
        $past=is_array($past)?array_values(array_filter($past,function($t)use($now){return is_int($t)&&$t>$now-900;})):[];
        if (count($past)>=5) {http_response_code(429);$error='تعداد تلاش‌ها بیش از حد است؛ ۱۵ دقیقه بعد تلاش کنید.';}
        else {
            try {
                $password=(string)($_POST['password']??'');
                if (!hash_equals($password,(string)($_POST['repeat']??''))) throw new InvalidArgumentException('ورودی نامعتبر است.');
                hamun_initial_setup($dir,(string)($_POST['token']??''),(string)($_POST['username']??''),$password);
                $success=true;rewind($f);ftruncate($f,0);fflush($f);
                session_regenerate_id(true);$_SESSION=[];
            } catch (Throwable $e) {
                $past[]=$now;rewind($f);$encoded=json_encode($past);
                if (!ftruncate($f,0) || fwrite($f,$encoded)!==strlen($encoded) || !fflush($f)) {http_response_code(503);$error='ثبت محدودیت ورود ممکن نیست.';}
                else {http_response_code(400);$error='راه‌اندازی انجام نشد. کلید، نام کاربری و رمز را بررسی کنید؛ اگر قبلاً حساب مدیر ساخته شده، راه‌اندازی دوباره مجاز نیست.';}
            }
        }
        flock($f,LOCK_UN);fclose($f);
    }
    }
}
function setup_h($value): string {return htmlspecialchars((string)$value,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>راه‌اندازی امن مدیر</title><style>body{background:#121820;color:#eee;font:16px sans-serif;line-height:1.8;display:grid;place-items:center;min-height:95vh}main{background:#202a35;padding:2rem;border-radius:1rem;width:min(90vw,28rem);box-sizing:border-box}input,button{box-sizing:border-box;width:100%;padding:.8rem;margin:.5rem 0;border:0;border-radius:.5rem}button{background:#f97316}a{color:#ffb776}.error{color:#ff9b9b}</style><link rel="stylesheet" href="/assets/account-pages.css?v=1"><script defer src="/assets/account-pages.js?v=1"></script><main><h1>راه‌اندازی اولیه مدیر</h1><?php if($success):?><p>حساب مدیر ساخته شد. اکنون با نام کاربری و رمز انتخابی وارد شوید.</p><p><a href="/admin-security.php">ورود مدیریت</a></p><?php else:?><p>گام ۱: دکمه «ساخت کلید» را بزنید. در File Manager هاست، پوشه خصوصی <b>hamun-private</b> کنار پوشه سایت را باز کنید و محتوای فایل <b>setup-token</b> را کپی کنید. کلید را برای دیگران نفرستید. گام ۲: کلید، نام کاربری و رمز دلخواه را در فرم زیر وارد کنید. این کار فقط برای نصب اولیه است.</p><?php if($prepared):?><p>کلید آماده است؛ آن را از فایل خصوصی setup-token کپی کنید.</p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=setup_h($_SESSION['csrf'])?>"><input type="hidden" name="action" value="prepare"><button>ساخت کلید</button></form><?php if($error):?><p class="error"><?=setup_h($error)?></p><?php endif?><form method="post"><input type="hidden" name="csrf" value="<?=setup_h($_SESSION['csrf'])?>"><label>کلید موقت راه‌اندازی<input name="token" type="password" minlength="32" maxlength="128" autocomplete="off" required></label><label>نام کاربری مدیر (۳ تا ۴۰ حرف کوچک انگلیسی، عدد، نقطه، خط تیره یا زیرخط)<input name="username" pattern="[a-z0-9_.-]{3,40}" minlength="3" maxlength="40" autocomplete="username" required></label><label>رمز جدید (۱۲ تا ۷۲ بایت)<input name="password" type="password" minlength="12" maxlength="72" autocomplete="new-password" required></label><label>تکرار رمز<input name="repeat" type="password" minlength="12" maxlength="72" autocomplete="new-password" required></label><button>ایجاد حساب مدیر</button></form><?php endif?></main></html>
