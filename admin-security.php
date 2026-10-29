<?php
// Server-side access gate for the legacy static admin. Requires PHP 7.4+ and HTTPS.
declare(strict_types=1);
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
if (!$secure) { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params(['httponly'=>true, 'secure'=>true, 'samesite'=>'Strict', 'path'=>'/']);
session_start();
require_once __DIR__ . '/security-accounts.php';
require_once __DIR__ . '/accountant-policy.php';
$now = time();
if (isset($_SESSION['admin_until']) && $_SESSION['admin_until'] < $now) unset($_SESSION['admin_until']);
$currentUser = hamun_current_user();
$isAdmin = $currentUser !== null && $currentUser['role'] === 'admin';
$authenticated = $isAdmin || ($currentUser !== null && $currentUser['role'] === 'accountant');
$action = $_GET['action'] ?? 'login';
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
if ($action === 'bot-token') {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {http_response_code(405);exit;}
    header('Content-Type: application/json; charset=utf-8');echo json_encode(['csrf'=>$_SESSION['csrf']]);exit;
}
if ($action === 'bot-identify') {
    header('Content-Type: application/json; charset=utf-8');
    $origin=$_SERVER['HTTP_ORIGIN']??'';
    if ($_SERVER['REQUEST_METHOD']!=='POST' || ($origin!=='' && $origin!=='https://'.($_SERVER['HTTP_HOST']??'')) || !hash_equals($_SESSION['csrf'],(string)($_SERVER['HTTP_X_CSRF_TOKEN']??''))) {http_response_code(403);echo '{"ok":false}';exit;}
    if (stripos($_SERVER['CONTENT_TYPE']??'','application/json')!==0 || (int)($_SERVER['CONTENT_LENGTH']??0)>512) {http_response_code(400);echo '{"ok":false}';exit;}
    $raw=file_get_contents('php://input',false,null,0,513);
    $input=$raw===false?null:json_decode($raw,true);
    try {
        if (strlen((string)$raw)>512 || !is_array($input) || !is_string($input['nationalId']??null)) throw new InvalidArgumentException('Invalid identity');
        $digest=hamun_national_digest($input['nationalId']);
        // Only a keyed digest is kept in the session; do not reveal whether an account exists.
        $_SESSION['bot_identity_digest']=$digest;$_SESSION['bot_identity_until']=time()+600;
        echo '{"ok":true}';
    } catch (Throwable $e) {http_response_code(400);echo '{"ok":false}';}
    exit;
}
if ($action === 'status') {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($authenticated ? 200 : 401);
    echo json_encode(['authenticated'=>$authenticated,'role'=>$authenticated?$currentUser['role']:null,'developerAccess'=>$isAdmin && !empty($currentUser['developer_access'])]); exit;
}
if ($action === 'journal') {
    if (!$authenticated) { http_response_code(401); exit('Authentication required'); }
    $year = (string)($_GET['year'] ?? '');
    $sanad = (string)($_GET['sanad'] ?? '');
    if (!preg_match('/^140[1-5]$/D', $year) || !preg_match('/^[0-9]{1,12}$/D', $sanad)) { http_response_code(400); exit('Invalid request'); }
    $path = __DIR__ . '/data/ledger/journal-' . $year . '.json';
    $raw = @file_get_contents($path);
    $data = $raw === false ? null : json_decode($raw, true);
    if (!is_array($data) || !isset($data['journal']) || !is_array($data['journal'])) { http_response_code(500); exit('Journal unavailable'); }
    $lines = $data['journal'][$sanad] ?? [];
    if (!is_array($lines)) { http_response_code(500); exit('Journal invalid'); }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['lines' => $lines], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
if ($action === 'file') {
    if (!$authenticated) { http_response_code(401); exit('Authentication required'); }
    $path = $_GET['path'] ?? '';
    if (!is_string($path) || !preg_match('~^(?:data/(?:acc|ledger)/[A-Za-z0-9_.-]+\.json|data/private/inventory/(?:bearings|fasteners|machining|packing)\.json|data/db/messages\.json|assets/(?:AdminApp--kXxpmTx|PersonnelMonitor-DY0aHlA6|AccountingPanel-CQf-TkFh|FinancialLedgerPanel-DYq0Kv-Z|SecurityAndAccessControl-DY-Y0UBZ|Inbox-CK8frSJ0)\.js)$~D', $path)) { http_response_code(404); exit; }
    if (!$isAdmin && !hamun_accountant_file_allowed($path)) { http_response_code(403); exit('Forbidden'); }
    $root = realpath(__DIR__); $file = realpath(__DIR__ . '/' . $path);
    if (!$file || strpos($file, $root . DIRECTORY_SEPARATOR) !== 0 || !is_file($file)) { http_response_code(404); exit; }
    header('Content-Type: ' . (substr($file, -5) === '.json' ? 'application/json' : 'application/javascript') . '; charset=utf-8');
    if (!$isAdmin && $path === 'data/acc/core.json') {
        try { $core=json_decode((string)file_get_contents($file),true); if (!is_array($core)) throw new RuntimeException('Invalid core'); echo json_encode(hamun_accountant_core($core),JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE); }
        catch (Throwable $e) {http_response_code(503);} exit;
    }
    readfile($file); exit;
}
$botLoginActive=hamun_bot_selected_digest($_SESSION,time())!=='' && ($_GET['manual']??'')!=='1' && ($_SERVER['REQUEST_METHOD']!=='POST' || ($_POST['bot_identity']??'')==='1');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf'] ?? ''))) { http_response_code(403); exit('Invalid request'); }
    if ($action === 'logout') {
        $_SESSION = []; session_destroy(); header('Location: /'); exit;
    }
    // Keep both hash and rate-limit records outside the public document root.
    $private = dirname(__DIR__) . '/hamun-private';
    $fromBot=($_POST['bot_identity']??'')==='1';
    $username = strtolower(hamun_national_id((string)($_POST['username'] ?? '')));
    try {
        $loginDigest = $fromBot ? ($botLoginActive ? hamun_bot_selected_digest($_SESSION,time()) : '') : (preg_match('/^[0-9]{10}$/D', $username) ? hamun_national_digest($username) : '');
    } catch (Throwable $e) { $loginDigest = ''; }
    try { $account = hamun_accounts(function (&$users) use ($username,$loginDigest,$fromBot) {
        if ($fromBot) return hamun_find_bot_developer($users,$loginDigest);
        foreach ($users as $u) {
            if (($loginDigest === '' && $u['username'] === $username) || ($loginDigest !== '' && !empty($u['national_digest']) && hash_equals($u['national_digest'],$loginDigest))) return $u;
        }
        return null;
    }); } catch (Throwable $e) { $account = null; }
    $rateDir = $private . '/rate';
    if (!is_dir($rateDir)) @mkdir($rateDir, 0700, true);
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $handle = @fopen($rateDir . '/' . hash('sha256', $ip), 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) {
        http_response_code(503); $error = 'ورود مدیریت هنوز روی سرور پیکربندی نشده است.';
    } else {
        $data = json_decode((string)stream_get_contents($handle), true);
        $attempts = is_array($data) ? array_values(array_filter($data, function ($t) use ($now) { return is_int($t) && $t > $now - 900; })) : [];
        if (count($attempts) >= 5) {
            http_response_code(429); $error = 'تعداد تلاش‌ها بیش از حد است؛ ۱۵ دقیقه بعد دوباره امتحان کنید.';
        } elseif (strlen((string)($_POST['password'] ?? '')) <= 1024 && is_array($account) && ($account['role']??'') !== 'accountant' && !empty($account['enabled']) && password_verify((string)($_POST['password'] ?? ''), (string)$account['password'])) {
            ftruncate($handle, 0); fflush($handle); flock($handle, LOCK_UN); fclose($handle);
            session_regenerate_id(true); $_SESSION = []; $_SESSION['admin_until'] = $now + 1800; $_SESSION['user_id'] = $account['id']; $_SESSION['user_version'] = $account['version'];
            header('Location: ' . ($account['role'] === 'admin' ? '/#/admin' : '/accounts.php')); exit;
        } else {
            $attempts[] = $now; rewind($handle); ftruncate($handle, 0); fwrite($handle, json_encode($attempts)); fflush($handle);
            http_response_code(401); $error = 'رمز عبور درست نیست.';
        }
        flock($handle, LOCK_UN); fclose($handle);
    }
}
header('Content-Type: text/html; charset=utf-8');
$token = htmlspecialchars($_SESSION['csrf'], ENT_QUOTES, 'UTF-8');
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ورود امن مدیریت هامون</title><style>body{background:#121820;color:#eef2f5;font:16px sans-serif;display:grid;place-items:center;min-height:95vh}main{background:#202a35;padding:2rem;border-radius:1rem;max-width:24rem}input,button{box-sizing:border-box;width:100%;padding:.8rem;margin-top:1rem;border-radius:.5rem;border:0}button{background:#f97316;cursor:pointer;font-weight:bold}.error{color:#ff9b9b}a{color:#ffb776}</style><main><h1>ورود مدیریت</h1><?php if ($currentUser && !$botLoginActive): ?><p>دسترسی سرور فعال است.</p><p><a href="/accounts.php">حساب و دسترسی‌ها</a><?php if ($currentUser['role'] === 'admin'): ?> | <a href="/admin-center.php">مرکز مدیریت و وضعیت</a><?php endif ?></p><form method="post" action="?action=logout"><input type="hidden" name="csrf" value="<?= $token ?>"><button>خروج</button></form><?php else: ?><p>رمز مدیریت سرور را وارد کنید.</p><?php if ($error): ?><p class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif ?><form method="post" action="?action=login"><input type="hidden" name="csrf" value="<?= $token ?>"><?php if ($botLoginActive): ?><input type="hidden" name="bot_identity" value="1"><p>شناسه از ربات دریافت شد؛ رمز حساب توسعه‌دهنده را وارد کنید.</p><?php else: ?><input type="text" name="username" required autocomplete="username" aria-label="کد ملی یا نام کاربری" placeholder="کد ملی یا نام کاربری"><?php endif ?><input type="password" name="password" required autocomplete="current-password" aria-label="رمز مدیریت"><button>ورود</button></form><p><a href="/owner-login.php">ورود توسعه‌دهنده بدون رمز</a> | <a href="/accountant-login.php">ورود حسابدار با کد ملی</a><?php if ($botLoginActive): ?> | <a href="/admin-security.php?manual=1">ورود با حساب دیگر</a><?php endif ?></p><?php endif ?></main></html>
