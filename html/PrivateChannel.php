<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인채널 내부 HTML을 정의한다.
 * 
 * @file /scripts/html/PrivateChannel.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
REQUIRE_ONCE '../configs/init.config.php';

$MINITALK = new Minitalk();

$channel = Request('channel');
$code = Request('code') ? Request('code') : md5(Request('myinfo').time());
$templet = Request('templet');
$owner = Request('owner');
$myinfo = json_decode(Request('myinfo'),true);
$config = json_decode(Request('config'),true);
$invite = Request('invite');
$plugin = Request('plugin') ? Request('plugin') : null;

if ($plugin !== null && is_file($MINITALK->getPath().'/plugins/'.$plugin.'/channel.html') == true) {
	$templet = '@'.$plugin;
	$data = Request('data') ? json_decode(Request('data')) : new stdClass();
}

$errorCode = 0;
$channel = $MINITALK->getChannel($channel);
if ($channel == null) {
	$errorCode = 101;
}
?>
<!doctype html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<title>Minitalk6 Private Channect Connecting...</title>
<style>
HTML, BODY {padding:0px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<body>
	<script type="text/javascript" src="../scripts/minitalk.js?rnd=<?php echo time(); ?>"></script>
	<script>
	<?php if ($plugin !== null) { ?>
	var plugin = {
		code:"<?php echo $code; ?>",
		data:<?php echo json_encode($data); ?>,
		parentChannel:"<?php echo $channel->channel; ?>",
		pluginChannel:"#<?php echo $code; ?>:<?php echo $owner; ?>:<?php echo $channel->channel; ?>"
	};
	<?php } ?>
	new Minitalk({
		id:"minitalk",
		channel:"<?php echo $channel->channel; ?>",
		private:"#<?php echo $code; ?>:<?php echo $owner; ?>:<?php echo $channel->channel; ?>",
		width:"100%",
		height:"100%",
		alertLimit:"ALL",
		type:"auto",
		nickcon:"<?php echo $myinfo['nickcon']; ?>",
		nickname:"<?php echo $myinfo['nickname']; ?>",
		opperCode:"<?php echo $owner == $myinfo['nickname'] ? $MINITALK->getOpperCode('ADMIN') : ''; ?>",
		templet:"<?php echo $templet; ?>",
		listeners:{
			connect:function(minitalk) {
				<?php if ($invite != null) { ?>
				minitalk.socket.send("invite","<?php echo $invite; ?>");
				<?php } ?>
			}
		}
	});
	</script>
</body>
</html>