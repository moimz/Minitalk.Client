<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채널을 개설한다.
 * 
 * @file /api/channel.post.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.1.0
 * @modified 2021. 4. 15.
 */
if (defined('__MINITALK__') == false) exit;

$key = isset($headers['SECRET_KEY']) == true ? $headers['SECRET_KEY'] : null;
if ($key == null || $key != $_CONFIGS->key) {
	$data->success = false;
	$data->message = 'INVALID_SECRET_KEY';
	return;
}

$errors = array();
$channel = Request('channel') ? Request('channel') : null;
$category1 = Request('category1') ? Request('category1') : 0;
$category2 = Request('category2') ? Request('category2') : 0;
$title = Param('title');
$max_user = Request('max_user') ? Request('max_user') : 2000;
$allow_nickname_edit = Request('allow_nickname_edit') && in_array(Request('allow_nickname_edit'),array('TRUE','FALSE')) == true ? Request('allow_nickname_edit') : 'TRUE';
$send_limit = Request('send_limit') && is_numeric(Request('send_limit')) == true ? Request('send_limit') : 0;
$file_limit = Request('file_limit') && is_numeric(Request('file_limit')) == true ? Request('file_limit') : 0;
$file_maxsize = Request('file_maxsize') ? Request('file_maxsize') : 0;
$file_lifetime = Request('file_lifetime') ? Request('file_lifetime') : 0;
$font_limit = Request('font_limit') && is_numeric(Request('font_limit')) == true ? Request('font_limit') : 0;
$user_limit = Request('user_limit') && is_numeric(Request('user_limit')) == true ? Request('user_limit') : 0;
$box_limit = Request('box_limit') && is_numeric(Request('box_limit')) == true ? Request('box_limit') : 0;
$use_history = Request('use_history') && in_array(Request('use_history'),array('TRUE','FALSE')) == true ? Request('use_history') : 'TRUE';
$password = Param('password');
$guest_name = Request('guest_name') ? Request('guest_name') : 'Guest';
$extras = Request('extras');

if ($category1 !== 0) {
	if (is_numeric($category1) == true) {
		$check = $this->db()->select($this->table->category)->where('idx',$category1)->where('parent',0)->getOne();
		if ($check == null) {
			$data->success = false;
			$data->message = 'NOT_FOUND_CATEGORY1';
			return;
		}
	} else {
		$check = $this->db()->select($this->table->category)->where('parent',0)->where('category',$category1)->getOne();
		if ($check == null) {
			$category1 = $this->db()->insert($this->table->category,array('parent'=>0,'category'=>$category1))->execute();
			if ($category1 === false) {
				$data->success = false;
				$data->message = 'CANNOT_CREATE_CATEGORY1';
				return;
			}
		} else {
			$category1 = $check->idx;
		}
	}
}

if ($category1 !== 0 && $category2 !== 0) {
	if (is_numeric($category2) == true) {
		$check = $this->db()->select($this->table->category)->where('idx',$category2)->where('parent',$category1)->getOne();
		if ($check == null) {
			$data->success = false;
			$data->message = 'NOT_FOUND_CATEGORY2';
			return;
		}
	} else {
		$check = $this->db()->select($this->table->category)->where('parent',$category1)->where('category',$category2)->getOne();
		if ($check == null) {
			$category2 = $this->db()->insert($this->table->category,array('parent'=>$category1,'category'=>$category2))->execute();
			if ($category2 === false) {
				$data->success = false;
				$data->message = 'CANNOT_CREATE_CATEGORY1';
				return;
			}
		} else {
			$category2 = $check->idx;
		}
	}
}

$insert = array();
$insert['category1'] = $category1;
$insert['category2'] = $category2;
$insert['title'] = $title;
$insert['max_user'] = $max_user;
$insert['allow_nickname_edit'] = $allow_nickname_edit;
$insert['send_limit'] = $send_limit;
$insert['file_limit'] = $file_limit;
$insert['file_maxsize'] = $file_maxsize;
$insert['file_lifetime'] = $file_lifetime;
$insert['font_limit'] = $font_limit;
$insert['user_limit'] = $user_limit;
$insert['box_limit'] = $box_limit;
$insert['use_history'] = $use_history;
$insert['password'] = $password;
$insert['guest_name'] = $guest_name;
$insert['extras'] = $extras;

if ($channel == null) {
	$this->db()->setLockMethod('WRITE')->lock($this->table->channel);
	while (true) {
		$channel = md5(time().rand(10000,99999));
		if ($this->db()->select($this->table->channel)->where('channel',$channel)->has() == false) {
			break;
		}
	}
	
	$insert['channel'] = $channel;
	
	$this->db()->insert($this->table->channel,$insert)->execute();
	$this->db()->unlock();
} else {
	$insert['channel'] = $channel;
	
	$this->db()->replace($this->table->channel,$insert)->execute();
}

if ($this->db()->getLastError() == null) {
	$data->success = true;
	$data->channel = $channel;
} else {
	$data->success = false;
	$data->message = $this->db()->getLastError();
}
?>