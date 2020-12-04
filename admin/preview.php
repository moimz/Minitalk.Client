<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡채널을 미리본다.
 * 
 * @file /admin/preview.php
 * @author Arzz (arzz@arzz.com)
 * @license GPLv3
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
REQUIRE '../configs/init.config.php';
if ($_CONFIGS->installed === false) {
	header("location:../install");
	exit;
}

$MINITALK = new Minitalk();
$logged = $MINITALK->getAdminLogged();

if ($logged !== null && $logged->language == 'ko') {
	$fontStyle = '../styles/font.css.php?font=moimz,XEIcon,FontAwesome,NanumBarunGothic,OpenSans&default=NanumBarunGothic';
} else {
	$fontStyle = '../styles/font.css.php?font=moimz,XEIcon,FontAwesome,OpenSans&default=OpenSans';
}

$channel = Request('channel') ? Request('channel') : '';
$channel = $MINITALK->getChannel($channel);
if ($channel == null) {
	header("location:./");
	exit;
}
?>
<!DOCTYPE HTML>
<html lang="<?php echo $logged == null ? 'en' : $logged->language; ?>">
<head>
<meta charset="utf-8">
<title>Minitalk Preview</title>
<link rel="stylesheet" href="<?php echo $fontStyle; ?>" type="text/css">
<link rel="stylesheet" href="./styles/login.css?t=<?php echo filemtime('./styles/login.css'); ?>" type="text/css">
<script src="../scripts/jquery.js?t=<?php echo filemtime('../scripts/jquery.js'); ?>"></script>
<script src="../scripts/jquery.extend.js?t=<?php echo filemtime('../scripts/jquery.extend.js'); ?>"></script>
<script src="./scripts/script.js?t=<?php echo filemtime('./scripts/script.js'); ?>"></script>
<script src="../scripts/language.js.php?language=<?php echo $logged == null ? 'en' : $logged->language; ?>"></script>
<link rel="shortcut icon" type="image/x-icon" href="//www.moimz.com/modules/moimz/images/Minitalk.ico">
</head>
<body<?php echo $logged === null ? ' class="login"' : ' style="background:#fff !important;"'; ?>>
<?php
if (false && $logged === null) {
	INCLUDE './login.php';
} else {
?>
	<script type="text/javascript" src="../scripts/minitalk.js?rnd=<?php echo time(); ?>"></script>
	<script type="text/javascript">
	new Minitalk({
		channel:"<?php echo $channel->channel; ?>",
		width:"100%",
		height:"100%",
		type:"auto",
		skin:"default",
		opperCode:"<?php echo $MINITALK->getOpperCode('ADMIN'); ?>"
	});
	</script>
<?php } ?>
</body>
</html>