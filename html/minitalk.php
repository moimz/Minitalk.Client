<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 내부 HTML을 정의한다.
 * 
 * @file /scripts/html/minitalk.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
REQUIRE_ONCE '../configs/init.config.php';

$MINITALK = new Minitalk();

$_POST['language:string'] = isset($_POST['language:string']) == true && $_POST['language:string'] ? $_POST['language:string'] : 'ko';
$_POST['templet:string'] = isset($_POST['templet:string']) == true && $_POST['templet:string'] ? $_POST['templet:string'] : 'default';
$_POST['userCode:string'] = md5($_SERVER['REMOTE_ADDR'].time());
$_POST['device:string'] = 'PC';
if (preg_match('/(iPhone|iPad|iPod)/',$_SERVER['HTTP_USER_AGENT']) == true) $_POST['device:string'] = 'iOS';
if (preg_match('/(Android)/',$_SERVER['HTTP_USER_AGENT']) == true) $_POST['device:string'] = 'Android';

$usePlugin = true;
$pluginList = array();
if (isset($_POST['plugin:string']) == true && $_POST['plugin:string'] == 'NONE') $usePlugin = false;
if (isset($_POST['plugin:object']) == true && $_POST['plugin:object']) {
	$usePlugin = false;
	$pluginList = json_decode($_POST['plugin:object'],true);
}

$emoticons = array();
$emoticonPath = @opendir($_ENV['path'].'/emoticon');
while ($emoticon = @readdir($emoticonPath)) {
	if ($emoticon != '.' && $emoticon != '..' && is_dir($_ENV['path'].'/emoticon/'.$emoticon) == true) {
		$emoticons[] = preg_replace('/(\t|\n)/','',file_get_contents($_ENV['path'].'/emoticon/'.$emoticon.'/emoticon.json'));
	}
}
@closedir($emoticonPath);

$errorCode = 0;

if ($MINITALK->isBanIp() == true) {
	$errorCode = 403;
} else {
	$channel = $MINITALK->getChannel($_POST['channel:string']);
	if ($channel !== null) {
		$_POST['title:string'] = $channel->title;
		$_POST['isNickname:boolean'] = $channel->is_nickname;
		$_POST['isBroadcast:boolean'] = $channel->is_broadcast;
		$_POST['notice:string'] = $channel->notice;
		$_POST['chatLimit:string'] = $channel->grade_chat;
		$_POST['fontSettingLimit:string'] = $channel->grade_font;
	} else {
		$errorCode = 101;
	}
}
?>
<!doctype html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<title>Minitalk6</title>
<link rel="stylesheet" href="../templets/<?php echo $_POST['templet:string']; ?>/style.css" type="text/css" title="style" />
<style>
HTML, BODY {padding:0px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<body>
	<div class="loading"></div>
	<?php INCLUDE_ONCE '../templets/'.$_POST['templet:string'].'/skin.html'; ?>
	<script type="text/javascript" src="../scripts/jquery.js"></script>
	<script type="text/javascript" src="../scripts/socket.io.js"></script>
	<script type="text/javascript" src="../languages/<?php echo $_POST['language:string']; ?>.js"></script>
	<script type="text/javascript" src="../scripts/minitalk.js?rnd=<?php echo time(); ?>"></script>
	<script>
	var m = new MinitalkComponent({
		emoticons:[<?php echo implode(',',$emoticons); ?>],
<?php
$isFirst = true;
foreach ($_POST as $param=>$value) {
	if ($param == 'title') continue;
	
	if ($isFirst == true) {
		$isFirst = false;
	} else {
		echo ",\n\t\t";
	}
	if (preg_match('/^(.*?):string$/',$param,$match) == true) {
		echo $match[1].':"'.urldecode($value).'"';
	} elseif (preg_match('/^(.*?):(boolean|number)$/',$param,$match) == true) {
		echo $match[1].':'.urldecode($value);
	} elseif (preg_match('/^(.*?):object$/',$param,$match) == true) {
		echo $match[1].':'.preg_replace('/:\"(function(.*?)})\"/',':\1',urldecode($value));
	} else {
		echo $param;
	}
}
echo "\n";
?>
	});
	</script>
	<?php if (file_exists('./templets/'.$_POST['templet:string'].'/script.js') == true) { ?>
	<script type="text/javascript" src="./templets/<?php echo $_POST['templet:string']; ?>/script.js"></script>
	<?php } ?>
	<?php
	$pluginPath = @opendir($_ENV['path'].'/plugin');
	while ($plugin = @readdir($pluginPath)) {
		if ($usePlugin == true || in_array($plugin,$pluginList) == true) {
			if ($plugin != '.' && $plugin != '..' && is_dir($_ENV['path'].'/plugin/'.$plugin) == true) {
				if (file_exists($_ENV['path'].'/plugin/'.$plugin.'/plugin.css') == true) {
					echo '<link rel="stylesheet" href="./plugin/'.$plugin.'/plugin.css" type="text/css" title="style" />'."\n";
				}
				if (file_exists($_ENV['path'].'/plugin/'.$plugin.'/plugin.js') == true) {
					echo '<script type="text/javascript" src="./plugin/'.$plugin.'/plugin.js"></script>'."\n";
				}
				if (file_exists($_ENV['path'].'/plugin/'.$plugin.'/plugin.js.php') == true) {
					echo '<script type="text/javascript" src="./plugin/'.$plugin.'/plugin.js.php"></script>'."\n";
				}
			}
		}
	}
	@closedir($pluginPath);
	?>
	<script>
	$(document).ready(function() {
		m.init(<?php echo $errorCode; ?>);
	});
	</script>
</body>
</html>