<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 차단IP 정보를 저장한다.
 * 
 * @file /process/@saveBanIp.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.1.2
 * @modified 2021. 5. 28.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$oIp = Request('oIp');
$ip = Request('ip') ? Request('ip') : $errors['ip'] = $this->getErrorText('REQUIRED');
$nickname = Request('nickname') ? Request('nickname') : '';
$memo = Request('memo') ? Request('memo') : '';

$check = $this->db()->select($this->table->banip)->where('ip',$ip);
if ($oIp) $check->where('ip',$oIp,'!=');
if ($check->has() == true) {
	$errors['ip'] = $this->getErrorText('DUPLICATED');
}

if (count($errors) == 0) {
	$insert = array();
	$insert['ip'] = $ip;
	$insert['nickname'] = $nickname;
	$insert['memo'] = $memo;
	$insert['reg_date'] = time();
	
	if ($oIp) {
		$this->db()->update($this->table->banip,$insert)->where('ip',$oIp)->execute();
	} else {
		$this->db()->insert($this->table->banip,$insert)->execute();
	}
	
	$results->success = true;
} else {
	$results->success = false;
	$results->errors = $errors;
}
?>