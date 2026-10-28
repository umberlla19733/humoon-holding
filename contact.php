<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
function respond(int $status, array $body): void { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') respond(403, ['error'=>'HTTPS required']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error'=>'Method not allowed']);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && $origin !== 'https://' . ($_SERVER['HTTP_HOST'] ?? '')) respond(403, ['error'=>'Invalid origin']);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) respond(415, ['error'=>'JSON required']);
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 12000) respond(413, ['error'=>'Request too large']);
$input = json_decode((string)file_get_contents('php://input', false, null, 0, 12001), true);
if (!is_array($input)) respond(400, ['error'=>'Invalid request']);
$private = dirname(__DIR__) . '/hamun-private';
if (!is_dir($private) || !is_writable($private)) respond(503, ['error'=>'Storage unavailable']);
$dir = $private . '/contacts'; $rates = $private . '/contact-rates';
if ((!is_dir($dir) && !@mkdir($dir, 0700, true)) || (!is_dir($rates) && !@mkdir($rates, 0700, true))) respond(503, ['error'=>'Storage unavailable']);
$rate = @fopen($rates . '/' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), 'c+');
if (!$rate || !flock($rate, LOCK_EX)) respond(503, ['error'=>'Storage unavailable']);
$now = time(); $history = json_decode((string)stream_get_contents($rate), true);
$history = is_array($history) ? array_values(array_filter($history, function($v) use ($now) { return is_int($v) && $v > $now - 900; })) : [];
if (count($history) >= 30) { flock($rate, LOCK_UN); fclose($rate); respond(429, ['error'=>'Too many requests']); }
$history[] = $now; rewind($rate); ftruncate($rate, 0); fwrite($rate, json_encode($history)); fflush($rate); flock($rate, LOCK_UN); fclose($rate);
$action = $input['action'] ?? 'submit';
if ($action === 'track') {
    $code = strtoupper(trim((string)($input['code'] ?? '')));
    if (!preg_match('/^HM-[A-F0-9]{32}$/D', $code)) respond(400, ['error'=>'Invalid code']);
    $path = $dir . '/' . hash('sha256', $code) . '.json';
    if (!is_file($path)) respond(404, ['error'=>'Not found']);
    $lock = @fopen($path . '.lock', 'c+'); if (!$lock || !flock($lock, LOCK_SH)) respond(503, ['error'=>'Storage unavailable']);
    $item = json_decode((string)@file_get_contents($path), true); flock($lock, LOCK_UN); fclose($lock);
    if (!is_array($item)) respond(404, ['error'=>'Not found']);
    respond(200, ['inquiry'=>['id'=>$item['id'], 'trackingCode'=>$code, 'division'=>$item['division'], 'subject'=>$item['subject'], 'body'=>$item['body'], 'createdAt'=>$item['createdAt'], 'replies'=>$item['replies']]]);
}
if ($action !== 'submit') respond(400, ['error'=>'Invalid action']);
$allowed = ['bearings','fasteners','packing','machining'];
$fields = ['name'=>200,'phone'=>32,'subject'=>400,'body'=>5000,'company'=>200,'qty'=>100,'productId'=>120,'productName'=>400,'productCode'=>120];
$item = [];
foreach ($fields as $field=>$limit) {
    $v = $input[$field] ?? '';
    if (!is_string($v) || strlen($v) > $limit) respond(400, ['error'=>'Invalid field']);
    $item[$field] = trim($v);
}
$division = $input['division'] ?? '';
if (!in_array($division, $allowed, true) || $item['name'] === '' || $item['subject'] === '' || $item['body'] === '' || !preg_match('/^\+?[0-9]{8,15}$/D', $item['phone'])) respond(400, ['error'=>'Invalid fields']);
$code = 'HM-' . strtoupper(bin2hex(random_bytes(16)));
$item['smsConsent'] = ($input['smsConsent'] ?? false) === true;
$item['division']=$division; $item['id']=bin2hex(random_bytes(16)); $item['trackingCode']=$code; $item['createdAt']=$now*1000; $item['replies']=[];
$path = $dir . '/' . hash('sha256', $code) . '.json';
$file = @fopen($path, 'x');
if (!$file) respond(503, ['error'=>'Storage unavailable']);
@chmod($path, 0600); $data = json_encode($item, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
$ok = flock($file, LOCK_EX) && fwrite($file, $data) === strlen($data) && fflush($file);
flock($file, LOCK_UN); fclose($file);
if (!$ok) { @unlink($path); respond(503, ['error'=>'Storage unavailable']); }
if ($item['smsConsent']) {
    try { require_once __DIR__ . '/sms-service.php'; hamun_sms_event('contact_received', $item['phone'], ['reference'=>$code], true, 'contact'); }
    catch (Throwable $e) { error_log('Hamun SMS draft creation failed'); }
}
respond(201, ['inquiry'=>$item]);
