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
 * @param any value 저장될 데이터 (없을 경우 저장되어있는 데이터를 리턴한다.)
 */
Minitalk.session = function(name,value) {
	if (window.sessionStorage === undefined) return;
	
	var storage = {};
	if (window.sessionStorage["minitalk-" + Minitalk.channel] !== undefined) {
		try {
			storage = JSON.parse(window.sessionStorage["minitalk-" + Minitalk.channel]);
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
			window.sessionStorage["minitalk-" + Minitalk.channel] = JSON.stringify(storage);
			
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
 * @param any value 저장될 데이터 (없을 경우 저장되어있는 데이터를 리턴한다.)
 */
Minitalk.storage = function(name,value) {
	if (Minitalk.isPrivateChannel == true) return;
	if (window.localStorage === undefined) return;
	
	var storage = {};
	if (window.localStorage["minitalk-" + Minitalk.channel] !== undefined) {
		try {
			storage = JSON.parse(window.localStorage["minitalk-" + Minitalk.channel]);
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
			window.localStorage["minitalk-" + Minitalk.channel] = JSON.stringify(storage);
			
			return true;
		} catch (e) {
			return false;
		}
	}
};

$(document).ready(function() {
});