<?php
REQUIRE_ONCE '../config/default.conf.php';

$channel = Request('channel');
$code = Request('code');
$owner = Request('owner');
$myinfo = json_decode(Request('myinfo'),true);
$config = json_decode(Request('config'),true);
$invite = Request('invite');
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
$channel = $mDB->DBfetch('minitalk_channel_table','*',"where `channel`='{$channel}'");
if (isset($channel['channel']) == true) {

} else {
	$errorCode = 101;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<title>Minitalk6 Private Channect Connecting...</title>
<link rel="stylesheet" href="../skin/<?php echo $config['skin']; ?>/style.css" type="text/css" title="style" />
<style>
HTML, BODY {padding:0px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<body>
	<div class="loading"></div>
	<?php INCLUDE_ONCE '../skin/'.$config['skin'].'/skin.html'; ?>

	<script type="text/javascript" src="../script/jquery.1.9.0.min.js"></script>
	<script type="text/javascript" src="../script/socket.io.min.js"></script>
	<script type="text/javascript" src="../language/<?php echo $config['language']; ?>.js"></script>
	<script type="text/javascript" src="../script/minitalk.js?rnd=<?php echo time(); ?>"></script>
	<script>
	var m = new MinitalkComponent({
		id:"minitalk",
		channel:"<?php echo $channel['channel']; ?>",
		private:"#<?php echo $code; ?>:<?php echo $owner; ?>:<?php echo $channel['channel']; ?>",
		width:"100%",
		height:"100%",
		alertLimit:"ALL",
		type:"auto",
		nickcon:"<?php echo $myinfo['nickcon']; ?>",
		nickname:"<?php echo $myinfo['nickname']; ?>",
		opperCode:"<?php echo $owner == $myinfo['nickname'] ? GetOpperCode('ADMIN') : ''; ?>",
		title:LANG.privateTitle.replace("{nickname}","<?php echo $owner; ?>"),
		skin:"<?php echo $config['skin']; ?>",
		emoticons:[<?php echo implode(',',$emoticons); ?>],
		listeners:{
			onConnect:function(minitalk) {
				<?php if ($invite != null) { ?>
				minitalk.send("invite","<?php echo $invite; ?>");
				<?php } ?>
			}
		}
	});
	</script>
	<?php
	$pluginPath = @opendir($_ENV['path'].'/plugin');
	while ($plugin = @readdir($pluginPath)) {
		if ($plugin != '.' && $plugin != '..' && is_dir($_ENV['path'].'/plugin/'.$plugin) == true) {
			echo '<script type="text/javascript" src="../plugin/'.$plugin.'/plugin.js"></script>'."\n";
		}
	}
	@closedir($pluginPath);
	?>
	<script>
	$(document).ready(function() {
		document.title = LANG.privateTitle.replace("{nickname}","<?php echo $owner; ?>");
		m.init(<?php echo $errorCode; ?>);
	});
	$(window).on("unload",function() {
		if (opener) {
			opener["<?php echo $code; ?>"] = null;
			delete opener["<?php echo $code; ?>"];
		}
	});
	</script>
</body>
</html>