/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 UI 관련 이벤트를 처리한다.
 * 
 * @file /scripts/widget.ui.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 6. 16.
 */
Minitalk.ui = {
	/**
	 * 미니톡 채팅위젯 UI를 초기화한다.
	 */
	init:function() {
		var html = [
			/**
			 * 위젯시작
			 */
			'<div data-role="frame">',
			/**
			 * 위젯헤더
			 */
			'	<header>',
			'		<h1>connecting...</h1>', // 위젯타이틀
			'		<label data-role="count"></label>', // 접속자수
			'		<ul data-role="menu">', // 상단메뉴
			'			<li data-role="chat"><button type="button" data-action="chat"><i class="icon"></i><span>' + Minitalk.getText("button/chat") + '</span></button></li>', // 채팅버튼
			'			<li data-role="users"><button type="button" data-action="users"><i class="icon"></i><span>' + Minitalk.getText("button/users") + '</span></button></li>', // 접속자목록버튼
			'			<li data-role="boxes"><button type="button" data-action="boxes"><i class="icon"></i><span>' + Minitalk.getText("button/boxes") + '</span></button></li>', // 개인박스버튼
			'			<li data-role="configs"><button type="button" data-action="configs"><i class="icon"></i><span>' + Minitalk.getText("button/configs") + '</span></button></li>', // 설정버튼
			'		</ul>',
			'	</header>',
			
			/**
			 * 채팅영역
			 */
			'	<main>',
			'		<section data-role="chat"></section>',
			'		<section data-role="users">',
			'			<div><input type="text" name="keyword" placeholder="' + Minitalk.getText("user/keyword") + '"><button type="button" data-action="users-search"><i class="icon"></i><span>' + Minitalk.getText("button/search") + '</span></button><button type="button" data-action="users-refresh"><i class="icon"></i><span>' + Minitalk.getText("button/refresh") + '</span></button></div>',
			'			<ul></ul>',
			'		</section>',
			'		<section data-role="boxes">',
			'			<div><input type="text" name="keyword" placeholder="' + Minitalk.getText("box/keyword") + '"><button type="button" data-action="boxes-search"><i class="icon"></i><span>' + Minitalk.getText("button/search") + '</span></button><button type="button" data-action="boxes-refresh"><i class="icon"></i><span>' + Minitalk.getText("button/refresh") + '</span></button><button type="button" data-action="boxes-create"><i class="icon"></i><span>' + Minitalk.getText("box/create") + '</span></button></div>',
			'			<ul></ul>',
			'		</section>',
			'	</main>',
			
			/**
			 * 위젯푸터
			 */
			'	<footer>',
			'		<div data-role="tool"></div>',
			'		<div data-role="input"><input type="text" data-role="message"><button type="button"><i class="icon"></i><span>' + Minitalk.getText("button/send") + '</button></div>',
			'	</footer>',
			
			/**
			 * 위젯 끝
			 */
			'</div>',
			
			/**
			 * 사운드파일
			 */
			'<audio data-type="call">',
				'<source src="' + Minitalk.getUrl() + '/sounds/call.ogg" type="audio/ogg">',
				'<source src="' + Minitalk.getUrl() + '/sounds/call.mp3" type="audio/mpeg">',
			'</audio>',
			
			'<audio data-type="message">',
				'<source src="' + Minitalk.getUrl() + '/sounds/message.ogg" type="audio/ogg">',
				'<source src="' + Minitalk.getUrl() + '/sounds/message.mp3" type="audio/mpeg">',
			'</audio>',
			
			'<audio data-type="query">',
				'<source src="' + Minitalk.getUrl() + '/sounds/query.ogg" type="audio/ogg">',
				'<source src="' + Minitalk.getUrl() + '/sounds/query.mp3" type="audio/mpeg">',
			'</audio>'
		];
		
		var $html = $(html.join(""));
		$("body").append($html);
		
		/**
		 * 버튼 이벤트 추가
		 */
		$("button[data-action]").on("click",function() {
			var action = $(this).attr("data-action");
			
			if (action == "chat" || action == "users" || action == "boxes" || action == "configs") {
				Minitalk.ui.toggleTab(action);
			}
			
			if (action == "users-search") {
				var keyword = $("input[name=keyword]",$("section[data-role=users]")).val();
				console.log("users-search",keyword);
				Minitalk.ui.getUsers(1,keyword);
			}
			
			if (action == "users-refresh") {
				Minitalk.ui.getUsers();
			}
			
			if (action == "boxes-create") {
				Minitalk.ui.createBox();
			}
		});
		
		/**
		 * 채팅입력폼 이벤트 추가
		 */
		$("div[data-role=input] > input").on("keypress",function(e) {
			if (e.keyCode == 13) {
				Minitalk.ui.sendMessage($(this).val());
				e.stopPropagation();
				e.preventDefault();
			}
		});
		
		/**
		 * 메시지 전송버튼 이벤트 추가
		 */
		$("div[data-role=input] > button").on("click",function(e) {
			if ($("div[data-role=input] > input").val().length > 0) {
				Minitalk.ui.sendMessage($("div[data-role=input] > input").val());
			}
			e.stopPropagation();
			e.preventDefault();
		});
		
		/**
		 * 리사이즈 이벤트 추가
		 */
		$(window).on("resize",function() {
			if (Minitalk.ui.resizeTimer != null) {
				clearTimeout(Minitalk.ui.resizeTimer);
				Minitalk.ui.resizeTimer = null;
			}
			
			Minitalk.ui.resizeTimer = setTimeout(Minitalk.ui.printTools,200);
		});
		
		/**
		 * 클릭이벤트를 이용하여 특수한 DOM 객체를 초기화한다.
		 */
		$(document).on("click",function(e) {
			Minitalk.ui.initSound();
		});
		
		Minitalk.ui.printTools();
		Minitalk.ui.disable();
		Minitalk.ui.toggleTab(Minitalk.defaultTab);
	},
	/**
	 * 변경된 브라우저의 보안규칙에 따라, 사운드파일을 초기화한다.
	 */
	initSound:function() {
		var $audios = $("audio");
		$audios.each(function() {
			var audio = $(this).get(0);
			audio.muted = true;
			var promise = audio.play();
			if (promise !== undefined) {
				promise.then(function() {
				}).catch(function(e) {
				});
			}
		});
	},
	/**
	 * 미니톡 채널설정에 따른 UI설정을 초기화한다.
	 *
	 * @param object channel 채널정보
	 */
	initChannel:function() {
		var $frame = $("div[data-role=frame]");
		var channel = Minitalk.socket.channel;
		if (channel == null) return;
		
		$frame.attr("data-userlist",channel.use_userlist == true ? "TRUE" : "FALSE");
		$frame.attr("data-box",channel.use_box == true ? "TRUE" : "FALSE");
		
		$("body > div[data-role=loading]").remove();
		
		Minitalk.fireEvent("initChannel",[channel]);
	},
	/**
	 * 미니톡 위젯 UI를 활성화한다.
	 *
	 * @param boolean inputmode 메시지 입력창만 활성화할지 여부 (기본값 : false)
	 */
	enable:function(inputmode) {
		var inputmode = inputmode === true;
		
		$("div[data-role=input] > input").enable();
		$("div[data-role=input] > button").enable();
		
		if (inputmode === false) {
			$("div[data-role=frame]").attr("disabled",null);
			$("button[data-action]").enable();
			$("div[data-role|=tool] > button").enable();
		}
	},
	/**
	 * 미니톡 위젯 UI를 비활성화한다.
	 *
	 * @param boolean inputmode 메시지 입력창만 비활성화할지 여부 (기본값 : false)
	 */
	disable:function(inputmode) {
		var inputmode = inputmode === true;
		
		if (inputmode === false) $("div[data-role=input] > input").disable();
		$("div[data-role=input] > button").disable();
		
		if (inputmode === false) {
			$("div[data-role=frame]").attr("disabled","disabled");
			$("button[data-action]").disable();
			$("div[data-role|=tool] > button").disable();
			$("div[data-role=channel]").removeClass("open");
		}
	},
	/**
	 * 채널타이틀을 출력한다.
	 *
	 * @param string title
	 */
	printTitle:function(title) {
		$("h1").html(title);
	},
	/**
	 * 활성화탭을 변경한다.
	 *
	 * @param string tab 탭
	 */
	toggleTab:function(tab) {
		var $menu = $("ul[data-role=menu]",$("header"));
		if ($menu.attr("data-toggle") == tab) return;
		
		Minitalk.fireEvent("beforeToggleTab",[tab]);
		
		$("button[data-action]",$menu).removeClass("open");
		$("button[data-action="+tab+"]").addClass("open");
		$("section[data-role]",$("main")).removeClass("open");
		$("section[data-role="+tab+"]",$("main")).addClass("open");
		
		if (tab == "chat") {
			Minitalk.ui.toggleChat();
		}
		
		if (tab == "users") {
			Minitalk.ui.toggleUsers();
		}
		
		if (tab == "boxes") {
			Minitalk.ui.toggleBoxes();
		}
		
		if (tab == "configs") {
			Minitalk.ui.toggleBoxes();
		}
		
		$menu.attr("data-toggle",tab);
		
		Minitalk.fireEvent("afterToggleTab",[tab]);
	},
	/**
	 * 채팅탭을 토글한다.
	 */
	toggleChat:function() {
	},
	/**
	 * 접속자탭을 토클한다.
	 */
	toggleUsers:function() {
		Minitalk.user.getUsers(1);
	},
	/**
	 * 개인박스목록을 토클한다.
	 */
	toggleBoxes:function() {
		Minitalk.ui.getBoxes(1);
	},
	/**
	 * 에러메시지를 출력한다.
	 *
	 * @param string code 에러코드
	 */
	printError:function(code) {
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
			var $button = $("<a>").attr("href","https://www.minitalk.io/").attr("target","_blank").html(Minitalk.getText("text/minitalk_homepage"));
		}
		
		$errorbox.append($button);
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
	},
	/**
	 * 에러코드를 출력한다.
	 *
	 * @param string code 에러코드
	 */
	printErrorCode:function(code) {
		var message = Minitalk.getText("error/code/" + code);
		console.log("errorcode",code,message);
		Minitalk.ui.printSystemMessage("error",message + "(code : " + code + ")");
	},
	/**
	 * 시스템 메시지를 출력한다.
	 *
	 * @param string type 메시지타입 (system, error, notice)
	 * @param string message 메시지
	 */
	printSystemMessage:function(type,message) {
		var $item = $("<div>").attr("data-role","item").addClass("system").addClass(type).html(message);
		$("section[data-role=chat]").append($item);
		Minitalk.ui.autoScroll($item);
	},
	/**
	 * 접속자 이벤트 메시지를 출력한다.
	 *
	 * @param string event 이벤트명
	 * @param object user 접속자객체
	 */
	printUserMessage:function(event,user) {
		var $item = $("<div>").attr("data-role","user").addClass(event).data("nickname",user.nickname);
		
		var $photo = $("<div>").addClass("photo");
		if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
		$item.append($photo);
		
		var $nickname = $("<div>").addClass("nickname").append(Minitalk.user.getTag(user,false));
		$item.append($nickname);
		
		var $messageBox = $("<div>").addClass("message");
		$item.append($messageBox);
		
		var $message = $("<div>");
		var $inner = $("<div>");
		$inner.append($("<span>").addClass("text").html(Minitalk.getText("action/" + event).replace("{NICKNAME}",Minitalk.user.getNickname(user,false))));
		
		$message.append($inner);
		$messageBox.append($message);
		
		$("section[data-role=chat]").append($item);
		
		Minitalk.ui.autoScroll($item);
	},
	/**
	 * 채팅메시지를 출력한다.
	 *
	 * @param string message 메시지 객체
	 * @param boolean is_log 로그메시지 여부
	 */
	printChatMessage:function(message,is_log) {
		var $item = null;
		
		if (message.type == "message" || message.type == "whisper") {
			if (message.type == "whisper") {
				var user = typeof message.to == "string" ? {nickname:message.to,photo:""} : message.to;
			} else {
				var user = message.user;
			}
			
			if (message.from === undefined) {
				var $item = $("section[data-role=chat] > div[data-role=item]:last");
				if (is_log !== true && $item.hasClass("log") == true) $item = [];
				if ($item.length > 0 && $item.hasClass("chat") == true && $item.hasClass(message.type) == true && $item.data("nickname") == user.nickname && $item.position().top > 10) {
					$messageBox = $("div.message",$item);
				} else {
					$item = $("<div>").attr("data-role","item").addClass("chat").addClass(message.type).data("nickname",user.nickname);
					if (is_log === true) $item.addClass("log");
				
					var $photo = $("<div>").addClass("photo");
					if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
					$item.append($photo);
					
					if (message.type == "message") {
						var $nickname = $("<div>").addClass("nickname").append(Minitalk.user.getTag(user,false));
						$item.append($nickname);
					} else if (message.type == "whisper") {
						if (message.to.nickname == Minitalk.user.me.nickname) {
							var $nickname = $("<div>").addClass("nickname").html(Minitalk.getText("text/whisper_from").replace("{nickname}","<b></b>"));
							$("b",$nickname).replaceWith(Minitalk.user.getTag(message.user));
						} else {
							var $nickname = $("<div>").addClass("nickname").html(Minitalk.getText("text/whisper_to").replace("{nickname}","<b></b>"));
							$("b",$nickname).replaceWith(Minitalk.user.getTag(message.to));
						}
						$item.append($nickname);
					}
				
					if (user.nickname == Minitalk.user.me.nickname) $item.addClass("me");
				
					var $messageBox = $("<div>").addClass("message");
					$item.append($messageBox);
					
					$("section[data-role=chat]").append($item);
				}
			}
			
			var $message = $("<div>").attr("data-message-id",message.id);
			var $inner = $("<div>");
			$inner.append($("<span>").addClass("text").html(message.message));
			
			if (message.time === undefined) {
				$inner.append($("<span>").addClass("time").html('<i class="sending"></i>'));
			} else {
				$inner.append($("<span>").addClass("time").html($("<time>").attr("datetime",message.time).html(moment(message.time).locale(Minitalk.language).format(Minitalk.dateFormat))));
			}
			
			$message.append($inner);
			
			if (message.from === undefined) {
				$messageBox.append($message);
			} else {
				$("div[data-message-id="+message.from+"]").replaceWith($message);
			}
		}
		
		if ($item !== null) Minitalk.ui.autoScroll($item);
	},
	},
	/**
	 * 채팅창의 스크롤을 특정위치로 이동한다.
	 *
	 * @param object $item 이동할 위치의 DOM객체
	 */
	autoScroll:function($item) {
		var $chat = $("section[data-tab=chat]");
		if ($chat.length == 0) return;
		
		var $item = $item ? $item : $("div[data-role=item]:last",$chat);
		if ($item === true || $chat.prop("scrollHeight") - $chat.scrollTop() - $chat.height() < $item.outerHeight(true) + 10) {
			$chat.scrollTop($chat.prop("scrollHeight"));
		}
	},
	/**
	 * 메시지 입력창의 내용을 수정한다.
	 *
	 * @param string message 수정할 내용
	 */
	setInputVal:function(value) {
		var $input = $("div[data-role=input] > input");
		$input.focus().val(value);
	},
	/**
	 * 사운드를 재생한다.
	 *
	 * @param string sound 사운드파일명
	 * @todo 브라우저 정책에 따른 수정필요
	 */
	playSound:function(sound) {
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
	};
};