<?php
REQUIRE_ONCE '../config/default.conf.php';

$mDB = new DB();
$result = array();

$channel = Request('channel');
$check = $mDB->DBfetch('minitalk_channel_table',array('channel','server','maxuser'),"where `channel`='$channel'");

function GetFindServer() {
	global $mDB;
	
	$checkSelf = $mDB->DBfetchs('minitalk_server_table','*',"where `type`='SELF'",'user,asc');
	for ($i=0, $loop=sizeof($checkSelf);$i<$loop;$i++) {
		$serverInfo = CheckOnline($checkSelf[$i]['idx'],Request('force') == 'true');
		if ($serverInfo !== false) return $serverInfo;
	}
	
	$checkMiniTalk = $mDB->DBfetchs('minitalk_server_table','*',"where `type`='MINITALK'",'user,asc');
	for ($i=0, $loop=sizeof($checkMiniTalk);$i<$loop;$i++) {
		$serverInfo = CheckOnline($checkMiniTalk[$i]['idx'],Request('force') == 'true');
		if ($serverInfo !== false) return $serverInfo;
	}
	
	return false;
}

if (isset($check['channel']) == true) {
	if ($check['server'] != '0') {
		$serverInfo = CheckOnline($check['server'],Request('force') == 'true');
		
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
	
	if ($result['server'] !== false) {
		$result['server']['maxuser'] = $check['maxuser'];
	}
	
	$result['success'] = true;
} else {
	$result['success'] = false;
	$result['errorCode'] = 101;
}

exit(json_encode($result));
?>