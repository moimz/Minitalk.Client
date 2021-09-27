<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 구성요소를 불러온다.
 * 
 * @file /process/@getComponents.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.3.0
 * @modified 2021. 9. 27.
 */
if (defined('__MINITALK__') == false) exit;

$lists = array();

// 미니톡 코어
$package = json_decode(file_get_contents(__MINITALK_PATH__.'/package.json'));
$item = new stdClass();
$item->type = '0';
$item->type_name = $this->getText('admin/resource/component/type/'.$item->type);
$item->icon = 'mi mi-minitalk';
$item->title = $package->title;
$item->description = '';
$item->id = $package->id;
$item->version = $package->version;
$item->author = 'Arzz';
$item->email = 'help@moimz.com';
$item->homepage = 'https://www.minitalk.io';
$item->path = __MINITALK_PATH__;

$lists[] = $item;

// 플러그인
foreach (GetDirectoryItems(__MINITALK_PATH__.'/plugins','directory') as $plugin) {
	if (is_file($plugin.'/package.json') == true) {
		$package = json_decode(file_get_contents($plugin.'/package.json'));
		
		$item = new stdClass();
		$item->type = '10';
		$item->type_name = $this->getText('admin/resource/component/type/'.$item->type);
		
		$item->icon = isset($package->icon) == true ? $package->icon : 'xi xi-plug';
		
		if (isset($package->title) == true) {
			$item->title = isset($package->title->{$this->getAdminLogged()->language}) == true ? $package->title->{$this->getAdminLogged()->language} : $package->title->{$package->language};
		} else {
			$item->title = 'Unknown';
		}
		
		if (isset($package->description) == true) {
			$item->description = isset($package->description->{$this->getAdminLogged()->language}) == true ? $package->description->{$this->getAdminLogged()->language} : $package->description->{$package->language};
		} else {
			$item->description = '';
		}
		
		$item->id = $package->id;
		$item->version = $package->version;
		
		if (isset($package->author) == true) {
			$item->author = $package->author->name;
			$item->email = isset($package->author->email) == true ? $package->author->email : '';
		}
		
		$item->homepage = isset($package->homepage) == true ? $package->homepage : '';
		$item->path = $plugin;
		
		$lists[] = $item;
	}
}

// 템플릿
foreach (GetDirectoryItems(__MINITALK_PATH__.'/templets','directory') as $templet) {
	if (is_file($templet.'/package.json') == true) {
		$package = json_decode(file_get_contents($templet.'/package.json'));
		
		$item = new stdClass();
		$item->type = '20';
		$item->type_name = $this->getText('admin/resource/component/type/'.$item->type);
		
		$item->icon = isset($package->icon) == true ? $package->icon : 'xi xi-color';
		
		if (isset($package->title) == true) {
			$item->title = isset($package->title->{$this->getAdminLogged()->language}) == true ? $package->title->{$this->getAdminLogged()->language} : $package->title->{$package->language};
		} else {
			$item->title = 'Unknown';
		}
		
		if (isset($package->description) == true) {
			$item->description = isset($package->description->{$this->getAdminLogged()->language}) == true ? $package->description->{$this->getAdminLogged()->language} : $package->description->{$package->language};
		} else {
			$item->description = '';
		}
		
		$item->id = $package->id;
		$item->version = $package->version;
		
		if (isset($package->author) == true) {
			$item->author = $package->author->name;
			$item->email = isset($package->author->email) == true ? $package->author->email : '';
		}
		
		$item->homepage = isset($package->homepage) == true ? $package->homepage : '';
		$item->path = $templet;
		
		$lists[] = $item;
	}
}

// 언어팩
foreach (GetDirectoryItems(__MINITALK_PATH__.'/languages','file') as $language) {
	if (is_file($language) == true) {
		$package = json_decode(file_get_contents($language));
		
		$item = new stdClass();
		$item->type = '30';
		$item->type_name = $this->getText('admin/resource/component/type/'.$item->type);
		$item->icon = 'xi xi-type';
		$item->title = $package->title;
		$item->version = $package->version;
		
		$item->id = 'com.moimz.minitalk.languages.'.substr(basename($language),0,2);
		
		if (isset($package->author) == true) {
			$item->author = $package->author->name;
			$item->email = isset($package->author->email) == true ? $package->author->email : '';
		}
		
		$item->path = $language;
		
		$lists[] = $item;
	}
}

// 이모티콘
foreach (GetDirectoryItems(__MINITALK_PATH__.'/emoticons','directory') as $emoticon) {
	if (is_file($emoticon.'/package.json') == true) {
		$package = json_decode(file_get_contents($emoticon.'/package.json'));
		
		$item = new stdClass();
		$item->type = '40';
		$item->type_name = $this->getText('admin/resource/component/type/'.$item->type);
		$item->icon = 'xi xi-smiley-face';
		$item->title = $package->title;
		$item->description = $package->width.'px * '.$package->height.'px, '.count(GetDirectoryItems($emoticon.'/items','file')).' emoticons';
		$item->version = '-';
		
		$item->id = 'com.moimz.minitalk.emoticons.'.basename($emoticon);
		
		if (isset($package->author) == true) {
			$item->author = $package->author->name;
			$item->email = isset($package->author->email) == true ? $package->author->email : '';
		}
		
		$item->path = $emoticon;
		
		$lists[] = $item;
	}
}

$results->success = true;
$results->lists = $lists;
$results->total = count($lists);
?>