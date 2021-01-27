/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버프로그램과 소켓통신을 위한 프로토콜을 정의한다.
 * 
 * @file /scripts/widget.protocol.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2021. 1. 24.
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
	 * @param object data.me 나의정보
	 * @param object data.channel 채널정보
	 * @param string data.authorization 인증정보
	 * @param object data.permission 나의권한
	 * @param string data.token API 호출을 위한 토큰인증정보
	 * @param string data.uuid 유저고유값
	 * @param object data.box 참여한 박스정보
	 * @param int data.count 채널접속자 수
	 * @param int data.time 서버에서 접속자수를 계산한 시각
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
		Minitalk.socket.uuid = data.uuid;
		
		/**
		 * 나의정보를 저장한다.
		 */
		Minitalk.user.me = data.me;
		Minitalk.storage("authorization",data.authorization);
		
		/**
		 * 서버접속오류 알림이 있는 경우 제거한다.
		 */
		Minitalk.ui.unnotify("error");
		Minitalk.ui.unnotify("disconnect");
		
		/**
		 * 채널명을 출력한다.
		 */
		if (data.box !== null) {
			Minitalk.box.connection = data.box;
			
			Minitalk.ui.printTitle(data.box.title);
			if (Minitalk.viewConnectMessage == true) Minitalk.ui.notify("connecting","success",Minitalk.getText("action/connected").replace("{NICKNAME}",data.me.nickname).replace("{CHANNEL}",data.box.title));
		} else {
			Minitalk.box.connection = null;
			Minitalk.ui.printTitle(data.channel.title);
			if (Minitalk.viewConnectMessage == true) Minitalk.ui.notify("connecting","success",Minitalk.getText("action/connected").replace("{NICKNAME}",data.me.nickname).replace("{CHANNEL}",data.channel.title));
		}
		
		/**
		 * 실제 유저권한에 따라 툴바를 다시 초기화한다.
		 */
		Minitalk.ui.initTools();
		
		/**
		 * 메시지 폰트설정을 초기화한다.
		 */
		Minitalk.ui.initFonts();
		
		/**
		 * 접속자수를 갱신한다.
		 */
		Minitalk.user.updateCount(data.count,data.time);
		
		/**
		 * 이전대화기록을 사용하는 채널의 경우, 이전대화 불러오기 버튼을 추가한다.
		 */
		if (Minitalk.socket.channel.use_history == true) {
			Minitalk.ui.initHistory();
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("connecting",[data.channel,data.me,data.count]);
		
		/**
		 * 채팅로그를 불러온다.
		 */
		if (Minitalk.logCount > 0) {
			Minitalk.socket.send("logs",{count:Minitalk.logCount,time:Minitalk.logs().latest});
		} else {
			Minitalk.socket.joined = true;
			
			/**
			 * 이벤트를 발생시킨다.
			 */
			Minitalk.fireEvent("connect",[data.channel,data.me,data.count]);
			
			/**
			 * 채팅위젯의 UI를 활성화한다.
			 */
			Minitalk.ui.enable();
		}
		
		/**
		 * 박스에 참여한 경우, 기본채널의 박스목록을 갱신한다.
		 */
		if (Minitalk.box.isBox() == true) {
			try {
				opener.Minitalk.ui.createBoxes();
			} catch (e) {}
		}
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
		Minitalk.ui.unnotify("connecting");
		
		/**
		 * 재접속이 가능한 경우 서버접속이 종료되었음을 알려준다.
		 */
		if (Minitalk.socket.reconnectable === true) {
			Minitalk.ui.notify("disconnect","error",Minitalk.getErrorText("DISCONNECTED"),false,false);
			Minitalk.socket.reconnect(60);
		}
	},
	/**
	 * 채팅서버로 부터 이전대화기록을 받아 저장한다.
	 *
	 * @param object[] data 로그데이터
	 */
	logs:function(data) {
		for (var i=0, loop=data.length;i<loop;i++) {
			Minitalk.logs(data[i]);
		}
		
		var logs = Minitalk.logs().messages;
		for (var i=0, loop=logs.length;i<loop;i++) {
			Minitalk.ui.printMessage(logs[i],"log");
		}
		
		if (logs.length > 0) {
			var $main = $("main",$("div[data-role=frame]"));
			$("section[data-role=chat]",$main).append($("<div>").attr("data-role","line").append($("<div>").html("NEW MESSAGE START")));
		}
		Minitalk.ui.autoScroll();
		
		Minitalk.socket.joined = true;
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("connect",[Minitalk.socket.channel,Minitalk.user.me,Minitalk.user.count]);
		
		/**
		 * 채팅위젯의 UI를 활성화한다.
		 */
		Minitalk.ui.enable();
	},
	/**
	 * 신규접속자가 있을 경우, 접속자 정보를 수신한다.
	 *
	 * @param object data.user 유저객체
	 * @param int data.count 전체접속자수
	 * @param int data.time 서버에서 접속자수를 계산한 시각
	 */
	join:function(data) {
		Minitalk.user.join(data.user,data.count,data.time);
	},
	/**
	 * 유저가 접속을 종료한 경우, 접속을 종료한 유저의 정보를 수신한다.
	 *
	 * @param object data.user 유저객체
	 * @param int data.count 전체접속자수
	 * @param int data.time 서버에서 접속자수를 계산한 시각
	 */
	leave:function(data) {
		Minitalk.user.leave(data.user,data.count,data.time);
	},
	/**
	 * 유저정보가 변경되었을 경우
	 *
	 * @param object data.before 변경전 유저정보
	 * @param object data.after 변경후 유저정보
	 */
	update:function(data) {
		Minitalk.user.update(data.before,data.after);
	},
	/**
	 * 메시지를 수신하였을 때
	 *
	 * @param string data.id 메시지고유값
	 * @param string data.from 원본 메시지고유값 (서버에 전송하기전 메시지 또는 수정전 메시지 고유값)
	 * @param string data.type 메시지타입
	 * @param string data.message 메시지내용
	 * @param object data.data 메시지 추가정보
	 * @param int data.time 메시지 전송시각
	 * @param object data.to 메시지 수신자정보 (귓속말인 경우)
	 * @param boolean data.sended 내가 보낸 메시지에 대한 응답인지 여부
	 * @param boolean data.success 메시지 전송성공여부 (내가 보낸 메시지에 대한 응답인 경우)
	 */
	message:function(data) {
		/**
		 * 내가 전송한 메시지가 수신되었을 경우
		 */
		if (data.sended === true) {
			Minitalk.ui.enable(true);
			
			/**
			 * 메시지 전송에 성공한경우 임시 메시지를 실제 데이터로 갱신하고,
			 * 메시지 전송에 실패한 경우 해당 메시지를 제거한다.
			 */
			if (data.success === true) {
				Minitalk.ui.printMessage(data);
			} else {
				Minitalk.ui.removeMessage(data.from);
				return;
			}
		} else {
			/**
			 * 이벤트를 발생시킨다.
			 */
			if (Minitalk.fireEvent("beforeMessage",[data]) === false) return;
			
			/**
			 * 메시지를 출력한다.
			 */
			if (Minitalk.socket.joined == true) {
				Minitalk.ui.printMessage(data);
			}
			
			/**
			 * 이벤트를 발생시킨다.
			 */
			Minitalk.fireEvent("message",[data]);
		}
		
		/**
		 * 수신된 메시지를 로컬 로그저장소에 저장한다.
		 */
		Minitalk.logs(data);
	},
	/**
	 * 누군가가 호출하였을 경우
	 *
	 * @param object data 호출한사람의 유저객체
	 */
	call:function(data) {
		Minitalk.ui.playSound("call");
		Minitalk.ui.push(Minitalk.getText("action/called").replace("{nickname}",data.nickname));
		Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/called").replace("{nickname}",data.nickname));
	},
	/**
	 * 채널관리자로 로그인한 경우
	 *
	 * @param int data.level 변경된 레벨정보
	 * @param string data.authorization 변경된 인증정보
	 */
	login:function(data) {
		Minitalk.user.me.level = 9;
		Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/login"));
		Minitalk.storage("authorization",data.authorization);
		
		/**
		 * 유저목록을 갱신한다.
		 */
		Minitalk.user.reload();
	},
	/**
	 * 채널관리자에서 로그아웃한 경우
	 *
	 * @param int data.level 변경된 레벨정보
	 * @param string data.authorization 변경된 인증정보
	 */
	logout:function(data) {
		Minitalk.user.me.level = data.level;
		Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/logout"));
		Minitalk.storage("authorization",data.authorization);
		
		/**
		 * 유저목록을 갱신한다.
		 */
		Minitalk.user.reload();
	},
	/**
	 * 접속코드를 수신하였을 경우
	 */
	authorization:function(authorization) {
		Minitalk.storage("authorization",authorization);
	},
	/**
	 * 에러코드를 수신하였을 경우
	 *
	 * @param int code 에러코드
	 */
	errorcode:function(code) {
		var type = Math.floor(code / 100);
		
		/**
		 * 닉네임 관련
		 */
		if (type == 1) {
			/**
			 * 닉네임이 중복되었을 경우, 기존접속이 해제될때까지 대기 후 다시 재접속한다.
			 */
			if (code == 101) {
				setTimeout(Minitalk.socket.sendConnection,5000);
			}
			
			/**
			 * 에러메시지를 출력한다.
			 */
			Minitalk.ui.printErrorCode(code);
		}
		
		/**
		 * 응답코드 관련
		 */
		if (type == 4) {
			/**
			 * 에러메시지를 출력한다.
			 */
			Minitalk.ui.printErrorCode(code);
		}
		
		/**
		 * 박스오류
		 */
		if (type == 8) {
			switch (code) {
				case 801 :
					Minitalk.ui.createPasswordInput(Minitalk.getText("error/code/"+code),function(password) {
						Minitalk.box.connection.password = password;
						Minitalk.socket.sendConnection();
						Minitalk.ui.closeWindow();
					});
					break;
					
				case 802 :
					Minitalk.ui.createPasswordInput(Minitalk.getText("error/code/"+code),function(password) {
						Minitalk.box.connection.password = password;
						Minitalk.socket.sendConnection();
						Minitalk.ui.closeWindow();
					});
					break;
					
				default :
					/**
					 * 에러메시지를 출력한다.
					 */
					Minitalk.ui.printErrorCode(code);
			}
		}
		
		/**
		 * 서버접속오류 (서버에서 접속을 해제하므로 재접속시도를 차단한다.)
		 */
		if (type == 9) {
			Minitalk.socket.reconnectable = false;
			if (code != 999) Minitalk.ui.printErrorCode(code);
		}
		
		/**
		 * 접속을 해제한다.
		 */
		if (type == 10) {
			Minitalk.socket.reconnectable = false;
			Minitalk.socket.io.disconnect();
		}
	}
};