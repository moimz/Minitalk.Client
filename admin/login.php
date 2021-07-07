<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자 레이아웃을 출력한다.
 * 관리자페이지와 관련된 파일은 ExtJS 라이센스정책에 따라 GPLv3 라이센스로 배포됩니다.
 * 
 * @file /admin/index.php
 * @author Arzz (arzz@arzz.com)
 * @license GPLv3
 * @version 7.2.1
 * @modified 2021. 7. 7.
 */
if (defined('__MINITALK__') == false) exit;
?>
<form id="MinitalkLoginForm">
	<main>
		<h1><i class="mi mi-lock"></i> Login to control panel</h1>
	
		<div class="inputbox">
			<div data-role="input">
				<input type="text" name="user_id" placeholder="User ID">
			</div>
			<div data-role="input">
				<input type="password" name="password" placeholder="Password">
			</div>
			<button type="submit"><i class="mi mi-go-bold"></i></button>
		</div>
		
		<label class="autoLogin"><input type="checkbox" name="auto_login" value="TRUE"> Keep me signed in</label>
	</main>
</form>