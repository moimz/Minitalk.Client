<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널 정보를 저장한다.
 * 
 * @file /process/@saveChannel.php
 * @license MIT License
 * @modified 2025. 2. 7.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$oChannel = Request('oChannel');
$category1 = Request('category1') ? Request('category1') : 0;
$category2 = Request('category2') ? Request('category2') : 0;
$channel = Request('channel') ? Request('channel') : $errors['channel'] = $this->getErrorText('REQUIRED');
$title = Request('title') ? Request('title') : $errors['title'] = $this->getErrorText('REQUIRED');
$password = Request('password') ? Request('password') : '';
$allow_nickname_edit = Request('allow_nickname_edit') ? 'TRUE' : 'FALSE';
$max_user = Request('max_user') && is_numeric(Request('max_user')) == true ? Request('max_user') : $errors['max_user'] = $this->getErrorText('REQUIRED');
$guest_name = Request('guest_name') ? Request('guest_name') : $errors['guest_name'] = $this->getErrorText('REQUIRED');
$send_limit = Request('send_limit') ? Request('send_limit') : 0;
$file_limit = Request('file_limit') ? Request('file_limit') : 0;
$file_maxsize = Request('file_maxsize') ? Request('file_maxsize') : 0;
$file_lifetime = Request('file_lifetime') ? Request('file_lifetime') : 0;
$font_limit = Request('font_limit') ? Request('font_limit') : 0;
$user_limit = Request('use_user_tab') ? (Request('user_limit') ? Request('user_limit') : 0) : -1;
$box_limit = Request('use_box_tab') ? Request('box_limit') : -1;
$use_history = Request('use_history') ? 'TRUE' : 'FALSE';

$check = $this->db()->select($this->table->channel)->where('channel',$channel);
if ($oChannel) $check->where('channel',$oChannel,'!=');
if ($check->has() == true) {
	$errors['channel'] = $this->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
	$insert = array();
	$insert['channel'] = $channel;
	$insert['category1'] = $category1;
	$insert['category2'] = $category2;
	$insert['title'] = $title;
	$insert['password'] = $password;
	$insert['allow_nickname_edit'] = $allow_nickname_edit;
	$insert['max_user'] = $max_user;
	$insert['guest_name'] = $guest_name;
	$insert['send_limit'] = $send_limit;
	$insert['file_limit'] = $file_limit;
	$insert['file_maxsize'] = $file_maxsize;
	$insert['file_lifetime'] = $file_lifetime;
	$insert['font_limit'] = $font_limit;
	$insert['user_limit'] = $user_limit;
	$insert['box_limit'] = $box_limit;
	$insert['use_history'] = $use_history;
	
	if ($oChannel) {
		$this->db()->update($this->table->channel,$insert)->where('channel',$oChannel)->execute();
	} else {
		$this->db()->insert($this->table->channel,$insert)->execute();
	}
	
	$results->success = true;
} else {
	$results->success = false;
	$results->errors = $errors;
}
?>