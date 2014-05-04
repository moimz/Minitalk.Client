<?php
REQUIRE_ONCE '../../config/default.conf.php';

$logged = Request('logged','session');
if ($logged !== 'TRUE') exit;

$mDB = &DB::instance();
$date = strtotime(Request('date'))*1000;
$total = Request('total') == null ? $mDB->DBcount('minitalk_log_table',"where `time`<$date") : Request('total');
$limit = 100;
$saved = Request('saved') == null ? 0 : intval(Request('saved'));
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>로그파일변환중</title>
<script type="text/javascript" src="../script/extjs4.js"></script>
<script type="text/javascript" src="../script/extjs4.extend.js"></script>
<link rel="stylesheet" href="../css/extjs4.css" type="text/css" title="style" />
<style type="text/css">
* {margin:0px; padding:0px;}
html, body {overflow:hidden;}
</style>
</head>
<body>

<script type="text/javascript">
<?php if ($total == 0) { ?>
parent.Ext.Msg.show({title:"안내",msg:"<?php echo date('Y년 m월 d일',$date/1000); ?>이전에 DB에 기록된 로그가 없습니다.<br />기준일자를 다시한번 확인하여 주시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() { parent.Ext.getCmp("LogFileProgressWindow").close(); }});
<?php } elseif ($saved >= $total) {
	$file = $mDB->DBfetchs('minitalk_log_file_table','*',"where `size`='0'");
	for ($i=0, $loop=sizeof($file);$i<$loop;$i++) {
		if (file_exists('../../log/'.$file[$i]['file']) == true) {
			$filesize = filesize('../../log/'.$file[$i]['file']);
			$mDB->DBupdate('minitalk_log_file_table',array('size'=>$filesize),'',"where `file`='{$file[$i]['file']}'");
		} else {
			$mDB->DBdelete('minitalk_log_file_table',"where `file`='{$file[$i]['file']}'");
		}
	}
?>
parent.Ext.getCmp("LogFileProgress").updateProgress(1,"100.00% 완료",true);
parent.Ext.Msg.show({title:"안내",msg:"<?php echo date('Y년 m월 d일',$date/1000); ?>이전의 로그를 파일로 저장하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() { parent.Ext.getCmp("LogFileProgressWindow").close(); parent.Ext.getCmp("LogFileWindow").close(); parent.LogStore.loadPage(1); parent.LogFileStore.loadPage(1); }});
<?php } else { ?>
parent.Ext.getCmp("LogFileProgress").updateProgress(<?php echo $saved; ?>/<?php echo $total; ?>,"<?php echo sprintf('%0.2f',$saved/$total*100); ?>% 진행중...",true);
<?php
	$log = $mDB->DBfetchs('minitalk_log_table','*',"where `time`<$date",'time,asc','0,'.$limit);
	$loop = sizeof($log);
	$lastTime = 0;
	for ($i=0;$i<$loop;$i++) {
		$logfile = date('Ymd',$log[$i]['time']/1000).'.'.$log[$i]['channel'].'.log';
		$logline = '['.date('Y-m-d H:i:s',$log[$i]['time']/1000).'] '.$log[$i]['nickname'].' : '.$log[$i]['message']."\r\n";
		file_put_contents('../../log/'.$logfile,$logline,FILE_APPEND);
		if ($mDB->DBcount('minitalk_log_file_table',"where `file`='$logfile'") == 0) {
			$mDB->DBinsert('minitalk_log_file_table',array('file'=>$logfile,'channel'=>$log[$i]['channel'],'date'=>date('Y-m-d',$log[$i]['time']/1000)));
		}
		
		$lastTime = $log[$i]['time'];
	}
	
	$mDB->DBdelete('minitalk_log_table',"where `time`<='$lastTime'");
	
	if ($loop == 0) $saved = $total;
	else $saved+= $loop;
?>
parent.Ext.getCmp("LogFileProgress").updateProgress(<?php echo $saved; ?>/<?php echo $total; ?>,"<?php echo sprintf('%0.2f',$saved/$total*100); ?>% 진행중... (<?php echo $saved; ?> / <?php echo $total; ?>)",true);
location.href = "./LogFileConvert.do.php?date=<?php echo date('Y-m-d',$date/1000); ?>&total=<?php echo $total; ?>&saved=<?php echo $saved; ?>";
<?php } ?>
</script>

</body>
</html>