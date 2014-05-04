<?php
$_ENV['path'] = str_replace('/config/default.conf.php','',__FILE__);
$_ENV['url'] = (isset($_SERVER['HTTPS']) == true && $_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://').$_SERVER['HTTP_HOST'].str_replace($_SERVER['DOCUMENT_ROOT'],'',$_ENV['path']);

if (file_exists($_ENV['path'].'/config/key.conf.php') == true) {
	$temp = explode("\n",file_get_contents($_ENV['path'].'/config/key.conf.php'));
	$_ENV['key'] = $temp[1];
} else {
	$_ENV['key'] = '';
}

session_start();

REQUIRE_ONCE $_ENV['path'].'/class/default.func.php';

function __autoload($class) {
	if (file_exists($_ENV['path'].'/class/'.$class.'.class.php') == true) REQUIRE_ONCE $_ENV['path'].'/class/'.$class.'.class.php';
}
?>