<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html" charset="UTF-8" />
<META http-equiv="X-UA-Compatible" content="IE=8" />
<title>미니톡 관리자 로그인</title>
<style type="text/css">
@import url('../css/NanumGothicWeb.css');
BODY {background:#2F2F2F; margin:0px; padding:0px;}
.height10 {height:10px; overflow:hidden;}
.height100 {height:100px; overflow:hidden;}
.layoutfixed {width:100%; table-layout:fixed;}

.loginTitle {height:80px; background:#000000;}
.loginTitle DIV {width:440px; height:80px; margin:0 auto; background:url(./images/login_title.gif);}
.loginBox {width:420px; padding:10px; margin:10px auto; border:5px solid #4F4F4F; background:#000000;}
.loginBox .inputbox {border:2px solid #4F4F4F; background:#2F2F2F; color:#EEEEEE; font-family:verdana; font-size:16px; padding:3px; width:290px; height:18px;}
.loginBox .checkbox {width:13px; height:13px;}
.loginBox LABEL {cursor:pointer;}
.loginButton {margin:10px 5px 0px 5px; border-top:1px dashed #4F4F4F; text-align:right; font:0/0 arial; padding-top:10px;}
</style>
</head>
<body>
<table cellspacing="0" cellpadding="0" class="layoutfixed">
<tr class="height100">
	<td></td>
</tr>
<tr class="loginTitle">
	<td><div></div></td>
</tr>
<tr>
	<td>
		<div class="loginBox">
			<form method="post" action="./exec/Admin.do.php" target="loginFrame">
			<input type="hidden" name="action" value="login" />
			<table cellspacing="0" cellpadding="0" class="layoutfixed">
			<col width="105" /><col width="100%" />
			<tr>
				<td><img src="./images/text_user_id.gif" alt="아이디" /></td>
				<td><input type="text" name="user_id" class="inputbox" /></td>
			</tr>
			<tr class="height10">
				<td colspan="2"></td>
			</tr>
			<tr>
				<td><img src="./images/text_password.gif" alt="패스워드" /></td>
				<td><input type="password" name="password" class="inputbox" /></td>
			</tr>
			</table>

			<div class="loginButton">
				<table cellspacing="0" cellpadding="0" class="layoutfixed">
				<col width="100%" /><col width="65" />
				<tr>
					<td></td>
					<td><input type="image" src="./images/btn_login.gif" /></td>
				</tr>
				</table>
			</div>
			</form>
			<iframe name="loginFrame" style="display:none;"></iframe>
		</div>
	</td>
</tr>
</table>
</body>
</html>