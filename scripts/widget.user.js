/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 접속자 및 나의 정보와 관련된 부분을 처리한다.
 * 
 * @file /scripts/widget.user.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.4
 * @modified 2021. 4. 26.
 */
Minitalk.user = {
	latestRefreshTime:0, // 접속자목록을 마지막으로 갱신한 시각
	count:0, // 접속자수
	me:{}, // 나의정보
	users:{},
	isAutoHideUsers:false,
	isVisibleUsers:false,
	/**
	 * 유저참여를 처리한다.
	 *
	 * @param object user 접속자유저
	 * @param int count 접속자수
	 * @param int time 참여시각
	 */
	join:function(user,count,time) {
		/**
		 * 참여 메시지를 출력한다.
		 */
		if (Minitalk.socket.joined == true) {
			Minitalk.ui.printUserMessage("join",user,Minitalk.getText("action/join").replace("{NICKNAME}",user.nickname));
		}
		
		/**
		 * 채널의 접속자수를 변경한다.
		 */
		Minitalk.user.updateCount(count,time);
		
		/**
		 * 유저목록이 활성화 된 경우, 유저를 추가한다.
		 */
		if (Minitalk.user.isVisibleUsers == true) {
			Minitalk.user.appendUser(user);
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("join",[user,count,time]);
	},
	/**
	 * 유저종료를 처리한다.
	 *
	 * @param object user 접속자유저
	 * @param int count 접속자수
	 * @param int time 참여시각
	 */
	leave:function(user,count,time) {
		/**
		 * 종료 메시지를 출력한다.
		 */
		if (Minitalk.socket.joined == true) {
			Minitalk.ui.printUserMessage("leave",user,Minitalk.getText("action/leave").replace("{NICKNAME}",user.nickname));
		}
		
		/**
		 * 채널의 접속자수를 변경한다.
		 */
		Minitalk.user.updateCount(count,time);
		
		/**
		 * 유저목록이 활성화 된 경우, 유저를 제거한다.
		 */
		if (Minitalk.user.isVisibleUsers == true) {
			Minitalk.user.removeUser(user);
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("leave",[user,count,time]);
	},
	/**
	 * 유저정보를 변경한다.
	 *
	 * @param object before 변경전 유저정보
	 * @param object after 변경후 유저정보
	 */
	update:function(before,after) {
		/**
		 * 관리자권한을 획득한 경우
		 */
		if (before.level != 9 && after.level == 9) {
			Minitalk.ui.printUserMessage("update",after,Minitalk.getText("action/updated_op").replace("{NICKNAME}",after.nickname));
		}
		
		/**
		 * 닉네임이 변경된 경우
		 */
		if (before.nickname != after.nickname) {
			Minitalk.ui.printUserMessage("update",after,Minitalk.getText("action/updated_nickname").replace("{BEFORE}",before.nickname).replace("{AFTER}",after.nickname));
		}
		
		/**
		 * 유저목록이 활성화되어 있는 경우, 유저목록의 정보를 갱신한다.
		 */
		if (Minitalk.user.isVisibleUsers === true) {
			var $frame = $("div[data-role=frame]");
			var $main = $("main",$frame);
			var $section = $("section[data-role=users]",$main);
			var $users = $("ul",$section);
			var $item = $("li[data-nickname=" + before.nickname + "]",$users);
			if ($item.length == 1) {
				$item.attr("data-nickname",after.nickname);
				$item.empty();
				$item.append(Minitalk.user.getTag(after));
				Minitalk.user.sortUsers();
			}
		}
	},
	/**
	 * 유저목록을 새로고침한다.
	 */
	reload:function() {
		/**
		 * 유저탭이 활성화 되어 있지 않은 경우 새로고침하지 않는다.
		 */
		if (Minitalk.user.isVisibleUsers === false) return;
		
		Minitalk.ui.createUsers(true);
	},
	/**
	 * 유저목록에 유저를 추가한다.
	 *
	 * @param object user
	 */
	appendUser:function(user) {
		var $frame = $("div[data-role=frame]");
		var $main = $("main",$frame);
		var $users = $("section[data-role=users]",$main);
		var $lists = $("ul",$users);
		var $item = $("li[data-nickname=" + user.nickname + "]",$lists);
		if ($item.length == 0) {
			var $item = $("<li>").attr("data-nickname",user.nickname);
			$item.append(Minitalk.user.getTag(user));
			$lists.append($item);
			
			Minitalk.user.sortUsers();
		}
	},
	/**
	 * 유저목록에서 유저를 제거한다.
	 *
	 * @param object user
	 */
	removeUser:function(user) {
		var $frame = $("div[data-role=frame]");
		var $main = $("main",$frame);
		var $users = $("section[data-role=users]",$main);
		var $lists = $("ul",$users);
		var $item = $("li[data-nickname=" + user.nickname + "]",$lists);
		if ($item.length == 1) $item.remove();
	},
	/**
	 * 유저목록을 갱신한다.
	 *
	 * @param object[] users
	 */
	updateUsers:function(users) {
		var $frame = $("div[data-role=frame]");
		var $main = $("main",$frame);
		var $users = $("section[data-role=users]",$main);
		$users.empty();
		
		var $lists = $("<ul>");
		$users.append($lists);
		
		/**
		 * 박스인경우 초대하기 버튼을 추가한다.
		 */
		if (Minitalk.box.isBox() == true) {
			var $invite = $("<button>").attr("type","button").attr("data-action","invite");
			$invite.append($("<i>").addClass("icon"));
			$invite.append($("<label>").html(Minitalk.getText("box/invite")));
			$invite.on("click",function() {
				Minitalk.box.invite("");
			});
			$lists.append($("<li>").append($invite));
		}
		
		/**
		 * 나를 추가한다.
		 */
		var $item = $("<li>").attr("data-nickname",Minitalk.user.me.nickname);
		$item.append(Minitalk.user.getTag(Minitalk.user.me));
		$lists.append($item);
		
		for (var i=0, loop=users.length;i<loop;i++) {
			if (users[i].nickname == Minitalk.user.me.nickname) continue;
			
			var user = users[i];
			var $item = $("<li>").attr("data-nickname",user.nickname);
			
			$item.append(Minitalk.user.getTag(user));
			$lists.append($item);
		}
		
		Minitalk.user.sortUsers();
	},
	/**
	 * 유저목록을 정렬한다.
	 */
	sortUsers:function() {
		var $frame = $("div[data-role=frame]");
		var $main = $("main",$frame);
		var $users = $("section[data-role=users]",$main);
		var $lists = $("ul",$users);
		var $items = $("li",$lists);
		
		[].sort.call($items,function(left,right) {
			var $left = $("label[data-role=user]",$(left));
			var leftUser = $left.data("user");
			var $right = $("label[data-role=user]",$(right));
			var rightUser = $right.data("user");
			
			/**
			 * 유저가 아닌 경우 항상 처음에 출력한다.
			 */
			if ($(left).attr("data-nickname") === undefined) return -1;
			if ($(right).attr("data-nickname") === undefined) return 1;
			
			/**
			 * 유저목록에서 나를 항상 처음에 출력한다.
			 */
			if ($left.hasClass("me") == true) return -1;
			if ($right.hasClass("me") == true) return 1;
			
			/**
			 * 권한이 더 높거나 닉네임 순서대로 유저목록을 정렬한다.
			 */
			return leftUser.level < rightUser.level || (leftUser.level == rightUser.level && leftUser.nickname > rightUser.nickname) ? 1 : -1;
		});
		
		$items.each(function(){
			$lists.append(this);
		});
	},
	/**
	 * 접속자수를 업데이트한다.
	 *
	 * @param int usercount
	 */
	updateCount:function(usercount,time) {
		// 마지막 접속자수 갱신시간보다 과거일 경우 접속자수를 변경하지 않는다.
		if (time !== undefined && Minitalk.user.latestRefreshTime > time) return;
		Minitalk.user.latestRefreshTime = time;
		Minitalk.user.count = usercount;
		
		/**
		 * 접속자수를 표시한다.
		 */
		Minitalk.ui.printUserCount(Minitalk.user.count);
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("updateUserCount",[Minitalk.user.count]);
	},
	/**
	 * 접속자수를 가져온다.
	 *
	 * @return int usercount
	 */
	getCount:function() {
		return Minitalk.user.count;
	},
	/**
	 * 접속자태그를 가져온다.
	 *
	 * @param object user 유저객체
	 * @return object $user 접속자태그
	 */
	getTag:function(user) {
		if (typeof user == "string") {
			var user = {nickname:user,nickcon:null,photo:null,level:0,extras:null};
		}
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
		
		$nickname.append(Minitalk.user.getNickname(user,true));
		$user.append($nickname);
		
		$user.on("click",function(e) {
			Minitalk.user.toggleMenus($(this),e);
			e.preventDefault();
			e.stopImmediatePropagation();
		});
		
		return $user;
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
			error:function(result) {
				callback({success:false,error:"CONNECT_ERROR"});
			}
		});
	},
	/**
	 * 접속자 닉네임 또는 닉이미지를 가져온다.
	 *
	 * @param object user 유저객체
	 * @param boolean is_nickcon 닉 이미지를 사용할지 여부 (기본값 : false)
	 */
	getNickname:function(user,is_nickcon) {
		var is_nickcon = is_nickcon === true ? true : false;
		
		if (is_nickcon === true && user.nickcon != null) {
			var nickcon = user.nickcon.split(",");
			for (var i=0, loop=nickcon.length;i<loop;i++) {
				if (nickcon[i] == "{NICKNAME}") nickcon[i] = user.nickname;
				else nickcon[i] = '<img src="' + nickcon[i] + '" alt="' + user.nickname + '" title="' + user.nickname + '">';
			}
			return nickcon.join("");
		} else {
			return user.nickname;
		}
	},
	/**
	 * 접속자목록을 가져온다.
	 *
	 * @param int page 접속자목록페이지번호
	 * @param string keyword 검색어
	 * @param function callback
	 */
	getUsers:function(callback) {
		if (Minitalk.socket.isConnected() === false) callback({success:false,error:"NOT_CONNECTED"});
		
		$.get({
			url:Minitalk.socket.connection.domain+"/users",
			dataType:"json",
			headers:{authorization:"TOKEN " + Minitalk.socket.token},
			success:function(result) {
				if (result.success == true && result.users === undefined) result.success = false;
				callback(result);
			},
			error:function(result) {
				callback({success:false,error:"CONNECT_ERROR"});
			}
		});
	},
	/**
	 * 유저를 호출한다.
	 *
	 * @param string nickname 호출할 대상 닉네임
	 * @param function callback
	 */
	call:function(nickname,callback) {
		if (Minitalk.socket.isConnected() === false) callback({success:false,error:"NOT_CONNECTED"});
		
		/**
		 * 권한이 있는지 확인한다.
		 */
		if (Minitalk.socket.getPermission("send") === false) {
			Minitalk.ui.printErrorCode(403);
			return;
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		if (Minitalk.fireEvent("beforeSendCall",[nickname]) === false) return;
		
		$.post({
			url:Minitalk.socket.connection.domain+"/call/" + nickname,
			dataType:"json",
			headers:{authorization:"TOKEN " + Minitalk.socket.token},
			success:function(result) {
				callback(result);
				
				/**
				 * 이벤트를 발생시킨다.
				 */
				Minitalk.fireEvent("afterSendCall",[result.success,nickname]);
			},
			error:function(result) {
				if (result.status == 403 || result.status == 404) {
					Minitalk.ui.printError(result.responseJSON.error);
				} else {
					callback({success:false,error:"CONNECT_ERROR"});
				}
				
				/**
				 * 이벤트를 발생시킨다.
				 */
				Minitalk.fireEvent("afterSendCall",[false,nickname]);
			}
		});
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("sendCall",[nickname]);
	},
	/**
	 * 유저메뉴를 추가한다.
	 *
	 * @param string/menu 메뉴
	 * @param int/string position 위치
	 */
	appendMenu:function(menu,position) {
		if (position === undefined || position === null) {
			Minitalk.usermenus.push(menu);
		} else if (typeof position == "string") {
			var index = null;
			for (var i=0, loop=Minitalk.usermenus.length;i<loop;i++) {
				if (typeof Minitalk.usermenus[i] == "string" && Minitalk.usermenus[i] == position) {
					index = i + 1;
					break;
				}
				
				if (typeof Minitalk.usermenus[i] == "object" && Minitalk.usermenus[i].name == position) {
					index = i + 1;
					break;
				}
			}
			
			if (index === null) Minitalk.user.appendMenu(menu);
			else Minitalk.user.appendMenu(menu,index);
			return;
		} else if (typeof position == "number") {
			Minitalk.usermenus.splice(position,0,menu);
		}
	},
	/**
	 * 유저메뉴를 토클한다.
	 *
	 * @param object $dom 메뉴를 호출한 대상의 DOM객체
	 * @param event e
	 */
	toggleMenus:function($dom,e) {
		var user = $dom.data("user");
		if (user === undefined) return;
		if (Minitalk.socket.isConnected() === false) return;
		
		/**
		 * 기존에 보이고 있던 유저메뉴가 있다면 제거한다.
		 */
		if ($("ul[data-role=usermenus]").length > 0) {
			$("ul[data-role=usermenus]").remove();
		}
		
		$("ul[data-role=usermenus]").on("click",function(e) {
			e.stopImmediatePropagation();
		});
		
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
			} else {
				user.status = "offline";
			}
			$("i",$name).removeClass("mi mi-loading").addClass("status " + user.status);
			
			var separator = true;
			
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
						/**
						 * 기본 메뉴를 추가한다.
						 */
						if ($.inArray(menu,["configs","create","whisper","call","invite","showip","banip","op","deop"]) === -1) continue;
						
						/**
						 * 관리자가 아닌 경우 관리자 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["banmsg","showip","banip","op","deop"]) !== -1 && Minitalk.user.me.level < 9) continue;
						
						/**
						 * 자신에게 숨겨야 하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["whisper","call","invite","banip"]) !== -1 && Minitalk.user.me.nickname == user.nickname) continue;
						
						/**
						 * 자신에게만 보여야하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["configs","create"]) !== -1 && Minitalk.user.me.nickname != user.nickname) continue;
						
						/**
						 * 개인박스에서 숨겨야하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["create","invite","banip","op","deop"]) !== -1 && Minitalk.box.isBox() == true) continue;
						
						/**
						 * 박스생성권한이 없을경우 숨겨야하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["create","invite"]) !== -1 && Minitalk.socket.getPermission("box") == false) continue;
						
						separator = false;
						
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
					/**
					 * 메뉴가 보여야하는 조건함수가 있는 경우, 조건에 만족하지 못하면 추가하지 않는다.
					 */
					if (typeof menu.visible == "function") {
						if (menu.visible(Minitalk,user,Minitalk.user.me) === false) continue;
					}
					
					separator = false;
					
					/**
					 * 사용자정의 메뉴를 추가한다.
					 */
					var $menu = $("<li>");
					var $button = $("<button>").attr("type","button").attr("data-menu",menu.name);
					var $icon = $("<i>");
					if (menu.icon) $icon.css("backgroundImage","url(" + menu.icon + ")");
					if (menu.iconClass) $icon.addClass(menu.iconClass);
					$button.append($icon);
				
					$button.append($("<span>").html(menu.text));
					$button.data("menu",menu);
					$button.on("click",function(e) {
						Minitalk.user.activeMenu($(this),e);
					});
					$menu.append($button);
					$menus.append($menu);
				}
			}
			
			if ($("li:last",$menus).hasClass("separator") === true) {
				$("li:last",$menus).remove();
			}
			
			if ($("li:first",$menus).hasClass("separator") === true) {
				$("li:first",$menus).remove();
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
		var menu = $menu.data("menu");
		if (Minitalk.fireEvent("beforeActiveUserMenu",[menu,$menu,e]) === false) return;
		
		var $menus = $("ul[data-role=usermenus]");
		var user = $menus.data("user");
		
		if (typeof menu == "string") {
			switch (menu) {
				case "configs" :
					Minitalk.ui.createConfigs();
					break;
					
				case "create" :
					Minitalk.box.create();
					break;
					
				case "whisper" :
					Minitalk.ui.setInputVal("/w " + user.nickname + " ");
					$menus.remove();
					break;
					
				case "call" :
					var $icon = $("i",$menu).removeClass().addClass("mi mi-loading");
					Minitalk.user.call(user.nickname,function(result) {
						if (result.success == true) {
							Minitalk.ui.notify("call","action",Minitalk.getText("action/call").replace("{NICKNAME}",user.nickname));
						}
						
						$menus.remove();
					});
					break;
					
				case "invite" :
					Minitalk.box.invite(user.nickname);
					break;
					
				case "showip" :
					Minitalk.socket.send("showip",user.nickname);
					break;
					
				case "banip" :
					Minitalk.socket.send("banip",user.nickname);
					break;
					
				case "op" :
					Minitalk.socket.send("op",user.nickname);
					break;
					
				case "deop" :
					Minitalk.socket.send("deop",user.nickname);
					break;
			}
		} else {
			if (typeof menu.handler == "function") {
				menu.handler(Minitalk,user,e);
			}
		}
		
		Minitalk.fireEvent("afterActiveUserMenu",[menu,$menu,e]);
	}
};