<?php
declare(strict_types=1);
/** Server-side events only. A template does not imply that an event source or provider exists. */
function hamun_sms_templates(): array {
    return [
        'contact_received' => ['استعلام ثبت شد', 'هامون: استعلام شما ثبت شد. کد پیگیری: {reference}'],
        'contact_reply' => ['پاسخ به استعلام', 'هامون: پاسخ استعلام شما در سایت ثبت شد. کد پیگیری: {reference}'],
        'account_created' => ['ایجاد حساب', 'هامون: حساب کاربری شما ایجاد شد. برای دریافت اطلاعات ورود با مدیریت هماهنگ کنید.'],
        'account_updated' => ['تغییر دسترسی حساب', 'هامون: تنظیمات حساب یا دسترسی شما تغییر کرد. برای جزئیات با مدیریت تماس بگیرید.'],
        'account_disabled' => ['قطع دسترسی حساب', 'هامون: دسترسی حساب شما غیرفعال شد. برای پیگیری با مدیریت تماس بگیرید.'],
        'quote_created' => ['صدور پیش‌فاکتور', 'هامون: پیش‌فاکتور شما صادر شد. شماره: {reference}'],
        'quote_updated' => ['تغییر پیش‌فاکتور', 'هامون: پیش‌فاکتور شما تغییر کرد. شماره: {reference}'],
        'invoice_created' => ['صدور فاکتور', 'هامون: فاکتور شما صادر شد. شماره: {reference}'],
        'invoice_updated' => ['تغییر فاکتور', 'هامون: فاکتور شما به‌روزرسانی شد. شماره: {reference}'],
        'invoice_cancelled' => ['ابطال فاکتور', 'هامون: فاکتور شما ابطال شد. شماره: {reference}'],
        'payment_registered' => ['ثبت پرداخت', 'هامون: پرداخت شما ثبت شد. شماره پیگیری: {reference}'],
        'payment_failed' => ['پرداخت ناموفق', 'هامون: پرداخت شما ناموفق بود. برای پیگیری با واحد فروش تماس بگیرید.'],
        'payment_due' => ['یادآوری پرداخت', 'هامون: برای بررسی موعد پرداخت خود با واحد حسابداری تماس بگیرید.'],
        'check_registered' => ['ثبت چک', 'هامون: اطلاعات چک شما ثبت شد. برای جزئیات با حسابداری تماس بگیرید.'],
        'check_due' => ['یادآوری چک', 'هامون: برای بررسی سررسید چک خود با حسابداری تماس بگیرید.'],
        'order_registered' => ['ثبت سفارش', 'هامون: سفارش شما ثبت شد. شماره: {reference}'],
        'order_updated' => ['تغییر وضعیت سفارش', 'هامون: وضعیت سفارش شما تغییر کرد. شماره: {reference}'],
        'order_ready' => ['آماده شدن سفارش', 'هامون: سفارش شما آماده پیگیری است. شماره: {reference}'],
        'order_delivered' => ['تحویل سفارش', 'هامون: تحویل سفارش شما ثبت شد. شماره: {reference}'],
        'inventory_alert' => ['هشدار موجودی', 'هامون: موجودی یکی از کالاها نیاز به بررسی دارد. برای جزئیات به پنل مراجعه کنید.'],
        'stock_request' => ['درخواست انبار', 'هامون: درخواست انبار ثبت شد. برای جزئیات به پنل مراجعه کنید.'],
        'stock_request_resolved' => ['بررسی درخواست انبار', 'هامون: درخواست انبار بررسی شد. برای جزئیات به پنل مراجعه کنید.'],
        'attendance_recorded' => ['ثبت تردد', 'هامون: تردد شما ثبت شد. در صورت مغایرت با مسئول مربوطه تماس بگیرید.'],
        'attendance_issue' => ['مغایرت تردد', 'هامون: وضعیت تردد شما نیاز به بررسی دارد. با مسئول مربوطه تماس بگیرید.'],
        'leave_request' => ['درخواست مرخصی', 'هامون: درخواست مرخصی شما ثبت شد. برای پیگیری با مسئول مربوطه هماهنگ کنید.'],
        'leave_decision' => ['بررسی مرخصی', 'هامون: درخواست مرخصی شما بررسی شد. برای جزئیات با مسئول مربوطه تماس بگیرید.'],
        'payroll_ready' => ['آماده شدن اطلاعات حقوق', 'هامون: اطلاعات حقوق شما آماده بررسی است. برای جزئیات به پنل امن مراجعه کنید.'],
        'staff_notification' => ['اطلاع‌رسانی پرسنلی', 'هامون: اطلاعیه جدیدی برای شما ثبت شد. برای مشاهده جزئیات به پنل امن مراجعه کنید.'],
    ];
}
function hamun_sms_event(string $event, string $phone, array $context, bool $consent, string $actor): ?array {
    if (!$consent) return null;
    $templates = hamun_sms_templates();
    if (!isset($templates[$event])) throw new InvalidArgumentException('رویداد پیامک نامعتبر است.');
    $text = $templates[$event][1];
    if (strpos($text, '{reference}') !== false) {
        $reference = trim((string)($context['reference'] ?? ''));
        if (!preg_match('/^[A-Za-z0-9_-]{1,60}$/D', $reference)) throw new InvalidArgumentException('شناسه پیامک نامعتبر است.');
        $text = str_replace('{reference}', $reference, $text);
    }
    return hamun_sms_prepare($phone, $text, $event, $actor);
}
/** Unicode SMS sizing: treat the whole message as UCS-2/UTF-16, conservatively. */
function hamun_sms_units(string $text): int {
    if (!preg_match('//u', $text)) throw new InvalidArgumentException('Invalid UTF-8');
    $chars = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
    $units = 0;
    foreach ($chars as $ch) $units += ord($ch[0]) >= 0xf0 ? 2 : 1;
    return $units;
}
function hamun_sms_prepare(string $phone, string $text, string $event, string $actor): array {
    $phone = trim($phone); $text = trim($text);
    if (!preg_match('/^\+?[0-9]{8,15}$/D', $phone) || $text === '' || strlen($text) > 4000 || hamun_sms_units($text) > 670) throw new InvalidArgumentException('شماره یا متن پیامک نامعتبر است.');
    if ($event !== 'manual' && !isset(hamun_sms_templates()[$event])) throw new InvalidArgumentException('رویداد نامعتبر است.');
    $root = dirname(__DIR__) . '/hamun-private';
    if (!is_dir($root) || !is_writable($root)) throw new RuntimeException('فضای خصوصی در دسترس نیست.');
    $dir = $root . '/sms-drafts';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) throw new RuntimeException('پوشه پیامک در دسترس نیست.');
    $id = bin2hex(random_bytes(16));
    $entry = ['id'=>$id, 'phone'=>$phone, 'text'=>$text, 'event'=>$event, 'actor'=>$actor, 'createdAt'=>time(), 'status'=>'provider_not_configured'];
    $path = $dir . '/' . $id . '.json';
    $file = @fopen($path, 'x');
    if (!$file) throw new RuntimeException('ثبت پیامک ممکن نیست.');
    @chmod($path, 0600);
    $data = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    $ok = flock($file, LOCK_EX) && fwrite($file, $data) === strlen($data) && fflush($file);
    flock($file, LOCK_UN); fclose($file);
    if (!$ok) { @unlink($path); throw new RuntimeException('ثبت پیامک ممکن نیست.'); }
    return $entry;
}
