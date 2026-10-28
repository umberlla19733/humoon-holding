<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']); session_start();
require_once __DIR__.'/security-accounts.php'; require_once __DIR__.'/central-store-lib.php';
$user=hamun_current_user(); if (!$user || ($user['role']??'')!=='admin') {http_response_code(403); exit('Administrator access required');}
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
function central_reply(int $status,array $body): void {http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode($body,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
$private=dirname(__DIR__).'/hamun-private';
$dir=$private.'/central-snapshots'; umask(0077);
if (isset($_GET['api'])) {
    if (!is_dir($private) || !is_writable($private)) central_reply(503,['error'=>'پوشه خصوصی هاست آماده نیست.']);
    if ($_SERVER['REQUEST_METHOD']==='GET') {
        try { $record=central_locked($dir,function($dir){return central_read($dir);}); central_reply(200,['csrf'=>$_SESSION['csrf'],'record'=>$record]); }
        catch(Throwable $e){ central_reply(503,['error'=>'خواندن نسخه مرکزی ممکن نیست. فضای خصوصی و گزارش سرور را بررسی کنید.']); }
    }
    if ($_SERVER['REQUEST_METHOD']!=='POST') central_reply(405,['error'=>'روش درخواست نامعتبر است.']);
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if (($origin!=='' && $origin!=='https://'.($_SERVER['HTTP_HOST']??'')) || !hash_equals($_SESSION['csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??''))) central_reply(403,['error'=>'درخواست نامعتبر است.']);
    if (stripos($_SERVER['CONTENT_TYPE']??'','application/json')!==0 || (int)($_SERVER['CONTENT_LENGTH']??0)>16*1024*1024) central_reply(413,['error'=>'حجم یا قالب درخواست نامعتبر است.']);
    $raw=file_get_contents('php://input',false,null,0,16*1024*1024+1);
    if ($raw===false || strlen($raw)>16*1024*1024) central_reply(413,['error'=>'حجم درخواست بیش از حد است.']);
    $input=json_decode($raw,true);
    try {
        if (!is_array($input) || ($input['confirmed']??false)!==true || !is_string($input['revision']??null) || !preg_match('/^(?:[a-f0-9]{32})?$/D',$input['revision']) || !is_array($input['data']??null)) throw new InvalidArgumentException('درخواست یا تأیید نامعتبر است.');
        $result=central_write($dir,$input['revision'],$input['data'],(string)$user['username']);
        central_reply(200,['result'=>$result]);
    } catch(DomainException $e) {central_reply(409,['error'=>$e->getMessage()]);}
      catch(InvalidArgumentException $e) {central_reply(400,['error'=>$e->getMessage()]);}
      catch(Throwable $e) {central_reply(503,['error'=>'ذخیره مرکزی ناموفق بود؛ داده قبلی حفظ شده است. فضای خصوصی و ظرفیت هاست را بررسی کنید.']);}
}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>نسخه مرکزی اطلاعات</title><style>body{font:15px sans-serif;background:#121820;color:#eee;line-height:1.9}main{max-width:900px;margin:auto;padding:1rem}section{background:#202a35;border-radius:12px;padding:1rem;margin:1rem 0}a{color:#ffb776}button{padding:.75rem;margin:.3rem;border:0;border-radius:7px;background:#f97316;cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}.warn{color:#ffd27d}pre{white-space:pre-wrap;word-break:break-word;font:inherit}label{display:block;margin:.5rem}</style><main>
<h1>نسخه مرکزی اطلاعات حسابداری و انبار</h1><p><a href="/admin-center.php">بازگشت به مرکز مدیریت</a></p>
<p class="warn"><strong>این صفحه انتقال دستی نسخه کامل است، نه ذخیره خودکار یا کار هم‌زمان چند حسابدار.</strong> عملیات پنل قدیمی همچنان محلی است؛ پس از هر تغییر باید جداگانه نسخه منتشر شود. از کار هم‌زمان کاربران و ویرایش در چند زبانه خودداری کنید.</p>
<p>نسخه مرکزی در فضای خصوصی هاست به‌صورت رمزگذاری‌نشده ذخیره می‌شود. فقط مدیر سروری به این صفحه دسترسی دارد؛ از امنیت هاست و پشتیبان رمزگذاری‌شده جداگانه مطمئن شوید.</p>
<section><h2>۱. بررسی نسخه‌ها</h2><p>برای جلوگیری از ناسازگاری فاکتور و انبار، هنگام انتشار، تمام پنج بخش زیر باید در این مرورگر موجود و معتبر باشند. بارگذاری آنها ممکن است نیاز به باز کردن پنل حسابداری و همه انبارها داشته باشد.</p><pre id="status" role="status">در حال بررسی...</pre><button type="button" id="refresh">بررسی دوباره نسخه مرکزی و دستگاه</button></section>
<section><h2>۲. دریافت نسخه پشتیبان دستگاه</h2><p>پیش از هر انتقال، از داده‌های همین دستگاه نسخه دانلود کنید. فایل حاوی اطلاعات حساس و رمزگذاری‌نشده است؛ آن را در محل امن نگهداری کنید.</p><button type="button" id="backup">دانلود نسخه دستگاه</button></section>
<section><h2>۳. انتشار روی سرور</h2><p>تمام پنج بخش دستگاه جایگزین نسخه مرکزی می‌شوند، ادغام انجام نمی‌شود. در صورت تغییر سرور بعد از بررسی، انتشار رد می‌شود. نسخه قبلی روی سرور نگهداری می‌شود.</p><label><input type="checkbox" id="publish-confirm"> تفاوت نسخه‌ها و جایگزینی کامل را بررسی و تأیید کرده‌ام.</label><button type="button" id="publish" disabled>انتشار نسخه این دستگاه</button></section>
<section><h2>۴. دریافت روی دستگاه</h2><p>تمام پنج بخش این مرورگر جایگزین می‌شوند؛ ابتدا از دستگاه پشتیبان بگیرید و همه پنجره‌های دیگر سایت را ببندید. بعد از دریافت، صفحه مدیریت را دوباره باز کنید.</p><label><input type="checkbox" id="restore-confirm"> از داده‌های دستگاه پشتیبان گرفته‌ام و جایگزینی را تأیید می‌کنم.</label><button type="button" id="restore" disabled>جایگزینی داده دستگاه با نسخه سرور</button></section>
<section><h2>۵. بازیابی فایل پشتیبان دستگاه</h2><p>فایل قبلی را انتخاب و خلاصه آن را بررسی کنید. فقط فایل کامل با هر پنج بخش قابل بازیابی است. این کار نسخه سرور را تغییر نمی‌دهد.</p><input type="file" id="backup-file" accept="application/json,.json"><pre id="backup-summary" role="status">فایلی انتخاب نشده است.</pre><label><input type="checkbox" id="file-confirm"> از داده‌های فعلی پشتیبان گرفته‌ام و جایگزینی آن‌ها را تأیید می‌کنم.</label><button type="button" id="file-restore" disabled>بازیابی فایل روی این دستگاه</button></section>
</main><script type="module" src="/assets/central-storage.js"></script></html>
