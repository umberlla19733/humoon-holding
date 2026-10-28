<?php
declare(strict_types=1);
header('Cache-Control: no-store, private'); header('X-Content-Type-Options: nosniff'); header('Referrer-Policy: no-referrer');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') { http_response_code(403); exit('HTTPS required'); }
ini_set('session.use_strict_mode', '1'); ini_set('session.use_only_cookies', '1');
session_set_cookie_params(['httponly'=>true, 'secure'=>true, 'samesite'=>'Strict', 'path'=>'/']); session_start();
require_once __DIR__ . '/security-accounts.php'; $user=hamun_current_user();
if (!$user) { header('Location: /admin-security.php'); exit; }
if (empty($_SESSION['csrf'])) $_SESSION['csrf']=bin2hex(random_bytes(32));
$dir=dirname(__DIR__).'/hamun-private/contacts'; $error=''; $notice='';
function permitted(array $user, array $item): bool { return $user['role']==='admin' || in_array($item['division'] ?? '', $user['sections'] ?? [], true); }
function h($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
if ($_SERVER['REQUEST_METHOD']==='POST') {
    if (!hash_equals($_SESSION['csrf'], (string)($_POST['csrf']??''))) { http_response_code(403); exit('Invalid request'); }
    $file=(string)($_POST['id']??''); $reply=trim((string)($_POST['reply']??''));
    if (!preg_match('/^[a-f0-9]{64}$/D',$file) || $reply==='' || strlen($reply)>5000) $error='متن پاسخ نامعتبر است.';
    else {
        $path=$dir.'/'.$file.'.json';
        $lock=is_file($path) ? @fopen($path.'.lock','c+') : false;
        if (!$lock || !flock($lock,LOCK_EX)) $error='پیام در دسترس نیست.';
        else {
            $item=json_decode((string)@file_get_contents($path),true);
            if (!is_array($item) || !permitted($user,$item)) { http_response_code(403); $error='دسترسی مجاز نیست.'; }
            else {
                $item['replies'][]=['text'=>$reply,'at'=>time()*1000,'author'=>$user['username']];
                $encoded=json_encode($item,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);
                $tmp=tempnam($dir,'.reply-');
                if ($tmp) @chmod($tmp,0600);
                $ok=$tmp && file_put_contents($tmp,$encoded)===strlen($encoded) && rename($tmp,$path);
                if (!$ok) { if ($tmp) @unlink($tmp); $error='ذخیره پاسخ انجام نشد؛ با مدیر تماس بگیرید.'; } else {
                    $notice='پاسخ ذخیره شد و با کد پیگیری قابل مشاهده است.';
                    if (!empty($item['smsConsent'])) {
                        try { require_once __DIR__.'/sms-service.php'; hamun_sms_event('contact_reply', $item['phone'], ['reference'=>$item['trackingCode']], true, $user['username']); }
                        catch (Throwable $e) { error_log('Hamun SMS draft creation failed'); $notice.=' پیش‌نویس پیامک ثبت نشد.'; }
                    }
                }
            }
            flock($lock,LOCK_UN); fclose($lock);
        }
    }
}
$items=[];
foreach (glob($dir.'/*.json') ?: [] as $path) {
    $lock=@fopen($path.'.lock','c+'); if (!$lock || !flock($lock,LOCK_SH)) continue;
    $item=json_decode((string)@file_get_contents($path),true); flock($lock,LOCK_UN); fclose($lock);
    if (is_array($item) && permitted($user,$item)) { $item['_file']=basename($path,'.json'); $items[]=$item; }
}
usort($items,function($a,$b){return ($b['createdAt']??0)<=>($a['createdAt']??0);});
?><!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>کارتابل پیام‌ها</title><style>body{font:15px sans-serif;background:#121820;color:#eee;line-height:1.8}main{max-width:900px;margin:auto;padding:1rem}article{background:#202a35;padding:1rem;border-radius:12px;margin:1rem 0}textarea{width:100%;box-sizing:border-box;padding:.5rem}button{padding:.7rem;background:#f97316;border:0;border-radius:6px}a{color:#ffb776}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}.error{color:#ff9b9b}</style><main><h1>کارتابل فرم‌های تماس</h1><p><a href="/accounts.php">حساب و دسترسی‌ها</a> | <a href="/admin-security.php">خروج</a></p><?php if($error):?><p class="error"><?=h($error)?></p><?php endif?><?php if($notice):?><p><?=h($notice)?></p><?php endif?><?php if(!$items):?><p>پیامی وجود ندارد.</p><?php endif?><?php foreach($items as $item):?><article><h2><?=h($item['subject'])?></h2><p><?=h($item['name'])?> — <a href="tel:<?=h($item['phone'])?>"><?=h($item['phone'])?></a> — <?=h($item['division'])?> — <?=h($item['trackingCode'])?></p><pre><?=h($item['body'])?></pre><?php foreach($item['replies'] as $reply):?><p>پاسخ: <?=h($reply['text'])?></p><?php endforeach?><form method="post"><input type="hidden" name="csrf" value="<?=h($_SESSION['csrf'])?>"><input type="hidden" name="id" value="<?=h($item['_file'])?>"><label>پاسخ <textarea name="reply" maxlength="2000" required></textarea></label><button>ثبت پاسخ</button></form></article><?php endforeach?></main></html>
