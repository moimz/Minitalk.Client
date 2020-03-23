<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널 정보를 불러온다.
 * 
 * @file /process/@getChannel.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 3. 23.
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
$data->use_userlist = $data->userlist_level_limit > -1;
$data->userlist_level_limit = $data->userlist_level_limit == -1 ? 0 : $data->userlist_level_limit;
$data->use_box = $data->box_level_limit > -1;
$data->box_level_limit = $data->box_level_limit == -1 ? 1 : $data->box_level_limit;

$results->success = true;
$results->data = $data;
?>