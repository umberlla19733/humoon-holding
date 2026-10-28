<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS']==='off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode','1'); ini_set('session.use_only_cookies','1');
session_set_cookie_params(['httponly'=>true,'secure'=>true,'samesite'=>'Strict','path'=>'/']); session_start();
require_once __DIR__.'/security-accounts.php';
$user=hamun_current_user();
if (!$user) { header('Location: /admin-security.php'); exit; }
if (($user['role']??'')!=='admin') { http_response_code(403); exit('Administrator access required'); }
$private=dirname(__DIR__).'/hamun-private';
$privateReady=is_dir($private) && is_writable($private);
$pdoDrivers=class_exists('PDO') ? PDO::getAvailableDrivers() : [];
function center_h(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مرکز مدیریت هامون</title><style>body{font:15px sans-serif;background:#121820;color:#eee;line-height:1.9}main{max-width:900px;margin:auto;padding:1rem}section{background:#202a35;border-radius:12px;padding:1rem;margin:1rem 0}a{color:#ffb776}h2{font-size:1.1rem}.warn{color:#ffd27d}small{color:#ccc}</style><main>
<h1>مرکز مدیریت و وضعیت امکانات</h1><p><a href="/#/admin">بازگشت به پنل مدیریت</a> | <a href="/admin-security.php">خروج از نشست سروری</a></p>
<p class="warn">این صفحه وضعیت و مسیرهای مدیریت را یک‌جا نشان می‌دهد؛ وجود هر بخش به معنی راه‌اندازی کامل همه سرویس‌ها نیست.</p>
<section><h2>آمادگی هاست</h2><p>نسخه PHP: <?=center_h(PHP_VERSION)?> | cURL: <?=function_exists('curl_init')?'فعال':'غیرفعال'?> | درایورهای PDO: <?=center_h($pdoDrivers ? implode(', ', $pdoDrivers) : 'هیچ‌کدام')?>.</p><small>این اطلاعات فقط برای بررسی اولیه است؛ اتصال پایگاه داده و تنظیمات امنیتی باید جداگانه آزمایش شوند.</small></section>
<section><h2>حساب‌ها و دسترسی‌ها</h2><p>ایجاد و غیرفعال‌سازی حساب‌ها و تنظیم رمز و دسترسی بخش‌های موجود.</p><p><a href="/accounts.php">مدیریت حساب‌ها</a></p><small>مجوزهای قدیمی داخل پنل مرورگر با مجوزهای سروری یکسان نیستند.</small></section>
<section><h2>پیام‌های سایت</h2><p>ثبت و مشاهده درخواست‌ها پس از راه‌اندازی صحیح فضای خصوصی هاست. وضعیت فضای خصوصی: <?= $privateReady?'پوشه قابل نوشتن است':'پوشه موجود یا قابل نوشتن نیست' ?>؛ این بررسی به‌تنهایی صحت امنیت و ذخیره تماس را تضمین نمی‌کند.</p><a href="/contact-inbox.php">کارتابل فرم‌های تماس</a></section>
<section><h2>حضور و غیاب</h2><p>تأیید موقعیت و بررسی رخدادها در بخش مدیریت تردد؛ موقعیت مرورگر می‌تواند جعل شود.</p><a href="/attendance-admin.php">مدیریت تردد</a> | <a href="/attendance.php">ثبت تردد</a></section>
<section><h2>پیامک</h2><p class="warn">سرویس‌دهنده هنوز انتخاب نشده؛ پیامک ارسال نمی‌شود. مرکز پیامک فقط پیش‌نویس و قالب دارد.</p><a href="/sms.php">مرکز پیامک و پیش‌نویس‌ها</a></section>
<section><h2>حسابداری و اطلاعات مشترک</h2><p class="warn">بخش‌هایی از حسابداری و انبار هنوز در مرورگر ذخیره می‌شوند و بین دستگاه‌ها به‌طور مطمئن مشترک نیستند. انتقال امن به سرور و مهاجرت داده‌های فعلی هنوز تکمیل نشده است.</p><a href="/#/admin">ورود به پنل حسابداری</a> | <a href="/central-storage.php">انتقال دستی نسخه مرکزی</a></section>
<section><h2>دستیار حسابداری</h2><p>راهنمای محلی قاعده‌محور است. مدل مولد نصب یا متصل نیست و پردازش سنگین روی هاست انجام نمی‌شود.</p></section>
<section><h2>پرداخت آنلاین</h2><p class="warn">اتصال پرداخت و تأیید تراکنش سمت سرور در این نسخه راه‌اندازی و آزموده نشده است؛ برای دریافت وجه به آن اتکا نکنید.</p></section>
</main></html>
