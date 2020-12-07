<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯에서 사용되는 모든 자바스크립트를 불러온다.
 * 
 * @file /scripts/widget.js.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 6.
 */
REQUIRE_ONCE str_replace(DIRECTORY_SEPARATOR.'scripts'.DIRECTORY_SEPARATOR.'widget.js.php','',$_SERVER['SCRIPT_FILENAME']).'/configs/init.config.php';
header('Content-Type: application/x-javascript; charset=utf-8');

$channel = isset($_GET['channel']) == true ? $_GET['channel'] : null;
$templet = isset($_GET['templet']) == true ? $_GET['templet'] : null;
$languages = GetDefaultLanguages();
foreach ($languages as $language) {
	if (is_file(__MINITALK_PATH__.'/languages/'.$language.'.json') == true) break;
}

$MINITALK = new Minitalk();

$minifier = new Minifier();
$js = $minifier->js();
$js->add(__MINITALK_PATH__.'/scripts/jquery.js');
$js->add(__MINITALK_PATH__.'/scripts/widget.js');

/**
 * 미니톡 클라이언트의 언어파일을 불러온다.
 */
$package = json_decode(file_get_contents(__MINITALK_PATH__.'/package.json'));
$lang = null;
$oLang = null;
if (is_file(__MINITALK_PATH__.'/languages/'.$language.'.json') == false) {
	$language = $package->language;
}
$lang = file_get_contents(__MINITALK_PATH__.'/languages/'.$language.'.json');

$js->add('Minitalk.LANG = '.$lang.';');
$js->add('Minitalk.language = "'.$language.'";');

$js->add(__MINITALK_PATH__.'/scripts/jquery.extend.js');
$js->add(__MINITALK_PATH__.'/scripts/moment.js');

if ($channel !== null) {
	$js->add(__MINITALK_PATH__.'/scripts/socket.io.js');
	$js->add(__MINITALK_PATH__.'/scripts/widget.user.js');
	$js->add(__MINITALK_PATH__.'/scripts/widget.ui.js');
	$js->add(__MINITALK_PATH__.'/scripts/widget.socket.js');
	$js->add(__MINITALK_PATH__.'/scripts/widget.protocol.js');
}

$js->add('Minitalk.version = '.$MINITALK->getVersionToInt(__MINITALK_VERSION__).';');

/**
 * 이모티콘을 읽어온다.
 */
$emoticons = array();
$emoticonsPath = @opendir(__MINITALK_PATH__.'/emoticons');
while ($emoticon = @readdir($emoticonsPath)) {
	if ($emoticon != '.' && $emoticon != '..' && is_dir(__MINITALK_PATH__.'/emoticons/'.$emoticon) == true && is_file(__MINITALK_PATH__.'/emoticons/'.$emoticon.'/emoticon.json') == true) {
		$emoticons[] = $emoticon;
	}
}
@closedir($emoticonPath);
sort($emoticons);
foreach ($emoticons as &$emoticon) {
	$emoticon = json_decode(file_get_contents(__MINITALK_PATH__.'/emoticons/'.$emoticon.'/emoticon.json'));
}
$js->add('Minitalk.emoticons = '.json_encode($emoticons).';');
?>
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯에서 사용될 모든 자바스크립트를 불러온다.
 * 
 * @file /scripts/widget.js.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 6.
 */
<?php echo $js->minify(__MINITALK_PATH__.'/scripts'); ?>