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
	latestRefreshTime:0, // 접속자목록을 마지막으로 갱신한 시각
	me:{}, // 나의정보
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
	 * 접속자목록을 가져온다.
	 *
	 * @param int page 접속자목록페이지번호
	 * @param string keyword 검색어
	 */
	getUsers:function(page,keyword) {
		var $users = $("section[data-role=users]");
		if ($users.data("pagination") !== undefined) {
			var page = page ? page : $users.data("pagination").page;
			var keyword = keyword !== undefined ? keyword : $users.data("pagination").keyword;
		} else {
			var page = page ? page : 1;
			var keyword = keyword !== undefined ? keyword : null;
		}
		
		var $refresh = $("button[data-action=users-refresh]",$users);
		$refresh.disable();
		if ($refresh.data("timer")) {
			clearTimeout($refresh.data("timer"));
			$refresh.data("timer",null);
		}
		$refresh.data("timer",setTimeout(function($refresh) { $refresh.data("timer",null); $refresh.enable(); },5000,$refresh));
		
		Minitalk.socket.send("users",{page:page,keyword:keyword});
	},
	/**
	 * 접속자태그를 가져온다.
	 *
	 * @param object user 유저객체
	 * @return object $user 접속자태그
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
		
		$user.on("click",function(e) {
//			Minitalk.showUserMenu($(this),"users",e);
			e.preventDefault();
			e.stopImmediatePropagation();
		});
		
		return $user;
	},
	/**
	 * 접속자수를 표시한다.
	 *
	 * @param int count 접속자
	 */
	printUserCount:function(count,time) {
		if (time !== undefined) {
			if (Minitalk.user.latestRefreshTime > time) return;
			Minitalk.user.latestRefreshTime = time;
		}
		
		var $count = $("label[data-role=count]");
		
		if (count == 0) {
			$count.empty();
		} else {
			$count.html(Minitalk.getText("text/unit").replace("{COUNT}",count));
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		$(document).triggerHandler("printUserCount",[Minitalk,$count,count]);
		
//		Minitalk.ui.playSound("call");
		Minitalk.ui.playSound("query");
	}
};