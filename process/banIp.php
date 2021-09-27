<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 아이피를 차단한다.
 * 
 * @file /process/banIp.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.3.0
 * @modified 2021. 9. 27.
 */
if (defined('__MINITALK__') == false) exit;

$bancode = Param('bancode') ? json_decode(Decoder(Param('bancode'))) : null;
if ($bancode !== null) {
	$this->db()->replace($this->table->banip,array('ip'=>$bancode->ip,'nickname'=>$bancode->to,'memo'=>'From '.$bancode->from,'reg_date'=>time()))->execute();
}

$results->success = true;
?>