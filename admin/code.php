<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 코드를 출력한다.
 * 
 * @file /admin/code.php
 * @author Arzz (arzz@arzz.com)
 * @license GPLv3
 * @version 6.5.2
 * @modified 2021. 8. 30.
 */
?>
<!DOCTYPE HTML>
<html>
<head>
<meta charset="utf-8">
<title>Minitalk Code</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/styles/default.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nanum+Gothic+Coding|Roboto+Mono&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.2/highlight.min.js"></script>
<script src="../scripts/jquery.js"></script>
<style type="text/css">
html, body {padding:0; margin:0; overflow:hidden; width:100%; height:100%;}
pre {margin:0px !important; width:100%; height:100%;}
pre > code {font-family:"Roboto Mono", "Nanum Gothic Coding" !important; font-size:12px; width:100%; height:100%; overflow:auto; box-sizing:border-box;}
</style>
</head>
<body>
	<pre><code class="php html"></code></pre>
</body>

<script type="text/javascript">
$(document).ready(function() {
	parent.Ext.getCmp("MinitalkWidgetCodeCreateButton").handler();
});
</script>
</html>