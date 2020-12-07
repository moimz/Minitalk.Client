/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 내부 클래스를 정의한다.
 * 
 * @file /scripts/widget.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 7.
 */
var MinitalkComponent = parent.MinitalkComponent.clone(parent.MinitalkComponent);
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
	
	console.log(code);
	
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
 * @param string type 메시지타입 (없을경우 로그를 반환한다.)
 * @param object log 메시지객체
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.log = function(type,log) {
	if (type !== undefined) {
		var logList = Minitalk.storage("logList");
		if (logList == null) {
			logList = [];
		}
		logList.push({type:type,log:log});
		
		while (logList.length > 30) {
			logList.shift();
		}
		
		Minitalk.storage("logList",logList);
		Minitalk.storage("lastLogTime",log.time);
	} else {
		var logList = Minitalk.storage("logList");
		if (logList == null) {
			logList = [];
		}
		
		return logList;
	}
};

/**
 * 브라우져의 세션스토리지에 유저설정을 저장한다.
 *
 * @param string key 저장할 데이터키
 * @param any value 저장할 데이터 (없을 경우 데이터 반환)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.setting = function(key,value) {
	if (value === undefined) {
		var setting = Minitalk.storage("setting");
		if (setting == null) {
			setting = {fontBold:false,fontItalic:false,fontUnderline:false,fontColor:"",mute:false,push:false,banTime:0};
			Minitalk.storage("setting",setting);
		}
		
//		if (m.checkLimit(m.fontSettingLimit,Minitalk.user.me.opper) == false && get.indexOf("font") == 0) return false;
//		if (get == "push" && (window.Notification === undefined || Notification.permission != "granted")) return false;

		return setting[key];
	} else {
		var setting = Minitalk.storage("setting");
		if (setting == null) {
			setting = {fontBold:false,fontItalic:false,fontUnderline:false,fontColor:"",mute:false,push:false,banTime:0};
		}
		
		setting[key] = value;
		return Minitalk.storage("setting",setting);
	}
};

/**
 * 이벤트를 추가한다.
 */
Minitalk.addEvent = function(name,listeners) {
	Minitalk[name].push(listeners);
};

/**
 * 프로토콜을 추가한다.
 */
Minitalk.addProtocol = function(name,listeners) {
	Minitalk.protocols[name] = listeners;
};

/**
 * 툴바버튼을 추가한다.
 */
Minitalk.addTool = function(tool) {
	Minitalk.addToolList.push(tool);
};

/**
 * 유저메뉴를 추가한다.
 */
Minitalk.addUserMenu = function(usermenu) {
	Minitalk.addUserMenuList.push(usermenu);
};

/**
 * 유저정보를 추가한다.
 */
Minitalk.addUserInfo = function(key,value) {
	if (!Minitalk.user.me.info || typeof Minitalk.user.me.info != "object") Minitalk.user.me.info = {};
	Minitalk.user.me.info[key] = value;
};

/**
 * 재접속여부를 설정한다.
 */
Minitalk.setReconnect = function(value) {
	Minitalk.socket.reconnectable = value;
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
	 * 채팅위젯 템플릿 HTML 을 가져온다.
	 */
	$.send(Minitalk.getProcessUrl("getWidget"),{templet:Minitalk.templet},function(result) {
		if (result.success == true) {
			if (result.html) {
				$("body").html(result.html);
				Minitalk.ui.init();
			} else if (result.errorcode) {
				Minitalk.ui.printErrorCode(result.errorcode);
			}
		} else {
			Minitalk.ui.printError("NOT_FOUND_TEMPLET","");
		}
	});
});