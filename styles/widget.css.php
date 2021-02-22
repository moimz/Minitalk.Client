<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯에서 사용될 모든 스타일시트를 불러온다.
 * 
 * @file /scripts/widget.css.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2021. 1. 25.
 */
REQUIRE_ONCE str_replace('/styles/widget.css.php','',str_replace(DIRECTORY_SEPARATOR,'/',$_SERVER['SCRIPT_FILENAME'])).'/configs/init.config.php';
header("Content-Type:text/css; charset=utf-8");

$channel = isset($_GET['channel']) == true ? $_GET['channel'] : null;
$templet = isset($_GET['templet']) == true ? $_GET['templet'] : null;
$languages = GetDefaultLanguages();
foreach ($languages as $language) {
	if (is_file(__MINITALK_PATH__.'/languages/'.$language.'.json') == true) break;
}

$minifier = new Minifier();
$css = $minifier->css();

$css->add(__MINITALK_PATH__.'/styles/fonts/moimz.css');

/**
 * 언어별 기본 웹폰트를 불러온다.
 */
if ($language == 'ko') {
	$css->add(__MINITALK_PATH__.'/styles/fonts/NanumSquare.css');
	$css->add('html, body {font-family:NanumSquare;}');
}

$css->add(__MINITALK_PATH__.'/styles/widget.css');

if ($templet !== null && is_file(__MINITALK_PATH__.'/templets/'.$templet.'/style.css') == true) {
	$css->add(__MINITALK_PATH__.'/templets/'.$templet.'/style.css');
}

/**
 * 플러그인의 스타일시트를 불러온다.
 */
$pluginsPath = @opendir(__MINITALK_PATH__.'/plugins');
while ($pluginName = @readdir($pluginsPath)) {
	if ($pluginName != '.' && $pluginName != '..' && is_dir(__MINITALK_PATH__.'/plugins/'.$pluginName) == true && is_file(__MINITALK_PATH__.'/plugins/'.$pluginName.'/package.json') == true) {
		$package = json_decode(file_get_contents(__MINITALK_PATH__.'/plugins/'.$pluginName.'/package.json'));
		if (is_file(__MINITALK_PATH__.'/plugins/'.$pluginName.'/style.css') == true) {
			$css->add(__MINITALK_PATH__.'/plugins/'.$pluginName.'/style.css');
		}
	}
}
@closedir($pluginsPath);
?>
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯에서 사용될 모든 스타일시트를 불러온다.
 * 
 * @file /scripts/widget.css.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2021. 1. 25.
 */
<?php echo $css->minify(__MINITALK_PATH__.'/styles'); ?>