<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 대화기록을 저장한다.
 * 
 * @file /api/history.post.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2021. 1. 24.
 */
if (defined('__MINITALK__') == false) exit;

$key = isset($headers['SECRET_KEY']) == true ? $headers['SECRET_KEY'] : null;
$history = Request('history') ? json_decode(Request('history')) : null;

if (strlen($key) == 0 || $key != $_CONFIGS->key|| $history == null || count($history) == 0) {
	$data->success = false;
	$data->message = 'MISSING PARAMTERS : SECRET_KEY OR HISTORY';
	return;
}

foreach ($history as $message) {
	$insert = (array)$message;
	unset($insert['client_id']);
	
	$insert['user'] = json_encode($message->user,JSON_UNESCAPED_UNICODE);
	$insert['to'] = json_encode($message->to,JSON_UNESCAPED_UNICODE);
	$insert['nickname'] = $message->user->nickname;
	$insert['data'] = json_encode($message->data);
	
	$this->db()->replace($this->table->history,$insert)->execute();
}

$data->success = true;
?>