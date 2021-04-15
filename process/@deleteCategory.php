<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 카테고리를 삭제한다.
 * 
 * @file /process/@deleteCategory.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.3
 * @modified 2021. 4. 15.
 */
if (defined('__MINITALK__') == false) exit;

$idxes = Request('idxes') ? json_decode(Request('idxes')) : array();
if (is_array($idxes) == true && count($idxes) > 0) {
	$categories = $this->db()->select($this->table->category)->where('idx',$idxes,'IN')->get();
	foreach ($categories as $category) {
		if ($category->parent == 0) {
			$this->db()->delete($this->table->category)->where('parent',$category->idx)->execute();
			$this->db()->delete($this->table->channel)->where('category1',$category->idx)->execute();
		} else {
			$this->db()->delete($this->table->channel)->where('category2',$category->idx)->execute();
		}
	}
	$this->db()->delete($this->table->category)->where('idx',$idxes,'IN')->execute();
}

$results->success = true;
?>