<?php
declare(strict_types=1);
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1');
session_set_cookie_params(['httponly'=>true, 'secure'=>true, 'samesite'=>'Strict', 'path'=>'/']);
session_start(); require_once __DIR__ . '/security-accounts.php';
$user = hamun_current_user();
if (!$user) { header('Location: /admin-security.php'); exit; }
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
$sections = ['bearings'=>'بلبرینگ', 'fasteners'=>'پیچ و مهره', 'packing'=>'پکینگ', 'machining'=>'تراشکاری'];
$error = ''; $notice = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) { http_response_code(403); exit('Invalid request'); }
    if ($user['role'] !== 'admin') { http_response_code(403); exit('Forbidden'); }
    if (($_POST['action']??'')==='provision_requested_accountant') {
        try {
            // First login intentionally uses only the national ID, as requested.
            $requestedNationalId='1092325085';
            hamun_provision_accountant($requestedNationalId,$requestedNationalId);
            $notice='حساب آماده شد؛ حسابدار باید فوراً فقط با کد ملی وارد شود و رمز جدید تعیین کند. حساب غیرفعال خودکار فعال نمی‌شود.';
        } catch (InvalidArgumentException|RuntimeException $e) {$error=$e->getMessage();} catch (Throwable $e) {$error='آماده‌سازی حساب ممکن نیست.';}
    } elseif (($_POST['action']??'')==='create_accountant') {
        $nid=hamun_national_id((string)($_POST['national_id']??''));
        $displayName=trim((string)($_POST['display_name']??''));
        try {
            if (strlen($displayName)>300) throw new InvalidArgumentException('نام نمایشی بیش از حد طولانی است.');
            if (!preg_match('/^[0-9]{10}$/D',$nid)) throw new InvalidArgumentException('کد ملی باید ۱۰ رقم باشد.');
            $digest=hamun_national_digest($nid);
            hamun_accounts(function (&$users) use ($digest,$nid,$displayName) {
                foreach ($users as $u) if (!empty($u['national_digest']) && hash_equals($u['national_digest'],$digest)) throw new RuntimeException('این کد ملی قبلاً ثبت شده است.');
                $id=bin2hex(random_bytes(16));
                $users[]=['id'=>$id,'username'=>'acc-'.$id,'display_name'=>$displayName,'password'=>password_hash($nid,PASSWORD_DEFAULT),'role'=>'accountant','sections'=>[],'enabled'=>true,'version'=>1,'national_digest'=>$digest,'must_change_password'=>true];
            });
            $notice='حساب حسابدار ساخته شد. ورود اولیه فقط با کد ملی است؛ تغییر رمز پیش از دسترسی اجباری است.';
        } catch (InvalidArgumentException|RuntimeException $e) {$error=$e->getMessage();} catch(Throwable $e) {$error='ایجاد حساب ممکن نیست.';}
    } elseif (($_POST['action']??'')==='reset_password') {
        try {
            $new=(string)($_POST['new_password']??''); $repeat=(string)($_POST['repeat_password']??'');
            if (!hash_equals($new,$repeat)) throw new InvalidArgumentException('رمز و تکرار آن یکسان نیستند.');
            $result=hamun_reset_user_password((string)($_POST['id']??''),$new);
            $notice='رمز حساب تغییر کرد و نشست‌های قبلی آن لغو شدند.';
            if ($result['role']==='accountant') $notice.=' حسابدار باید پس از ورود با رمز جدید، رمز شخصی خود را تعیین کند.';
            if ($result['id']===$user['id']) $notice.=' این حساب نیز برای ادامه باید دوباره وارد شود.';
        } catch (InvalidArgumentException $e) {$error=$e->getMessage();} catch (Throwable $e) {$error='تغییر رمز انجام نشد.';}
    } else {
    $id = (string)($_POST['id'] ?? ''); $username = strtolower(trim((string)($_POST['username'] ?? '')));
    $password = (string)($_POST['password'] ?? ''); $role = (string)($_POST['role'] ?? 'staff');
    $displayName=trim((string)($_POST['display_name']??''));
    $developerAccess=isset($_POST['developer_access']);
    $chosen = array_values(array_intersect(array_keys($sections), (array)($_POST['sections'] ?? [])));
    $enabled = isset($_POST['enabled']);
    $nationalId=hamun_national_id((string)($_POST['national_id'] ?? ''));
    $smsConsent = isset($_POST['sms_consent']);
    $smsPhone = trim((string)($_POST['sms_phone'] ?? ''));
    $digits=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹','٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    $smsPhone = preg_replace('/[\s()-]+/', '', str_replace($digits, array_merge(range(0,9),range(0,9)), $smsPhone));
    if (($nationalId !== '' && !preg_match('/^[0-9]{10}$/D', $nationalId)) || ($smsPhone !== '' && !preg_match('/^\+?[0-9]{8,15}$/D', $smsPhone)) || ($smsConsent && $smsPhone === '') || strlen($displayName)>300 || ($developerAccess && $role!=='admin') || !preg_match('/^[a-z0-9_.-]{3,40}$/D', $username) || !in_array($role, ['admin', 'staff', 'accountant'], true) || ($password !== '' && (strlen($password) < 12 || strlen($password) > 72)) || (!$id && $password === '')) {
        $error = 'نام کاربری، رمز یا شماره پیامک نامعتبر است. برای رضایت پیامکی شماره معتبر لازم است.';
    } elseif ($id === $user['id'] && (!$enabled || $role !== 'admin')) {
        $error = 'نمی‌توانید حساب فعال خود را غیرفعال یا از مدیریت خارج کنید.';
    } else {
        try {
            $nationalDigest=$nationalId !== '' ? hamun_national_digest($nationalId) : '';
            $event = hamun_accounts(function (&$users) use ($id,$username,$password,$role,$chosen,$enabled,$smsConsent,$smsPhone,$nationalDigest,$displayName,$developerAccess) {
                $index = null;
                foreach ($users as $i => $u) {
                    if ($nationalDigest !== '' && !empty($u['national_digest']) && hash_equals($u['national_digest'],$nationalDigest) && $u['id'] !== $id) throw new RuntimeException('این کد ملی قبلاً ثبت شده است.');
                    if ($u['username'] === $username && $u['id'] !== $id) throw new RuntimeException('این نام کاربری قبلاً ثبت شده است.');
                    if ($u['id'] === $id) $index = $i;
                }
                if ($id && $index === null) throw new RuntimeException('حساب پیدا نشد.');
                if ($index !== null && (($users[$index]['role']==='accountant') !== ($role==='accountant'))) throw new RuntimeException('تغییر نقش از یا به حسابدار مجاز نیست؛ حساب جداگانه ایجاد کنید.');
                if ($index !== null && $role==='accountant' && $nationalDigest!=='' && !hash_equals((string)($users[$index]['national_digest']??''),$nationalDigest)) throw new RuntimeException('کد ملی حسابدار قابل تغییر نیست؛ حساب جداگانه ایجاد کنید.');
                if ($index === null && $role==='accountant') throw new RuntimeException('حسابدار را از فرم اختصاصی ایجاد کنید.');
                if ($developerAccess && $nationalDigest==='' && ($index===null || empty($users[$index]['national_digest']))) throw new RuntimeException('برای دسترسی توسعه‌دهنده، ثبت کد ملی در همین حساب الزامی است.');
                if ($index === null) {
                    $users[] = ['id'=>bin2hex(random_bytes(16)), 'username'=>$username, 'display_name'=>$displayName, 'password'=>password_hash($password, PASSWORD_DEFAULT), 'role'=>$role, 'developer_access'=>$developerAccess, 'sections'=>$chosen, 'enabled'=>$enabled, 'version'=>1, 'sms_phone'=>$smsPhone, 'sms_consent'=>$smsConsent, 'national_digest'=>$nationalDigest];
                    return 'account_created';
                } else {
                    $u = $users[$index]; $u['display_name']=$displayName; $u['username']=$username; $u['role']=$role; $u['developer_access']=$developerAccess; $u['sections']=$chosen; $u['enabled']=$enabled;
                    if ($password !== '') { $u['password']=password_hash($password, PASSWORD_DEFAULT); if ($role==='accountant') $u['must_change_password']=true; }
                    // Any account change revokes its existing sessions immediately.
                    $u['version'] = (int)$u['version'] + 1; $u['sms_phone']=$smsPhone; $u['sms_consent']=$smsConsent; if ($nationalDigest !== '') $u['national_digest']=$nationalDigest; $users[$index]=$u;
                    return $enabled ? 'account_updated' : 'account_disabled';
                }
            });
            $notice = 'تغییرات ذخیره شد. نشست‌های قبلی این حساب لغو شدند.';
            if ($smsConsent) {
                try { require_once __DIR__.'/sms-service.php'; hamun_sms_event($event, $smsPhone, [], true, $user['username']); }
                catch (Throwable $e) { error_log('Hamun SMS draft creation failed'); $notice .= ' پیش‌نویس پیامک ثبت نشد.'; }
            }
        } catch (Throwable $e) { $error = 'ذخیره انجام نشد: ' . $e->getMessage(); }
    }
    }
}
function h($x) { return htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8'); }
$users = [];
if ($user['role'] === 'admin') {
    try { $users = hamun_accounts(function (&$users) { return $users; }); } catch (Throwable $e) { $error = 'خواندن حساب‌ها ممکن نیست.'; }
}
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مدیریت دسترسی هامون</title><style>body{font:15px sans-serif;background:#121820;color:#eef2f5;line-height:1.8}main{max-width:900px;margin:2rem auto;padding:1rem}section,form{background:#202a35;border-radius:12px;padding:1rem;margin:1rem 0}input,select,button{padding:.6rem;border-radius:6px;margin:.3rem}button{background:#f97316;border:0;cursor:pointer}a{color:#ffb776}.error{color:#ff9b9b}label{display:inline-block;margin:.2rem}small{color:#ccc}</style><main><h1>حساب‌ها و دسترسی‌ها</h1><p>کاربر: <?=h($user['username'])?> | <a href="/admin-security.php">خروج</a> | <a href="/contact-inbox.php">کارتابل پیام‌های سایت</a> | <a href="/attendance.php">ثبت تردد</a><?php if ($user['role']==='admin'): ?> | <a href="/attendance-admin.php">مدیریت تردد</a><?php endif ?><?php if ($user['role']==='admin'): ?> | <a href="/sms.php">مرکز پیامک</a><?php endif ?><?php if ($user['role']==='admin'): ?> | <a href="/admin-center.php">مرکز مدیریت و وضعیت</a> | <a href="/#/admin">پنل مدیریت</a><?php endif ?></p>
<?php if ($error): ?><p class="error"><?=h($error)?></p><?php endif ?><?php if ($notice): ?><p><?=h($notice)?></p><?php endif ?>
<?php if ($user['role'] === 'admin'): ?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="action" value="provision_requested_accountant"><p>هشدار: ورود اولیه فقط با کد ملی است و هر کس آن را بداند ممکن است زودتر وارد شود. با زدن این دکمه، رمز حساب موجود نیز بازنشانی می‌شود؛ حسابدار باید بلافاصله رمز جدید تعیین کند.</p><button>آماده‌سازی حسابدار درخواست‌شده</button></form><form method="post"><h2>ایجاد حساب حسابدار</h2><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="action" value="create_accountant"><label>نام حسابدار (برای شناسایی مدیر) <input name="display_name" maxlength="100" autocomplete="off"></label><label>کد ملی حسابدار <input name="national_id" inputmode="numeric" maxlength="10" dir="ltr" required></label><p>اولین ورود با کد ملی و سپس تغییر اجباری رمز است. کد ملی راز نیست؛ شخص دیگری ممکن است پیش از حسابدار وارد شود.</p><button>ایجاد حساب حسابدار</button></form><p>مدیر می‌تواند رمز همه حساب‌های ثبت‌شده در این صفحه را جداگانه تغییر دهد؛ رمز فعلی نمایش داده نمی‌شود و نشست‌های قبلی لغو می‌شوند. رمزهای قدیمی ذخیره‌شده فقط در مرورگر با این حساب‌ها یکی نیستند. مدیر می‌تواند حساب‌ها را ایجاد، رمز را تغییر و حساب را غیرفعال کند. پرسنل فقط به نمایش اطلاعات بخش‌های مجاز دسترسی دارند؛ حسابدار تازه در پنل حسابداری و داده‌های مالی و انبار به منابع تعیین‌شده دسترسی دارد.</p>
<?php foreach (array_merge($users, [['id'=>'','username'=>'','role'=>'staff','sections'=>[],'enabled'=>true]]) as $account): ?><form method="post"><h2><?= $account['id'] ? h(($account['display_name']??'') ?: $account['username']) : 'حساب جدید' ?></h2><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($account['id'])?>"><label>نام نمایشی <input name="display_name" value="<?=h($account['display_name']??'')?>" maxlength="100"></label><label>نام کاربری داخلی <input name="username" value="<?=h($account['username'])?>" required></label><label>کد ملی <?= !empty($account['national_digest']) ? '(ثبت شده؛ برای تغییر وارد کنید)' : '(۱۰ رقم)' ?> <input name="national_id" type="text" inputmode="numeric" autocomplete="off" maxlength="10" dir="ltr"></label><?php if (!$account['id']): ?><label>رمز اولیه <input type="password" name="password" autocomplete="new-password" minlength="12" maxlength="72" required></label><?php endif ?><label>نقش <select name="role"><option value="staff" <?= $account['role']==='staff'?'selected':'' ?>>پرسنل</option><option value="admin" <?= $account['role']==='admin'?'selected':'' ?>>مدیر</option><?php if ($account['role']==='accountant'): ?><option value="accountant" selected>حسابدار</option><?php endif ?></select></label><label><input type="checkbox" name="enabled" <?= !empty($account['enabled'])?'checked':'' ?>>فعال</label><label><input type="checkbox" name="developer_access" <?= !empty($account['developer_access'])?'checked':'' ?>>ورود توسعه‌دهنده با دسترسی کامل (فقط نقش مدیر و کد ملی ثبت‌شده)</label><p><label>شماره پیامک <input name="sms_phone" type="tel" dir="ltr" value="<?=h($account['sms_phone']??'')?>"></label><label><input type="checkbox" name="sms_consent" <?= !empty($account['sms_consent'])?'checked':'' ?>>رضایت شخص برای اطلاع‌رسانی حساب دریافت شده است (فعلاً پیامکی ارسال نمی‌شود).</label></p><p>بخش‌های مجاز پرسنل:</p><?php foreach ($sections as $key=>$label): ?><label><input type="checkbox" name="sections[]" value="<?=h($key)?>" <?=in_array($key,$account['sections'],true)?'checked':''?>><?=h($label)?></label><?php endforeach ?><p><button>ذخیره اطلاعات و دسترسی</button></p></form><?php if ($account['id']): ?><form method="post"><h3>تغییر رمز: <?=h(($account['display_name']??'') ?: $account['username'])?></h3><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="action" value="reset_password"><input type="hidden" name="id" value="<?=h($account['id'])?>"><label>رمز جدید <input name="new_password" type="password" minlength="12" maxlength="72" autocomplete="new-password" required></label><label>تکرار رمز <input name="repeat_password" type="password" minlength="12" maxlength="72" autocomplete="new-password" required></label><p><small>رمز فعلی قابل مشاهده نیست. با تغییر رمز نشست‌های قبلی این حساب قطع می‌شود<?= $account['role']==='accountant'?' و حسابدار پس از ورود باید رمز خود را تعیین کند':'' ?>.</small></p><button>تغییر رمز این حساب</button></form><?php endif ?><?php endforeach ?>
<?php elseif ($user['role']==='accountant'): ?><p>حساب حسابداری شما فعال است. <a href="/#/admin">پنل حسابداری</a> | <a href="/accountant-password.php">تغییر رمز شخصی</a></p><?php else: ?><p>مشاهده کاتالوگ و موجودی بخش‌های مجاز (فقط خواندنی):</p><?php foreach ($sections as $key=>$label): if (!in_array($key,$user['sections'],true)) continue; $file=__DIR__.'/data/private/inventory/'.$key.'.json'; $data=json_decode((string)@file_get_contents($file), true); ?><section><h2><?=h($label)?></h2><?php if (!is_array($data) || !isset($data['products'])): ?><p>داده در دسترس نیست.</p><?php else: ?><p><?=count($data['products'])?> کالا</p><details><summary>نمایش کالاها</summary><ul><?php foreach ($data['products'] as $p): ?><li><?=h($p['name']??'')?> — کد <?=h($p['code']??'')?> — موجودی <?=h($p['stock']??'')?> — قیمت <?=h($p['price']??'')?> تومان</li><?php endforeach ?></ul></details><?php endif ?></section><?php endforeach ?><?php endif ?></main></html>
