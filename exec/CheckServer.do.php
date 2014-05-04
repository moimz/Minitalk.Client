<?php
REQUIRE_ONCE '../config/default.conf.php';

$mDB = new DB();
$result = array();

$channel = Request('channel');
$check = $mDB->DBfetch('minitalk_channel_table',array('channel','server','maxuser'),"where `channel`='$channel'");

function CheckOnline($idx) {
	global $mDB;
	
	$forceCheck = Request('force') == 'true';
	$check = $mDB->DBfetch('minitalk_server_table','*',"where `idx`='$idx'");

	if (isset($check['idx']) == false) return false;
	
	if ($check['type'] == 'SELF') {
		if ($check['status'] == 'OFFLINE' || $forceCheck == true) {
			$fs = @fsockopen($_SERVER['SERVER_ADDR'],$check['port'],$errno,$errstr,10);
			if (!$fs) {
				if ($check['status'] == 'ONLINE') $mDB->DBupdate('minitalk_server_table',array('status'=>'OFFLINE','user'=>0,'channel'=>0,'check_time'=>time()),'',"where `idx`='$idx'");
				return false;
			} else {
				if ($check['status'] == 'OFFLINE') {
					$mDB->DBupdate('minitalk_server_table',array('status'=>'ONLINE','check_time'=>time()),'',"where `idx`='$idx'");
				}
				return array('idx'=>$check['idx'],'ip'=>$_SERVER['SERVER_ADDR'],'port'=>intval($check['port']),'serverCode'=>urlencode(MinitalkEncoder(json_encode(array('ip'=>$_SERVER['REMOTE_ADDR'])))),'channelCode'=>'');
			}
		} else {
			return array('idx'=>$check['idx'],'ip'=>$_SERVER['SERVER_ADDR'],'port'=>intval($check['port']),'serverCode'=>urlencode(MinitalkEncoder(json_encode(array('ip'=>$_SERVER['REMOTE_ADDR'])))),'channelCode'=>'');
		}
	} else {
		$minitalk = GetMiniTalkAPI(array('action'=>'check_server','ip'=>$_SERVER['REMOTE_ADDR'],'mcode'=>$check['mcode'],'scode'=>md5($_SERVER['SERVER_ADDR'].str_replace('://www.','://',$_ENV['url']))));
		if ($minitalk['success'] == true) {
			$minitalk['server']['idx'] = $check['idx'];
			return $minitalk['server'];
		} else {
			return false;
		}
	}
}

function GetFindServer() {
	global $mDB;
	
	$checkSelf = $mDB->DBfetchs('minitalk_server_table','*',"where `type`='SELF'",'user,asc');
	for ($i=0, $loop=sizeof($checkSelf);$i<$loop;$i++) {
		$serverInfo = CheckOnline($checkSelf[$i]['idx']);
		if ($serverInfo !== false) return $serverInfo;
	}
	
	$checkMiniTalk = $mDB->DBfetchs('minitalk_server_table','*',"where `type`='MINITALK'",'user,asc');
	for ($i=0, $loop=sizeof($checkMiniTalk);$i<$loop;$i++) {
		$serverInfo = CheckOnline($checkMiniTalk[$i]['idx']);
		if ($serverInfo !== false) return $serverInfo;
	}
	
	return false;
}

if (isset($check['channel']) == true) {
	if ($check['server'] != '0') {
		$serverInfo = CheckOnline($check['server']);
		if ($serverInfo === false) {
			$mDB->DBupdate('minitalk_channel_table',array('server'=>0),'',"where `channel`='$channel'");
			$serverInfo = GetFindServer();
			$result['server'] = $serverInfo;
			
			if ($serverInfo !== false) {
				$mDB->DBupdate('minitalk_channel_table',array('server'=>$serverInfo['idx']),'',"where `channel`='$channel'");
			}
		} else {
			$result['server'] = $serverInfo;
		}
	} else {
		$serverInfo = GetFindServer();
		$result['server'] = $serverInfo;
		
		if ($serverInfo !== false) {
			$mDB->DBupdate('minitalk_channel_table',array('server'=>$serverInfo['idx']),'',"where `channel`='$channel'");
		}
	}
	
	if ($result['server'] !== false) $result['server']['maxuser'] = $check['maxuser'];
	$result['success'] = true;
} else {
	$result['success'] = false;
	$result['errorCode'] = 101;
}

exit(json_encode($result));
?>