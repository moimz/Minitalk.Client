<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 위젯코드를 가져온다.
 * 
 * @file /process/@getWidgetCode.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.2.1
 * @modified 2021. 7. 7.
 */
if (defined('__MINITALK__') == false) exit;

$code = '';
$use_usercode = Request('use_usercode') ? true : false;
if ($use_usercode == true) {
	$functions = array(
		'<?php',
		'/**',
		' * 유저코드를 가져온다.',
		' *',
		' * @param string $nickname 닉네임(필수)',
		' * @param int $level 권한레벨 (1~9, 9 : 최고관리자 / 기본값 : 1)',
		' * @param string $nickcon 닉이미지 (옵션)',
		' * @param string $photo 프로필사진 (옵션)',
		' * @param any[] $extras 유저 추가정보 (옵션, key-value 배열만 가능)',
		' * @return string $userCode 유저코드',
		' */',
		'function MinitalkUserCode($nickname,$level=1,$nickcon=null,$photo=null,$extras=array()) {',
		'	$user = array(',
		'		\'nickname\'=>$nickname,',
		'		\'level\'=>intval($level),',
		'		\'nickcon\'=>$nickcon ? $nickcon : null,',
		'		\'photo\'=>$photo ? $photo : null,',
		'		\'extras\'=>count($extras) > 0 ? $extras : null,',
		'		\'ip\'=>(isset($_SERVER[\'HTTP_X_FORWARDED_FOR\']) == true ? $_SERVER[\'HTTP_X_FORWARDED_FOR\'] : $_SERVER[\'REMOTE_ADDR\'])',
		'	);',
		'',
		'	// 유저코드를 암호화키로 암호화한다.',
		'	$value = json_encode($user,JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);',
		'	$key = \''.FileReadLine(__MINITALK_PATH__.'/configs/key.config.php',1).'\';',
		'	$usercode = openssl_encrypt($value,\'AES-256-CBC\',$key,OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING,str_repeat(chr(0),16));',
		'	return $usercode;',
		'}',
		'?>'
	);
	
	$code.= implode("\n",$functions)."\n";
}

$channel = Request('channel');
$templet = Request('templet');
$width = Request('width_unit') == 'px' ? Request('width') : '"'.Request('width').'%"';
$height = Request('height_unit') == 'px' ? Request('height') : '"'.Request('height').'%"';
$domain = isset($_SERVER['HTTPS']) == true ? 'https://' : 'http://';
$domain.= $_SERVER['HTTP_HOST'].__MINITALK_DIR__;

$widgets = array(
	'<script type="text/javascript" src="'.$domain.'/scripts/minitalk.js" charset="UTF-8"></script>',
	'<script type="text/javascript">',
	'new Minitalk({',
	'	id:"MinitalkExample",',
	'	channel:"'.$channel.'",',
	'	width:'.$width.',',
	'	height:'.$height.',',
);

if ($use_usercode == true) {
	$nickname = Request('nickname') ? Request('nickname') : 'null';
	$level = Request('level') ? Request('level') : '1';
	$nickcon = Request('nickcon') ? Request('nickcon') : 'null';
	$photo = Request('photo') ? Request('photo') : 'null';
	
	$widgets[] = '	templet:"'.$templet.'",';
	$widgets[] = '	usercode:"<?php echo MinitalkUserCode('.$nickname.','.$level.','.$nickcon.','.$photo.'); ?>"';
} else {
	$widgets[] = '	templet:"'.$templet.'"';
}

$widgets[] = '});';
$widgets[] = '</script>';

$code.= implode("\n",$widgets);

$results->success = true;
$results->code = $code;
?>