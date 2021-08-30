<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 대화로그를 가져온다.
 * 
 * @file /api/log.get.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.2
 * @modified 2021. 8. 30.
 */
if (defined('__MINITALK__') == false) exit;

$room = $idx;
if ($room == null) {
	$data->success = false;
	$data->message = 'NOT_FOUND_ROOM';
	return;
}

if ($secret_key == null || $secret_key != $_CONFIGS->key) {
	$data->success = false;
	$data->message = 'MISSING PARAMTERS : SECRET_KEY';
	return;
}

/**
 * 박스인경우 박스가 개설된 채널을 구한다.
 */
if (strpos($room,'@') !== false) {
	list($channel,$box) = explode('@',$room);
	
	$channel = $this->getChannel($channel);
} else {
	$channel = $this->getChannel($room);
	$box = null;
}

if ($channel == null) {
	$data->success = false;
	$data->message = 'NOT_FOUND_CHANNEL';
	return;
}

$start_time = Request('start_time') && is_numeric(Request('start_time')) == true ? Request('start_time') * 1000 : 0;
$end_time = Request('end_time') && is_numeric(Request('end_time')) == true ? Request('end_time') * 1000 : 0;
$count = Request('count') ? Request('count') : 100;

$messages = $this->db()->select($this->table->history)->where('room',$room);
if ($start_time) $messages->where('time',$start_time,'>=');
if ($end_time) $messages->where('time',$end_time,'<');
$messages = $messages->limit(0,$count)->orderBy('time','asc')->get();

for ($i=0, $loop=count($messages);$i<$loop;$i++) {
	$messages[$i]->user = json_decode($messages[$i]->user);
	$messages[$i]->data = json_decode($messages[$i]->data);
	$messages[$i]->to = json_decode($messages[$i]->to);
	$messages[$i]->time = $messages[$i]->time / 1000;
}

$data->success = true;
$data->messages = $messages;
?>