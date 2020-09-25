<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 대화기록을 불러온다.
 * 
 * @file /api/history.get.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 9. 16.
 */
if (defined('__MINITALK__') == false) exit;

$room = $idx;
if ($room == null) {
	$data->success = false;
	$data->message = 'NOT_FOUND_ROOM';
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

if ($token === null || $token->channel != $channel->channel || $token->ip != GetClientIp()) {
	$data->success = false;
	$data->message = 'FORBIDDEN';
	return;
}

$time = Request('time') ? Request('time') : time();

/**
 * 대화기록 테이블에 보관된 가장 최근, 가장 이전 시각을 가져온다.
 */
$edge = $this->db()->select($this->table->history,'MIN(time) as oldest, MAX(time) as latest')->where('room',$room)->getOne();
$oldest = $edge->oldest ? $edge->oldest : 0;
$latest = $edge->latest ? $edge->latest : 0;

$history = array();
$server = $this->getServer($channel->server);
/**
 * 할당된 서버가 없는 경우
 */
if ($server == null) {
	$data->success = false;
	$data->message = 'NOT_FOUND_SERVER';
	return;
}

/**
 * 채널이 사용하고 있는 서버가 단독서버인 경우
 */
if ($server->type == 'SERVER') {
	/**
	 * 가져올 대화기록이 대화기록 테이블에 보관중이라면, 가져오고, 그렇지 않다면 채팅서버에 요청한다.
	 * @todo
	 */
}

/**
 * 채널이 사용하고 있는 서버가 호스팅서버인 경우
 */
if ($server->type == 'SERVICE') {
	$connection = $server->connection ? $server->connection->connection : '';
	$api = $this->callServiceApi('GET','history/'.$server->domain.'/'.$room,array('time'=>$time),array('MINITALK_CLIENT_SECRET'=>$server->client_secret,'MINITALK_CONNECTION'=>$connection));
	if ($api->success == true) {
		$history = $api->history;
	}
}

$data->success = true;
$data->history = $history;
?>