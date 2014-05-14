<?php
REQUIRE_ONCE '../config/default.conf.php';

$plugin = Request('plugin');
$code = Request('code') ? Request('code') : md5(Request('myinfo').time());
$channel = Request('channel');
$myinfo = json_decode(Request('myinfo'),true);
$config = json_decode(Request('config'),true);
$data = json_decode(Request('data'),true);
$pluginChannel = '$'.$code.':'.$channel;
$parent = Request('parent');

$device = 'PC';
if (preg_match('/(iPhone|iPad|iPod)/',$_SERVER['HTTP_USER_AGENT']) == true) $device = 'iOS';
if (preg_match('/(Android)/',$_SERVER['HTTP_USER_AGENT']) == true) $device = 'Android';

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
<title>Minitalk6 Plugin Channel Connecting...</title>
<link rel="stylesheet" href="../plugin/<?php echo $plugin; ?>/channel.css" type="text/css" title="style" />
<style>
HTML, BODY {padding:0px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<body>
	<div class="pluginChannelFrame">
		<div class="loading"></div>
		<?php INCLUDE_ONCE '../plugin/'.$plugin.'/channel.html'; ?>
	
		<script type="text/javascript" src="../script/jquery.1.9.0.min.js"></script>
		<script type="text/javascript" src="../script/socket.io.min.js"></script>
		<script type="text/javascript" src="../language/<?php echo $config['language']; ?>.js"></script>
		<script type="text/javascript" src="../script/minitalk.js?rnd=<?php echo time(); ?>"></script>
		<script>
		var plugin = {};
		plugin.code = "<?php echo $code; ?>";
		plugin.data = <?php echo is_array($data) == true ? json_encode($data) : '{}'; ?>;
		plugin.parentChannel = "<?php echo $parent; ?>";
		plugin.pluginChannel = "<?php echo $pluginChannel; ?>";
		
		var m = new MinitalkComponent({
			id:"minitalk",
			channel:"<?php echo $channel['channel']; ?>",
			private:"<?php echo $pluginChannel; ?>",
			width:"100%",
			height:"100%",
			alertLimit:"ALL",
			logLimit:0,
			type:"auto",
			nickcon:"<?php echo $myinfo['nickcon']; ?>",
			nickname:"<?php echo $myinfo['nickname']; ?>",
			title:"Plugin Channel",
			device:"<?php echo $device; ?>",
			skin:"<?php echo $config['skin']; ?>",
			emoticons:[<?php echo implode(',',$emoticons); ?>]
		});
		</script>
		<?php if (file_exists('../plugin/'.$plugin.'/channel.js') == true) { ?>
		<script type="text/javascript" src="../plugin/<?php echo $plugin; ?>/channel.js"></script>
		<?php } ?>
		<script>
		$(document).ready(function() {
			m.init(<?php echo $errorCode; ?>);
		});
		</script>
	</div>
</body>
</html>