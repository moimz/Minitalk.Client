<?php
REQUIRE_ONCE '../../config/default.conf.php';

$action = Request('action');
$do = Request('do');

if ($action == 'login') {
	$user_id = Request('user_id');
	$password = Request('password');
	
	$adminFile = explode("\n",file_get_contents('../../config/admin.conf.php'));
	$adminInfo = json_decode(MiniTalkDecoder($adminFile[1]),true);
	if ($adminInfo['user_id'] != $user_id || $adminInfo['password'] != $password) {
		Alertbox('관리자 아이디 또는 패스워드가 일치하지 않습니다.');
	} else {
		$_SESSION['logged'] = 'TRUE';
		Redirect('reload','parent');
	}
}

if ($action == 'master') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	$mDB = new DB();
	
	if ($do == 'modify') {
		$errors = array();
		$user_id = Request('user_id');
		$password1 = Request('password1');
		$password2 = Request('password2');
		
		if ($password1 != $password2) {
			$errors['password1'] = $errors['password2'] = '패스워드와 패스워드확인이 일치하지 않습니다.';
		}
		
		if (sizeof($errors) == 0) {
			$return['success'] = true;
			
			$password = md5($password1);
			$adminFile = @fopen('../../config/admin.conf.php','w');
			@fwrite($adminFile,"<?php /*\n".MiniTalkEncoder(json_encode(array('user_id'=>$user_id,'password'=>$password)))."\n*/ ?>");
			@fclose($adminFile);
			@chmod('../../config/admin.conf.php',0707);
		} else {
			$return['success'] = false;
			$return['errors'] = $errors;
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'logout') {
		unset($_SESSION['logged']);
		exit(json_encode(array('success'=>true)));
	}
}

if ($action == 'server') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	$mDB = new DB();
	
	if ($do == 'add') {
		$errors = array();
		$type = Request('type');
		
		if ($type == 'SELF') {
			$port = Request('port');
			
			if (is_dir('../../server') == false || file_exists('../../server/minitalk.js') == false) {
				$return['success'] = false;
				$return['message'] = '자체서버생성은 미니톡 서버프로그램을 구매하여 설치하신 경우에만 가능합니다.<br />먼저 미니톡 서버프로그램을 구매하여 주시기 바랍니다.';
			} else {
				if ($mDB->DBcount('minitalk_server_table',"where `port`='$port'") > 0) {
					$errors['port'] = '이미 생성되어 있는 포트입니다.';
				}
				
				if (sizeof($errors) == 0) {
					$mDB->DBinsert('minitalk_server_table',array('type'=>'SELF','port'=>$port,'status'=>'OFFLINE'));
					copy('../../server/minitalk.js','../../server/minitalk.'.$port.'.js');
					chmod('../../server/minitalk.'.$port.'.js',0707);
					$return['success'] = true;
				} else {
					$return['success'] = false;
					$return['errors'] = $errors;
				}
			}
		} else {
			$check = $mDB->DBfetch('minitalk_server_table','*',"where `type`='MINITALK' and `mcode`='{$result['mcode']}'");
			if (isset($check['idx']) == true) {
				$return['success'] = false;
				$return['message'] = '이미 등록되어 있는 미니톡서버입니다.';
			} else {
				$dbpath = $_ENV['url'].'/exec/DB.do.php';
				$data = array('action'=>'register_server','user_id'=>Request('user_id'),'password'=>Request('password'),'mcode'=>Request('mcode'),'scode'=>md5($_SERVER['SERVER_ADDR'].str_replace('://www.','://',$_ENV['url'])),'dbpath'=>$dbpath);
				$result = GetMiniTalkAPI($data);
				
				if ($result['success'] == true) {
					$mDB->DBinsert('minitalk_server_table',array('type'=>'MINITALK','mcode'=>$result['mcode']));
					$return['success'] = true;
				} else {
					$return['success'] = false;
					$return['message'] = $result['message'];
				}
			}
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'delete') {
		$idx = Request('idx');
		
		$check = $mDB->DBfetch('minitalk_server_table','*',"where `idx`='$idx'");
		$mDB->DBdelete('minitalk_server_table',"where `idx`='$idx'");
		$mDB->DBupdate('minitalk_channel_table',array('server'=>'0'),'',"where `server`='$idx'");
		
		if ($check['type'] == 'SELF') {
			@unlink('../../server/minitalk.'.$check['port'].'.js');
		}
		$return['success'] = true;
		
		exit(json_encode($return));
	}
}

if ($action == 'category') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	
	$mDB = new DB();
	
	if ($do == 'add') {
		$insert = array();
		$errors = array();
		$insert['category'] = Request('category');
		$insert['parent'] = Request('parent') == null ? '0' : Request('parent');
		
		if ($mDB->DBcount('minitalk_category_table',"where `parent`='{$insert['parent']}' and `category`='{$insert['category']}'") > 0) {
			$errors['category'] = '이미 생성되어 있는 카테고리입니다.';
		}
		
		if (sizeof($errors) == 0) {
			$mDB->DBinsert('minitalk_category_table',$insert);
			$return['success'] = true;
		} else {
			$return['success'] = false;
			$return['errors'] = $errors;
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'modify') {
		$insert = array();
		$errors = array();
		$idx = Request('idx');
		$insert['category'] = Request('category');
		
		$category = $mDB->DBfetch('minitalk_category_table','*',"where `idx`='$idx'");
		
		if ($mDB->DBcount('minitalk_category_table',"where `idx`!='$idx' and `parent`='{$category['parent']}' and `category`='{$insert['category']}'") > 0) {
			$errors['category'] = '이미 생성되어 있는 카테고리입니다.';
		}
		
		if (sizeof($errors) == 0) {
			$mDB->DBupdate('minitalk_category_table',$insert,'',"where `idx`='$idx'");
			$return['success'] = true;
		} else {
			$return['success'] = false;
			$return['errors'] = $errors;
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'delete') {
		$idx = Request('idx');
		
		$category = $mDB->DBfetch('minitalk_category_table','*',"where `idx`='$idx'");
		if ($category['parent'] == '0') {
			$mDB->DBdelete('minitalk_category_table',"where `parent`='{$category['idx']}'");
			$mDB->DBdelete('minitalk_channel_table',"where `category1`='{$category['idx']}'");
		} else {
			$mDB->DBdelete('minitalk_channel_table',"where `category2`='{$category['idx']}'");
		}
		$mDB->DBdelete('minitalk_category_table',"where `idx`='{$category['idx']}'");
		
		$return['success'] = true;
		exit(json_encode($return));
	}
}

if ($action == 'channel') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	$mDB = new DB();
	
	if ($do == 'add') {
		$insert = array();
		$errors = array();
		$insert['category1'] = Request('category1');
		$insert['category2'] = Request('category2');
		$insert['channel'] = Request('channel');
		$insert['title'] = Request('title');
		$insert['grade_chat'] = Request('grade_chat');
		$insert['grade_font'] = Request('grade_font');
		$insert['is_broadcast'] = Request('is_broadcast') == 'on' ? 'TRUE' : 'FALSE';
		$insert['is_nickname'] = Request('is_nickname') == 'on' ? 'TRUE' : 'FALSE';
		$insert['notice'] = Request('notice');
		$insert['maxuser'] = Request('maxuser');
		
		if ($mDB->DBcount('minitalk_channel_table',"where `channel`='{$insert['channel']}'") > 0) {
			$errors['channel'] = '이미 생성되어 있는 채널명입니다.';
		}
		
		$return = array();
		if (sizeof($errors) == 0) {
			$mDB->DBinsert('minitalk_channel_table',$insert);
			$return['success'] = true;
		} else {
			$return['success'] = false;
			$return['errors'] = $errors;
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'modify') {
		$insert = array();
		$errors = array();
		$channel = Request('channel');
		$insert['category1'] = Request('category1');
		$insert['category2'] = Request('category2');
		$insert['title'] = Request('title');
		$insert['grade_chat'] = Request('grade_chat');
		$insert['grade_font'] = Request('grade_font');
		$insert['is_broadcast'] = Request('is_broadcast') == 'on' ? 'TRUE' : 'FALSE';
		$insert['is_nickname'] = Request('is_nickname') == 'on' ? 'TRUE' : 'FALSE';
		$insert['notice'] = Request('notice');
		$insert['maxuser'] = Request('maxuser');
		
		$return = array();
		if (sizeof($errors) == 0) {
			$mDB->DBupdate('minitalk_channel_table',$insert,'',"where `channel`='$channel'");
			$return['success'] = true;
		} else {
			$return['success'] = false;
			$return['errors'] = $errors;
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'delete') {
		$channel = Request('channel');
		$mDB->DBdelete('minitalk_channel_table',"where `channel`='$channel'");
		
		$return['success'] = true;
		exit(json_encode($return));
	}
}

if ($action == 'log') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	$mDB = new DB();
	
	if ($do == 'delete') {
		$file = Request('file');
		
		$mDB->DBdelete('minitalk_log_file_table',"where `file`='$file'");
		@unlink('../log/'.$file);
		
		$return['success'] = true;
		exit(json_encode($return));
	}
	
	if ($do == 'download') {
		$file = Request('file');
		
		if (file_exists('../log/'.$file) == true) {
			header("Cache-control: private");
	
			header("Content-type:application/octet-stream");
			header("Content-Length:".filesize('../log/'.$file));
			header("Content-Disposition:attachment;filename=".$file);
			header("Content-Transfer-Encoding:binary");
			header("Pragma:no-cache");
			header("Expires:0");
			header("Connection:close");
	
			$fp = fopen('../log/'.$file,'r');
			while(!feof($fp)) {
				echo fread($fp,1024*1024);
				flush();
			}
			fclose($fp);
		} else {
			Alertbox('해당 로그파일을 서버에서 찾을 수 없습니다.');
		}
	}
}

if ($action == 'ip') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	$mDB = new DB();
	
	if ($do == 'add') {
		$insert = array();
		$errors = array();
		
		$insert['ip'] = Request('ip');
		$insert['nickname'] = Request('nickname');
		$insert['memo'] = Request('memo');
		$insert['reg_date'] = time();
		
		if ($mDB->DBcount('minitalk_ipban_table',"where `ip`='{$insert['ip']}'") > 0) {
			$errors['ip'] = '이미 추가된 아이피입니다.';
		}
		
		if (sizeof($errors) == 0) {
			$mDB->DBinsert('minitalk_ipban_table',$insert);
			$return['success'] = true;
		} else {
			$return['success'] = false;
			$return['errors'] = $errors;
		}
		
		exit(json_encode($return));
	}
	
	if ($do == 'delete') {
		$ip = Request('ip');
		$mDB->DBdelete('minitalk_ipban_table',"where `ip`='$ip'");
		$return['success'] = true;
		exit(json_encode($return));
	}
}

if ($action == 'broadcast') {
	$logged = Request('logged','session');
	if ($logged !== 'TRUE') exit(json_encode(array('success'=>false)));
	$mDB = new DB();
	
	if ($do == 'send') {
		$type = Request('type');
		$message = Request('message');
		$nickname = Request('nickname') ? Request('nickname') : 'ADMIN';
		$url = Request('url') ? Request('url') : '';
		
		$protocol = array('type'=>$type,'nickname'=>$nickname,'url'=>$url,'message'=>$message);
		if ($type == 'notice') {
			$broadcastMessege = json_encode(array('message'=>$message,'url'=>$url));
		} else {
			$broadcastMessege = json_encode(array('nickname'=>$nickname,'message'=>$message,'url'=>$url));
		}
		
		$totalReceiver = 0;
		$server = $mDB->DBfetchs('minitalk_server_table','*',"where `status`='ONLINE'");
		for ($i=0, $loop=sizeof($server);$i<$loop;$i++) {
			if ($server[$i]['type'] == 'SELF') {
				$elephant = new Client('http://'.$_SERVER['SERVER_ADDR'].':'.$server[$i]['port'],'socket.io',1,false,true,true);
				$elephant->init();
				$elephant->emit($type,$broadcastMessege);
				$elephant->close();
				$totalReceiver+= $server[$i]['user'];
			}
		}
		
		$mDB->DBinsert('minitalk_broadcast_table',array('type'=>$type,'message'=>$message,'url'=>$url,'receiver'=>$totalReceiver,'reg_date'=>time()));
		
		$return['success'] = true;
		$return['receiver'] = $totalReceiver;
		
		exit(json_encode($return));
	}
}
?>