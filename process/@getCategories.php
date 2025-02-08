<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 카테고리 목록을 불러온다.
 * 
 * @file /process/@getCategories.php
 * @license MIT License
 * @modified 2025. 2. 7.
 */
if (defined('__MINITALK__') == false) exit;

$parent = Request('parent') ? Request('parent') : 0;
$is_all = Request('is_all') == 'true';
$is_none = Request('is_none') == 'true';
$lists = $this->db()->select($this->table->category)->where('parent',$parent)->orderBy('category','asc')->get();
for ($i=0, $loop=count($lists);$i<$loop;$i++) {
	if ($is_all == false && $is_all == false) {
		if ($lists[$i]->parent == 0) {
			$lists[$i]->children = $this->db()->select($this->table->category)->where('parent',$lists[$i]->idx)->count();
			
			$status = $this->db()->select($this->table->channel,'count(channel) as channel, SUM(user) as user')->where('category1',$lists[$i]->idx)->getOne();
		} else {
			$status = $this->db()->select($this->table->channel,'count(channel) as channel, SUM(user) as user')->where('category2',$lists[$i]->idx)->getOne();
		}
	
		$lists[$i]->channel = $status != null && isset($status->channel) == true ? $status->channel : 0;
		$lists[$i]->user = $status != null && isset($status->user) == true ? $status->user : 0;
	}
	
	$lists[$i]->sort = $i;
}

if ($is_all == true) {
	$lists[] = array('idx'=>'','category'=>$this->getText('admin/channel/category/category'.($parent == 0 ? '1' : '2')),'sort'=>-1);
}

if ($is_none == true) {
	$lists[] = array('idx'=>0,'category'=>$this->getText('admin/unselected'),'sort'=>-1);
}

$results->success = true;
$results->lists = $lists;
$results->total = count($lists);
?>