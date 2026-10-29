<?php
declare(strict_types=1);
// Reject paths inside the active document root. The host owner must also check
// that no other domain, alias or document root can serve the private directory.
function hamun_setup_private_path(string $dir, string $documentRoot): void {
    $parent=realpath(dirname($dir));$web=realpath($documentRoot);
    if ($parent===false || $web===false || $web===DIRECTORY_SEPARATOR || !is_dir($web) || is_link($dir)) throw new RuntimeException('مسیر خصوصی قابل تأیید نیست.');
    $candidate=$parent.DIRECTORY_SEPARATOR.basename($dir);
    if ($candidate===$web || strpos($candidate,$web.DIRECTORY_SEPARATOR)===0 || strpos($web,$candidate.DIRECTORY_SEPARATOR)===0) throw new RuntimeException('پوشه خصوصی در مسیر وب قرار دارد.');
}
function hamun_prepare_setup_token(string $dir, string $documentRoot): void {
    hamun_setup_private_path($dir,$documentRoot);
    if (!is_dir($dir) && !@mkdir($dir,0700) && !is_dir($dir)) throw new RuntimeException('ساخت پوشه خصوصی ممکن نیست.');
    if (is_link($dir) || !is_writable($dir)) throw new RuntimeException('پوشه خصوصی در دسترس نیست.');
    $lock=@fopen($dir.'/accounts.lock','c+');
    if (!$lock || !flock($lock,LOCK_EX)) throw new RuntimeException('قفل حساب‌ها در دسترس نیست.');
    try {
        if (file_exists($dir.'/accounts.json') || file_exists($dir.'/password-hash')) throw new RuntimeException('راه‌اندازی اولیه برای حساب موجود مجاز نیست.');
        $path=$dir.'/setup-token';
        if (file_exists($path) || is_link($path)) {
            if (!is_file($path) || is_link($path) || filesize($path)>130 || !preg_match('/^[A-Za-z0-9_-]{32,128}$/D',trim((string)file_get_contents($path)))) throw new RuntimeException('فایل کلید نامعتبر است.');
            return; // Never rotate an already-created token on a public request.
        }
        $f=@fopen($path,'x');
        if (!$f) throw new RuntimeException('ساخت کلید ممکن نیست.');
        try {
            @chmod($path,0600);$token=bin2hex(random_bytes(32));
            if (fwrite($f,$token)!==strlen($token) || !fflush($f)) { @unlink($path); throw new RuntimeException('ساخت کلید ممکن نیست.'); }
        } finally {fclose($f);}
    } finally {flock($lock,LOCK_UN);fclose($lock);}
}
// $dir must be a trusted private path outside every web root. The lock is shared with hamun_accounts.
function hamun_initial_setup(string $dir, string $token, string $username, string $password): void {
    $username=strtolower(trim($username));
    if (!preg_match('/^[a-z0-9_.-]{3,40}$/D',$username) || strlen($password)<12 || strlen($password)>72 || strlen(trim($password))<12) throw new InvalidArgumentException('ورودی نامعتبر است.');
    if (!preg_match('/^[A-Za-z0-9_-]{32,128}$/D',$token)) throw new InvalidArgumentException('ورودی نامعتبر است.');
    if (!is_dir($dir) || !is_writable($dir)) throw new RuntimeException('فضای خصوصی در دسترس نیست.');
    $lock=@fopen($dir.'/accounts.lock','c+');
    if (!$lock || !flock($lock,LOCK_EX)) throw new RuntimeException('قفل حساب‌ها در دسترس نیست.');
    try {
        // Never overwrite an existing account store or legacy bootstrap configuration, even if empty.
        if (file_exists($dir.'/accounts.json') || file_exists($dir.'/password-hash')) throw new RuntimeException('راه‌اندازی اولیه در دسترس نیست.');
        $path=$dir.'/setup-token';
        if (!is_file($path) || is_link($path) || filesize($path)>130) throw new RuntimeException('راه‌اندازی اولیه در دسترس نیست.');
        $saved=trim((string)file_get_contents($path));
        if (!preg_match('/^[A-Za-z0-9_-]{32,128}$/D',$saved) || !hash_equals($saved,$token)) throw new InvalidArgumentException('ورودی نامعتبر است.');
        $hash=password_hash($password,PASSWORD_DEFAULT);
        if (!is_string($hash) || $hash==='') throw new RuntimeException('ایجاد حساب انجام نشد.');
        $users=[['id'=>bin2hex(random_bytes(16)),'username'=>$username,'password'=>$hash,'role'=>'admin','sections'=>[],'enabled'=>true,'version'=>1]];
        $encoded=json_encode($users,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        $tmp=tempnam($dir,'.accounts-');
        if (!$tmp) throw new RuntimeException('ایجاد حساب انجام نشد.');
        @chmod($tmp,0600);
        if (file_put_contents($tmp,$encoded)!==strlen($encoded) || !rename($tmp,$dir.'/accounts.json')) { @unlink($tmp); throw new RuntimeException('ایجاد حساب انجام نشد.'); }
        // An existing accounts.json also disables setup if this cleanup fails.
        @unlink($path);
    } finally {flock($lock,LOCK_UN);fclose($lock);}
}
