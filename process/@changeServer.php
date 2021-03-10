<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버상태를 변경한다.
 * 
 * @file /process/@changeServer.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.1
 * @modified 2021. 3. 10.
 */
if (defined('__MINITALK__') == false) exit;

$domains = Param('domains') ? json_decode(Request('domains')) : array();
$type = Param('type');

if (is_array($domains) == true && count($domains) > 0) {
	if ($type == 'delete') {
		$this->db()->delete($this->table->server)->where('domain',$domains,'IN')->execute();
	}
}

$results->success = true;
?>