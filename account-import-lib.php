<?php
declare(strict_types=1);
// Call only after authenticating an administrator and verifying CSRF. The JSON
// is supplied from private hosting storage, never from a web-accessible file.
function hamun_import_accounts_json(string $raw, string $actingId, int $actingVersion): int {
    if (strlen($raw)>65536) throw new InvalidArgumentException('فایل بیش از حد بزرگ است.');
    $data=json_decode($raw,true);
    if (!is_array($data) || !isset($data['accounts']) || !is_array($data['accounts']) || count($data['accounts'])<1 || count($data['accounts'])>25) throw new InvalidArgumentException('ساختار فایل یا تعداد حساب‌ها نامعتبر است.');
    $sections=['bearings','fasteners','packing','machining'];$entries=[];$keys=[];$destinations=[];
    foreach ($data['accounts'] as $item) {
        if (!is_array($item)) throw new InvalidArgumentException('اطلاعات حساب نامعتبر است.');
        $role=$item['role']??null;$password=$item['password']??null;
        if (!is_string($role) || !in_array($role,['admin','staff','accountant'],true) || !is_string($password) || strlen($password)<12 || strlen($password)>72 || strlen(trim($password))<12) throw new InvalidArgumentException('نقش یا رمز یک حساب نامعتبر است؛ رمز باید ۱۲ تا ۷۲ بایت باشد.');
        $name=$item['display_name']??'';
        if (!is_string($name) || strlen($name)>300) throw new InvalidArgumentException('نام نمایشی نامعتبر است.');
        $enabled=$item['enabled']??null;
        if ($enabled!==null && !is_bool($enabled)) throw new InvalidArgumentException('وضعیت فعال باید true یا false باشد.');
        $chosen=$item['sections']??[];
        if (!is_array($chosen)) throw new InvalidArgumentException('بخش انتخاب‌شده نامعتبر است.');
        foreach ($chosen as $section) if (!is_string($section) || !in_array($section,$sections,true)) throw new InvalidArgumentException('بخش انتخاب‌شده نامعتبر است.');
        $username='';$digest='';$lookup='';$rename=false;
        if ($role==='accountant') {
            if (!is_string($item['national_id']??null)) throw new InvalidArgumentException('برای حسابدار کد ملی لازم است.');
            $nationalId=hamun_national_id($item['national_id']);
            $digest=hamun_national_digest($nationalId);
            if (hash_equals($nationalId,hamun_national_id($password))) throw new InvalidArgumentException('رمز موقت نباید کد ملی باشد.');
            $key='national:'.$digest;
        } else {
            if (!is_string($item['username']??null)) throw new InvalidArgumentException('نام کاربری لازم است.');
            $username=strtolower(trim($item['username']));
            if (!preg_match('/^[a-z0-9_.-]{3,40}$/D',$username) || preg_match('/^[0-9]{10}$/D',$username)) throw new InvalidArgumentException('نام کاربری نامعتبر است.');
            $rename=array_key_exists('current_username',$item);
            $lookup=$item['current_username']??$username;
            if (!is_string($lookup)) throw new InvalidArgumentException('نام کاربری فعلی نامعتبر است.');
            $lookup=strtolower(trim($lookup));
            if (!preg_match('/^[a-z0-9_.-]{3,40}$/D',$lookup)) throw new InvalidArgumentException('نام کاربری فعلی نامعتبر است.');
            if (isset($destinations[$username])) throw new InvalidArgumentException('نام کاربری جدید تکراری است.');
            $destinations[$username]=true;
            $key='user:'.$lookup;
        }
        if (isset($keys[$key])) throw new InvalidArgumentException('حساب تکراری در فایل وجود دارد.');
        $keys[$key]=true;
        $entries[]=['role'=>$role,'password'=>$password,'username'=>$username,'national_digest'=>$digest,'lookup'=>$lookup,'rename'=>$rename,'display_name'=>$name,'enabled'=>$enabled,'sections'=>array_values(array_unique($chosen))];
    }
    return hamun_accounts(function (&$users) use ($entries,$actingId,$actingVersion) {
        $authorized=false;
        foreach ($users as $u) if (hash_equals((string)($u['id']??''),$actingId) && ($u['role']??'')==='admin' && !empty($u['enabled']) && empty($u['must_change_password']) && (int)($u['version']??0)===$actingVersion) {$authorized=true;break;}
        if (!$authorized) throw new RuntimeException('دسترسی مدیر تغییر کرده است؛ دوباره وارد شوید.');
        foreach ($entries as $entry) {
            $index=null;
            foreach ($users as $i=>$u) {
                $match=$entry['role']==='accountant'
                    ? (!empty($u['national_digest']) && hash_equals((string)$u['national_digest'],$entry['national_digest']))
                    : (($u['username']??'')===$entry['lookup']);
                if ($match) {$index=$i;break;}
            }
            if ($entry['rename'] && $index===null) throw new InvalidArgumentException('نام کاربری فعلی پیدا نشد؛ هیچ حسابی تغییر نکرد.');
            if ($entry['role']!=='accountant') foreach ($users as $i=>$u) {
                if (($u['username']??'')===$entry['username'] && $i!==$index) throw new InvalidArgumentException('نام کاربری جدید قبلاً ثبت شده است.');
            }
            if ($index!==null && ($users[$index]['role']??'')!==$entry['role']) throw new InvalidArgumentException('حسابی با همین شناسه و نقش متفاوت وجود دارد.');
            if ($index!==null && hash_equals((string)$users[$index]['id'],$actingId) && $entry['enabled']===false) throw new InvalidArgumentException('نمی‌توانید حساب مدیر فعال خود را غیرفعال کنید.');
            $hash=password_hash($entry['password'],PASSWORD_DEFAULT);
            if (!is_string($hash) || $hash==='') throw new RuntimeException('هش رمز ساخته نشد.');
            if ($index===null) {
                $id=bin2hex(random_bytes(16));
                $user=['id'=>$id,'username'=>$entry['role']==='accountant'?'acc-'.$id:$entry['username'],'role'=>$entry['role'],'enabled'=>$entry['enabled']??true,'version'=>1,'sections'=>[]];
            } else {
                $user=$users[$index];$user['version']=(int)$user['version']+1;
                if ($entry['enabled']!==null) $user['enabled']=$entry['enabled'];
            }
            if ($entry['role']!=='accountant') $user['username']=$entry['username'];
            $user['password']=$hash;
            if ($entry['display_name']!=='') $user['display_name']=$entry['display_name'];
            if ($entry['role']==='accountant') {$user['national_digest']=$entry['national_digest'];$user['must_change_password']=true;}
            if ($entry['role']==='staff') $user['sections']=$entry['sections'];
            if ($index===null) $users[]=$user; else $users[$index]=$user;
        }
        return count($entries);
    });
}
function hamun_import_private_accounts(string $privateDir, string $actingId, int $actingVersion): array {
    if (!is_dir($privateDir) || !is_writable($privateDir)) throw new RuntimeException('پوشه خصوصی در دسترس نیست.');
    $lock=@fopen($privateDir.'/account-import.lock','c+');
    if (!$lock || !flock($lock,LOCK_EX)) throw new RuntimeException('قفل فایل در دسترس نیست.');
    try {
        $path=$privateDir.'/account-import.json';
        if (is_link($path) || !is_file($path) || filesize($path)>65536) throw new RuntimeException('فایل خصوصی account-import.json پیدا نشد یا نامعتبر است.');
        $raw=file_get_contents($path,false,null,0,65537);
        if (!is_string($raw)) throw new RuntimeException('خواندن فایل ممکن نیست.');
        $count=hamun_import_accounts_json($raw,$actingId,$actingVersion);
        clearstatcache(true,$path);
        $current=!is_link($path) && is_file($path) ? file_get_contents($path,false,null,0,65537) : false;
        $removed=is_string($current) && hash_equals(hash('sha256',$raw),hash('sha256',$current)) && @unlink($path);
        return ['count'=>$count,'removed'=>$removed];
    } finally {flock($lock,LOCK_UN);fclose($lock);}
}
