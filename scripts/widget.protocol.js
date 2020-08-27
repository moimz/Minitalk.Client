/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.Minitalk.io)
 *
 * 미니톡 서버프로그램과 소켓통신을 위한 프로토콜을 정의한다.
 * 
 * @file /scripts/widget.protocol.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 7. 8.
 */
Minitalk.protocol = {
	/**
	 * 채팅서버에 연결이 완료되었을 때, 접속코드와 유저객체를 서버로 전송한다.
	 */
	connect:function() {
		setTimeout(Minitalk.socket.sendConnection,1000);
	},
	/**
	 * 채팅서버로 부터 접속승인을 받았을 경우, 접속된 유저의 정보를 수신한다.
	 *
	 * @param object data.myinfo 나의정보
	 * @param object data.channel 채널정보
	 * @param int data.usercount 채널접속자 수
	 */
	connected:function(data) {
		/**
		 * 소켓접속 변수를 초기화한다.
		 */
		Minitalk.socket.connected = true;
		Minitalk.socket.connecting = false;
		Minitalk.socket.reconnectable = true;
		Minitalk.socket.joined = false;
		Minitalk.socket.channel.title = data.channel.title;
		Minitalk.socket.permission = data.permission;
		Minitalk.socket.token = data.token;
		
		/**
		 * 나의정보를 저장한다.
		 */
		Minitalk.user.me = data.me;
		Minitalk.session("authorization",data.authorization);
		
		/**
		 * 서버접속오류 알림이 있는 경우 제거한다.
		 */
		Minitalk.ui.unnotify("disconnect");
		
		/**
		 * 박스에 접속한 경우
		 */
		if (data.box !== null) {
			Minitalk.box.connection = data.box;
			console.log("Minitalk.box.connection",Minitalk.box.connection);
			
			Minitalk.ui.printTitle(data.box.title);
			Minitalk.ui.notify("connecting","success",Minitalk.getText("action/connected").replace("{CHANNEL}",data.box.title),true,true);
		} else {
			Minitalk.box.connection = null;
			Minitalk.ui.printTitle(data.channel.title);
			Minitalk.ui.notify("connecting","success",Minitalk.getText("action/connected").replace("{CHANNEL}",data.channel.title),true,true);
		}
		
		/**
		 * 실제 유저권한에 따라 툴바를 다시 초기화한다.
		 */
		Minitalk.ui.initTools();
		
		/**
		 * 접속자수를 갱신한다.
		 */
		Minitalk.user.printUserCount(data.count,data.time);
		
		/**
		 * 채팅로그를 불러온다.
		 */
		if (Minitalk.logCount > 0) {
			Minitalk.socket.send("logs",{count:Minitalk.logCount,time:Minitalk.log().latest});
		} else {
			Minitalk.socket.joined = true;
		}
		
		/**
		 * 메시지 폰트설정을 초기화한다.
		 */
		Minitalk.ui.initFonts();
		
		/**
		 * 채팅위젯의 UI를 활성화한다.
		 */
		Minitalk.ui.enable();
	},
	/**
	 * 채팅서버에 접속을 실패하였을 경우
	 */
	connect_error:function() {
		Minitalk.socket.connecting = false;
		Minitalk.ui.notify("disconnect","error",Minitalk.getErrorText("CONNECT_ERROR"),false,false);
		Minitalk.socket.reconnect(60);
	},
	/**
	 * 서버접속이 종료되었을 경우
	 */
	disconnect:function() {
		Minitalk.socket.disconnected();
		Minitalk.ui.notify("disconnect","error",Minitalk.getErrorText("DISCONNECTED"),false,false);
		Minitalk.socket.reconnect(60);
	},
	/**
	 * 접속에 패스워드가 필요한 경우, 패스워드 창을 띄운다.
	 *
	 * @param string error
	 */
	password:function(data) {
		/**
		 * 패스워드 입력 HTML 을 정의한다.
		 */
		var html = [
			'<section data-role="password">',
				'<h2>' + Minitalk.getText("text/password") + '</h2>',
				'<button data-action="close"></button>',
				'<div data-role="content">',
					'<label>',
						'<input type="password" name="password" placeholder="' + Minitalk.getText("text/password") + '">',
						'<p>' + Minitalk.getErrorText(data) + '</p>',
					'</label>',
				'</div>',
				'<div data-role="button">',
					'<ul>',
						'<li><button type="button" data-action="cancel">' + Minitalk.getText("button/cancel") + '</button></li>',
						'<li><button type="button" data-action="confirm">' + Minitalk.getText("button/confirm") + '</button></li>',
					'</ul>',
				'</div>',
			'</section>'
		];
		html = html.join("");
		
		Minitalk.ui.createWindow(html,300,function($dom) {
			$("input[name=password]",$dom).on("keydown",function(e) {
				if (e.keyCode == 13) {
					var password = $("input[name=password]",$dom).val();
					if (password.length == 0) return;
					
					Minitalk.box.connection.password = password;
					Minitalk.socket.sendConnection();
					
					e.stopImmediatePropagation();
					
					Minitalk.ui.closeWindow();
				}
			});
			
			$("button[data-action]",$dom).on("click",function() {
				var $button = $(this);
				var action = $button.attr("data-action");
				
				if (action == "confirm") {
					var password = $("input[name=password]",$dom).val();
					if (password.length == 0) return;
					
					Minitalk.box.connection.password = password;
					Minitalk.socket.sendConnection();
					Minitalk.ui.closeWindow();
				} else {
					self.close();
				}
			});
		},false);
	},
	/**
	 * 신규접속자가 있을 경우, 접속자 정보를 수신한다.
	 *
	 * @param object data.user 유저객체
	 * @param int data.count 전체접속자수
	 * @param int data.time 서버에서 접속자수를 계산한 시각
	 */
	join:function(data) {
		/**
		 * 참여 메시지를 출력한다.
		 */
		if (Minitalk.socket.joined == true && Minitalk.viewUserMessage == true && Minitalk.viewUserLimit <= data.user.level) {
			Minitalk.ui.printUserMessage("join",data.user);
		}
		
		/**
		 * 채널의 접속자수를 변경한다.
		 */
		Minitalk.user.printUserCount(data.count,data.time);
	},
	/**
	 * 유저가 접속을 종료한 경우, 접속을 종료한 유저의 정보를 수신한다.
	 */
	leave:function(data) {
		/**
		 * 종료 메시지를 출력한다.
		 */
		if (Minitalk.socket.joined == true && Minitalk.viewUserMessage == true && Minitalk.viewUserLimit <= data.user.level) {
			Minitalk.ui.printUserMessage("leave",data.user);
		}
		
		/**
		 * 채널의 접속자수를 변경한다.
		 */
		Minitalk.user.printUserCount(data.count,data.time);
	},
	/**
	 * 유저정보가 변경되었을 경우
	 */
	update:function(data) {
		console.log("update",data);
		var before = data.before;
		var after = data.after;
		
		if (before.nickname != after.nickname) {
			if (before.nickname == Minitalk.user.me.nickname) {
				Minitalk.user.me = after.user;
				Minitalk.ui.printSystemMessage("user",Minitalk.getText("action/updated_nickname").replace("{NICKNAME}",after.nickname));
			} else {
				Minitalk.ui.printSystemMessage("user",Minitalk.getText("action/update_nickname").replace("{before}",before.nickname).replace("{after}",after.nickname));
			}
		}
	},
	/**
	 * 채팅서버로 부터 이전대화기록을 받아 저장한다.
	 */
	logs:function(data) {
		for (var i=0, loop=data.length;i<loop;i++) {
			Minitalk.log(data[i]);
		}
		
		var logs = Minitalk.log().messages;
		for (var i=0, loop=logs.length;i<loop;i++) {
			Minitalk.ui.printChatMessage(logs[i],true);
		}
		
		Minitalk.socket.joined = true;
	},
	/**
	 * 메시지를 수신하였을 경우
	 */
	message:function(data) {
		if (Minitalk.socket.joined == true) {
			Minitalk.ui.printChatMessage(data);
		}
		
		var replace = data.from !== undefined ? data.from : null;
		if (replace !== null) {
			Minitalk.ui.enable(true);
			delete data.from;
		}
		
		/**
		 * 수신된 메시지를 로컬 로그저장소에 저장한다.
		 */
		Minitalk.log(data);
	},
	/**
	 * 귓속말을 수신하였을 경우
	 */
	whisper:function(data) {
		if (Minitalk.socket.joined == true) {
			Minitalk.ui.printChatMessage(data);
		}
		
		var replace = data.from !== undefined ? data.from : null;
		if (replace !== null) {
			Minitalk.ui.enable(true);
			delete data.from;
		}
		
		/**
		 * 수신된 메시지를 로컬 로그저장소에 저장한다.
		 */
		Minitalk.log(data);
	},
	/**
	 * 누군가가 호출하였을 경우
	 *
	 * @param object data 호출한사람의 유저객체
	 */
	call:function(data) {
		Minitalk.ui.playSound("call");
		Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/called").replace("{nickname}",data.nickname));
	},
	/**
	 * 접속코드를 수신하였을 경우
	 */
	authorization:function(authorization) {
		Minitalk.session("authorization",authorization);
	},
	/**
	 * 에러코드를 수신하였을 경우
	 */
	errorcode:function(code) {
		var type = Math.floor(code / 100);
		
		/**
		 * 에러메시지를 출력한다.
		 */
		Minitalk.ui.printErrorCode(code);
		
		/**
		 * 닉네임 관련
		 */
		if (type == 3) {
			switch (code) {
				case 300 : // 중복접속에 따른 기존접속해제 대기
					setTimeout(Minitalk.socket.sendConnection,10000);
					break;
					
				case 301 : // 중복접속에 따른 기존접속해제
					Minitalk.socket.reconnectable = false;
					break;
				
				case 302 : // 권한이 낮은 사용자가 닉네임을 사용중이므로, 해당 사용자가 닉네임을 초기화할때까지 접속을 대기한다.
					setTimeout(Minitalk.socket.sendConnection,10000);
					break;
					
				case 303 : // 권한이 높은 사용자가 현재 닉네임으로 접속하여, 현재 닉네임을 초기화한다.
					Minitalk.socket.send("update",null);
					break;
					
				case 304 : // 권한이 높은 사용자가 닉네임을 사용중이므로, 현재 닉네임을 초기화한다.
					break;
					
				case 305 : // 닉네임 오류
					break;
			}
		}
		
		/**
		 * 응답코드 관련
		 */
		if (type == 4) {
			switch (code) {
				case 404 :
					
					break;
			}
			
			Minitalk.socket.reconnectable = false;
		}
		
		/**
		 * 서버접속해제 (서버접속을 해제하고 재접속하지 않는다.)
		 */
		if (type == 8) {
			Minitalk.socket.reconnectable = false;
			Minitalk.socket.io.disconnect();
			return;
		}
		
		/**
		 * 서버접속오류 (서버에서 접속을 해제하므로 재접속시도를 차단한다.)
		 */
		if (type == 9) {
			Minitalk.socket.reconnectable = false;
			return;
		}
	}
};