/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯을 정의한다.
 * 
 * @file /scripts/minitalk.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
if (isMinitalkIncluded === undefined) {
	var isMinitalkIncluded = true;
	
	/**
	 * 하나의 페이지에 삽입된 모든 미니톡 채팅위젯을 제어하기 위한 컴포넌트 클래스를 정의한다.
	 */
	var MinitalkComponent = {
		minitalks:{},
		set:function(minitalk) {
			this.minitalks[minitalk.id] = minitalk;
		},
		get:function(id) {
			if (this.minitalks[id] !== undefined) return this.clone(this.minitalks[id]);
			return null;
		},
		is:function(id) {
			if (this.minitalks[id] !== undefined) return true;
			return false;
		},
		getUrl:function() {
			var elements = document.getElementsByTagName("script");
			for (var i=0;i<elements.length;i++) {
				if (elements[i].src && elements[i].src.indexOf("minitalk.js") != -1) {
					return elements[i].src.substring(0,elements[i].src.lastIndexOf("/scripts"));
				}
			}
			return null;
		},
		getOrigin:function() {
			var url = this.getUrl().split("/");
			var protocol = url[0];
			var domain = url[2];
			
			return protocol+"//"+domain;
		},
		clone:function(object) {
			var clone = {};
			for (var attr in object) {
				if (object.hasOwnProperty(attr) == true) {
					clone[attr] = object[attr];
				}
			}
			return clone;
		},
		getLoaderHtml:function(background) {
			var background = background ? background : "#fff url("+MinitalkComponent.getUrl()+"/images/loading.gif) no-repeat 50% 50%;";
			return '<div data-role="loading" style="position:absolute; width:100%; height:100%; top:0; left:0; z-index:10; box-sizing:border-box; border:1px solid rgba(0,0,0,0.1); z-index:100; background:'+background+';"></div>';
		},
		/**
		 * 파일사이즈를 KB, MB, GB 단위로 변환한다.
		 *
		 * @param int fileSize 파일사이즈 (byte단위)
		 * @param boolean isKiB 1000 으로 나눈 값이 아닌 1024로 나눈 KiB 단위사용 여부
		 */
		getFileSize:function(fileSize,isKiB) {
			var isKiB = isKiB === true;
			var depthSize = isKiB == true ? 1024 : 1000;
			
			fileSize = parseInt(fileSize);
			return depthSize > fileSize ? fileSize+"B" : depthSize * depthSize > fileSize ? (fileSize/depthSize).toFixed(2)+(isKiB == true ? "KiB" : "KB") : depthSize * depthSize * depthSize > fileSize ? (fileSize/depthSize/depthSize).toFixed(2)+(isKiB == true ? "MiB" : "MB") : (fileSize/depthSize/depthSize/depthSize).toFixed(2)+(isKiB == true ? "GiB" : "GB");
		},
		getNumberFormat:function(number,decimals,dec_point,thousands_sep) {
			number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
			var n = !isFinite(+number) ? 0 : +number,
				prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
				sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
				dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
				s = '',
				toFixedFix = function (n, prec) {
					var k = Math.pow(10, prec);
					return '' + Math.round(n * k) / k;
				};
			s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
			if (s[0].length > 3) {
				s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
			}
			if ((s[1] || '').length < prec) {
				s[1] = s[1] || '';
				s[1] += new Array(prec - s[1].length + 1).join('0');
			}
			return s.join(dec);
		}
	};
	
	/**
	 * 각각의 미니톡 채팅위젯을 제어하는 미니톡 채팅위젯 클래스를 정의한다.
	 */
	var Minitalk = function(opt) {
		/**
		 * 미니톡 채팅위젯 환경설정변수들을 초기화하여 정의한다. (필수정보)
		 * 상세한 내용은 https://www.minitalk.io/ko/manual/api 페이지를 참고하여 주십시오.
		 *
		 * @public string id 미니톡 채팅위젯의 고유 ID (없을 경우 랜덤생성)
		 * @public string channel 미니톡 채팅위젯의 채널명 (필수)
		 * @public string nickname 접속자명
		 * @public string nickcon 접속자 이미지닉네임 이미지주소
		 * @public object info 접속자 세부정보 객체
		 * @public string opperCode 암호화된 접속자 권한코드정보
		 *
		 * @public string title 미니톡이 로딩되는 동안 표시된 위젯제목 (접속시 채널명이 제목으로 사용됩니다.)
		 * @public string templet 미니톡 채팅위젯의 템플릿 (기본값 : default)
		 * @public string type 미니톡 채팅위젯 형태(기본값 : 자동, horizontal : 가로모드, vertical : 세로모드, auto : 자동)
		 * @public string language 언어코드 (기본값 : ko)
		 * @public int/string width 미니톡 채팅위젯 가로크기 (기본값 : 200, 픽셀 또는 % 단위)
		 * @public int/string height 미니톡 채팅위젯 세로크기 (기본값 : 600, 픽셀 또는 % 단위)
		 *
		 * @public boolean viewUser 접속자목록 표시여부
		 * @public string viewUserLimit 접속안내 메시지 및 유저목록에서 보일 유저의 최소레벨 (기본값 : ALL)
		 * @public boolean viewUserNotification 다른 접속자의 접속안내 메시지를 보일지 설정한다. (기본값 : true, true : 접속안내메시지 보임, false : 접속안내메시지 숨김)
		 * @public string viewUserNotificationLimit 접속안내 메시지 및 유저목록에서 보일 유저의 최소레벨 (기본값 : ALL)
		 * @public boolean viewStatusIcon 유저목록에 상태아이콘을 보일지 여부 설정
		 * @public string statusIconPath 상태아이콘 경로
		 * @public int userListWidth 유저목록의 가로너비 (기본값 : 160, 가로모드에서 적용)
		 * @public int userListHeight 유저목록의 세로높이 (기본값 : 100, 세로모드에서 적용)
		 
		 * @public int logCount 이전 대화내역을 몇개까지 보일지 설정한다. (기본값 : 15, 최대 : 30, 0 일 경우 이전 대화내역을 사용하지 않는다.)
		 * @public string splitString 대화내용에서 접속자닉네임과 대화내용을 구분할 문자를 설정한다. (기본값 : :)
		 * @public string dateFormat 미니톡 채팅위젯내에서 표시되는 날짜/시각의 표시형태
		 *
		 * @public string toolType 툴바 형식을 정의한다. (기본값 : icon, icon : 툴바아이콘만 표시, text : 툴바명칭만 표시, icontext : 툴바 아이콘 및 명칭표시)
		 * @public object[] tools 툴바의 버튼을 정의한다.
		 * @public object[] usermenus 접속자를 클릭했을 때 보일 메뉴를 설정한다.
		 *
		 * @public object[] listeners 이벤트리스너를 정의한다.
		 * @public object[] protocols 사용자정의 프로토콜을 정의한다.
		 */
		this.id = opt.id ? opt.id : null;
		this.channel = opt.channel ? opt.channel : null;
		this.nickname = opt.nickname ? opt.nickname : "";
		this.nickcon = opt.nickcon ? opt.nickcon : "";
		this.info = opt.info && typeof opt.info == "object" ? opt.info : {};
		this.opperCode = opt.opperCode && opt.opperCode != "" ? opt.opperCode : null;
		
		this.title = opt.title ? opt.title : null;
		this.templet = opt.templet ? opt.templet : null;
		// v6.3.x 대응 (v6.5.0 에서 제거예정)
		if (opt.skin !== undefined) {
			console.warn("[deprecated] skin is deprecated in v6.5. use templet.");
			this.templet = opt.skin;
		}
		this.type = opt.type ? opt.type : "auto";
		this.language = opt.language ? opt.language : "ko";
		opt.width = opt.width ? opt.width : 200;
		opt.height = opt.height ? opt.height : 600;
		this.width = opt.width.toString().indexOf("%") < 0 ? opt.width+"px" : opt.width;
		this.height = opt.height.toString().indexOf("%") < 0 ? opt.height+"px" : opt.height;
		
		this.viewUser = opt.viewUser === false ? false : true;
		this.viewUserLimit = opt.viewUserLimit ? opt.viewUserLimit : "ALL";
		this.viewUserNotification = opt.viewUserNotification === false ? false : true;
		// v6.3.x 대응 (v6.5.0 에서 제거예정)
		if (opt.viewAlert !== undefined) {
			console.warn("[deprecated] viewAlert is deprecated in v6.5. use viewUserNotification.");
			this.viewUserNotification = opt.viewAlert;
		}
		this.viewUserNotificationLimit = opt.viewUserNotificationLimit ? opt.viewUserNotificationLimit : "ALL";
		// v6.3.x 대응 (v6.5.0 에서 제거예정)
		if (opt.viewAlertLimit !== undefined) {
			console.warn("[deprecated] viewAlertLimit is deprecated in v6.5. use viewUserNotificationLimit.");
			this.viewUserNotificationLimit = opt.viewAlertLimit;
		}
		this.viewStatusIcon = opt.viewStatusIcon === false ? false : true;
		this.statusIconPath = opt.statusIconPath !== undefined ? opt.statusIconPath : MinitalkComponent.getUrl() + "/images/status";
		this.userListWidth = opt.userListWidth ? opt.userListWidth : 160;
		this.userListHeight = opt.userListHeight ? opt.userListHeight : 100;
		
		this.logCount = opt.logCount !== undefined ? opt.logCount : 15;
		if (opt.logLimit !== undefined) {
			console.warn("[deprecated] logLimit is deprecated in v6.5. use logCount.");
			this.logCount = opt.logLimit;
		}
		this.splitString = opt.splitString ? opt.splitString : " : ";
		this.dateFormat = opt.dateFormat ? opt.dateFormat : "A HH:mm";
		
		this.toolType = opt.toolType ? opt.toolType : "icon";
		this.tools = opt.tools ? opt.tools : ["bold","underline","italic","color","-","emoticon","-","mute","push","-","scroll","-","clear"];
		// v6.3.x 대응 (v6.5.0 에서 제거예정)
		if (opt.addToolList !== undefined) {
			console.warn("[deprecated] addToolList is deprecated in v6.5. use tools.");
			for (var i=0, loop=opt.addToolList.length;i<loop;i++) {
				this.tools.push(opt.addToolList[i]);
			}
		}
		this.usermenus = opt.usermenus ? opt.usermenus : ["configs","-","whisper","call","-","create","invite","-","banmsg","showip","banip","opper","deopper"];
		// v6.3.x 대응 (v6.5.0 에서 제거예정)
		if (opt.addUserMenuList !== undefined) {
			console.warn("[deprecated] addUserMenuList is deprecated in v6.5. use usermenus.");
			for (var i=0, loop=opt.addUserMenuList.length;i<loop;i++) {
				this.usermenus.push(opt.addUserMenuList[i]);
			}
		}
		
		this.device = opt.device ? opt.device : "PC";
		this.private = opt.private ? opt.private : null;
		
		
		this.showChannelConnectMessage = opt.showChannelConnectMessage === false ? false : true;
		
		/* listeners */
		this.listeners = opt.listeners ? opt.listeners : {};
		
		/* protocols */
		this.protocols = opt.protocols ? opt.protocols : {};
		
		/* properties */
		this.emoticons = [];
		this.uuid = null;
		this.maxuser = 0;
		this.isPrivate = this.private == null ? false : true;
		this.isAlertStorage = false;
		
		/**
		 * 미니톡 경로를 가져온다.
		 */
		this.getUrl = function() {
			return MinitalkComponent.getUrl();
		}
		
		/**
		 * 프로세스 경로를 가져온다.
		 */
		this.getProcessUrl = function(action) {
			return this.getUrl() + "/process/"+action;
		};
		
		/**
		 * API 경로를 가져온다.
		 */
		this.getApiUrl = function(api,idx) {
			var url = this.getUrl() + "/api/" + api;
			if (idx !== undefined) url+= "/" + idx;
			
			return url;
		};
		
		/**
		 * 플러그인 경로를 가져온다.
		 */
		this.getPluginUrl = function(plugin) {
			return this.getUrl() + "/plugins/" + plugin;
		};
		
		/**
		 * 템플릿 경로를 가져온다.
		 */
		this.getTempletUrl = function(templet) {
			if (templet.indexOf("@") === 0) {
				return this.getPluginUrl(templet.replace(/^@/,''));
			} else {
				return this.getUrl() + "/templets/" + templet;
			}
		};
		
		/**
		 * 이벤트리스너를 추가한다.
		 */
		this.on = function(event,handler) {
			if (event.indexOf("before") === 0) {
				this.frame.$(this.frame.document).on(event,function(e) {
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
			} else {
				this.frame.$(this.frame.document).on(event,function(e) {
					var args = Array.prototype.slice.call(arguments);
					args.shift();
					handler.apply(this,args);
				});
			}
		};
		
		/**
		 * 이벤트를 발생시킨다.
		 */
		this.fireEvent = function(event,args) {
			var args = args ? args : [];
			var e = args.unshift(this);
			args.push(e);
			
			return this.frame.$(this.frame.document).triggerHandler(event,args);
		};
		
		/**
		 * 에러메시지를 출력한다.
		 *
		 * @param string 에러코드
		 */
		this.printError = function(code) {
			/**
			 * 미니톡 채팅위젯을 iframe 으로 위젯설정에 정의되어 있는 위치에 표시한다.
			 */
			document.write('<iframe id="'+this.id+'" style="width:'+this.width+'; height:'+this.height+';" frameborder="0" data-channel="'+this.channel+'"></iframe>');
			this.frame = document.getElementById(this.id).contentWindow;
			MinitalkComponent.set(this);
			
			/**
			 * 미니톡 채팅위젯의 DOM 객체를 정의한다.
			 */
			this.frame.document.removeChild(this.frame.document.documentElement);
			
			this.frame.document.open();
			this.frame.document.write('<!DOCTYPE HTML>');
			this.frame.document.write('<html data-id="'+this.id+'">');
			this.frame.document.write('<head>');
			this.frame.document.write('<meta charset="utf-8">');
			this.frame.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
			this.frame.document.write('<title>MiniTalk Widget</title>');
			this.frame.document.write('<script src="'+MinitalkComponent.getUrl()+'/scripts/widget.js.php"></script>');
			this.frame.document.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/widget.css.php" type="text/css">');
			this.frame.document.write('</head>');
			this.frame.document.write('<body data-error="'+code+'">'+MinitalkComponent.getLoaderHtml(this.background)+'</body>');
			this.frame.document.write('</html>');
			this.frame.document.close();
		};
		
		/**
		 * 브라우져의 버전을 체크하여, 현재 접속한 브라우져가 Internet Explorer 9.0 이하 버전인지 확인한다.
		 * 미니톡 채팅위젯은 Internet Explorer 9.0 이하 브라우져는 지원하지 않는다.
		 *
		 * @return boolean Internet Explorer 9.0 이하 브라우져인지 여부
		 */
		this.checkIE = function() {
			var agent = navigator.userAgent.toLowerCase();
			if (agent.indexOf("msie") == -1 && agent.indexOf("trident") == -1) return false;
			if (agent.indexOf("msie 7") > -1 && agent.indexOf("trident") > -1) {
				var canvas = document.createElement("canvas");
				
				if (!("getContext" in canvas)) return true;
				return false;
			} else {
				if (agent.indexOf("msie") == -1) return false;
				return parseInt(/msie ([0-9]+)/.exec(agent)[1],10) <= 9;
			}
		};
		
		if (this.id === null) {
			/**
			 * 미니톡 채팅위젯 설정중 ID 값이 누락되었을 경우, 에러메시지 출력
			 */
			this.printError("MINITALK_ID_REQUIRED");
		} else if (document.querySelector(this.id) == true) {
			/**
			 * 현재 페이지의 DOM 내에서 미니톡 채팅위젯 ID 가 중복되는 경우, 에러메시지 출력
			 */
			this.printError("HTML_ID_DUPLICATED");
		} else if (MinitalkComponent.is(this.id) == true) {
			/**
			 * 미니톡 채팅위젯 ID 가 중복되는 경우, 에러메시지 출력
			 */
			this.printError("MINITALK_ID_DUPLICATED");
		} else if (this.templet == null || this.channel == null) {
			/**
			 * 미니톡 채팅위젯의 필수설정정보가 누락된 경우 에러메시지 출력
			 */
			this.printError("REQUIRED_PROPERTIES");
		} else if (this.checkIE() == true) {
			/**
			 * Internet Explorer 8.0 버전 이하일 경우 에러메시지 출력
			 */
			this.printError("REQUIRED_IE9_OR_HIGHER");
		} else if (this.channel != "example" && document.querySelector("iframe[data-channel='"+this.channel+"']") !== null) {
			/**
			 * 같은 이름의 채널이 페이지상에 존재할 경우 에러메시지 출력
			 */
			this.printError("CHANNEL_DUPLICATED");
		} else {
			/**
			 * 미니톡 채팅위젯을 iframe 으로 위젯설정에 정의되어 있는 위치에 표시한다.
			 */
			document.write('<iframe id="'+this.id+'" style="width:'+this.width+'; height:'+this.height+';" frameborder="0" data-channel="'+this.channel+'"></iframe>');
			this.frame = document.getElementById(this.id).contentWindow;
			MinitalkComponent.set(this);
			
			/**
			 * 미니톡 채팅위젯의 DOM 객체를 정의한다.
			 */
			this.frame.document.removeChild(this.frame.document.documentElement);
			
			this.frame.document.open();
			this.frame.document.write('<!DOCTYPE HTML>');
			this.frame.document.write('<html data-id="'+this.id+'">');
			this.frame.document.write('<head>');
			this.frame.document.write('<meta charset="utf-8">');
			this.frame.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
			this.frame.document.write('<title>MiniTalk Widget</title>');
			this.frame.document.write('<script src="'+MinitalkComponent.getUrl()+'/scripts/widget.js.php?channel='+this.channel+'&templet='+this.templet+'&rnd='+Math.random()+'"></script>');
			this.frame.document.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/widget.css.php?channel='+this.channel+'&templet='+this.templet+'" type="text/css">');
			this.frame.document.write('</head>');
			this.frame.document.write('<body>'+MinitalkComponent.getLoaderHtml(this.background)+'</body>');
			this.frame.document.write('</html>');
			this.frame.document.close();
		}
	};
	
	/**
	 * 부모창의 클릭이벤트를 이용하여 특수한 DOM 객체를 초기화한다.
	 */
	document.addEventListener("click",function(e) {
		for (var id in MinitalkComponent.minitalks) {
			document.getElementById(id).contentWindow.$(document.getElementById(id).contentWindow.document).trigger("click",e);
		}
	});
	
	document.addEventListener("keydown",function(e) {
		if (e.keyCode == 27) {
			for (var id in MinitalkComponent.minitalks) {
				document.getElementById(id).contentWindow.$(document.getElementById(id).contentWindow.document).triggerHandler("esc");
			}
		}
	});
}