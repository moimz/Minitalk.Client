/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 UI 관련 이벤트를 처리한다.
 * 
 * @file /scripts/widget.ui.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 7.
 */
Minitalk.ui = {
	reinitTimer:null,
	isFixedScroll:false,
	/**
	 * 미니톡 채팅위젯 UI 를 초기화한다.
	 */
	init:function() {
		Minitalk.statusIconPath = Minitalk.statusIconPath == "" ? Minitalk.getUrl()+"/images/status" : Minitalk.statusIconPath;
		
		if (Minitalk.type == "auto") {
			if ($(document).height() >= $(document).width()) {
				Minitalk.type = "vertical";
			} else {
				Minitalk.type = "horizontal";
			}
		}
		
		$(".frame").removeClass("vertical").removeClass("horizontal").addClass(Minitalk.type);
		$(".frame").outerHeight($(".outFrame").length == 0 ? $(document).height() : $(".outFrame").innerHeight(),true);
		$(".inputText").outerWidth($(".inputArea").innerWidth() - $(".inputButton").outerWidth(true),true);
		$(".title").text(Minitalk.title == null ? "Minitalk" : Minitalk.title);
		
		var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
		
		$(".userList").css("top",$(".titleArea").position().top + $(".titleArea").outerHeight(true));
		
		if (Minitalk.type == "vertical") {
			$(".toggleUserList").addClass("toggleUserListOff");
			$(".userList").outerWidth($(".frame").innerWidth(),true);
			$(".userList").css("left",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
			$(".userList").hide();
			$(".chatArea").outerHeight(height,true);
		} else {
			$(".toggleUserList").addClass("toggleUserListOff");
			$(".userList").outerHeight(height,true);
			$(".userList").css("right",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
			$(".userList").hide();
			$(".chatArea").outerHeight(height,true);
		}
		
		Minitalk.user.init();
		Minitalk.ui.initTool();
		Minitalk.ui.initUserMenu();
		
		if (typeof Minitalk.listeners.onInit == "function") {
			Minitalk.listeners.onInit(m);
		}
		
		for (var i=0, loop=Minitalk.onInit.length;i<loop;i++) {
			if (typeof Minitalk.onInit[i] == "function") {
				Minitalk.onInit[i](m);
			}
		}
		
		$("input").attr("disabled",true);
		Minitalk.ui.initToolButton(false);
		
		/**
		 * UI 객체 이벤트를 정의한다.
		 */
		/* UI Events */
		$(".titleArea").on("mousedown",function(event) { event.preventDefault(); });
		$(".userList").on("mousedown",function(event) { event.preventDefault(); });
		$(".userMenu").on("mousedown",function(event) { event.preventDefault(); });
		$(".userInfoStatus").on("mousedown",function(event) { event.preventDefault(); });
		$(".toolArea").on("mousedown",function(event) { event.preventDefault(); });
		
		$(".frame").on("click",function(event) {
			if ($(".userMenu").css("display") != "none") {
				if (!$(event.target).attr("nickname")) $(".userMenu").hide();
			}
		});
		
		$(".chatArea").on("click",function(event) {
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
		});
		
		$(".inputButton").on("click",function() {
			if ($(".toolEmoticonLayer").css("display") != "none") Minitalk.ui.insertEmoticon();
			if ($(".toolFontColorLayer").css("display") != "none") Minitalk.ui.selectFontColor();
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
			Minitalk.ui.sendMessage($(".inputText").val());
			$(".inputText").val("");
			$(".inputText").focus();
		});
		
		$(".inputText").on("click",function() {
			if ($(".toolEmoticonLayer").css("display") != "none") Minitalk.ui.insertEmoticon();
			if ($(".toolFontColorLayer").css("display") != "none") Minitalk.ui.selectFontColor();
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
		});
		
		$(".inputText").on("keypress",function(event) {
			if (event.which == 13) {
				Minitalk.ui.sendMessage($(".inputText").val());
				$(".inputText").val("");
				$(".inputText").focus();
				event.preventDefault();
			}
		});
		
		$(".titleArea > DIV").on("mouseover",function() {
			$(this).addClass("mouseover");
		});
		
		$(".titleArea > DIV").on("mouseout",function() {
			$(this).removeClass("mouseover");
		});
		
		$(".toggleUserList").on("click",function() {
			if (Minitalk.viewUserListStatus == true) {
				Minitalk.ui.hideUser();
			} else {
				Minitalk.isAutoHideUserList = true;
				Minitalk.ui.printMessage("system",Minitalk.getText("action/loadingUsers"));
				Minitalk.socket.send("users",Minitalk.viewUserLimit);
			}
		});
		
		$(".toggleUserInfo").on("click",function() {
			if ($(".userInfoLayer").css("display") == "none") {
				$(".userInfoNickname").val(Minitalk.user.me.nickname);
				if (Minitalk.isNickname == false || Minitalk.isPrivate == true) $(".userInfoNickname").attr("disabled",true);
				else $(".userInfoNickname").attr("disabled",false);
				$(".userInfoStatusIcon").css("backgroundImage","url("+Minitalk.statusIconPath+"/"+Minitalk.user.me.device+"/"+Minitalk.user.me.status+".png)");
				$(".userInfoStatusText").text(Minitalk.getText("status/"+Minitalk.user.me.status));
				$(".userInfoStatus").attr("status",Minitalk.user.me.status);
				$(".userInfoLayer").fadeIn();
			} else {
				$(".userInfoLayer").fadeOut();
			}
		});
		
		$(".userInfoStatusBox").on("click",function() {
			if ($(".userInfoStatusList").css("display") == "none") {
				var list = $("<ul>");
				
				for (var status in Minitalk.getText("status")) {
					if (status == "offline") continue;
					var item = $("<li>");
					item.text(Minitalk.getText("status/"+status));
					item.css("backgroundImage","url("+Minitalk.statusIconPath+"/"+Minitalk.device+"/"+status+".png)");
					item.attr("status",status);
					item.on("mouseover",function() {
						$(this).addClass("mouseover");
					});
					item.on("mouseout",function() {
						$(this).removeClass("mouseover");
					});
					item.on("click",function() {
						$(".userInfoStatusIcon").css("backgroundImage","url("+Minitalk.statusIconPath+"/"+Minitalk.device+"/"+$(this).attr("status")+".png)");
						$(".userInfoStatusText").text(Minitalk.getText("status/"+$(this).attr("status")));
						$(".userInfoStatus").attr("status",$(this).attr("status"));
						$(".userInfoStatusList").hide();
					});
					list.append(item);
				}
				
				$(".userInfoStatusList").html("");
				$(".userInfoStatusList").append(list);
				$(".userInfoStatusList").slideDown();
			} else {
				$(".userInfoStatusList").slideUp();
			}
		});
		
		$(".userInfoButton").on("click",function() {
			Minitalk.socket.send("change",{nickname:$(".userInfoNickname").val(),status:$(".userInfoStatus").attr("status")});
			$(".userInfoLayer").fadeOut();
		});
		
		/**
		 * 필수 audio 객체를 추가한다.
		 */
		$(".frame").append('<audio data-type="call"><source src="' + Minitalk.getUrl() + '/sounds/call.mp3" type="audio/mpeg"></audio>');
		$(".frame").append('<audio data-type="message"><source src="' + Minitalk.getUrl() + '/sounds/message.mp3" type="audio/mpeg"></audio>');
		$(".frame").append('<audio data-type="query"><source src="' + Minitalk.getUrl() + '/sounds/query.mp3" type="audio/mpeg"></audio>');
		
		/**
		 * 클릭이벤트를 이용하여 특수한 DOM 객체를 초기화한다.
		 */
		$(document).on("click",function(e) {
			Minitalk.ui.initSounds();
		});
		
		$(window).on("resize",function() {
			console.log("resize!!");
			if (Minitalk.ui.reinitTimer != null) {
				clearTimeout(Minitalk.ui.reinitTimer);
			}
			Minitalk.ui.reinitTimer = setTimeout(Minitalk.ui.reinit,100);
		});
		
		$(window).on("orientationchange",function() {
			Minitalk.ui.reinit();
		});
		
		Minitalk.socket.connect();
	},
	/**
	 * 스크린사이즈가 변경되었을 때, UI를 재정의한다.
	 */
	reinit:function() {
		Minitalk.ui.reinitTimer = null;
		
		if (Minitalk.type == "auto") {
			if ($(document).height() >= $(document).width()) {
				Minitalk.type = "vertical";
			} else {
				Minitalk.type = "horizontal";
			}
		}
		
		$(".frame").height(1);
		$(".userList").height(1);
		$(".frame").removeClass("vertical").removeClass("horizontal").addClass(Minitalk.type);
		$(".frame").outerHeight($(".outFrame").length == 0 ? $(document).height() : $(".outFrame").innerHeight(),true);
		$(".inputText").outerWidth($(".inputArea").innerWidth() - $(".inputButton").outerWidth(true),true);
		
		var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
		
		$(".userList").css("top",$(".titleArea").position().top + $(".titleArea").outerHeight(true));

		$(".chatArea").css("marginTop",0);
		$(".chatArea").css("marginRight",0);
		if ($(".userList").css("display") != "none") {
			if (Minitalk.type == "vertical") {
				$(".userList").css("left",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
				$(".userList").css("right","auto");
				$(".userList").outerWidth($(".frame").innerWidth(),true);
				$(".userList").outerHeight(Minitalk.userListHeight,true);
				$(".chatArea").css("marginTop",$(".userList").outerHeight(true));
			} else {
				$(".userList").css("left","auto");
				$(".userList").css("right",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
				$(".userList").outerWidth(Minitalk.userListWidth,true);
				$(".userList").outerHeight(height,true);
				$(".chatArea").css("marginRight",$(".userList").outerWidth(true));
			}
		}
		
		$(".chatArea").outerWidth($(".frame").innerWidth(),true);
		$(".chatArea").outerHeight(height,true);
		
		Minitalk.ui.initTool();
		Minitalk.ui.autoScroll();
	},
	/**
	 * 변경된 브라우저의 보안규칙에 따라, 사운드파일을 초기화한다.
	 */
	initSounds:function() {
		var $audios = $("audio");
		$audios.each(function() {
			var $audio = $(this);
			if ($audio.data("loaded") === true) return;
			
			var audio = $(this).get(0);
			audio.muted = true;
			var promise = audio.play();
			if (promise !== undefined) {
				promise.then(function() {
					$audio.data("loaded",true);
				}).catch(function(e) {
				});
			}
		});
	},
	/**
	 * 툴바를 초기화한다.
	 */
	initTool:function() {
		var defaultTool = [{
			cls:"toolBold",
			icon:"icon_bold.png",
			text:Minitalk.getText("tool/bold"),
			fn:function(minitalk) {
				if (minitalk.user.checkLimit(minitalk.fontSettingLimit,minitalk.user.me.opper) == false) {
					minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_ALLOWED_FONT_SETTING"));
					minitalk.setting("fontBold",false);
					$(".toolBold").removeClass("selected");
					$(".inputText").css("fontWeight","normal");
					return false;
				}
				
				if (minitalk.setting("fontBold") == true) {
					minitalk.setting("fontBold",false);
					$(".toolBold").removeClass("selected");
					$(".inputText").css("fontWeight","normal");
				} else {
					minitalk.setting("fontBold",true);
					$(".toolBold").addClass("selected");
					$(".inputText").css("fontWeight","bold");
				}
			}
		},{
			cls:"toolItalic",
			icon:"icon_italic.png",
			text:Minitalk.getText("tool/italic"),
			fn:function(minitalk) {
				if (minitalk.user.checkLimit(minitalk.fontSettingLimit,minitalk.user.me.opper) == false) {
					minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_ALLOWED_FONT_SETTING"));
					minitalk.setting("fontItalic",false);
					$(".toolItalic").removeClass("selected");
					$(".inputText").css("fontStyle","");
					return false;
				}
				
				if (minitalk.setting("fontItalic") == true) {
					minitalk.setting("fontItalic",false);
					$(".toolItalic").removeClass("selected");
					$(".inputText").css("fontStyle","");
				} else {
					minitalk.setting("fontItalic",true);
					$(".toolItalic").addClass("selected");
					$(".inputText").css("fontStyle","italic");
				}
			}
		},{
			cls:"toolUnderline",
			icon:"icon_underline.png",
			text:Minitalk.getText("tool/underline"),
			fn:function(minitalk) {
				if (minitalk.user.checkLimit(minitalk.fontSettingLimit,minitalk.user.me.opper) == false) {
					minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_ALLOWED_FONT_SETTING"));
					minitalk.setting("fontUnderline",false);
					$(".toolUnderline").removeClass("selected");
					$(".inputText").css("textDecoration","");
					return false;
				}
				
				if (minitalk.setting("fontUnderline") == true) {
					minitalk.setting("fontUnderline",false);
					$(".toolUnderline").removeClass("selected");
					$(".inputText").css("textDecoration","");
				} else {
					minitalk.setting("fontUnderline",true);
					$(".toolUnderline").addClass("selected");
					$(".inputText").css("textDecoration","underline");
				}
			}
		},{
			cls:"toolColor",
			icon:"icon_color.png",
			text:Minitalk.getText("tool/color"),
			fn:function(minitalk) {
				if (minitalk.user.checkLimit(minitalk.fontSettingLimit,minitalk.user.me.opper) == false) {
					minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_ALLOWED_FONT_SETTING"));
					$(".inputText").css("color","");
					return false;
				}
				
				minitalk.ui.selectFontColor();
			}
		},"-",{
			cls:"toolEmoticon",
			icon:"icon_emoticon.png",
			text:Minitalk.getText("tool/emoticon"),
			fn:function(minitalk) {
				minitalk.ui.insertEmoticon();
			}
		},"-",{
			cls:"toolMute",
			icon:"icon_mute.png",
			text:Minitalk.getText("tool/mute"),
			fn:function(minitalk) {
				if (minitalk.setting("mute") == true) {
					minitalk.setting("mute",false);
					minitalk.ui.printMessage("system",Minitalk.getText("action/play_sound"));
					$(".toolMute").removeClass("selected");
				} else {
					minitalk.setting("mute",true);
					minitalk.ui.printMessage("system",Minitalk.getText("action/mute_sound"));
					$(".toolMute").addClass("selected");
				}
			}
		},{
			cls:"toolPush",
			icon:"icon_push.png",
			text:Minitalk.getText("tool/push"),
			fn:function(minitalk) {
				if (minitalk.setting("push") == false) {
					if (window.Notification !== undefined) {
						if (Notification.permission == "granted") {
							minitalk.setting("push",true);
							minitalk.ui.printMessage("system",Minitalk.getText("action/use_push"));
							$(".toolPush").addClass("selected");
						} else if (Notification.permission != "granted") {
							Notification.requestPermission(function(permission) {
								if (Notification.permission !== undefined) {
									Notification.permission = permission;
								}
								
								if (permission == "granted") {
									Minitalk.setSetting("push",true);
									Minitalk.ui.printMessage("system",Minitalk.getText("action/use_push"));
									$(".toolPush").addClass("selected");
								} else {
									Minitalk.ui.printMessage("error",Minitalk.getErrorText("DISABLED_PUSH"));
								}
							});
						}
					} else {
						Minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_SUPPORTED_BROWSER"));
					}
				} else {
					minitalk.setting("push",false);
					$(".toolPush").removeClass("selected");
					Minitalk.ui.printMessage("system",Minitalk.getText("action/stop_push"));
				}
			}
		},"-",{
			cls:"toolScroll",
			icon:"icon_scroll.png",
			text:Minitalk.getText("tool/scroll"),
			fn:function(minitalk) {
				if (minitalk.ui.isFixedScroll == true) {
					minitalk.ui.printMessage("system",Minitalk.getText("action/use_auto_scroll"));
					minitalk.ui.isFixedScroll = false;
					minitalk.ui.autoScroll();
					$(".toolScroll").removeClass("selected");
				} else {
					minitalk.ui.printMessage("system",Minitalk.getText("action/use_fixed_scroll"));
					minitalk.ui.isFixedScroll = true;
					$(".toolScroll").addClass("selected");
				}
			}
		},{
			cls:"toolClear",
			icon:"icon_clear.png",
			text:Minitalk.getText("tool/clear"),
			fn:function(minitalk) {
				if (minitalk.user.me.opper == "ADMIN" && minitalk.logLimit > 0 && confirm(Minitalk.getText("action/clear_log_confirm")) == true) {
					minitalk.socket.send("clearlog",null);
				} else {
					$(".chatArea").html("");
					minitalk.ui.printMessage("system",Minitalk.getText("action/clear_log_self"));
					minitalk.storage("logList",[]);
				}
			}
		}];
		
		if (Minitalk.fontSettingHide == true) {
			defaultTool.shift();
			defaultTool.shift();
			defaultTool.shift();
			defaultTool.shift();
			defaultTool.shift();
		}
		
		var listStart = 0;
		var toolsWidth = 0;
		var insertSplit = false;
		Minitalk.toolList = defaultTool.concat(Minitalk.addToolList);
		
		$(".toolArea").html("");
		$(".toolListLayer").html("");

		for (var i=0, loop=Minitalk.toolList.length;i<loop;i++) {
			if (typeof Minitalk.toolList[i] == "object") {
				var thisButton = $("<button>").addClass("toolButton toolButtonOff");
				thisButton.attr("title",Minitalk.toolList[i].text);
				thisButton.attr("toolIDX",i);
				if (Minitalk.toolList[i].cls) thisButton.addClass(Minitalk.toolList[i].cls);
				thisButton.on("mouseover",function() { $(this).addClass("mouseover"); });
				thisButton.on("mouseout",function() { $(this).removeClass("mouseover"); });
				thisButton.on("click",function() { Minitalk.toolList[$(this).attr("toolIDX")].fn(Minitalk); });
				
				var thisButtonInner = $("<div>").addClass("toolButtonInner");
				
				if (Minitalk.toolType != "text") {
					var iconPath = Minitalk.toolList[i].cls ? Minitalk.getUrl()+'/templets/'+Minitalk.templet+'/images/'+Minitalk.toolList[i].icon : Minitalk.toolList[i].icon;
					thisButtonInner.append($("<span>").addClass("toolButtonIcon").css("backgroundImage","url("+iconPath+")"));
				}
				
				if (Minitalk.toolType != "icon" || Minitalk.toolList[i].viewText === true) {
					thisButtonInner.append($("<span>").addClass("toolButtonText").text(Minitalk.toolList[i].text));
				}
				thisButton.append(thisButtonInner);
				
				if (insertSplit == true) {
					insertSplit = false;
					var thisSplit = $("<div>").addClass("toolSeparator");
					$(".toolArea").append(thisSplit);
					toolsWidth+= thisSplit.outerWidth(true);
				} else {
					thisSplit = null;
				}
				
				$(".toolArea").append(thisButton);
				toolsWidth+= thisButton.outerWidth(true);
				
				if (toolsWidth > $(".toolArea").innerWidth()-25) {
					thisButton.remove();
					if (thisSplit != null) thisSplit.remove();
					listStart = i;
					break;
				}
			} else {
				insertSplit = true;
			}
		}
		
		if (listStart > 0) {
			var moreButton = $("<div>").addClass("toolButtonMore");
			moreButton.on("mouseover",function() { if ($(this).attr("disabled") != "disabled") $(this).addClass("mouseover"); });
			moreButton.on("mouseout",function() { if ($(this).attr("disabled") != "disabled") $(this).removeClass("mouseover"); });
			$(".toolArea").append(moreButton);
			
			for (var i=listStart, loop=Minitalk.toolList.length;i<loop;i++) {
				if (i == listStart && typeof Minitalk.toolList[i] != "object") continue;

				if (typeof Minitalk.toolList[i] == "object") {
					var thisButton = $("<div>").addClass("toolList");
					if (Minitalk.toolList[i].cls) thisButton.addClass(Minitalk.toolList[i].cls);
					thisButton.attr("toolIDX",i);
					thisButton.on("mouseover",function() { $(this).addClass("mouseover"); });
					thisButton.on("mouseout",function() { $(this).removeClass("mouseover"); });
					thisButton.on("click",function() { Minitalk.toolList[$(this).attr("toolIDX")].fn(m); });
					var iconPath = Minitalk.toolList[i].cls ? Minitalk.getUrl()+'/templets/'+Minitalk.templet+'/images/'+Minitalk.toolList[i].icon : Minitalk.toolList[i].icon;
					thisButton.append($("<span>").addClass("toolListIcon").css("backgroundImage","url("+iconPath+")"));
					thisButton.append($("<span>").addClass("toolListText").text(Minitalk.toolList[i].text));
					
					$(".toolListLayer").append(thisButton);
				} else {
					$(".toolListLayer").append($("<div>").addClass("toolSeparator"));
				}
			}
			
			moreButton.on("click",function() {
				if ($(this).attr("disabled") != "disabled") {
					if ($(".toolListLayer").css("display") == "none") {
						$(".toolListLayer").show();
						var height = $(".toolListLayer").outerHeight(true);
						$(".toolListLayer").outerHeight(1);
						$(".toolListLayer").animate({height:height},400);
						
						$(".toolButtonMore").addClass("selected");
					} else {
						$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
						
						$(".toolButtonMore").removeClass("selected");
					}
				}
			});
		}
	},
	/**
	 * 툴버튼을 초기화한다.
	 *
	 * @param boolean mode 버튼 활성화여부
	 */
	initToolButton:function(mode) {
		if (mode == false) {
			$($(".toolArea").find("button")).attr("disabled");
			$($(".toolArea").find("button")).removeClass("selected").addClass("disabled");
			$($(".toolArea").find(".toolButtonMore")).attr("disabled");
			$($(".toolArea").find(".toolButtonMore")).removeClass("selected").addClass("disabled");
			return;
		}
		
		$($(".toolArea").find("button")).attr("disabled",null);
		$($(".toolArea").find("button")).removeClass("disabled");
		$($(".toolArea").find(".toolButtonMore")).attr("disabled",null);
		$($(".toolArea").find(".toolButtonMore")).removeClass("disabled");
		
		if (Minitalk.setting("fontBold") == true) {
			$(".toolBold").addClass("selected");
			$(".inputText").css("fontWeight","bold");
		} else {
			$(".toolBold").removeClass("selected");
			$(".inputText").css("fontWeight","normal");
		}
		
		if (Minitalk.setting("fontItalic") == true) {
			$(".toolItalic").addClass("selected");
			$(".inputText").css("fontStyle","italic");
		} else {
			$(".toolItalic").removeClass("selected");
			$(".inputText").css("fontStyle","");
		}
		
		if (Minitalk.setting("fontUnderline") == true) {
			$(".toolUnderline").addClass("selected");
			$(".inputText").css("textDecoration","underline");
		} else {
			$(".toolUnderline").removeClass("selected");
			$(".inputText").css("textDecoration","");
		}
		
		if (Minitalk.setting("fontColor") !== false && Minitalk.setting("fontColor") != "") {
			$(".inputText").css("color","#"+Minitalk.setting("fontColor"));
		} else {
			$(".inputText").css("color","");
		}
		
		if (Minitalk.setting("mute") == true) {
			$(".toolMute").addClass("selected");
		} else {
			$(".toolMute").removeClass("selected");
		}
		
		if (Minitalk.setting("push") == true) {
			$(".toolPush").addClass("selected");
		} else {
			$(".toolPush").removeClass("selected");
		}
	},
	/**
	 * 유저메뉴를 초기화한다.
	 */
	initUserMenu:function() {
		Minitalk.userMenuList = [{
			icon:"icon_myinfo.png",
			text:Minitalk.getText("usermenu/myinfo"),
			viewMenu:function(minitalk,user,myinfo) {
				if (user.nickname == myinfo.nickname) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				$(".userInfoNickname").val(minitalk.user.me.nickname);
				if (minitalk.isNickname == false || minitalk.isPrivate == true) $(".userInfoNickname").attr("disabled",true);
				else $(".userInfoNickname").attr("disabled",false);
				$(".userInfoStatusIcon").css("backgroundImage","url("+minitalk.statusIconPath+"/"+minitalk.user.me.device+"/"+minitalk.user.me.status+".png)");
				$(".userInfoStatusText").text(Minitalk.getText("status/"+minitalk.user.me.status));
				$(".userInfoStatus").attr("status",minitalk.user.me.status);
				$(".userInfoLayer").fadeIn();
			}
		},{
			icon:"icon_whisper.png",
			text:Minitalk.getText("usermenu/whisper"),
			viewMenu:function(minitalk,user,myinfo) {
				if (user.nickname != myinfo.nickname) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				$(".inputText").focus();
				$(".inputText").val("/w "+user.nickname+" ");
			}
		},{
			icon:"icon_call.png",
			text:Minitalk.getText("usermenu/call"),
			viewMenu:function(minitalk,user,myinfo) {
				if (user.nickname != myinfo.nickname) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				minitalk.socket.sendCall(user.nickname);
			}
		},{
			icon:"icon_privchannel.png",
			text:Minitalk.getText("usermenu/privchannel"),
			viewMenu:function(minitalk,user,myinfo) {
				if (user.nickname != myinfo.nickname && Minitalk.isPrivate == false) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				Minitalk.socket.sendInvite(user.nickname);
			}
		},{
			icon:"icon_banmsg.png",
			text:Minitalk.getText("usermenu/banmsg"),
			viewMenu:function(minitalk,user,myinfo) {
				if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				minitalk.socket.send("banmsg",{id:user.id,nickname:user.nickname});
			}
		},{
			icon:"icon_showip.png",
			text:Minitalk.getText("usermenu/showip"),
			viewMenu:function(minitalk,user,myinfo) {
				if (myinfo.opper == "ADMIN" && Minitalk.isPrivate == false) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				minitalk.socket.send("showip",{id:user.id,nickname:user.nickname});
			}
		},{
			icon:"icon_banip.png",
			text:Minitalk.getText("usermenu/banip"),
			viewMenu:function(minitalk,user,myinfo) {
				if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname && Minitalk.isPrivate == false) return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				minitalk.socket.send("banip",{id:user.id,nickname:user.nickname});
			}
		},{
			icon:"icon_opper.png",
			text:Minitalk.getText("usermenu/opper"),
			viewMenu:function(minitalk,user,myinfo) {
				if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname && minitalk.isPrivate == false && user.opper != "ADMIN") return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				minitalk.socket.send("opper",{id:user.id,nickname:user.nickname});
			}
		},{
			icon:"icon_deopper.png",
			text:Minitalk.getText("usermenu/deopper"),
			viewMenu:function(minitalk,user,myinfo) {
				if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname && Minitalk.isPrivate == false && user.opper == "ADMIN") return true;
				else return false;
			},
			fn:function(minitalk,user,myinfo) {
				minitalk.socket.send("deopper",{id:user.id,nickname:user.nickname});
			}
		}];
	},
	/**
	 * 시간을 정해진 형태로 변환하여 가져온다.
	 *
	 * @param int timestamp 유닉스타임스탬프
	 * @param string type 포맷
	 */
	getTime:function(timestamp,format) {
		var time = moment(timestamp).locale(Minitalk.language);
		return time.format(format);
	},
	/**
	 * 접속자수를 출력한다.
	 *
	 * @param int count 접속자수
	 */
	printUserCount:function(count) {
		if (count > 0) {
			$(".userCount").text("("+Minitalk.getText("text/unit").replace('{COUNT}',count)+")");
		} else {
			$(".userCount").text("");
		}
		
		if (Minitalk.isAutoHideUserList == false && count > 200 && Minitalk.viewUserListStatus == true) {
			Minitalk.isAutoHideUserList = true;
			Minitalk.ui.printMessage("system",Minitalk.getText("action/autoHideUsers"));
			Minitalk.ui.hideUser();
		}
	},
	/**
	 * 채팅화면상에 메시지를 출력한다.
	 *
	 * @param string type 메시지종류
	 * @param string message 메시지
	 */
	printMessage:function(type,message) {
		var item = $("<div>").addClass(type);
		item.html(message);
		$(".chatArea").append(item);
		Minitalk.ui.autoScroll();
	},
	/**
	 * 이전대화기록을 출력한다.
	 */
	printLogMessage:function() {
		var logList = Minitalk.log();
		for (var i=(logList.length > Minitalk.logLimit ? logList.length-Minitalk.logLimit : 0), loop=logList.length;i<loop;i++) {
			if (logList[i].type == "chat") {
				Minitalk.ui.printChatMessage("log",logList[i].log.user,logList[i].log.message,logList[i].log.time);
			} else {
				Minitalk.ui.printWhisperMessage("log",logList[i].log.user,logList[i].log.to,logList[i].log.message,logList[i].log.time);
			}
		}
	},
	/**
	 * 채팅메시지를 출력한다.
	 *
	 * @param string type 메시지타입
	 * @param object sender 메시지를 전송한 유저
	 * @param object message 메시지내용
	 * @param int time 메시지를 전송시각
	 */
	printChatMessage:function(type,sender,message,time) {
		var user = Minitalk.user.getTag(sender,false);
		var message = Minitalk.ui.decodeMessage(message,true);
		
		if (type == "chat" && sender.nickname != Minitalk.user.me.nickname) {
			if (typeof Minitalk.listeners.beforeMessage == "function") {
				if (Minitalk.listeners.beforeMessage(Minitalk,sender,message,time) == false) return;
			}
			
			for (var i=0, loop=Minitalk.beforeMessage.length;i<loop;i++) {
				if (typeof Minitalk.beforeMessage[i] == "function") {
					if (Minitalk.beforeMessage[i](Minitalk,sender,message,time) == false) return;
				}
			}
		}
		
		var item = $("<div>").addClass(type);
		if (sender.nickname == Minitalk.user.me.nickname) item.addClass("mymessage");
		item.append(user);
		
		var messageObject = $("<span>").addClass("body").html(Minitalk.splitString+message);
		if (time) messageObject.attr("title",Minitalk.ui.getTime(time,"YYYY.MM.DD HH:mm:ss"));
		item.append(messageObject);
		if (time) item.append($("<span>").addClass("time").html(" ("+Minitalk.ui.getTime(time,"HH:mm:ss")+")"));
		
		$(".chatArea").append(item);
		Minitalk.ui.autoScroll();
		
		if (type == "chat" && sender.nickname != Minitalk.user.me.nickname) {
			if (typeof Minitalk.listeners.onMessage == "function") {
				Minitalk.listeners.onMessage(Minitalk,sender,message,time)
			}
			
			for (var i=0, loop=Minitalk.onMessage.length;i<loop;i++) {
				if (typeof Minitalk.onMessage[i] == "function") {
					Minitalk.onMessage[i](Minitalk,sender,message,time)
				}
			}
		}
	},
	/**
	 * 귓속말 메시지를 출력한다.
	 *
	 * @param string type 메시지타입
	 * @param object sender 메시지를 전송한 유저
	 * @param object to 메시지를 수신한 유저
	 * @param object message 메시지내용
	 * @param int time 메시지를 전송시각
	 */
	printWhisperMessage:function(type,sender,to,message,time) {
		if (sender.nickname == Minitalk.user.me.nickname) {
			var header = $("<span>").html(Minitalk.getText("text/whisper_to").replace("{NICKNAME}",'<span class="whisperTag"></span>'));
			var user = Minitalk.user.getTag(to,false);
		} else {
			var header = $("<span>").html(Minitalk.getText("text/whisper_from").replace("{NICKNAME}",'<span class="whisperTag"></span>'));
			var user = Minitalk.user.getTag(sender,false);
		}
		
		var item = $("<div>").addClass(type);
		item.append(header);
		
		var message = Minitalk.ui.decodeMessage(message,true);
		
		if (type == "whisper" && sender.nickname != Minitalk.user.me.nickname) {
			if (typeof Minitalk.listeners.beforeWhisper == "function") {
				if (Minitalk.listeners.beforeWhisper(Minitalk,sender,message,time) == false) return;
			}
			
			for (var i=0, loop=Minitalk.beforeWhisper.length;i<loop;i++) {
				if (typeof Minitalk.beforeWhisper[i] == "function") {
					if (Minitalk.beforeWhisper[i](Minitalk,sender,message,time) == false) return;
				}
			}
		}
		
		$(item.find(".whisperTag")).append(user);
		
		var messageObject = $("<span>").addClass("body").html(Minitalk.splitString+message);
		if (time) messageObject.attr("title",Minitalk.ui.getTime(time,"YYYY.MM.DD HH:mm:ss"));
		item.append(messageObject);
		if (time) item.append($("<span>").addClass("time").html(" ("+Minitalk.ui.getTime(time,"HH:mm:ss")+")"));
		
		$(".chatArea").append(item);
		Minitalk.ui.autoScroll();
		
		if (type == "whisper" && sender.nickname != Minitalk.user.me.nickname) {
			if (typeof Minitalk.listeners.onWhisper == "function") {
				Minitalk.listeners.onWhisper(Minitalk,sender,message,time)
			}
			
			for (var i=0, loop=Minitalk.onWhisper.length;i<loop;i++) {
				if (typeof Minitalk.onWhisper[i] == "function") {
					Minitalk.onWhisper[i](Minitalk,sender,message,time)
				}
			}
		}
	},
	printError:function(code,callback) {
		Minitalk.socket.reconnectable = false;
	
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(Minitalk.getText("error/"+code)));
		
		if (code == "NOT_FOUND_ONLINE_SERVER") {
			var $button = $("<button>").html(Minitalk.getText("action/reconnect"));
			$button.on("click",function() {
				$("div[data-role=error]").remove();
				Minitalk.socket.connect();
			});
		} else {
			var $button = $("<button>").html(Minitalk.getText("button/confirm"));
			
			if (typeof callback == "function") {
				$button.on("click",function() {
					callback();
				});
			} else if (typeof callback == "undefined") {
				$button.on("click",function() {
					$("div[data-role=error]").remove();
				});
			} else {
				$errorbox.addClass("textonly");
				if (typeof callback == "string") {
					$("p",$errorbox).append("<br>" + callback);
				}
				$button = null;
			}
		}
		
		if ($button !== null) $errorbox.append($button);
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
	},
	/**
	 * 에러코드를 출력한다.
	 *
	 * @param string code 에러코드
	 */
	printErrorCode:function(code) {
		/**
		 * 재접속 시도를 하지 않는 에러인 경우 에러확인창으로 에러를 표시하고,
		 * 서버 접속중이 아닌경우에는 알림메시지창으로 에러를 표시한다.
		 */
		var message = Minitalk.getText("error/code/"+code) + " (code : " + code + ")";
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(message));
		$errorbox.addClass("textonly");
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
	},
	/**
	 * 채팅영역의 스크롤을 자동으로 최하단으로 내린다.
	 */
	autoScroll:function() {
		if (Minitalk.ui.isFixedScroll == true) return;
		$(".chatArea").scrollTop($(".chatArea").prop("scrollHeight"));
	},
	/**
	 * 채널명을 표시한다.
	 *
	 * @param string title
	 */
	printTitle:function(title) {
		$("div.titleArea > span.title").html(title);
	},
	/**
	 * 접속자목록을 출력한다.
	 */
	printUser:function(users) {
		if ($(".userList").css("display") == "none") {
			if (Minitalk.type == "vertical") {
				var width = $(".chatArea").innerWidth();
				var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
				$(".userList").height(1);
				$(".userList").show();
				$(".userList").animate({height:Minitalk.userListHeight},{step:function(now,fx) {
					$(".chatArea").css("marginTop",$(".userList").outerHeight(true));
					$(".chatArea").width(width);
					$(".chatArea").outerHeight(height,true);
					
					if (now == Minitalk.userListHeight) {
						$(".chatArea").css("marginTop",Minitalk.userListHeight);
						$(".chatArea").outerHeight(height,true);
						$(".chatArea").width(width);
						Minitalk.ui.autoScroll();
					}
				}});
			} else {
				var width = $(".chatArea").outerWidth(true);
				$(".userList").width(1);
				$(".userList").show();
				$(".userList").animate({width:Minitalk.userListWidth},{step:function(now,fx) {
					$(".chatArea").css("marginRight",$(".userList").outerWidth(true));
					$(".chatArea").outerWidth(width,true);
					
					if (now == Minitalk.userListWidth) {
						$(".chatArea").css("marginRight",Minitalk.userListWidth);
						$(".chatArea").outerWidth(width,true);
						Minitalk.ui.autoScroll();
					}
				}});
			}
		}
		
		$(".toggleUserList").removeClass("toggleUserListOff").addClass("toggleUserListOn");
		
		var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
		
		Minitalk.viewUserListStatus = true;
		Minitalk.viewUserListSort = [];
		Minitalk.viewUserListStore = {};
		for (var i=0, loop=users.length;i<loop;i++) {
			Minitalk.viewUserListSort.push("["+(users[i].opper ? sortUserCode[users[i].opper] : "")+users[i].nickname+"]");
			Minitalk.viewUserListStore[users[i].nickname] = users[i];
		}
		Minitalk.viewUserListSort.sort();
		
		$(".userList").html("");
		$(".userList").append(Minitalk.user.getTag(Minitalk.user.me,true));
		
		for (var i=0, loop=Minitalk.viewUserListSort.length;i<loop;i++) {
			var nickname = Minitalk.viewUserListSort[i].replace(/^\[(#|\*|\+|\-)?(.*?)\]$/,"$2");
			var user = Minitalk.user.getTag(Minitalk.viewUserListStore[nickname],true);
			
			if (Minitalk.viewUserListStore[nickname].nickname == Minitalk.user.me.nickname) {
				user.css("display","none");
			}
			
			$(".userList").append(user);
		}
		
		Minitalk.ui.printMessage("system",Minitalk.getText("text/unit").replace("{COUNT}","<b><u>"+Minitalk.viewUserListSort.length+"</u></b>"));
	},
	/**
	 * 접속자목록을 숨긴다.
	 */
	hideUser:function() {
		$(".toggleUserList").removeClass("toggleUserListOn").addClass("toggleUserListOff");
		Minitalk.viewUserListStatus = false;

		if (Minitalk.type == "vertical") {
			$(".userList").animate({height:1},{step:function(now,fx) {
				var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
				$(".chatArea").css("marginTop",$(".userList").outerHeight(true));
				$(".chatArea").outerHeight(height,true);
				
				if (now == 1) {
					$(".userList").hide();
					$(".chatArea").css("marginTop",0);
					$(".chatArea").outerHeight(height,true);
					$(".userList").html("");
					Minitalk.ui.autoScroll();
				}
			}});
		} else {
			$(".userList").animate({width:1},{step:function(now,fx) {
				$(".chatArea").css("marginRight",$(".userList").outerWidth(true));
				$(".chatArea").outerWidth($(".frame").innerWidth(),true);
				
				if (now == 1) {
					$(".userList").hide();
					$(".chatArea").css("marginRight",0);
					$(".chatArea").outerWidth($(".frame").innerWidth(),true);
					$(".userList").html("");
					Minitalk.ui.autoScroll();
				}
			}});
		}
		Minitalk.viewUserListSort = [];
		Minitalk.viewUserListStore = {};
	},
	/**
	 * 메시지를 전송한다.
	 *
	 * @param string message 메시지
	 * @param isRaw 가공되지 않은 메시지인지 여부
	 */
	sendMessage:function(message,isRaw) {
		if (Minitalk.user.checkLimit(Minitalk.chatLimit,Minitalk.user.me.opper) == false) {
			Minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_ALLOWED_CHATTING"));
			return;
		}
		
		if (message.replace(/ /g,'').length == 0) return;
		
		isRaw = isRaw === true ? true : false;
		if (message.length == 0) return;

		if (isRaw == true) {
			if (Minitalk.storage("baned") != null && typeof Minitalk.storage("baned") == "object") {
				var baned = Minitalk.storage("baned");
				var check = baned[Minitalk.channel] ? baned[Minitalk.channel] : 0;
				if (check > new Date().getTime()) {
					Minitalk.ui.printMessage("system",Minitalk.getText("action/banedtime").replace("{SECOND}","<b><u>"+Math.ceil((check - new Date().getTime()) / 1000)+"</u></b>"));
					return false;
				}
			}
			var printMessage = message;
			Minitalk.socket.send("message",message);
		} else {
			if (message.indexOf("/") == 0) {
				var commandLine = message.split(" ");
				var command = commandLine.shift().toLowerCase();
				
				switch (command) {
					case "/w" :
						if (commandLine.length >= 2) {
							var nickname = commandLine.shift();
							var message = Minitalk.ui.encodeMessage(commandLine.join(" "),false);
							
							if (typeof Minitalk.listeners.beforeSendWhisper == "function") {
								if (Minitalk.listeners.beforeSendWhisper(Minitalk,nickname,message,Minitalk.user.me) == false) return;
							}
							
							for (var i=0, loop=Minitalk.beforeSendWhisper.length;i<loop;i++) {
								if (typeof Minitalk.beforeSendWhisper[i] == "function") {
									if (Minitalk.beforeSendWhisper[i](Minitalk,nickname,message,Minitalk.user.me) == false) return;
								}
							}
							
							Minitalk.socket.send("whisper",{nickname:nickname,message:message});
							
							if (typeof Minitalk.listeners.onSendWhisper == "function") {
								this.listeners.onSendWhisper(Minitalk,nickname,message,Minitalk.user.me);
							}
							
							for (var i=0, loop=Minitalk.onSendWhisper.length;i<loop;i++) {
								if (typeof Minitalk.onSendWhisper[i] == "function") {
									Minitalk.onSendWhisper[i](Minitalk,nickname,message,Minitalk.user.me);
								}
							}
						} else {
							Minitalk.ui.printMessage("error",Minitalk.getErrorText("INVALID_COMMAND"));
						}
						
						break;
						
					case "/call" :
						if (commandLine.length == 1) {
							var nickname = commandLine.shift();
							Minitalk.socket.sendCall(nickname);
						} else {
							Minitalk.ui.printMessage("error",Minitalk.getErrorText("INVALID_COMMAND"));
						}
						break;
						
					case "/login" :
						if (commandLine.length == 1) {
							var password = commandLine.shift();
							Minitalk.ui.login(password);
						} else {
							Minitalk.ui.printMessage("error",Minitalk.getErrorText("INVALID_COMMAND"));
						}
						break;
				}
				
				return;
			} else {
				if (Minitalk.storage("baned") != null && typeof Minitalk.storage("baned") == "object") {
					var baned = Minitalk.storage("baned");
					var check = baned[Minitalk.channel] ? baned[Minitalk.channel] : 0;
					if (check > new Date().getTime()) {
						Minitalk.ui.printMessage("system",Minitalk.getText("action/banedtime").replace("{SECOND}","<b><u>"+Math.ceil((check - new Date().getTime()) / 1000)+"</u></b>"));
						return false;
					}
				}
				
				if (typeof Minitalk.listeners.beforeSendMessage == "function") {
					if (Minitalk.listeners.beforeSendMessage(Minitalk,message,Minitalk.user.me) == false) return;
				}
				
				for (var i=0, loop=Minitalk.beforeSendMessage.length;i<loop;i++) {
					if (typeof Minitalk.beforeSendMessage[i] == "function") {
						if (Minitalk.beforeSendMessage[i](Minitalk,message,Minitalk.user.me) == false) return;
					}
				}
				
				var printMessage = Minitalk.ui.encodeMessage(message,true);
				Minitalk.socket.send("message",printMessage);
			}
		}
		
		Minitalk.ui.printChatMessage("chat",Minitalk.user.me,printMessage);
		
		if (isRaw == false) {
			if (typeof Minitalk.listeners.onSendMessage == "function") {
				Minitalk.listeners.onSendMessage(Minitalk,message,Minitalk.user.me);
			}
			
			for (var i=0, loop=Minitalk.onSendMessage.length;i<loop;i++) {
				if (typeof Minitalk.onSendMessage[i] == "function") {
					Minitalk.onSendMessage[i](Minitalk,message,Minitalk.user.me);
				}
			}
		}
	},
	/**
	 * 메시지를 인코딩한다.
	 *
	 * @param string message 인코딩 전 메시지
	 * @param boolean isBBcode BB코드적용여부
	 * @return string message 인코딩 된 메시지
	 */
	encodeMessage:function(message,isBBcode) {
		message = message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\/,"");
		
		message = message.replace(/\[COLOR=(.*?)\]/g,'');
		message = message.replace(/\[(B|I|U)\]/g,'');
		message = message.replace(/\[\/(COLOR|B|I|U)\]/g,'');
			
		if (isBBcode == true) {
			if (Minitalk.setting("fontColor") !== false && Minitalk.setting("fontColor").length == 6) message = '[COLOR='+Minitalk.setting("fontColor")+']'+message+'[/COLOR]';
			if (Minitalk.setting("fontBold") == true) message = '[B]'+message+'[/B]';
			if (Minitalk.setting("fontItalic") == true) message = '[I]'+message+'[/I]';
			if (Minitalk.setting("fontUnderline") == true) message = '[U]'+message+'[/U]';
		}
		
		return message;
	},
	/**
	 * 인코딩된 메시지를 디코딩한다.
	 *
	 * @param string message 인코딩 전 메시지
	 * @param boolean isFontColor 폰트색상적용여부
	 * @return string message 인코딩 된 메시지
	 */
	decodeMessage:function(message,isFontColor) {
		if (isFontColor == true) message = message.replace(/\[COLOR=([a-zA-Z0-9]{6})\](.*?)\[\/COLOR\]/g,'<span style="color:#$1;">$2</span>');
		else message = message.replace(/\[COLOR=([a-zA-Z0-9]{6})\](.*?)\[\/COLOR\]/g,'$2');
		message = message.replace(/\[B\](.*?)\[\/B\]/g,'<b>$1</b>');
		message = message.replace(/\[I\](.*?)\[\/I\]/g,'<i>$1</i>');
		message = message.replace(/\[U\](.*?)\[\/U\]/g,'<span style="text-decoration:underline;">$1</span>');
		message = message.replace(/((http|ftp|https):\/\/[^ \(\)<>]+)/g,'<a href="$1" target="_blank">$1</a>');
		message = message.replace(/\[EMO:(.*?)\]/g,'<img src="'+Minitalk.getUrl()+'/emoticons/$1" style="vertical-align:middle" onload="Minitalk.ui.autoScroll();" />');
		
		return message;
	},
	/**
	 * 툴바의 색상선택기 레이어를 출력한다.
	 */
	selectFontColor:function() {
		if ($(".toolEmoticonLayer").css("display") != "none") Minitalk.ui.insertEmoticon();
		if ($(".toolListLayer").css("display") != "none") {
			$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
			$(".toolButtonMore").removeClass("selected");
		}
		
		if ($(".toolFontColorLayer").css("display") == "none") {
			$(".toolColor").addClass("selected");
			
			$(".toolFontColorLayer").html("");
			var colorbox = $("<div>").addClass("default");
			colorbox.attr("code","");
			if (Minitalk.setting("fontColor") == false || Minitalk.setting("fontColor") == "") colorbox.addClass("selected");
			colorbox.on("mouseover",function() { $(this).addClass("mouseover"); });
			colorbox.on("mouseout",function() { $(this).removeClass("mouseover"); });
			colorbox.on("click",function() {
				$($(".toolFontColorLayer").find("div")).removeClass("selected");
				$(this).addClass("selected");
				Minitalk.setting("fontColor",$(this).attr("code"));
				$(".inputText").css("color","#"+$(this).attr("code"));
			});
			$(".toolFontColorLayer").append(colorbox);
			
			var colors = ["#7F7F7F","#880015","#ED1C24","#FF7F27","#FFF200","#22B14C","#00A2E8","#3F48CC","#A349A4","#000000","#C3C3C3","#B97A57","#FFAEC9","#FFC90E","#EFE4B0","#B5E61D","#99D9EA","#7092BE","#C8BFE7"];
			for (var i=0, loop=colors.length;i<loop;i++) {
				var colorbox = $("<div>").addClass("color").css("backgroundColor",colors[i]);
				colorbox.attr("code",colors[i].replace("#",""));
				if (Minitalk.setting("fontColor") == colors[i]) colorbox.addClass("selected");
				
				colorbox.on("mouseover",function() { $(this).addClass("mouseover"); });
				colorbox.on("mouseout",function() { $(this).removeClass("mouseover"); });
				colorbox.on("click",function() {
					$($(".toolFontColorLayer").find("div")).removeClass("selected");
					$(this).addClass("selected");
					Minitalk.setting("fontColor",$(this).attr("code"));
					$(".inputText").css("color","#"+$(this).attr("code"));
				});
				$(".toolFontColorLayer").append(colorbox);
			}
			
			if ($(".toolArea").find(".toolColor").length > 0 && $(".toolColor").position().left + $(".toolFontColorLayer").outerWidth(true) < $(".frame").innerWidth()) {
				$(".toolFontColorLayer").css("right","auto");
				$(".toolFontColorLayer").css("left",$(".toolColor").position().left);
			} else {
				$(".toolFontColorLayer").css("left","auto");
				$(".toolFontColorLayer").css("right",Math.ceil(($(".frame").outerWidth(true)-$(".frame").innerWidth())/2));
			}
			
			$(".toolFontColorLayer").show();
			var height = 0;
			if ($(".toolFontColorLayer").attr("height")) {
				height = parseInt($(".toolFontColorLayer").attr("height"));
			} else {
				height = $(".toolFontColorLayer").height();
				$(".toolFontColorLayer").attr("height",height);
			}
			
			$(".toolFontColorLayer").height(1);
			$(".toolFontColorLayer").animate({height:height},"fast");
		} else {
			$(".toolColor").removeClass("selected");
			$(".toolFontColorLayer").animate({height:1},"fast",function() { $(".toolFontColorLayer").hide(); });
		}
	},
	/**
	 * 툴바의 이모티콘선택기 레이어를 출력한다.
	 */
	insertEmoticon:function() {
		if ($(".toolFontColorLayer").css("display") != "none") Minitalk.ui.selectFontColor();
		
		if ($(".toolEmoticonLayer").find(".toolEmoticonLayerTab").length == 0) {
			var tab = $("<div>").addClass("toolEmoticonLayerTab");
			var tabList = $("<div>").addClass("toolEmoticonLayerTabList").data("position",0);
			var list = $("<div>").addClass("toolEmoticonLayerList");
			
			for (var i=0, loop=Minitalk.emoticons.length;i<loop;i++) {
				var thisTab = $("<div>");
				thisTab.attr("tabIDX",i);
				if (i == 0) thisTab.addClass("selected first");
				else if (i == Minitalk.emoticons.length - 1) thisTab.addClass("last");
				thisTab.html('<img src="'+Minitalk.getUrl()+'/emoticons/'+Minitalk.emoticons[i].path+'/'+Minitalk.emoticons[i].icon+'" />');
				thisTab.on("click",function() {
					$(".toolEmoticonLayerTabList > DIV").removeClass("selected");
					$(this).addClass("selected");
					$(".toolEmoticonLayerListTab").hide();
					$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[$(this).attr("tabIDX")]).show();
				});
				tabList.append(thisTab);
				
				var listTab = $("<div>").addClass("toolEmoticonLayerListTab");
				for (var j=0, loopj=Minitalk.emoticons[i].emoticon.length;j<loopj;j++) {
					var icon = $("<div>").addClass(".toolEmoticonLayerIcon").addClass(Minitalk.emoticons[i].type);
					icon.on("mouseover",function() { $(this).addClass("mouseover"); });
					icon.on("mouseout",function() { $(this).removeClass("mouseover"); });
					icon.on("click",function() {
						$(".inputText").val($(".inputText").val()+$(this).attr("code"));
						$(".inputText").focus();
					});
					
					if (Minitalk.emoticons[i].type == "image") {
						icon.attr("code","[EMO:"+Minitalk.emoticons[i].path+"/"+Minitalk.emoticons[i].emoticon[j]+"]");
						icon.html('<img src="'+Minitalk.getUrl()+'/emoticons/'+Minitalk.emoticons[i].path+'/'+Minitalk.emoticons[i].emoticon[j]+'" />');
					} else {
						icon.attr("code",Minitalk.emoticons[i].emoticon[j]);
						icon.html(Minitalk.emoticons[i].emoticon[j]);
					}
					listTab.append(icon);
				}
				list.append(listTab);
			}
			var leftMore = $("<div>").addClass("left");
			leftMore.on("click",function() {
				var position = $(".toolEmoticonLayerTabList").data("position");
				if (position > 0) {
					position--;
					$(".toolEmoticonLayerTabList").data("position",position);
					
					var width = 0;
					
					for (var i=0;i<position;i++) {
						width+= $($(".toolEmoticonLayerTabList > DIV")[i]).outerWidth(true);
					}
					$(".toolEmoticonLayerTabList").animate({scrollLeft:width},"fast",function() {
						$(".toolEmoticonLayerTabList > DIV").removeClass("selected");
						$($(".toolEmoticonLayerTabList > DIV")[$(".toolEmoticonLayerTabList").data("position")]).addClass("selected");
						$(".toolEmoticonLayerListTab").hide();
						$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[$(".toolEmoticonLayerTabList").data("position")]).show();
					});
				}
			});
			tab.append(leftMore);
			tab.append(tabList);
			var rightMore = $("<div>").addClass("right");
			rightMore.on("click",function() {
				var position = $(".toolEmoticonLayerTabList").data("position");
				if (position < $(".toolEmoticonLayerTabList > DIV").length - 1) {
					position++;
					$(".toolEmoticonLayerTabList").data("position",position);
					
					var width = 0;
					
					for (var i=0;i<position;i++) {
						width+= $($(".toolEmoticonLayerTabList > DIV")[i]).outerWidth(true);
					}
					$(".toolEmoticonLayerTabList").animate({scrollLeft:width},"fast",function() {
						$(".toolEmoticonLayerTabList > DIV").removeClass("selected");
						$($(".toolEmoticonLayerTabList > DIV")[$(".toolEmoticonLayerTabList").data("position")]).addClass("selected");
						$(".toolEmoticonLayerListTab").hide();
						$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[$(".toolEmoticonLayerTabList").data("position")]).show();
					});
				}
			});
			tab.append(rightMore);
			$(".toolEmoticonLayer").append(tab);
			$(".toolEmoticonLayer").append(list);
			
			$(".toolEmoticonLayerListTab").hide();
			$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[0]).show();
		}
		
		if ($(".toolListLayer").css("display") != "none") {
			$(".toolListLayer").hide();
			$(".toolButtonMore").removeClass("selected");
		}
		
		$(".toolEmoticonLayer").outerWidth(165,true);
		$(".toolEmoticonLayerTabList").outerWidth($(".toolEmoticonLayer").innerWidth() - $(".toolEmoticonLayerTab > .left").outerWidth(true) - $(".toolEmoticonLayerTab > .left").outerWidth(true),true);
		
		if ($(".toolEmoticonLayer").css("display") != "none") {
			$(".toolEmoticon").removeClass("selected");
			$(".toolEmoticonLayer").animate({height:1},"fast",function() {
				$(".toolEmoticonLayer").hide();
			});
		} else {
			$(".toolEmoticonLayer").height(1);
			$(".toolEmoticonLayer").show();
			if ($(".toolArea").find(".toolEmoticon").length > 0 && $(".toolEmoticon").position().left + 165 < $(".frame").innerWidth()) {
				$(".toolEmoticonLayer").css("right","auto");
				$(".toolEmoticonLayer").css("left",$(".toolEmoticon").position().left);
			} else {
				$(".toolEmoticonLayer").css("left","auto");
				$(".toolEmoticonLayer").css("right",Math.ceil(($(".frame").outerWidth(true)-$(".frame").innerWidth())/2));
			}
			$(".toolEmoticon").addClass("selected");
			
			var height = $(".chatArea").outerHeight(true) > 150 ? 150 : $(".chatArea").outerHeight(true);
			$(".toolEmoticonLayer").animate({height:height},"fast",function() {
				$(".toolEmoticonLayerList").outerHeight($(".toolEmoticonLayer").innerHeight() -  $(".toolEmoticonLayerTab").outerHeight(true),true);
			});
		}
	},
	/**
	 * 상황에 따라 개인채널을 연다.
	 *
	 * @param string mode 개인채널모드 create / join
	 * @param object data 개인채널정보
	 */
	openPrivateChannel:function(mode,data) {
		if (mode == "create") {
			if (window[Minitalk.user.getUuid()] === undefined) {
				Minitalk.ui.printMessage("system",Minitalk.getText("action/create_private_channel"));
				return Minitalk.ui.createPrivateChannel(data);
			}
		} else if (mode == "join") {
			if (window[data.code] === undefined) {
				Minitalk.ui.printMessage("system",Minitalk.getText("action/join_private_channel").replace("{NICKNAME}","<b><u>"+data.from.nickname+"</u></b>"));
				return Minitalk.ui.createPrivateChannel(data);
			}
		}
	},
	/**
	 * 개인채널을 개설한다.
	 *
	 * @param object data 개인채널정보
	 */
	createPrivateChannel:function(data) {
		var width = 700;
		var height = 400;
		var windowLeft = Math.ceil((screen.width-width)/2);
		var windowTop = Math.ceil((screen.height-height)/2 > 2);
		
		var target = data.code + Math.random();

		var formObject = $("<form>").css("display","none").attr("action",Minitalk.getUrl()+"/html/PrivateChannel.php").attr("target",target).attr("method","POST");
		
		formObject.append($("<input>").attr("name","channel").attr("value",Minitalk.channel));
		formObject.append($("<input>").attr("name","owner").attr("value",data.from.nickname));
		formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(Minitalk.user.me)));
		formObject.append($("<input>").attr("name","config").attr("value",JSON.stringify({templet:Minitalk.templet,language:Minitalk.language})));
		formObject.append($("<input>").attr("name","code").attr("value",data.code));
		formObject.append($("<input>").attr("name","plugin").attr("value",JSON.stringify(Minitalk.plugin)));
			
		if (data.from.nickname == Minitalk.user.me.nickname) {
			formObject.append($("<input>").attr("name","invite").attr("value",data.to.nickname));
		}
		$("body").append(formObject);

		window[data.code] = window.open("",target,"top="+windowTop+",left="+windowLeft+",width="+width+",height="+height+",scrollbars=0");
		if (window[data.code]) {
			window[data.code].focus();
			formObject.submit();
			formObject.remove();
			
			return true;
		} else {
			Minitalk.ui.printMessage("error",Minitalk.getErrorText("DISABLED_POPUP"));
			formObject.remove();
			
			return false;
		}
	},
	/**
	 * 플러그인채널을 개설한다.
	 */
	openPluginChannel:function(plugin,code,width,height,data) {
		var windowLeft = Math.ceil((screen.width-width)/2);
		var windowTop = Math.ceil((screen.height-height)/2 > 2);
		
		var target = plugin+Math.random();
		
		var formObject = $("<form>").css("display","none").attr("action",Minitalk.getUrl()+"/html/PluginChannel.php").attr("target",target).attr("method","POST");
		
		formObject.append($("<input>").attr("name","channel").attr("value",Minitalk.channel));
		formObject.append($("<input>").attr("name","code").attr("value",code));
		formObject.append($("<input>").attr("name","parent").attr("value",Minitalk.isPrivate ? m.private : Minitalk.channel));
		formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(Minitalk.user.me)));
		formObject.append($("<input>").attr("name","config").attr("value",JSON.stringify({templet:Minitalk.templet,language:Minitalk.language})));
		formObject.append($("<input>").attr("name","plugin").attr("value",plugin));
		formObject.append($("<input>").attr("name","data").attr("value",JSON.stringify(data)));
		$("body").append(formObject);

		var popup = window.open("",target,"top="+windowTop+",left="+windowLeft+",width="+width+",height="+height+",scrollbars=0");
		if (popup) {
			popup.focus();
			formObject.submit();
			formObject.remove();
			
			return true;
		} else {
			Minitalk.ui.printMessage("error",Minitalk.getErrorText("DISABLED_POPUP"));
			formObject.remove();
			
			return false;
		}
	},
	/**
	 * 채널관리자로 로그인한다.
	 *
	 * @param string password 채널패스워드
	 */
	login:function(password) {
		$.send(Minitalk.getUrl()+"/process/getChannelAdmin",{channel:Minitalk.channel,password:password},function(result) {
			if (result.success == true) {
				Minitalk.socket.send("oppercode",result.oppercode);
			} else {
				Minitalk.ui.printMessage("error",Minitalk.getErrorText("INVALID_PASSWORD"));
			}
		});
	},
	/**
	 * 알림창을 표시한다.
	 *
	 * @param string type 알림형태
	 * @param string code 알림고유값
	 * @param string message 알림메시지
	 * @param boolean autoHide 자동숨김여부
	 * @param object data 알림데이터
	 * @param function callback
	 */
	showAlert:function(type,code,message,autoHide,data,callback) {
		if ($(".alertLayer").find("."+code).length > 0) {
			$($(".alertLayer").find("."+code)).html();
			return false;
		}
		
		var autoHide = autoHide === false ? false : true;
		var data = data ? data : null;
		
		var alertLayer = $("<div>").addClass(type).addClass(code).html(message);
		alertLayer.attr("code",code);
		alertLayer.data("data",data);
		alertLayer.on("click",function() {
			Minitalk.ui.removeAlert($(this).attr("code"),callback);
		});
		$(".alertLayer").append(alertLayer);
		var height = alertLayer.height();
		alertLayer.height(1);
		alertLayer.animate({height:height},"fast");
		
		if (autoHide == true) {
			setTimeout(Minitalk.ui.removeAlert,15000,code);
		}
		
		return true;
	},
	/**
	 * 알림창을 제거한다.
	 *
	 * @param string code 알림고유값
	 * @param function callback
	 */
	removeAlert:function(code,callback) {
		var alert = $($(".alertLayer").find("."+code));
		alert.attr("oMarginLeft",alert.css("marginLeft"));
		var width = alert.width();
		var height = alert.height();
		alert.css("width",width);
		alert.css("height",height);
		alert.animate({marginLeft:-$(".frame").outerWidth()},"fast",function() {
			$(this).animate({height:1},"fast",function() {
				if (typeof callback == "function") {
					if (callback($(this)) === false) {
						$($(".alertLayer").find("."+code)).css("marginLeft",$($(".alertLayer").find("."+code)).attr("oMarginLeft"));
						$($(".alertLayer").find("."+code)).css("height","auto");
					} else {
						$(this).remove();
					}
				} else {
					$(this).remove();
				}
			});
		});
	},
	/**
	 * 공지사항을 표시한다.
	 *
	 * @param string message 메시지
	 * @param string url URL 링크
	 */
	showNotice:function(message,url) {
		if (!url) url = "";
		
		Minitalk.ui.showAlert("notice","notice"+Math.ceil(Math.random()*10000),message,true,url,function(alert) {
			if (alert.data("data").length > 0) window.open(alert.data("data"));
		});
	},
	/**
	 * 사운드를 재생한다.
	 */
	playSound:function(sound) {
		if (Minitalk.setting("mute") == true) return;
		
		var $audio = $("audio[data-type="+sound+"]");
		if ($audio.length == 0) return;
		
		var audio = $audio.get(0);
		audio.muted = false;
		var promise = audio.play();
		if (promise !== undefined) {
			promise.then(function() {
			}).catch(function(e) {
			});
		}
	},
	/**
	 * 브라우저 알림을 전송한다.
	 */
	push:function(title,message) {
		if (Minitalk.setting("push") == true && window.Notification !== undefined && Notification.permission == "granted") {
			var notification = new Notification(title,{body:message,icon:Minitalk.getUrl()+"/images/minitalk.png"});
		}
	}
};