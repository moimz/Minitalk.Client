<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 채널 정보를 저장한다.
 * 
 * @file /process/@saveChannel.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$oChannel = Request('oChannel');
$category1 = Request('category1') ? Request('category1') : 0;
$category2 = Request('category2') ? Request('category2') : 0;
$channel = Request('channel') ? Request('channel') : $errors['channel'] = $this->getErrorText('REQUIRED');
$title = Request('title') ? Request('title') : $errors['title'] = $this->getErrorText('REQUIRED');
$password = Request('password') ? Request('password') : '';
$max_user = Request('max_user') && is_numeric(Request('max_user')) == true ? Request('max_user') : $errors['max_user'] = $this->getErrorText('REQUIRED');
$is_nickname = Request('is_nickname') ? 'TRUE' : 'FALSE';
$is_broadcast = Request('is_broadcast') ? 'TRUE' : 'FALSE';
$grade_font = Request('grade_font') ? Request('grade_font') : 'ALL';
$grade_chat = Request('grade_chat') ? Request('grade_chat') : 'ALL';
$notice = Request('notice') ? Request('notice') : '';

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
	$insert['max_user'] = $max_user;
	$insert['grade_font'] = $grade_font;
	$insert['grade_chat'] = $grade_chat;
	$insert['notice'] = $notice;
	
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