<?php
REQUIRE_ONCE '../config/default.conf.php';

$mDB = new DB();
$result = array();

$channel = Request('channel');
$password = Request('password');

$check = $mDB->DBfetch('minitalk_channel_table',array('channel','server','maxuser','password'),"where `channel`='$channel'");

if (isset($check['channel']) == false || $check['server'] == '') exit(json_encode(array('success'=>false)));
if (isset($check['password']) == true && $check['password'] && $check['password'] == $password) exit(json_encode(array('success'=>true,'code'=>GetOpperCode('ADMIN'))));
else exit(json_encode(array('success'=>false,'code'=>GetOpperCode('ADMIN'))));
?>