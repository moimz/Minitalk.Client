<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 예제
 * @see https://www.minitalk.io/ko/manual/api
 * 
 * @file /example.php
 * @author Arzz (arzz@arzz.com)
 * @license GPLv3
 * @version 7.0.2
 * @modified 2021. 3. 25.
 */
REQUIRE_ONCE './classes/widget.php';
?>
<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8">
<title>Minitalk Client Setup Source Example</title>
<style>
HTML, BODY {padding:10px; margin:0px; overflow:hidden; width:100%; height:100%;}
</style>
</head>
<style type="text/css">
html, body {width:100%; height:100%; padding:0; margin:0;}
</style>
<body>
	<script type="text/javascript" src="./scripts/minitalk.js" charset="UTF-8"></script>
	<script type="text/javascript">
	var m = new Minitalk({
		id:"MinitalkExample",
		channel:"example",
		width:"100%",
		height:"100%",
		templet:"default",
		usercode:"<?php echo MinitalkUserCode(null,0,null,null,array()); ?>"
	});
	</script>
</body>
</html>