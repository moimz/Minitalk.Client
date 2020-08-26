/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 접속자 및 나의 정보와 관련된 부분을 처리한다.
 * 
 * @file /scripts/widget.user.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 7. 8.
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
	 * 접속자태그를 가져온다.
	 *
	 * @param object user 유저객체
	 * @return object $user 접속자태그
	 */
	getTag:function(user) {
		var $user = $("<label>").attr("data-role","user").data("user",user);
		
		if (user.nickname == Minitalk.user.me.nickname) $user.addClass("me");
		if (user.level == 9) $user.addClass("admin");
		
		var $photo = $("<i>").attr("data-role","photo");
		if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
		$user.append($photo);
		
		var $nickname = $("<span>").attr("data-role","nickname");
		
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
			Minitalk.user.toggleMenus($(this),e);
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
	},
	/**
	 * 접속자 정보를 서버로부터 가져온다.
	 *
	 * @param string nickname 정보를 가져올 유저닉네임
	 * @param function callback
	 */
	getUser:function(nickname,callback) {
		if (Minitalk.socket.isConnected() === false) callback({success:false,error:"NOT_CONNECTED"});
		
		$.get({
			url:Minitalk.socket.connection.domain+"/user/" + nickname,
			dataType:"json",
			headers:{authorization:"TOKEN " + Minitalk.socket.token},
			success:function(result) {
				if (result.success == true && result.user === undefined) result.success = false;
				callback(result);
			},
			error:function() {
				callback({success:false,error:"CONNECT_ERROR"});
			}
		});
	},
	/**
	 * 접속자목록을 가져온다.
	 *
	 * @param int page 접속자목록페이지번호
	 * @param string keyword 검색어
	 * @param function callback
	 */
	getUsers:function(page,keyword,callback) {
		if (Minitalk.socket.isConnected() === false) callback({success:false,error:"NOT_CONNECTED"});
		
		$.get({
			url:Minitalk.socket.connection.domain+"/users",
			dataType:"json",
			data:{start:(page - 1),limit:50,keyword:keyword},
			headers:{authorization:"TOKEN " + Minitalk.socket.token},
			success:function(result) {
				if (result.success == true && result.users === undefined) result.success = false;
				callback(result);
			},
			error:function() {
				callback({success:false,error:"CONNECT_ERROR"});
			}
		});
	},
	/**
	 * 유저메뉴를 토클한다.
	 *
	 * @param object $dom 메뉴를 호출한 대상의 DOM객체
	 * @param event e
	 */
	toggleMenus:function($dom,e) {
		var user = $dom.data("user");
		if (user === undefined) {
			e.stopImmediatePropagation();
			return;
		}
		
		if (Minitalk.socket.isConnected() === false) {
			return;
		}
		
		/**
		 * 기존에 보이고 있던 유저메뉴가 있다면 제거한다.
		 */
		if ($("ul[data-role=usermenus]").length > 0) {
			$("ul[data-role=usermenus]").remove();
		}
		
		var separator = true;
		
		var $menus = $("<ul>").attr("data-role","usermenus");
		$menus.data("user",user);
		
		var $name = $("<li>").attr("data-role","nickname");
		$name.append($("<i>").addClass("mi mi-loading"));
		$name.append($("<label>").html(user.nickname));
		$menus.append($name);
		
		$("div[data-role=frame]").append($menus);
		
		var frameWidth = $("div[data-role=frame]").outerWidth(true);
		var frameHeight = $("div[data-role=frame]").outerHeight(true);
		var width = $menus.outerWidth(true);
		
		if (e.pageX + width < frameWidth) {
			$menus.css("left",e.pageX);
			$menus.css("right","auto");
		} else {
			$menus.css("left","auto");
			$menus.css("right",5);
		}
		
		if (e.pageY < frameHeight/2) {
			$menus.css("top",e.pageY);
			$menus.css("bottom","auto");
		} else {
			$menus.css("top","auto");
			$menus.css("bottom",frameHeight - e.pageY);
		}
		
		$menus.height($menus.height());
		
		Minitalk.user.getUser(user.nickname,function(result) {
			var $menus = $("ul[data-role=usermenus]");
			if ($menus.length == 0) return;
			
			var user = $menus.data("user");
			var $name = $("li[data-role=nickname]",$menus);
			
			if (result.success == true && user.nickname == result.user.nickname) {
				user.status = "online";
				$("i",$name).removeClass("mi mi-loading").addClass("online");
			} else {
				user.status = "offline";
				$("i",$name).removeClass("mi mi-loading").addClass("offline");
			}
			
			for (var index in Minitalk.usermenus) {
				var menu = Minitalk.usermenus[index];
				if (typeof menu == "string") {
					/**
					 * 구분자일 경우
					 */
					if (menu == "-") {
						/**
						 * 메뉴가 처음이거나, 현 구분자 직전에 구분자가 추가된 경우 추가로 구분자를 추가하지 않는다.
						 */
						if (separator === true) continue;
						separator = true;
						
						var $menu = $("<li>");
						$menu.addClass("separator");
						$menu.append($("<i>"));
					} else {
						separator = false;
						
						/**
						 * 기본 메뉴를 추가한다.
						 */
						if ($.inArray(menu,["whisper","call","showip","banip"]) === -1) continue;
						
						var $menu = $("<li>");
						var $button = $("<button>").attr("type","button").attr("data-menu",menu);
						$button.append($("<i>").addClass("icon"));
						$button.append($("<span>").html(Minitalk.getText("usermenu/" + menu)));
						$button.data("menu",menu);
						$button.on("click",function(e) {
							Minitalk.user.activeMenu($(this),e);
						});
						$menu.append($button);
					}
					
					$menus.append($menu);
				} else {
					separator = false;
					
					/**
					 * 사용자정의 툴버튼을 추가한다.
					 */
					var $menu = $("<li>");
					var $button = $("<button>").attr("type","button").attr("data-menu","custom");
					$button.append($("<i>").addClass(menu.iconCls));
					$button.append($("<span>").html(menu.text));
					$button.data("menu",menu);
					$button.on("click",function(e) {
						Minitalk.user.activeMenu($(this),e);
					});
					$menu.append($button);
					$menus.append($menu);
				}
			}
			
			var oHeight = $menus.height();
			$menus.height("auto");
			var height = $menus.height();
			$menus.height(oHeight);
			
			$menus.animate({height:height});
		});
	},
	/**
	 * 유저메뉴를 실행한다.
	 *
	 * @param object $menu 메뉴의 DOM 객체
	 * @param event e 이벤트객체
	 */
	activeMenu:function($menu,e) {
		
	}
};