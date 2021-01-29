/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯을 정의한다.
 * 
 * @file /scripts/minitalk.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 6. 25.
 */
if (isMinitalkIncluded === undefined) {
	var isMinitalkIncluded = true;
	
	/**
	 * 하나의 페이지에 삽입된 모든 미니톡 채팅위젯을 제어하기 위한 컴포넌트 클래스를 정의한다.
	 */
	var MinitalkComponent = {
		minitalks:{},
		inits:{},
		set:function(minitalk) {
			this.minitalks[minitalk.id] = minitalk;
			
			/**
			 * 초기설정값을 복제하여 저장한다.
			 */
			this.inits[minitalk.id] = {};
			for (var key in minitalk) {
				if (typeof minitalk[key] != "function") {
					this.inits[minitalk.id][key] = minitalk[key];
				}
			}
		},
		get:function(id,isBox) {
			var isBox = isBox === true ? true : false;
			if (isBox === false) {
				if (this.minitalks[id] !== undefined) return this.minitalks[id];
				return null;
			} else {
				if (this.inits[id] !== undefined) return this.inits[id];
				return null;
			}
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
		},
		/**
		 * MinitalkComponent 객체를 복사한다.
		 */
		clone:function(source) {
			if (source === undefined) source = this;
			
			var target = {};
			for (var key in source) {
				if (key == "minitalks") {
					target[key] = {};
				} else if (typeof source[key] == "object" && source[key] !== null) {
					target[key] = this.clone(source[key]);
				} else {
					target[key] = source[key];
				}
			}
			
			return target;
		}
	};
	
	/**
	 * 각각의 미니톡 채팅위젯을 제어하는 미니톡 채팅위젯 클래스를 정의한다.
	 */
	var Minitalk = function(opt) {
		/**
		 * 미니톡 채팅위젯 환경설정변수들을 초기화하여 정의한다.
		 * 상세한 내용은 https://www.minitalk.io/ko/manual/api/widget 페이지를 참고하여 주십시오.
		 *
		 * @public string id 미니톡 채팅위젯의 고유 ID (없을 경우 랜덤생성)
		 * @public string channel 미니톡 채팅위젯의 채널명 (필수)
		 * @public string usercode 암호화된 접속자정보(닉네임, 레벨, 닉이미지, 사진)
		 *
		 * @public string templet 미니톡 채팅위젯의 템플릿 (기본값 : default)
		 * @public int/string width 미니톡 채팅위젯 가로크기 (기본값 : 200, 픽셀 또는 % 단위)
		 * @public int/string height 미니톡 채팅위젯 세로크기 (기본값 : 600, 픽셀 또는 % 단위)
		 *
		 * @public type[] viewUserNotification 유저 메시지를 보일지 설정한다. (기본값 : ["join","leave","update"])
		 * @public int viewUserNotificationLimit 접속안내 메시지 및 유저목록에서 보일 유저의 최소레벨 (기본값 : 0)
		 * @public boolean viewConnectMessage 서버접속 메시지를 보일지 설정한다. (기본값 : true)
		 *
		 * @public int logCount 이전 대화내역을 몇개까지 보일지 설정한다. (기본값 : 15, 최대 : 50, 0 일 경우 이전 대화내역을 사용하지 않는다.)
		 * @public string dateFormat 미니톡 채팅위젯내에서 표시되는 날짜/시각의 표시형태
		 *
		 * @public string tabType 탭바 형식을 정의한다.  (기본값 : auto, auto : 채팅위젯 가로크기(400px 기준)에 따라 가로/세로 자동변환, horizontal : 가로형태, vertical : 세로형태)
		 * @public string/object[] tabs 탭바의 탭을 설정한다.
		 * @public string toolType 툴바 형식을 정의한다. (기본값 : icon, icon : 툴바아이콘만 표시, text : 툴바명칭만 표시, icontext : 툴바 아이콘 및 명칭표시)
		 * @public object[] tools 툴바의 버튼을 정의한다.
		 * @public object[] usermenus 접속자를 클릭했을 때 보일 메뉴를 설정한다.
		 *
		 * @public string background 미니톡 채팅위젯 영역의 기본 배경스타일
		 *
		 * @public object[] listeners 이벤트리스너를 정의한다.
		 * @public object[] protocols 사용자정의 프로토콜을 정의한다.
		 */
		this.id = opt.id ? opt.id : null;
		this.channel = opt.channel && opt.channel.length > 0 ? opt.channel : null;
		this.usercode = opt.usercode && opt.usercode.length > 0 ? opt.usercode : null;
		
		this.templet = opt.templet  && opt.templet.length > 0 ? opt.templet : "default";
		opt.width = opt.width ? opt.width : 200;
		opt.height = opt.height ? opt.height : 600;
		this.width = opt.width.toString().indexOf("%") < 0 ? opt.width+"px" : opt.width;
		this.height = opt.height.toString().indexOf("%") < 0 ? opt.height+"px" : opt.height;
		
		this.viewUserNotification = opt.viewUserNotification !== undefined && typeof opt.viewUserNotification == "object" ? opt.viewUserNotification : ["join","leave","update"];
		this.viewUserNotificationLimit = opt.viewUserNotificationLimit ? opt.viewUserNotificationLimit : 0;
		this.viewConnectMessage = opt.viewConnectMessage === false ? false : true;
		
		this.logCount = opt.logCount !== undefined ? opt.logCount : 15;
		this.dateFormat = opt.dateFormat ? opt.dateFormat : "A HH:mm";
		
		this.tabs = opt.tabs ? opt.tabs : ["users","boxes","configs"];
		this.tabType = opt.tabType ? opt.tabType : "auto";
		this.toolType = opt.toolType ? opt.toolType : "icon";
		this.tools = opt.tools ? opt.tools : ["bold","underline","italic","color","-","emoticon","file"];
		this.usermenus = opt.usermenus ? opt.usermenus : ["configs","create","-","whisper","call","invite","-","showip","banip","op","deop"];
		
		this.background = opt.background ? opt.background : null;
		
		this.listeners = opt.listeners ? opt.listeners : {};
		this.protocols = opt.protocols ? opt.protocols : {};
		
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
			var frame = document.getElementById(this.id).contentWindow;
			MinitalkComponent.set(this,opt);
			
			/**
			 * 미니톡 채팅위젯의 DOM 객체를 정의한다.
			 */
			frame.document.removeChild(frame.document.documentElement);
			
			frame.document.open();
			frame.document.write('<!DOCTYPE HTML>');
			frame.document.write('<html data-id="'+this.id+'">');
			frame.document.write('<head>');
			frame.document.write('<meta charset="utf-8">');
			frame.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
			frame.document.write('<title>MiniTalk Widget</title>');
			frame.document.write('<script src="'+MinitalkComponent.getUrl()+'/scripts/widget.js.php"></script>');
			frame.document.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/widget.css.php" type="text/css">');
			frame.document.write('</head>');
			frame.document.write('<body data-error="'+code+'">'+MinitalkComponent.getLoaderHtml(this.background)+'</body>');
			frame.document.write('</html>');
			frame.document.close();
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
		} else if (document.querySelector("iframe[data-channel='"+this.channel+"']") !== null) {
			/**
			 * 같은 이름의 채널이 페이지상에 존재할 경우 에러메시지 출력
			 */
			this.printError("CHANNEL_DUPLICATED");
		} else {
			/**
			 * 미니톡 채팅위젯을 iframe 으로 위젯설정에 정의되어 있는 위치에 표시한다.
			 */
			document.write('<iframe id="'+this.id+'" style="width:'+this.width+'; height:'+this.height+';" frameborder="0" data-channel="'+this.channel+'"></iframe>');
			var frame = document.getElementById(this.id).contentWindow;
			MinitalkComponent.set(this);
			
			/**
			 * 미니톡 채팅위젯의 DOM 객체를 정의한다.
			 */
			frame.document.removeChild(frame.document.documentElement);
			
			frame.document.open();
			frame.document.write('<!DOCTYPE HTML>');
			frame.document.write('<html data-id="'+this.id+'">');
			frame.document.write('<head>');
			frame.document.write('<meta charset="utf-8">');
			frame.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
			frame.document.write('<title>MiniTalk Widget</title>');
			frame.document.write('<script src="'+MinitalkComponent.getUrl()+'/scripts/widget.js.php?channel='+this.channel+'&templet='+this.templet+'"></script>');
			frame.document.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/widget.css.php?channel='+this.channel+'&templet='+this.templet+'" type="text/css">');
			frame.document.write('</head>');
			frame.document.write('<body>'+MinitalkComponent.getLoaderHtml(this.background)+'</body>');
			frame.document.write('</html>');
			frame.document.close();
		}
	};
	
	/**
	 * 미니톡 위젯이 삽입된 페이지를 이용하기 위한 스타일시트를 추가한다.
	 */
	var common = document.createElement("link");
	common.setAttribute("href",MinitalkComponent.getUrl() + "/styles/common.css");
	common.setAttribute("rel","stylesheet");
	common.setAttribute("type","text/css");
	document.head.appendChild(common);
	
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