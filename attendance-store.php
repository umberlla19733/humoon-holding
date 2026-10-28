<?php
declare(strict_types=1);
function attendance_store(string $id, callable $callback) {
    if (!preg_match('/^[a-f0-9]{32}$/D',$id)) throw new RuntimeException('حساب نامعتبر است.');
    $root=dirname(__DIR__).'/hamun-private'; $dir=$root.'/attendance';
    if (!is_dir($root) || !is_writable($root)) throw new RuntimeException('فضای خصوصی در دسترس نیست.');
    if (!is_dir($dir) && !@mkdir($dir,0700,true) && !is_dir($dir)) throw new RuntimeException('فضای تردد در دسترس نیست.');
    $lock=@fopen($dir.'/'.$id.'.lock','c+');
    if (!$lock || !flock($lock,LOCK_EX)) throw new RuntimeException('ثبت تردد در دسترس نیست.');
    try {
        $path=$dir.'/'.$id.'.json'; $raw=is_file($path)?file_get_contents($path):'';
        if ($raw===false) throw new RuntimeException('خواندن اطلاعات ممکن نیست.');
        $data=$raw===''?['anchor'=>null,'pending'=>null,'events'=>[]]:json_decode($raw,true);
        if (!is_array($data) || !isset($data['events']) || !is_array($data['events'])) throw new RuntimeException('اطلاعات تردد نامعتبر است.');
        $result=$callback($data);
        $encoded=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        if ($raw!==$encoded) {
            $tmp=tempnam($dir,'.attendance-'); if (!$tmp) throw new RuntimeException('ذخیره اطلاعات ممکن نیست.');
            @chmod($tmp,0600);
            if (file_put_contents($tmp,$encoded)!==strlen($encoded) || !rename($tmp,$path)) { @unlink($tmp); throw new RuntimeException('ذخیره اطلاعات ممکن نیست.'); }
        }
        return $result;
    } finally { flock($lock,LOCK_UN); fclose($lock); }
}
function attendance_location($lat,$lon,$accuracy): array {
    if (!is_numeric($lat)||!is_numeric($lon)||!is_numeric($accuracy)) throw new InvalidArgumentException('موقعیت نامعتبر است.');
    $lat=(float)$lat; $lon=(float)$lon; $accuracy=(float)$accuracy;
    if (!is_finite($lat)||!is_finite($lon)||!is_finite($accuracy)||abs($lat)>90||abs($lon)>180||$accuracy<=0||$accuracy>50) throw new InvalidArgumentException('دقت موقعیت باید حداکثر ۵۰ متر باشد؛ در فضای باز دوباره تلاش کنید.');
    return ['lat'=>$lat,'lon'=>$lon,'accuracy'=>$accuracy];
}
function attendance_distance(array $a,array $b): float {
    $r=6371000.0; $dlat=deg2rad($b['lat']-$a['lat']); $dlon=deg2rad($b['lon']-$a['lon']);
    $h=sin($dlat/2)**2+cos(deg2rad($a['lat']))*cos(deg2rad($b['lat']))*sin($dlon/2)**2;
    return 2*$r*asin(min(1,sqrt(max(0,$h))));
}
function attendance_time(): string { return (new DateTimeImmutable('now',new DateTimeZone('Asia/Tehran')))->format('Y-m-d H:i:s P'); }
function attendance_transition(array &$data,string $action,array $loc,string $actor): array {
    $now=attendance_time();
    if ($action==='enroll') {
        if (!empty($data['anchor']) || !empty($data['pending'])) throw new RuntimeException('موقعیت قبلاً ثبت شده یا در انتظار تأیید است.');
        $data['pending']=$loc+['requestedAt'=>$now];
        $data['events'][]=['type'=>'location_requested','at'=>$now,'actor'=>$actor];
        return ['message'=>'موقعیت پیشنهادی ثبت شد و تا تأیید مدیر امکان ثبت تردد وجود ندارد.'];
    }
    if (!in_array($action,['in','out'],true)) throw new RuntimeException('عملیات نامعتبر است.');
    if (empty($data['anchor'])) throw new RuntimeException('ابتدا موقعیت را ثبت کنید و منتظر تأیید مدیر بمانید.');
    $distance=attendance_distance($data['anchor'],$loc); $radius=100;
    if ($distance+$loc['accuracy']>$radius) throw new RuntimeException('موقعیت یا دقت آن خارج از محدوده مجاز ۱۰۰ متری است.');
    $last=null;
    for ($i=count($data['events'])-1;$i>=0;$i--) if (in_array($data['events'][$i]['type'],['in','out'],true)) { $last=$data['events'][$i]['type']; break; }
    if ($action==='in' && $last==='in') throw new RuntimeException('ورود قبلاً ثبت شده است؛ ابتدا خروج ثبت کنید.');
    if ($action==='out' && $last!=='in') throw new RuntimeException('ابتدا باید ورود ثبت شود.');
    $data['events'][]=['type'=>$action,'at'=>$now,'lat'=>$loc['lat'],'lon'=>$loc['lon'],'accuracy'=>$loc['accuracy'],'distance'=>round($distance,1),'actor'=>$actor];
    return ['message'=>$action==='in'?'ورود ثبت شد.':'خروج ثبت شد.','at'=>$now];
}
