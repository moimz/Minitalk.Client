<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널 정보를 불러온다.
 * 
 * @file /process/@getChannel.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.1
 * @modified 2021. 7. 7.
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
$data->allow_nickname_edit = $data->allow_nickname_edit == 'TRUE';
$data->use_user_tab = $data->user_limit > -1;
$data->user_limit = $data->user_limit == -1 ? 0 : $data->user_limit;
$data->use_box_tab = $data->box_limit > -1;
$data->box_limit = $data->box_limit == -1 ? 1 : $data->box_limit;

$results->success = true;
$results->data = $data;
?>