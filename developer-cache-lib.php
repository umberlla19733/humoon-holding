<?php
declare(strict_types=1);
// OPcache invalidation is deliberately limited to these PHP files, not a global reset.
function hamun_developer_tools_allowed(?array $user): bool {
    return $user !== null && ($user['role']??'')==='admin' && !empty($user['developer_access']);
}
function hamun_developer_php_files(): array {
    return ['account-import-lib.php','accountant-login.php','accountant-password.php','accountant-policy.php',
        'accounts.php','admin-center.php','admin-security.php','admin-setup-lib.php','admin-setup.php',
        'attendance-admin.php','attendance-store.php','attendance.php','central-storage.php','central-store-lib.php',
        'change-password.php','contact-inbox.php','contact.php','developer-cache-lib.php','owner-account.php',
        'owner-login.php','security-accounts.php','sms-service.php','sms.php'];
}
function hamun_invalidate_site_php(string $root, callable $invalidate): array {
    $root=realpath($root);
    if ($root===false || !is_dir($root)) throw new RuntimeException('مسیر سایت قابل بررسی نیست.');
    $attempted=0;$accepted=0;
    foreach (hamun_developer_php_files() as $name) {
        $path=$root.DIRECTORY_SEPARATOR.$name;
        if (is_link($path)) continue;
        $real=realpath($path);
        if ($real===false || dirname($real)!==$root || !is_file($real)) continue;
        $attempted++;
        try {if ($invalidate($real,true)===true) $accepted++;} catch (Throwable $e) { /* report as not accepted */ }
    }
    return ['attempted'=>$attempted,'accepted'=>$accepted];
}
