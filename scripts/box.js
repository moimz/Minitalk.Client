/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인박스 내부 클래스를 정의한다.
 * 
 * @file /scripts/box.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 7. 8.
 */
var MinitalkComponent = opener.parent.MinitalkComponent.clone(opener.parent.MinitalkComponent);
var Minitalk = MinitalkComponent.get($("html").attr("data-id"));

/**
 * 미니톡 클라이언트의 언어셋을 가져온다.
 *
 * @param string code
 * @param string replacement 일치하는 언어코드가 없을 경우 반환될 메세지 (기본값 : null, $code 반환)
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
 * 미니톡 클라이언트의 에러메세지 가져온다.
 *
 * @param string code 에러코드
 * @return string message 에러메세지
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
		// @todo 개인정보보호모드일 경우 일부 기능이 제한될 수 있다는 안내메시지 출력
		return;
	}
	
	var storage = {};
	if (window.sessionStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel] !== undefined) {
		try {
			storage = JSON.parse(window.sessionStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel]);
		} catch (e) {
			storage = {};
		}
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
		// @todo 개인정보보호모드일 경우 일부 기능이 제한될 수 있다는 안내메시지 출력
		return;
	}
	
	var storage = {};
	if (window.localStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel] !== undefined) {
		try {
			storage = JSON.parse(window.localStorage["Minitalk." + Minitalk.id + "." + Minitalk.channel]);
		} catch (e) {
			storage = {};
		}
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
		$errorbox.append($("<a>").attr("href","https://www.minitalk.io/").attr("target","_blank").html(Minitalk.getText("text/minitalk_homepage")));
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
		return;
	}
	
	/**
	 * 개인박스 클래스를 초기화한다.
	 */
	Minitalk.box.init();
	
	/**
	 * 활성화된 플러그인을 초기화한다.
	 */
	for (var plugin in Minitalk.plugins) {
		if (typeof Minitalk.plugins[plugin].init == "function") {
			Minitalk.plugins[plugin].init();
		}
	}
	
	/**
	 * 채팅위젯 템플릿 스타일시트를 새로 불러왔을 경우, 스타일시트에 영향을 받는 요소를 초기화한다.
	 */
	$("link[rel=stylesheet]").on("load",function() {
		Minitalk.ui.initFrame();
	});
});