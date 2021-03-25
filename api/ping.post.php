<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버의 핑퐁메시지를 처리한다.
 * 
 * @file /api/ping.post.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.2
 * @modified 2021. 3. 25.
 */
if (defined('__MINITALK__') == false) exit;

$key = isset($headers['SECRET_KEY']) == true ? $headers['SECRET_KEY'] : null;
$domain = Request('domain');
$time = Request('time');

if (strlen($key) == 0 || $key != $_CONFIGS->key || strlen($domain) == 0) {
	$data->success = false;
	$data->message = 'MISSING PARAMTERS : SECRET_KEY OR DOMAIN';
	return;
}

$user = Request('user') ? Request('user') : 0;
$channel = Request('channel') ? Request('channel') : 0;
$this->db()->update($this->table->server,array('status'=>'ONLINE','user'=>$user,'channel'=>$channel,'latest_update'=>time()))->where('domain',$domain)->execute();

$users = Request('users') ? Request('users') : array();
foreach ($users as $room=>$user) {
	$temp = explode('#',$room);
	$channel = $temp[1];
	
	$this->db()->update($this->table->channel,array('user'=>$user))->where('channel',$channel)->execute();
}

$data->success = true;
$data->client = round(array_sum(explode(' ',microtime())) * 1000);
$data->server = $time;
$data->timegap = sprintf('%0.3f',abs($data->client - $data->server) / 1000);
?>