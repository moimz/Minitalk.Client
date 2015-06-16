<?php
$_ENV['debug'] = true;
REQUIRE_ONCE '../config/default.conf.php';

$mDB = new DB();
$protocol = Request('protocol');
$protocol = json_decode($protocol,true);

$result = array();
if (is_array($protocol) == false) {

$result['success'] = false;
	$result['errormsg'] = 'protocol 인수가 잘못전달되었습니다.';
} else {
	if (isset($protocol['channel']) == true && isset($protocol['type']) == true) {
		$insert = array();
		$errors = array();
		
		$start = 0;
		if (isset($protocol['start']) == true) {
			if (is_numeric($protocol['start']) == false) {
				$errors[] = 'start 값은 숫자만 가능합니다.';
			} else {
				$start = intval($protocol['start']);
			}
		} else {
			$start = 0;
		}
		
		$limit = 0;
		if (isset($protocol['limit']) == true) {
			if (is_numeric($protocol['limit']) == false) {
				$errors[] = 'limit 값은 숫자만 가능합니다.';
			} else {
				$limit = intval($protocol['limit']);
			}
		} else {
			$limit = 0;
		}
		
		if (isset($protocol['format']) == true && $protocol['format']) $format = $protocol['format'];
		else $format = '[{time}] {nickname} : {message}';
		
		if (isset($protocol['date_format']) == true && $protocol['date_format']) $date_format = $protocol['date_format'];
		else $date_format = 'Y-m-d H:i:s'; 
		
		if (sizeof($errors) == 0) {
			$result['success'] = true;
			
			if ($start != 0 || $limit != 0) {
				$limiter = $start.','.$limit;
			} else {
				$limiter = '';
			}
			
			$log = $mDB->DBfetchs('minitalk_log_table',array('time','nickname','message'),"where `channel`='{$protocol['channel']}'",'time,asc',$limiter);
			$line = array();
			for ($i=0, $loop=sizeof($log);$i<$loop;$i++) {
				$log[$i]['time'] = date($date_format,$log[$i]['time']/1000);
				$log[$i]['message'] = LogConverter($log[$i]['message']);
				if ($protocol['type'] == 'TEXT') $log[$i]['message'] = strip_tags($log[$i]['message']); 
				$line[] = str_replace(array('{nickname}','{time}','{message}'),array($log[$i]['nickname'],$log[$i]['time'],$log[$i]['message']),$format);
			}
		} else {
			$result['success'] = false;
			$result['errormsg'] = implode("\n",$errors);
		}
	} else {
		$result['success'] = false;
		$result['errormsg'] = 'protocol 정보중 필수정보 (채널명, 로그종류, 포맷) 일부가 누락되었습니다.';
	}
}

if ($result['success'] == true) {
	exit(implode("\n",$line));
} else {
	exit($result['errormsg']);
}
?>