<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 API요청을 처리한다.
 * 
 * @file /api/index.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.1.2
 * @modified 2021. 5. 28.
 */
header('Cache-Control:no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control:post-check=0, pre-check=0', false);
header('Pragma:no-cache');
REQUIRE_ONCE str_replace('/api','',str_replace(DIRECTORY_SEPARATOR,'/',__DIR__)).'/configs/init.config.php';

$MINITALK = new Minitalk();

header('Access-Control-Allow-Origin:*');
header('Access-Control-Allow-Credentials:true');
header('Access-Control-Allow-Headers:Authorization');
header('Access-Control-Allow-Methods:*');
header('Access-Control-Allow-Headers:*');

$protocol = strtolower($_SERVER['REQUEST_METHOD']);
$results = new stdClass();

$api = Request('api');
$idx = Request('idx');

$params = $_REQUEST;
unset($_REQUEST['api']);
unset($_REQUEST['idx']);

$params = count($params) == 0 ? null : (object)$params;
$data = $MINITALK->getApi($protocol,$api,$idx,$params);

if ($data !== null && isset($data->success) == true) {
	$results = $data;
} else {
	$results->success = false;
	$results->message = $MINITALK->getErrorText('UNREGISTED_API_NAME');
}

header("Content-type: text/json; charset=utf-8",true);
exit(json_encode($results,JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
?>