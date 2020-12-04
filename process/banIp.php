<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 아이피를 차단한다.
 * 
 * @file /process/banIp.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$ip = Param('ip') ? json_decode(Decoder(Param('ip'))) : null;
if ($ip !== null) {
	$this->db()->replace($this->table->banip,array('ip'=>$ip->ip,'nickname'=>$ip->to,'memo'=>'From '.$ip->from,'reg_date'=>time()))->execute();
}

$results->success = true;
?>