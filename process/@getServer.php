<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버정보를 불러온다.
 * 
 * @file /process/@getServer.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.1
 * @modified 2021. 7. 7.
 */
if (defined('__MINITALK__') == false) exit;

$domain = Request('domain');
$data = $this->db()->select($this->table->server)->where('domain',$domain)->getOne();
if ($data == null) {
	$results->success = false;
	$results->message = $this->getErrorText('NOT_FOUND');
} else {
	if ($data->type == 'SERVER') {
		$server = parse_url($data->domain);
		$data->ip = $server['host'];
		$data->port = $server['port'];
		$data->is_ssl = isset($server['scheme']) == 'https';
	} else {
		$data->client_id = $data->domain;
	}
	
	$results->success = true;
	$results->data = $data;
}
?>