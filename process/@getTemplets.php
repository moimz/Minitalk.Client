<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 템플릿 목록을 불러온다.
 * 
 * @file /process/@getTemplets.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.2
 * @modified 2021. 8. 30.
 */
if (defined('__MINITALK__') == false) exit;

$lists = array();

// 템플릿
foreach (GetDirectoryItems(__MINITALK_PATH__.'/templets','directory') as $templet) {
	if (is_file($templet.'/package.json') == true) {
		$package = json_decode(file_get_contents($templet.'/package.json'));
		
		$item = new stdClass();
		$item->title = isset($package->title->{$this->getAdminLogged()->language}) == true ? $package->title->{$this->getAdminLogged()->language} : $package->title->{$package->language};
		$item->templet = array_pop(explode('/',$templet));
		
		$lists[] = $item;
	}
}

$results->success = true;
$results->lists = $lists;
$results->total = count($lists);
?>