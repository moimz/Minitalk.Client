<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 브로드캐스트 전송기록을 삭제한다.
 * 
 * @file /process/@deleteBroadcast.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$ids = Param('ids') ? json_decode(Request('ids')) : array();
if (is_array($ids) == true && count($ids) > 0) {
	$this->db()->delete($this->table->broadcast)->where('id',$ids,'IN')->execute();
}

$results->success = true;
?>