<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버 로그를 불러온다.
 * 
 * @file /process/@getLogs.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.1
 * @modified 2021. 3. 10.
 */
if (defined('__MINITALK__') == false) exit;

$date = Param('date');

if ($date == date('Y-m-d')) {
	$file = 'minitalk.log';
} else {
	$file = 'minitalk-'.$date.'.log';
}

$start = Request('start');
$limit = Request('limit');

$lists = array();
$total = 0;

if (is_dir(__MINITALK_PATH__.'/logs') == true && is_dir(__MINITALK_PATH__.'/logs') == true && is_file(__MINITALK_PATH__.'/logs/'.$file) == true) {
	$logs = explode("\n",file_get_contents(__MINITALK_PATH__.'/logs/'.$file));
	$total = count($logs);
	$lists = array_slice($logs,$start,$limit);
}

$results->success = true;
$results->lists = $lists;
$results->total = $total;
?>