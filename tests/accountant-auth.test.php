<?php
declare(strict_types=1);
$root=sys_get_temp_dir().'/hamun-accountant-test-'.bin2hex(random_bytes(6));
mkdir($root.'/site',0700,true);mkdir($root.'/hamun-private',0700);
copy(__DIR__.'/../security-accounts.php',$root.'/site/security-accounts.php');
require $root.'/site/security-accounts.php';
require __DIR__.'/../accountant-policy.php';
function check_auth($value,$message){if(!$value)throw new Exception($message);}
try {
    file_put_contents($root.'/hamun-private/password-hash',password_hash('initial-strong-admin',PASSWORD_DEFAULT));
    $nid='0123456789';$digest=hamun_national_digest($nid);
    check_auth(hamun_national_id('۰۱۲۳۴۵۶۷۸۹')===$nid,'Persian digits');
    $account=['id'=>'test-1','username'=>'accountant-test','role'=>'accountant','sections'=>[],'enabled'=>true,'version'=>1,'national_digest'=>$digest,'must_change_password'=>true,'password'=>password_hash($nid,PASSWORD_DEFAULT)];
    hamun_accounts(function (&$users)use($account){$users[]=$account;});
    check_auth(password_verify($nid,$account['password']),'initial national ID');
    $_SESSION=['user_id'=>'test-1','user_version'=>1,'admin_until'=>time()+600];
    check_auth(hamun_current_user()===null,'pending user must not receive a full session');
    $_SESSION=['pending_user_id'=>'test-1','pending_user_version'=>1,'pending_until'=>time()+600];
    check_auth(hamun_pending_accountant()['id']==='test-1','pending session works');
    check_auth(!hamun_valid_new_password('123456',$digest),'short password rejected');
    check_auth(!hamun_valid_new_password('            ',$digest),'blank password rejected');
    check_auth(hamun_valid_new_password('a-strong-passphrase',$digest),'valid password accepted');
    hamun_accounts(function (&$users){foreach($users as &$u)if($u['id']==='test-1'){$u['must_change_password']=false;$u['version']=2;$u['password']=password_hash('a-strong-passphrase',PASSWORD_DEFAULT);}});
    check_auth(hamun_pending_accountant()===null,'stale pending session denied');
    $_SESSION=['user_id'=>'test-1','user_version'=>1,'admin_until'=>time()+600];check_auth(hamun_current_user()===null,'old version revoked');
    $_SESSION['user_version']=2;check_auth(hamun_current_user()['id']==='test-1','new full session works');
    // Password resets invalidate both full and pending sessions, without enabling accounts.
    $staffId=str_repeat('a',32);$accountantId=str_repeat('b',32);$disabledId=str_repeat('d',32);
    hamun_accounts(function (&$users) use ($staffId,$accountantId,$disabledId,$digest) {
        $users[]=['id'=>$staffId,'username'=>'staff-test','role'=>'staff','enabled'=>true,'version'=>1,'password'=>password_hash('staff-original-pass',PASSWORD_DEFAULT)];
        $users[]=['id'=>$accountantId,'username'=>'acc-test','role'=>'accountant','enabled'=>true,'version'=>3,'national_digest'=>$digest,'must_change_password'=>false,'password'=>password_hash('accountant-original',PASSWORD_DEFAULT)];
        $users[]=['id'=>$disabledId,'username'=>'disabled-test','role'=>'staff','enabled'=>false,'version'=>1,'password'=>password_hash('disabled-original',PASSWORD_DEFAULT)];
    });
    $_SESSION=['user_id'=>$staffId,'user_version'=>1,'admin_until'=>time()+600];
    check_auth(hamun_current_user()['id']===$staffId,'staff initially active');
    try {hamun_reset_user_password($staffId,'short');throw new Exception('short accepted');} catch(InvalidArgumentException $e) {}
    $r=hamun_reset_user_password($staffId,'new-staff-password');
    check_auth($r['role']==='staff' && hamun_current_user()===null,'staff session revoked');
    $after=hamun_accounts(function (&$users)use($staffId){foreach($users as $u)if($u['id']===$staffId)return $u;return null;});
    check_auth(password_verify('new-staff-password',$after['password']) && (int)$after['version']===2,'staff hash and version');
    $_SESSION=['user_id'=>$accountantId,'user_version'=>3,'admin_until'=>time()+600];
    hamun_reset_user_password($accountantId,'temporary-accountant-pass');
    check_auth(hamun_current_user()===null,'accountant session revoked');
    $after=hamun_accounts(function (&$users)use($accountantId){foreach($users as $u)if($u['id']===$accountantId)return $u;return null;});
    check_auth(!empty($after['must_change_password']) && (int)$after['version']===4 && password_verify('temporary-accountant-pass',$after['password']),'accountant must choose password');
    $_SESSION=['pending_user_id'=>$accountantId,'pending_user_version'=>3,'pending_until'=>time()+600];
    check_auth(hamun_pending_accountant()===null,'stale pending session revoked');
    check_auth(hamun_reset_user_password($disabledId,'reset-disabled-password')['enabled']===false,'reset does not enable account');
    try {hamun_reset_user_password(str_repeat('c',32),'strong-missing-password');throw new Exception('unknown account accepted');} catch(InvalidArgumentException $e) {}
    // Explicit administrator provisioning creates or resets only the matching accountant.
    $temporaryId='9876543210';$temporaryDigest=hamun_national_digest($temporaryId);
    hamun_provision_accountant($temporaryId,$temporaryId);
    $provisioned=hamun_accounts(function (&$users)use($temporaryDigest){foreach($users as $u)if(($u['national_digest']??'')===$temporaryDigest)return $u;return null;});
    check_auth($provisioned['role']==='accountant' && $provisioned['must_change_password'] && password_verify($temporaryId,$provisioned['password']),'national-ID-only first login configured');
    $_SESSION=['user_id'=>$provisioned['id'],'user_version'=>$provisioned['version'],'admin_until'=>time()+600];
    check_auth(hamun_current_user()===null,'temporary password is not a full session');
    $_SESSION=['pending_user_id'=>$provisioned['id'],'pending_user_version'=>$provisioned['version'],'pending_until'=>time()+600];
    check_auth(hamun_pending_accountant()['id']===$provisioned['id'],'first login receives only password-setup session');
    hamun_provision_accountant($temporaryId,'different-test');
    $updated=hamun_accounts(function (&$users)use($temporaryDigest){return array_values(array_filter($users,function($u)use($temporaryDigest){return ($u['national_digest']??'')===$temporaryDigest;}));});
    check_auth(count($updated)===1 && $updated[0]['version']===$provisioned['version']+1 && password_verify('different-test',$updated[0]['password']),'existing account reset, no duplicate');
    hamun_accounts(function (&$users)use($temporaryDigest){foreach($users as &$u)if(($u['national_digest']??'')===$temporaryDigest)$u['enabled']=false;});
    hamun_provision_accountant($temporaryId,'third-test');
    $updated=hamun_accounts(function (&$users)use($temporaryDigest){foreach($users as $u)if(($u['national_digest']??'')===$temporaryDigest)return $u;});
    check_auth(!$updated['enabled'],'reset does not enable disabled account');
    $otherId='9876543211';$otherDigest=hamun_national_digest($otherId);
    hamun_accounts(function (&$users)use($otherDigest){$users[]=['id'=>'non-accountant','role'=>'staff','national_digest'=>$otherDigest];});
    try {hamun_provision_accountant($otherId,'short-test');throw new Exception('other role overwritten');} catch(RuntimeException $e) {}
    // Self-service change checks the current password, current version and account state.
    $selfId=str_repeat('e',32);
    hamun_accounts(function (&$users)use($selfId){$users[]=['id'=>$selfId,'username'=>'self-test','role'=>'staff','enabled'=>true,'version'=>1,'password'=>password_hash('correct-old-password',PASSWORD_DEFAULT)];});
    try {hamun_change_own_password($selfId,1,'incorrect','new-strong-password');throw new Exception('wrong password accepted');} catch(InvalidArgumentException $e) {}
    try {hamun_change_own_password($selfId,1,'correct-old-password','short');throw new Exception('weak password accepted');} catch(InvalidArgumentException $e) {}
    $selfResult=hamun_change_own_password($selfId,1,'correct-old-password','new-strong-password');
    check_auth($selfResult['version']===2,'own password increments session version');
    $_SESSION=['user_id'=>$selfId,'user_version'=>1,'admin_until'=>time()+600];check_auth(hamun_current_user()===null,'other sessions revoked');
    $_SESSION['user_version']=2;check_auth(hamun_current_user()['id']===$selfId,'updated session remains usable');
    try {hamun_change_own_password($selfId,1,'new-strong-password','another-strong-password');throw new Exception('stale session accepted');} catch(RuntimeException $e) {}
    hamun_accounts(function (&$users)use($selfId){foreach($users as &$u)if($u['id']===$selfId)$u['enabled']=false;});
    try {hamun_change_own_password($selfId,2,'new-strong-password','another-strong-password');throw new Exception('disabled user accepted');} catch(RuntimeException $e) {}
    $digestA=str_repeat('a',64);$digestB=str_repeat('b',64);
    $sample=[['role'=>'staff','national_digest'=>$digestA,'developer_access'=>true],['role'=>'admin','national_digest'=>$digestB,'developer_access'=>true],['role'=>'admin','national_digest'=>$digestA,'developer_access'=>false]];
    check_auth(hamun_find_bot_developer($sample,$digestA)===null,'staff and ordinary admin are not developer');
    check_auth(hamun_find_bot_developer($sample,$digestB)['role']==='admin','only explicit developer account');
    check_auth(hamun_find_bot_developer($sample,'')===null,'blank digest denied');
    check_auth(hamun_bot_selected_digest(['bot_identity_digest'=>$digestB,'bot_identity_until'=>time()+1],time())===$digestB,'valid short selection');
    check_auth(hamun_bot_selected_digest(['bot_identity_digest'=>$digestB,'bot_identity_until'=>time()-1],time())==='','expired selection denied');
    check_auth(hamun_bot_selected_digest(['bot_identity_digest'=>'invalid','bot_identity_until'=>time()+60],time())==='','invalid selection denied');
    check_auth(hamun_accountant_file_allowed('data/acc/core.json'),'accounting allowed');
    check_auth(hamun_accountant_file_allowed('assets/AccountingPanel-CQf-TkFh.js'),'panel allowed');
    check_auth(!hamun_accountant_file_allowed('data/ledger/personnel.json'),'personnel denied');
    check_auth(!hamun_accountant_file_allowed('assets/PersonnelMonitor-DY0aHlA6.js'),'personnel panel denied');
    check_auth(!hamun_accountant_file_allowed('data/db/messages.json'),'inbox denied');
    $core=hamun_accountant_core(['acc'=>['invoices'=>[],'personnel'=>['secret'],'attendanceLogs'=>['secret'],'zarinpal'=>['secret']]]);
    foreach (['personnel','attendanceLogs','zarinpal'] as $key) check_auth(!array_key_exists($key,$core['acc']),'private core field filtered');
    echo "accountant auth tests passed\n";
} finally {
    foreach (glob($root.'/hamun-private/*')?:[] as $file) unlink($file);
    unlink($root.'/site/security-accounts.php');rmdir($root.'/site');rmdir($root.'/hamun-private');rmdir($root);
}
