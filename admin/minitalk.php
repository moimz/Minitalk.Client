<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자에서 생성된 채널에 접속한다.
 * 
 * @file /admin/minitalk.php
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 3. 16.
 */
if (file_exists('../configs/key.config.php') == false || file_exists('../configs/db.config.php') == false) header("location:../install");
REQUIRE '../configs/init.config.php';

$MINITALK = new Minitalk();
$logged = $MINITALK->getAdminLogged();
$logged = new stdClass();
$logged->language = 'ko';
?>
<!DOCTYPE HTML>
<html lang="<?php echo $logged == null ? 'en' : $logged->language; ?>">
<head>
<meta charset="utf-8">
<title>Minitalk Administrator</title>
<?php if ($logged !== null) { ?>
<style type="text/css">
html, body {width:100%; height:100%; overflow:hidden; margin:0px; padding:0px;}
</style>
<?php } else { ?>
<link rel="stylesheet" href="../styles/font.css.php?font=moimz,XEIcon,FontAwesome,OpenSans&default=OpenSans" type="text/css">
<script src="../scripts/jquery.js?t=<?php echo filemtime('../scripts/jquery.js'); ?>"></script>
<script src="../scripts/jquery.extend.js?t=<?php echo filemtime('../scripts/jquery.extend.js'); ?>"></script>
<script src="../scripts/moment.js?t=<?php echo filemtime('../scripts/moment.js'); ?>"></script>
<link rel="stylesheet" href="./styles/login.css?t=<?php echo filemtime('./styles/login.css'); ?>" type="text/css">
<script src="./scripts/script.js?t=<?php echo filemtime('./scripts/script.js'); ?>"></script>
<?php } ?>
<link rel="shortcut icon" type="image/x-icon" href="//www.moimz.com/modules/moimz/images/Minitalk.ico">
</head>
<body<?php echo $logged === null ? ' class="login"' : ''; ?>>
<?php
if ($logged == null) {
	INCLUDE './login.php';
} else {
?>
<script type="text/javascript" src="../scripts/minitalk.js?rnd=<?php echo time(); ?>" charset="utf-8"></script>
<script type="text/javascript">
new Minitalk({
	channel:"<?php echo Request('channel') ? Request('channel') : 'unknown'; ?>",
	width:"100%",
	height:"100%",
	skin:"default",
	toolType:"icontext",
	opperCode:"<?php echo $MINITALK->getOpperCode('ADMIN'); ?>"
});
</script>
<?php } ?>
</body>
</html>