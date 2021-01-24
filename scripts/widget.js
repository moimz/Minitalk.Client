/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 내부 클래스를 정의한다.
 * 
 * @file /scripts/widget.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2021. 1. 24.
 */
var MinitalkComponent = parent.MinitalkComponent;
var Minitalk = MinitalkComponent.get($("html").attr("data-id"));

/**
 * 미니톡 클라이언트의 언어셋을 가져온다.
 *
 * @param string code
 * @param string replacement 일치하는 언어코드가 없을 경우 반환될 메시지 (기본값 : null, $code 반환)
 * @return string language 실제 언어셋 텍스트
 */
Minitalk.getText = function(code,replacement) {
	var replacement = replacement ? replacement : null;
	var temp = code.split("/");
	
	var string = Minitalk.LANG;
	for (var i=0, loop=temp.length;i<loop;i++) {
		if (string[temp[i]]) {
			string = string[temp[i]];
		} else {
			string = null;
			break;
		}
	}
	
	if (string != null) {
		return string;
	}
	
	return replacement == null ? code : replacement;
};

/**
 * 미니톡 클라이언트의 에러메시지 가져온다.
 *
 * @param string code 에러코드
 * @return string message 에러메시지
 */
Minitalk.getErrorText = function(code) {
	var message = Minitalk.getText("error/"+code,code);
	if (message === code) message = Minitalk.getText("error/UNKNOWN")+" ("+code+")";
	
	return message;
};

/**
 * 브라우져의 세션스토리지에 데이터를 저장한다.
 *
 * @param string name 변수명
 * @param any value 저장될 데이터 (없을 경우 저장되어있는 데이터를 반환한다.)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.session = function(name,value) {
	if (window.sessionStorage === undefined) {
		if (value === undefined) return null;
		else return false;
	}
	
	var storage = {};
	if (window.sessionStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel] !== undefined) {
		try {
			storage = JSON.parse(window.sessionStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel]);
		} catch (e) {}
	}
	
	if (value === undefined) {
		if (storage[name] !== undefined) {
			return storage[name];
		} else {
			return null;
		}
	} else {
		try {
			storage[name] = value;
			window.sessionStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel] = JSON.stringify(storage);
			
			return true;
		} catch (e) {
			return false;
		}
	}
};

/**
 * 브라우져의 로컬스토리지에 데이터를 저장한다.
 *
 * @param string name 변수명
 * @param any value 저장될 데이터 (없을 경우 저장되어있는 데이터를 반환한다.)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.storage = function(name,value) {
	if (window.localStorage === undefined) {
		if (value === undefined) return null;
		else return false;
	}
	
	var storage = {};
	if (window.localStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel] !== undefined) {
		try {
			storage = JSON.parse(window.localStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel]);
		} catch (e) {}
	}
	
	if (value === undefined) {
		if (storage[name] !== undefined) {
			return storage[name];
		} else {
			return null;
		}
	} else {
		try {
			storage[name] = value;
			window.localStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel] = JSON.stringify(storage);
			
			return true;
		} catch (e) {
			return false;
		}
	}
};

/**
 * 브라우져의 세션스토리지에 메시지로그를 저장한다.
 *
 * @param object message 저장될 로그데이터 (없을 경우 저장되어있는 데이터를 반환한다.)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.log = function(message) {
	if (window.sessionStorage === undefined) {
		if (message === undefined) return {ids:{},messages:[],latest:0};
		else return false;
	}
	
	var logs = {ids:{},messages:[],latest:0};
	if (window.sessionStorage["Minitalk.#" + Minitalk.channel] !== undefined) {
		try {
			logs = JSON.parse(window.sessionStorage["Minitalk.#" + Minitalk.channel]);
		} catch (e) {}
	}
	
	if (message === undefined) {
		return logs;
	} else {
		var ids = logs.ids;
		var messages = logs.messages;
		var latest = logs.latest;
		
		/**
		 * 신규 메시지인 경우, 로그에 저장하고, 기존 메시지인 경우 저장된 로그를 대체한다.
		 */
		if (ids[message.id] === undefined) {
			ids[message.id] = true;
			messages.push(message);
			
			/**
			 * 시간순서대로 로그를 정렬한다.
			 */
			messages.sort(function(left,right) {
				return left.time > right.time;
			});
			
			/**
			 * 최대 로그수를 초과하는 이전 로그는 제거한다.
			 */
			while (logs.length > Minitalk.logCount) {
				delete ids[logs.shift().id];
			}
			
			/**
			 * 마지막 로그메시지 시각을 기록한다.
			 */
			if (latest < message.time) latest = message.time;
		} else {
			for (var i=0, loop=messages.length;i<loop;i++) {
				if (messages[i].id == message.id) {
					messages[i] = message;
					break;
				}
			}
		}
		
		try {
			window.sessionStorage["Minitalk.#" + Minitalk.channel] = JSON.stringify({ids:ids,messages:messages,latest:latest});
			
			return true;
		} catch (e) {
			return false;
		}
	}
};

/**
 * 미니톡 글꼴설정 데이터를 저장한다.
 *
 * @param string name 변수명
 * @param any value 저장될 데이터 (없을 경우 저장되어 있는 데이터를 반환한다.)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.fonts = function(name,value) {
	/**
	 * 기본설정값
	 */
	var defaults = {
		bold:false,
		italic:false,
		underline:false,
		color:null
	};
	
	var fonts = Minitalk.socket.getPermission("font") !== true || Minitalk.storage("fonts") == null ? defaults : Minitalk.storage("fonts");
	if (value === undefined) {
		if (name === undefined) return fonts;
		if (fonts[name] !== undefined) {
			return fonts[name];
		} else {
			return null;
		}
	} else {
		if (Minitalk.socket.getPermission("font") == true) {
			fonts[name] = value;
			return Minitalk.storage("fonts",fonts);
		} else {
			return false;
		}
	}
};

/**
 * 미니톡 환경설정 데이터를 저장한다.
 *
 * @param string name 변수명
 * @param any value 저장될 데이터 (없을 경우 저장되어 있는 데이터를 반환한다.)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.configs = function(name,value) {
	/**
	 * 기본설정값
	 */
	var defaults = {
		active_scroll:true,
		browser_notification:false,
		mute:false,
		whisper:true,
		whisper_sound:true,
		call:true,
		call_sound:true
	};
	
	var configs = Minitalk.storage("configs") == null ? defaults : Minitalk.storage("configs");
	if (value === undefined) {
		if (name === undefined) return configs;
		if (configs[name] !== undefined) {
			return configs[name];
		} else {
			return null;
		}
	} else {
		configs[name] = value;
		return Minitalk.storage("configs",configs);
	}
};

$(document).ready(function() {
	/**
	 * 에러가 발생했다면, 에러코드를 출력한다.
	 */
	if ($("body").attr("data-error")) {
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(Minitalk.getText("error/"+$("body").attr("data-error"))));
		$errorbox.append($("<a>").attr("href","https://www.minitalk.io/ko/manual/documents").attr("target","_blank").html(Minitalk.getText("text/document")));
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
		return;
	}
	
	/**
	 * 이벤트리스너를 등록한다.
	 */
	for (var eventName in Minitalk.listeners) {
		Minitalk.on(eventName,Minitalk.listeners[eventName]);
	}
	
	/**
	 * 채팅위젯 클래스를 초기화한다.
	 */
	Minitalk.user.init();
	Minitalk.ui.init();
	
	/**
	 * 채팅위젯 템플릿 스타일시트를 새로 불러왔을 경우, 스타일시트에 영향을 받는 요소를 초기화한다.
	 */
	$("link[rel=stylesheet]").on("load",function() {
		Minitalk.ui.initFrame();
	});
	
	/**
	 * 초기화완료 이벤트를 발생한다.
	 */
	Minitalk.fireEvent("init");
	
	/**
	 * 소켓서버에 접속한다.
	 */
	Minitalk.socket.connect();
});