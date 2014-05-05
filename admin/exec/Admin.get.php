<?php
REQUIRE_ONCE '../../config/default.conf.php';

$action = Request('action');
$get = Request('get');

$mDB = &DB::instance();
$start = Request('start');
$limit = Request('limit');
$sort = Request('sort');
$dir = Request('dir') ? Request('dir') : 'desc';
$limiter = $start != null && $limit != null ? $start.','.$limit : '';
$orderer = $sort != null && $dir != null ? $sort.','.$dir : '';

$lists = array();

if ($action == 'server') {
	if ($get == 'list') {
		$lists = $mDB->DBfetchs('minitalk_server_table','*');
		for ($i=0, $loop=sizeof($lists);$i<$loop;$i++) {
			$lists[$i]['mcode'] = $lists[$i]['type'] == 'SELF' ? $_SERVER['SERVER_ADDR'].':'.$lists[$i]['port'] : $lists[$i]['mcode'];
			if ($lists[$i]['type'] == 'MINITALK') {
				$serverInfo = GetMiniTalkAPI(array('action'=>'server_info','mcode'=>$lists[$i]['mcode'],'scode'=>md5($_SERVER['SERVER_ADDR'].str_replace('://www.','://',$_ENV['url']))));
				
				if ($serverInfo['success'] == true) {
					$lists[$i]['status'] = $serverInfo['auth'] == true ? $serverInfo['status'] : 'REAUTH';
					$lists[$i]['user'] = $serverInfo['user'];
					$lists[$i]['channel'] = $serverInfo['channel'];
					$lists[$i]['maxuser'] = $serverInfo['maxuser'];
					$lists[$i]['expire_time'] = $serverInfo['expire_time'];
					$lists[$i]['check_time'] = $serverInfo['check_time'];
				} else {
					$lists[$i]['status'] = 'UNKNOWN';
					$lists[$i]['user'] = 'UNKNOWN';
					$lists[$i]['channel'] = 'UNKNOWN';
					$lists[$i]['maxuser'] = 'UNKNOWN';
					$lists[$i]['expire_time'] = 'UNKNOWN';
					$lists[$i]['check_time'] = 'UNKNOWN';
				}
			} else {
				$lists[$i]['expire_time'] = '';
				$lists[$i]['check_time'] = date('Y-m-d H:i:s',$lists[$i]['check_time']);
			}
		}
	}
}

if ($action == 'category') {
	if ($get == 'list') {
		$depth = Request('depth');
		$parent = Request('parent');
		
		if ($depth != '3') {
			if ($depth == '1') {
				$find = "where `parent`='0'";
			} else {
				if ($parent == '0') $find = 'where 0';
				else $find = "where `parent`='$parent'";
			}
			
			$lists = $mDB->DBfetchs('minitalk_category_table','*',$find);
			
			$mode = Request('mode');
			for ($i=0, $loop=sizeof($lists);$i<$loop;$i++) {
				if ($mode == 'simple') {
					$lists[$i]['sort'] = '1';
				} else {
					if ($depth == '1') {
						$lists[$i]['child'] = $mDB->DBcount('minitalk_category_table',"where `parent`='{$lists[$i]['idx']}'");
					}
					$lists[$i]['channel'] = $mDB->DBcount('minitalk_channel_table',"where `category{$depth}`='{$lists[$i]['idx']}'");
					$temp = $mDB->DBfetch('minitalk_channel_table',array('SUM(user)'),"where `category{$depth}`='{$lists[$i]['idx']}'");
					$lists[$i]['user'] = $temp[0];
				}
			}
			if ($mode == 'simple') {
				$lists[] = array('idx'=>'0','category'=>'선택안함','sort'=>'0');
			}
		} else {
			$category1 = Request('category1');
			$category2 = Request('category2');
			
			$find = "where `category1`='$category1'";
			if ($category2 != '0') $find = "where `category2`='$category2'";
			$lists = $mDB->DBfetchs('minitalk_channel_table','*',$find);
		}
	}
}

if ($action == 'channel') {
	if ($get == 'list') {
		$category1 = intval(Request('category1'));
		$category2 = intval(Request('category2'));
		$keyword = Request('keyword');
		
		$find = 'where 1';
		if ($category1 > 0) $find.= " and `category1`='$category1'";
		if ($category2 > 0) $find.= " and `category2`='$category2'";
		if ($keyword) $find.= " and (`channel` like '%$keyword%' or `title` like '%$keyword%')";
		
		$total = $mDB->DBcount('minitalk_channel_table',$find);
		$lists = $mDB->DBfetchs('minitalk_channel_table','*',$find,$orderer,$limiter);
		for ($i=0, $loop=sizeof($lists);$i<$loop;$i++) {
			if ($lists[$i]['category1'] != '0') {
				$category1 = $mDB->DBfetch('minitalk_category_table',array('category'),"where `idx`='{$lists[$i]['category1']}'");
				$lists[$i]['category1'] = $category1['category'];
			} else {
				$lists[$i]['category1'] = '';
			}
			if ($lists[$i]['category2'] != '0') {
				$category2 = $mDB->DBfetch('minitalk_category_table',array('category'),"where `idx`='{$lists[$i]['category2']}'");
				$lists[$i]['category2'] = $category2['category'];
			} else {
				$lists[$i]['category2'] = '';
			}
			
			if ($lists[$i]['server'] != '0') {
				$server = $mDB->DBfetch('minitalk_server_table','*',"where `idx`='{$lists[$i]['server']}'");
				if ($server['type'] == 'SELF') {
					$lists[$i]['server'] = $_SERVER['REMOTE_ADDR'].':'.$server['port'];
				} else {
					$lists[$i]['server'] = $server['mcode'];
				}
			} else {
				$lists[$i]['server'] = '';
			}
		}
	}
	
	if ($get == 'skin') {
		$skinPath = @opendir('../../skin');
		$i = 0;
		while ($skin = @readdir($skinPath)) {
			if ($skin != '.' && $skin != '..' && is_dir('../../skin/'.$skin) == true) {
				$lists[$i] = array('skin'=>$skin);
				$i++;
			}
		}
		@closedir($skinPath);
	}
	
	if ($get == 'source') {
		$channel = Request('channel');
		$channel = $mDB->DBfetch('minitalk_channel_table','*',"where `channel`='$channel'");
		$value = json_decode(Request('data'),true);
		
		$source = '<?php'."\n";
		$source.= '$_MINITALK_KEY = \''.$_ENV['key'].'\';'."\n\n";
		$source.= 'function MiniTalkEncoder($value) {'."\n";
		$source.= "\t".'global $_MINITALK_KEY;'."\n";
		$source.= "\t".'$padSize = 16 - (strlen($value) % 16);'."\n";
		$source.= "\t".'$value = $value.str_repeat(chr($padSize),$padSize);'."\n";
		$source.= "\t".'$output = mcrypt_encrypt(MCRYPT_RIJNDAEL_128,$_MINITALK_KEY,$value,MCRYPT_MODE_CBC,str_repeat(chr(0),16));'."\n";
		$source.= "\t".'return base64_encode($output);'."\n";
		$source.= '}'."\n\n";
		$source.= 'function MiniTalkDecoder($value) {'."\n";
		$source.= "\t".'global $_MINITALK_KEY;'."\n";
		$source.= "\t".'$value = base64_decode($value);'."\n";
		$source.= "\t".'$output = mcrypt_decrypt(MCRYPT_RIJNDAEL_128,$_MINITALK_KEY,$value,MCRYPT_MODE_CBC,str_repeat(chr(0),16));'."\n";
		$source.= "\t".'$valueLen = strlen($output);'."\n";
		$source.= "\t".'if ($valueLen % 16 > 0) $output = \'\';'."\n";
		$source.= "\t".'$padSize = ord($output{$valueLen - 1});'."\n";
		$source.= "\t".'if (($padSize < 1) || ($padSize > 16)) $output = \'\';'."\n";
		$source.= "\t".'for ($i=0;$i<$padSize;$i++) {'."\n";
		$source.= "\t\t".'if (ord($output{$valueLen - $i - 1}) != $padSize) $output = \'\';'."\n";
		$source.= "\t".'}'."\n";
		$source.= "\t".'return substr($output,0,$valueLen-$padSize);'."\n";
		$source.= '}'."\n\n";
		$source.= 'function GetOpperCode($opper) {'."\n";
		$source.= "\t".'$value = json_encode(array(\'opper\'=>$opper,\'ip\'=>$_SERVER[\'REMOTE_ADDR\']));'."\n";
		$source.= "\t".'return urlencode(MiniTalkEncoder($value));'."\n";
		$source.= '}'."\n";
		$source.= '?>'."\n";
		
		$source.= '<script type="text/javascript" src="'.$_ENV['url'].'/script/minitalk.js" charset="UTF-8"></script>'."\n";
		$source.= '<script type="text/javascript">'."\n";
		$source.= 'new Minitalk({'."\n";
		$source.= "\t".'channel:"'.$channel['channel'].'",'."\n";
		$source.= "\t".'width:'.($value['isPercent'] == 'on' ? '"'.$value['width'].'%"' : $value['width']).','."\n";
		$source.= "\t".'height:'.($value['isPercent'] == 'on' ? '"'.$value['height'].'%"' : $value['height']).','."\n";
		$source.= "\t".'skin:"'.$value['skin'].'",'."\n";
		$source.= "\t".'type:"'.$value['type'].'",'."\n";
		$source.= "\t".'viewUser:'.($value['viewUser'] == 'on' ? 'true' : 'false').','."\n";
		$source.= "\t".'viewStatusIcon:'.($value['viewStatusIcon'] == 'on' ? 'true' : 'false').','."\n";
		$source.= "\t".'toolType:"'.$value['toolType'].'",'."\n";
		$source.= "\t".'language:"'.$value['language'].'",'."\n";
		$source.= "\t".'encode:"'.$value['encode'].'",'."\n";
		$source.= "\t".'viewAlert:'.($value['viewAlert'] == 'on' ? 'false' : 'true').','."\n";
		$source.= "\t".'viewAlertLimit:"'.$value['alertLimit'].'",'."\n";
		$source.= "\t".'nickname:"<?php echo $nickname; // 고정닉네임을 줄경우 $nickname 변수에 고정닉네임설정; ?>",'."\n";
		$source.= "\t".'<?php if ($isAdmin == true) { // 관리자권한을 줘야하는경우, $isAdmin 변수에 true 설정 ?>'."\n";
		$source.= "\t".'opperCode:"<?php echo GetOpperCode(\'ADMIN\'); ?>",'."\n";
		$source.= "\t".'<?php } elseif ($isMember == true) { // 회원권한을 줘야하는경우, $isMember 변수에 true 설정 ?>'."\n";
		$source.= "\t".'opperCode:"<?php echo GetOpperCode(\'ADMIN\'); ?>",'."\n";
		$source.= "\t".'<?php } ?>'."\n";
		$source.= "\t".'logLimit:'.$value['logLimit']."\n";
		$source.= '});'."\n";
		$source.= '</script>';
		$return['success'] = true;
		
		$return['data'] = array('source'=>$source);
		
		exit(json_encode($return));
	}
	
	if ($get == 'info') {
		$channel = Request('channel');
		
		$data = $mDB->DBfetch('minitalk_channel_table','*',"where `channel`='$channel'");
		
		$data['is_nickname'] = $data['is_nickname'] == 'TRUE' ? 'on' : 'off';
		$data['use_broadcast'] = $data['use_broadcast'] == 'TRUE' ? 'on' : 'off';
		$return['success'] = true;
		$return['data'] = $data;
		exit(json_encode($return));
	}
}

if ($action == 'log') {
	if ($get == 'db') {
		$last = Request('last');
		$channel = Request('channel');
		$nickname = Request('nickname');
		$ip = Request('ip');
		$date = Request('date');
		
		if ($last != '0' && $date == '') $find = "where `time`>'$last'";
		elseif ($date != '') $find = "where `time`>=".(strtotime($date)*1000)." and `time`<".((strtotime($date)+60*60*24)*1000);
		else $find = "where 1";

		if ($channel) $find.= " and `channel`='$channel'";
		if ($nickname) $find.= " and `nickname`='$nickname'";
		if ($ip) $find.= " and `ip`='$ip'";
		
		$lists = $mDB->DBfetchs('minitalk_log_table','*',$find,'time,asc','0,50');
		for ($i=0, $loop=sizeof($lists);$i<$loop;$i++) {
			$lists[$i]['message'] = LogConverter($lists[$i]['message']);
		}
	}
	
	if ($get == 'filelist') {
		$channel = Request('channel');
		$find = $channel ? "where `channel`='$channel'" : '';
		
		$total = $mDB->DBcount('minitalk_log_file_table',$find);
		$lists = $mDB->DBfetchs('minitalk_log_file_table','*',$find,$orderer,$limiter);
	}
	
	if ($get == 'dbtotal') {
		$return['success'] = true;
		$return['line'] = $mDB->DBcount('minitalk_log_table');
		exit(json_encode($return));
	}
	
	if ($get == 'file') {
		$channel = Request('channel');
		$date = Request('date');
		
		if (file_exists('../../log/'.str_replace('-','',$date).'.'.$channel.'.log') == true) {
			$log = explode("\r\n",file_get_contents('../../log/'.str_replace('-','',$date).'.'.$channel.'.log'));
			
			$lists = array();
			for ($i=0, $loop=sizeof($log);$i<$loop;$i++) {
				if (preg_match('/^\[([^\]]+)\] ([^ ]+) : (.*?)$/',$log[$i],$match) == true) {
					$lists[] = array('time'=>strtotime($match[1])*1000,'nickname'=>$match[2],'message'=>LogConverter($match[3]));
				}
			}
		}
	}
}

if ($action == 'ip') {
	if ($get == 'list') {
		$keyword = Request('keyword');
		if ($keyword) $find = "where `ip` like '%$keyword%' or `nickname` like '%$keyword%'";
		else $find = '';
		
		$total = $mDB->DBcount('minitalk_ipban_table',$find);
		$lists = $mDB->DBfetchs('minitalk_ipban_table','*',$find,$orderer,$limiter);
		for ($i=0, $loop=sizeof($lists);$i<$loop;$i++) {
			$lists[$i]['reg_date'] = date('Y-m-d H:i:s',$lists[$i]['reg_date']);
		}
	}
}

if ($action == 'broadcast') {
	if ($get == 'list') {
		$keyword = Request('keyword');
		if ($keyword) $find = "where `message` like '%$keyword%'";
		else $find = '';
		$total = $mDB->DBcount('minitalk_broadcast_table',$find);
		$lists = $mDB->DBfetchs('minitalk_broadcast_table','*',$find,$orderer,$limiter);
		for ($i=0, $loop=sizeof($lists);$i<$loop;$i++) {
			$lists[$i]['reg_date'] = date('Y-m-d H:i:s',$lists[$i]['reg_date']);
		}
	}
}

$return = array();
$return['totalCount'] = isset($total) == true ? $total : sizeof($lists);
$return['lists'] = $lists;

exit(json_encode($return));
?>