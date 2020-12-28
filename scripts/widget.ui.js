/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 UI 관련 이벤트를 처리한다.
 * 
 * @file /scripts/widget.ui.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 7.
 */
Minitalk.ui = {
	tools:[],
	resizeTimer:null,
	isFixedScroll:false,
	/**
	 * 미니톡 채팅위젯 UI 를 초기화한다.
	 */
	init:function() {
		var $frame = $("div[data-role=frame]");
		
		/**
		 * 알림영역을 추가한다.
		 */
		$frame.append('<div data-role="notifications"></div>');
		
		/**
		 * 필수 audio 객체를 추가한다.
		 */
		$frame.append('<audio data-type="call"><source src="' + Minitalk.getUrl() + '/sounds/call.mp3" type="audio/mpeg"></audio>');
		$frame.append('<audio data-type="message"><source src="' + Minitalk.getUrl() + '/sounds/message.mp3" type="audio/mpeg"></audio>');
		$frame.append('<audio data-type="query"><source src="' + Minitalk.getUrl() + '/sounds/query.mp3" type="audio/mpeg"></audio>');
		
		/**
		 * UI 초기화함수 실행
		 */
		Minitalk.ui.initEvents();
		Minitalk.ui.initFrame();
		Minitalk.ui.disable();
	},
	/**
	 * UI DOM 객체의 이벤트를 정의한다.
	 */
	initEvents:function() {
		/**
		 * 헤더 버튼 이벤트 추가
		 */
		var $header = $("header");
		$("button[data-action]",$header).on("click",function(e) {
			var $button = $(this);
			var action = $button.attr("data-action");
			
			if (action == "users") {
				Minitalk.ui.toggleUsers();
			}
			
			if (action == "configs") {
				Minitalk.ui.toggleConfigs();
			}
			
			e.stopImmediatePropagation();
		});
		
		/**
		 * 채팅입력폼 이벤트 추가
		 */
		$("div[data-role=input] > input").on("keypress",function(e) {
			if (e.keyCode == 13) {
				Minitalk.ui.sendMessage($(this).val());
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		});
		
		/**
		 * 메시지 전송버튼 이벤트 추가
		 */
		$("div[data-role=input] > button").on("click",function() {
			Minitalk.ui.sendMessage($("div[data-role=input] > input").val());
		});

		/**
		 * 리사이즈 이벤트 추가
		 */
		$(window).on("resize",function() {
			if (Minitalk.ui.resizeTimer != null) {
				clearTimeout(Minitalk.ui.resizeTimer);
				Minitalk.ui.resizeTimer = null;
			}
			
			Minitalk.ui.resizeTimer = setTimeout(Minitalk.ui.initFrame,200);
		});
		
		/**
		 * 화면전환 이벤트 추가
		 */
		$(window).on("orientationchange",function() {
			if (Minitalk.ui.resizeTimer != null) {
				clearTimeout(Minitalk.ui.resizeTimer);
				Minitalk.ui.resizeTimer = null;
			}
			
			Minitalk.ui.resizeTimer = setTimeout(Minitalk.ui.initFrame,200);
		});
		
		/**
		 * 클릭이벤트를 이용하여 특수한 DOM 객체를 초기화한다.
		 */
		$(document).on("click",function(e) {
			Minitalk.ui.initSounds();
			Minitalk.ui.resetToggle();
		});
		
		/**
		 * Keypress 이벤트처리
		 */
		$(document).on("keydown",function(e) {
			if (e.keyCode == 27) {
				Minitalk.fireEvent("esc");
			}
		});
		
		/**
		 * ESC 기본이벤트 처리
		 */
		$(document).on("esc",function() {
			Minitalk.ui.resetToggle();
		});
		
		/**
		 * 웹폰트 로드가 완료되면, UI 를 재정의한다.
		 */
		document.fonts.ready.then(function () {
			Minitalk.ui.initFrame();
		});
	},
	/**
	 * 브라우저 사이즈가 변경되거나, UI가 최초표시될 때 UI 요소를 초기화한다.
	 */
	initFrame:function() {
		if (Minitalk.type == "auto") {
			if ($(document).height() >= $(document).width()) {
				var type = "vertical";
			} else {
				var type = "horizontal";
			}
		} else {
			var type = Minitalk.type;
		}
		
		var $frame = $("div[data-role=frame]");
		$frame.attr("data-type",type);
		
		var $header = $("header",$frame);
		$header.attr("data-type",type);
		
		var $main = $("main");
		$main.attr("data-type",type);
		
		var $footer = $("footer");
		$footer.attr("data-type",type);
		
		Minitalk.ui.initTools();
		Minitalk.ui.autoScroll();
	},
	/**
	 * 변경된 브라우저의 보안규칙에 따라, 사운드파일을 초기화한다.
	 */
	initSounds:function() {
		var $audios = $("audio");
		$audios.each(function() {
			var $audio = $(this);
			if ($audio.data("loaded") === true) return;
			
			var audio = $(this).get(0);
			audio.muted = true;
			var promise = audio.play();
			if (promise !== undefined) {
				promise.then(function() {
					$audio.data("loaded",true);
				}).catch(function(e) {
				});
			}
		});
	},
	/**
	 * 툴바를 초기화한다.
	 */
	initTools:function() {
		var $footer = $("footer");
		var $tools = $("ul[data-role=tools]",$footer);
		var $lists = $("ul[data-role=lists]",$footer);
		$tools.attr("data-type",Minitalk.toolType);
		$tools.empty();
		$lists.empty();
		
		var $more = $("<li>").addClass("more");
		var $button = $("<button>").attr("type","button").attr("data-tool","more");
		$button.append($("<i>").addClass("icon"));
		$button.append($("<span>").html(Minitalk.getText("tool/more")));
		$button.on("click",function(e) {
			Minitalk.ui.toggleTools();
			e.stopImmediatePropagation();
		});
		$more.append($button);
		$tools.append($more);
		
		var limit = $tools.width();
		var limiter = $more.outerWidth(true);
		var separator = true;
		
		for (var index in Minitalk.tools) {
			var tool = Minitalk.tools[index];
			if (typeof tool == "string") {
				/**
				 * 권한에 따라 툴바 버튼을 추가한다.
				 */
				if (Minitalk.socket.getPermission("font") !== true && $.inArray(tool,["bold","italic","underline","color"]) > -1) continue;
				
				/**
				 * 구분자일 경우
				 */
				if (tool == "-") {
					/**
					 * 툴바 처음이거나, 현 구분자 직전에 구분자가 추가된 경우 추가로 구분자를 추가하지 않는다.
					 */
					if (separator === true) continue;
					separator = true;
					
					var $tool = $("<li>");
					$tool.addClass("separator");
					$tool.append($("<i>"));
				} else {
					separator = false;
					
					/**
					 * 기본툴버튼을 추가한다.
					 */
					if ($.inArray(tool,["bold","underline","italic","color","emoticon","mute","push","scroll","clear"]) === -1) continue;
					
					var $tool = $("<li>");
					var $button = $("<button>").attr("type","button").attr("data-tool",tool);
					
					$button.append($("<i>").addClass("icon"));
					$button.append($("<span>").html(Minitalk.getText("tool/" + tool)));
					$button.data("tool",tool);
					$button.on("click",function(e) {
						Minitalk.ui.activeTool($(this),e);
					});
					$tool.append($button);
				}
				
				$tools.append($tool);
			} else {
				/**
				 * 툴바가 보여야하는 조건함수가 있는 경우, 조건에 만족하지 못하면 추가하지 않는다.
				 */
				if (typeof tool.visible == "function") {
					if (tool.visible(Minitalk,Minitalk.user.me) === false) continue;
				}
				
				separator = false;
				
				/**
				 * 사용자정의 툴버튼을 추가한다.
				 */
				var $tool = $("<li>");
				var $button = $("<button>").attr("type","button").attr("data-tool",tool.name);
				
				var $icon = $("<i>");
				if (tool.icon) $icon.css("backgroundImage","url(" + tool.icon + ")");
				if (tool.iconClass) $icon.addClass(tool.iconClass);
				$button.append($icon);
				
				$button.append($("<span>").html(tool.text));
				$button.data("tool",tool);
				$button.on("click",function(e) {
					Minitalk.ui.activeTool($(this),e);
				});
				$tool.append($button);
				$tools.append($tool);
			}
			
			limiter+= $tool.outerWidth(true);
		}
		
		/**
		 * 툴바영역을 벗어난 툴버튼을 툴 목록으로 이동시킨다.
		 */
		if (limit < limiter) {
			var current = 0;
			var split = 0;
			
			$("li",$tools).each(function(index) {
				if (current + $(this).outerWidth(true) > limit) {
					return false;
				}
				
				current+= $(this).outerWidth(true);
				split++;
			});
			
			for (var i=loop=$("li",$tools).length - 1;i>=Math.max(1,split);i--) {
				var $tool = $("li",$tools).eq(i).clone(true);
				
				$lists.prepend($tool);
				$("li",$tools).eq(i).remove();
			}
			
			if ($("li:last",$tools).hasClass("separator") === true) {
				$("li:last",$tools).remove();
			}
			
			if ($("li:first",$lists).hasClass("separator") === true) {
				$("li:first",$lists).remove();
			}
			
			if ($("li",$lists).length === 0) {
				$more.hide();
			}
		} else {
			$more.hide();
		}
		
		/**
		 * 설정에 따라 버튼활성화 여부를 지정한다.
		 */
		if (Minitalk.setting("mute") == true) {
			$("footer > ul > li > button[data-tool=mute]").addClass("on");
		}
		
		if (Minitalk.setting("push") == true) {
			$("footer > ul > li > button[data-tool=push]").addClass("on");
		}
	},
	/**
	 * 메시지 폰트설정권한이 있는 경우, 현재 저장된 폰트설정에 따라 툴바 및 입력폼의 스타일을 변경한다.
	 */
	initFonts:function() {
		/**
		 * 서버에 접속하기전이라면, 폰트 업데이트를 중단한다.
		 */
		if (Minitalk.socket.isConnected() === false) return false;
		
		/**
		 * 폰트설정권한이 없는 경우 저장된 값을 초기화한다.
		 */
		if (Minitalk.socket.getPermission("font") === false) {
			Minitalk.fonts("bold",false);
			Minitalk.fonts("italic",false);
			Minitalk.fonts("underline",false);
			Minitalk.fonts("color",null);
		}
		
		var fonts = Minitalk.fonts();
		if (fonts === null) return;
		
		/**
		 * 입력폼 스타일적용
		 */
		var $input = $("div[data-role=input] > input");
		$input.css("fontWeight",fonts.bold === true ? "bold" : "normal");
		$input.css("fontStyle",fonts.italic === true ? "italic" : "normal");
		$input.css("textDecoration",fonts.underline === true ? "underline" : "none");
		$input.css("color",fonts.color === null ? null : fonts.color);
		
		/**
		 * 툴바 스타일적용
		 */
		var $footer = $("footer");
		var $tools = $("ul[data-role]",$footer);
		$("button[data-tool=bold]",$tools).removeClass("on");
		$("button[data-tool=italic]",$tools).removeClass("on");
		$("button[data-tool=underline]",$tools).removeClass("on");
		
		if (fonts.bold === true) $("button[data-tool=bold]",$tools).addClass("on");
		if (fonts.italic === true) $("button[data-tool=italic]",$tools).addClass("on");
		if (fonts.underline === true) $("button[data-tool=underline]",$tools).addClass("on");
	},
	/**
	 * 미니톡 위젯 UI를 활성화한다.
	 *
	 * @param boolean inputmode 메시지 입력창만 활성화할지 여부 (기본값 : false)
	 */
	enable:function(inputmode) {
		var inputmode = inputmode === true;
		
		if (inputmode === true) {
			$("div[data-role=input] > button").enable();
		} else {
			var $frame = $("div[data-role=frame]");
			$("div[data-role=disable]",$frame).remove();
		}
	},
	/**
	 * 미니톡 위젯 UI를 비활성화한다.
	 *
	 * @param boolean inputmode 메시지 입력창만 비활성화할지 여부 (기본값 : false)
	 */
	disable:function(inputmode) {
		var inputmode = inputmode === true;
		
		if (inputmode === true) {
			$("div[data-role=input] > button").disable();
		} else {
			var $frame = $("div[data-role=frame]");
			if ($("div[data-role=disable]",$frame).length > 0) return;
			
			$frame.append($("<div>").attr("data-role","disable"));
		}
	},
	/**
	 * 툴버튼 실행
	 *
	 * @param object $tool 툴버튼의 DOM 객체
	 * @param event e 이벤트객체
	 */
	activeTool:function($tool,e) {
		var tool = $tool.data("tool");
		if (Minitalk.fireEvent("beforeActiveTool",[tool,$tool,e]) === false) return;
		
		if (typeof tool == "string") {
			switch (tool) {
				case "bold" :
					if (Minitalk.fonts("bold") === true) {
						Minitalk.fonts("bold",false);
					} else {
						Minitalk.fonts("bold",true);
					}
					
					Minitalk.ui.initFonts();
					break;
					
				case "underline" :
					if (Minitalk.fonts("underline") === true) {
						Minitalk.fonts("underline",false);
					} else {
						Minitalk.fonts("underline",true);
					}
					
					Minitalk.ui.initFonts();
					break;
					
				case "italic" :
					if (Minitalk.fonts("italic") === true) {
						Minitalk.fonts("italic",false);
					} else {
						Minitalk.fonts("italic",true);
					}
					
					Minitalk.ui.initFonts();
					break;
					
				case "color" :
					var colors = ["#7F7F7F","#880015","#ED1C24","#FF7F27","#FFF200","#22B14C","#00A2E8","#3F48CC","#A349A4","#000000","#C3C3C3","#B97A57","#FFAEC9","#FFC90E","#EFE4B0","#B5E61D","#99D9EA","#7092BE","#C8BFE7"];
					
					var html = [];
					html.push('<ul>');
					html.push('<li><button type="button" data-color="reset"></button></li>');
					for (var i=0, loop=colors.length;i<loop;i++) {
						html.push('<li><button type="button" data-color="' + colors[i] + '" style="background:' + colors[i] + ';"></button></li>');
					}
					html.push('</ul>');
					html = html.join("");
					Minitalk.ui.createToolLayer("color",html,function($dom) {
						$("button[data-color]",$dom).on("click",function(e) {
							var $button = $(this);
							var color = $button.attr("data-color");
							
							if (color == "reset") {
								Minitalk.fonts("color",null);
							} else {
								Minitalk.fonts("color",color);
							}
							
							Minitalk.ui.initFonts();
							$("div[data-role=input] > input").focus();
							
							Minitalk.ui.closeToolLayer("color");
						});
					});
					break;
					
				case "emoticon" :
					var html = [
						'<ul data-role="categories">',
							'<li><button type="button" data-action="prev"></button></li>',
							'<li data-role="items"></li>',
							'<li><button type="button" data-action="next"></button></li>',
						'</ul>',
						'<div data-role="lists"></div>'
					];
					
					html = html.join("");
					Minitalk.ui.createToolLayer("emoticon",html,function($dom) {
						$.send(Minitalk.getProcessUrl("getEmoticons"),function(result) {
							var $categories = $("ul[data-role=categories] > li[data-role=items]",$dom);
							
							$("button[data-action]",$("ul[data-role=categories]")).on("mousedown",function() {
								var direction = $(this).attr("data-action");
								
								var scroll = $categories.prop("scrollWidth") - $categories.width();
								var timer = scroll * 5;
								if (direction == "prev") {
									$categories.animate({scrollLeft:0},timer);
								} else {
									$categories.animate({scrollLeft:scroll},timer);
								}
							});
							
							$("button[data-action]",$("ul[data-role=categories]")).on("mouseup",function() {
								$categories.stop();
							});
							
							var opened = null;
							if (result.success == true && result.emoticons.length > 0) {
								for (var i=0, loop=result.emoticons.length;i<loop;i++) {
									var emoticon = result.emoticons[i];
									var $category = $("<button>").attr("data-category",emoticon.category);
									$category.data("width",emoticon.width);
									$category.data("height",emoticon.height);
									$category.append($("<i>").css("backgroundImage","url("+Minitalk.getUrl()+"/emoticons/" + emoticon.category + "/" + emoticon.icon + ")"));
									$category.append($("<span>").html(emoticon.title));
									
									$category.on("click",function() {
										var $category = $(this);
										var $lists = $("div[data-role=lists]",$dom);
										var category = $(this).attr("data-category");
										var $item = $("ul[data-category="+category+"]",$lists);
										
										$("button",$categories).removeClass("on");
										$category.addClass("on");
										
										if ($item.length == 1) {
											$("ul[data-category]",$lists).hide();
											$("ul[data-category="+category+"]",$lists).show();
										} else {
											$.send(Minitalk.getProcessUrl("getEmoticon"),{category:category},function(result) {
												if (result.success == true) {
													var $items = $("<ul>").attr("data-category",category);
													for (var i=0, loop=result.items.length;i<loop;i++) {
														var item = result.items[i];
														var $item = $("<button>");
														var path = item.split("/");
														
														$item.attr("data-code","#" + path[0] + "/" + path[1]);
														$item.css("backgroundImage","url(" + Minitalk.getUrl()+"/emoticons/" + path[0] + "/items/" + path[1] + ")");
														$item.css("width",$category.data("width") + "px");
														$item.css("height",$category.data("height") + "px");
														
														$item.on("click",function() {
															var code = $(this).attr("data-code");
															var $input = $("div[data-role=input] > input");
															
															$input.focus();
															$input.val($input.val() + "[" + code + "]");
														});
														
														$items.append($("<li>").append($item));
													}
													$lists.append($items);
													
													$("ul[data-category]",$lists).hide();
													$("ul[data-category="+category+"]",$lists).show();
												}
											});
										}
									});
									$categories.append($category);
									
									if (opened == null) opened = result.emoticons[i].category;
								}
								
								if (opened != null && $("button[data-category="+opened+"]",$dom).length == 1) {
									$("button[data-category="+opened+"]",$dom).triggerHandler("click");
								}
							}
						});
					});
					break;
					
				case "mute" :
					if (Minitalk.setting("mute") == true) {
						Minitalk.setting("mute",false);
						Minitalk.ui.printMessage("system",Minitalk.getText("action/play_sound"));
						$tool.removeClass("on");
					} else {
						Minitalk.setting("mute",true);
						Minitalk.ui.printMessage("system",Minitalk.getText("action/mute_sound"));
						$tool.addClass("on");
					}
					break;
					
				case "push" :
					if (Minitalk.setting("push") == false) {
						if (window.Notification !== undefined) {
							if (Notification.permission == "granted") {
								Minitalk.setting("push",true);
								Minitalk.ui.printMessage("system",Minitalk.getText("action/use_push"));
								$tool.addClass("on");
							} else if (Notification.permission != "granted") {
								Notification.requestPermission(function(permission) {
									if (Notification.permission !== undefined) {
										Notification.permission = permission;
									}
									
									if (permission == "granted") {
										Minitalk.setting("push",true);
										Minitalk.ui.printMessage("system",Minitalk.getText("action/use_push"));
										$tool.addClass("on");
									} else {
										Minitalk.ui.printMessage("error",Minitalk.getErrorText("DISABLED_PUSH"));
									}
								});
							}
						} else {
							Minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_SUPPORTED_BROWSER"));
						}
					} else {
						Minitalk.setting("push",false);
						$tool.removeClass("on");
						Minitalk.ui.printMessage("system",Minitalk.getText("action/stop_push"));
					}
					break;
					
				case "scroll" :
					if (Minitalk.ui.isFixedScroll == true) {
						Minitalk.ui.printMessage("system",Minitalk.getText("action/use_auto_scroll"));
						Minitalk.ui.isFixedScroll = false;
						Minitalk.ui.autoScroll();
						$tool.removeClass("on");
					} else {
						Minitalk.ui.printMessage("system",Minitalk.getText("action/use_fixed_scroll"));
						Minitalk.ui.isFixedScroll = true;
						$tool.addClass("on");
					}
					break;
					
				case "clear" :
					if (Minitalk.user.me.opper == "ADMIN" && Minitalk.logCount > 0 && confirm(Minitalk.getText("action/clear_log_confirm")) == true) {
						Minitalk.socket.send("clearlog",null);
					} else {
						$("section[data-role=chat]").html("");
						Minitalk.ui.printMessage("system",Minitalk.getText("action/clear_log_self"));
						Minitalk.storage("logList",[]);
					}
					break;
			}
		} else {
			alert(typeof tool.handler);
			if (typeof tool.handler == "function") {
				tool.handler(Minitalk,e);
			}
		}
		$("footer").removeClass("open");
		
		Minitalk.fireEvent("afterActiveTool",[tool,$tool,e]);
		
		e.stopImmediatePropagation();
	},
	/**
	 * 툴버튼목록을 토글한다.
	 */
	toggleTools:function() {
		var $footer = $("footer");
		$footer.toggleClass("open");
		
		if ($("footer > div[data-role=layers] > div[data-tool]").length > 0) {
			$("footer > div[data-role=layers] > div[data-tool]").remove();
		}
	},
	addTool:function(tool) {
		Minitalk.addToolList.push(tool);
	},
	/**
	 * 시간을 정해진 형태로 변환하여 가져온다.
	 *
	 * @param int timestamp 유닉스타임스탬프
	 * @param string type 포맷
	 */
	getTime:function(timestamp,format) {
		var time = moment(timestamp).locale(Minitalk.language);
		return time.format(format);
	},
	/**
	 * 채팅화면상에 메시지를 출력한다.
	 *
	 * @param string type 메시지종류
	 * @param string message 메시지
	 */
	printMessage:function(type,message) {
		var item = $("<div>").addClass(type);
		item.html(message);
		$("section[data-role=chat]").append(item);
		Minitalk.ui.autoScroll();
	},
	/**
	 * 이전대화기록을 출력한다.
	 */
	printLogMessage:function() {
		var logList = Minitalk.log();
		for (var i=(logList.length > Minitalk.logCount ? logList.length - Minitalk.logCount : 0), loop=logList.length;i<loop;i++) {
			if (logList[i].type == "chat") {
				Minitalk.ui.printChatMessage("log",logList[i].log.user,logList[i].log.message,logList[i].log.time);
			} else {
				Minitalk.ui.printWhisperMessage("log",logList[i].log.user,logList[i].log.to,logList[i].log.message,logList[i].log.time);
			}
		}
	},
	/**
	 * 채팅메시지를 출력한다.
	 *
	 * @param string type 메시지타입
	 * @param object sender 메시지를 전송한 유저
	 * @param object message 메시지내용
	 * @param int time 메시지를 전송시각
	 */
	printChatMessage:function(type,sender,message,time) {
		var user = Minitalk.user.getTag(sender,false);
		var message = Minitalk.ui.decodeMessage(message,true);
		
		if (type == "chat" && sender.nickname != Minitalk.user.me.nickname) {
			if (Minitalk.fireEvent("beforeMessage",[sender,message,time]) === false) return;
		}
		
		var item = $("<div>").addClass(type);
		if (sender.nickname == Minitalk.user.me.nickname) item.addClass("mymessage");
		item.append(user);
		
		var messageObject = $("<span>").addClass("body").html(Minitalk.splitString+message);
		if (time) messageObject.attr("title",Minitalk.ui.getTime(time,"YYYY.MM.DD HH:mm:ss"));
		item.append(messageObject);
		if (time) item.append($("<span>").addClass("time").html(Minitalk.ui.getTime(time,Minitalk.dateFormat)));
		
		$("section[data-role=chat]").append(item);
		Minitalk.ui.autoScroll();
		
		if (type == "chat" && sender.nickname != Minitalk.user.me.nickname) {
			Minitalk.fireEvent("message",[sender,message,time]);
		}
	},
	/**
	 * 귓속말 메시지를 출력한다.
	 *
	 * @param string type 메시지타입
	 * @param object sender 메시지를 전송한 유저
	 * @param object to 메시지를 수신한 유저
	 * @param object message 메시지내용
	 * @param int time 메시지를 전송시각
	 */
	printWhisperMessage:function(type,sender,to,message,time) {
		if (sender.nickname == Minitalk.user.me.nickname) {
			var header = $("<span>").html(Minitalk.getText("text/whisper_to").replace("{NICKNAME}",'<span class="whisperTag"></span>'));
			var user = Minitalk.user.getTag(to,false);
		} else {
			var header = $("<span>").html(Minitalk.getText("text/whisper_from").replace("{NICKNAME}",'<span class="whisperTag"></span>'));
			var user = Minitalk.user.getTag(sender,false);
		}
		
		var item = $("<div>").addClass(type);
		item.append(header);
		
		var message = Minitalk.ui.decodeMessage(message,true);
		
		if (type == "whisper" && sender.nickname != Minitalk.user.me.nickname) {
			if (Minitalk.fireEvent("beforeWhisper",[sender,message,time]) === false) return;
		}
		
		$(item.find(".whisperTag")).append(user);
		
		var messageObject = $("<span>").addClass("body").html(Minitalk.splitString+message);
		if (time) messageObject.attr("title",Minitalk.ui.getTime(time,"YYYY.MM.DD HH:mm:ss"));
		item.append(messageObject);
		if (time) item.append($("<span>").addClass("time").html(Minitalk.ui.getTime(time,Minitalk.dateFormat)));
		
		$("section[data-role=chat]").append(item);
		Minitalk.ui.autoScroll();
		
		if (type == "whisper" && sender.nickname != Minitalk.user.me.nickname) {
			Minitalk.fireEvent("whisper",[sender,message,time]);
		}
	},
	printError:function(code,callback) {
		Minitalk.socket.reconnectable = false;
	
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(Minitalk.getText("error/"+code)));
		
		if (code == "NOT_FOUND_ONLINE_SERVER") {
			var $button = $("<button>").html(Minitalk.getText("action/reconnect"));
			$button.on("click",function() {
				$("div[data-role=error]").remove();
				Minitalk.socket.connect();
			});
		} else {
			var $button = $("<button>").html(Minitalk.getText("button/confirm"));
			
			if (typeof callback == "function") {
				$button.on("click",function() {
					callback();
				});
			} else if (typeof callback == "undefined") {
				$button.on("click",function() {
					$("div[data-role=error]").remove();
				});
			} else {
				$errorbox.addClass("textonly");
				if (typeof callback == "string") {
					$("p",$errorbox).append("<br>" + callback);
				}
				$button = null;
			}
		}
		
		if ($button !== null) $errorbox.append($button);
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
	},
	/**
	 * 에러코드를 출력한다.
	 *
	 * @param string code 에러코드
	 */
	printErrorCode:function(code) {
		/**
		 * 재접속 시도를 하지 않는 에러인 경우 에러확인창으로 에러를 표시하고,
		 * 서버 접속중이 아닌경우에는 알림메시지창으로 에러를 표시한다.
		 */
		var message = Minitalk.getText("error/code/"+code) + " (code : " + code + ")";
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(message));
		$errorbox.addClass("textonly");
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
	},
	/**
	 * 채팅영역의 스크롤을 자동으로 최하단으로 내린다.
	 */
	autoScroll:function() {
		if (Minitalk.ui.isFixedScroll == true) return;
		$("section[data-role=chat]").scrollTop($("section[data-role=chat]").prop("scrollHeight"));
	},
	/**
	 * 채널명을 표시한다.
	 *
	 * @param string title
	 */
	printTitle:function(title) {
		$("h1").html(title);
	},
	/**
	 * 환경설정창을 불러온다.
	 */
	toggleConfigs:function() {
		var $frame = $("div[data-role=frame]");
		
		/**
		 * 설정레이어 객체를 추가한다.
		 */
		var $configs = $("<div>").attr("data-role","configs");
		$frame.append($configs);
		$configs.append('<div data-config="nickname"><input type="text" placeholder="' + Minitalk.getText("text/nickname") + '"></div>');
		$configs.append('<div data-config="status"><button type="button"><i class="icon"></i><span></span><i class="arrow"></i></button><ul></ul></div>');
		$configs.append('<button type="button">' + Minitalk.getText("button/confirm") + '</button>');
		
		$configs.on("click",function(e) {
			e.stopImmediatePropagation();
		});
		
		var $nickname = $("div[data-config=nickname] > input",$configs);
		$nickname.val(Minitalk.user.me.nickname);
		if (Minitalk.socket.getPermission("nickname") == true) $nickname.enable();
		else $nickname.disable();
		
		var $status = $("div[data-config=status]",$configs);
		$status.data("status",Minitalk.user.me.status);
		$("button > i.icon",$status).css("backgroundImage","url("+Minitalk.statusIconPath+"/"+Minitalk.user.me.device+"/"+Minitalk.user.me.status+".png)");
		$("button > span",$status).html(Minitalk.getText("status/"+Minitalk.user.me.status));
		$("button",$status).off("click");
		$("button",$status).on("click",function() {
			$status.toggleClass("on");
		});
		$status.removeClass("on");
		
		$("ul",$status).empty();
		for (var status in Minitalk.getText("status")) {
			if (status == "offline") continue;
			var $item = $("<li>");
			$item.data("status",status);
			var $icon = $("<i>").addClass("icon").css("backgroundImage","url("+Minitalk.statusIconPath+"/"+Minitalk.device+"/"+status+".png)");
			$item.append($icon);
			
			var $text = $("<span>");
			$text.html(Minitalk.getText("status/"+status));
			$item.append($text);
			$item.on("click",function() {
				$("button > i.icon",$status).css("backgroundImage","url("+Minitalk.statusIconPath+"/"+Minitalk.device+"/"+$(this).data("status")+".png)");
				$("button > span",$status).html(Minitalk.getText("status/"+$(this).data("status")));
				$status.data("status",$(this).data("status"));
				$status.removeClass("on");
			});
			$("ul",$status).append($item);
		}
		
		$("> button",$configs).on("click",function() {
			Minitalk.socket.send("change",{nickname:$nickname.val(),status:$status.data("status")});
			$configs.remove();
		});
	},
	/**
	 * 접속자수를 출력한다.
	 *
	 * @param int count 접속자수
	 */
	printUserCount:function(count) {
		var $count = $("label[data-role=count]");
		if (count == 0) {
			$count.empty();
		} else {
			$count.html(Minitalk.getText("text/unit").replace("{COUNT}",count));
		}
		
		if (Minitalk.user.isAutoHideUsers == false && count > 200 && Minitalk.user.isVisibleUsers == true) {
			Minitalk.user.isAutoHideUsers = true;
			Minitalk.ui.printMessage("system",Minitalk.getText("action/autoHideUsers"));
			Minitalk.ui.toggleUsers(false);
		}
	},
	/**
	 * 접속자목록을 토글한다.
	 *
	 * @param boolean is_visible 보임여부
	 */
	toggleUsers:function(is_visible) {
		var $main = $("main");
		if (is_visible === undefined) {
			var is_visible = $main.hasClass("users") == true ? false : true;
		}
		
		var $header = $("header");
		var $button = $("button[data-action=users]",$header);
		
		$("aside[data-role=users]").empty();
		if (is_visible == true) {
			Minitalk.socket.send("users",Minitalk.viewUserLimit);
			$main.addClass("users");
			$button.addClass("on");
			
			Minitalk.user.isVisibleUsers = true;
		} else {
			$main.removeClass("users");
			$button.removeClass("on");
			
			Minitalk.user.usersSort = [];
			Minitalk.user.users = {};
			
			Minitalk.user.isVisibleUsers = false;
		}
		
		Minitalk.ui.autoScroll();
	},
	/**
	 * 접속자목록을 출력한다.
	 */
	printUser:function(users) {
		var sortUserCode = {"ADMIN":"#","POWERUSER":"*","MEMBER":"+","NICKGUEST":"-"};
		
		Minitalk.user.usersSort = [];
		Minitalk.user.users = {};
		for (var i=0, loop=users.length;i<loop;i++) {
			Minitalk.user.usersSort.push("["+(users[i].opper ? sortUserCode[users[i].opper] : "")+users[i].nickname+"]");
			Minitalk.user.users[users[i].nickname] = users[i];
		}
		Minitalk.user.usersSort.sort();
		
		$("aside[data-role=users]").html("");
		$("aside[data-role=users]").append(Minitalk.user.getTag(Minitalk.user.me,true));
		
		for (var i=0, loop=Minitalk.user.usersSort.length;i<loop;i++) {
			var nickname = Minitalk.user.usersSort[i].replace(/^\[(#|\*|\+|\-)?(.*?)\]$/,"$2");
			var user = Minitalk.user.getTag(Minitalk.user.users[nickname],true);
			
			if (Minitalk.user.users[nickname].nickname == Minitalk.user.me.nickname) {
				user.css("display","none");
			}
			
			$("aside[data-role=users]").append(user);
		}
	},
	/**
	 * 메시지를 전송한다.
	 *
	 * @param string message 메시지
	 */
	sendMessage:function(message) {
		var message = $.trim(message);
		if (message.length == 0) return;
		
		if (Minitalk.socket.getPermission("chat") == false) {
			Minitalk.ui.printMessage("error",Minitalk.getErrorText("NOT_ALLOWED_CHATTING"));
			return;
		}
		
		/**
		 * 슬래시(/) 명령어 처리
		 */
		if (message.indexOf("/") == 0) {
			var commands = message.substr(1).split(" ");
			var command = commands.shift().toLowerCase();
			
			switch (command) {
				/**
				 * 귓속말
				 */
				case "w" :
					var nickname = commands.shift();
					var message = $.trim(commands.join(" "));
					if (message.length == 0) return;
					
					/**
					 * 메시지 전송전 이벤트 처리
					 */
					
					if (Minitalk.fireEvent("beforeSendWhisper",[nickname,message,Minitalk.user.me]) === false) return;
					
					/**
					 * 서버로 메시지를 전송한다.
					 */
					Minitalk.socket.send("whisper",{nickname:nickname,message:message});
					
					/**
					 * 메시지 전송후 이벤트 처리
					 */
					Minitalk.fireEvent("sendWhisper",[nickname,message,Minitalk.user.me])
					
					/**
					 * 직전의 귓속말 보낸 사람의 닉네임을 유지한다.
					 */
					Minitalk.ui.setInputVal("/w " + nickname + " ");
					break;
				
				/**
				 * 호출
				 */
				case "call" :
					var nickname = commands.shift();
					
					/**
					 * 서버로 호출메시지를 전송한다.
					 */
					Minitalk.socket.sendCall(nickname);
					Minitalk.ui.setInputVal("");
					break;
				
				/**
				 * 채널관리자 로그인
				 */
				case "login" :
					var password = commands.shift();
					Minitalk.ui.login(password);
					Minitalk.ui.setInputVal("");
					break;
					
				/**
				 * 기본 명령어가 아닌 경우, 플러그인 등에서 처리할 수 있도록 이벤트를 발생시킨다.
				 */
				default :
					var result = Minitalk.fireEvent("command",[command,commands]);
					if (result === undefined) { // 플러그인 등에서 명령어를 처리하지 못하였을 경우
						Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("NOT_FOUND_COMMAND"));
						return;
					} else if (result !== true) { // 플러그인에서 명령어 처리시 오류가 발생한 경우
						return;
					}
					break;
			}
			
			return;
		} else {
			/**
			 * 대화일시차단 확인
			 */
			if (Minitalk.storage("baned") != null && typeof Minitalk.storage("baned") == "object") {
				var baned = Minitalk.storage("baned");
				var check = baned[Minitalk.channel] ? baned[Minitalk.channel] : 0;
				if (check > new Date().getTime()) {
					Minitalk.ui.printMessage("system",Minitalk.getText("action/banedtime").replace("{SECOND}","<b><u>"+Math.ceil((check - new Date().getTime()) / 1000)+"</u></b>"));
					return false;
				}
			}
			
			/**
			 * 메시지 전송전 이벤트 처리
			 */
			if (Minitalk.fireEvent("beforeSendMessage",[message,Minitalk.user.me]) === false) return;
			
			/**
			 * 서버로 메시지를 전송한다.
			 */
			Minitalk.socket.sendMessage(message,true);
			
			/**
			 * 메시지 전송후 이벤트 처리
			 */
			Minitalk.fireEvent("sendMessage",[message,Minitalk.user.me]);
		}
		
		Minitalk.ui.setInputVal("");
	},
	/**
	 * 자신이 입력한 메시지를 채팅창에 출력할 때, 이모티콘 치환과 메시지 스타일을 처리한다.
	 *
	 * @param string message 원본 메시지
	 * @return string message 처리된 메시지
	 */
	encodeMessage:function(message) {
		message = message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\/,"").replace(/\n/g,"<br>");
		
		/**
		 * 폰트설정을 치환한다.
		 */
		message = message.replace(/\[COLOR=(#[a-z0-9]{6})\](.*?)\[\/COLOR\]/gi,Minitalk.socket.getPermission("font") == true ? '<span style="color:$1;">$2</span>' : '$2');
		message = message.replace(/\[U\](.*?)\[\/U\]/gi,Minitalk.socket.getPermission("font") == true ? '<u>$1</u>' : '$1');
		message = message.replace(/\[I\](.*?)\[\/I\]/gi,Minitalk.socket.getPermission("font") == true ? '<i>$1</i>' : '$1');
		message = message.replace(/\[B\](.*?)\[\/B\]/gi,Minitalk.socket.getPermission("font") == true ? '<b>$1</b>' : '$1');
		
		return message;
	},
	/**
	 * 서버에서 전송된 RAW 채팅메시지를 HTML 태그로 변환한다.
	 *
	 * @param string message 원본 메시지
	 * @return string message 처리된 메시지
	 */
	decodeMessage:function(message,isFontColor) {
		/**
		 * 이모티콘을 치환한다.
		 */
		message = message.replace(/\[#([a-z0-9]+)\/([a-z0-9\.]+)\]/gi,'<img src="' + Minitalk.getUrl() + '/emoticons/$1/items/$2" style="vertical-align:middle;">');
		
		return message;
	},
	/**
	 * 메시지 입력창의 내용을 수정한다.
	 *
	 * @param string message 수정할 내용
	 */
	setInputVal:function(value) {
		var $input = $("div[data-role=input] > input");
		$input.focus().val(value);
	},
	/**
	 * 툴바 레이어를 생성한다.
	 *
	 * @param string tool 툴버튼코드
	 * @param string html 레이어 HTML 코드
	 * @param function callback
	 */
	createToolLayer:function(tool,html,callback) {
		var $frame = $("div[data-role=frame]");
		var $footer = $("footer");
		var $tools = $("ul[data-role=tools]",$footer);
		var $tool = $("footer > ul > li > button[data-tool=" + tool + "]");
		var $toolsTool = $("button[data-tool=" + tool + "]",$tools);
		
		var $layers = $("footer > div[data-role=layers]");
		
		if ($("div[data-tool=" + tool + "]",$layers).length == 1) {
			Minitalk.ui.closeToolLayer(tool);
			return;
		}
		
		var $toolLayers = $("div[data-tool]",$layers);
		if ($toolLayers.length > 0) {
			$toolLayers.each(function() {
				Minitalk.ui.closeToolLayer($(this).attr("data-tool"));
			});
		}
		
		var $layer = $("<div>").attr("data-tool",tool);
		$layers.append($layer);
		
		$layer.on("click",function(e) {
			e.stopImmediatePropagation();
		});
		
		$layer.empty();
		$layer.append(html);
		
		if ($toolsTool.length > 0) {
			if ($toolsTool.position().left + $layer.outerWidth(true) < $frame.innerWidth()) {
				$layer.css("left",$toolsTool.position().left);
			} else {
				$layer.css("left",$frame.innerWidth() - $layer.outerWidth(true));
			}
			$toolsTool.addClass("on");
		} else {
			var $more = $("button[data-tool=more]",$tools);
			if ($more.position().left + $layer.outerWidth(true) < $frame.innerWidth()) {
				$layer.css("left",$more.position().left);
			} else {
				$layer.css("left",$frame.innerWidth() - $layer.outerWidth(true));
			}
			$more.addClass("on");
		}
		
		callback($layer);
	},
	/**
	 * 툴바 레이어를 제거한다.
	 */
	closeToolLayer:function(tool) {
		var $frame = $("div[data-role=frame]");
		var $footer = $("footer");
		var $tools = $("ul[data-role=tools]",$footer);
		var $tool = $("footer > ul > li > button[data-tool=" + tool + "]");
		var $toolsTool = $("button[data-tool=" + tool + "]",$tools);
		var $layers = $("footer > div[data-role=layers]");
		var $layer = $("div[data-tool=" + tool + "]",$layers);
		
		$layer.remove();
		
		if ($toolsTool.length > 0) {
			$toolsTool.removeClass("on");
		} else {
			var $more = $("button[data-tool=more]",$tools);
			$more.removeClass("on");
		}
	},
	/**
	 * 상황에 따라 개인채널을 연다.
	 *
	 * @param string mode 개인채널모드 create / join
	 * @param object data 개인채널정보
	 */
	openPrivateChannel:function(mode,data) {
		if (mode == "create") {
			if (window[Minitalk.user.getUuid()] === undefined) {
				Minitalk.ui.printMessage("system",Minitalk.getText("action/create_private_channel"));
				return Minitalk.ui.createPrivateChannel(data);
			}
		} else if (mode == "join") {
			if (window[data.code] === undefined) {
				Minitalk.ui.printMessage("system",Minitalk.getText("action/join_private_channel").replace("{NICKNAME}","<b><u>"+data.from.nickname+"</u></b>"));
				return Minitalk.ui.createPrivateChannel(data);
			}
		}
	},
	/**
	 * 개인채널을 개설한다.
	 *
	 * @param object data 개인채널정보
	 */
	createPrivateChannel:function(data) {
		var width = 700;
		var height = 400;
		var windowLeft = Math.ceil((screen.width-width)/2);
		var windowTop = Math.ceil((screen.height-height)/2 > 2);
		
		var target = data.code + Math.random();

		var formObject = $("<form>").css("display","none").attr("action",Minitalk.getUrl()+"/html/PrivateChannel.php").attr("target",target).attr("method","POST");
		
		formObject.append($("<input>").attr("name","channel").attr("value",Minitalk.channel));
		formObject.append($("<input>").attr("name","code").attr("value",data.code));
		formObject.append($("<input>").attr("name","templet").attr("value",Minitalk.templet));
		formObject.append($("<input>").attr("name","owner").attr("value",data.from.nickname));
		formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(Minitalk.user.me)));
		
		if (data.to != null && data.from.nickname == Minitalk.user.me.nickname) {
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
			Minitalk.ui.printMessage("error",Minitalk.getErrorText("DISABLED_POPUP"));
			formObject.remove();
			
			return false;
		}
	},
	/**
	 * 플러그인채널을 개설한다.
	 */
	openPluginChannel:function(plugin,code,width,height,data) {
		var windowLeft = Math.ceil((screen.width-width)/2);
		var windowTop = Math.ceil((screen.height-height)/2 > 2);
		var target = plugin+Math.random();
		
		var formObject = $("<form>").css("display","none").attr("action",Minitalk.getUrl()+"/html/PrivateChannel.php").attr("target",target).attr("method","POST");
		
		formObject.append($("<input>").attr("name","channel").attr("value",Minitalk.channel));
		formObject.append($("<input>").attr("name","code").attr("value",code));
		formObject.append($("<input>").attr("name","templet").attr("value",Minitalk.templet));
		formObject.append($("<input>").attr("name","owner").attr("value",data.nickname ? data.nickname : Minitalk.user.me.nickname));
		formObject.append($("<input>").attr("name","myinfo").attr("value",JSON.stringify(Minitalk.user.me)));
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
			Minitalk.ui.printMessage("error",Minitalk.getErrorText("DISABLED_POPUP"));
			formObject.remove();
			
			return false;
		}
	},
	/**
	 * 채널관리자로 로그인한다.
	 *
	 * @param string password 채널패스워드
	 */
	login:function(password) {
		$.send(Minitalk.getUrl()+"/process/getChannelAdmin",{channel:Minitalk.channel,password:password},function(result) {
			if (result.success == true) {
				Minitalk.socket.send("oppercode",result.oppercode);
			} else {
				Minitalk.ui.printMessage("error",Minitalk.getErrorText("INVALID_PASSWORD"));
			}
		});
	},
	/**
	 * 알림메시지를 출력한다.
	 *
	 * @param string code 알림메시지 고유값 (같은 고유값을 가진 알림메시지는 동시에 출력되지 않는다.)
	 * @param string type 알림메시지 타입 (action, error, warning, success)
	 * @param string message 알림메시지 메시지
	 * @param boolean closable 알림메시지를 닫을 수 있는 여부 (기본값 : true)
	 * @param boolean autoHide 알림메시지 자동닫기 여부 (기본값 : true)
	 * @param object data 알림메시지에 담을 데이터
	 * @param function callback
	 */
	notify:function(code,type,message,closable,autoHide,data,callback) {
		var $notifications = $("div[data-role=notifications]");
		var $notification = $("div[data-code=" + code + "]",$notifications);
		if ($notification.length == 0) {
			var $notification = $("<div>").attr("data-code",code).addClass("ready");
			var $balloon = $("<div>");
			$notification.append($balloon);
			$notifications.append($notification);
		} else {
			var $balloon = $("div",$notification);
		}
		
		$notification.data("autoHide",null);
		$notification.data("data",data ? data : null);
		$balloon.removeClass("action error warning success").addClass(type);
		
		if ($notification.data("unnotify") !== null) {
			clearTimeout($notification.data("unnotify"));
			$notification.data("unnotify",null);
		}
		
		/**
		 * 자동닫기가 활성화되어 있는 경우, 5초 뒤에 알림을 닫는다.
		 */
		var autoHide = autoHide === false ? false : true;
		if (autoHide === true) {
			Minitalk.ui.unnotify(code,5);
		}
		
		$balloon.html(message);
		
		/**
		 * 브라우저 푸시메시지를 표시한다.
		 */
		Minitalk.ui.push(message);
		
		/**
		 * 콜백함수가 있거나, 자동닫기가 활성화되어있거나, 닫을 수 있는 알림인 경우 닫기버튼을 추가한다.
		 */
		var closable = closable === false && autoHide === false ? false : true;
		if (typeof callback == "function" || closable === true) {
			if (typeof callback == "function") {
				$balloon.addClass("callback");
				$balloon.on("click",function() {
					var $notification = $(this).parent();
					callback($notification);
					if (closable === true) Minitalk.ui.unnotify($(this).parent().attr("data-code"));
				});
			} else {
				$balloon.addClass("closable");
				$balloon.append($("<i>").addClass("mi mi-close"));
				$balloon.on("click",function() {
					Minitalk.ui.unnotify($(this).parent().attr("data-code"));
				});
			}
		}
	},
	/**
	 * 알림메시지를 삭제한다.
	 *
	 * @param string code 알림메시지 고유값 (같은 고유값을 가진 알림메시지는 동시에 출력되지 않는다.)
	 * @param int delay 지연시간(초) (기본값 : 0)
	 */
	unnotify:function(code,delay) {
		var delay = delay ? delay : 0;
		var $notifications = $("div[data-role=notifications]");
		var $notification = $("div[data-code=" + code + "]",$notifications);
		
		if (delay > 0) {
			$notification.data("unnotify",setTimeout(function(code) {
				Minitalk.ui.unnotify(code);
			},5000,code));
		} else {
			$notification.remove();
		}
	},
	/**
	 * v6.5.0 에서 제거예정
	 */
	showAlert:function(type,code,message,autoHide,data,callback) {
		if ($.inArray(type,["action","success","error","warning"]) === -1) type = "action";
		console.warn("[deprecated] showAlert() is deprecated in v6.5. use notify().");
		Minitalk.ui.notify(code,type,message,true,autoHide,data,callback);
	},
	/**
	 * v6.5.0 에서 제거예정
	 */
	removeAlert:function(code,callback) {
		console.warn("[deprecated] removeAlert() is deprecated in v6.5. use unnotify().");
		Minitalk.ui.unnotify(code);
	},
	/**
	 * 공지사항을 표시한다.
	 *
	 * @param string message 메시지
	 * @param string url URL 링크
	 */
	showNotice:function(message,url) {
		if (!url) url = "";
		
		Minitalk.ui.notify("notice" + Math.ceil(Math.random()*10000),"warning",message,true,true,url,function($notification) {
			if ($notification.data("data")) window.open($notification.data("data"));
		});
	},
	/**
	 * 사운드를 재생한다.
	 */
	playSound:function(sound) {
		if (Minitalk.setting("mute") == true) return;
		
		var $audio = $("audio[data-type="+sound+"]");
		if ($audio.length == 0) return;
		
		var audio = $audio.get(0);
		audio.pause();
		audio.currentTime = 0;
		audio.muted = false;
		var promise = audio.play();
		if (promise !== undefined) {
			promise.then(function() {
			}).catch(function(e) {
			});
		}
	},
	/**
	 * 브라우저 알림을 전송한다.
	 *
	 * @param string message 표시할 메시지
	 */
	push:function(message) {
		message = message.replace(/<\/?[a-zA-Z]+(.*?)>/g,'');
		
		if (Minitalk.setting("push") == true && window.Notification !== undefined && Notification.permission == "granted") {
			var notification = new Notification("Minitalk",{body:message,icon:Minitalk.getUrl()+"/images/minitalk.png"});
		}
	},
	/**
	 * 토글된 객체를 초기화한다.
	 */
	resetToggle:function() {
		if ($("div[data-role=configs]").length > 0) {
			$("div[data-role=configs]").remove();
		}
		
		if ($("ul[data-role=usermenus]").length > 0) {
			$("ul[data-role=usermenus]").remove();
		}
		
		var $toolLayers = $("footer > div[data-role=layers] > div[data-tool]");
		if ($toolLayers.length > 0) {
			$toolLayers.each(function() {
				Minitalk.ui.closeToolLayer($(this).attr("data-tool"));
			});
		}
	}
};