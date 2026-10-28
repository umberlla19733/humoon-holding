<?php
declare(strict_types=1);
function central_keys(): array { return ['hamun.db.accounting.v2','hamun.db.bearings.v6','hamun.db.fasteners.v6','hamun.db.packing.v6','hamun.db.machining.v6']; }
function central_list($v): bool { return is_array($v) && ($v===[] || array_keys($v)===range(0,count($v)-1)); }
function central_validate($data): void {
    if (!is_array($data) || array_diff(array_keys($data),central_keys()) || array_diff(central_keys(),array_keys($data))) throw new InvalidArgumentException('داده انتخابی نامعتبر است.');
    foreach ($data as $key=>$value) {
        if (!is_array($value)) throw new InvalidArgumentException('ساختار داده نامعتبر است.');
        $required=$key==='hamun.db.accounting.v2'?['invoices','customers','kardex']:['products','messages'];
        foreach ($required as $field) if (!isset($value[$field]) || !central_list($value[$field])) throw new InvalidArgumentException('ساختار داده کامل نیست: '.$key);
    }
}
/** Serialize all readers and writers through one lock. The storage directory is outside web root. */
function central_locked(string $dir, callable $fn) {
    if (!is_dir($dir) && !@mkdir($dir,0700,true) && !is_dir($dir)) throw new RuntimeException('فضای ذخیره مرکزی در دسترس نیست.');
    $lock=@fopen($dir.'/store.lock','c+');
    if (!$lock || !flock($lock,LOCK_EX)) throw new RuntimeException('قفل ذخیره مرکزی در دسترس نیست.');
    try { return $fn($dir); } finally {flock($lock,LOCK_UN);fclose($lock);}
}
function central_read(string $dir): ?array {
    $file=$dir.'/current.json'; if (!is_file($file)) return null;
    $raw=@file_get_contents($file); $data=$raw===false?null:json_decode($raw,true);
    if (!is_array($data) || !isset($data['revision'],$data['data']) || !is_string($data['revision']) || !preg_match('/^[a-f0-9]{32}$/D',$data['revision'])) throw new RuntimeException('نسخه مرکزی خوانا نیست؛ از بازنویسی جلوگیری شد.');
    central_validate($data['data']); return $data;
}
function central_write(string $dir, string $revision, array $data, string $actor): array {
    central_validate($data);
    return central_locked($dir,function($dir)use($revision,$data,$actor){
        $old=central_read($dir); if (($old['revision']??'')!==$revision) throw new DomainException('نسخه سرور تغییر کرده است؛ ابتدا دوباره وضعیت را بررسی کنید.');
        $record=['revision'=>bin2hex(random_bytes(16)),'savedAt'=>gmdate('c'),'savedBy'=>$actor,'data'=>$data];
        $encoded=json_encode($record,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        if (strlen($encoded)>15*1024*1024) throw new InvalidArgumentException('حجم اطلاعات بیش از ۱۵ مگابایت است.');
        $history=$dir.'/history';
        if ($old!==null) {
            if (!is_dir($history) && !@mkdir($history,0700,true) && !is_dir($history)) throw new RuntimeException('پشتیبان نسخه پیشین ایجاد نشد.');
            $backup=$history.'/'.$old['revision'].'.json';
            // Never overwrite a previous version; if creation fails, do not replace current.
            if (is_file($backup)) { if (hash_file('sha256',$backup)!==hash_file('sha256',$dir.'/current.json')) throw new RuntimeException('پشتیبان قبلی ناسازگار است.'); }
            elseif (!@copy($dir.'/current.json',$backup)) { @unlink($backup); throw new RuntimeException('پشتیبان نسخه پیشین ایجاد نشد.'); }
            @chmod($backup,0600);
        }
        $tmp=tempnam($dir,'.pending-'); if (!$tmp) throw new RuntimeException('ذخیره موقت ناموفق بود.');
        @chmod($tmp,0600);
        try { if (file_put_contents($tmp,$encoded,LOCK_EX)!==strlen($encoded) || !rename($tmp,$dir.'/current.json')) throw new RuntimeException('ثبت نسخه مرکزی انجام نشد.'); }
        finally { if (is_file($tmp)) @unlink($tmp); }
        return ['revision'=>$record['revision'],'savedAt'=>$record['savedAt']];
    });
}
