<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 API요청을 처리한다.
 * 
 * @file /api/index.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 9. 16.
 */
header('Cache-Control:no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control:post-check=0, pre-check=0', false);
header('Pragma:no-cache');
REQUIRE_ONCE str_replace(DIRECTORY_SEPARATOR.'api','',__DIR__).'/configs/init.config.php';

$MINITALK = new Minitalk();
$headers = getallheaders();

header('Access-Control-Allow-Origin:'.(isset($headers['Origin']) == true ? $headers['Origin'] : '*'));
header('Access-Control-Allow-Credentials:true');
header('Access-Control-Allow-Headers:Authorization');
header('Access-Control-Allow-Methods:*');

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