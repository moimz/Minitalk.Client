<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 첨부된 파일목록을 가져온다.
 * 
 * @file /process/@getAttachments.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.1.2
 * @modified 2021. 5. 28.
 */
if (defined('__MINITALK__') == false) exit;

$channel = Request('channel');
$keyword = Request('keyword');
$start = Request('start');
$limit = Request('limit');
$sort = Request('sort');
$dir = Request('dir');

$lists = $this->db()->select($this->table->attachment);
if ($keyword) $lists->where('(name like ? or nickname like ?)',array('%'.$keyword.'%','%'.$keyword.'%'));
$total = $lists->copy()->count();
$lists = $lists->limit($start,$limit)->orderBy($sort,$dir)->get();
for ($i=0, $loop=count($lists);$i<$loop;$i++) {
	$lists[$i]->icon = is_file(__MINITALK_PATH__.'/images/file/'.$lists[$i]->type.'.png') == true ? __MINITALK_DIR__.'/images/file/'.$lists[$i]->type.'.png' : __MINITALK_DIR__.'/images/file/etc.png';
	$lists[$i]->download = $this->getClientProcessUrl('attachment',true).'/download/'.$lists[$i]->hash.'/'.$lists[$i]->name;
}

$results->success = true;
$results->lists = $lists;
$results->total = $total;
?>