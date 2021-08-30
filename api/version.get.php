<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트의 버전을 반환한다.
 * 
 * @file /api/version.get.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.2
 * @modified 2021. 8. 30.
 */
if (defined('__MINITALK__') == false) exit;

$data->success = true;
$data->version = __MINITALK_VERSION__;
?>