<?php
declare(strict_types=1);
// IMPORTANT: This intentionally treats a public national ID as a complete admin
// credential. Anyone knowing it can become an administrator. Do not use on a
// public or sensitive deployment unless this takeover risk is accepted.
function hamun_owner_id_only_login(string $input): array {
    $expected='2281732797';
    $id=hamun_national_id($input);
    if (!hash_equals($expected,$id)) throw new InvalidArgumentException('ورود ممکن نیست.');
    $digest=hamun_national_digest($id);
    $dir=dirname(__DIR__).'/hamun-private';
    $lock=@fopen($dir.'/accounts.lock','c+');
    if (!$lock || !flock($lock,LOCK_EX)) throw new RuntimeException('حساب در دسترس نیست.');
    try {
        $path=$dir.'/accounts.json';
        $raw=is_file($path)?file_get_contents($path):'';
        if ($raw===false) throw new RuntimeException('خواندن حساب ممکن نیست.');
        if ($raw==='') {
            if (file_exists($path)) throw new RuntimeException('فایل حساب‌ها نامعتبر است.');
            $users=[];$bootstrap=$dir.'/password-hash';
            if (is_file($bootstrap)) {
                $hash=trim((string)file_get_contents($bootstrap));
                if (!password_get_info($hash)['algo']) throw new RuntimeException('رمز مدیر موجود نامعتبر است.');
                $users[]=['id'=>bin2hex(random_bytes(16)),'username'=>'admin','password'=>$hash,'role'=>'admin','sections'=>[],'enabled'=>true,'version'=>1];
            }
        } else {
            $users=json_decode($raw,true);
            if (!is_array($users) || !$users) throw new RuntimeException('فایل حساب‌ها نامعتبر است.');
        }
        foreach ($users as $user) {
            if (empty($user['national_digest']) || !hash_equals((string)$user['national_digest'],$digest)) continue;
            if (($user['role']??'')!=='admin' || empty($user['developer_access']) || empty($user['enabled']) || !empty($user['must_change_password'])) throw new RuntimeException('حساب غیرفعال یا غیرمجاز است.');
            return ['id'=>$user['id'],'version'=>(int)$user['version']];
        }
        $randomId=bin2hex(random_bytes(16));
        $user=['id'=>$randomId,'username'=>'owner-'.$randomId,'display_name'=>'توسعه‌دهنده','role'=>'admin','developer_access'=>true,'enabled'=>true,'version'=>1,'sections'=>[], 'national_digest'=>$digest,'password'=>password_hash(bin2hex(random_bytes(32)),PASSWORD_DEFAULT)];
        if (!is_string($user['password'])) throw new RuntimeException('ساخت حساب ممکن نیست.');
        $users[]=$user;$encoded=json_encode($users,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        $tmp=tempnam($dir,'.accounts-');
        if (!$tmp) throw new RuntimeException('ثبت حساب ممکن نیست.');
        @chmod($tmp,0600);
        if (file_put_contents($tmp,$encoded)!==strlen($encoded) || !rename($tmp,$path)) {@unlink($tmp);throw new RuntimeException('ثبت حساب ممکن نیست.');}
        return ['id'=>$user['id'],'version'=>$user['version']];
    } finally {flock($lock,LOCK_UN);fclose($lock);}
}
