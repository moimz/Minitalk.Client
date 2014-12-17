<?php
$_ENV['debug'] = false;
REQUIRE_ONCE '../config/default.conf.php';

$mDB = &DB::instance();
$protocol = Request('protocol');
$protocol = json_decode($protocol,true);

$result = array();
if (is_array($protocol) == false) {
	$result['success'] = false;
	$result['errormsg'] = 'protocol 인수가 잘못전달되었습니다.';
} else {
	if (isset($protocol['category1']) == true && isset($protocol['channel']) == true && isset($protocol['title']) == true && isset($protocol['key']) == true) {
		$insert = array();
		$errors = array();
		if ($protocol['key'] != $_ENV['key']) $errors[] = '암호화키가 일치하지 않습니다.';
		
		// check channel
		if (preg_match('/^[a-z0-9]+$/',$protocol['channel']) == false || strlen($protocol['channel']) > 30) {
			$errors[] = '채널명은 30자 이내의 영문 및 숫자로만 이루어져야합니다.';
		} elseif ($mDB->DBcount('minitalk_channel_table',"where `channel`='{$protocol['channel']}'") > 0) {
			$errors[] = '이미 생성되어 있는 채널명입니다.';
		} else {
			$insert['channel'] = $protocol['channel'];
		}
		
		// check title
		$insert['title'] = $protocol['title'];
		
		// check category1
		if (strlen($protocol['category1']) == 0) $errors[] = '1차 카테고리의 값이 공백이어서는 안됩니다.';
		else $insert['category1'] = $protocol['category1'];
		
		// check category2
		$insert['category2'] = isset($protocol['category2']) == true ? $protocol['category2'] : '';
		
		// check is_broadcast
		if (isset($protocol['is_broadcast']) == true) {
			if (preg_match('/^(TRUE|FALSE)$/',$protocol['is_broadcast']) == false) {
				$errors[] = '브로드캐스트메세지 수신여부는 TRUE 또는 FALSE 값만 가능합니다.';
			} else {
				$insert['is_broadcast'] = $protocol['is_broadcast'];
			}
		} else {
			$insert['is_broadcast'] = 'TRUE';
		}
		
		// check is_nickname
		if (isset($protocol['is_nickname']) == true) {
			if (preg_match('/^(TRUE|FALSE)$/',$protocol['is_nickname']) == false) {
				$errors[] = '닉네임변경가능여부는 TRUE 또는 FALSE 값만 가능합니다.';
			} else {
				$insert['is_nickname'] = $protocol['is_nickname'];
			}
		} else {
			$insert['is_nickname'] = 'TRUE';
		}
		
		// check maxuser
		if (isset($protocol['maxuser']) == true) {
			if (preg_match('/^[1-9]{1}[0-9]*$/',$protocol['maxuser']) == false || intval($protocol['maxuser']) < 1 || intval($protocol['maxuser']) > 20000) {
				$errors[] = '채널최대참여인원은 1~20000 사이의 숫자만 가능합니다.';
			} else {
				$insert['maxuser'] = $protocol['maxuser'];
			}
		} else {
			$insert['maxuser'] = '1500';
		}
		
		// check notice
		$insert['notice'] = isset($protocol['notice']) == false ? '' : $protocol['notice'];
		
		if (sizeof($errors) == 0) {
			$result['success'] = true;
			
			// check category1
			$check = $mDB->DBfetch('minitalk_category_table',array('idx'),"where `parent`='0' and `category`='{$protocol['category1']}'");
			if (isset($check['idx']) == false) { // create category1
				$insert['category1'] = $mDB->DBinsert('minitalk_category_table',array('parent'=>'0','category'=>$protocol['category1']));
			} else {
				$insert['category1'] = $check['idx'];
			}
			
			// check category2
			if (isset($protocol['category2']) == true && strlen($protocol['category2']) > 0) {
				$check = $mDB->DBfetch('minitalk_category_table',array('idx'),"where `parent`='{$insert['category1']}' and `category`='{$protocol['category2']}'");
				if (isset($check['idx']) == false) { // create category1
					$insert['category2'] = $mDB->DBinsert('minitalk_category_table',array('parent'=>$insert['category1'],'category'=>$protocol['category2']));
				} else {
					$insert['category2'] = $check['idx'];
				}
			}
			
			$mDB->DBinsert('minitalk_channel_table',$insert);
		} else {
			$result['success'] = false;
			$result['errormsg'] = implode("\n",$errors);
		}
	} else {
		$result['success'] = false;
		$result['errormsg'] = 'protocol 정보중 필수정보 (1차카테고리, 채널명, 채널타이틀, 채널API키) 일부가 누락되었습니다.';
	}
}

exit(json_encode($result));
?>