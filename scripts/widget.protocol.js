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
		Minitalk.socket.channel.permission = data.channel.permission;
		
		/**
		 * 나의정보를 저장한다.
		 */
		Minitalk.user.me = data.me;
		Minitalk.session("authorization",data.authorization);
		
		Minitalk.ui.printTitle(data.channel.title);
		Minitalk.ui.printSystemMessage("info",Minitalk.getText("action/connected").replace("{CHANNEL}",data.channel.title+"("+data.worker+")"));
		
		/**
		 * 접속자수를 갱신한다.
		 */
		Minitalk.user.printUserCount(data.count,data.time);
		
		/**
		 * 채팅로그를 불러온다.
		 */
		if (Minitalk.logCount > 0) {
			Minitalk.socket.send("logs",{count:Minitalk.logCount,time:(Minitalk.session("latestMessage") ? Minitalk.session("latestMessage") : 0)});
		} else {
			Minitalk.socket.joined = true;
		}
		
		/**
		 * 메시지 폰트설정을 업데이트한다.
		 */
		Minitalk.ui.updateFonts();
		
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
		Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("CONNECT_ERROR"));
		Minitalk.socket.reconnect(60);
	},
	/**
	 * 서버접속이 종료되었을 경우
	 */
	disconnect:function() {
		Minitalk.socket.disconnected();
		Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("DISCONNECTED"));
		Minitalk.socket.reconnect(60);
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
		 * 참여 메세지를 출력한다.
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
		 * 종료 메세지를 출력한다.
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
	 * 접속자 목록을 불러온다.
	 */
	users:function(data) {
		Minitalk.ui.printUsers(data.users,data.pagination);
	},
	/**
	 * 채팅서버로 부터 이전대화기록을 받아 저장한다.
	 */
	logs:function(data) {
		var ids = [];
		var logs = $.merge((Minitalk.session("logs") ? Minitalk.session("logs") : []),data).filter(function(element) {
			if ($.inArray(element.id,ids) === -1) {
				ids.push(element.id);
				return true;
			}
			return false;
		});
		logs.sort(function(left,right) {
			return left.time > right.time;
		});
		while (logs.length > Minitalk.logCount) {
			logs.shift();
		}
		Minitalk.session("logs",logs);
		
		var latestMessage = 0;
		for (var i=0, loop=logs.length;i<loop;i++) {
			Minitalk.ui.printChatMessage(logs[i],true);
			latestMessage = logs[i].time;
		}
		
		Minitalk.session("latestMessage",latestMessage);
		Minitalk.socket.joined = true;
	},
	/**
	 * 메세지를 수신하였을 경우
	 */
	message:function(data) {
		if (Minitalk.socket.joined == true) {
			Minitalk.ui.printChatMessage(data);
		}
		
		if (data.from !== undefined) {
			Minitalk.ui.enable(true);
			delete data.from;
		}
		
		/**
		 * 수신된 메시지를 로컬 로그저장소에 저장한다.
		 */
		var logs = Minitalk.session("logs") ? Minitalk.session("logs") : [];
		logs.push(data);
		while (logs.length > Minitalk.logCount) {
			logs.shift();
		}
		Minitalk.session("logs",logs);
		
		var latestMessage = Minitalk.session("latestMessage") ? (Minitalk.session("latestMessage") < data.time ? data.time : Minitalk.session("latestMessage")) : data.time;
		Minitalk.session("latestMessage",latestMessage);
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
		 * 에러메세지를 출력한다.
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
					Minitalk.socket.io.disconnect();
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