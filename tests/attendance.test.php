<?php
require __DIR__.'/../attendance-store.php';
function check($value, $message) { if (!$value) throw new Exception($message); }
function fails(callable $f) { try { $f(); } catch (InvalidArgumentException|RuntimeException $e) { return; } throw new Exception('Expected rejection'); }
$at = attendance_location(32.4, 51.4, 10);
$data=['anchor'=>null,'pending'=>null,'events'=>[]];
fails(function () use (&$data,$at) { attendance_transition($data,'in',$at,'employee'); });
attendance_transition($data,'enroll',$at,'employee');
check($data['anchor']===null && $data['pending']!==null, 'enrollment must be approved');
fails(function () use (&$data,$at) { attendance_transition($data,'enroll',$at,'employee'); });
fails(function () use (&$data,$at) { attendance_transition($data,'in',$at,'employee'); });
$data['anchor']=$data['pending']; $data['pending']=null;
$far=attendance_location(32.41,51.4,10);
fails(function () use (&$data,$far) { attendance_transition($data,'in',$far,'employee'); });
fails(function () { attendance_location(32.4,51.4,51); });
fails(function () use (&$data,$at) { attendance_transition($data,'out',$at,'employee'); });
attendance_transition($data,'in',$at,'employee');
fails(function () use (&$data,$at) { attendance_transition($data,'in',$at,'employee'); });
attendance_transition($data,'out',$at,'employee');
check($data['events'][1]['type']==='in' && $data['events'][2]['type']==='out','ordered records');
check(strpos($data['events'][1]['at'],'+03:30')!==false, 'server Tehran timezone');
echo "attendance tests passed\n";
