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
	tools:[],
	resizeTimer:null,
	isFixedScroll:false,
	/**
	 * 미니톡 채팅위젯 UI 를 초기화한다.
	 */
	init:function() {
		var $frame = $("div[data-role=frame]");
		
		/**
		 * 알림영역을 추가한다.
		 */
		$frame.append('<div data-role="notifications"></div>');
		
		/**
		 * 필수 audio 객체를 추가한다.
		 */
		$frame.append('<audio data-type="call"><source src="' + Minitalk.getUrl() + '/sounds/call.mp3" type="audio/mpeg"></audio>');
		$frame.append('<audio data-type="message"><source src="' + Minitalk.getUrl() + '/sounds/message.mp3" type="audio/mpeg"></audio>');
		$frame.append('<audio data-type="query"><source src="' + Minitalk.getUrl() + '/sounds/query.mp3" type="audio/mpeg"></audio>');
		
		/**
		 * UI 초기화함수 실행
		 */
		Minitalk.ui.initEvents();
		Minitalk.ui.initFrame();
		Minitalk.ui.disable();
	},
	/**
	 * UI DOM 객체의 이벤트를 정의한다.
	 */
	initEvents:function() {
		/**
		 * 헤더 버튼 이벤트 추가
		 */
		var $header = $("header");
		$("button[data-action]",$header).on("click",function(e) {
			var $button = $(this);
			var action = $button.attr("data-action");
			
			if (action == "users") {
				Minitalk.ui.toggleUsers();
			}
			
			if (action == "configs") {
				Minitalk.ui.toggleConfigs();
			}
			
			e.stopImmediatePropagation();
		});
		
		/**
		 * 채팅입력폼 이벤트 추가
		 */
		$("div[data-role=input] > input").on("keypress",function(e) {
			if (e.keyCode == 13) {
				Minitalk.ui.sendMessage($(this).val());
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		});
		
		/**
		 * 메시지 전송버튼 이벤트 추가
		 */
		$("div[data-role=input] > button").on("click",function() {
			Minitalk.ui.sendMessage($("div[data-role=input] > input").val());
		});

		/**
		 * 리사이즈 이벤트 추가
		 */
		$(window).on("resize",function() {
			if (Minitalk.ui.resizeTimer != null) {
				clearTimeout(Minitalk.ui.resizeTimer);
				Minitalk.ui.resizeTimer = null;
			}
			
			Minitalk.ui.resizeTimer = setTimeout(Minitalk.ui.initFrame,200);
		});
		
		/**
		 * 화면전환 이벤트 추가
		 */
		$(window).on("orientationchange",function() {
			if (Minitalk.ui.resizeTimer != null) {
				clearTimeout(Minitalk.ui.resizeTimer);
				Minitalk.ui.resizeTimer = null;
			}
			
			Minitalk.ui.resizeTimer = setTimeout(Minitalk.ui.initFrame,200);
		});
		
		/**
		 * 클릭이벤트를 이용하여 특수한 DOM 객체를 초기화한다.
		 */
		$(document).on("click",function(e) {
			Minitalk.ui.initSounds();
			Minitalk.ui.resetToggle();
		});
		
		/**
		 * Keypress 이벤트처리
		 */
		$(document).on("keydown",function(e) {
			if (e.keyCode == 27) {
				$(document).triggerHandler("esc");
			}
		});
		
		/**
		 * ESC 기본이벤트 처리
		 */
		$(document).on("esc",function() {
			Minitalk.ui.resetToggle();
		});
		
		/**
		 * 웹폰트 로드가 완료되면, UI 를 재정의한다.
		 */
		document.fonts.ready.then(function () {
			Minitalk.ui.initFrame();
		});
	},
	/**
	 * 브라우저 사이즈가 변경되거나, UI가 최초표시될 때 UI 요소를 초기화한다.
	 */
	initFrame:function() {
		if (Minitalk.type == "auto") {
			if ($(document).height() >= $(document).width()) {
				var type = "vertical";
			} else {
				var type = "horizontal";
			}
		} else {
			var type = Minitalk.type;
		}
		
		var $frame = $("div[data-role=frame]");
		$frame.attr("data-type",type);
		
		var $header = $("header",$frame);
		$header.attr("data-type",type);
		
		var $main = $("main");
		$main.attr("data-type",type);
		
		var $footer = $("footer");
		$footer.attr("data-type",type);
		
		Minitalk.ui.initTools();
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
	initTools:function() {
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
		Minitalk.ui.tools = defaultTool.concat(Minitalk.addToolList);
		
		$(".toolArea").html("");
		$(".toolListLayer").html("");

		for (var i=0, loop=Minitalk.ui.tools.length;i<loop;i++) {
			if (typeof Minitalk.ui.tools[i] == "object") {
				var thisButton = $("<button>").addClass("toolButton toolButtonOff");
				thisButton.attr("title",Minitalk.ui.tools[i].text);
				thisButton.attr("toolIDX",i);
				if (Minitalk.ui.tools[i].cls) thisButton.addClass(Minitalk.ui.tools[i].cls);
				thisButton.on("mouseover",function() { $(this).addClass("mouseover"); });
				thisButton.on("mouseout",function() { $(this).removeClass("mouseover"); });
				thisButton.on("click",function() { Minitalk.ui.tools[$(this).attr("toolIDX")].fn(Minitalk); });
				
				var thisButtonInner = $("<div>").addClass("toolButtonInner");
				
				if (Minitalk.toolType != "text") {
					var iconPath = Minitalk.ui.tools[i].cls ? Minitalk.getUrl()+'/templets/'+Minitalk.templet+'/images/'+Minitalk.ui.tools[i].icon : Minitalk.ui.tools[i].icon;
					thisButtonInner.append($("<span>").addClass("toolButtonIcon").css("backgroundImage","url("+iconPath+")"));
				}
				
				if (Minitalk.toolType != "icon" || Minitalk.ui.tools[i].viewText === true) {
					thisButtonInner.append($("<span>").addClass("toolButtonText").text(Minitalk.ui.tools[i].text));
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
			
			for (var i=listStart, loop=Minitalk.ui.tools.length;i<loop;i++) {
				if (i == listStart && typeof Minitalk.ui.tools[i] != "object") continue;

				if (typeof Minitalk.ui.tools[i] == "object") {
					var thisButton = $("<div>").addClass("toolList");
					if (Minitalk.ui.tools[i].cls) thisButton.addClass(Minitalk.ui.tools[i].cls);
					thisButton.attr("toolIDX",i);
					thisButton.on("mouseover",function() { $(this).addClass("mouseover"); });
					thisButton.on("mouseout",function() { $(this).removeClass("mouseover"); });
					thisButton.on("click",function() { Minitalk.ui.tools[$(this).attr("toolIDX")].fn(Minitalk); });
					var iconPath = Minitalk.ui.tools[i].cls ? Minitalk.getUrl()+'/templets/'+Minitalk.templet+'/images/'+Minitalk.ui.tools[i].icon : Minitalk.ui.tools[i].icon;
					thisButton.append($("<span>").addClass("toolListIcon").css("backgroundImage","url("+iconPath+")"));
					thisButton.append($("<span>").addClass("toolListText").text(Minitalk.ui.tools[i].text));
					
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
	 * 메시지 폰트설정권한이 있는 경우, 현재 저장된 폰트설정에 따라 툴바 및 입력폼의 스타일을 변경한다.
	 */
	initToolButton:function(mode) {
		if (mode == false) {
			$($(".toolArea").find("button")).attr("disabled");
			$($(".toolArea").find("button")).removeClass("selected").addClass("disabled");
			$($(".toolArea").find(".toolButtonMore")).attr("disabled");
			$($(".toolArea").find(".toolButtonMore")).removeClass("selected").addClass("disabled");
			return;
	initFonts:function() {
		/**
		 * 서버에 접속하기전이라면, 폰트 업데이트를 중단한다.
		 */
		if (Minitalk.socket.isConnected() === false) return false;
		
		/**
		 * 폰트설정권한이 없는 경우 저장된 값을 초기화한다.
		 */
		if (Minitalk.socket.getPermission("font") === false) {
			Minitalk.fonts("bold",false);
			Minitalk.fonts("italic",false);
			Minitalk.fonts("underline",false);
			Minitalk.fonts("color",null);
		}
		
		$($(".toolArea").find("button")).attr("disabled",null);
		$($(".toolArea").find("button")).removeClass("disabled");
		$($(".toolArea").find(".toolButtonMore")).attr("disabled",null);
		$($(".toolArea").find(".toolButtonMore")).removeClass("disabled");
		var fonts = Minitalk.fonts();
		if (fonts === null) return;
		
		if (Minitalk.setting("fontBold") == true) {
			$(".toolBold").addClass("selected");
			$(".inputText").css("fontWeight","bold");
		} else {
			$(".toolBold").removeClass("selected");
			$(".inputText").css("fontWeight","normal");
		}
		/**
		 * 입력폼 스타일적용
		 */
		var $input = $("div[data-role=input] > input");
		$input.css("fontWeight",fonts.bold === true ? "bold" : "normal");
		$input.css("fontStyle",fonts.italic === true ? "italic" : "normal");
		$input.css("textDecoration",fonts.underline === true ? "underline" : "none");
		$input.css("color",fonts.color === null ? null : fonts.color);
		
		if (Minitalk.setting("fontItalic") == true) {
			$(".toolItalic").addClass("selected");
			$(".inputText").css("fontStyle","italic");
		} else {
			$(".toolItalic").removeClass("selected");
			$(".inputText").css("fontStyle","");
		}
		/**
		 * 툴바 스타일적용
		 */
		var $footer = $("footer");
		var $tools = $("ul[data-role]",$footer);
		$("button[data-tool=bold]",$tools).removeClass("on");
		$("button[data-tool=italic]",$tools).removeClass("on");
		$("button[data-tool=underline]",$tools).removeClass("on");
		
		if (fonts.bold === true) $("button[data-tool=bold]",$tools).addClass("on");
		if (fonts.italic === true) $("button[data-tool=italic]",$tools).addClass("on");
		if (fonts.underline === true) $("button[data-tool=underline]",$tools).addClass("on");
	},
	/**
	 * 미니톡 위젯 UI를 활성화한다.
	 *
	 * @param boolean inputmode 메시지 입력창만 활성화할지 여부 (기본값 : false)
	 */
	enable:function(inputmode) {
		var inputmode = inputmode === true;
		
		if (Minitalk.setting("fontUnderline") == true) {
			$(".toolUnderline").addClass("selected");
			$(".inputText").css("textDecoration","underline");
		if (inputmode === true) {
			$("div[data-role=input] > button").enable();
		} else {
			$(".toolUnderline").removeClass("selected");
			$(".inputText").css("textDecoration","");
			var $frame = $("div[data-role=frame]");
			$("div[data-role=disable]",$frame).remove();
		}
	},
	/**
	 * 미니톡 위젯 UI를 비활성화한다.
	 *
	 * @param boolean inputmode 메시지 입력창만 비활성화할지 여부 (기본값 : false)
	 */
	disable:function(inputmode) {
		var inputmode = inputmode === true;
		
		if (Minitalk.setting("fontColor") !== false && Minitalk.setting("fontColor") != "") {
			$(".inputText").css("color","#"+Minitalk.setting("fontColor"));
		if (inputmode === true) {
			$("div[data-role=input] > button").disable();
		} else {
			$(".inputText").css("color","");
			var $frame = $("div[data-role=frame]");
			if ($("div[data-role=disable]",$frame).length > 0) return;
			
			$frame.append($("<div>").attr("data-role","disable"));
		}
	},
		
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
	addTool:function(tool) {
		Minitalk.addToolList.push(tool);
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
			if (Minitalk.fireEvent("beforeMessage",[sender,message,time]) === false) return;
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
			Minitalk.fireEvent("message",[sender,message,time]);
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
			if (Minitalk.fireEvent("beforeWhisper",[sender,message,time]) === false) return;
		}
		
		$(item.find(".whisperTag")).append(user);
		
		var messageObject = $("<span>").addClass("body").html(Minitalk.splitString+message);
		if (time) messageObject.attr("title",Minitalk.ui.getTime(time,"YYYY.MM.DD HH:mm:ss"));
		item.append(messageObject);
		if (time) item.append($("<span>").addClass("time").html(Minitalk.ui.getTime(time,Minitalk.dateFormat)));
		
		$("section[data-role=chat]").append(item);
		Minitalk.ui.autoScroll();
		
		if (type == "whisper" && sender.nickname != Minitalk.user.me.nickname) {
			Minitalk.fireEvent("whisper",[sender,message,time]);
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
		$("section[data-role=chat]").scrollTop($("section[data-role=chat]").prop("scrollHeight"));
	},
	/**
	 * 채널명을 표시한다.
	 *
	 * @param string title
	 */
	printTitle:function(title) {
		$("h1").html(title);
	},
	/**
	 * 환경설정창을 불러온다.
	 */
						$(".chatArea").outerWidth(width,true);
						Minitalk.ui.autoScroll();
					}
				}});
			}
		}
		
	/**
	 * 접속자수를 출력한다.
	 *
	 * @param int count 접속자수
	 */
	printUserCount:function(count) {
		var $count = $("label[data-role=count]");
		if (count == 0) {
			$count.empty();
		} else {
			$count.html(Minitalk.getText("text/unit").replace("{COUNT}",count));
		}
		
		if (Minitalk.user.isAutoHideUsers == false && count > 200 && Minitalk.user.isVisibleUsers == true) {
			Minitalk.user.isAutoHideUsers = true;
			Minitalk.ui.printMessage("system",Minitalk.getText("action/autoHideUsers"));
			Minitalk.ui.toggleUsers(false);
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		$(document).triggerHandler("printUserCount",[Minitalk,$count,count]);
	},
	/**
	 * 접속자목록을 토글한다.
	 *
	 * @param boolean is_visible 보임여부
	 */
	toggleUsers:function(is_visible) {
		var $main = $("main");
		if (is_visible === undefined) {
			var is_visible = $main.hasClass("users") == true ? false : true;
		}
		
		var $header = $("header");
		var $button = $("button[data-action=users]",$header);
		
		$("aside[data-role=users]").empty();
		if (is_visible == true) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/loading_users"));
			Minitalk.socket.send("users",Minitalk.viewUserLimit);
			$main.addClass("users");
			$button.addClass("on");
			
			Minitalk.user.isVisibleUsers = true;
		} else {
			$main.removeClass("users");
			$button.removeClass("on");
			
			Minitalk.user.usersSort = [];
			Minitalk.user.users = {};
			
			Minitalk.user.isVisibleUsers = false;
		}
		
		Minitalk.ui.autoScroll();
	},
	/**
	 * 접속자목록을 출력한다.
	 */
	printUser:function(users) {
		var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
		
		Minitalk.user.usersSort = [];
		Minitalk.user.users = {};
		for (var i=0, loop=users.length;i<loop;i++) {
			Minitalk.user.usersSort.push("["+(users[i].opper ? sortUserCode[users[i].opper] : "")+users[i].nickname+"]");
			Minitalk.user.users[users[i].nickname] = users[i];
		}
		Minitalk.user.usersSort.sort();
		
		$("aside[data-role=users]").html("");
		$("aside[data-role=users]").append(Minitalk.user.getTag(Minitalk.user.me,true));
		
		for (var i=0, loop=Minitalk.user.usersSort.length;i<loop;i++) {
			var nickname = Minitalk.user.usersSort[i].replace(/^\[(#|\*|\+|\-)?(.*?)\]$/,"$2");
			var user = Minitalk.user.getTag(Minitalk.user.users[nickname],true);
			
			if (Minitalk.user.users[nickname].nickname == Minitalk.user.me.nickname) {
				user.css("display","none");
			}
			
			$("aside[data-role=users]").append(user);
		}
		
		Minitalk.ui.printMessage("system",Minitalk.getText("action/loaded_users").replace("{COUNT}","<b><u>"+Minitalk.user.usersSort.length+"</u></b>"));
	},
	/**
	 * 메시지를 전송한다.
	 *
	 * @param string message 메시지
	 * @param isRaw 가공되지 않은 메시지인지 여부
	 */
	sendMessage:function(message,isRaw) {
		if (Minitalk.socket.getPermission("chat") == false) {
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
							
							if (Minitalk.fireEvent("beforeSendWhisper",[nickname,message,Minitalk.user.me]) === false) return;
							
							Minitalk.socket.send("whisper",{nickname:nickname,message:message});
							
							Minitalk.fireEvent("sendWhisper",[nickname,message,Minitalk.user.me]);
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
				
				if (Minitalk.fireEvent("beforeSendMessage",[message,Minitalk.user.me]) === false) return;
				
				var printMessage = Minitalk.ui.encodeMessage(message,true);
				Minitalk.socket.send("message",printMessage);
			}
		}
		
		Minitalk.ui.printChatMessage("chat",Minitalk.user.me,printMessage);
		
		if (isRaw == false) {
			Minitalk.fireEvent("sendMessage",[message,Minitalk.user.me]);
		}
	},
	/**
	 * 자신이 입력한 메시지를 채팅창에 출력할 때, 이모티콘 치환과 메시지 스타일을 처리한다.
	 *
	 * @param string message 원본 메시지
	 * @return string message 처리된 메시지
	 */
	encodeMessage:function(message) {
		message = message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\/,"").replace(/\n/g,"<br>");
		
		/**
		 * 폰트설정을 치환한다.
		 */
		message = message.replace(/\[COLOR=(#[a-z0-9]{6})\](.*?)\[\/COLOR\]/gi,Minitalk.socket.getPermission("font") == true ? '<span style="color:$1;">$2</span>' : '$2');
		message = message.replace(/\[U\](.*?)\[\/U\]/gi,Minitalk.socket.getPermission("font") == true ? '<u>$1</u>' : '$1');
		message = message.replace(/\[I\](.*?)\[\/I\]/gi,Minitalk.socket.getPermission("font") == true ? '<i>$1</i>' : '$1');
		message = message.replace(/\[B\](.*?)\[\/B\]/gi,Minitalk.socket.getPermission("font") == true ? '<b>$1</b>' : '$1');
		
		return message;
	},
	/**
	 * 서버에서 전송된 RAW 채팅메시지를 HTML 태그로 변환한다.
	 *
	 * @param string message 원본 메시지
	 * @return string message 처리된 메시지
	 */
	decodeMessage:function(message,isFontColor) {
		/**
		 * 이모티콘을 치환한다.
		 */
		message = message.replace(/\[#([a-z0-9]+)\/([a-z0-9\.]+)\]/gi,'<img src="' + Minitalk.getUrl() + '/emoticons/$1/items/$2" style="vertical-align:middle;">');
		
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
		formObject.append($("<input>").attr("name","code").attr("value",data.code));
		formObject.append($("<input>").attr("name","templet").attr("value",Minitalk.templet));
		formObject.append($("<input>").attr("name","owner").attr("value",data.from.nickname));
		formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(Minitalk.user.me)));
		
		if (data.to != null && data.from.nickname == Minitalk.user.me.nickname) {
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
		
		var formObject = $("<form>").css("display","none").attr("action",Minitalk.getUrl()+"/html/PrivateChannel.php").attr("target",target).attr("method","POST");
		
		formObject.append($("<input>").attr("name","channel").attr("value",Minitalk.channel));
		formObject.append($("<input>").attr("name","code").attr("value",code));
		formObject.append($("<input>").attr("name","templet").attr("value",Minitalk.templet));
		formObject.append($("<input>").attr("name","owner").attr("value",data.nickname ? data.nickname : Minitalk.user.me.nickname));
		formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(Minitalk.user.me)));
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
	 * 알림메시지를 출력한다.
	 *
	 * @param string code 알림메시지 고유값 (같은 고유값을 가진 알림메시지는 동시에 출력되지 않는다.)
	 * @param string type 알림메시지 타입 (action, error, warning, success)
	 * @param string message 알림메시지 메시지
	 * @param boolean closable 알림메시지를 닫을 수 있는 여부 (기본값 : true)
	 * @param boolean autoHide 알림메시지 자동닫기 여부 (기본값 : true)
	 * @param object data 알림메시지에 담을 데이터
	 * @param function callback
	 */
	notify:function(code,type,message,closable,autoHide,data,callback) {
		var $notifications = $("div[data-role=notifications]");
		var $notification = $("div[data-code=" + code + "]",$notifications);
		if ($notification.length == 0) {
			var $notification = $("<div>").attr("data-code",code).addClass("ready");
			var $balloon = $("<div>");
			$notification.append($balloon);
			$notifications.append($notification);
		} else {
			var $balloon = $("div",$notification);
		}
		
		$notification.data("autoHide",null);
		$notification.data("data",data ? data : null);
		$balloon.removeClass("action error warning success").addClass(type);
		
		if ($notification.data("unnotify") !== null) {
			clearTimeout($notification.data("unnotify"));
			$notification.data("unnotify",null);
		}
		
		/**
		 * 자동닫기가 활성화되어 있는 경우, 5초 뒤에 알림을 닫는다.
		 */
		var autoHide = autoHide === false ? false : true;
		if (autoHide === true) {
			Minitalk.ui.unnotify(code,5);
		}
		
		$balloon.html(message);
		
		/**
		 * 브라우저 푸시메시지를 표시한다.
		 */
		Minitalk.ui.push(message);
		
		/**
		 * 콜백함수가 있거나, 자동닫기가 활성화되어있거나, 닫을 수 있는 알림인 경우 닫기버튼을 추가한다.
		 */
		var closable = closable === false && autoHide === false ? false : true;
		if (typeof callback == "function" || closable === true) {
			if (typeof callback == "function") {
				$balloon.addClass("callback");
				$balloon.on("click",function() {
					var $notification = $(this).parent();
					callback($notification);
					if (closable === true) Minitalk.ui.unnotify($(this).parent().attr("data-code"));
				});
			} else {
				$balloon.addClass("closable");
				$balloon.append($("<i>").addClass("mi mi-close"));
				$balloon.on("click",function() {
					Minitalk.ui.unnotify($(this).parent().attr("data-code"));
				});
			}
		}
	},
	/**
	 * 알림메시지를 삭제한다.
	 *
	 * @param string code 알림메시지 고유값 (같은 고유값을 가진 알림메시지는 동시에 출력되지 않는다.)
	 * @param int delay 지연시간(초) (기본값 : 0)
	 */
	unnotify:function(code,delay) {
		var delay = delay ? delay : 0;
		var $notifications = $("div[data-role=notifications]");
		var $notification = $("div[data-code=" + code + "]",$notifications);
		
		if (delay > 0) {
			$notification.data("unnotify",setTimeout(function(code) {
				Minitalk.ui.unnotify(code);
			},5000,code));
		} else {
			$notification.remove();
		}
	},
	/**
	 * v6.5.0 에서 제거예정
	 */
	showAlert:function(type,code,message,autoHide,data,callback) {
		if ($.inArray(type,["action","success","error","warning"]) === -1) type = "action";
		console.warn("[deprecated] showAlert() is deprecated in v6.5. use notify().");
		Minitalk.ui.notify(code,type,message,true,autoHide,data,callback);
	},
	/**
	 * v6.5.0 에서 제거예정
	 */
	removeAlert:function(code,callback) {
		console.warn("[deprecated] removeAlert() is deprecated in v6.5. use unnotify().");
		Minitalk.ui.unnotify(code);
	},
	/**
	 * 공지사항을 표시한다.
	 *
	 * @param string message 메시지
	 * @param string url URL 링크
	 */
	showNotice:function(message,url) {
		if (!url) url = "";
		
		Minitalk.ui.notify("notice" + Math.ceil(Math.random()*10000),"warning",message,true,true,url,function($notification) {
			if ($notification.data("data")) window.open($notification.data("data"));
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
		audio.pause();
		audio.currentTime = 0;
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
	 *
	 * @param string message 표시할 메시지
	 */
	push:function(message) {
		message = message.replace(/<\/?[a-zA-Z]+(.*?)>/g,'');
		
		if (Minitalk.setting("push") == true && window.Notification !== undefined && Notification.permission == "granted") {
			var notification = new Notification("Minitalk",{body:message,icon:Minitalk.getUrl()+"/images/minitalk.png"});
		}
	},
	/**
	 * 토글된 객체를 초기화한다.
	 */
	resetToggle:function() {
		if ($("div[data-role=configs]").length > 0) {
			$("div[data-role=configs]").remove();
		}
		
		if ($("ul[data-role=usermenus]").length > 0) {
			$("ul[data-role=usermenus]").remove();
		}
		
		var $toolLayers = $("footer > div[data-role=layers] > div[data-tool]");
		if ($toolLayers.length > 0) {
			$toolLayers.each(function() {
				Minitalk.ui.closeToolLayer($(this).attr("data-tool"));
			});
		}
	}
};