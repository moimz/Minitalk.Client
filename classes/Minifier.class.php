<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 자바스크립트 및 스타일시트 파일을 압축하기 위한 클래스를 정의한다.
 * 
 * @file /classes/Minifier.class.php
 * @license MIT License
 * @modified 2025. 2. 7.
 */
REQUIRE_ONCE __MINITALK_PATH__.'/classes/minify/src/Minify.php';
REQUIRE_ONCE __MINITALK_PATH__.'/classes/minify/src/CSS.php';
REQUIRE_ONCE __MINITALK_PATH__.'/classes/minify/src/JS.php';
REQUIRE_ONCE __MINITALK_PATH__.'/classes/minify/src/ConverterInterface.php';
REQUIRE_ONCE __MINITALK_PATH__.'/classes/minify/src/Converter.php';

use MatthiasMullie\Minify;
class Minifier {
	function __construct() {
	}
	
	/**
	 * 자바스크립트 클래스를 반환한다.
	 */
	function js() {
		return new Minify\JS();
	}
	
	/**
	 * 스타일시트 클래스를 반환한다.
	 */
	function css() {
		$minifire = new Minify\CSS();
		$minifire->setImportExtensions(array());
		return $minifire;
	}
}
?>