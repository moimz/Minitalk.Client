<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 캐시파일 목록을 불러온다.
 * 
 * @file /process/@getCaches.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.0
 * @modified 2021. 6. 3.
 */
if (defined('__MINITALK__') == false) exit;

$lists = array();
foreach (GetDirectoryItems($this->getAttachmentPath().'/cache','file') as $file) {
	if (preg_match('/\.cache$/',$file) == true) {
		$temp = explode('.',preg_replace('/\.cache$/','',basename($file)));
		
		if ($temp[0] == 'core') {
			$item = new stdClass();
			$item->name = basename($file);
			$item->type = 'json';
			$item->checksum = null;
			$item->language = '';
			$item->templet = '';
			$item->capacity = 'client';
			$item->size = filesize($file);
			$item->create_date = filemtime($file);
			$item->path = $file;
			
			$lists[] = $item;
		} else {
			$item = new stdClass();
			$item->name = basename($file);
			$item->type = array_pop($temp);
			
			$item->checksum = array_pop($temp);
			$item->language = array_shift($temp);
			$item->templet = array_shift($temp);
			
			if (count($temp) == 0 || strlen($item->checksum) != 6) {
				unlink($file);
				continue;
			}
			
			$item->capacity = implode('.',$temp);
			$item->size = filesize($file);
			$item->create_date = filemtime($file);
			$item->path = $file;
			
			$lists[] = $item;
		}
	}
}

$results->success = true;
$results->lists = $lists;
$results->total = count($lists);
?>