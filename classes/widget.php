<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯을 사용하기 위한 필수함수들을 정의한다.
 * 미니톡 클라이언트 클래스를 이용하지 않고, 이 파일에 정의된 함수만을 이용하여 미니톡 채팅위젯을 사용할 수 있다.
 * 
 * @file /classes/widget.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (defined('__MINITALK_PATH__') == false) define('__MINITALK_PATH__',str_replace(DIRECTORY_SEPARATOR.'classes','',__DIR__));
if (defined('__MINITALK_DIR__') == false) define('__MINITALK_DIR__',str_replace($_SERVER['DOCUMENT_ROOT'],'',__MINITALK_PATH__));

/**
 * 파일에서 특정라인을 읽어온다.
 *
 * @param string $path 읽어올 파일 경로
 * @param string $line 읽어올 라인
 * @return string $text
 */
function MinitalkFileReadLine($path,$line) {
	if (is_file($path) == true) {
		$file = @file($path);
		if (isset($file[$line]) == false) throw new Exception('Line Overflow : '.$path.'(Line '.$line.')');
		return trim($file[$line]);
	} else {
		throw new Exception('Not Found : '.$path);
		return '';
	}
}

/**
 * 미니톡 클라이언트 환경설정값을 저장한다.
 * Minitalk.presets.php 파일에 선언된 환경설정값을 우선시하고, 해당 파일에 선언되어 있지 않은 환경설정은 미니톡 클라이언트 설치시 입력된 정보를 저장한다.
 *
 * @see Minitalk.preset.php.example
 */
$_MINITALK = new stdClass();
$_MINITALK->presets = new stdClass();
$_MINITALK->presets->key = false;

if (is_file(__MINITALK_PATH__.'/Minitalk.preset.php') == true) {
	REQUIRE_ONCE __MINITALK_PATH__.'/Minitalk.preset.php';
	
	if (isset($_MINITALK->key) == true) $_MINITALK->presets->key = true;
}

try {
	$_MINITALK->key = isset($_MINITALK->key) == true ? $_MINITALK->key : MinitalkFileReadLine(__MINITALK_PATH__.'/configs/key.config.php',1);
} catch (Exception $e) {
	$_MINITALK->key = null;
}

/**
 * 복호화가 가능한 방식(AES-256-CBC)으로 문자열을 암호화한다.
 *
 * @param string $value 암호화할 문자열
 * @param string $key 암호화키 (없을경우 설치시 사용한 기본 암호화키)
 * @param string $mode 암호화된 문자열 인코딩방식 (base64 또는 hex)
 * @return string $ciphertext
 */
function MinitalkEncoder($value,$key=null,$mode='base64') {
	global $_MINITALK;
	
	$key = $key !== null ? md5($key) : md5($_MINITALK->key);
	$padSize = 16 - (strlen($value) % 16);
	$value = $value.str_repeat(chr($padSize),$padSize);
	
	$output = openssl_encrypt($value,'AES-256-CBC',$key,OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,str_repeat(chr(0),16));
	
	return $mode == 'base64' ? base64_encode($output) : bin2hex($output);
}

/**
 * 복호화가 가능한 방식(AES-256-CBC)으로 암호화된 문자열을 복호화한다.
 *
 * @param string $value 암호화된 문자열
 * @param string $key 암호화키 (없을경우 설치시 사용한 기본 암호화키)
 * @param string $mode 암호화된 문자열 인코딩방식 (base64 또는 hex)
 * @return string $plaintext
 */
function MinitalkDecoder($value,$key=null,$mode='base64') {
	global $_MINITALK;
	
	$key = $key !== null ? md5($key) : md5($_MINITALK->key);
	$value = $mode == 'base64' ? base64_decode(str_replace(' ','+',$value)) : hex2bin($value);
	
	$output = openssl_decrypt($value,'AES-256-CBC',$key,OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,str_repeat(chr(0),16));
	if ($output === false) return false;
	
	$valueLen = strlen($output);
	if ($valueLen % 16 > 0) return false;

	$padSize = ord($output[$valueLen - 1]);
	if (($padSize < 1) || ($padSize > 16)) return false;

	for ($i=0;$i<$padSize;$i++) {
		if (ord($output[$valueLen - $i - 1]) != $padSize) return false;
	}
	
	return substr($output,0,$valueLen-$padSize);
}

/**
 * 유저 권한코드를 생성한다.
 *
 * @param string $opper 권한코드 (ADMIN | POWERUSER | MEMBER)
 */
function MinitalkOpperCode($opper) {
	$value = json_encode(array('opper'=>$opper,'ip'=>$_SERVER['REMOTE_ADDR']));
	return MinitalkEncoder($value);
}
?>