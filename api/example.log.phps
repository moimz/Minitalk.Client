<?php
header('Content-type: text/html; charset=utf-8',true);

$apiURL = '{$domain}/api/log.php';
$protocol = array();
$protocol['channel'] = '채널명'; // *필수* 채널명 (영문 및 숫자 30자 이내)
$protocol['type'] = '로그종류'; // *필수* (HTML, TEXT 중 선택) - HTML : HTML태그(글꼴색/이모티콘등 적용), TEXT : 순수텍스트만
$protocol['format'] = '로그포맷'; // *선택* ({time} : 시간, {nickname} : 닉네임, {message} : 메세지 키워드를 사용하여 포맷설정) - 기본값 : [{time}] {nickname} : {message}
$protocol['date_format'] = '날짜포맷'; // *선택* 날짜포맷 PHP기본변수 사용 - 기본값 : Y-m-d H:i:s
$protocol['start'] = '시작값'; // *선택* 디비에서 가져올 시작값 (숫자) - 설정하지 않을경우 처음부터 로드함
$protocol['limit'] = '가져올갯수'; // *선택* 디비에서 시작값부터 몇개를 가지고 올것인지 제한값 (숫자) - 설정하지 않을경우 끝까지 로드함

$curlsession = curl_init();
curl_setopt($curlsession,CURLOPT_URL,$apiURL);
curl_setopt($curlsession,CURLOPT_POST,true);
curl_setopt($curlsession,CURLOPT_POSTFIELDS,array('protocol'=>json_encode($protocol)));
curl_setopt($curlsession,CURLOPT_TIMEOUT,10);
curl_setopt($curlsession,CURLOPT_RETURNTRANSFER,1);

$result = curl_exec($curlsession);
$info = curl_getinfo($curlsession);
curl_close($curlsession);

if ($info['http_code'] != 200) {
	exit('미니톡 API서버에 연결할 수 없습니다. 잠시후 시도하여 주십시오.');
} else {
	exit(nl2br($result));
}
?>