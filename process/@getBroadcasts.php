<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 브로드캐스트 전송기록을 불러온다.
 * 
 * @file /process/@getBroadcasts.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @modified 2021. 10. 5.
 */
if (defined('__MINITALK__') == false) exit;

$keyword = Request('keyword');
$start = Request('start');
$limit = Request('limit');
$sort = Request('sort');
$dir = Request('dir');

$lists = $this->db()->select($this->table->broadcast);
if ($keyword) $lists->where('message','%'.$keyword.'%','LIKE');
$total = $lists->copy()->count();
$lists = $lists->limit($start,$limit)->orderBy($sort,$dir)->get();
for ($i=0, $loop=count($lists);$i<$loop;$i++) {
	if ($lists[$i]->type == 'MESSAGE') {
		$lists[$i]->message = json_decode($lists[$i]->message);
	}
}

$results->success = true;
$results->lists = $lists;
$results->total = $total;
?>