<?php
declare(strict_types=1);
$root=sys_get_temp_dir().'/hamun-import-test-'.bin2hex(random_bytes(6));
mkdir($root.'/site',0700,true);mkdir($root.'/hamun-private',0700);
copy(__DIR__.'/../security-accounts.php',$root.'/site/security-accounts.php');
require $root.'/site/security-accounts.php';require __DIR__.'/../account-import-lib.php';
function check_import($value,$message) {if (!$value) throw new Exception($message);}
try {
    file_put_contents($root.'/hamun-private/password-hash',password_hash('bootstrap-password',PASSWORD_DEFAULT));
    $admin=hamun_accounts(function (&$users){return $users[0];});$dir=$root.'/hamun-private';
    $data=['accounts'=>[
        ['role'=>'staff','username'=>'warehouse-one','password'=>'temporary-warehouse-pass','sections'=>['bearings','packing']],
        ['role'=>'accountant','national_id'=>'0123456789','password'=>'temporary-accountant-pass'],
    ]];
    file_put_contents($dir.'/account-import.json',json_encode($data));
    $result=hamun_import_private_accounts($dir,$admin['id'],(int)$admin['version']);
    check_import($result['count']===2 && $result['removed'] && !file_exists($dir.'/account-import.json'),'successful import removes secret file');
    $accounts=hamun_accounts(function (&$users){return $users;});
    check_import(count($accounts)===3 && $accounts[1]['sections']===['bearings','packing'] && password_verify('temporary-warehouse-pass',$accounts[1]['password']),'staff imported with hash and sections');
    check_import($accounts[2]['role']==='accountant' && $accounts[2]['must_change_password'] && password_verify('temporary-accountant-pass',$accounts[2]['password']),'accountant requires password setup');
    $id=$accounts[1]['id'];$_SESSION=['user_id'=>$id,'user_version'=>1,'admin_until'=>time()+600];
    $update=['accounts'=>[['role'=>'staff','username'=>'warehouse-one','password'=>'updated-warehouse-pass','sections'=>['machining']]]];
    hamun_import_accounts_json(json_encode($update),$admin['id'],(int)$admin['version']);
    check_import(hamun_current_user()===null,'old session revoked');
    $accounts=hamun_accounts(function (&$users){return $users;});
    check_import(count($accounts)===3 && $accounts[1]['version']===2 && $accounts[1]['sections']===['machining'] && password_verify('updated-warehouse-pass',$accounts[1]['password']),'update in place');
    $renamed=['accounts'=>[['role'=>'staff','current_username'=>'warehouse-one','username'=>'warehouse-renamed','password'=>'renamed-strong-password','sections'=>['machining']]]];
    hamun_import_accounts_json(json_encode($renamed),$admin['id'],(int)$admin['version']);
    $accounts=hamun_accounts(function (&$users){return $users;});
    check_import(count($accounts)===3 && $accounts[1]['id']===$id && $accounts[1]['username']==='warehouse-renamed','username change preserves account identity');
    $missing=['accounts'=>[['role'=>'staff','current_username'=>'missing','username'=>'new-user','password'=>'another-strong-password']]];
    try {hamun_import_accounts_json(json_encode($missing),$admin['id'],(int)$admin['version']);throw new Exception('missing old username accepted');} catch(InvalidArgumentException $e) {}
    $before=file_get_contents($dir.'/accounts.json');
    try {hamun_import_accounts_json(json_encode($update),$admin['id'],999);throw new Exception('stale admin accepted');} catch(RuntimeException $e) {}
    check_import(file_get_contents($dir.'/accounts.json')===$before,'stale admin changes nothing');
    $conflict=['accounts'=>[['role'=>'staff','username'=>'another-user','password'=>'another-strong-password'],['role'=>'staff','username'=>'admin','password'=>'another-strong-password']]];
    try {hamun_import_accounts_json(json_encode($conflict),$admin['id'],(int)$admin['version']);throw new Exception('role conflict accepted');} catch(InvalidArgumentException $e) {}
    check_import(file_get_contents($dir.'/accounts.json')===$before,'conflicting batch has no partial changes');
    $self=['accounts'=>[['role'=>'admin','username'=>'admin','password'=>'another-strong-password','enabled'=>false]]];
    try {hamun_import_accounts_json(json_encode($self),$admin['id'],(int)$admin['version']);throw new Exception('self disable accepted');} catch(InvalidArgumentException $e) {}
    $duplicate=['accounts'=>[$data['accounts'][0],$data['accounts'][0]]];
    try {hamun_import_accounts_json(json_encode($duplicate),$admin['id'],(int)$admin['version']);throw new Exception('duplicate accepted');} catch(InvalidArgumentException $e) {}
    file_put_contents($dir.'/account-import.json','{"accounts":[]}');
    try {hamun_import_private_accounts($dir,$admin['id'],(int)$admin['version']);throw new Exception('invalid file accepted');} catch(InvalidArgumentException $e) {}
    check_import(file_exists($dir.'/account-import.json') && file_get_contents($dir.'/accounts.json')===$before,'invalid file preserved, account store unchanged');
    echo "account import tests passed\n";
} finally {
    foreach (glob($root.'/hamun-private/*')?:[] as $f) unlink($f);
    unlink($root.'/site/security-accounts.php');rmdir($root.'/site');rmdir($root.'/hamun-private');rmdir($root);
}
