<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 차단IP를 삭제한다.
 * 
 * @file /process/@deleteBanIp.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.2
 * @modified 2021. 8. 30.
 */
if (defined('__MINITALK__') == false) exit;

$ips = Param('ips') ? json_decode(Request('ips')) : array();
if (is_array($ips) == true && count($ips) > 0) {
	$this->db()->delete($this->table->banip)->where('ip',$ips,'IN')->execute();
}

$results->success = true;
?>