<?php
REQUIRE_ONCE '../config/default.conf.php';

$mDB = new DB();
$result = array();

$mcode = Request('mcode');
$check = $mDB->DBfetch('minitalk_server_table','*',"where `mcode`='$mcode'");

if (isset($check['mcode']) == false) exit(json_encode(array('success'=>false)));

$action = Request('action');

if ($action == 'save_channel') {
	$list = json_decode(Request('list'),true);
	
	foreach ($list as $channel=>$user) {
		$mDB->DBupdate('minitalk_channel_table',array('user'=>$user),'',"where `channel`='$channel' and `server`='{$check['idx']}'");
	}
	
	exit(json_encode(array('success'=>true)));
}

if ($action == 'banip') {
	$ip = Request('ip');
	$nickname = Request('nickname');
	$memo = Request('memo');
	$mDB->DBinsert('minitalk_ipban_table',array('ip'=>$ip,'nickname'=>$nickname,'memo'=>$memo,'reg_date'=>time()));
	
	exit(json_encode(array('success'=>true)));
}
?>