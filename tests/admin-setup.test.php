<?php
declare(strict_types=1);
require __DIR__.'/../admin-setup-lib.php';
function setup_check($ok,$message) {if (!$ok) throw new Exception($message);}
$root=sys_get_temp_dir().'/hamun-setup-'.bin2hex(random_bytes(6));mkdir($root,0700,true);mkdir($root.'/site',0700);mkdir($root.'/hamun-private',0700);
copy(__DIR__.'/../security-accounts.php',$root.'/site/security-accounts.php');
require $root.'/site/security-accounts.php';
$dir=$root.'/hamun-private';$token=str_repeat('a',40);
try {
    try {hamun_initial_setup($dir,$token,'admin-example','long-password-example');throw new Exception('missing token accepted');} catch(RuntimeException $e) {}
    file_put_contents($dir.'/setup-token',$token);
    try {hamun_initial_setup($dir,str_repeat('b',40),'admin-example','long-password-example');throw new Exception('bad token accepted');} catch(InvalidArgumentException $e) {}
    try {hamun_initial_setup($dir,$token,'bad name','long-password-example');throw new Exception('bad username accepted');} catch(InvalidArgumentException $e) {}
    try {hamun_initial_setup($dir,$token,'admin-example','short');throw new Exception('short password accepted');} catch(InvalidArgumentException $e) {}
    setup_check(!file_exists($dir.'/accounts.json'),'failed attempts create no accounts');
    file_put_contents($dir.'/password-hash','existing');
    try {hamun_initial_setup($dir,$token,'admin-example','long-password-example');throw new Exception('existing bootstrap overwritten');} catch(RuntimeException $e) {}
    unlink($dir.'/password-hash');
    file_put_contents($dir.'/accounts.json','');
    try {hamun_initial_setup($dir,$token,'admin-example','long-password-example');throw new Exception('existing empty store overwritten');} catch(RuntimeException $e) {}
    unlink($dir.'/accounts.json');
    hamun_initial_setup($dir,$token,'Admin-Example','long-password-example');
    $users=json_decode(file_get_contents($dir.'/accounts.json'),true);
    setup_check(count($users)===1 && $users[0]['username']==='admin-example' && $users[0]['role']==='admin' && password_verify('long-password-example',$users[0]['password']),'valid admin account');
    setup_check(!file_exists($dir.'/setup-token'),'token removed after success');
    setup_check(strpos(file_get_contents($dir.'/accounts.json'),'long-password-example')===false,'password not stored in plaintext');
    $_SESSION=['user_id'=>$users[0]['id'],'user_version'=>1,'admin_until'=>time()+600];
    setup_check(hamun_current_user()['username']==='admin-example','existing authentication recognizes account');
    file_put_contents($dir.'/setup-token',$token);
    try {hamun_initial_setup($dir,$token,'other-admin','different-long-password');throw new Exception('second setup accepted');} catch(RuntimeException $e) {}
    setup_check(json_decode(file_get_contents($dir.'/accounts.json'),true)[0]['username']==='admin-example','existing account unchanged');
    echo "admin setup tests passed\n";
} finally {
    foreach (glob($dir.'/*')?:[] as $path) unlink($path);
    unlink($root.'/site/security-accounts.php');rmdir($root.'/site');rmdir($dir);rmdir($root);
}
