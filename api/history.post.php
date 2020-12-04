<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 대화기록을 저장한다.
 * 
 * @file /api/history.post.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
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
	
	$insert['id'] = md5(json_encode($message->user).$message->time);
	$insert['user'] = json_encode($message->user,JSON_UNESCAPED_UNICODE);
	$insert['nickname'] = $message->user->nickname;
	
	$data->insert = $insert;
	
	$this->db()->replace($this->table->history,$insert)->execute();
}

$data->success = true;
?>