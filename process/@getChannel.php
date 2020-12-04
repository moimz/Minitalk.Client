<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널 정보를 불러온다.
 * 
 * @file /process/@getChannel.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$channel = Request('channel');
$data = $this->db()->select($this->table->channel)->where('channel',$channel)->getOne();
if ($data == null) {
	$results->success = false;
	$results->message = $this->getErrorText('NOT_FOUND');
	return;
}

$data->oChannel = $channel;
$data->is_nickname = $data->is_nickname == 'TRUE';
$data->is_broadcast = $data->is_broadcast == 'TRUE';

$results->success = true;
$results->data = $data;
?>