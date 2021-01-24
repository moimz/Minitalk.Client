/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 서버프로그램과 소켓통신을 위한 함수를 정의한다.
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
	permission:null,
	token:null,
	uuid:null,
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
				/**
				 * 이벤트를 발생시킨다.
				 */
				if (Minitalk.fireEvent("beforeConnect",[result.connection]) === false) return;
				
				Minitalk.socket.channel = result.channel;
				Minitalk.ui.initChannel();
				Minitalk.ui.notify("connecting","action",Minitalk.getText("action/connecting"),false,false);
				Minitalk.socket.connecting = true;
				Minitalk.socket.io = io(result.connection.domain,{reconnection:false,path:"/minitalk",transports:["websocket"],secure:result.connection.domain.indexOf("https://") == 0});
				Minitalk.socket.connection = result.connection;
				
				/**
				 * 프로토콜 이벤트를 등록한다.
				 */
				for (var command in Minitalk.protocol) {
					Minitalk.socket.io.on(command,Minitalk.protocol[command]);
				}
			} else {
				Minitalk.ui.printError(result.error);
				Minitalk.socket.reconnect(60);
			}
		});
	},
	/**
	 * 소켓접속을 종료한다.
	 *
	 */
	disconnect:function() {
		Minitalk.socket.reconnectable = false;
		Minitalk.socket.io.disconnect();
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
			Minitalk.ui.notify("connecting","action",Minitalk.getText("action/reconnecting").replace("{SECOND}",time),false,false);
			
			/**
			 * 동시에 서버재접속을 시도하지 않도록 1초 간격을 랜덤하게 조절한다.
			 */
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
		Minitalk.user.updateCount(0);
		
		/**
		 * 소켓변수를 초기화한다.
		 */
		Minitalk.socket.io = null;
		Minitalk.socket.connected = false;
		Minitalk.socket.joined = false;
		
		/**
		 * 채팅위젯 UI를 비활성화한다.
		 */
		Minitalk.ui.disable();
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		Minitalk.fireEvent("disconnect",[Minitalk.socket.reconnectable]);
	},
	/**
	 * 서버에 접속중인지 확인한다.
	 *
	 * @return boolean isConnected
	 */
	isConnected:function() {
		return Minitalk.socket.connecting !== true && Minitalk.socket.connected === true;
	},
	/**
	 * 권한정보를 가져온다.
	 *
	 * @param string name 변수명
	 * @return boolean hasPermission 권한여부
	 */
	getPermission:function(name) {
		if (Minitalk.socket.connected !== true) return false;
		return Minitalk.socket.permission !== undefined && Minitalk.socket.permission[name] !== undefined ? Minitalk.socket.permission[name] : false;
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
			usercode:Minitalk.usercode ? Minitalk.usercode : null,
			authorization:Minitalk.storage("authorization"),
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
		if (protocol != "join" && Minitalk.socket.isConnected() === false) {
			Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("SEND_ERROR"));
			return;
		}
		Minitalk.socket.io.emit(protocol,data);
	},
	/**
	 * 메시지를 전송한다.
	 *
	 * @param string message 전송할 메시지
	 * @param boolean isPrint 메시지를 출력할지 여부
	 */
	sendMessage:function(message,isPrint) {
		/**
		 * 메시지의 고유 ID를 할당한다.
		 */
		var uuid = uuidv4();
		
		/**
		 * 폰트권한이 있고 폰트설정이 있다면 메시지 데이터에 포함하여 전송한다.
		 */
		if (Minitalk.socket.getPermission("font") == true) {
			if (Minitalk.fonts("bold") == true) message = "[B]" + message + "[/B]";
			if (Minitalk.fonts("italic") == true) message = "[I]" + message + "[/I]";
			if (Minitalk.fonts("underline") == true) message = "[U]" + message + "[/U]";
			if (Minitalk.fonts("color") !== null) message = "[COLOR=" + Minitalk.fonts("color") + "]" + message + "[/COLOR]";
		}
		
		/**
		 * 서버로 메시지를 전송한다.
		 */
		Minitalk.socket.send("message",{id:uuid,type:"message",message:message});
		
		var isPrint = isPrint === false ? false : true;
		if (isPrint == true) {
			/**
			 * 메시지를 화면에 출력한다.
			 */
			Minitalk.ui.printChatMessage({id:uuid,type:"message",message:Minitalk.ui.encodeMessage(message),user:Minitalk.user.me});
			Minitalk.ui.disable(true);
		}
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
	 * 호출메시지를 전송한다.
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
	}
};