<?php
header('Content-type: text/html; charset=utf-8',true);

$apiURL = '{$domain}api/channel.php';
$protocol = array();
$protocol['channel'] = '채널명'; // *필수* 채널명 (영문 및 숫자 30자 이내)
$protocol['category1'] = '1차카테고리명'; // *필수* 생성되어 있지 않은 카테고리일 경우 카테고리가 자동으로 생성됨
$protocol['category2'] = '2차카테고리명'; // *선택* 생성되어 있지 않은 카테고리일 경우 카테고리가 자동으로 생성됨
$protocol['title'] = '채널타이틀'; // *필수*
$protocol['is_broadcast'] = '브로드캐스트메세지 수신여부'; // *선택* (TRUE, FALSE 중 선택, 기본값은 TRUE) - TRUE : 수신함, FALSE : 수신안함
$protocol['is_nickname'] = '닉네임 변경가능여부'; // *선택* (TRUE, FALSE 중 선택, 기본값은 TRUE) - TRUE : 변경가능, FALSE : 변경불가능
$protocol['notice'] = '채널접속시 알림메세지'; // *선택*
$protocol['maxuser'] = '채널최대참여인원'; // *선택* 1~20000 사이의 숫자 (기본값은 1500)

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
	$result = json_decode($result,true);
	
	if ($result['success'] == true) {
		exit('채널을 생성하였습니다.');
	} else {
		exit('채널을 생성하지 못하였습니다.<br />에러메세지 : '.nl2br($result['errormsg']));
	}
}
?>