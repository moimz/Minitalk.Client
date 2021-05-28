<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자 로그아웃을 처리한다.
 * 
 * @file /process/login.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.5
 * @modified 2021. 5. 28.
 */
if (defined('__MINITALK__') == false) exit;

unset($_SESSION['MINITALK_LOGGED']);
$results->success = true;
?>