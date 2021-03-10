<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 카테고리 정보를 불러온다.
 * 
 * @file /process/@getCategory.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.1
 * @modified 2021. 3. 10.
 */
if (defined('__MINITALK__') == false) exit;

$idx = Request('idx');
$data = $this->db()->select($this->table->category)->where('idx',$idx)->getOne();
if ($data == null) {
	$results->success = false;
	$results->message = $this->getErrorText('NOT_FOUND');
	return;
}

$results->success = true;
$results->data = $data;
?>