<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 캐시파일 목록을 불러온다.
 * 
 * @file /process/@getCaches.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.1
 * @modified 2021. 3. 25.
 */
if (defined('__MINITALK__') == false) exit;

$lists = array();

foreach (GetDirectoryItems($this->getAttachmentPath().'/temp','file') as $file) {
	if (preg_match('/\.cache$/',$file) == true) {
		$temp = explode('.',preg_replace('/\.cache$/','',$file));
		
		$item = new stdClass();
		$item->name = basename($file);
		$item->type = array_pop($temp);
		$item->language = array_shift($temp);
		$item->templet = array_shift($temp);
		$item->capacity = implode('.',$temp);
		$item->size = filesize($this->getAttachmentPath().'/temp/'.$file);
		$item->create_date = filectime($this->getAttachmentPath().'/temp/'.$file);
		$item->path = $this->getAttachmentPath().'/temp/'.$file;
		
		$lists[] = $item;
	}
}

$results->success = true;
$results->lists = $lists;
$results->total = count($lists);
?>