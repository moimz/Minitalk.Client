<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자 로그인을 처리한다.
 * 
 * @file /process/login.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK__') == false) exit;

$errors = array();
$user_id = Request('user_id') ? Request('user_id') : $errors['user_id'] = $this->getErrorText('REQUIRED');
$password = Request('password') ? Request('password') : $errors['password'] = $this->getErrorText('REQUIRED');

if (count($errors) == 0) {
	$user_id = Request('user_id');
	$password = Request('password');
	
	$adminFile = explode("\n",file_get_contents($this->getPath().'/configs/admin.config.php'));
	$adminInfo = json_decode(Decoder($adminFile[1]));
	if ($adminInfo->user_id == $user_id && $adminInfo->password == $password) {
		$results->success = true;
		$loginString = Encoder(json_encode(array('ip'=>GetClientIp(),'time'=>time())));
		$_SESSION['MINITALK_LOGGED'] = $loginString;
		if (Request('auto_login') == 'TRUE') {
			setcookie('MINITALK_LOGGED',$loginString,time() + 86400 * 60,'/');
		}
	} else {
		$results->success= false;
	}
} else {
	$results->success = false;
	$results->errors = $errors;
}
?>