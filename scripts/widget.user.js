/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 접속자 및 나의 정보와 관련된 부분을 처리한다.
 * 
 * @file /scripts/widget.ui.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 6. 16.
 */
Minitalk.user = {
	me:{},
	/**
	 * 나의정보를 초기화한다.
	 */
	init:function() {
		var storeMe = Minitalk.storage("me");
		
		if (storeMe == null) {
			this.me = {nickname:Minitalk.nickname,nickcon:Minitalk.nickcon,photo:Minitalk.photo,info:Minitalk.info,levelCode:Minitalk.levelCode};
		} else {
			this.me = storeMe;
			if (Minitalk.nickname) this.me.nickname = Minitalk.nickname;
			if (Minitalk.nickcon) this.me.nickcon = Minitalk.nickcon;
			if (Minitalk.info && typeof Minitalk.info == "object") this.me.info = Minitalk.info;
		}
	},
	/**
	 * 접속자 닉네임 또는 닉이미지를 가져온다.
	 *
	 * @param object user 유저객체
	 * @param boolean is_nickcon 닉 이미지를 사용할지 여부 (기본값 : true)
	 */
	getNickname:function(user,is_nickcon) {
		return user.nickname;
	},
	/**
	 * 유저태그를 가져온다.
	 *
	 * @param object user 유저객체
	 * @return object $user 유저태그
	 */
	getTag:function(user) {
		var $user = $("<label>").attr("data-role","user").data("user",user);
		
		if (user.nickname == Minitalk.user.me.nickname) $user.addClass("me");
		if (user.level == 9) $user.addClass("admin");
		
		var $photo = $("<i>").addClass("photo");
		if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
		$user.append($photo);
		
		var $nickname = $("<span>").addClass("nickname");
		
		if (user.nickname == Minitalk.user.me.nickname) {
			var $me = $("<i>").addClass("me").html(Minitalk.getText("text/me"));
			$nickname.append($me);
		}
		
		if (user.level == 9) {
			var $admin = $("<i>").addClass("admin").html(Minitalk.getText("text/admin"));
			$nickname.append($admin);
		}
		
		$nickname.append(Minitalk.user.getNickname(user));
		$user.append($nickname);
		
		
		return $user;
	}
};