/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버프로그램과 소켓통신을 위한 프로토콜을 정의한다.
 * 
 * @file /scripts/widget.protocol.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
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
	 * @param object data.me 나의정보
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
		Minitalk.socket.permission = data.permission;
		Minitalk.socket.channel.title = data.channel.title;
		Minitalk.socket.token = data.token;
		
		/**
		 * 나의정보를 저장한다.
		 */
		Minitalk.user.me = data.me;
		Minitalk.storage("me",data.me);
		
		/**
		 * 채널명을 출력한다.
		 */
		Minitalk.ui.printTitle(data.channel.title);
		if (data.channel.room.indexOf("#") == 0 && data.channel.room.split(":").length == 3) {
			var temp = data.channel.room.split(":");
			if (Minitalk.showChannelConnectMessage == true) Minitalk.ui.printMessage("system",Minitalk.getText("action/connected").replace("{CHANNEL}","<b><u>"+temp[1]+"</u></b>"));
		} else {
			if (Minitalk.showChannelConnectMessage == true) Minitalk.ui.printMessage("system",Minitalk.getText("action/connected").replace("{CHANNEL}","<b><u>"+data.channel.title+"</u></b>"));
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
		Minitalk.user.updateCount(data.usercount);
		
		/**
		 * 접속자목록을 사용하고, 접속자수가 200명 이하라면 유저목록을 불러온다.
		 */
		if (Minitalk.viewUser == true && data.usercount < 200) {
			Minitalk.ui.toggleUsers(true);
		}
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("connecting",[Minitalk.socket.channel,data.me,data.usercount]);
		
		if (Minitalk.logCount > 0) {
			/**
			 * 이전대화기록을 가져온다.
			 */
			Minitalk.socket.send("logs",{limit:Minitalk.logCount,time:Minitalk.storage("lastLogTime")});
		} else {
			Minitalk.ui.enable();
		
			/**
			 * 이벤트를 발생시킨다.
			 */
			Minitalk.fireEvent("connect",[Minitalk.socket.channel,data.me,data.usercount]);
		}
		
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
		Minitalk.ui.printMessage("error",Minitalk.getErrorText("CONNECT_ERROR"));
		Minitalk.socket.reconnect(60);
	},
	/**
	 * 서버접속이 종료되었을 경우
	 */
	disconnect:function() {
		if (Minitalk.isPrivate == true && Minitalk.private.indexOf("#") == 0) {
			self.close();
		} else {
			Minitalk.socket.disconnected();
			
			/**
			 * 재접속이 가능한 경우 서버접속이 종료되었음을 알려준다.
			 */
			if (Minitalk.socket.reconnectable === true) {
				Minitalk.socket.reconnect(60);
			}
		}
	},
	/**
	 * 브로드캐스트 메시지를 수신하였을 경우
	 */
	broadcast:function(data) {
		if (data.type == "NOTICE") {
			Minitalk.ui.showNotice(data.message,data.url);
		} else {
			if (Minitalk.socket.getPermission("broadcast") === true) {
				if (data.url) {
					Minitalk.ui.printMessage("broadcast",data.nickname+m.splitString+'<a href="'+data.url+'" target="_blank">'+data.message+'</a>');
				} else {
					Minitalk.ui.printMessage("broadcast",data.nickname+m.splitString+data.message);
				}
			}
		}
	},
	/**
	 * 사용자정의 프로토콜을 수신하였을 경우
	 */
	protocol:function(data) {
		if (data.protocol !== undefined && typeof Minitalk.protocols[data.protocol] == "function") {
			Minitalk.protocols[data.protocol](Minitalk,data.data);
		}
	},
	/**
	 * 접속자목록을 불러오는 경우
	 */
	users:function(data) {
		Minitalk.user.updateCount(data.usercount);
		Minitalk.ui.printUser(data.users);
	},
	/**
	 * 이전대화를 불러오는 경우
	 */
	logs:function(data) {
		for (var i=0, loop=data.length;i<loop;i++) {
			Minitalk.log("chat",data[i]);
		}
	},
	/**
	 * 이전대화를 모두 가져온 경우
	 */
	logend:function(data) {
		Minitalk.ui.printLogMessage();
		$("section[data-role=chat]").append($("<div>").attr("data-role","line").append($("<div>").html("NEW MESSAGE START")));
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("connect",[Minitalk.socket.channel,Minitalk.user.me,Minitalk.user.count]);
	},
	/**
	 * 유저가 참여하였을 때
	 */
	join:function(data) {
		Minitalk.user.join(data.user,data.usercount);
	},
	/**
	 * 유저가 종료하였을 때
	 */
	leave:function(data) {
		Minitalk.user.leave(data.user,data.usercount);
	},
	/**
	 * 메시지를 수신하였을 때
	 */
	message:function(data) {
		Minitalk.log("chat",{user:data.user,message:data.message,time:data.time});
		Minitalk.ui.printChatMessage("chat",data.user,data.message,data.time);
	},
	/**
	 * 나의 메시지를 수신되었을 때
	 */
	mymessage:function(data) {
		Minitalk.log("chat",{user:data.user,message:data.message,time:data.time});
	},
	/**
	 * 귓속말을 수신하였을 때
	 */
	whisper:function(data) {
		Minitalk.log("whisper",{user:data.user,to:data.to,message:data.message,time:data.time});
		Minitalk.ui.printWhisperMessage("whisper",data.user,data.to,data.message,data.time);
	},
	/**
	 * 유저정보가 변경되었을 때
	 */
	change:function(data) {
		Minitalk.user.change(data.before,data.after);
	},
	/**
	 * 채널관리자로 로그인하였을 때
	 */
	logged:function() {
		Minitalk.ui.printMessage("system",Minitalk.getText("action/login"));
	},
	/**
	 * 아이피를 확인하였을 때
	 */
	showip:function(data) {
		Minitalk.ui.printMessage("system",Minitalk.getText("action/showip").replace("{NICKNAME}","<b><u>"+data.nickname+"</u></b>").replace("{IP}","<b><u>"+data.ip+"</u></b>"));
	},
	/**
	 * 아이피가 차단당했을 때
	 */
	banip:function(data) {
		if (data.ip !== undefined) {
			$.ajax({
				type:"POST",
				url:m.getRootPath()+"/process/banIp",
				data:{ip:data.ip},
				dataType:"json",
				success:function(result) {
					if (result.success == true) {
					}
				},
				error:function() {
				}
			});
		}
		Minitalk.ui.printMessage("system",Minitalk.getText("action/banip").replace("{FROM}","<b><u>"+data.from.nickname+"</u></b>").replace("{TO}","<b><u>"+data.to.nickname+"</u></b>"));
	},
	/**
	 * 관리자권한을 부여받았을 때
	 */
	opper:function(data) {
		Minitalk.ui.printMessage("system",Minitalk.getText("action/opper").replace("{FROM}","<b><u>"+data.from.nickname+"</u></b>").replace("{TO}","<b><u>"+data.to.nickname+"</u></b>"));
	},
	/**
	 * 관리자권한에서 해제되었을 떄
	 */
	deopper:function(data) {
		Minitalk.ui.printMessage("system",Minitalk.getText("action/deopper").replace("{FROM}","<b><u>"+data.from.nickname+"</u></b>").replace("{TO}","<b><u>"+data.to.nickname+"</u></b>"));
	},
	/**
	 * 권한코드가 변경되어, 변경된 권한코드를 수신하였을 때
	 */
	oppercode:function(opperCode) {
		Minitalk.storage("opperCode",opperCode);
	},
	/**
	 * 호출을 받았을 때
	 */
	call:function(data) {
		Minitalk.user.call(data.from,data.to);
	},
	/**
	 * 나의 채널이 생성되었을 때
	 */
	mychannel:function(data) {
		Minitalk.ui.openPrivateChannel("create",data);
	},
	/**
	 * 개인채널 초대를 받았을 때
	 */
	invite:function(data) {
		Minitalk.user.invite(data.from,data.to,data.code);
	},
	/**
	 * 개인채널 초대를 거절한다.
	 */
	reject:function(data) {
		if (data.from.nickname == Minitalk.user.me.nickname) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/invite_reject").replace("{NICKNAME}","<b><u>"+data.to.nickname+"</b></u>"));
		} else {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/invite_rejected").replace("{NICKNAME}","<b><u>"+data.from.nickname+"</b></u>"));
		}
	},
	/**
	 * 메시지 일시차단 경고를 받았을 경우
	 */
	banmsg:function(data) {
		if (data.to.nickname == Minitalk.user.me.nickname) {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/banedmsg").replace("{FROM}","<b><u>"+data.from.nickname+"</b></u>"));
			var baned = m.storage("baned") == null || typeof m.storage("baned") != "object" ? {} : m.storage("baned");
			baned[m.channel] = new Date().getTime() + 60000;
			Minitalk.storage("baned",baned);
		} else {
			Minitalk.ui.printMessage("system",Minitalk.getText("action/banmsg").replace("{FROM}","<b><u>"+data.from.nickname+"</b></u>").replace("{TO}","<b><u>"+data.to.nickname+"</b></u>"));
		}
	},
	/**
	 * 관리자의 화면비우기가 수신되었을 때
	 */
	clearlog:function(data) {
		$(".chatArea").html("");
		Minitalk.storage("logList",[]);
		Minitalk.ui.printMessage("system",Minitalk.getText("action/clear_log").replace("{FROM}","<b><u>"+data.from.nickname+"</b></u>"));
	},
	/**
	 * 에러코드가 전송되었을 때
	 */
	errorcode:function(code) {
		Minitalk.ui.printMessage("error",Minitalk.getErrorText("code/"+code)+"(ErrorCode : "+code+")");
		
		if (code >= 900) {
			Minitalk.socket.reconnectable = false;
		} else if (code >= 300) {
			Minitalk.socket.reconnectable = false;
		}
		
		if (code == 300 || code == 302) {
			setTimeout(Minitalk.socket.sendConnection,5000);
		}
		
		if (code == 104 || code == 105) {
			Minitalk.socket.reconnectable = false;
		}
	}
};