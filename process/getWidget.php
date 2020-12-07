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

$results->success = true;
if ($this->isBanIp() == true) {
	$results->errorcode = 403;
} else {
	$results->html = file_get_contents($this->getPath().'/templets/'.$templet.'/skin.html');
}
?>