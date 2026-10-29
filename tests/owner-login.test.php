<?php
declare(strict_types=1);
$root=sys_get_temp_dir().'/hamun-owner-test-'.bin2hex(random_bytes(6));
mkdir($root.'/site',0700,true);mkdir($root.'/hamun-private',0700);
copy(__DIR__.'/../security-accounts.php',$root.'/site/security-accounts.php');
// Use a synthetic ID in tests; no real person's identifier is used here.
$source=file_get_contents(__DIR__.'/../owner-account.php');
$source=preg_replace('/\$expected=\x27[0-9]{10}\x27;/', '$expected=\'0123456789\';',$source,1,$count);
if ($count!==1) throw new Exception('test fixture unavailable');
file_put_contents($root.'/site/owner-account.php',$source);
require $root.'/site/security-accounts.php';require $root.'/site/owner-account.php';
function owner_check($v,$message){if(!$v)throw new Exception($message);}
try {
    file_put_contents($root.'/hamun-private/password-hash',password_hash('bootstrap-test-password',PASSWORD_DEFAULT));
    try {hamun_owner_id_only_login('9999999999');throw new Exception('incorrect id accepted');} catch(InvalidArgumentException $e) {}
    $result=hamun_owner_id_only_login('۰۱۲۳۴۵۶۷۸۹');
    $users=hamun_accounts(function (&$u){return $u;});
    owner_check(count($users)===2 && $users[0]['username']==='admin','existing bootstrap admin retained');
    owner_check($users[1]['role']==='admin' && $users[1]['developer_access'] && $result['id']===$users[1]['id'],'owner gets developer admin');
    $_SESSION=['user_id'=>$result['id'],'user_version'=>$result['version'],'admin_until'=>time()+600];
    owner_check(hamun_current_user()['id']===$result['id'],'session recognized');
    hamun_reset_user_password($result['id'],'owner-password-example');
    owner_check(hamun_current_user()===null,'reset revokes older session');
    $again=hamun_owner_id_only_login('0123456789');
    owner_check($again['id']===$result['id'] && $again['version']===$result['version']+1,'ID-only remains possible after password set');
    hamun_accounts(function (&$users)use($result){foreach($users as &$u)if($u['id']===$result['id'])$u['enabled']=false;});
    try {hamun_owner_id_only_login('0123456789');throw new Exception('disabled owner accepted');} catch(RuntimeException $e) {}
    hamun_accounts(function (&$users)use($result){foreach($users as &$u)if($u['id']===$result['id']){$u['enabled']=true;$u['role']='staff';}});
    try {hamun_owner_id_only_login('0123456789');throw new Exception('staff elevated');} catch(RuntimeException $e) {}
    owner_check(count(hamun_accounts(function (&$u){return $u;}))===2,'no duplicate or elevation');
    unlink($root.'/hamun-private/accounts.json');unlink($root.'/hamun-private/password-hash');
    $fresh=hamun_owner_id_only_login('0123456789');
    $freshUsers=hamun_accounts(function (&$users){return $users;});
    owner_check(count($freshUsers)===1 && $freshUsers[0]['id']===$fresh['id'] && $freshUsers[0]['role']==='admin','fresh install creates owner admin');
    echo "owner login tests passed\n";
} finally {
    foreach (glob($root.'/hamun-private/*')?:[] as $f) unlink($f);
    unlink($root.'/site/security-accounts.php');unlink($root.'/site/owner-account.php');rmdir($root.'/site');rmdir($root.'/hamun-private');rmdir($root);
}
