/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 접속자 및 나의 정보와 관련된 부분을 처리한다.
 * 
 * @file /scripts/widget.user.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 7.
 */
Minitalk.user = {
	menus:[],
	usersSort:[],
	users:{},
	isAutoHideUsers:false,
	isVisibleUsers:false,
	count:0, // 접속자수
	me:{}, // 나의정보
	/**
	 * 나의정보를 초기화한다.
	 */
	init:function() {
		var storeMe = Minitalk.storage("me");
		
		if (storeMe == null) {
			this.me = {id:"",nickname:Minitalk.nickname,nickcon:Minitalk.nickcon,sns:Minitalk.sns,device:Minitalk.device,info:Minitalk.info,status:Minitalk.status,opper:""};
		} else {
			this.me = storeMe;
			this.me.device = Minitalk.device;
			if (Minitalk.nickname) this.me.nickname = Minitalk.nickname;
			if (Minitalk.nickcon) this.me.nickcon = Minitalk.nickcon;
			if (Minitalk.info && typeof Minitalk.info == "object") this.me.info = Minitalk.info;
		}
	},
	/**
	 * 유저가 참여하였을 때
	 *
	 * @param object user 유저정보
	 * @param int usercount 유저수
	 */
	join:function(user,usercount) {
		Minitalk.user.updateCount(usercount);
		
		if (Minitalk.viewUserNotification == true) {
			if (Minitalk.user.checkLimit(Minitalk.viewUserNotificationLimit,user.opper) == true) {
				Minitalk.ui.printMessage("system",Minitalk.getText("action/join").replace("{NICKNAME}","<b><u>"+user.nickname+"</u></b>"));
			}
		}
		
		var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
		
		if (Minitalk.user.isVisibleUsers == true) {
			if (Minitalk.user.checkLimit(Minitalk.viewUserLimit,user.opper) == true) {
				Minitalk.user.usersSort.push("["+(user.opper ? sortUserCode[user.opper] : "")+user.nickname+"]");
				Minitalk.user.users[user.nickname] = user;
				Minitalk.user.usersSort.sort();
				var position = $.inArray("["+(user.opper ? sortUserCode[user.opper] : "")+user.nickname+"]",Minitalk.user.usersSort);

				if ($("aside[data-role=users] > label[data-role=user]").length < position) {
					$("aside[data-role=users]").append(Minitalk.user.getTag(user,true));
				} else {
					$($("aside[data-role=users] > label[data-role=user]")[position]).after(Minitalk.user.getTag(user,true));
				}
			}
		}
		
		Minitalk.fireEvent("join",[user,usercount]);
	},
	/**
	 * 유저가 종료하였을 때
	 *
	 * @param object user 유저정보
	 * @param int usercount 유저수
	 */
	leave:function(user,usercount) {
		Minitalk.user.updateCount(usercount);
		
		if (Minitalk.viewUserNotification == true) {
			if (Minitalk.user.checkLimit(Minitalk.viewUserNotificationLimit,user.opper) == true) {
				Minitalk.ui.printMessage("system",Minitalk.getText("action/leave").replace("{NICKNAME}","<b><u>"+user.nickname+"</u></b>"));
			}
		}
		
		var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
		
		if (Minitalk.user.isVisibleUsers == true) {
			if (Minitalk.user.checkLimit(Minitalk.viewUserLimit,user.opper) == true) {
				Minitalk.user.usersSort.splice($.inArray("["+(user.opper ? sortUserCode[user.opper] : "")+user.nickname+"]",Minitalk.user.usersSort),1);
				delete Minitalk.user.users[user.nickname];
				$("aside[data-role=users]").find("[code='"+user.nickname+"']").remove();
			}
		}
		
		Minitalk.fireEvent("leave",[user,usercount]);
	},
	/**
	 * 유저정보가 변경되었을 때
	 *
	 * @param object before 변경 전 유저정보
	 * @param object after 변경 후 유저정보
	 */
	change:function(before,after) {
		if (before.nickname == Minitalk.user.me.nickname) {
			Minitalk.user.me = after;
			Minitalk.storage("me",Minitalk.user.me);
			
			if (Minitalk.user.isVisibleUsers == true) {
				$("aside[data-role=users] > label[data-role=user]")[0].remove();
				$("aside[data-role=users]").prepend(Minitalk.user.getTag(Minitalk.user.me,true));
			}
			
			Minitalk.ui.initTools();
		}
		
		if (before.nickname != after.nickname) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/update_nickname").replace("{BEFORE}","<b><u>"+before.nickname+"</u></b>").replace("{AFTER}","<b><u>"+after.nickname+"</u></b>"));
		}
		
		if (before.status != after.status) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/update_status").replace("{NICKNAME}","<b><u>"+after.nickname+"</u></b>").replace("{STATUS}","<b><u>"+Minitalk.getText("status/"+after.status)+"</u></b>"));
		}
		
		var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
		
		if (Minitalk.user.isVisibleUsers == true) {
			if ($.inArray("["+before.opper+before.nickname+"]",Minitalk.user.usersSort) >= 0) {
				Minitalk.user.usersSort.splice($.inArray("["+(before.opper ? sortUserCode[before.opper] : "")+before.nickname+"]",Minitalk.user.usersSort),1);
			}
			if (Minitalk.user.users[before.nickname] != undefined) {
				delete Minitalk.user.users[before.nickname];
			}
			$("aside[data-role=users]").find("[code='"+before.nickname+"']").remove();
			
			if (Minitalk.user.checkLimit(Minitalk.viewUserLimit,after.opper) == true) {
				Minitalk.user.usersSort.push("["+(after.opper ? sortUserCode[after.opper] : "")+after.nickname+"]");
				Minitalk.user.users[after.nickname] = after;
				Minitalk.user.usersSort.sort();
				var position = $.inArray("["+(after.opper ? sortUserCode[after.opper] : "")+after.nickname+"]",Minitalk.user.usersSort);
				var user = Minitalk.user.getTag(after,true);
				
				if (after.nickname == Minitalk.user.me.nickname) {
					user.css("display","none");
				}
				if ($("aside[data-role=users] > label[data-role=user]").length < position) {
					$("aside[data-role=users]").append(user);
				} else {
					$($("aside[data-role=users] > label[data-role=user]")[position]).after(user);
				}
			}
		}
	},
	/**
	 * 접속자수를 업데이트한다.
	 *
	 * @param int usercount
	 */
	updateCount:function(usercount) {
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
	 * 유저의 고유한 값을 가져온다.
	 */
	getUuid:function() {
		if (Minitalk.storage("uuid") && Minitalk.storage("uuid").length == 32) {
			return Minitalk.storage("uuid");
		} else {
			Minitalk.storage("uuid",Minitalk.uuid);
			return Minitalk.storage("uuid");
		}
	},
	/**
	 * 접속자태그를 가져온다.
	 *
	 * @param object user 유저객체
	 * @param boolean isUserList 접속자목록내인지 여부
	 * @return object $user 접속자태그
	 */
	getTag:function(user,isUserList) {
		var $user = $("<label>").attr("data-role","user").data("user",user);
		
		if (isUserList == true && Minitalk.viewStatusIcon == true) {
			$user.css("paddingLeft",20);
			$user.css("backgroundImage","url("+Minitalk.statusIconPath+"/"+user.device+"/"+user.status+".png)");
		}
		
		$user.attr("title",user.nickname);
		
		var sHTML = "";
		if (user.nickcon != "") {
			var temp = user.nickcon.split(",");
			for (var i=0,loop=temp.length;i<loop;i++) {
				if (temp[i] == "{nickname}") {
					sHTML+= user.nickname;
				} else {
					sHTML+= '<img src="'+temp[i]+'" class="nickname">';
				}
			}
		} else {
			sHTML+= user.nickname;
		}
		
		if (isUserList == true && Minitalk.user.me.nickname == user.nickname) {
			sHTML+= "("+Minitalk.getText("text/me")+")";
		} else {
			$user.attr("code",user.nickname);
		}
		
		if (user.opper == "ADMIN") {
			sHTML+= '<img src="'+Minitalk.getTempletUrl(Minitalk.templet)+'/images/icon_admin.gif" />';
		}
		
		$user.html(sHTML);
		$user.on("click",function(e) {
			Minitalk.user.toggleMenus($(this),e);
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
			error:function() {
				callback({success:false,error:"CONNECT_ERROR"});
			}
		});
	},
	/**
	 * 유저메뉴를 추가한다.
	 */
	addMenu:function(usermenu) {
		Minitalk.addUserMenuList.push(usermenu);
	},
	/**
	 * 유저정보를 추가한다.
	 */
	addInfo:function(key,value) {
		if (Minitalk.socket.isConnected() == true) {
			if (!Minitalk.user.me.info || typeof Minitalk.user.me.info != "object") Minitalk.user.me.info = {};
			Minitalk.user.me.info[key] = value;
		} else {
			if (!Minitalk.info || typeof Minitalk.info != "object") Minitalk.info = {};
			Minitalk.info[key] = value;
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
				user.status = result.user.status;
			} else {
				user.status = "offline";
			}
			$("i",$name).removeClass("mi mi-loading").addClass("status").css("backgroundImage","url("+Minitalk.statusIconPath+"/"+user.device+"/"+user.status+".png)");
			
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
						if ($.inArray(menu,["configs","whisper","call","create","invite","banmsg","showip","banip","opper","deopper"]) === -1) continue;
						
						/**
						 * 관리자가 아닌 경우 관리자 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["banmsg","showip","banip","opper","deopper"]) !== -1 && Minitalk.user.me.opper != "ADMIN") continue;
						
						/**
						 * 자신에게 숨겨야 하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["whisper","call","invite"]) !== -1 && Minitalk.user.me.nickname == user.nickname) continue;
						
						/**
						 * 자신에게만 보여야하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["configs","create"]) !== -1 && Minitalk.user.me.nickname != user.nickname) continue;
						
						/**
						 * 개인채널에 숨겨야하는 메뉴를 표시하지 않는다.
						 */
						if ($.inArray(menu,["invite","create"]) !== -1 && Minitalk.isPrivate == true) continue;
						
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
					Minitalk.ui.toggleConfigs();
					break;
					
				case "whisper" :
					Minitalk.ui.setInputVal("/w " + user.nickname + " ");
					$menus.remove();
					break;
					
				case "call" :
					Minitalk.socket.sendCall(user.nickname);
					break;
					
				case "invite" :
					Minitalk.socket.sendInvite(user.nickname);
					break;
					
				case "create" :
					Minitalk.socket.sendCreate();
					break;
					
				case "banmsg" :
					Minitalk.socket.send("banmsg",{id:user.id,nickname:user.nickname});
					break;
					
				case "showip" :
					Minitalk.socket.send("showip",{id:user.id,nickname:user.nickname});
					break;
					
				case "banip" :
					Minitalk.socket.send("banip",{id:user.id,nickname:user.nickname});
					break;
					
				case "opper" :
					Minitalk.socket.send("opper",{id:user.id,nickname:user.nickname});
					break;
					
				case "deopper" :
					Minitalk.socket.send("deopper",{id:user.id,nickname:user.nickname});
			}
		} else {
			if (typeof menu.handler == "function") {
				menu.handler(Minitalk,user,e);
			}
		}
		
		Minitalk.fireEvent("afterActiveUserMenu",[menu,$menu,e]);
	},
	/**
	 * 권한 최소레벨에 해당하는지 확인한다.
	 *
	 * @param string limit 확인할 권한
	 * @param string target 대상권한
	 * @return boolean included 최소레벨을 만족하는지 여부
	 */
	checkLimit:function(limit,target) {
		if (limit == "") limit = "ALL";
		if (target == "") target = "ALL";
		var levels = ["ALL","NICKGUEST","MEMBER","POWERUSER","ADMIN","NONE"];
		
		return $.inArray(limit,levels) <= $.inArray(target,levels);
	},
	/**
	 * 호출을 받았을 때
	 *
	 * @param object from 호출한 사람
	 * @param object to 호출을 받은 사람
	 */
	call:function(from,to) {
		if (from.nickname == Minitalk.user.me.nickname) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/call").replace("{NICKNAME}","<b><u>"+to.nickname+"</u></b>"));
		} else {
			if (Minitalk.fireEvent("beforeCall",[from,to]) === false) return;
			
			Minitalk.ui.notify("call","action",Minitalk.getText("action/called").replace("{NICKNAME}","<b><u>"+from.nickname+"</u></b>"));
			Minitalk.ui.playSound("call");
			Minitalk.fireEvent("call",[from,to]);
		}
	},
	/**
	 * 개인채널 초대를 받았을 때
	 *
	 * @param object from 초대한 사람
	 * @param object to 초대받은 사람
	 * @param string 개인채널코드
	 */
	invite:function(from,to,code) {
		if (from.nickname == Minitalk.user.me.nickname) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/invite").replace("{NICKNAME}","<b><u>"+to.nickname+"</u></b>"));
		} else {
			if (Minitalk.fireEvent("beforeInvite",[from,code,to]) === false) return;
			
			Minitalk.ui.notify("invite-" + code,"action",Minitalk.getText("action/invited").replace("{NICKNAME}","<b><u>"+from.nickname+"</u></b>").replace("{TIME}","<b><u>" + Minitalk.ui.getTime(moment().valueOf(),"YYYY.MM.DD HH:mm:ss") + "</u></b>"),false,false,{from:from,to:to,code:code},function($notification) {
				if (confirm(Minitalk.getText("action/invite_confirm")) == true) {
					return Minitalk.ui.openPrivateChannel("join",$notification.data("data"));
				} else {
					Minitalk.socket.send("reject",$notification.data("data"));
				}
				return true;
			});
			
			Minitalk.ui.playSound("query");
			Minitalk.fireEvent("invite",[from,code,to]);
		}
	}
};