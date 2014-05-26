<?php
REQUIRE_ONCE './config/default.conf.php';

$_POST['language:string'] = isset($_POST['language:string']) == true && $_POST['language:string'] ? $_POST['language:string'] : 'ko';
$_POST['skin:string'] = isset($_POST['skin:string']) == true && $_POST['skin:string'] ? $_POST['skin:string'] : 'default';
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
$mDB = new DB();
if ($mDB->DBcount('minitalk_ipban_table',"where `ip`='{$_SERVER['REMOTE_ADDR']}'") == 0) {
	$channel = $mDB->DBfetch('minitalk_channel_table','*',"where `channel`='{$_POST['channel:string']}'");
	if (isset($channel['channel']) == true) {
		$_POST['title:string'] = $channel['title'];
		$_POST['isNickname:boolean'] = $channel['is_nickname'] == 'TRUE' ? 'true' : 'false';
		$_POST['isBroadcast:boolean'] = $channel['is_broadcast'] == 'TRUE' ? 'true' : 'false';
		$_POST['notice:string'] = $channel['notice'];
		$_POST['chatLimit:string'] = $channel['grade_chat'];
		$_POST['fontSettingLimit:string'] = $channel['grade_font'];
	} else {
		$errorCode = 101;
	}
} else {
	$errorCode = 403;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<title>Minitalk6</title>
<link rel="stylesheet" href="./skin/<?php echo $_POST['skin:string']; ?>/style.css" type="text/css" title="style" />
<style>
HTML, BODY {padding:0px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<body>
	<div class="loading"></div>
	<?php INCLUDE_ONCE './skin/'.$_POST['skin:string'].'/skin.html'; ?>
	<script type="text/javascript" src="./script/jquery.1.9.0.min.js"></script>
	<script type="text/javascript" src="./script/socket.io.min.js"></script>
	<script type="text/javascript" src="./language/<?php echo $_POST['language:string']; ?>.js"></script>
	<script type="text/javascript" src="./script/minitalk.js?rnd=<?php echo time(); ?>"></script>
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
	<?php if (file_exists('./skin/'.$_POST['skin:string'].'/script.js') == true) { ?>
	<script type="text/javascript" src="./skin/<?php echo $_POST['skin:string']; ?>/script.js"></script>
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