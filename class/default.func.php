<?php
function MiniTalkEncoder($value,$key='') {
	$key = $key ? $key : $_ENV['key'];
	$padSize = 16 - (strlen($value) % 16);
	$value = $value.str_repeat(chr($padSize),$padSize);
	$output = mcrypt_encrypt(MCRYPT_RIJNDAEL_128,$key,$value,MCRYPT_MODE_CBC,str_repeat(chr(0),16));
	return base64_encode($output);
}

function MiniTalkDecoder($value,$key='') {
	$key = $key ? $key : $_ENV['key'];
	$value = base64_decode($value);
	$output = mcrypt_decrypt(MCRYPT_RIJNDAEL_128,$key,$value,MCRYPT_MODE_CBC,str_repeat(chr(0),16));
	$valueLen = strlen($output);
	if ($valueLen % 16 > 0) $output = '';

	$padSize = ord($output{$valueLen - 1});
	if (($padSize < 1) || ($padSize > 16)) $output = '';

	for ($i=0;$i<$padSize;$i++) {
		if (ord($output{$valueLen - $i - 1}) != $padSize) $output = '';
	}
	
	return substr($output,0,$valueLen-$padSize);
}

function Alertbox($msg,$code=0,$redirect=null,$target=null) {
	echo '<!DOCTYPE html>'."\n";
	echo '<html>'."\n";
	echo '<head>'."\n";
	echo '<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />'."\n";
	echo '</head>'."\n";
	echo '<body>'."\n";
	
	if ($redirect) {
		$goUrl = $redirect;
		$goTarget = $target!=null ? $target.'.' : '';
	} else {
		$goUrl = '';
		$goTarget = '';
	}

	$print = '<script type="text/javascript">';
	if (is_array($redirect)==true) {
		$print.= 'if (confirm("'.$msg.'")==true) {';
		$print.= $goTarget.'location.href = "'.$redirect[0].'";';
		$print.= '} else {';
		$print.= $goTarget.'location.href = "'.$redirect[1].'";';
		$print.= '}';
	} else {
		if ($msg) $print.= 'alert("'.$msg.'");';
		switch ($code) {
			case 1 :
				$print.= ($target!=null ? $target.'.' : '').'history.go(-1);';
			break;

			case 2 :
				$print.= ($target!=null ? $target.'.' : '').'window.close();';
			break;

			case 3 :
				$print.= $goUrl!='reload' ? $goTarget.'location.href = "'.$goUrl.'";' : $goTarget.'location.href = '.$goTarget.'location.href;';
			break;

			case 5 :
				$print.= $goTarget.$goUrl;
			break;
			
			case 6 :
				$print.= ($target!=null ? $target.'.' : '').'opener.location.href = '.($target!=null ? $target.'.' : '').'opener.location.href;';
				$print.= ($target!=null ? $target.'.' : '').'window.close();';
			break;
		}
	}
	$print.= 'try { top.FormSubmitWaiting(false); } catch(e) {};';
	$print.= '</script>';

	echo $print;

	if ($code != 4) {
		echo '</body></html>';
		exit;
	}
}

function Redirect($url,$target='') {
	echo '<!DOCTYPE html>'."\n";
	echo '<html>'."\n";
	echo '<head>'."\n";
	echo '<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />'."\n";
	echo '</head>'."\n";
	echo '<body>'."\n";
	
	$target = $target ? $target.'.' : '';
	echo '<script type="text/javascript">';
	if ($url == 'reload') {
		echo $target.'location.href = '.$target.'location.href;';
	} else {
		echo $target.'location.href = "'.$url.'";';
	}
	echo '</script>';
	
	echo '</body></html>';
	exit;
}

function GetMiniTalkAPI($data) {
	$curlsession = curl_init();
	curl_setopt($curlsession,CURLOPT_URL,'http://api.minitalk.kr/');
	curl_setopt($curlsession,CURLOPT_POST,1);
	curl_setopt($curlsession,CURLOPT_POSTFIELDS,array('d'=>json_encode($data)));
	curl_setopt($curlsession,CURLOPT_TIMEOUT,10);
	curl_setopt($curlsession,CURLOPT_RETURNTRANSFER,1);
	$buffer = curl_exec($curlsession);
	curl_close($curlsession);
	
//	echo $buffer;
	
	if ($buffer) return json_decode($buffer,true);
	else return array('result'=>false);
}

function GetOpperCode($opper) {
	$value = json_encode(array('opper'=>$opper,'ip'=>$_SERVER['REMOTE_ADDR']));
	return urlencode(MiniTalkEncoder($value));
}

function GetOpper($oppercode) {
	$output = json_decode(MiniTalkDecoder(urldecode($oppercode)),true);
	
	if ($output['ip'] == $_SERVER['REMOTE_ADDR']) return $output['opper'];
	else return '';
}

function Request($var,$type='request') {
	global $_REQUEST, $_SESSION;

	switch ($type) {
		case 'request' :
			$value = isset($_REQUEST[$var])==true ? (is_array($_REQUEST[$var]) == true ? $_REQUEST[$var] : $_REQUEST[$var]) : null;
		break;

		case 'session' :
			$value = isset($_SESSION[$var])==true ? $_SESSION[$var] : null;
		break;

		case 'cookie' :
			$value = isset($_COOKIE[$var])==true ? $_COOKIE[$var] : null;
		break;
	}

	if (is_array($value) == false) {
		$value = trim($value);
	}

	return $value;
}

function GetUTF8($str) {
	$encording = mb_detect_encoding($str,'EUC-KR,UTF-8,ASCII,EUC-JP,AUTO');

	if ($encording=='UTF-8') {
		return $str;
	} else {
		$encording = isset($encording)==false || !$encording ? 'euc-kr' : $encording;
		return @iconv($encording,'UTF-8//IGNORE',$str);
	}
}

function LogConverter($log) {
	$log = GetBBCodeToHtml($log);
	$log = str_replace('{MinitalkDomain}','http://'.$_SERVER['HTTP_HOST'].$_ENV['dir'],$log);
	
	return $log;
}

function GetBBCodeToHtml($str) {
	$str = str_replace('[B]','<b>',$str);
	$str = str_replace('[/B]','</b>',$str);
	$str = str_replace('[U]','<u>',$str);
	$str = str_replace('[/U]','</u>',$str);
	$str = str_replace('[I]','<i>',$str);
	$str = str_replace('[/I]','</i>',$str);


	$str = preg_replace('/\[COLOR=([a-zA-Z0-9]{6})\]/','<span style="color:#$1;">',$str);
	$str = preg_replace('/\[EMO:(.*?)\]/','<img src="'.$_ENV['url'].'/emoticon/$1" style="vertical-align:middle;">',$str);
	$str = str_replace('[/COLOR]','</span>',$str);

	return $str;
}
?>