<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 브로드캐스트 메시지를 전송한다.
 * 
 * @file /process/@sendBroadcast.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 5.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$type = Request('type') ? Request('type') : $errors['type'] = $this->getErrorText('REQUIRED');
$message = Request('message') ? Request('message') : $errors['message'] = $this->getErrorText('REQUIRED');
$url = Request('url') ? Request('url') : '';
$nickname = Request('nickname') ? Request('nickname') : 'admin';

if (count($errors) == 0) {
	$receiver = 0;
	$servers = $this->db()->select($this->table->server)->where('type','SERVER')->get();
	foreach ($servers as $server) {
		$api = $this->callServerApi('POST',$server->domain,'broadcast/'.md5($server->domain),array('type'=>$type,'message'=>$message,'url'=>$url,'nickname'=>$nickname));
		if ($api->success == true) {
			$receiver+= $api->receiver;
		}
	}
	
	$insert = array();
	$insert['id'] = md5($nickname.time());
	$insert['type'] = $type;
	$insert['message'] = $message;
	$insert['url'] = $url;
	$insert['nickname'] = $nickname;
	$insert['receiver'] = $receiver;
	$insert['reg_date'] = time();
	
	$this->db()->replace($this->table->broadcast,$insert)->execute();
	
	$results->success = true;
	$results->receiver = $receiver;
} else {
	$results->success = false;
	$results->errors = $errors;
}
?>