<!doctype html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<title>Minitalk6 Client Setup Source Example</title>
<style>
HTML, BODY {padding:10px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<body>

<!---------------------------------------------------------------------------------------------
 - 미니톡 소스 시작
 - 미니톡을 삽입하기 원하는 위치에 아래의 소스를 이용하여 미니톡을 삽입할 수 있습니다.
 - 이곳에 사용된 변수는 API문서 (http://www.minitalk.kr/document/api.arzz) 에 정의되어 있습니다.
 - 실제로 사용하기 위해서는 상대경로등을 고려하여 파일의 경로를 수정하여 사용하셔야 합니다.
 ---------------------------------------------------------------------------------------------->
<?php
$_MINITALK_KEY = '12345678123456781234567812345678'; // 미니톡 설치시 사용했던 32자리 KEY

function MiniTalkEncoder($value) {
	global $_MINITALK_KEY;
	
	$padSize = 16 - (strlen($value) % 16);
	$value = $value.str_repeat(chr($padSize),$padSize);
	$output = mcrypt_encrypt(MCRYPT_RIJNDAEL_128,$_MINITALK_KEY,$value,MCRYPT_MODE_CBC,str_repeat(chr(0),16));
	return base64_encode($output);
}

function MiniTalkDecoder($value) {
	global $_MINITALK_KEY;
	
	$value = base64_decode($value);
	$output = mcrypt_decrypt(MCRYPT_RIJNDAEL_128,$_MINITALK_KEY,$value,MCRYPT_MODE_CBC,str_repeat(chr(0),16));
	$valueLen = strlen($output);
	if ($valueLen % 16 > 0) $output = '';

	$padSize = ord($output{$valueLen - 1});
	if (($padSize < 1) || ($padSize > 16)) $output = '';

	for ($i=0;$i<$padSize;$i++) {
		if (ord($output{$valueLen - $i - 1}) != $padSize) $output = '';
	}
	
	return substr($output,0,$valueLen-$padSize);
}

function GetOpperCode($opper) {
	$value = json_encode(array('opper'=>$opper,'ip'=>$_SERVER['REMOTE_ADDR']));
	return urlencode(MiniTalkEncoder($value));
}
?>
<script type="text/javascript" src="http://www.yourdomain.com/MiniTalk6/script/minitalk.js" charset="UTF-8"></script>
<script type="text/javascript">
var m = new Minitalk({
	id:"minitalk",
	channel:"arzzcom",
	width:600,
	height:400,
	skin:"default",
	language:"ko",
	type:"auto",
	nickcon:"",
	nickname:"",
	info:{},
	opperCode:"<?php echo GetOpperCode('ADMIN'); ?>",
	fontSettingHide:false,
	viewAlert:true,
	viewAlertLimit:"MEMBER",
	plugin:"ALL"
});
</script>
<!---------------------------------------------------------------------------------------------
 - 미니톡 소스 끝
 ---------------------------------------------------------------------------------------------->
</body>
</html>