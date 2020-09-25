<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버정보를 저장한다.
 * 
 * @file /process/@saveServer.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 3. 16.
 */
if (defined('__MINITALK__') == false) exit;

$insert = array();
$errors = array();
$domain = Request('domain');
$type = Request('type');
if ($type == 'SERVER') {
	$ip = Request('ip') ? Request('ip') : $errors['ip'] = $this->getErrorText('REQUIRED');
	$port = Request('port') ? Request('port') : $errors['port'] = $this->getErrorText('REQUIRED');
	$is_ssl = Request('is_ssl') ? true : false;
	
	$server = ($is_ssl == true ? 'https://' : 'http://').$ip.':'.$port;
	$check = $this->db()->select($this->table->server)->where('domain',$server);
	if ($domain) $check->where('domain',$domain,'!=');
	if ($check->has() == true) {
		$errors['ip'] = $this->getErrorText('DUPLICATED');
	}
	
	if (count($errors) == 0) {
		$insert['domain'] = $server;
		$insert['type'] = 'SERVER';
		$insert['client_secret'] = '';
	}
}

if ($type == 'SERVICE') {
	$client_id = Request('client_id') ? Request('client_id') : $errors['client_id'] = $this->getErrorText('REQUIRED');
	$client_secret = Request('client_secret') ? Request('client_secret') : $errors['client_secret'] = $this->getErrorText('REQUIRED');
	
	$check = $this->db()->select($this->table->server)->where('domain',$client_id);
	if ($domain) $check->where('domain',$domain,'!=');
	if ($check->has() == true) {
		$errors['client_id'] = $this->getErrorText('DUPLICATED');
	}
	
	if (count($errors) == 0) {
		$data = $this->callServiceApi('POST','service/'.$client_id,array(),array('MINITALK_CLIENT_SECRET'=>$client_secret));
		
		if ($data->success == false) {
			$results->success = false;
			$results->message = $this->getErrorText($data->message);
			return;
		}
	
		$insert['domain'] = $client_id;
		$insert['type'] = 'SERVICE';
		$insert['client_secret'] = $client_secret;
	}
}

if (count($errors) == 0) {
	if ($domain) {
		$this->db()->update($this->table->server,$insert)->where('domain',$domain)->execute();
	} else {
		$this->db()->insert($this->table->server,$insert)->execute();
	}
	
	$results->success = true;
} else {
	$results->success = false;
	$results->errors = $errors;
}
?>