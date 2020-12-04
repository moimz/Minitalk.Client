<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널 패스워드로 채널 관리자 권한을 가져온다.
 * 
 * @file /process/getChannelAdmin.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$channel = Param('channel');
$password = Param('password');

$channel = $this->getChannel($channel);
if ($channel == null || $channel->password == '' || $channel->password != $password) {
	$results->success = false;
	return;
}

$results->success = true;
$results->oppercode = $this->getOpperCode('ADMIN');
?>