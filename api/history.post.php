<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 대화기록을 저장한다.
 * 
 * @file /api/history.post.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.2
 * @modified 2021. 8. 30.
 */
if (defined('__MINITALK__') == false) exit;

$history = Request('history') ? json_decode(Request('history')) : null;

if ($secret_key == null || $secret_key != $_CONFIGS->key || $history == null || count($history) == 0) {
	$data->success = false;
	$data->message = 'MISSING PARAMTERS : SECRET_KEY OR HISTORY';
	return;
}

foreach ($history as $message) {
	if ($message->deleted == true) {
		$this->db()->delete($this->table->history)->where('id',$message->id)->execute();
	} elseif ($message->edited == true && isset($message->room) == false) {
		$this->db()->update($this->table->history,array('message'=>$message->message,'data'=>json_encode($message->data),'edited'=>'TRUE'))->where('id',$message->id)->execute();
	} else {
		$insert = (array)$message;
		unset($insert['client_id']);
		unset($insert['deleted']);
		
		$insert['user'] = json_encode($message->user,JSON_UNESCAPED_UNICODE);
		$insert['to'] = json_encode($message->to,JSON_UNESCAPED_UNICODE);
		$insert['nickname'] = $message->user->nickname;
		$insert['data'] = json_encode($message->data);
		$insert['edited'] = $message->edited == true ? 'TRUE' : 'FALSE';
		
		$this->db()->replace($this->table->history,$insert)->execute();
	}
}

$data->success = true;
?>