<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트가 설치되어 있는 경우 관리자페이지로, 설치되어 있지 않은 경우 설치페이지로 이동한다.
 *
 * @file /index.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @modified 2021. 10. 5.
 */
define('__IM_SITE__',true);

/**
 * 파일의 절대경로를 계산하여 init.confing.php 파일을 불러온다.
 *
 * @see /configs/init.config.php
 */
REQUIRE_ONCE __DIR__.'/configs/init.config.php';

if ($_CONFIGS->installed === true) {
	header("location:./admin");
} else {
	header("location:./install");
}
exit;
?>