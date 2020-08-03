<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인박스에서 사용되는 모든 자바스크립트를 불러온다.
 * 
 * @file /scripts/box.js.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 7. 8.
 */
REQUIRE_ONCE str_replace(DIRECTORY_SEPARATOR.'scripts'.DIRECTORY_SEPARATOR.'box.js.php','',$_SERVER['SCRIPT_FILENAME']).'/configs/init.config.php';
header('Content-Type: application/x-javascript; charset=utf-8');

$channel = isset($_GET['channel']) == true ? $_GET['channel'] : 'example';
$templet = isset($_GET['templet']) == true ? $_GET['templet'] : 'default';
$language = 'ko';

$minifier = new Minifier();
$js = $minifier->js();
$js->add(__MINITALK_PATH__.'/scripts/uuid.js');
$js->add(__MINITALK_PATH__.'/scripts/jquery.js');
$js->add(__MINITALK_PATH__.'/scripts/box.js');

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
	$js->add(__MINITALK_PATH__.'/scripts/widget.box.js');
	
	/**
	 * 플러그인을 불러온다.
	 */
	$pluginsPath = @opendir(__MINITALK_PATH__.'/plugins');
	while ($pluginName = @readdir($pluginsPath)) {
		if ($pluginName != '.' && $pluginName != '..' && is_dir(__MINITALK_PATH__.'/plugins/'.$pluginName) == true && is_file(__MINITALK_PATH__.'/plugins/'.$pluginName.'/package.json') == true) {
			$package = json_decode(file_get_contents(__MINITALK_PATH__.'/plugins/'.$pluginName.'/package.json'));
			$js->add(__MINITALK_PATH__.'/plugins/'.$pluginName.'/scripts/script.js');
			$js->add('Minitalk.plugins.'.$pluginName.' = MinitalkComponent.clone(plugin);');
			$js->add('delete plugin;');
			
			/**
			 * 플러그인에 언어팩이 존재할 경우
			 */
			if (is_dir(__MINITALK_PATH__.'/plugins/'.$pluginName.'/languages') == true) {
				if (is_file(__MINITALK_PATH__.'/plugins/'.$pluginName.'/languages/'.$language.'.json') == false) {
					$language = $package->language;
				}
				$lang = file_get_contents(__MINITALK_PATH__.'/plugins/'.$pluginName.'/languages/'.$language.'.json');
				$js->add('Minitalk.plugins.'.$pluginName.'.LANG = '.$lang.';');
				$js->add('
					Minitalk.plugins.'.$pluginName.'.getText = function(code,replacement) {
						var replacement = replacement ? replacement : null;
						var temp = code.split("/");
						
						var string = Minitalk.plugins.'.$pluginName.'.LANG;
						for (var i=0, loop=temp.length;i<loop;i++) {
							if (string[temp[i]]) {
								string = string[temp[i]];
							} else {
								string = null;
								break;
							}
						}
						
						if (string != null) {
							return string;
						}
						
						return replacement == null ? code : replacement;
					};
					
					Minitalk.plugins.'.$pluginName.'.getErrorText = function(code) {
						var message = Minitalk.plugins.'.$pluginName.'.getText("error/"+code,code);
						if (message === code) message = Minitalk.plugins.'.$pluginName.'.getText("error/UNKNOWN")+" ("+code+")";
						
						return message;
					};
				');
			}
		}
	}
	@closedir($pluginsPath);
	
	/**
	 * 템플릿 전용 스크립트가 있을 경우 해당 스크립트를 불러온다.
	 */
	if ($templet !== null && is_file(__MINITALK_PATH__.'/templets/'.$templet.'/script.js') == true) {
		$js->add(__MINITALK_PATH__.'/templets/'.$templet.'/script.js');
	}
}
?>
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인박스에서 사용될 모든 자바스크립트를 불러온다.
 * 
 * @file /scripts/box.js.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 7. 8.
 */
<?php echo $js->minify(__MINITALK_PATH__.'/scripts'); ?>