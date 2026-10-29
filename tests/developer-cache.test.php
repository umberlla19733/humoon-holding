<?php
declare(strict_types=1);
require __DIR__.'/../developer-cache-lib.php';
function dev_check($v,$msg) {if (!$v) throw new Exception($msg);}
dev_check(!hamun_developer_tools_allowed(null),'anonymous denied');
dev_check(!hamun_developer_tools_allowed(['role'=>'staff','developer_access'=>true]),'staff denied');
dev_check(!hamun_developer_tools_allowed(['role'=>'admin','developer_access'=>false]),'normal admin denied');
dev_check(hamun_developer_tools_allowed(['role'=>'admin','developer_access'=>true]),'developer admin allowed');
$root=sys_get_temp_dir().'/hamun-dev-cache-'.bin2hex(random_bytes(6));mkdir($root,0700,true);mkdir($root.'/site',0700);mkdir($root.'/outside',0700);
try {
    file_put_contents($root.'/site/admin-center.php','<?php');
    file_put_contents($root.'/site/accounts.php','<?php');
    file_put_contents($root.'/site/unlisted.php','<?php');
    file_put_contents($root.'/outside/owner-login.php','<?php');
    $symlink=@symlink($root.'/outside/owner-login.php',$root.'/site/owner-login.php');
    $calls=[];
    $result=hamun_invalidate_site_php($root.'/site',function($path,$force)use(&$calls){$calls[]=[$path,$force];return basename($path)==='accounts.php';});
    dev_check($result['attempted']===2 && $result['accepted']===1,'accepted and attempted accurately counted');
    dev_check(count($calls)===2,'only allowlisted existing files');
    foreach ($calls as $call) dev_check(dirname($call[0])===realpath($root.'/site') && $call[1]===true,'no traversal or external files');
    $result=hamun_invalidate_site_php($root.'/site',function($p,$force){throw new RuntimeException('unavailable');});
    dev_check($result['attempted']===2 && $result['accepted']===0,'failed calls not reported as successful');
    $page=file_get_contents(__DIR__.'/../admin-center.php');
    dev_check(strpos($page,'Clear-Site-Data: "cache"')!==false,'cache-only response exists');
    dev_check(strpos($page,'opcache_reset(')===false,'no global opcache reset');
    dev_check(strpos($page,"if (!\$developer) {http_response_code(403)")!==false,'developer authorization before actions');
    dev_check(strpos($page,"hash_equals(\$_SESSION['csrf']")!==false,'CSRF required');
    dev_check(strpos($page,"\$_POST['confirm']")!==false,'explicit confirmation required');
    echo "developer cache tests passed\n";
} finally {
    if ($symlink) unlink($root.'/site/owner-login.php');
    unlink($root.'/site/admin-center.php');unlink($root.'/site/accounts.php');unlink($root.'/site/unlisted.php');
    unlink($root.'/outside/owner-login.php');rmdir($root.'/outside');rmdir($root.'/site');rmdir($root);
}
