<?php
declare(strict_types=1);
require __DIR__.'/../central-store-lib.php';
function verify($v,$message){if(!$v)throw new Exception($message);}
function rejected($f,$class){try{$f();}catch(Throwable $e){if($e instanceof $class)return;throw $e;}throw new Exception('Expected '.$class);}
$dir=sys_get_temp_dir().'/hamun-central-test-'.bin2hex(random_bytes(8));
$data=['hamun.db.accounting.v2'=>['invoices'=>[], 'customers'=>[], 'kardex'=>[]]];
foreach (['bearings','fasteners','packing','machining'] as $part) $data['hamun.db.'.$part.'.v6']=['products'=>[],'messages'=>[]];
try {
    central_validate($data); rejected(function(){central_validate(['unknown'=>[]]);},InvalidArgumentException::class);
    rejected(function(){central_validate(['hamun.db.accounting.v2'=>['invoices'=>[]]]);},InvalidArgumentException::class);
    $a=central_write($dir,'',$data,'admin');
    verify(strlen($a['revision'])===32,'revision created');
    verify(central_locked($dir,function($d){return central_read($d);})['data']===$data,'data persisted');
    rejected(function()use($dir,$data){central_write($dir,'',$data,'other');},DomainException::class);
    $data['hamun.db.accounting.v2']['invoices'][]=['id'=>'invoice'];
    $b=central_write($dir,$a['revision'],$data,'admin');
    verify($b['revision']!==$a['revision'],'revision changes');
    verify(is_file($dir.'/history/'.$a['revision'].'.json'),'previous snapshot saved');
    verify(central_locked($dir,function($d){return central_read($d);})['data']===$data,'latest data retained');
    echo "central store tests passed\n";
} finally { foreach(glob($dir.'/history/*')?:[] as $f)unlink($f); if(is_dir($dir.'/history'))rmdir($dir.'/history'); foreach(glob($dir.'/*')?:[] as $f)unlink($f);if(is_dir($dir))rmdir($dir); }
