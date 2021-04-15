<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버목록을 불러온다.
 * 
 * @file /process/@getServers.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.3
 * @modified 2021. 4. 15.
 */
if (defined('__MINITALK__') == false) exit;

$type = Request('type');
$this->updateServer(null,true);

$lists = $this->db()->select($this->table->server)->get();
for ($i=0, $loop=count($lists);$i<$loop;$i++) {
	if ($type != null && $lists[$i]->type != $type) continue;
	
	if ($lists[$i]->type == 'SERVER') {
		$lists[$i]->status_message = $this->getServerStatus($lists[$i]->domain);
		
		$lists[$i]->exp_date = 0;
		$lists[$i]->max_user = 0;
	} else {
		$service = $this->callServiceApi('GET','service/'.$lists[$i]->domain);
		
		if ($service->success == true) {
			$service = $service->service;
			$lists[$i]->status_message = $service->server == null ? $this->getErrorText('SERVICE_DISABLED') : $service->server->domain;
			$lists[$i]->max_user = $service->connection;
			$lists[$i]->exp_date = $service->exp_date;
		} else {
			$lists[$i]->status = 'OFFLINE';
			$lists[$i]->status_message = $this->getErrorText($service->message);
			$lists[$i]->exp_date = -1;
		}
	}
}

$results->success = true;
$results->lists = $lists;
$results->count = count($lists);
?>