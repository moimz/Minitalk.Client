<?php
REQUIRE_ONCE './config/default.conf.php';
unset($_SESSION['logged']);

$checking_php = preg_match('/5\.(0|1|2|3|4|5)\.[0-9]+/',@phpversion()) == true;
$checking_mcrypt = function_exists('mcrypt_encrypt');
$checking_json = function_exists('json_encode');
$checking_xml = class_exists('SimpleXMLElement');
$checking_curl = function_exists('curl_init');
$checking_mysql = preg_match('/5\.[0-9]+\.[0-9]+/',@mysql_get_client_info()) == true;
$checking_config = is_dir('./config') == true && (substr(sprintf('%o',fileperms('./config')),2,3) == 707 || substr(sprintf('%o',fileperms('./config')),2,3) == 777);
$checking_log = is_dir('./log') == true && (substr(sprintf('%o',fileperms('./log')),2,3) == 707 || substr(sprintf('%o',fileperms('./log')),2,3) == 777);
$checking_session = is_dir('./session') == true && (substr(sprintf('%o',fileperms('./session')),2,3) == 707 || substr(sprintf('%o',fileperms('./session')),2,3) == 777);
$checking_server = is_dir('./server') == true && (substr(sprintf('%o',fileperms('./server')),2,3) == 707 || substr(sprintf('%o',fileperms('./server')),2,3) == 777);
$checking_older_info = file_exists('./config/key.conf.php') == false && file_exists('./config/db.conf.php') == false && file_exists('./config/admin.conf.php') == false;
$checking_older_info = true;
$check_pass_step1 = $checking_php && $checking_mcrypt && $checking_json && $checking_xml && $checking_curl && $checking_mysql && $checking_config && $checking_log && $checking_session && $checking_older_info;
$check_pass_step3 = file_exists('./config/key.conf.php.temp') && file_exists('./config/db.conf.php.temp') && file_exists('./config/admin.conf.php.temp');

$step = Request('step') ? Request('step') : '1';
if ($check_pass_step3 == false && $step == '3') $step = '2';
if ($check_pass_step1 == false && $step != '1') $step = 1;
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title>MiniTalk6 Install</title>
	<meta name="description" content="">
	<meta name="viewport" content="width=device-width, initial-scale=0.9, maximum-scale=0.9">

	<link rel="stylesheet" href="./install/css/bootstrap.min.css">
	<style>
		body {padding-top:50px; padding-bottom:20px;}
		body {font-family:"Nanum Gothic","Helvetica Neue",Helvetica,Arial,sans-serif;}
		h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6 {font-family:"Nanum Gothic","Helvetica Neue",Helvetica,Arial,sans-serif;}
	</style>
	<script src="./script/jquery.1.9.0.min.js"></script>
	<script src="./install/script/bootstrap.min.js"></script>
</head>
<body>
	<div class="container" style="width:700px;">
		<div class="panel panel-default">
			<div class="panel-heading">
				<h3 class="panel-title">미니톡6 설치 (단계 <?php echo $step; ?>)</h3>
			</div>
			<div class="panel-body">
				<?php if ($step == '1') { ?>
				<p>미니톡6 설치 요구사항을 확인합니다.</p>
				
				<hr>
				
				<p><?php echo $checking_older_info == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> 이전 설치정보 확인<?php if ($checking_older_info == false) { ?><br /><small class="text-danger">이전 설치정보가 있습니다. config 폴더내의 key.conf.php, db.conf.php, admin.conf.php 파일을 삭제하세요.</small><?php } ?></p>
				
				<p><?php echo $checking_php == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> PHP 버전 5.0 이상 (현재 버전 : <?php echo @phpversion(); ?>)<?php if ($checking_php == false) { ?><br /><small class="text-danger">미니톡홈페이지의 PHP설치요구사항 문서를 참고하여 PHP를 다시 설치하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_mcrypt == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> PHP MCRYPT Module<?php if ($checking_mcrypt == false) { ?><br /><small class="text-danger">미니톡홈페이지의 PHP설치요구사항 문서를 참고하여 PHP를 다시 설치하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_json == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> PHP JSON Module<?php if ($checking_json == false) { ?><br /><small class="text-danger">미니톡홈페이지의 PHP설치요구사항 문서를 참고하여 PHP를 다시 설치하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_xml == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> PHP XML Module<?php if ($checking_xml == false) { ?><br /><small class="text-danger">미니톡홈페이지의 PHP설치요구사항 문서를 참고하여 PHP를 다시 설치하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_curl == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> PHP CURL Module<?php if ($checking_curl == false) { ?><br /><small class="text-danger">미니톡홈페이지의 PHP설치요구사항 문서를 참고하여 PHP를 다시 설치하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_mysql == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> MySQL 버전 5.0 이상 (현재 버전 : <?php echo @mysql_get_client_info(); ?>)<?php if ($checking_mysql == false) { ?><br /><small class="text-danger">MySQL 최신버전을 설치하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_config == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> config 폴더 퍼미션<?php if ($checking_config == false) { ?><br /><small class="text-danger">미니톡폴더내의 config 폴더의 퍼미션을 707 또는 777로 변경하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_log == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> log 폴더 퍼미션<?php if ($checking_log == false) { ?><br /><small class="text-danger">미니톡폴더내의 log 폴더의 퍼미션을 707 또는 777로 변경하여 주십시오.</small><?php } ?></p>
				
				<p><?php echo $checking_session == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> session 폴더 퍼미션<?php if ($checking_session == false) { ?><br /><small class="text-danger">미니톡폴더내의 session 폴더의 퍼미션을 707 또는 777로 변경하여 주십시오.</small><?php } ?></p>
				
				<?php if (is_dir($_ENV['path'].'/server') == true) { ?>
				<hr>
				<p>미니톡폴더내에 서버용 프로그램이 있습니다.<br />서버프로그램도 함께 설치하고자 한다면 아래의 요구사항을 따라주십시오.</p>
				
				<p><?php echo $checking_server == true ? '<span class="label label-primary">확인됨</span>' : '<span class="label label-danger">확인필요</span>'; ?> Check server folder permission<?php if ($checking_server == false) { ?><br /><small class="text-danger">미니톡폴더내의 server 폴더의 퍼미션을 707 또는 707로 변경하여 주십시오.<br />Please set permission 707 or 777 server folder in MiniTalk folder</small><?php } ?></p>
				
				<p><span class="label label-default">확인불가</span> Node.JS 설치<br /><small>미니톡은 Node.JS 가 필요합니다. Node.JS를 설치하려면 아래의 설명을 따르시기 바랍니다. Node.JS를 이미 설치하셨다면 생략하셔도 됩니다.</small></p>
				
				<div class="well">
					<p>1. SSH를 이용하여 서버에 접속합니다.</p>
					<p>2. MiniTalk 폴더내의 lib/node-v0.10.25 폴더로 이동합니다.</p>
					<p><code>$ move /YourMiniTalkFolder/lib/node-v0.10.25</code></p>
					<p>3. 아래의 명령어를 차례로 입력합니다.</p>
					<p><code>$ ./configure</code></p>
					<p><code>$ make && make install</code></p>
				</div>
				<?php } ?>
				
				<div class="row">
					<div class="col-xs-2">
					
					</div>
					
					<div class="col-xs-8"></div>
					
					<div class="col-xs-2">
						<a href="./install.php?step=2" class="btn btn btn-primary btn-block"<?php echo $check_pass_step1 == false ? ' disabled="disabled"' : ''; ?>>다음단계</a>
					</div>
				</div>
				
				<?php } elseif ($step == 2) { ?>
				<form class="form" role="form" method="post" target="execFrame" action="./install/install.do.php">
					<input type="hidden" name="step" value="2">
					<div class="form-group">
						<input type="text" name="key" class="form-control" placeholder="암호화 KEY" maxlength="32">
						<div class="help-block">암호화에 사용할 32자리의 KEY를 영어, 숫자, 점(.)를 이용하여 입력하여 주십시오.</div>
					</div>
					
					<hr>
					
					<div class="form-group">
						<input type="text" name="db_host" class="form-control" placeholder="DB호스트">
						<div class="help-block">DB호스트의 정보를 입력하여 주십시오. (예 : localhost)</div>
					</div>
					
					<div class="form-group">
						<input type="text" name="db_id" class="form-control" placeholder="DB아이디">
						<div class="help-block">DB서버의 로그인 아이디를 입력하여 주십시오.</div>
					</div>
					
					<div class="form-group">
						<input type="text" name="db_password" class="form-control" placeholder="DB패스워드">
						<div class="help-block">DB서버의 로그인 패스워드를 입력하여 주십시오.</div>
					</div>
					
					<div class="form-group">
						<input type="text" name="db_name" class="form-control" placeholder="DB명">
						<div class="help-block">DB명을 입력하여 주십시오.</div>
					</div>
					
					<hr>
					
					<div class="form-group">
						<input type="text" name="admin_id" class="form-control" placeholder="관리자아이디">
						<div class="help-block">관리자 로그인시 사용할 아이디를 입력하여 주십시오.</div>
					</div>
					
					<div class="form-group">
						<input type="text" name="admin_password" class="form-control" placeholder="관리자패스워드">
						<div class="help-block">관리자 로그인시 사용할 패스워드를 입력하여 주십시오.</div>
					</div>
					
					<div class="row">
						<div class="col-xs-2">
							<a href="./install.php?step=1" class="btn btn btn-default btn-block">이전단계</a>
						</div>
						
						<div class="col-xs-8"></div>
						
						<div class="col-xs-2">
							<button type="submit" class="btn btn btn-primary btn-block">다음단계</button>
						</div>
					</div>
				</form>
				
				<iframe name="execFrame" style="display:none;"></iframe>
				
				<?php } elseif ($step == 3) { ?>
				설치완료 버튼을 클릭하면 미니톡 설치를 마무리합니다.<br /><br />
				
				<div class="well">
					이 단계에서는 설치정보와 관련된 중요정보를 서버에 기록하고, 데이터베이스를 생성하므로 설치완료버튼을 클릭한 뒤 완료될때까지 브라우져를 종료하지 마십시오.
					<br />
					이전 데이터베이스 정보가 존재할 경우, 데이터는 그대로 유지하고 변경된 구조만 반영합니다.
				</div>
				
				<form class="form" role="form" method="post" target="execFrame" action="./install/install.do.php">
					<input type="hidden" name="step" value="3">
					<div class="row">
						<div class="col-xs-2">
							<a href="./install.php?step=2" class="btn btn btn-default btn-block">이전단계</a>
						</div>
						
						<div class="col-xs-8"></div>
						
						<div class="col-xs-2">
							<button type="submit" class="btn btn btn-primary btn-block" data-loading-text="완료중..">설치완료</button>
						</div>
					</div>
				</form>
				
				<iframe name="execFrame" style="display:none;"></iframe>
				<?php } elseif ($step == 4) { ?>
				미니톡설치가 완료되었습니다.<br />관리자화면으로 이동하여 미니톡관리를 시작할 수 있습니다.<br /><br />
				<a href="./admin" class="btn btn btn-primary btn-block">미니특 관리자 페이지로 이동</a>
				<?php } ?>
			</div>
		</div>
	</div>
</body>
</html>