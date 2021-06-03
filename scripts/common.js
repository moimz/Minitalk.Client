/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 공통함술르 정의한다.
 * 
 * @file /scripts/common.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.5.0
 * @modified 2021. 6. 3.
 */

/**
 * 플러그인을 위한 객체를 생성한다.
 */
Minitalk.plugins = {};

/**
 * 시간을 정해진 형태로 변환하여 가져온다.
 *
 * @param int timestamp 유닉스타임스탬프
 * @param string type 포맷
 */
Minitalk.getTime = function(timestamp,format) {
	var time = moment(timestamp).locale(Minitalk.language);
	return time.format(format);
};

/**
 * 미니톡 경로를 가져온다.
 */
Minitalk.getUrl = function() {
	return MinitalkComponent.getUrl();
}

/**
 * 프로세스 경로를 가져온다.
 */
Minitalk.getProcessUrl = function(action) {
	return Minitalk.getUrl() + "/process/"+action;
};

/**
 * API 경로를 가져온다.
 */
Minitalk.getApiUrl = function(api,idx) {
	var url = Minitalk.getUrl() + "/api/" + api;
	if (idx !== undefined) url+= "/" + idx;
	
	return url;
};

/**
 * 플러그인 경로를 가져온다.
 */
Minitalk.getPluginUrl = function(plugin) {
	return Minitalk.getUrl() + "/plugins/" + plugin;
};

/**
 * 이벤트리스너를 추가한다.
 */
Minitalk.on = function(event,handler) {
	if (event.indexOf("before") === 0) {
		$(window).on(event,function(e) {
			var args = Array.prototype.slice.call(arguments);
			args.shift();
			var returnValue = handler.apply(this,args);
			if (returnValue === false) {
				e.stopImmediatePropagation();
				return false;
			} else {
				return true;
			}
		});
	} else if (event == "command") {
		$(window).on(event,function(e) {
			var args = Array.prototype.slice.call(arguments);
			args.shift();
			var returnValue = handler.apply(this,args);
			if (returnValue !== undefined) {
				e.stopImmediatePropagation();
				return returnValue;
			}
		});
	} else {
		$(window).on(event,function(e) {
			var args = Array.prototype.slice.call(arguments);
			args.shift();
			handler.apply(this,args);
		});
	}
};

/**
 * 이벤트를 발생시킨다.
 */
Minitalk.fireEvent = function(event,args) {
	var args = args ? args : [];
	var e = args.unshift(this);
	args.push(e);
	
	return $(window).triggerHandler(event,args);
};

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
	var key = "minitalk-" + Minitalk.id + "-" + Minitalk.version;
	
	switch (name) {
		/**
		 * 기본채널 및 박스에 따라 구분되어야 하는 변수인 경우
		 */
		case "logs" :
			if (Minitalk.box.isBox() === true) {
				key+= "-" + Minitalk.box.connection.id;
			} else {
				key+= "-" + Minitalk.channel;
			}
			break;
		
		/**
		 * 기본적으로 사용하지 않는 변수인 경우
		 */
		default :
			if (Minitalk.box.isBox() === true) {
				if (name.indexOf("@") === 0) {
					key+= "-" + Minitalk.channel;
					name = name.replace(/^@/,"");
				} else {
					key+= "-" + Minitalk.box.connection.id;
				}
			} else {
				key+= "-" + Minitalk.channel;
			}
			
			key+= "-extras";
			break;
	}
	
	try {
		var storage = JSON.parse(window.sessionStorage.getItem(key));
		storage = storage === null ? {} : storage;
	} catch (e) {
		var storage = {};
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
			window.sessionStorage.setItem(key,JSON.stringify(storage));
			
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
	var key = "minitalk-" + Minitalk.id + "-" + Minitalk.version;
	
	switch (name) {
		/**
		 * 기본채널에서 공통으로 사용하는 변수인 경우
		 */
		case "authorization" :
			key+= "-" + Minitalk.channel;
			break;
			
		/**
		 * 기본채널 및 박스에 따라 구분되어야 하는 변수인 경우
		 */
		case "fonts" :
		case "configs" :
			if (Minitalk.box.isBox() === true) {
				key+= "-" + Minitalk.box.connection.id;
			} else {
				key+= "-" + Minitalk.channel;
			}
			break;
		
		/**
		 * 기본적으로 사용하지 않는 변수인 경우
		 */
		default :
			if (Minitalk.box.isBox() === true) {
				if (name.indexOf("@") === 0) {
					key+= "-" + Minitalk.channel;
					name = name.replace(/^@/,"");
				} else {
					key+= "-" + Minitalk.box.connection.id;
				}
			} else {
				key+= "-" + Minitalk.channel;
			}
			
			key+= "-extras";
			break;
	}
	
	try {
		var storage = JSON.parse(window.localStorage.getItem(key));
		storage = storage === null ? {} : storage;
	} catch (e) {
		var storage = {};
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
			window.localStorage.setItem(key,JSON.stringify(storage));
			
			return true;
		} catch (e) {
			return false;
		}
	}
};

/**
 * 브라우져의 세션스토리지에 메시지로그를 저장한다.
 *
 * @param object/string message/id 저장될 로그데이터 또는 삭제될 로그아이디 (없을 경우 저장되어있는 데이터를 반환한다.)
 * @param boolean is_delete 삭제여부 (삭제가 true 인 경우, message 변수에 삭제할 로그 id 만 전달가능)
 * @return boolean/any 데이터저장성공여부, 저장되어 있는 데이터
 */
Minitalk.logs = function(message,is_delete) {
	var logs = Minitalk.session("logs");
	if (logs == null || logs.uuid != Minitalk.socket.uuid) {
		logs = {ids:{},uuid:Minitalk.socket.uuid,messages:[],latest:0};
	}
	
	if (message === undefined) {
		return logs;
	} else {
		var ids = logs.ids;
		var messages = logs.messages;
		var latest = logs.latest;
		var is_delete = is_delete === true;
		
		if (is_delete === true) {
			var id = typeof message == "object" ? message.id : message;
			
			if (ids[id] === undefined) return;
			
			delete ids[id];
			
			for (var i=0, loop=messages.length;i<loop;i++) {
				if (messages[i].id == id) {
					messages.splice(i,1);
					break;
				}
			}
		} else {
			if (message.sended !== undefined) {
				delete message.sended;
				delete message.from;
				delete message.success;
			}
			
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
				while (messages.length > Minitalk.logCount) {
					delete ids[messages.shift().id];
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
		}
		
		Minitalk.session("logs",{ids:ids,uuid:Minitalk.socket.uuid,messages:messages,latest:latest});
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