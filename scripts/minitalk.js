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
if (isMiniTalkIncluded === undefined) {
	var isMiniTalkIncluded = true;
	
	function GetScriptPath(){ 
		var elements = document.getElementsByTagName("script");
		for (var i=0;i<elements.length;i++) {
			if (elements[i].src && elements[i].src.indexOf('minitalk.js') != -1) {
				return elements[i].src.substring(0,elements[i].src.lastIndexOf("/"));
			}
		}
	}
	
	function SetToggleStatus(name,value) {
		if (window.sessionStorage === undefined) {
			return;
		}
		
		var storage = {};
		if (window.sessionStorage.MiniTalkToggleStatus !== undefined) {
			try {
				storage = JSON.parse(window.sessionStorage.MiniTalkToggleStatus);
			} catch (e) {
				storage = {};
			}
		}
		
		try {
			storage[name] = value;
			window.sessionStorage.MiniTalkToggleStatus = JSON.stringify(storage);
		} catch (e) {
		}
	}
	
	function GetToggleStatus(name) {
		if (window.sessionStorage === undefined) {
			return false;
		}
		
		var storage = {};
		if (window.sessionStorage.MiniTalkToggleStatus !== undefined) {
			try {
				storage = JSON.parse(window.sessionStorage.MiniTalkToggleStatus);
			} catch (e) {
				storage = {};
			}
		}
		
		if (storage[name] != undefined) {
			return storage[name];
		} else {
			return false;
		}
	}
	
	if (typeof $ != "function" && typeof jQuery != "function") {
		var script = document.createElement("script");
		script.setAttribute("src",GetScriptPath()+"/jquery.js");
		document.documentElement.appendChild(script);
	}
	
	if (typeof MiniTalkToggle != "function") {
		var MiniTalkIsRegisterEvent = false;
		var MiniTalkNowOpened = {};
		
		var MiniTalkToggle = function(id) {
			if (typeof $ != "function") {
				setTimeout(MiniTalkToggle,500,id);
				return;
			}
			
			var frame = $("#"+id+"Frame");
			if ($("#"+id+"ToggleLayer").is(":visible") == false) {
				delete MiniTalkNowOpened[id];
				$("#"+id+"IFrame").animate({height:frame.attr("setDefaultHeight")});
				$("#"+id+"ToggleLayer").show();
				$("#"+id+"Close").hide();
			} else {
				var maxHeight = $(window).height() - 100 > parseInt(frame.attr("setHeight")) ? frame.attr("setHeight") : $(window).height() - 100;
				$("#"+id+"IFrame").find("iframe").css("height",maxHeight);
				$("#"+id+"IFrame").animate({height:maxHeight});
				$("#"+id+"ToggleLayer").hide();
				if (frame.attr("showCloseButton") == "TRUE") $("#"+id+"Close").show();
			}
			
			if (frame.attr("saveStatus") == "TRUE") {
				SetToggleStatus(frame.attr("setPosition"),!$("#"+id+"ToggleLayer").is(":visible"));
			}
			
			if (MiniTalkIsRegisterEvent == false) {
				if (frame.attr("autoHide") == true) {
					$(document).on("click",function() {
						if ($("#"+id+"ToggleLayer").is(":visible") == false) {
							for (var openID in MiniTalkNowOpened) {
								MiniTalkToggle(openID);
							}
						}
					});
				}
				
				if (frame.attr("showCloseButton") == "TRUE") {
					$("#"+id+"Close").on("click",function() {
						MiniTalkToggle(id);
					});
				}
				
				MiniTalkIsRegisterEvent = true;
			}
		}
	}
	
	var Minitalk = function(opt) {
		this.id = opt.id ? opt.id : "MiniTalk"+Math.ceil(Math.random()*10000000);
		opt.templet = opt.templet ? opt.templet : opt.skin;
		var form = document.createElement("form");
		form.setAttribute("action",GetScriptPath().replace("/scripts","/html/minitalk.php"));
		form.setAttribute("method","POST");
		form.setAttribute("target",this.id+"MiniTalkFrame");
		form.style.display = "none";
		form.style.margin = "0px";
		form.style.padding = "0px";
		var params = {};
		
		this.objectToString = function(object) {
			var objects = {};
			for (var param in object) {
				if (typeof object[param] == "function") {
					objects[param] = encodeURIComponent(object[param].toString().replace(/(\t|\n)/g,' ').replace(/[ ]+/g,' '));
				} else if (typeof object[param] == "object") {
					if (object[param].length > 0) objects[param] = this.arrayToString(object[param]);
					else objects[param] = this.objectToString(object[param]);
				} else {
					objects[param] = encodeURIComponent(object[param]);
				}
			}
			return objects;
		};
		
		this.arrayToString = function(array) {
			var datas = [];
			for (var i=0, loop=array.length;i<loop;i++) {
				if (typeof array[i] != "object") datas.push(encodeURIComponent(array[i]));
				else if (array[i].length > 0) datas.push(this.arrayToString(array[i]));
				else datas.push(this.objectToString(array[i]));
			}
			return datas;
		};
		
		opt.width = opt.width ? opt.width : 200;
		opt.height = opt.height ? opt.height : 600;
		this.width = opt.width.toString().indexOf("%") < 0 ? opt.width+"px" : opt.width;
		this.height = opt.height.toString().indexOf("%") < 0 ? opt.height+"px" : opt.height;
		this.position = opt.position ? opt.position : "default";
		this.positionOption = {autoShow:false,autoHide:true,saveStatus:true,defaultHeight:26,showCloseButton:true,closeButtonImage:GetScriptPath().replace("/scripts","/images/close.png"),closeButtonWidth:24,closeButtonHeight:24};
		if (typeof opt.positionOption == "object") {
			if (opt.positionOption.autoShow != undefined) this.positionOption.autoShow = opt.positionOption.autoShow;
			if (opt.positionOption.autoHide != undefined) this.positionOption.autoHide = opt.positionOption.autoHide;
			if (opt.positionOption.saveStatus != undefined) this.positionOption.saveStatus = opt.positionOption.saveStatus;
			if (opt.positionOption.defaultHeight != undefined) this.positionOption.defaultHeight = opt.positionOption.defaultHeight;
			if (opt.positionOption.showCloseButton != undefined) this.positionOption.showCloseButton = opt.positionOption.showCloseButton;
			if (opt.positionOption.closeButtonImage != undefined) this.positionOption.closeButtonImage = opt.positionOption.closeButtonImage;
			if (opt.positionOption.closeButtonWidth != undefined) this.positionOption.closeButtonWidth = opt.positionOption.closeButtonWidth;
			if (opt.positionOption.closeButtonHeight != undefined) this.positionOption.closeButtonHeight = opt.positionOption.closeButtonHeight;
		}
		
		if (this.position == "TL" || this.position == "TR" || this.position == "BL" || this.position == "BR") {
			if (this.position == "TL") {
				var css = "top:0px; left:10px;";
				var buttonCss = "bottom:-"+this.positionOption.closeButtonHeight+"px; left:0px;";
			} else if (this.position == "TR") {
				var css = "top:0px; right:10px;";
				var buttonCss = "bottom:-"+this.positionOption.closeButtonHeight+"px; right:0px;";
			} else if (this.position == "BL") {
				var css = "bottom:0px; left:10px;";
				var buttonCss = "top:-"+this.positionOption.closeButtonHeight+"px; left:0px;";
			} else if (this.position == "BR") {
				var css = "bottom:0px; right:10px;";
				var buttonCss = "top:-"+this.positionOption.closeButtonHeight+"px; right:0px;";
			}
			
			var sHTML = '<div id="'+this.id+'Frame" style="'+css+' position:fixed; width:'+this.width+';" setHeight="'+this.height+'" setDefaultHeight="'+this.positionOption.defaultHeight+'" showCloseButton="'+(this.positionOption.showCloseButton == true ? "TRUE" : "FALSE")+'" setPosition="'+this.position+'" saveStatus="'+(this.positionOption.saveStatus == true ? "TRUE" : "FALSE")+'">';
			sHTML+= '<div style="position:relative; width:'+this.width+';">';
			sHTML+= '<div id="'+this.id+'Close" style="'+buttonCss+' width:'+this.positionOption.closeButtonWidth+'px; height:'+this.positionOption.closeButtonHeight+'px; background:url('+this.positionOption.closeButtonImage+') no-repeat 0 0; cursor:pointer; position:absolute; z-index:20; display:none;"></div>';
			sHTML+= '<div id="'+this.id+'ToggleLayer" style="position:absolute; top:0px; left:0px; z-index:10; cursor:pointer; width:'+this.width+'; height:'+this.positionOption.defaultHeight+'px;" onclick="MiniTalkToggle(\''+this.id+'\');"></div>';
			sHTML+= '<div id="'+this.id+'IFrame" style="width:100%; height:'+this.positionOption.defaultHeight+'px; overflow:hidden;"><iframe name="'+this.id+'MiniTalkFrame" style="width:'+this.width+'; height:'+this.height+'; vertical-align:middle; padding:0px; margin:0px;" frameborder="0" scrollbar="0"></iframe></div>';
			sHTML+= '</div>';
			sHTML+= '</div>';
			document.write(sHTML);
			
			if (this.positionOption.autoShow == true || (this.positionOption.saveStatus == true && GetToggleStatus(this.position) == true)) {
				MiniTalkToggle(this.id);
			}
		} else {
			document.write('<div style="width:'+this.width+'; height:'+this.height+';"><iframe name="'+this.id+'MiniTalkFrame" style="width:'+this.width+'; height:'+this.height+'; vertical-align:middle; padding:0px; margin:0px;" frameborder="0" scrollbar="0"></iframe></div>');
		}
		
		for (var param in opt) {
			if (param == "width" || param == "height" || param == "id" || param == "position" || param == "positionOption") continue;
			
			var input = document.createElement("textarea");
			input.setAttribute("name",param+":"+typeof opt[param]);
			input.style.display = "none";
			
			if (typeof opt[param] != "object") {
				input.value = encodeURIComponent(opt[param]);
			} else {
				if (opt[param].length > 0) {
					input.value = JSON.stringify(this.arrayToString(opt[param]));
				} else {
					input.value = JSON.stringify(this.objectToString(opt[param]));
				}
			}
			form.appendChild(input);
		}
		
		document.body.appendChild(form);
		form.submit();
		
		document.body.onorientationchange = function() {
			form.submit();
		}
	};
	
	
	var MinitalkComponent = function(opt) {
		/* config */
		this.channel = opt.channel ? opt.channel : null;
		this.private = opt.private ? opt.private : null;
		this.nickname = opt.nickname ? opt.nickname : "";
		this.nickcon = opt.nickcon ? opt.nickcon : "";
		this.opperCode = opt.opperCode && opt.opperCode != "" ? opt.opperCode : null;
		this.info = opt.info && typeof opt.info == "object" ? opt.info : {};
		this.sns = opt.sns ? opt.sns : "";
		this.device = opt.device ? opt.device : "PC";
		this.skin = opt.skin;
		this.templet = opt.templet ? opt.templet : opt.skin;
		this.type = opt.type ? opt.type : "auto";
		this.title = opt.title ? opt.title : LANG.title;
		this.language = opt.language;
		this.plugin = opt.plugin ? opt.plugin : "ALL";
		
		this.userListWidth = opt.userListWidth ? opt.userListWidth : 160;
		this.userListHeight = opt.userListHeight ? opt.userListHeight : 100;
		this.viewUser = opt.viewUser === false ? false : true;
		this.viewUserLimit = opt.viewUserLimit ? opt.viewUserLimit : "ALL";
		this.viewAlert = opt.viewAlert === false ? false : true;
		this.viewAlertLimit = opt.viewAlertLimit ? opt.viewAlertLimit : "ALL";
		this.viewStatusIcon = opt.viewStatusIcon === false ? false : true;
		
		this.statusIconPath = opt.statusIconPath !== undefined ? opt.statusIconPath : "";
		this.splitString = opt.splitString ? opt.splitString : " : ";
		
		this.addToolList = opt.addToolList ? opt.addToolList : [];
		this.addUserMenuList = opt.addUserMenuList ? opt.addUserMenuList : [];
		this.toolType = opt.toolType ? opt.toolType : "icon";
		
		this.emoticons = opt.emoticons;
		
		this.logLimit = opt.logLimit !== undefined ? opt.logLimit : 15;
		this.chatLimit = opt.chatLimit ? opt.chatLimit : "ALL";
		this.fontSettingLimit = opt.fontSettingLimit ? opt.fontSettingLimit : "ALL";
		this.fontSettingHide = opt.fontSettingHide === true ? true : false;
		
		this.showChannelConnectMessage = opt.showChannelConnectMessage === false ? false : true;
		
		/* listeners */
		this.listeners = opt.listeners ? opt.listeners : {};
		
		/* protocol */
		this.protocols = opt.protocols ? opt.protocols : {};
		
		/* private */
		this.connected = false;
		this.reconnected = true;
		this.reconnecting = false;
		this.socket = null;
		this.server = null;
		this.serverCode = null;
		this.channelCode = null;
		this.userCode = opt.userCode;
		this.maxuser = 0;
		this.myinfo = null;
		this.viewUserListSort = [];
		this.viewUserListStore = {};
		this.viewUserListStatus = false;
		this.toolList = [];
		this.userMenuList = [];
		this.isPrivate = this.private == null ? false : true;
		this.isNickname = opt.isNickname !== false ? true : false;
		this.isBroadcast = opt.isBroadcast !== false ? true : false;
		this.isAutoHideUserList = false;
		this.isFixedScroll = false;
		this.isAlertStorage = false;
		
		/* Event Listeners */
		this.onInit = [];
		this.onConnecting = [];
		this.onConnect = [];
		this.beforeSendMessage = [];
		this.onSendMessage = [];
		this.beforeSendWhisper = [];
		this.onSendWhisper = [];
		this.beforeSendCall = [];
		this.onSendCall = [];
		this.beforeSendInvite = [];
		this.onSendInvite = [];
		this.beforeMessage = [];
		this.onMessage = [];
		this.beforeWhisper = [];
		this.onWhisper = [];
		this.beforeCall = [];
		this.onCall = [];
		this.beforeInvite = [];
		this.onInvite = [];
		this.onJoinUser = [];
		this.onLeaveUser = [];
		
		/* cookie */
		this.setStorage = function(name,value) {
			if (window.sessionStorage === undefined) {
				if (m.isAlertStorage == false) {
					m.isAlertStorage = true;
					m.printMessage("error",LANG.error.storage);
				}
				return;
			}
			
			var storage = {};
			if (window.sessionStorage[m.isPrivate == true ? m.private : m.channel] !== undefined) {
				try {
					storage = JSON.parse(window.sessionStorage[m.isPrivate == true ? m.private : m.channel]);
				} catch (e) {
					storage = {};
				}
			}
			
			try {
				storage[name] = value;
				window.sessionStorage[m.isPrivate == true ? m.private : m.channel] = JSON.stringify(storage);
			} catch (e) {
				if (m.isAlertStorage == false) {
					m.isAlertStorage = true;
					m.printMessage("error",LANG.error.storage);
				}
			}
		}
		
		this.getStorage = function(name) {
			if (window.sessionStorage === undefined) {
				if (m.isAlertStorage == false) {
					m.isAlertStorage = true;
					m.printMessage("error",LANG.error.storage);
				}
				return null;
			}
			
			var storage = {};
			if (window.sessionStorage[m.isPrivate == true ? m.private : m.channel] !== undefined) {
				try {
					storage = JSON.parse(window.sessionStorage[m.isPrivate == true ? m.private : m.channel]);
				} catch (e) {
					storage = {};
				}
			}
			
			if (storage[name] != undefined) {
				return storage[name];
			} else {
				return null;
			}
		}
		
		this.getUserCode = function() {
			if (window.localStorage === undefined) {
				if (m.isAlertStorage == false) {
					m.isAlertStorage = true;
					m.printMessage("error",LANG.error.storage);
				}
				return;
			}
			
			if (window.localStorage.MiniTalkUserCode !== undefined && window.localStorage.MiniTalkUserCode.length == 32) {
				return window.localStorage.MiniTalkUserCode;
			} else {
				try {
					window.localStorage.MiniTalkUserCode = m.userCode;
				} catch (e) {
					if (m.isAlertStorage == false) {
						m.isAlertStorage = true;
						m.printMessage("error",LANG.error.storage);
						return false;
					}
				}
				return m.userCode;
			}
		}
		
		this.getPath = function() {
			return GetScriptPath();
		}
		
		this.getPluginPath = function(name) {
			return GetScriptPath().replace("/scripts","")+"/plugin/"+name;
		}
		
		this.getRootPath = function() {
			return GetScriptPath().replace("/scripts","");
		}
		
		this.getTime = function(timestamp,type) {
			var time = new Date(timestamp);
			var year = time.getFullYear();
			var month = time.getMonth()+1 < 10 ? "0"+(time.getMonth()+1) : time.getMonth()+1;
			var date = time.getDate() < 10 ? "0"+time.getDate() : time.getDate();
			
			var hour = time.getHours() < 10 ? "0"+time.getHours() : time.getHours();
			var minute = time.getMinutes() < 10 ? "0"+time.getMinutes() : time.getMinutes();
			var second = time.getSeconds() < 10 ? "0"+time.getSeconds() : time.getSeconds();
			
			return LANG.time[type].replace("{year}",year).replace("{month}",month).replace("{date}",date).replace("{hour}",hour).replace("{minute}",minute).replace("{second}",second);
		}
		
		/* user setting */
		this.getSetting = function(get) {
			var setting = m.getStorage("setting");
			if (setting == null) {
				setting = {fontBold:false,fontItalic:false,fontUnderline:false,fontColor:"",mute:false,push:false,banTime:0};
				m.setStorage("setting",setting);
			}
			
			if (m.checkLimit(m.fontSettingLimit,m.myinfo.opper) == false && get.indexOf("font") == 0) return false;
			if (get == "push" && (window.Notification === undefined || Notification.permission != "granted")) return false;
			
			return setting[get];
		}
		
		this.setSetting = function(set,value) {
			var setting = m.getStorage("setting");
			if (setting == null) {
				setting = {fontBold:false,fontItalic:false,fontUnderline:false,fontColor:"",mute:false,push:false,banTime:0};
				m.setStorage("setting",setting);
			}
			
			setting[set] = value;
			m.setStorage("setting",setting);
		}
		
		this.setLog = function(type,log) {
			var logList = m.getStorage("logList");
			if (logList == null) {
				logList = [];
			}
			logList.push({type:type,log:log});
			
			while (logList.length > 30) {
				logList.shift();
			}
			
			m.setStorage("logList",logList);
			m.setStorage("lastLogTime",log.time);
		}
		
		this.getLog = function() {
			var logList = m.getStorage("logList");
			if (logList == null) {
				logList = [];
			}
			
			return logList;
		}
		
		/* crypto */
		this.encodeBase64 = function(input) {
			var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			input = m.encodeUTF8(input);
			while (i < input.length) {
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
			}
			
			return output;
		}
		
		this.decodeBase64 = function(input) {
			var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
	
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g,"");
			while (i < input.length) {
				enc1 = _keyStr.indexOf(input.charAt(i++));
				enc2 = _keyStr.indexOf(input.charAt(i++));
				enc3 = _keyStr.indexOf(input.charAt(i++));
				enc4 = _keyStr.indexOf(input.charAt(i++));
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
				output = output + String.fromCharCode(chr1);
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
			}
			output = m.decodeUTF8(output);
			return output;
		}
		
		this.encodeUTF8 =  function utf8_encode(string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
			for (var n=0;n<string.length;n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					utftext+= String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					utftext+= String.fromCharCode((c >> 6) | 192);
					utftext+= String.fromCharCode((c & 63) | 128);
				} else {
					utftext+= String.fromCharCode((c >> 12) | 224);
					utftext+= String.fromCharCode(((c >> 6) & 63) | 128);
					utftext+= String.fromCharCode((c & 63) | 128);
				}
			}
			return utftext;
		}
	
		this.decodeUTF8 = function(utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while (i < utftext.length) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
		
		/* init */
		this.init = function(errorCode) {
			m.statusIconPath = m.statusIconPath == "" ? m.getRootPath()+"/images/status" : m.statusIconPath;
			if (opt.type == "auto") {
				if ($(document).height() >= $(document).width()) {
					m.type = "vertical";
				} else {
					m.type = "horizontal";
				}
			}
			
			$(".frame").removeClass("vertical").removeClass("horizontal").addClass(m.type);
			$(".frame").outerHeight($(".outFrame").length == 0 ? $(document).height() : $(".outFrame").innerHeight(),true);
			$(".inputText").outerWidth($(".inputArea").innerWidth() - $(".inputButton").outerWidth(true),true);
			$(".title").text(m.title);
			
			var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
			
			$(".userList").css("top",$(".titleArea").position().top + $(".titleArea").outerHeight(true));
			
			if (m.type == "vertical") {
				$(".toggleUserList").addClass("toggleUserListOff");
				$(".userList").outerWidth($(".frame").innerWidth(),true);
				$(".userList").css("left",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
				$(".userList").hide();
				$(".chatArea").outerHeight(height,true);
			} else {
				$(".toggleUserList").addClass("toggleUserListOff");
				$(".userList").outerHeight(height,true);
				$(".userList").css("right",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
				$(".userList").hide();
				$(".chatArea").outerHeight(height,true);
			}
			
			m.initMyInfo();
			m.initTool();
			m.initUserMenu();
			
			if (typeof m.listeners.onInit == "function") {
				m.listeners.onInit(m);
			}
			
			for (var i=0, loop=m.onInit.length;i<loop;i++) {
				if (typeof m.onInit[i] == "function") {
					m.onInit[i](m);
				}
			}
			
			$("input").attr("disabled",true);
			m.initToolButton(false);
			
			$(".loading").fadeOut();
			
			if (errorCode == 0) {
				m.checkServer();
			} else {
				m.printMessage("error",LANG.errorcode["code"+errorCode]+"(ErrorCode : "+errorCode+")");
			}
		}
		
		this.initToolButton = function(mode) {
			if (mode == false) {
				$($(".toolArea").find("button")).attr("disabled",true);
				$($(".toolArea").find("button")).removeClass("selected").addClass("disabled");
				$($(".toolArea").find(".toolButtonMore")).attr("disabled",true);
				$($(".toolArea").find(".toolButtonMore")).removeClass("selected").addClass("disabled");
				return;
			}
			
			$($(".toolArea").find("button")).attr("disabled",false);
			$($(".toolArea").find("button")).removeClass("disabled");
			$($(".toolArea").find(".toolButtonMore")).attr("disabled",false);
			$($(".toolArea").find(".toolButtonMore")).removeClass("disabled");
			
			if (m.getSetting("fontBold") == true) {
				$(".toolBold").addClass("selected");
				$(".inputText").css("fontWeight","bold");
			} else {
				$(".toolBold").removeClass("selected");
				$(".inputText").css("fontWeight","normal");
			}
			
			if (m.getSetting("fontItalic") == true) {
				$(".toolItalic").addClass("selected");
				$(".inputText").css("fontStyle","italic");
			} else {
				$(".toolItalic").removeClass("selected");
				$(".inputText").css("fontStyle","");
			}
			
			if (m.getSetting("fontUnderline") == true) {
				$(".toolUnderline").addClass("selected");
				$(".inputText").css("textDecoration","underline");
			} else {
				$(".toolUnderline").removeClass("selected");
				$(".inputText").css("textDecoration","");
			}
			
			if (m.getSetting("fontColor") !== false && m.getSetting("fontColor") != "") {
				$(".inputText").css("color","#"+m.getSetting("fontColor"));
			} else {
				$(".inputText").css("color","");
			}
			
			if (m.getSetting("mute") == true) {
				$(".toolMute").addClass("selected");
			} else {
				$(".toolMute").removeClass("selected");
			}
			
			if (m.getSetting("push") == true) {
				$(".toolPush").addClass("selected");
			} else {
				$(".toolPush").removeClass("selected");
			}
		}
		
		this.initTool = function() {
			var defaultTool = [{
				cls:"toolBold",
				icon:"icon_bold.png",
				text:LANG.tool.bold,
				fn:function(minitalk) {
					if (minitalk.checkLimit(minitalk.fontSettingLimit,minitalk.myinfo.opper) == false) {
						minitalk.printMessage("error",LANG.error.notAllowFontSetting);
						minitalk.setSetting("fontBold",false);
						$(".toolBold").removeClass("selected");
						$(".inputText").css("fontWeight","normal");
						return false;
					}
					
					if (minitalk.getSetting("fontBold") == true) {
						minitalk.setSetting("fontBold",false);
						$(".toolBold").removeClass("selected");
						$(".inputText").css("fontWeight","normal");
					} else {
						minitalk.setSetting("fontBold",true);
						$(".toolBold").addClass("selected");
						$(".inputText").css("fontWeight","bold");
					}
				}
			},{
				cls:"toolItalic",
				icon:"icon_italic.png",
				text:LANG.tool.italic,
				fn:function(minitalk) {
					if (minitalk.checkLimit(minitalk.fontSettingLimit,minitalk.myinfo.opper) == false) {
						minitalk.printMessage("error",LANG.error.notAllowFontSetting);
						minitalk.setSetting("fontItalic",false);
						$(".toolItalic").removeClass("selected");
						$(".inputText").css("fontStyle","");
						return false;
					}
					
					if (minitalk.getSetting("fontItalic") == true) {
						minitalk.setSetting("fontItalic",false);
						$(".toolItalic").removeClass("selected");
						$(".inputText").css("fontStyle","");
					} else {
						minitalk.setSetting("fontItalic",true);
						$(".toolItalic").addClass("selected");
						$(".inputText").css("fontStyle","italic");
					}
				}
			},{
				cls:"toolUnderline",
				icon:"icon_underline.png",
				text:LANG.tool.underline,
				fn:function(minitalk) {
					if (minitalk.checkLimit(minitalk.fontSettingLimit,minitalk.myinfo.opper) == false) {
						minitalk.printMessage("error",LANG.error.notAllowFontSetting);
						minitalk.setSetting("fontUnderline",false);
						$(".toolUnderline").removeClass("selected");
						$(".inputText").css("textDecoration","");
						return false;
					}
					
					if (minitalk.getSetting("fontUnderline") == true) {
						minitalk.setSetting("fontUnderline",false);
						$(".toolUnderline").removeClass("selected");
						$(".inputText").css("textDecoration","");
					} else {
						minitalk.setSetting("fontUnderline",true);
						$(".toolUnderline").addClass("selected");
						$(".inputText").css("textDecoration","underline");
					}
				}
			},{
				cls:"toolColor",
				icon:"icon_color.png",
				text:LANG.tool.color,
				fn:function(minitalk) {
					if (minitalk.checkLimit(minitalk.fontSettingLimit,minitalk.myinfo.opper) == false) {
						minitalk.printMessage("error",LANG.error.notAllowFontSetting);
						$(".inputText").css("color","");
						return false;
					}
					
					minitalk.selectFontColor();
				}
			},"-",{
				cls:"toolEmoticon",
				icon:"icon_emoticon.png",
				text:LANG.tool.emoticon,
				fn:function(minitalk) {
					minitalk.insertEmoticon();
				}
			},"-",{
				cls:"toolMute",
				icon:"icon_mute.png",
				text:LANG.tool.mute,
				fn:function(minitalk) {
					if (minitalk.getSetting("mute") == true) {
						minitalk.setSetting("mute",false);
						minitalk.printMessage("system",LANG.action.useSound);
						$(".toolMute").removeClass("selected");
					} else {
						minitalk.setSetting("mute",true);
						minitalk.printMessage("system",LANG.action.muteSound);
						$(".toolMute").addClass("selected");
					}
				}
			},{
				cls:"toolPush",
				icon:"icon_push.png",
				text:LANG.tool.push,
				fn:function(minitalk) {
					if (minitalk.getSetting("push") == false) {
						if (window.Notification !== undefined) {
							if (Notification.permission == "granted") {
								minitalk.setSetting("push",true);
								minitalk.printMessage("system",LANG.action.usePush);
								$(".toolPush").addClass("selected");
							} else if (Notification.permission != "granted") {
								Notification.requestPermission(function(permission) {
									if (Notification.permission !== undefined) {
										Notification.permission = permission;
									}
									
									if (permission == "granted") {
										m.setSetting("push",true);
										m.printMessage("system",LANG.action.usePush);
										$(".toolPush").addClass("selected");
									} else {
										m.printMessage("error",LANG.error.allowPush);
									}
								});
							}
						} else {
							m.printMessage("error",LANG.error.notSupportBrowser);
						}
					} else {
						minitalk.setSetting("push",false);
						$(".toolPush").removeClass("selected");
						m.printMessage("system",LANG.action.stopPush);
					}
				}
			},"-",{
				cls:"toolScroll",
				icon:"icon_scroll.png",
				text:LANG.tool.scroll,
				fn:function(minitalk) {
					if (minitalk.isFixedScroll == true) {
						minitalk.printMessage("system",LANG.action.useAutoScroll);
						minitalk.isFixedScroll = false;
						minitalk.autoScroll();
						$(".toolScroll").removeClass("selected");
					} else {
						minitalk.printMessage("system",LANG.action.useFixedScroll);
						minitalk.autoScroll();
						minitalk.isFixedScroll = true;
						$(".toolScroll").addClass("selected");
					}
				}
			},{
				cls:"toolClear",
				icon:"icon_clear.png",
				text:LANG.tool.clear,
				fn:function(minitalk) {
					if (minitalk.myinfo.opper == "ADMIN" && minitalk.logLimit > 0 && confirm(LANG.confirm.clearlog) == true) {
						minitalk.send("clearlog",null);
					} else {
						$(".chatArea").html("");
						minitalk.printMessage("system",LANG.action.clearLogSelf);
						minitalk.setStorage("logList",[]);
					}
				}
			}];
			
			if (m.fontSettingHide == true) {
				defaultTool.shift();
				defaultTool.shift();
				defaultTool.shift();
				defaultTool.shift();
				defaultTool.shift();
			}
			
			var listStart = 0;
			var toolsWidth = 0;
			var insertSplit = false;
			m.toolList = defaultTool.concat(m.addToolList);
			
			$(".toolArea").html("");
			$(".toolListLayer").html("");
	
			for (var i=0, loop=m.toolList.length;i<loop;i++) {
				if (typeof m.toolList[i] == "object") {
					var thisButton = $("<button>").addClass("toolButton toolButtonOff");
					thisButton.attr("title",m.toolList[i].text);
					thisButton.attr("toolIDX",i);
					if (m.toolList[i].cls) thisButton.addClass(m.toolList[i].cls);
					thisButton.on("mouseover",function() { $(this).addClass("mouseover"); });
					thisButton.on("mouseout",function() { $(this).removeClass("mouseover"); });
					thisButton.on("click",function() { m.toolList[$(this).attr("toolIDX")].fn(m); });
					
					var thisButtonInner = $("<div>").addClass("toolButtonInner");
					
					if (m.toolType != "text") {
						var iconPath = m.toolList[i].cls ? m.getRootPath()+'/templets/'+m.templet+'/images/'+m.toolList[i].icon : m.toolList[i].icon;
						thisButtonInner.append($("<span>").addClass("toolButtonIcon").css("backgroundImage","url("+iconPath+")"));
					}
					
					if (m.toolType != "icon" || m.toolList[i].viewText === true) {
						thisButtonInner.append($("<span>").addClass("toolButtonText").text(m.toolList[i].text));
					}
					thisButton.append(thisButtonInner);
					
					if (insertSplit == true) {
						insertSplit = false;
						var thisSplit = $("<div>").addClass("toolSeparator");
						$(".toolArea").append(thisSplit);
						toolsWidth+= thisSplit.outerWidth(true);
					} else {
						thisSplit = null;
					}
					
					$(".toolArea").append(thisButton);
					toolsWidth+= thisButton.outerWidth(true);
					
					if (toolsWidth > $(".toolArea").innerWidth()-25) {
						thisButton.remove();
						if (thisSplit != null) thisSplit.remove();
						listStart = i;
						break;
					}
				} else {
					insertSplit = true;
				}
			}
			
			if (listStart > 0) {
				var moreButton = $("<div>").addClass("toolButtonMore");
				moreButton.on("mouseover",function() { if ($(this).attr("disabled") != "disabled") $(this).addClass("mouseover"); });
				moreButton.on("mouseout",function() { if ($(this).attr("disabled") != "disabled") $(this).removeClass("mouseover"); });
				$(".toolArea").append(moreButton);
				
				for (var i=listStart, loop=m.toolList.length;i<loop;i++) {
					if (i == listStart && typeof m.toolList[i] != "object") continue;
	
					if (typeof m.toolList[i] == "object") {
						var thisButton = $("<div>").addClass("toolList");
						if (m.toolList[i].cls) thisButton.addClass(m.toolList[i].cls);
						thisButton.attr("toolIDX",i);
						thisButton.on("mouseover",function() { $(this).addClass("mouseover"); });
						thisButton.on("mouseout",function() { $(this).removeClass("mouseover"); });
						thisButton.on("click",function() { m.toolList[$(this).attr("toolIDX")].fn(m); });
						var iconPath = m.toolList[i].cls ? m.getRootPath()+'/templets/'+m.templet+'/images/'+m.toolList[i].icon : m.toolList[i].icon;
						thisButton.append($("<span>").addClass("toolListIcon").css("backgroundImage","url("+iconPath+")"));
						thisButton.append($("<span>").addClass("toolListText").text(m.toolList[i].text));
						
						$(".toolListLayer").append(thisButton);
					} else {
						$(".toolListLayer").append($("<div>").addClass("toolSeparator"));
					}
				}
				
				moreButton.on("click",function() {
					if ($(this).attr("disabled") != "disabled") {
						if ($(".toolListLayer").css("display") == "none") {
							$(".toolListLayer").show();
							var height = $(".toolListLayer").outerHeight(true);
							$(".toolListLayer").outerHeight(1);
							$(".toolListLayer").animate({height:height},400);
							
							$(".toolButtonMore").addClass("selected");
						} else {
							$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
							
							$(".toolButtonMore").removeClass("selected");
						}
					}
				});
			}
		}
		
		this.reinit = function() {
			if (opt.type == "auto") {
				if ($(document).height() >= $(document).width()) {
					m.type = "vertical";
				} else {
					m.type = "horizontal";
				}
			}
			
			$(".frame").removeClass("vertical").removeClass("horizontal").addClass(m.type);
			$(".frame").outerHeight($(".outFrame").length == 0 ? $(document).height() : $(".outFrame").innerHeight(),true);
			$(".inputText").outerWidth($(".inputArea").innerWidth() - $(".inputButton").outerWidth(true),true);
			
			var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
			
			$(".userList").css("top",$(".titleArea").position().top + $(".titleArea").outerHeight(true));
	
			$(".chatArea").css("marginTop",0);
			$(".chatArea").css("marginRight",0);
			if ($(".userList").css("display") != "none") {
				if (m.type == "vertical") {
					$(".userList").css("left",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
					$(".userList").css("right","auto");
					$(".userList").outerWidth($(".frame").innerWidth(),true);
					$(".userList").outerHeight(m.userListHeight,true);
					$(".chatArea").css("marginTop",$(".userList").outerHeight(true));
				} else {
					$(".userList").css("left","auto");
					$(".userList").css("right",Math.ceil(($(".frame").outerHeight(true)-$(".frame").innerHeight())/2));
					$(".userList").outerWidth(m.userListWidth,true);
					$(".userList").outerHeight(height,true);
					$(".chatArea").css("marginRight",$(".userList").outerWidth(true));
				}
			}
			
			$(".chatArea").outerWidth($(".frame").innerWidth(),true);
			$(".chatArea").outerHeight(height,true);
			
			m.initTool();
			m.autoScroll();
		}
		
		this.initMyInfo = function() {
			var storeMyInfo = m.getStorage("myinfo");
			if (storeMyInfo == null) {
				m.myinfo = {id:"",nickname:m.nickname,nickcon:m.nickcon,sns:m.sns,device:m.device,info:m.info,status:m.status,opper:""};
			} else {
				m.myinfo = storeMyInfo;
				m.myinfo.device = m.device;
				if (m.nickname && m.nickname.length > 0) m.myinfo.nickname = m.nickname;
				if (m.nickcon && m.nickcon.length > 0) m.myinfo.nickcon = m.nickcon;
				if (m.info && typeof m.info == "object") m.myinfo.info = m.info;
			}
		}
		
		this.initUserMenu = function() {
			m.userMenuList = [{
				icon:"icon_myinfo.png",
				text:LANG.usermenu.myinfo,
				viewMenu:function(minitalk,user,myinfo) {
					if (user.nickname == myinfo.nickname) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					$(".userInfoNickname").val(minitalk.myinfo.nickname);
					if (minitalk.isNickname == false || minitalk.isPrivate == true) $(".userInfoNickname").attr("disabled",true);
					else $(".userInfoNickname").attr("disabled",false);
					$(".userInfoStatusIcon").css("backgroundImage","url("+minitalk.statusIconPath+"/"+minitalk.myinfo.device+"/"+minitalk.myinfo.status+".png)");
					$(".userInfoStatusText").text(LANG.status[minitalk.myinfo.status]);
					$(".userInfoStatus").attr("status",minitalk.myinfo.status);
					$(".userInfoLayer").fadeIn();
				}
			},{
				icon:"icon_whisper.png",
				text:LANG.usermenu.whisper,
				viewMenu:function(minitalk,user,myinfo) {
					if (user.nickname != myinfo.nickname) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					$(".inputText").focus();
					$(".inputText").val("/w "+user.nickname+" ");
				}
			},{
				icon:"icon_call.png",
				text:LANG.usermenu.call,
				viewMenu:function(minitalk,user,myinfo) {
					if (user.nickname != myinfo.nickname) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					minitalk.sendCall(user.nickname);
				}
			},{
				icon:"icon_privchannel.png",
				text:LANG.usermenu.privchannel,
				viewMenu:function(minitalk,user,myinfo) {
					if (user.nickname != myinfo.nickname && m.isPrivate == false) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					m.inviteUser(user.nickname);
				}
			},{
				icon:"icon_banmsg.png",
				text:LANG.usermenu.banmsg,
				viewMenu:function(minitalk,user,myinfo) {
					if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					minitalk.send("banmsg",{id:user.id,nickname:user.nickname});
				}
			},{
				icon:"icon_showip.png",
				text:LANG.usermenu.showip,
				viewMenu:function(minitalk,user,myinfo) {
					if (myinfo.opper == "ADMIN" && m.isPrivate == false) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					minitalk.send("showip",{id:user.id,nickname:user.nickname});
				}
			},{
				icon:"icon_banip.png",
				text:LANG.usermenu.banip,
				viewMenu:function(minitalk,user,myinfo) {
					if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname && m.isPrivate == false) return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					minitalk.send("banip",{id:user.id,nickname:user.nickname});
				}
			},{
				icon:"icon_opper.png",
				text:LANG.usermenu.opper,
				viewMenu:function(minitalk,user,myinfo) {
					if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname && minitalk.isPrivate == false && user.opper != "ADMIN") return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					minitalk.send("opper",{id:user.id,nickname:user.nickname});
				}
			},{
				icon:"icon_deopper.png",
				text:LANG.usermenu.deopper,
				viewMenu:function(minitalk,user,myinfo) {
					if (myinfo.opper == "ADMIN" && user.nickname != myinfo.nickname && m.isPrivate == false && user.opper == "ADMIN") return true;
					else return false;
				},
				fn:function(minitalk,user,myinfo) {
					minitalk.send("deopper",{id:user.id,nickname:user.nickname});
				}
			}];
		}
		
		this.checkLimit = function(limit,target) {
			if (limit == "") limit = "ALL";
			if (target == "") target = "ALL";
			var levels = ["ALL","NICKGUEST","MEMBER","POWERUSER","ADMIN","NONE"];
			
			return $.inArray(limit,levels) <= $.inArray(target,levels);
		}
		
		/* UI Actions */
		this.autoScroll = function() {
			if (m.isFixedScroll == true) return;
			$(".chatArea").scrollTop($(".chatArea").prop("scrollHeight"));
		}
		
		this.printMessage = function(type,message) {
			var item = $("<div>").addClass(type);
			item.html(message);
			$(".chatArea").append(item);
			m.autoScroll();
		}
		
		this.printLogMessage = function() {
			var logList = m.getLog();
			for (var i=(logList.length > m.logLimit ? logList.length-m.logLimit : 0), loop=logList.length;i<loop;i++) {
				if (logList[i].type == "chat") {
					m.printChatMessage("log",logList[i].log.user,logList[i].log.message,logList[i].log.time);
				} else {
					m.printWhisperMessage("log",logList[i].log.user,logList[i].log.to,logList[i].log.message,logList[i].log.time);
				}
			}
		}
		
		this.printChatMessage = function(type,sender,message,time) {
			var user = m.userTag(sender,false);
			var message = m.decodeMessage(message,true);
			
			if (type == "chat" && sender.nickname != m.myinfo.nickname) {
				if (typeof m.listeners.beforeMessage == "function") {
					if (m.listeners.beforeMessage(m,sender,message,time) == false) return;
				}
				
				for (var i=0, loop=m.beforeMessage.length;i<loop;i++) {
					if (typeof m.beforeMessage[i] == "function") {
						if (m.beforeMessage[i](m,sender,message,time) == false) return;
					}
				}
			}
			
			var item = $("<div>").addClass(type);
			if (sender.nickname == m.myinfo.nickname) item.addClass("mymessage");
			item.append(user);
			
			var messageObject = $("<span>").addClass("body").html(m.splitString+message);
			if (time) messageObject.attr("title",m.getTime(time,"full"));
			item.append(messageObject);
			if (time) item.append($("<span>").addClass("time").html(" ("+m.getTime(time,"time")+")"));
			
			$(".chatArea").append(item);
			m.autoScroll();
			
			if (type == "chat" && sender.nickname != m.myinfo.nickname) {
				if (typeof m.listeners.onMessage == "function") {
					m.listeners.onMessage(m,sender,message,time)
				}
				
				for (var i=0, loop=m.onMessage.length;i<loop;i++) {
					if (typeof m.onMessage[i] == "function") {
						m.onMessage[i](m,sender,message,time)
					}
				}
			}
		}
		
		this.printWhisperMessage = function(type,sender,to,message,time) {
			if (sender.nickname == m.myinfo.nickname) {
				var header = $("<span>").html(LANG.whisper.to.replace("{nickname}",'<span class="whisperTag"></span>'));
				var user = m.userTag(to,false);
			} else {
				var header = $("<span>").html(LANG.whisper.from.replace("{nickname}",'<span class="whisperTag"></span>'));
				var user = m.userTag(sender,false);
			}
			
			var item = $("<div>").addClass(type);
			item.append(header);
			
			var message = m.decodeMessage(message,true);
			
			if (type == "whisper" && sender.nickname != m.myinfo.nickname) {
				if (typeof m.listeners.beforeWhisper == "function") {
					if (m.listeners.beforeWhisper(m,sender,message,time) == false) return;
				}
				
				for (var i=0, loop=m.beforeWhisper.length;i<loop;i++) {
					if (typeof m.beforeWhisper[i] == "function") {
						if (m.beforeWhisper[i](m,sender,message,time) == false) return;
					}
				}
			}
			
			$(item.find(".whisperTag")).append(user);
			
			var messageObject = $("<span>").addClass("body").html(m.splitString+message);
			if (time) messageObject.attr("title",m.getTime(time,"full"));
			item.append(messageObject);
			if (time) item.append($("<span>").addClass("time").html(" ("+m.getTime(time,"time")+")"));
			
			$(".chatArea").append(item);
			m.autoScroll();
			
			if (type == "whisper" && sender.nickname != m.myinfo.nickname) {
				if (typeof m.listeners.onWhisper == "function") {
					m.listeners.onWhisper(m,sender,message,time)
				}
				
				for (var i=0, loop=m.onWhisper.length;i<loop;i++) {
					if (typeof m.onWhisper[i] == "function") {
						m.onWhisper[i](m,sender,message,time)
					}
				}
			}
		}
		
		this.printUser = function(users) {
			if ($(".userList").css("display") == "none") {
				if (m.type == "vertical") {
					var width = $(".chatArea").innerWidth();
					var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
					$(".userList").height(1);
					$(".userList").show();
					$(".userList").animate({height:m.userListHeight},{step:function(now,fx) {
						$(".chatArea").css("marginTop",$(".userList").outerHeight(true));
						$(".chatArea").width(width);
						$(".chatArea").outerHeight(height,true);
						
						if (now == m.userListHeight) {
							$(".chatArea").css("marginTop",m.userListHeight);
							$(".chatArea").outerHeight(height,true);
							$(".chatArea").width(width);
							m.autoScroll();
						}
					}});
				} else {
					var width = $(".chatArea").outerWidth(true);
					$(".userList").width(1);
					$(".userList").show();
					$(".userList").animate({width:m.userListWidth},{step:function(now,fx) {
						$(".chatArea").css("marginRight",$(".userList").outerWidth(true));
						$(".chatArea").outerWidth(width,true);
						
						if (now == m.userListWidth) {
							$(".chatArea").css("marginRight",m.userListWidth);
							$(".chatArea").outerWidth(width,true);
							m.autoScroll();
						}
					}});
				}
			}
			
			$(".toggleUserList").removeClass("toggleUserListOff").addClass("toggleUserListOn");
			
			var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
			
			m.viewUserListStatus = true;
			m.viewUserListSort = [];
			m.viewUserListStore = {};
			for (var i=0, loop=users.length;i<loop;i++) {
				m.viewUserListSort.push("["+(users[i].opper ? sortUserCode[users[i].opper] : "")+users[i].nickname+"]");
				m.viewUserListStore[users[i].nickname] = users[i];
			}
			m.viewUserListSort.sort();
			
			$(".userList").html("");
			
			$(".userList").append(m.userTag(m.myinfo,true));
			
			for (var i=0, loop=m.viewUserListSort.length;i<loop;i++) {
				var nickname = m.viewUserListSort[i].replace(/^\[(#|\*|\+|\-)?(.*?)\]$/,"$2");
				var user = m.userTag(m.viewUserListStore[nickname],true);
				
				if (m.viewUserListStore[nickname].nickname == m.myinfo.nickname) {
					user.css("display","none");
				}
				
				$(".userList").append(user);
			}
			
			m.printMessage("system",LANG.action.loadedUserCount.replace("{count}","<b><u>"+m.viewUserListSort.length+"</u></b>"));
		}
		
		this.hideUser = function() {
			$(".toggleUserList").removeClass("toggleUserListOn").addClass("toggleUserListOff");
			m.viewUserListStatus = false;

			if (m.type == "vertical") {
				$(".userList").animate({height:1},{step:function(now,fx) {
					var height = $(".frame").innerHeight() - $(".titleArea").outerHeight(true) - $(".actionArea").outerHeight(true);
					$(".chatArea").css("marginTop",$(".userList").outerHeight(true));
					$(".chatArea").outerHeight(height,true);
					
					if (now == 1) {
						$(".userList").hide();
						$(".chatArea").css("marginTop",0);
						$(".chatArea").outerHeight(height,true);
						$(".userList").html("");
						m.autoScroll();
					}
				}});
			} else {
				$(".userList").animate({width:1},{step:function(now,fx) {
					$(".chatArea").css("marginRight",$(".userList").outerWidth(true));
					$(".chatArea").outerWidth($(".frame").innerWidth(),true);
					
					if (now == 1) {
						$(".userList").hide();
						$(".chatArea").css("marginRight",0);
						$(".chatArea").outerWidth($(".frame").innerWidth(),true);
						$(".userList").html("");
						m.autoScroll();
					}
				}});
			}
			m.viewUserListSort = [];
			m.viewUserListStore = {};
		}
		
		this.printUserCount = function(count) {
			if (count > 0) {
				$(".userCount").text("("+LANG.personCount.replace('{count}',count)+")");
			} else {
				$(".userCount").text("");
			}
			
			if (m.isAutoHideUserList == false && count > 200 && m.viewUserListStatus == true) {
				m.isAutoHideUserList = true;
				m.printMessage("system",LANG.action.autoHideUser);
				m.hideUser();
			}
		}
		
		this.sendProtocol = function(protocol,data,channel,nickname) {
			var channel = channel !== undefined && channel.length > 0 ? channel : (m.isPrivate == true ? m.private : m.channel);
			var nickname = nickname !== undefined && nickname.length > 0 ? nickname : null;
			
			if (protocol.search(/(connect|message|whisper|call|banip|showip|userinfo|users|log|change)/) >= 0) {
				m.printMessage("error",LANG.error.reservedProtocol.replace("{protocol}","<b><u>"+protocol+"</u></b>"));
				return;
			}
			
			if (protocol !== undefined && typeof protocol == "string" && protocol.length > 0) {
				m.send("protocol",{protocol:protocol,data:data,channel:channel,nickname:nickname});
			}
		}
		
		this.sendMessage = function(message,isRaw) {
			if (m.checkLimit(m.chatLimit,m.myinfo.opper) == false) {
				m.printMessage("error",LANG.error.notAllowChat);
				return;
			}
			
			if (message.replace(/ /g,'').length == 0) return;
			
			isRaw = isRaw === true ? true : false;
			if (message.length == 0) return;

			if (isRaw == true) {
				if (m.getStorage("baned") != null && typeof m.getStorage("baned") == "object") {
					var baned = m.getStorage("baned");
					var check = baned[m.channel] ? baned[m.channel] : 0;
					if (check > new Date().getTime()) {
						m.printMessage("system",LANG.action.banedtime.replace("{second}","<b><u>"+Math.ceil((check - new Date().getTime()) / 1000)+"</u></b>"));
						return false;
					}
				}
				var printMessage = message;
				m.send("message",message);
			} else {
				if (message.indexOf("/") == 0) {
					var commandLine = message.split(" ");
					var command = commandLine.shift().toLowerCase();
					
					switch (command) {
						case "/w" :
							if (commandLine.length >= 2) {
								var nickname = commandLine.shift();
								var message = m.encodeMessage(commandLine.join(" "),false);
								
								if (nickname == m.myinfo.nickname) {
									m.printMessage("error",LANG.error.whisperMe);
									return;
								}
								
								if (typeof m.listeners.beforeSendWhisper == "function") {
									if (m.listeners.beforeSendWhisper(m,nickname,message,m.myinfo) == false) return;
								}
								
								for (var i=0, loop=m.beforeSendWhisper.length;i<loop;i++) {
									if (typeof m.beforeSendWhisper[i] == "function") {
										if (m.beforeSendWhisper[i](m,nickname,message,m.myinfo) == false) return;
									}
								}
								
								m.send("whisper",{nickname:nickname,message:message});
								
								if (typeof this.listeners.onSendWhisper == "function") {
									this.listeners.onSendWhisper(m,nickname,message,m.myinfo);
								}
								
								for (var i=0, loop=m.onSendWhisper.length;i<loop;i++) {
									if (typeof m.onSendWhisper[i] == "function") {
										m.onSendWhisper[i](m,nickname,message,m.myinfo);
									}
								}
							} else {
								m.printMessage("error",LANG.error.whisperCommandError);
							}
							
							break;
							
						case "/call" :
							if (commandLine.length == 1) {
								var nickname = commandLine.shift();
								m.sendCall(nickname);
							} else {
								m.printMessage("error",LANG.error.callCommandError);
							}
							break;
							
						case "/login" :
							if (commandLine.length == 1) {
								var password = commandLine.shift();
								m.login(password);
							} else {
								m.printMessage("error",LANG.error.loginCommandError);
							}
							break;
					}
					
					return;
				} else {
					if (m.getStorage("baned") != null && typeof m.getStorage("baned") == "object") {
						var baned = m.getStorage("baned");
						var check = baned[m.channel] ? baned[m.channel] : 0;
						if (check > new Date().getTime()) {
							m.printMessage("system",LANG.action.banedtime.replace("{second}","<b><u>"+Math.ceil((check - new Date().getTime()) / 1000)+"</u></b>"));
							return false;
						}
					}
					
					if (typeof m.listeners.beforeSendMessage == "function") {
						if (m.listeners.beforeSendMessage(m,message,m.myinfo) == false) return;
					}
					
					for (var i=0, loop=m.beforeSendMessage.length;i<loop;i++) {
						if (typeof m.beforeSendMessage[i] == "function") {
							if (m.beforeSendMessage[i](m,message,m.myinfo) == false) return;
						}
					}
					
					var printMessage = m.encodeMessage(message,true);
					m.send("message",printMessage);
				}
			}
			
			m.printChatMessage("chat",m.myinfo,printMessage);
			
			if (isRaw == false) {
				if (typeof m.listeners.onSendMessage == "function") {
					m.listeners.onSendMessage(m,message,m.myinfo);
				}
				
				for (var i=0, loop=m.onSendMessage.length;i<loop;i++) {
					if (typeof m.onSendMessage[i] == "function") {
						m.onSendMessage[i](m,message,m.myinfo);
					}
				}
			}
		}
		
		this.sendCall = function(nickname) {
			if (typeof m.listeners.beforeSendCall == "function") {
				if (m.listeners.beforeSendCall(m,nickname,m.myinfo) == false) return false;
			}
			
			for (var i=0, loop=m.beforeSendCall.length;i<loop;i++) {
				if (typeof m.beforeSendCall[i] == "function") {
					if (m.beforeSendCall[i](m,nickname,m.myinfo) == false) return false;
				}
			}
			
			m.send("call",nickname);
			
			if (typeof m.listeners.onSendCall == "function") {
				m.listeners.onSendCall(m,nickname,m.myinfo);
			}
			
			for (var i=0, loop=m.onSendCall.length;i<loop;i++) {
				if (typeof m.onSendCall[i] == "function") {
					m.onSendCall[i](m,nickname,m.myinfo);
				}
			}
		}
		
		this.login = function(password) {
			m.printMessage("system",LANG.action.login);
			$.ajax({
				type:"POST",
				url:m.getRootPath()+"/process/getChannelAdmin",
				data:"&password="+password+"&channel="+m.channel,
				dataType:"json",
				success:function(result) {
					if (result.success == true) {
						m.send("oppercode",result.oppercode);
					} else {
						m.printMessage("error",LANG.error.loginError);
					}
				},
				error:function() {
					
				}
			});
		}
		
		this.showAlert = function(type,code,message,autoHide,data,callback) {
			if ($(".alertLayer").find("."+code).length > 0) {
				$($(".alertLayer").find("."+code)).html();
				return false;
			}
			
			var autoHide = autoHide === false ? false : true;
			var data = data ? data : null;
			
			var alertLayer = $("<div>").addClass(type).addClass(code).html(message);
			alertLayer.attr("code",code);
			alertLayer.data("data",data);
			alertLayer.on("click",function() {
				m.removeAlert($(this).attr("code"),callback);
			});
			$(".alertLayer").append(alertLayer);
			var height = alertLayer.height();
			alertLayer.height(1);
			alertLayer.animate({height:height},"fast");
			
			if (autoHide == true) {
				setTimeout(m.hideAlert,15000,code);
			}
			
			return true;
		}
		
		this.removeAlert = function(code,callback) {
			var alert = $($(".alertLayer").find("."+code));
			alert.attr("oMarginLeft",alert.css("marginLeft"));
			var width = alert.width();
			var height = alert.height();
			alert.css("width",width);
			alert.css("height",height);
			alert.animate({marginLeft:-$(".frame").outerWidth()},"fast",function() {
				$(this).animate({height:1},"fast",function() {
					if (typeof callback == "function") {
						if (callback($(this)) === false) {
							$($(".alertLayer").find("."+code)).css("marginLeft",$($(".alertLayer").find("."+code)).attr("oMarginLeft"));
							$($(".alertLayer").find("."+code)).css("height","auto");
						} else {
							$(this).remove();
						}
					} else {
						$(this).remove();
					}
				});
			});
		}
		
		this.showNotice = function(message,url) {
			if (!url) url = "";
			
			m.showAlert("notice","notice"+Math.ceil(Math.random()*10000),message,true,url,function(alert) {
				if (alert.data("data").length > 0) window.open(alert.data("data"));
			});
		}
		
		/* Private Channel */
		this.inviteUser = function(nickname) {
			if (typeof m.listeners.beforeSendInvite == "function") {
				if (m.listeners.beforeSendInvite(m,nickname,m.myinfo) == false) return false;
			}
			
			for (var i=0, loop=m.beforeSendInvite.length;i<loop;i++) {
				if (typeof m.beforeSendInvite[i] == "function") {
					if (m.beforeSendInvite[i](m,nickname,m.myinfo) == false) return false;
				}
			}
			
			m.send("invite",nickname);
			
			if (typeof m.listeners.onSendInvite == "function") {
				m.listeners.onSendInvite(m,nickname,m.myinfo);
			}
			
			for (var i=0, loop=m.onSendInvite.length;i<loop;i++) {
				if (typeof m.onSendInvite[i] == "function") {
					m.onSendInvite[i](m,nickname,m.myinfo);
				}
			}
		}
		
		this.doInvite = function(data) {
			if (data.from.nickname == m.myinfo.nickname) {
				m.printMessage("system",LANG.action.inviteUser.replace("{nickname}","<b><u>"+data.to.nickname+"</u></b>"));
			} else {
				if (typeof m.listeners.beforeInvite == "function") {
					if (m.listeners.beforeInvite(m,data.from,data.code,m.myinfo) == false) return false;
				}
				
				for (var i=0, loop=m.beforeInvite.length;i<loop;i++) {
					if (typeof m.beforeInvite[i] == "function") {
						if (m.beforeInvite[i](m,data.from,data.code,m.myinfo) == false) return false;
					}
				}
				
				var showAlert = m.showAlert("invite",data.code,LANG.action.inviteNotifyLayer.replace("{nickname}","<b><u>"+data.from.nickname+"</u></b>").replace("{time}","<b><u>"+m.getTime(new Date().getTime(),"full")+"</u></b>"),false,data,function(alert) {
					if (confirm(LANG.action.inviteConfirm) == true) {
						return m.openPrivateChannel("join",alert.data("data"));
					} else {
						m.send("reject",alert.data("data"));
					}
					return true;
				});
				if (showAlert == true) {
					m.playSound("IRCQUERY");
					m.doPush("[MiniTalk6] "+LANG.action.inviteNotify.replace("{nickname}",data.from.nickname),"channel : "+m.channel);
					m.printMessage("system",LANG.action.inviteNotify.replace("{nickname}","<b><u>"+data.from.nickname+"</u></b>"));
					
					if (typeof m.listeners.onInvite == "function") {
						m.listeners.onInvite(m,data.from,data.code,m.myinfo);
					}
					
					for (var i=0, loop=m.onInvite.length;i<loop;i++) {
						if (typeof m.onInvite[i] == "function") {
							m.onInvite[i](m,data.from,data.code,m.myinfo);
						}
					}
				}
			}
		}
		
		this.openPrivateChannel = function(mode,data) {
			if (mode == "create") {
				if (window[m.getUserCode()] === undefined) {
					m.printMessage("system",LANG.action.createPrivateChannel);
					return m.createPrivateChannel(data);
				}
			} else if (mode == "join") {
				if (window[data.code] === undefined) {
					m.printMessage("system",LANG.action.joinPrivateChannel.replace("{nickname}","<b><u>"+data.from.nickname+"</u></b>"));
					return m.createPrivateChannel(data);
				}
			}
		}
		
		this.createPrivateChannel = function(data) {
			var width = 700;
			var height = 400;
			var windowLeft = Math.ceil((screen.width-width)/2);
			var windowTop = Math.ceil((screen.height-height)/2 > 2);
			
			var target = data.code+Math.random();

			var formObject = $("<form>").css("display","none").attr("action",m.getRootPath()+"/html/PrivateChannel.php").attr("target",target).attr("method","POST");
			
			formObject.append($("<input>").attr("name","channel").attr("value",m.channel));
			formObject.append($("<input>").attr("name","owner").attr("value",data.from.nickname));
			formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(m.myinfo)));
			formObject.append($("<input>").attr("name","config").attr("value",JSON.stringify({templet:m.templet,language:m.language})));
			formObject.append($("<input>").attr("name","code").attr("value",data.code));
			formObject.append($("<input>").attr("name","plugin").attr("value",JSON.stringify(m.plugin)));
				
			if (data.from.nickname == m.myinfo.nickname) {
				formObject.append($("<input>").attr("name","invite").attr("value",data.to.nickname));
			}
			$("body").append(formObject);

			window[data.code] = window.open("",target,"top="+windowTop+",left="+windowLeft+",width="+width+",height="+height+",scrollbars=0");
			if (window[data.code]) {
				window[data.code].focus();
				formObject.submit();
				formObject.remove();
				
				return true;
			} else {
				m.printMessage("error",LANG.error.popup);
				formObject.remove();
				
				return false;
			}
		}
		
		/* plugin channel */
		this.openPluginChannel = function(plugin,code,width,height,data) {
			var windowLeft = Math.ceil((screen.width-width)/2);
			var windowTop = Math.ceil((screen.height-height)/2 > 2);
			
			var target = plugin+Math.random();

			var formObject = $("<form>").css("display","none").attr("action",m.getRootPath()+"/html/PluginChannel.php").attr("target",target).attr("method","POST");
			
			formObject.append($("<input>").attr("name","channel").attr("value",m.channel));
			formObject.append($("<input>").attr("name","code").attr("value",code));
			formObject.append($("<input>").attr("name","parent").attr("value",m.isPrivate ? m.private : m.channel));
			formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(m.myinfo)));
			formObject.append($("<input>").attr("name","config").attr("value",JSON.stringify({templet:m.templet,language:m.language})));
			formObject.append($("<input>").attr("name","plugin").attr("value",plugin));
			formObject.append($("<input>").attr("name","data").attr("value",JSON.stringify(data)));
			$("body").append(formObject);

			var popup = window.open("",target,"top="+windowTop+",left="+windowLeft+",width="+width+",height="+height+",scrollbars=0");
			if (popup) {
				popup.focus();
				formObject.submit();
				formObject.remove();
				
				return true;
			} else {
				m.printMessage("error",LANG.error.popup);
				formObject.remove();
				
				return false;
			}
		}
		
		/* Messages */
		this.encodeMessage = function(message,isBBcode) {
			message = message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\/,"");
			
			message = message.replace(/\[COLOR=(.*?)\]/g,'');
			message = message.replace(/\[(B|I|U)\]/g,'');
			message = message.replace(/\[\/(COLOR|B|I|U)\]/g,'');
				
			if (isBBcode == true) {
				if (m.getSetting("fontColor") !== false && m.getSetting("fontColor").length == 6) message = '[COLOR='+m.getSetting("fontColor")+']'+message+'[/COLOR]';
				if (m.getSetting("fontBold") == true) message = '[B]'+message+'[/B]';
				if (m.getSetting("fontItalic") == true) message = '[I]'+message+'[/I]';
				if (m.getSetting("fontUnderline") == true) message = '[U]'+message+'[/U]';
			}
			
			return message;
		}
		
		this.decodeMessage = function(message,isFontColor) {
			if (isFontColor == true) message = message.replace(/\[COLOR=([a-zA-Z0-9]{6})\](.*?)\[\/COLOR\]/g,'<span style="color:#$1;">$2</span>');
			else message = message.replace(/\[COLOR=([a-zA-Z0-9]{6})\](.*?)\[\/COLOR\]/g,'$2');
			message = message.replace(/\[B\](.*?)\[\/B\]/g,'<b>$1</b>');
			message = message.replace(/\[I\](.*?)\[\/I\]/g,'<i>$1</i>');
			message = message.replace(/\[U\](.*?)\[\/U\]/g,'<span style="text-decoration:underline;">$1</span>');
			message = message.replace(/((http|ftp|https):\/\/[^ \(\)<>]+)/g,'<a href="$1" target="_blank">$1</a>');
			message = message.replace(/\[EMO:(.*?)\]/g,'<img src="'+m.getRootPath()+'/emoticon/$1" style="vertical-align:middle" onload="m.autoScroll();" />');
			
			return message;
		}
		
		/* UI Events */
		$(".titleArea").on("mousedown",function(event) { event.preventDefault(); });
		$(".userList").on("mousedown",function(event) { event.preventDefault(); });
		$(".userMenu").on("mousedown",function(event) { event.preventDefault(); });
		$(".userInfoStatus").on("mousedown",function(event) { event.preventDefault(); });
		$(".toolArea").on("mousedown",function(event) { event.preventDefault(); });
		
		$(window).on("resize",function() {
			m.reinit();
		});
		
		$(".frame").on("click",function(event) {
			if ($(".userMenu").css("display") != "none") {
				if (!$(event.target).attr("nickname")) $(".userMenu").hide();
			}
		});
		
		$(".chatArea").on("click",function(event) {
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
		});
		
		$(".inputButton").on("click",function() {
			if ($(".toolEmoticonLayer").css("display") != "none") m.insertEmoticon();
			if ($(".toolFontColorLayer").css("display") != "none") m.selectFontColor();
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
			m.sendMessage($(".inputText").val());
			$(".inputText").val("");
			$(".inputText").focus();
		});
		
		$(".inputText").on("click",function() {
			if ($(".toolEmoticonLayer").css("display") != "none") m.insertEmoticon();
			if ($(".toolFontColorLayer").css("display") != "none") m.selectFontColor();
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
		});
		
		$(".inputText").on("keypress",function(event) {
			if (event.which == 13) {
				m.sendMessage($(".inputText").val());
				$(".inputText").val("");
				$(".inputText").focus();
				event.preventDefault();
			}
		});
		
		$(".titleArea > DIV").on("mouseover",function() {
			$(this).addClass("mouseover");
		});
		
		$(".titleArea > DIV").on("mouseout",function() {
			$(this).removeClass("mouseover");
		});
		
		$(".toggleUserList").on("click",function() {
			if (m.viewUserListStatus == true) {
				m.hideUser();
			} else {
				m.isAutoHideUserList = true;
				m.printMessage("system",LANG.action.loadingUserList);
				m.send("users",m.viewUserLimit);
			}
		});
		
		$(".toggleUserInfo").on("click",function() {
			if ($(".userInfoLayer").css("display") == "none") {
				$(".userInfoNickname").val(m.myinfo.nickname);
				if (m.isNickname == false || m.isPrivate == true) $(".userInfoNickname").attr("disabled",true);
				else $(".userInfoNickname").attr("disabled",false);
				$(".userInfoStatusIcon").css("backgroundImage","url("+m.statusIconPath+"/"+m.myinfo.device+"/"+m.myinfo.status+".png)");
				$(".userInfoStatusText").text(LANG.status[m.myinfo.status]);
				$(".userInfoStatus").attr("status",m.myinfo.status);
				$(".userInfoLayer").fadeIn();
			} else {
				$(".userInfoLayer").fadeOut();
			}
		});
		
		$(".userInfoStatusBox").on("click",function() {
			if ($(".userInfoStatusList").css("display") == "none") {
				var list = $("<ul>");
				
				for (var status in LANG.status) {
					if (status == "offline") continue;
					var item = $("<li>");
					item.text(LANG.status[status]);
					item.css("backgroundImage","url("+m.statusIconPath+"/"+m.device+"/"+status+".png)");
					item.attr("status",status);
					item.on("mouseover",function() {
						$(this).addClass("mouseover");
					});
					item.on("mouseout",function() {
						$(this).removeClass("mouseover");
					});
					item.on("click",function() {
						$(".userInfoStatusIcon").css("backgroundImage","url("+m.statusIconPath+"/"+m.device+"/"+$(this).attr("status")+".png)");
						$(".userInfoStatusText").text(LANG.status[$(this).attr("status")]);
						$(".userInfoStatus").attr("status",$(this).attr("status"));
						$(".userInfoStatusList").hide();
					});
					list.append(item);
				}
				
				$(".userInfoStatusList").html("");
				$(".userInfoStatusList").append(list);
				$(".userInfoStatusList").slideDown();
			} else {
				$(".userInfoStatusList").slideUp();
			}
		});
		
		$(".userInfoButton").on("click",function() {
			m.send("change",{nickname:$(".userInfoNickname").val(),status:$(".userInfoStatus").attr("status")});
			$(".userInfoLayer").fadeOut();
		});
		
		$(window).on("orientationchange",function() {
			m.reinit();
		});
		
		/* Tool Buttons Event */
		this.selectFontColor = function() {
			if ($(".toolEmoticonLayer").css("display") != "none") m.insertEmoticon();
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").animate({height:1},400,function() { $(".toolListLayer").hide(); $(".toolListLayer").height("auto"); });
				$(".toolButtonMore").removeClass("selected");
			}
			
			if ($(".toolFontColorLayer").css("display") == "none") {
				$(".toolColor").addClass("selected");
				
				$(".toolFontColorLayer").html("");
				var colorbox = $("<div>").addClass("default");
				colorbox.attr("code","");
				if (m.getSetting("fontColor") == false || m.getSetting("fontColor") == "") colorbox.addClass("selected");
				colorbox.on("mouseover",function() { $(this).addClass("mouseover"); });
				colorbox.on("mouseout",function() { $(this).removeClass("mouseover"); });
				colorbox.on("click",function() {
					$($(".toolFontColorLayer").find("div")).removeClass("selected");
					$(this).addClass("selected");
					m.setSetting("fontColor",$(this).attr("code"));
					$(".inputText").css("color","#"+$(this).attr("code"));
				});
				$(".toolFontColorLayer").append(colorbox);
				
				var colors = ["#7F7F7F","#880015","#ED1C24","#FF7F27","#FFF200","#22B14C","#00A2E8","#3F48CC","#A349A4","#000000","#C3C3C3","#B97A57","#FFAEC9","#FFC90E","#EFE4B0","#B5E61D","#99D9EA","#7092BE","#C8BFE7"];
				for (var i=0, loop=colors.length;i<loop;i++) {
					var colorbox = $("<div>").addClass("color").css("backgroundColor",colors[i]);
					colorbox.attr("code",colors[i].replace("#",""));
					if (m.getSetting("fontColor") == colors[i]) colorbox.addClass("selected");
					
					colorbox.on("mouseover",function() { $(this).addClass("mouseover"); });
					colorbox.on("mouseout",function() { $(this).removeClass("mouseover"); });
					colorbox.on("click",function() {
						$($(".toolFontColorLayer").find("div")).removeClass("selected");
						$(this).addClass("selected");
						m.setSetting("fontColor",$(this).attr("code"));
						$(".inputText").css("color","#"+$(this).attr("code"));
					});
					$(".toolFontColorLayer").append(colorbox);
				}
				
				if ($(".toolArea").find(".toolColor").length > 0 && $(".toolColor").position().left + $(".toolFontColorLayer").outerWidth(true) < $(".frame").innerWidth()) {
					$(".toolFontColorLayer").css("right","auto");
					$(".toolFontColorLayer").css("left",$(".toolColor").position().left);
				} else {
					$(".toolFontColorLayer").css("left","auto");
					$(".toolFontColorLayer").css("right",Math.ceil(($(".frame").outerWidth(true)-$(".frame").innerWidth())/2));
				}
				
				$(".toolFontColorLayer").show();
				var height = 0;
				if ($(".toolFontColorLayer").attr("height")) {
					height = parseInt($(".toolFontColorLayer").attr("height"));
				} else {
					height = $(".toolFontColorLayer").height();
					$(".toolFontColorLayer").attr("height",height);
				}
				
				$(".toolFontColorLayer").height(1);
				$(".toolFontColorLayer").animate({height:height},"fast");
			} else {
				$(".toolColor").removeClass("selected");
				$(".toolFontColorLayer").animate({height:1},"fast",function() { $(".toolFontColorLayer").hide(); });
			}
		}
		
		this.insertEmoticon = function() {
			if ($(".toolFontColorLayer").css("display") != "none") m.selectFontColor();
			
			if ($(".toolEmoticonLayer").find(".toolEmoticonLayerTab").length == 0) {
				var tab = $("<div>").addClass("toolEmoticonLayerTab");
				var tabList = $("<div>").addClass("toolEmoticonLayerTabList").data("position",0);
				var list = $("<div>").addClass("toolEmoticonLayerList");
				
				for (var i=0, loop=m.emoticons.length;i<loop;i++) {
					var thisTab = $("<div>");
					thisTab.attr("tabIDX",i);
					if (i == 0) thisTab.addClass("selected first");
					else if (i == m.emoticons.length - 1) thisTab.addClass("last");
					thisTab.html('<img src="'+m.getRootPath()+'/emoticon/'+m.emoticons[i].path+'/'+m.emoticons[i].icon+'" />');
					thisTab.on("click",function() {
						$(".toolEmoticonLayerTabList > DIV").removeClass("selected");
						$(this).addClass("selected");
						$(".toolEmoticonLayerListTab").hide();
						$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[$(this).attr("tabIDX")]).show();
					});
					tabList.append(thisTab);
					
					var listTab = $("<div>").addClass("toolEmoticonLayerListTab");
					for (var j=0, loopj=m.emoticons[i].emoticon.length;j<loopj;j++) {
						var icon = $("<div>").addClass(".toolEmoticonLayerIcon").addClass(m.emoticons[i].type);
						icon.on("mouseover",function() { $(this).addClass("mouseover"); });
						icon.on("mouseout",function() { $(this).removeClass("mouseover"); });
						icon.on("click",function() {
							$(".inputText").val($(".inputText").val()+$(this).attr("code"));
							$(".inputText").focus();
						});
						
						if (m.emoticons[i].type == "image") {
							icon.attr("code","[EMO:"+m.emoticons[i].path+"/"+m.emoticons[i].emoticon[j]+"]");
							icon.html('<img src="'+m.getRootPath()+'/emoticon/'+m.emoticons[i].path+'/'+m.emoticons[i].emoticon[j]+'" />');
						} else {
							icon.attr("code",m.emoticons[i].emoticon[j]);
							icon.html(m.emoticons[i].emoticon[j]);
						}
						listTab.append(icon);
					}
					list.append(listTab);
				}
				var leftMore = $("<div>").addClass("left");
				leftMore.on("click",function() {
					var position = $(".toolEmoticonLayerTabList").data("position");
					if (position > 0) {
						position--;
						$(".toolEmoticonLayerTabList").data("position",position);
						
						var width = 0;
						
						for (var i=0;i<position;i++) {
							width+= $($(".toolEmoticonLayerTabList > DIV")[i]).outerWidth(true);
						}
						$(".toolEmoticonLayerTabList").animate({scrollLeft:width},"fast",function() {
							$(".toolEmoticonLayerTabList > DIV").removeClass("selected");
							$($(".toolEmoticonLayerTabList > DIV")[$(".toolEmoticonLayerTabList").data("position")]).addClass("selected");
							$(".toolEmoticonLayerListTab").hide();
							$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[$(".toolEmoticonLayerTabList").data("position")]).show();
						});
					}
				});
				tab.append(leftMore);
				tab.append(tabList);
				var rightMore = $("<div>").addClass("right");
				rightMore.on("click",function() {
					var position = $(".toolEmoticonLayerTabList").data("position");
					if (position < $(".toolEmoticonLayerTabList > DIV").length - 1) {
						position++;
						$(".toolEmoticonLayerTabList").data("position",position);
						
						var width = 0;
						
						for (var i=0;i<position;i++) {
							width+= $($(".toolEmoticonLayerTabList > DIV")[i]).outerWidth(true);
						}
						$(".toolEmoticonLayerTabList").animate({scrollLeft:width},"fast",function() {
							$(".toolEmoticonLayerTabList > DIV").removeClass("selected");
							$($(".toolEmoticonLayerTabList > DIV")[$(".toolEmoticonLayerTabList").data("position")]).addClass("selected");
							$(".toolEmoticonLayerListTab").hide();
							$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[$(".toolEmoticonLayerTabList").data("position")]).show();
						});
					}
				});
				tab.append(rightMore);
				$(".toolEmoticonLayer").append(tab);
				$(".toolEmoticonLayer").append(list);
				
				$(".toolEmoticonLayerListTab").hide();
				$($(".toolEmoticonLayerList").find(".toolEmoticonLayerListTab")[0]).show();
			}
			
			if ($(".toolListLayer").css("display") != "none") {
				$(".toolListLayer").hide();
				$(".toolButtonMore").removeClass("selected");
			}
			
			$(".toolEmoticonLayer").outerWidth(165,true);
			$(".toolEmoticonLayerTabList").outerWidth($(".toolEmoticonLayer").innerWidth() - $(".toolEmoticonLayerTab > .left").outerWidth(true) - $(".toolEmoticonLayerTab > .left").outerWidth(true),true);
			
			if ($(".toolEmoticonLayer").css("display") != "none") {
				$(".toolEmoticon").removeClass("selected");
				$(".toolEmoticonLayer").animate({height:1},"fast",function() {
					$(".toolEmoticonLayer").hide();
				});
			} else {
				$(".toolEmoticonLayer").height(1);
				$(".toolEmoticonLayer").show();
				if ($(".toolArea").find(".toolEmoticon").length > 0 && $(".toolEmoticon").position().left + 165 < $(".frame").innerWidth()) {
					$(".toolEmoticonLayer").css("right","auto");
					$(".toolEmoticonLayer").css("left",$(".toolEmoticon").position().left);
				} else {
					$(".toolEmoticonLayer").css("left","auto");
					$(".toolEmoticonLayer").css("right",Math.ceil(($(".frame").outerWidth(true)-$(".frame").innerWidth())/2));
				}
				$(".toolEmoticon").addClass("selected");
				
				var height = $(".chatArea").outerHeight(true) > 150 ? 150 : $(".chatArea").outerHeight(true);
				$(".toolEmoticonLayer").animate({height:height},"fast",function() {
					$(".toolEmoticonLayerList").outerHeight($(".toolEmoticonLayer").innerHeight() -  $(".toolEmoticonLayerTab").outerHeight(true),true);
				});
			}
		}
		
		/* users */
		this.userTag = function(user,isUserList) {
			var tag = $("<span>").addClass("user");
			tag.data("userinfo",user);
			if (isUserList == true && m.viewStatusIcon == true) {
				tag.css("paddingLeft",20);
				tag.css("backgroundImage","url("+m.statusIconPath+"/"+user.device+"/"+user.status+".png)");
			}
			
			if (isUserList == true) {
				tag.on("mouseover",function() {
					$(this).addClass("mouseover");
				});
				tag.on("mouseout",function() {
					$(this).removeClass("mouseover");
				});
			}
			tag.attr("nickname",user.nickname);
			
			var sHTML = "";
			if (user.nickcon != "") {
				var temp = user.nickcon.split(",");
				for (var i=0,loop=temp.length;i<loop;i++) {
					if (temp[i] == "{nickname}") {
						sHTML+= user.nickname;
					} else {
						if (isUserList == true) sHTML+= '<img src="'+temp[i]+'" nickname="'+user.nickname+'" />';
						else sHTML+= '<img src="'+temp[i]+'" nickname="'+user.nickname+'" onload="m.autoScroll();" />';
					}
				}
			} else {
				sHTML+= user.nickname;
			}
			
			if (isUserList == true && m.myinfo.nickname == user.nickname) {
				sHTML+= "("+LANG.me+")";
			} else {
				tag.attr("code",user.nickname);
			}
			
			if (user.opper == "ADMIN") {
				sHTML+= '<img src="'+m.getRootPath()+'/templets/'+m.templet+'/images/icon_admin.gif" />';
			}
			
			tag.html(sHTML);
			tag.on("click",function(event) {
				m.toggleUserMenu($(this).data().userinfo,event);
			});
			
			return tag;
		}
		
		this.joinUser = function(data) {
			var user = data.user;
			m.printUserCount(data.usercount);
			
			if (m.viewAlert == true) {
				if (m.checkLimit(m.viewAlertLimit,user.opper) == true) {
					m.printMessage("system",LANG.action.joinUser.replace("{nickname}","<b><u>"+user.nickname+"</u></b>"));
				}
			}
			
			var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
			
			if (m.viewUserListStatus == true) {
				if (m.checkLimit(m.viewUserLimit,user.opper) == true) {
					m.viewUserListSort.push("["+(user.opper ? sortUserCode[user.opper] : "")+user.nickname+"]");
					m.viewUserListStore[user.nickname] = user;
					m.viewUserListSort.sort();
					var position = $.inArray("["+(user.opper ? sortUserCode[user.opper] : "")+user.nickname+"]",m.viewUserListSort);
	
					if ($(".userList > span").length < position) {
						$(".userList").append(m.userTag(user,true));
					} else {
						$($(".userList > span")[position]).after(m.userTag(user,true));
					}
				}
			}
			
			if (typeof m.listeners.onJoinUser == "function") {
				m.listeners.onJoinUser(m,user,data.usercount);
			}
			
			for (var i=0, loop=m.onJoinUser.length;i<loop;i++) {
				if (typeof m.onJoinUser[i] == "function") {
					m.onJoinUser[i](m,user,data.usercount);
				}
			}
		}
		
		this.leaveUser = function(data) {
			var user = data.user;
			m.printUserCount(data.usercount);
			
			if (m.viewAlert == true) {
				if (m.checkLimit(m.viewAlertLimit,user.opper) == true) {
					m.printMessage("system",LANG.action.leaveUser.replace("{nickname}","<b><u>"+user.nickname+"</u></b>"));
				}
			}
			
			var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
			
			if (m.viewUserListStatus == true) {
				if (m.checkLimit(m.viewUserLimit,user.opper) == true) {
					m.viewUserListSort.splice($.inArray("["+(user.opper ? sortUserCode[user.opper] : "")+user.nickname+"]",m.viewUserListSort),1);
					delete m.viewUserListStore[user.nickname];
					$(".userList").find("[code='"+user.nickname+"']").remove();
				}
			}
			
			if (typeof m.listeners.onLeaveUser == "function") {
				m.listeners.onLeaveUser(m,user,data.usercount);
			}
			
			for (var i=0, loop=m.onLeaveUser.length;i<loop;i++) {
				if (typeof m.onLeaveUser[i] == "function") {
					m.onLeaveUser[i](m,user,data.usercount);
				}
			}
		}
		
		this.changeUser = function(before,after) {
			if (before.nickname == m.myinfo.nickname) {
				m.myinfo = after;
				m.setStorage("myinfo",m.myinfo);
				
				if (m.viewUserListStatus == true) {
					$(".userList > span")[0].remove();
					$(".userList").prepend(m.userTag(m.myinfo,true));
				}
				
				m.initToolButton(true);
			}
			
			if (before.nickname != after.nickname) {
				m.printMessage("system",LANG.action.changeNickname.replace("{before}","<b><u>"+before.nickname+"</u></b>").replace("{after}","<b><u>"+after.nickname+"</u></b>"));
			}
			
			if (before.status != after.status) {
				m.printMessage("system",LANG.action.changeStatus.replace("{nickname}","<b><u>"+after.nickname+"</u></b>").replace("{status}","<b><u>"+LANG.status[after.status]+"</u></b>"));
			}
			
			var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
			
			if (m.viewUserListStatus == true) {
				if ($.inArray("["+before.opper+before.nickname+"]",m.viewUserListSort) >= 0) {
					m.viewUserListSort.splice($.inArray("["+(before.opper ? sortUserCode[before.opper] : "")+before.nickname+"]",m.viewUserListSort),1);
				}
				if (m.viewUserListStore[before.nickname] != undefined) {
					delete m.viewUserListStore[before.nickname];
				}
				$(".userList").find("[code='"+before.nickname+"']").remove();
				
				if (m.checkLimit(m.viewUserLimit,after.opper) == true) {
					m.viewUserListSort.push("["+(after.opper ? sortUserCode[after.opper] : "")+after.nickname+"]");
					m.viewUserListStore[after.nickname] = after;
					m.viewUserListSort.sort();
					var position = $.inArray("["+(after.opper ? sortUserCode[after.opper] : "")+after.nickname+"]",m.viewUserListSort);
					var user = m.userTag(after,true);
					
					if (after.nickname == m.myinfo.nickname) {
						user.css("display","none");
					}
					if ($(".userList > span").length < position) {
						$(".userList").append(user);
					} else {
						$($(".userList > span")[position]).after(user);
					}
				}
			}
		}
		
		this.toggleUserMenu = function(userinfo,event) {
			$(".userMenu").html("");
			$(".userMenu").attr("nickname",userinfo.nickname);
			$(".userMenu").data("userinfo",userinfo);
			$(".userMenu").show();
			var width = $(".userMenu").outerWidth(true);
			
			var frameWidth = $(".frame").outerWidth(true);
			var frameHeight = $(".frame").outerHeight(true);
			
			if (event.pageX + width < frameWidth) {
				$(".userMenu").css("left",event.pageX);
				$(".userMenu").css("right","auto");
			} else {
				$(".userMenu").css("left","auto");
				$(".userMenu").css("right",5);
			}
			
			if (event.pageY < frameHeight/2) {
				$(".userMenu").attr("position","top");
				$(".userMenu").css("top",event.pageY);
				$(".userMenu").css("bottom","auto");
			} else {
				$(".userMenu").attr("position","bottom");
				$(".userMenu").css("top","auto");
				$(".userMenu").css("bottom",frameHeight - event.pageY);
			}
			
			$(".userMenu").append($("<div>").addClass("nickname").css("backgroundImage","url("+m.getRootPath()+"/images/loader16.gif)").html(userinfo.nickname));
			
			m.send("userinfo",{id:userinfo.id,nickname:userinfo.nickname});
		}
		
		this.printUserMenu = function(userinfo) {
			if ($(".userMenu").css("display") == "none" || $(".userMenu").attr("nickname") != userinfo.nickname) return;
			
			var user = $(".userMenu").data().userinfo;
			user.status = userinfo.status;
			user.opper = userinfo.opper;
			
			$($(".userMenu").find(".nickname")).css("backgroundImage","url("+m.statusIconPath+"/"+user.device+"/"+user.status+".png)");
			$(".userMenu").append($("<div>").addClass("list").css("overflow","hidden").height(1));
			
			var height = 0;
			for (var i=0, loop=m.userMenuList.length;i<loop;i++) {
				if (typeof m.userMenuList[i].viewMenu !== "function" || m.userMenuList[i].viewMenu(m,user,m.myinfo) == true) {
					var thisMenu = $("<div>").addClass("menu");
					thisMenu.attr("menuIDX",i);
					thisMenu.data("userinfo",user);
					thisMenu.on("mouseover",function() { $(this).addClass("mouseover"); });
					thisMenu.on("mouseout",function() { $(this).removeClass("mouseover"); });
					thisMenu.on("click",function() {
						var user = $(this).data().userinfo;
						m.userMenuList[parseInt($(this).attr("menuIDX"))].fn(m,user,m.myinfo);
						$(".userMenu").hide();
					});
					thisMenu.css("backgroundImage","url("+m.getRootPath()+"/templets/"+m.templet+"/images/"+m.userMenuList[i].icon+")");
					thisMenu.html(m.userMenuList[i].text);
	
					$($(".userMenu").find(".list")).append(thisMenu);
					height+= thisMenu.outerHeight(true);
				}
			}
			
			for (var i=0, loop=m.addUserMenuList.length;i<loop;i++) {
				if (typeof m.addUserMenuList[i].viewMenu !== "function" || m.addUserMenuList[i].viewMenu(m,user,m.myinfo) == true) {
					var thisMenu = $("<div>").addClass("menu");
					thisMenu.attr("menuIDX",i);
					thisMenu.data("userinfo",user);
					thisMenu.on("mouseover",function() { $(this).addClass("mouseover"); });
					thisMenu.on("mouseout",function() { $(this).removeClass("mouseover"); });
					thisMenu.on("click",function() {
						var user = $(this).data().userinfo;
						m.addUserMenuList[parseInt($(this).attr("menuIDX"))].fn(m,user,m.myinfo);
						$(".userMenu").hide();
					});
					thisMenu.css("backgroundImage","url("+m.addUserMenuList[i].icon+")");
					thisMenu.html(m.addUserMenuList[i].text);
	
					$($(".userMenu").find(".list")).append(thisMenu);
					height+= thisMenu.outerHeight(true);
				}
			}
			
			var frameWidth = $(".frame").outerWidth(true);
			var frameHeight = $(".frame").outerHeight(true);
			var padding = $(".userMenu").outerHeight(true) - $(".userMenu").height();
			
			if (padding + $($(".userMenu").find(".nickname")).outerHeight(true) + height + 10 < frameHeight - parseInt($(".userMenu").css($(".userMenu").attr("position")).replace("px",""))) {
				height = height;
			} else {
				height = frameHeight - padding - $($(".userMenu").find(".nickname")).outerHeight(true) - parseInt($(".userMenu").css($(".userMenu").attr("position")).replace("px","")) - 10;
				$($(".userMenu").find(".list")).css("overflowY","scroll");
			}
			
			$($(".userMenu").find(".list")).animate({height:height},"fast");
		}
		
		/* actions */
		this.playSound = function(sound) {
			if (m.getSetting("mute") == true) return;
			
			if ($("#SOUND-"+sound).length == 0) {
				$("body").append($("<audio>").attr("id","SOUND-"+sound).append($("<source>").attr("src",m.getRootPath()+"/sound/"+sound+".ogg").attr("type","audio/ogg")).append($("<source>").attr("src",m.getRootPath()+"/sound/"+sound+".mp3").attr("type","audio/mpeg")));
			}
			$("#SOUND-"+sound).get(0).play();
		}
		
		this.doPush = function(title,message) {
			if (m.getSetting("push") == true && window.Notification !== undefined && Notification.permission == "granted") {
				var notification = new Notification(title,{body:message,icon:m.getRootPath()+"/images/minitalk64.png"});
			}
		}
		
		this.doCall = function(data) {
			if (data.from.nickname == m.myinfo.nickname) {
				m.printMessage("system",LANG.action.call.replace("{nickname}","<b><u>"+data.to.nickname+"</u></b>"));
			} else {
				if (typeof m.listeners.beforeCall == "function") {
					if (m.listeners.beforeCall(m,data.from,m.myinfo) == false) return false;
				}
				
				for (var i=0, loop=m.beforeCall.length;i<loop;i++) {
					if (typeof m.beforeCall[i] == "function") {
						if (m.beforeCall[i](m,data.from,m.myinfo) == false) return false;
					}
				}
				
				m.printMessage("system",LANG.action.callNotify.replace("{nickname}","<b><u>"+data.from.nickname+"</u></b>"));
				m.playSound("IRCCALL");
				m.doPush("[MiniTalk6] "+LANG.action.callNotify.replace("{nickname}",data.from.nickname),"channel : "+m.channel);
				
				if (typeof m.listeners.onCall == "function") {
					m.listeners.onCall(m,data.from,m.myinfo);
				}
				
				for (var i=0, loop=m.onCall.length;i<loop;i++) {
					if (typeof m.onCall[i] == "function") {
						m.onCall[i](m,data.from,m.myinfo);
					}
				}
			}
		}
		
		/* add methods */
		this.addEvent = function(name,listeners) {
			m[name].push(listeners);
		}
		
		this.addProtocol = function(name,listeners) {
			m.protocols[name] = listeners;
		}
		
		this.addTool = function(tool) {
			m.addToolList.push(tool);
		}
		
		this.addUserMenu = function(usermenu) {
			m.addUserMenuList.push(usermenu);
		}
		
		this.addUserInfo = function(key,value) {
			if (!m.info || typeof m.info != "object") m.info = {};
			m.info[key] = value;
		}
		
		/* Sockets */
		this.checkServer = function(isForce) {
			m.printMessage("system",LANG.action.checkServer);
			$.ajax({
				type:"POST",
				url:m.getRootPath()+"/process/getServer",
				data:"&channel="+m.channel+"&force="+(isForce === true ? 'true' : 'false'),
				dataType:"json",
				success:function(result) {
					if (result.success == true) {
						m.server = result.connection;
						m.connect();
					} else {
						if (result.errorCode) {
							m.printMessage("error",LANG.errorcode["code"+result.errorCode]+"(ErrorCode : "+result.errorCode+")");
						}
					}
				},
				error:function() {
					
				}
			});
		}
		
		this.setReconnect = function(value) {
			m.reconnected = value;
		}
		
		this.connect = function(connection) {
			if (m.socket != null && !m.socket.connected) {
				m.socket.connect();
			} else {
				m.socket = io(m.server.domain,{reconnection:false,path:"/minitalk",transports:["websocket"],secure:m.server.domain.indexOf("https://") == 0});
				m.setEvent();
			}
		}
		
		this.reconnect = function(count) {
			if (m.reconnected == false) return;
			if (count == undefined) {
				count = 10;
			}
			
			if (m.reconnecting == true && count == 10) return;
			m.reconnecting = true;
			
			if (count == 0) {
				m.reconnecting = false;
				m.checkServer(true);
			} else {
				if (count == 10 || count <= 5) m.printMessage("system",LANG.action.waitReconnect.replace("{count}","<b>"+count+"</b>"));
				var time = 1000+(Math.ceil(Math.random()*1000)%500);
				
				setTimeout(m.reconnect,time,--count);
			}
		}
		
		this.disconnect = function(reconnect) {
			m.printMessage("error",LANG.error.disconnect);
			m.printUserCount();
			m.viewUserListSort = [];
			m.viewUserListStore = {};
			m.connected = false;
			if (m.socket != null && m.socket.connected == true) {
				if (reconnect === false) m.reconnected = false;
				m.socket.disconnect();
			}
			$(".userList").html("");
			$("input").attr("disabled",false);
			if (reconnect !== false) m.reconnect();
		}
		
		this.send = function(protocol,object) {
			if (protocol != "join" && (m.socket == null || m.connected == false)) {
				return;
			}
			
			m.socket.emit(protocol,object);
		}
		
		this.sendMyInfo = function() {
			m.send("join",{
				channel:m.server.channel,
				room:m.private != null ? m.private : m.channel,
				connection:m.server.connection,
				nickname:m.myinfo.nickname,
				nickcon:m.myinfo.nickcon,
				sns:m.myinfo.sns,
				info:m.myinfo.info,
				device:m.myinfo.device,
				status:m.myinfo.status,
				opperCode:m.opperCode,
				channelCode:m.channelCode,
				saveOpperCode:m.getStorage("opperCode"),
				uuid:m.getUserCode()
			});
		}
		
		this.setEvent = function() {
			this.socket.on("connecting",function() {
				m.printMessage("system",LANG.action.connecting);
			});
			
			this.socket.on("reconnect_fail",function() {
				m.printMessage("error",LANG.error.reconnectFail);
				m.reconnect();
			});
			
			this.socket.on("error",function() {
				m.printMessage("error",LANG.error.connectFail);
				m.reconnect();
			});
			
			this.socket.on("connect",function() {
				m.sendMyInfo();
			});
			
			this.socket.on("disconnect",function() {
				if (m.isPrivate == true && m.private.indexOf("#") == 0) self.close();
				else m.disconnect();
			});
			
			this.socket.on("connected",function(data) {
				m.connected = true;
				m.myinfo = data.myinfo;
				m.setStorage("myinfo",m.myinfo);
				if (data.channel.room.indexOf("#") == 0 && data.channel.room.split(":").length == 3) {
					var temp = data.channel.room.split(":");
					if (m.showChannelConnectMessage == true) m.printMessage("system",LANG.action.connected.replace("{channel}","<b><u>"+temp[1]+"</u></b>"));
				} else {
					if (m.showChannelConnectMessage == true) m.printMessage("system",LANG.action.connected.replace("{channel}","<b><u>"+data.channel.title+"</u></b>"));
				}
				m.printUserCount(data.usercount);
				
				if (m.viewUser == true && data.usercount < 200) {
					m.printMessage("system",LANG.action.loadingUserList);
					m.send("users",m.viewUserLimit);
				} else {
					m.viewUserListStatus = false;
				}
				
				if (typeof m.listeners.onConnecting == "function") {
					m.listeners.onConnecting(m,data.channel,data.usercount);
				}
				
				for (var i=0, loop=m.onConnecting.length;i<loop;i++) {
					if (typeof m.onConnecting[i] == "function") {
						m.onConnecting[i](m,data.channel,data.usercount);
					}
				}
				
				m.send("logs",{limit:m.logLimit,time:m.getStorage("lastLogTime")});
			});
			
			this.socket.on("broadcast",function(data) {
				if (data.type == "NOTICE") {
					m.showNotice(data.message,data.url);
				} else {
					if (m.isBroadcast === true) {
						if (data.url) {
							m.printMessage("broadcast",data.nickname+m.splitString+'<a href="'+data.url+'" target="_blank">'+data.message+'</a>');
						} else {
							m.printMessage("broadcast",data.nickname+m.splitString+data.message);
						}
					}
				}
			});
			
			this.socket.on("protocol",function(data) {
				if (data.protocol !== undefined && typeof m.protocols[data.protocol] == "function") {
					m.protocols[data.protocol](m,data.data);
				}
			});
			
			this.socket.on("users",function(data) {
				m.printUser(data.users);
				m.printUserCount(data.usercount);
			});
			
			this.socket.on("logs",function(data) {
				for (var i=0, loop=data.length;i<loop;i++) {
					m.setLog("chat",data[i]);
				}
			});
			
			this.socket.on("logend",function(data) {
				m.printLogMessage();
				$(".chatArea").append($("<div>").addClass("logEnd").append($("<div>").html("NEW TALK START")));
				m.initToolButton(true);
				m.autoScroll();
				
				$("input").attr("disabled",false);
				
				if (typeof m.listeners.onConnect == "function") {
					m.listeners.onConnect(m,m.channel,m.myinfo);
				}
				
				for (var i=0, loop=m.onConnect.length;i<loop;i++) {
					if (typeof m.onConnect[i] == "function") {
						m.onConnect[i](m,m.channel,m.myinfo);
					}
				}
			});
			
			this.socket.on("join",function(data) {
				m.joinUser(data);
			});
			
			this.socket.on("leave",function(data) {
				m.leaveUser(data);
			});
			
			this.socket.on("message",function(data) {
				m.setLog("chat",{user:data.user,message:data.message,time:data.time});
				m.printChatMessage("chat",data.user,data.message,data.time);
			});
			
			this.socket.on("mymessage",function(data) {
				m.setLog("chat",{user:data.user,message:data.message,time:data.time});
			});
			
			this.socket.on("whisper",function(data) {
				m.setLog("whisper",{user:data.user,to:data.to,message:data.message,time:data.time});
				m.printWhisperMessage("whisper",data.user,data.to,data.message,data.time);
			});
			
			this.socket.on("change",function(data) {
				m.changeUser(data.before,data.after);
			});
			
			this.socket.on("logged",function() {
				m.printMessage("system",LANG.action.logged);
			});
			
			this.socket.on("userinfo",function(userinfo) {
				m.printUserMenu(userinfo);
			});
			
			this.socket.on("showip",function(data) {
				m.printMessage("system",LANG.action.showip.replace("{nickname}","<b><u>"+data.nickname+"</u></b>").replace("{ip}","<b><u>"+data.ip+"</u></b>"));
			});
			
			this.socket.on("banip",function(data) {
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
				m.printMessage("system",LANG.action.banip.replace("{from}","<b><u>"+data.from.nickname+"</u></b>").replace("{to}","<b><u>"+data.to.nickname+"</u></b>"));
			});
			
			this.socket.on("opper",function(data) {
				m.printMessage("system",LANG.action.opper.replace("{from}","<b><u>"+data.from.nickname+"</u></b>").replace("{to}","<b><u>"+data.to.nickname+"</u></b>"));
			});
			
			this.socket.on("deopper",function(data) {
				m.printMessage("system",LANG.action.deopper.replace("{from}","<b><u>"+data.from.nickname+"</u></b>").replace("{to}","<b><u>"+data.to.nickname+"</u></b>"));
			});
			
			this.socket.on("oppercode",function(opperCode) {
				m.setStorage("opperCode",opperCode);
			});
			
			this.socket.on("call",function(data) {
				m.doCall(data);
			});
			
			this.socket.on("mychannel",function(data) {
				m.openPrivateChannel("create",data);
			});
			
			this.socket.on("invite",function(data) {
				m.doInvite(data);
			});
			
			this.socket.on("reject",function(data) {
				if (data.from.nickname == m.myinfo.nickname) {
					m.printMessage("system",LANG.action.inviteReject.replace("{nickname}","<b><u>"+data.to.nickname+"</b></u>"));
				} else {
					m.printMessage("system",LANG.action.inviteRejected.replace("{nickname}","<b><u>"+data.from.nickname+"</b></u>"));
				}
			});
			
			this.socket.on("banmsg",function(data) {
				if (data.to.nickname == m.myinfo.nickname) {
					m.printMessage("system",LANG.action.banedmsg.replace("{from}","<b><u>"+data.from.nickname+"</b></u>"));
					var baned = m.getStorage("baned") == null || typeof m.getStorage("baned") != "object" ? {} : m.getStorage("baned");
					baned[m.channel] = new Date().getTime() + 60000;
					m.setStorage("baned",baned);
				} else {
					m.printMessage("system",LANG.action.banmsg.replace("{from}","<b><u>"+data.from.nickname+"</b></u>").replace("{to}","<b><u>"+data.to.nickname+"</b></u>"));
				}
			});
			
			this.socket.on("clearlog",function(data) {
				$(".chatArea").html("");
				m.setStorage("logList",[]);
				m.printMessage("system",LANG.action.clearLog.replace("{from}","<b><u>"+data.from.nickname+"</b></u>"));
			});
			
			this.socket.on("errorcode",function(code) {
				m.printMessage("error",LANG.errorcode["code"+code]+"(ErrorCode : "+code+")");
				
				if (code == 304 || code == 305) {
					setTimeout(m.sendMyInfo,5000);
				}
				
				if (code == 202 || code == 203 || code == 204 || code == 315 || code == 402 || code == 909) {
					m.reconnected = false;
				}
			});
		}
	};
}