<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버 로그를 불러온다.
 * 
 * @file /process/@getLogs.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.2
 * @modified 2021. 3. 25.
 */
if (defined('__MINITALK__') == false) exit;

$server = Param('server');
$date = Param('date');

if ($date == date('Y-m-d')) {
	$file = 'minitalk.log';
} else {
	$file = 'minitalk-'.$date.'.log';
}

$logs = $this->callServerApi('GET',$server,'log/'.$date);
if ($logs->success == true) {
	$lists = $logs->logs;
} else {
	$lists = array('NO LOGS');
}

$results->success = true;
$results->lists = $lists;
$results->total = count($lists);
?>