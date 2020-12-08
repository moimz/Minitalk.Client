<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 HTML을 가져온다.
 * 
 * @file /process/getServer.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$templet = Param('templet');

if ($this->isBanIp() == true) {
	$results->success = false;
	$results->errorcode = 403;
} else {
	if (strpos($templet,'@') === 0) {
		if (is_dir($this->getPath().'/plugins/'.substr($templet,1)) == true && is_file($this->getPath().'/plugins/'.substr($templet,1).'/channel.html') == true) {
			$results->success = true;
			$results->html = file_get_contents($this->getPath().'/plugins/'.substr($templet,1).'/channel.html');
		} else {
			$results->success = false;
			$results->error = 'NOT_FOUND_TEMPLET';
		}
	} else {
		if (is_dir($this->getPath().'/templets/'.$templet) == true && is_file($this->getPath().'/templets/'.$templet.'/skin.html') == true) {
			$results->success = true;
			$results->html = file_get_contents($this->getPath().'/templets/'.$templet.'/skin.html');
		} else {
			$results->success = false;
			$results->error = 'NOT_FOUND_TEMPLET';
		}
	}
}
?>