<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버정보를 가져온다.
 * 
 * @file /process/getServer.php
 * @license MIT License
 * @modified 2025. 2. 7.
 */
if (defined('__MINITALK__') == false) exit;

/**
 * 아이피 차단자인지 확인한다.
 */
if ($this->db()->select($this->table->banip)->where('ip',GetClientIp())->has() == true) {
	$results->success = false;
	$results->error = 'BANNED_IP';
	return;
}

$channel = Request('channel');
$results = $this->getServerConnection($channel);
?>