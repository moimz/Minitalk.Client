<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 아이피 차단정보를 가져온다.
 * 
 * @file /process/@getBanIp.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.1
 * @modified 2021. 7. 7.
 */
if (defined('__MINITALK__') == false) exit;

$ip = Param('ip');
$data = $this->db()->select($this->table->banip)->where('ip',$ip)->getOne();

$data->oIp = $data->ip;

$results->success = true;
$results->data = $data;
?>