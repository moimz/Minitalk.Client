<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 아이피 차단목록을 가져온다.
 * 
 * @file /process/@getBanIps.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.0
 * @modified 2021. 6. 3.
 */
if (defined('__MINITALK__') == false) exit;

$keyword = Request('keyword') ? Request('keyword') : '';
$start = Request('start');
$limit = Request('limit');
$sort = Request('sort');
$dir = Request('dir');

$lists = $this->db()->select($this->table->banip);
if ($keyword) $lists->where('(ip like ? or nickname like ?)',array('%'.$keyword.'%','%'.$keyword.'%'));
$total = $lists->copy()->count();
$lists = $lists->limit($start,$limit)->orderBy($sort,$dir)->get();
for ($i=0, $loop=count($lists);$i<$loop;$i++) {
	
}

$results->success = true;
$results->lists = $lists;
$results->total = $total;
?>