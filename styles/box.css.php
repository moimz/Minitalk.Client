<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인박스에서 사용되는 모든 스타일시트를 불러온다.
 * 
 * @file /scripts/box.css.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.2
 * @modified 2021. 8. 30.
 */
REQUIRE_ONCE str_replace('/styles/box.css.php','',str_replace(DIRECTORY_SEPARATOR,'/',$_SERVER['SCRIPT_FILENAME'])).'/configs/init.config.php';
header("Content-Type:text/css; charset=utf-8");

$channel = isset($_GET['channel']) == true ? $_GET['channel'] : null;
$templet = isset($_GET['templet']) == true ? $_GET['templet'] : null;
$type = isset($_GET['type']) == true ? $_GET['type'] : 'talk';
$languages = GetDefaultLanguages();
foreach ($languages as $language) {
	if (is_file(__MINITALK_PATH__.'/languages/'.$language.'.json') == true) break;
}

$MINITALK = new Minitalk();

$checksum = substr(md5(json_encode(GetDirectoryItems(__MINITALK_PATH__.'/plugins','directory',false))),0,6);
$cacheFile = $language.'.'.($templet == null ? 'common' : $templet).'.'.($channel == null ? 'global' : 'channel').'.box.'.$type.'.'.$checksum.'.css';
if ($MINITALK->getCacheTime($cacheFile) >= $MINITALK->getLastModified()) {
	$content = $MINITALK->getCacheContent($cacheFile);
} else {
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
	
	/**
	 * 플러그인을 불러온다.
	 */
	foreach (GetDirectoryItems(__MINITALK_PATH__.'/plugins','directory') as $plugin) {
		if (is_file($plugin.'/style.css') == true) {
			$css->add($plugin.'/style.css');
		}
	}
	
	/**
	 * 박스 DOM 객체의 스타일을 정의한 스타일시트가 있다면 불러오고 없다면, 기본 템플릿의 스타일시트를 불러온다.
	 */
	if (is_file(__MINITALK_PATH__.'/plugins/'.$type.'/box.css') == true) {
		$css->add(__MINITALK_PATH__.'/plugins/'.$type.'/box.css');
	} elseif ($templet !== null && is_file(__MINITALK_PATH__.'/templets/'.$templet.'/style.css') == true) {
		$css->add(__MINITALK_PATH__.'/templets/'.$templet.'/style.css');
	}
	
	$content = $css->minify(__MINITALK_PATH__.'/styles');
	$MINITALK->saveCacheContent($cacheFile,$content);
}
?>
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯에서 사용될 모든 스타일시트를 불러온다.
 * 
 * @file /scripts/box.css.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.2
 * @modified 2021. 8. 30.
 * @cached <?php echo date('Y. n. j. H:i:s',$MINITALK->getCacheTime($cacheFile))."\n"; ?>
 */
<?php echo $content; ?>