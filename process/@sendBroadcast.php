<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 브로드캐스트 메시지를 전송한다.
 * 
 * @file /process/@sendBroadcast.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.1.0
 * @modified 2021. 4. 15.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$type = Param('type');

if ($type == 'NOTICE') {
	$message = Request('message') ? Request('message') : $errors['message'] = $this->getErrorText('REQUIRED');
	$url = Request('url') ? Request('url') : '';
	
	if (count($errors) == 0) {
		$receiver = $this->sendBroadcast($message,$url);
		
		$insert = array();
		$insert['id'] = md5($nickname.time());
		$insert['type'] = 'NOTICE';
		$insert['message'] = $message;
		$insert['url'] = $url;
		$insert['receiver'] = $receiver;
		$insert['reg_date'] = time();
	
		$this->db()->replace($this->table->broadcast,$insert)->execute();
		
		$results->success = true;
	} else {
		$results->success = false;
		$results->errors = $errors;
	}
} else {
	$channel = Request('channel') ? Request('channel') : $errors['channel'] = $this->getErrorText('REQUIRED');
	$nickname = Request('nickname') ? Request('nickname') : $errors['nickname'] = $this->getErrorText('REQUIRED');
	$nickcon = Request('nickcon') ? Request('nickcon') : null;
	$photo = Request('photo') ? Request('photo') : null;
	$level = Request('level') ? Request('level') : 0;
	
	$message = Request('message') ? Request('message') : $errors['message'] = $this->getErrorText('REQUIRED');
	
	if (count($errors) == 0) {
		$api = $this->sendMessage($channel,'message',$message,array('nickname'=>$nickname,'nickcon'=>$nickcon,'photo'=>$photo,'level'=>$level,'extras'=>null),null);
		
		if ($api->success == true) {
			$insert = array();
			$insert['id'] = str_replace('-','',$api->message->id);
			$insert['channel'] = $channel;
			$insert['type'] = 'MESSAGE';
			$insert['message'] = json_encode($api->message,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
			$insert['url'] = '';
			$insert['reg_date'] = floor($api->message->time / 1000);
		
			$this->db()->replace($this->table->broadcast,$insert)->execute();
			
			$results->success = true;
		} else {
			$results->success = false;
			$results->message = $this->getErrorText('CONNECT_ERROR');
		}
	} else {
		$results->success = false;
		$results->errors = $errors;
	}
}
?>