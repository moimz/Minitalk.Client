<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 대화기록을 가져온다.
 * 
 * @file /process/@getHistory.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$date = Param('date');
$channel = Request('channel');
$nickname = Request('nickname');
$keyword = Request('keyword');

$start = Request('start');
$limit = Request('limit');

$time = strtotime($date);
$start_time = $time * 1000;
$end_time = mktime(24,0,0,date('m',$time),date('t',$time),date('Y',$time)) * 1000;
$history = $this->db()->select($this->table->history)->where('time',$start_time,'>=')->where('time',$end_time,'<');

if ($channel) $history->where('room',$channel);
if ($nickname) $history->where('(nickname LIKE ? or ip LIKE ?)',array('%'.$nickname.'%','%'.$nickname.'%'));
if ($keyword) $history->where('message','%'.$keyword.'%','LIKE');

$total = $history->copy()->count();
$history = $history->limit($start,$limit)->orderBy('time','asc')->get();
for ($i=0, $loop=count($history);$i<$loop;$i++) {
	$history[$i]->user = json_decode($history[$i]->user);
	$history[$i]->data = json_decode($history[$i]->data);
}
$results->success = true;
$results->lists = $history;
$results->total = $total;
?>