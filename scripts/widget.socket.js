/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.Minitalk.io)
 *
 * 미니톡 서버프로그램과 소켓통신을 위한 프로토콜 및 함수를 정의한다.
 * 
 * @file /scripts/widget.socket.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 6. 16.
 */
Minitalk.socket = {
	io:null,
	connection:null,
	connecting:false,
	connected:false,
	joined:false,
	reconnectable:true,
	channel:null,
	/**
	 * 미니톡 채팅서버에 접속한다.
	 *
	 * @param boolean reconnect 재접속시도여부
	 */
	connect:function() {
		/**
		 * 서버접속을 시도중이면 접속시도를 중단한다.
		 */
		if (Minitalk.socket.connecting == true && Minitalk.socket.connected == true) return;
		
		Minitalk.socket.reconnectable = true;
		
		$.send(Minitalk.getProcessUrl("getServer"),{channel:Minitalk.channel},function(result) {
			if (result.success == true) {
				Minitalk.socket.channel = result.channel;
				Minitalk.ui.initChannel();
				Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/connecting"));
				Minitalk.socket.connecting = true;
				Minitalk.socket.io = io(result.connection.domain,{reconnection:false,path:"/minitalk",transports:["websocket"],secure:result.connection.domain.indexOf("https://") == 0});
				Minitalk.socket.connection = result.connection;
				Minitalk.socket.socketEvents();
			} else {
				Minitalk.ui.printError(result.error);
				Minitalk.socket.reconnect(60);
			}
		});
	},
	/**
	 * 미니톡 채팅서버에 재접속한다.
	 *
	 * @param int time 재접속할 시간
	 */
	reconnect:function(time) {
		/**
		 * 재접속이 허용되지 않았으면 접속시도를 중단한다.
		 */
		if (Minitalk.socket.reconnectable == false) return;
		
		if (time == 0) {
			Minitalk.socket.connect();
		} else {
			if (time < 30) {
				if (time % 10 == 0) Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/reconnecting").replace("{SECOND}",time));
			} else {
				if (time % 30 == 0) Minitalk.ui.printSystemMessage("action",Minitalk.getText("action/reconnecting").replace("{SECOND}",time));
			}
			setTimeout(Minitalk.socket.reconnect,900 + Math.ceil(Math.random() * 300 % 300),--time);
		}
	},
	/**
	 * 미니톡 서버접속이 종료되었을 경우
	 */
	disconnected:function() {
		/**
		 * 접속자수를 초기화한다.
		 */
		Minitalk.user.printUserCount(data.count);
		
		Minitalk.socket.io = null;
		Minitalk.socket.connected = false;
		Minitalk.socket.joined = false;
		
		/**
		 * 유저목록을 제거한다.
		 */
		$("div[data-role=userlist]").empty();
		
		/**
		 * 채팅위젯 UI를 비활성화한다.
		 */
		Minitalk.ui.disable();
	},
	/**
	 * 접속코드를 전송한다.
	 */
	sendConnection:function() {
		/**
		 * 접속정보 객체를 생성한다.
		 */
		var join = {
			connection:Minitalk.socket.connection.connection,
			channel:Minitalk.socket.connection.channel,
			usercode:Minitalk.usercode,
			userdata:Minitalk.userdata,
			authorization:Minitalk.session("authorization"),
			box:Minitalk.box.connection
		};
		Minitalk.socket.send("join",join);
	},
	/**
	 * 데이터를 전송한다.
	 *
	 * @param string protocol 프로토콜
	 * @param object data 전송할 데이터
	 */
	send:function(protocol,data) {
		if (protocol != "join" && Minitalk.socket.connecting !== true && Minitalk.socket.connected !== true) {
			Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("SEND_ERROR"));
			return;
		}
		Minitalk.socket.io.emit(protocol,data);
	},
	/**
	 * 데이터를 전송한다.
	 *
	 * @param string protocol 프로토콜
	 * @param object data 전송할 데이터
	 */
	sendTo:function(protocol,data) {
		Minitalk.socket.io.emit(protocol,data);
	},
	/**
	 * 호출메세지를 전송한다.
	 *
	 * @param string nickname 호출할 대상닉네임
	 */
	sendCall:function(nickname) {
		/*
		if (typeof m.listeners.beforeSendCall == "function") {
			if (m.listeners.beforeSendCall(m,nickname,m.myinfo) == false) return false;
		}
		
		for (var i=0, loop=m.beforeSendCall.length;i<loop;i++) {
			if (typeof m.beforeSendCall[i] == "function") {
				if (m.beforeSendCall[i](m,nickname,m.myinfo) == false) return false;
			}
		}
		*/
		
		Minitalk.socket.send("call",nickname);
		
		/*
		if (typeof m.listeners.onSendCall == "function") {
			m.listeners.onSendCall(m,nickname,m.myinfo);
		}
		
		for (var i=0, loop=m.onSendCall.length;i<loop;i++) {
			if (typeof m.onSendCall[i] == "function") {
				m.onSendCall[i](m,nickname,m.myinfo);
			}
		}
		*/
	},
	/**
	 * 소켓 이벤트를 등록한다.
	 */
	socketEvents:function() {
		/**
		 * 채팅서버에 연결이 완료되었을 때, 접속코드와 유저정보를 서버로 전송한다.
		 */
		this.io.on("connect",function() {
			setTimeout(Minitalk.socket.sendConnection,1000);
		});
		
		/**
		 * 채팅서버로 부터 접속승인을 받았을 경우, 접속된 유저의 정보를 수신한다.
		 *
		 * @param object data.myinfo 나의정보
		 * @param object data.channel 채널정보
		 * @param int data.usercount 채널접속자 수
		 */
		this.io.on("connected",function(data) {
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
				Minitalk.socket.send("logs",{count:Minitalk.logCount,time:(Minitalk.storage("latestMessage") ? Minitalk.storage("latestMessage") : 0)});
			} else {
				Minitalk.socket.joined = true;
			}
			
			/**
			 * 채팅위젯의 UI를 활성화한다.
			 */
			Minitalk.ui.enable();
		});
		
		/**
		 * 채팅서버에 접속을 실패하였을 경우
		 */
		this.io.on("connect_error",function() {
			Minitalk.socket.connecting = false;
			Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("CONNECT_ERROR"));
			Minitalk.socket.reconnect(60);
		});
		
		/**
		 * 서버접속이 종료되었을 경우
		 */
		this.io.on("disconnect",function() {
			Minitalk.socket.disconnected();
			Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("DISCONNECTED"));
			Minitalk.socket.reconnect(60);
		});
		
		/**
		 * 신규접속자가 있을 경우, 접속한 유저의 정보를 수신한다.
		 */
		this.io.on("join",function(data) {
			/**
			 * 유저참여 메세지를 출력한다.
			 */
			if (Minitalk.socket.joined == true && Minitalk.viewUserMessage == true && Minitalk.viewUserLimit <= data.user.level) {
				Minitalk.ui.printSystemMessage("user",Minitalk.getText("action/join").replace("{NICKNAME}",Minitalk.user.getNickname(data.user,false)));
			}
			
			/**
			 * 채널의 접속자수를 변경한다.
			 */
			Minitalk.user.printUserCount(data.count,data.time);
		});
		
		/**
		 * 유저가 접속을 종료한 경우, 접속을 종료한 유저의 정보를 수신한다.
		 */
		this.io.on("leave",function(data) {
			/**
			 * 유저종료 메세지를 출력한다.
			 */
			if (Minitalk.socket.joined == true && Minitalk.viewUserMessage == true && Minitalk.viewUserLimit <= data.user.level) {
				Minitalk.ui.printSystemMessage("user",Minitalk.getText("action/leave").replace("{NICKNAME}",Minitalk.user.getNickname(data.user,false)));
			}
			
			/**
			 * 채널의 접속자수를 변경한다.
			 */
			Minitalk.user.printUserCount(data.count,data.time);
		});
		
		/**
		 * 유저정보가 변경되었을 경우
		 */
		this.io.on("update",function(data) {
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
		});
		
		/**
		 * 접속자 목록을 불러온다.
		 */
		this.io.on("users",function(data) {
			Minitalk.ui.printUsers(data.users,data.pagination);
		});
		
		/**
		 * 채팅서버로 부터 이전대화기록을 받아 저장한다.
		 */
		this.io.on("logs",function(data) {
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
			
			var time = 0;
			for (var i=0, loop=logs.length;i<loop;i++) {
				Minitalk.ui.printChatMessage(logs[i],true);
				time = logs[i].time;
			}
			
			Minitalk.session("lastTime",time);
			Minitalk.socket.joined = true;
		});
		
		/**
		 * 메세지를 수신하였을 경우
		 */
		this.io.on("message",function(data) {
			console.log("message",data);
			
			if (typeof data.id == "object") {
				
			} else {
				if (Minitalk.logCount > 0) {
					var logs = Minitalk.storage("logs") ? Minitalk.storage("logs") : [];
					logs.push(data);
					while (logs.length > Minitalk.logCount) {
						logs.shift();
					}
					Minitalk.storage("logs",logs);
					Minitalk.storage("latestMessage",data.time);
				}
				
				if (Minitalk.joined == true) Minitalk.ui.printChatMessage(data);
			}
		});
		
		/**
		 * 접속코드를 수신하였을 경우
		 */
		this.io.on("authorization",function(authorization) {
			Minitalk.session("authorization",authorization);
			console.log(authorization);
		});
		
		/**
		 * 에러코드를 수신하였을 경우
		 */
		this.io.on("errorcode",function(code) {
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
		});
	}
};