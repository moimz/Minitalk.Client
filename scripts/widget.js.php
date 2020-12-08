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
$js->add('Minitalk.version = '.$MINITALK->getVersionToInt(__MINITALK_VERSION__).';');
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

/**
 * v6.3 버전 마이그레이션을 위한 자바스크립트를 불러온다.
 * 해당 마이그레이션 코드는 v6.5 버전에서 제거될 예정입니다.
 */
$methods = array(
	'getTime'=>'Minitalk.ui.getTime',
	'showAlert'=>'Minitalk.ui.showAlert',
	'addEvent'=>'Minitalk.on',
	'addProtocol'=>'Minitalk.socket.addProtocol',
	'addTool'=>'Minitalk.ui.addTool',
	'addUserInfo'=>'Minitalk.user.addInfo',
	'addUserMenu'=>'Minitalk.user.addMenu',
	'disconnect'=>'Minitalk.socket.disconnect',
	'getStorage'=>'Minitalk.storage',
	'playSound'=>'Minitalk.ui.playsound',
	'printMessage'=>'Minitalk.ui.printMessage',
	'sendMessage'=>'Minitalk.ui.sendMessage',
	'sendProtocol'=>'Minitalk.socket.sendProtocol',
	'setReconnect'=>null,
	'setStorage'=>'Minitalk.storage',
	'showNotice'=>'Minitalk.ui.showNotice',
	'getPluginPath'=>'Minitalk.getPluginUrl',
	'openPluginChannel'=>'Minitalk.ui.openPluginChannel'
);

$js->add('var m = {};');
if (strpos($templet,'@') === 0) {
	$js->add('var plugin = parent.plugin;');
}
foreach ($methods as $name=>$newname) {
	if ($newname === null) {
		$js->add('
			m.'.$name.' = function() {
				console.warn("[deprecated] m.'.$name.'() is deprecated in v6.5.");
			};
		');
		
		$js->add('
			Minitalk.'.$name.' = function() {
				console.warn("[deprecated] Minitalk.'.$name.'() is deprecated in v6.5.");
			};
		');
	} else {
		$js->add('
			m.'.$name.' = function() {
				console.warn("[deprecated] m.'.$name.'() is deprecated in v6.5. use '.$newname.'()");
				return '.$newname.'.apply(Minitalk,arguments);
			};
		');
		
		if ('Minitalk.'.$name != $newname) {
			$js->add('
				Minitalk.'.$name.' = function() {
					console.warn("[deprecated] Minitalk.'.$name.'() is deprecated in v6.5. use '.$newname.'()");
					return '.$newname.'.apply(Minitalk,arguments);
				};
			');
		}
	}
}

$events = array(
	'onInit'=>'init',
	'onMessage'=>'message',
	'onWhisper'=>'whisper',
	'onConnect'=>'connect',
	'onSendWhisper'=>'sendWhisper',
	'onSendMessage'=>'sendMessage',
	'onJoinUser'=>'join',
	'onLeaveUser'=>'leave',
	'onInvite'=>'invite',
	'onSendCall'=>'sendCall',
	'onSendInvite'=>'sendInvite'
);
$js->add('
	Minitalk.on = function(event,handler) {
		var newevents = '.json_encode($events).';
		
		if ($.inArray(event,Object.keys(newevents)) > -1) {
			console.warn("[deprecated] " + event + " event name is deprecated in v6.5. use " + newevents[event] + " event name.");
			event = newevents[event];
		}
		
		if (event.indexOf("before") === 0) {
			this.frame.$(this.frame.document).on(event,function(e) {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				var returnValue = handler.apply(this,args);
				if (returnValue === false) {
					e.stopImmediatePropagation();
					return false;
				} else {
					return true;
				}
			});
		} else {
			this.frame.$(this.frame.document).on(event,function(e) {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				handler.apply(this,args);
			});
		}
	};
');

$js->add('m.myinfo = Minitalk.user.me; Minitalk.on("connecting",function(minitalk,channel,user) { m.myinfo = user; });');
$js->add('m.viewUser = Minitalk.viewUser; Minitalk.on("init",function(minitalk) { Minitalk.viewUser = m.viewUser; });');

/**
 * 플러그인을 불러온다.
 */
$pluginsPath = @opendir(__MINITALK_PATH__.'/plugins');
while ($plugin = @readdir($pluginsPath)) {
	if ($plugin != '.' && $plugin != '..' && is_dir(__MINITALK_PATH__.'/plugins/'.$plugin) == true) {
		if (is_file(__MINITALK_PATH__.'/plugins/'.$plugin.'/plugin.js') == true) {
			$js->add(__MINITALK_PATH__.'/plugins/'.$plugin.'/plugin.js');
		}
	}
}
@closedir($pluginsPath);

if (strpos($templet,'@') === 0) {
	if (is_dir(__MINITALK_PATH__.'/plugins/'.substr($templet,1)) == true && is_file(__MINITALK_PATH__.'/plugins/'.substr($templet,1).'/channel.js') == true) {
		$js->add(__MINITALK_PATH__.'/plugins/'.substr($templet,1).'/channel.js');
	}
}

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
@closedir($emoticonsPath);
sort($emoticons);
foreach ($emoticons as &$emoticon) {
	$emoticon = json_decode(file_get_contents(__MINITALK_PATH__.'/emoticons/'.$emoticon.'/emoticon.json'));
}
$js->add('Minitalk.emoticons = '.json_encode($emoticons).';');

$device = 'PC';
if (preg_match('/(iPhone|iPad|iPod)/',$_SERVER['HTTP_USER_AGENT']) == true) $device = 'iOS';
if (preg_match('/(Android)/',$_SERVER['HTTP_USER_AGENT']) == true) $device = 'Android';
$js->add('Minitalk.device = "'.$device.'";');
$js->add('Minitalk.uuid = "'.md5($_SERVER['REMOTE_ADDR'].time()).'"');
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