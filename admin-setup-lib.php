<?php
declare(strict_types=1);
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
