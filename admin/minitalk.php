<?php
REQUIRE_ONCE '../config/default.conf.php';

$logged = Request('logged','session');

if ($logged !== 'TRUE') {
	INCLUDE './login.php';
} else {
	$mDB = &DB::instance();
	$channel = Request('channel');
	$channel = $mDB->DBfetch('minitalk_channel_table','*',"where `channel`='$channel'");
	$channel = isset($channel['channel']) == true ? $channel : array('channel'=>'');
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<title>Minitalk6</title>
<style type="text/css">
HTML, BODY {width:100%; height:100%; overflow:hidden; margin:0px; padding:0px;}
</style>
</head>
<body style="margin:0px; padding:0px;">
<script type="text/javascript" src="../script/minitalk.js" charset="UTF-8"></script>
<table cellpadding="0" cellspacing="0" style="table-layout:fixed; width:100%; height:100%;">
<tr style="height:100%;">
	<td style="position:relative; width:100%; height:100%;">
		<script type="text/javascript">
		new Minitalk({
			channel:"<?php echo $channel['channel']; ?>",
			width:"100%",
			height:"100%",
			type:"auto",
			viewAlertLimit:"MEMBER",
			skin:"default",
			opperCode:"<?php echo GetOpperCode('ADMIN'); ?>"
		});
		</script>
	</td>
</tr>
</table>
</body>
</html>
<?php } ?>