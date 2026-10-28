<?php
// Internal account storage, outside the web root. JSON is locked for all access.
declare(strict_types=1);
function hamun_accounts(callable $callback) {
    $dir = dirname(__DIR__) . '/hamun-private';
    $hashFile = $dir . '/password-hash';
    if (!is_dir($dir) || !is_writable($dir)) throw new RuntimeException('Private storage unavailable');
    $f = fopen($dir . '/accounts.lock', 'c+');
    if (!$f || !flock($f, LOCK_EX)) throw new RuntimeException('Account storage unavailable');
    try {
        $path = $dir . '/accounts.json';
        $raw = is_file($path) ? file_get_contents($path) : '';
        if ($raw === false) throw new RuntimeException('Account storage read failed');
        if ($raw === '') {
            $hash = is_file($hashFile) ? trim((string)file_get_contents($hashFile)) : '';
            if (!password_get_info($hash)['algo']) throw new RuntimeException('Administrator password not configured');
            $users = [['id'=>bin2hex(random_bytes(16)), 'username'=>'admin', 'password'=>$hash, 'role'=>'admin', 'sections'=>[], 'enabled'=>true, 'version'=>1]];
        } else {
            $users = json_decode($raw, true);
            if (!is_array($users) || !$users) throw new RuntimeException('Account storage invalid');
        }
        $result = $callback($users);
        $encoded = json_encode($users, JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        if ($raw !== $encoded) {
            $tmp = tempnam($dir, '.accounts-');
            if (!$tmp) throw new RuntimeException('Account storage write failed');
            @chmod($tmp, 0600);
            if (file_put_contents($tmp, $encoded) !== strlen($encoded) || !rename($tmp, $path)) { @unlink($tmp); throw new RuntimeException('Account storage write failed'); }
        }
        return $result;
    } finally { flock($f, LOCK_UN); fclose($f); }
}
function hamun_current_user() {
    if (empty($_SESSION['admin_until']) || $_SESSION['admin_until'] < time() || empty($_SESSION['user_id'])) return null;
    try {
        return hamun_accounts(function (&$users) {
            foreach ($users as $u) if (hash_equals((string)$u['id'], (string)$_SESSION['user_id']) && !empty($u['enabled']) && empty($u['must_change_password']) && (int)$u['version'] === (int)($_SESSION['user_version'] ?? 0)) return $u;
            return null;
        });
    } catch (Throwable $e) { return null; }
}
// National identifiers are not authentication secrets; they must be paired with a password.
function hamun_national_id(string $value): string {
    $digits=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹','٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return trim(str_replace($digits, array_merge(range(0,9),range(0,9)), $value));
}
function hamun_national_digest(string $value): string {
    $value=hamun_national_id($value);
    if (!preg_match('/^[0-9]{10}$/D',$value)) throw new InvalidArgumentException('کد ملی باید ده رقم باشد.');
    $dir=dirname(__DIR__).'/hamun-private';
    if (!is_dir($dir) || !is_writable($dir)) throw new RuntimeException('فضای خصوصی در دسترس نیست.');
    $f=@fopen($dir.'/national-id-key','c+');
    if (!$f || !flock($f,LOCK_EX)) throw new RuntimeException('کلید شناسایی در دسترس نیست.');
    try {
        @chmod($dir.'/national-id-key',0600); $key=stream_get_contents($f);
        if ($key==='') { $key=bin2hex(random_bytes(32)); rewind($f); if (fwrite($f,$key)!==64 || !fflush($f)) throw new RuntimeException('ثبت کلید شناسایی انجام نشد.'); }
        if (!preg_match('/^[a-f0-9]{64}$/D',$key)) throw new RuntimeException('کلید شناسایی نامعتبر است.');
        return hash_hmac('sha256',$value,$key);
    } finally { flock($f,LOCK_UN); fclose($f); }
}

// A first-login session is not a full account session and cannot open protected endpoints.
function hamun_pending_accountant() {
    if (empty($_SESSION['pending_until']) || $_SESSION['pending_until'] < time() || empty($_SESSION['pending_user_id'])) return null;
    try { return hamun_accounts(function (&$users) {
        foreach ($users as $u) if (hash_equals((string)$u['id'], (string)$_SESSION['pending_user_id']) && !empty($u['enabled']) && ($u['role']??'')==='accountant' && !empty($u['must_change_password']) && (int)$u['version']===(int)($_SESSION['pending_user_version']??0)) return $u;
        return null;
    }); } catch (Throwable $e) {return null;}
}
function hamun_valid_new_password(string $password, string $nationalDigest): bool {
    if (strlen($password)<12 || strlen($password)>72 || strlen(trim($password))<12) return false;
    $normalized=hamun_national_id($password);
    if (preg_match('/^[0-9]{10}$/D',$normalized) && hash_equals($nationalDigest,hamun_national_digest($normalized))) return false;
    return true;
}

// Caller must authenticate an administrator and verify CSRF before invoking this function.
// Every reset invalidates all existing full and first-login sessions for that account.
function hamun_reset_user_password(string $id, string $password): array {
    if (!preg_match('/^[a-f0-9]{32}$/D',$id)) throw new InvalidArgumentException('حساب انتخاب‌شده نامعتبر است.');
    if (strlen($password)<12 || strlen($password)>72 || strlen(trim($password))<12) throw new InvalidArgumentException('رمز باید حداقل ۱۲ نویسه غیرخالی و حداکثر ۷۲ بایت باشد.');
    return hamun_accounts(function (&$users) use ($id,$password) {
        foreach ($users as &$account) {
            if (!hash_equals((string)$account['id'],$id)) continue;
            $hash=password_hash($password,PASSWORD_DEFAULT);
            if (!is_string($hash) || $hash==='') throw new RuntimeException('تولید هش رمز ناموفق بود.');
            $account['password']=$hash;
            if (($account['role']??'')==='accountant') $account['must_change_password']=true;
            $account['version']=(int)$account['version']+1;
            return ['id'=>$account['id'],'role'=>$account['role']??'','enabled'=>!empty($account['enabled'])];
        }
        throw new InvalidArgumentException('حساب پیدا نشد.');
    });
}
// National-ID shortcut selects a developer account only; it never authenticates it.
function hamun_bot_selected_digest(array $session, int $now): string {
    $digest=$session['bot_identity_digest']??null;
    return is_string($digest) && preg_match('/^[a-f0-9]{64}$/D',$digest) && (int)($session['bot_identity_until']??0)>$now ? $digest : '';
}
function hamun_find_bot_developer(array $users, string $digest): ?array {
    if (!preg_match('/^[a-f0-9]{64}$/D',$digest)) return null;
    foreach ($users as $user) {
        if (($user['role']??'')!=='admin' || empty($user['developer_access'])) continue;
        if (!empty($user['national_digest']) && hash_equals((string)$user['national_digest'],$digest)) return $user;
    }
    return null;
}
