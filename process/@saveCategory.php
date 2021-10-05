<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 카테고리 정보를 저장한다.
 * 
 * @file /process/@saveCategory.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @modified 2021. 10. 5.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$idx = Request('idx');
$parent = Request('parent') ? Request('parent') : 0;
$category = Request('category') ? Request('category') : $errors['category'] = $this->getErrorText('REQUIRED');

$check = $this->db()->select($this->table->category)->where('parent',$parent)->where('category',$category);
if ($idx) $check->where('idx',$idx,'!=');
if ($check->has() == true) {
	$errors['category'] = $this->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
	if ($idx) {
		$this->db()->update($this->table->category,array('category'=>$category))->where('idx',$idx)->execute();
	} else {
		$this->db()->insert($this->table->category,array('parent'=>$parent,'category'=>$category))->execute();
	}
	
	$results->success = true;
} else {
	$results->success = false;
	$results->errors = $errors;
}
?>