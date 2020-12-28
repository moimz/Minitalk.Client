/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 UI 관련 이벤트를 처리한다.
 * 
 * @file /scripts/widget.ui.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 6. 16.
 */
Minitalk.ui = {
	resizeTimer:null,
	/**
	 * 미니톡 채팅위젯 UI를 초기화한다.
	 */
	init:function(html) {
		if (html === undefined) {
			/**
			 * 미니톡 채팅위젯을 구성하기 위한 필수요소 DOM 을 정의한다.
			 */
			var html = [
				/**
				 * 위젯헤더
				 */
				'<header>',
					'<h1>connecting...</h1>', // 위젯타이틀
					'<label data-role="count"></label>', // 접속자수
				'</header>',
				
				/**
				 * 탭바
				 */
				'<aside></aside>',
				
				/**
				 * 활성화된 탭이 표시되는 영역
				 */
				'<main></main>',
				
				/**
				 * 위젯푸터
				 */
				'<footer></footer>'
			];
			
			html = html.join("");
		}
		
		/**
		 * 위젯 프레임을 정의하고, html DOM 요소를 추가한다.
		 */
		var $frame = $("<div>").attr("data-role","frame");
		$frame.append(html);
		
		/**
		 * 탭바 DOM 객체를 확인하고, 탭바 요소에 탭바 및 탭 목록 요소를 추가한다.
		 */
		var $aside = $("aside",$frame);
		if ($aside.length == 0) return Minitalk.ui.printError("MISSING_DOM","aside");
		$aside.append('<ul data-role="tabs"></ul>');
		$aside.append('<ul data-role="lists"></ul>');
		
		/**
		 * 메인 DOM 객체를 확인한다.
		 */
		var $main = $("main",$frame);
		if ($main.length == 0) return Minitalk.ui.printError("MISSING_DOM","aside");
		
		/**
		 * 푸터 영역에 툴바 및 입력폼 요소를 추가한다.
		 */
		var $footer = $("footer",$frame);
		if ($footer.length == 0) return Minitalk.ui.printError("MISSING_DOM","footer");
		$footer.append('<div data-role="progress"><div></div></div>');
		$footer.append('<div data-role="layers"></div>');
		$footer.append('<ul data-role="tools"></ul>');
		$footer.append('<ul data-role="lists"></ul>');
		$footer.append('<div data-role="input"><textarea type="text" data-role="message"></textarea><button type="button"><i class="icon"></i><span>' + Minitalk.getText("button/send") + '</button></div>');
		
		/**
		 * 파일첨부를 위한 객체를 추가한다.
		 */
		$frame.append('<input type="file" style="display:none;">');
		
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
		 * 위젯 DOM 을 body 에 추가한다.
		 */
		$("body").append($frame);
		
		/**
		 * UI 초기화함수 실행
		 */
		Minitalk.ui.initEvents();
		Minitalk.ui.initFrame();
		Minitalk.ui.initSection();
		Minitalk.ui.disable();
	},
	/**
	 * UI DOM 객체의 이벤트를 정의한다.
	 */
	initEvents:function() {
		/**
		 * 채팅입력폼 이벤트 추가
		 */
		$("div[data-role=input] > textarea").on("keydown",function(e) {
			if (e.keyCode == 13 && e.shiftKey === false) {
				Minitalk.ui.sendMessage($(this).val());
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		}).on("keyup",function(e) {
			Minitalk.ui.updateInputHeight();
		});
		
		/**
		 * 메시지 전송버튼 이벤트 추가
		 */
		$("div[data-role=input] > button").on("click",function(e) {
			if ($("div[data-role=input] > textarea").val().length > 0) {
				Minitalk.ui.sendMessage($("div[data-role=input] > textarea").val());
			}
			e.stopImmediatePropagation();
			e.preventDefault();
		});
		
		/**
		 * 파일첨부 이벤트 추가
		 */
		$("input[type=file]").on("change",function(e) {
			if (e.target.files.length > 0) {
				$(this).data("files",null);
				$(this).data("drafts",null);
				$(this).data("current",null);
				$(this).data("files",e.target.files);
				
				Minitalk.ui.uploadFiles();
			}
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
				Minitalk.freEvent("esc");
			}
		});
		
		/**
		 * ESC 기본이벤트 처리
		 */
		$(document).on("esc",function() {
			Minitalk.ui.resetToggle();
			Minitalk.ui.closeWindow(false);
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
		Minitalk.ui.initTabs();
		Minitalk.ui.initTools();
	},
	/**
	 * 탭바를 출력한다.
	 */
	initTabs:function() {
		var $frame = $("div[data-role=frame]");
		var type = Minitalk.tabType == "auto" ? ($(window).width() > 400 ? "vertical" : "horizontal") : Minitalk.tabType;
		$frame.attr("data-tab-type",type);
		
		/**
		 * 탭바설정에 기존에 위치한 채팅탭을 삭제하고, 항상 제일 처음에 채팅탭을 추가한다.
		 */
		var chatTab = $.inArray("chat",Minitalk.tabs);
		if (chatTab > -1) {
			Minitalk.tabs.splice(chatTab,1);
		}
		Minitalk.tabs.unshift("chat");
		
		var $aside = $("aside");
		var $tabs = $("ul[data-role=tabs]",$aside);
		var $lists = $("ul[data-role=lists]",$aside);
		$tabs.empty();
		$lists.empty();
		if (Minitalk.tabType == "none") return;
		
		var limit = type == "horizontal" ? $tabs.width() : $tabs.height();
		var limiter = 0;
		
		for (var index in Minitalk.tabs) {
			var tab = Minitalk.tabs[index];
			
			if (typeof tab == "string") {
				/**
				 * 기본탭을 추가한다.
				 */
				if ($.inArray(tab,["chat","users","files","boxes","configs"]) === false) continue;
				
				/**
				 * 박스인 경우 박스탭을 숨긴다.
				 */
				if (Minitalk.box.isBox() == true && tab == "boxes") continue;
				
				var $tab = $("<li>");
				var $button = $("<button>").attr("type","button").attr("data-tab",tab);
				$button.append($("<i>").addClass("icon"));
				$button.append($("<label>").html(Minitalk.getText("tab/" + tab)));
				$button.data("tab",tab);
				$button.on("click",function(e) {
					Minitalk.ui.activeTab($(this),e);
				});
				
				if ($frame.attr("data-current-tab") == tab) {
					$button.addClass("open");
				}
				
				$tab.append($button);
				$tabs.append($tab);
			} else {
				/**
				 * 사용자정의 탭을 추가한다.
				 */
				var $tab = $("<li>");
				var $button = $("<button>").attr("type","button").attr("data-tab","custom");
				$button.append($("<i>").addClass(tab.iconCls));
				$button.append($("<label>").html(tab.text));
				$button.data("tab",tab);
				$button.on("click",function(e) {
					Minitalk.ui.activeTab($(this),e);
				});
				
				if ($frame.attr("data-current-tab") == tab) {
					$button.addClass("open");
				}
				
				$tab.append($button);
				$tabs.append($tab);
			}
			
			if (type == "horizontal") {
				limiter+= $tab.outerWidth(true);
			} else {
				limiter+= $tab.outerHeight(true);
			}
		}
		
		/**
		 * 탭바영역을 벗어난 탭을 탭 목록으로 이동시킨다.
		 */
		if (limit < limiter) {
			var current = 0;
			var split = 0;
			
			$("li",$tabs).each(function() {
				if (type == "horizontal") {
					if (current + $(this).width() > limit) {
						return false;
					}
				}
				current+= $(this).width();
				split++;
			});
			
			for (var i=loop=$("li",$tabs).length - 1;i>=Math.max(1,split);i--) {
				var $tab = $("li",$tabs).eq(i).clone(true);
				
				$lists.prepend($tab);
				$("li",$tabs).eq(i).remove();
			}
			
			var $more = $("<li>");
			var $button = $("<button>").attr("type","button").attr("data-tab","more");
			$button.append($("<i>").addClass("icon"));
			$button.append($("<span>").html(Minitalk.getText("tab/more")));
			$button.on("click",function(e) {
				Minitalk.ui.toggleTabs();
				e.stopImmediatePropagation();
			});
			$more.append($button);
			$tabs.append($more);
		}
		
		/**
		 * 가로형 탭인 경우, 탭 너비를 동일하게 설정한다.
		 */
		if (type == "horizontal") {
			$("li",$tabs).outerWidth((100 / $("li",$tabs).length) + "%",true);
		}
	},
	/**
	 * 설정된 탭에 따라 메인섹션을 초기화한다.
	 */
	initSection:function() {
		var firstTab = null;
		var $main = $("main");
		for (var index in Minitalk.tabs) {
			var tab = Minitalk.tabs[index];
			
			if (typeof tab == "string") {
				/**
				 * 기본탭을 추가한다.
				 */
				if ($.inArray(tab,["chat","users","files","boxes","configs"]) === -1) continue;
				$main.append($("<section>").attr("data-tab",tab));
				
				firstTab = firstTab === null ? tab : firstTab;
			} else {
				/**
				 * 사용자정의 탭을 추가한다.
				 */
				if (tab.name === undefined || typeof tab.handler === "function") continue;
				$main.append($("<section>").attr("data-tab",tab.name));
				
				firstTab = firstTab === null ? tab.name : firstTab;
			}
		}
		
		if (firstTab !== null) {
			Minitalk.ui.activeTab(firstTab);
		}
	},
	/**
	 * 툴바를 초기화한다.
	 */
	initTools:function() {
		var $footer = $("footer");
		var $tools = $("ul[data-role=tools]",$footer);
		var $lists = $("ul[data-role=lists]",$footer);
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
					if ($.inArray(tool,["bold","underline","italic","color","emoticon","file"]) === -1) continue;
					
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
			
			$("li",$tools).each(function() {
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
		var $input = $("div[data-role=input] > textarea");
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
	 * 미니톡 채널설정에 따른 UI설정을 초기화한다.
	 *
	 * @param object channel 채널정보
	 */
	initChannel:function() {
		var $frame = $("div[data-role=frame]");
		var channel = Minitalk.socket.channel;
		if (channel == null) return;
		
		$("body > div[data-role=loading]").remove();
		
		Minitalk.fireEvent("initChannel",[channel]);
	},
	/**
	 * 이전대화 불러오기 버튼을 초기화한다.
	 */
	initHistory:function() {
		var $chat = $("section[data-tab=chat]");
		var $history = $("button[data-action=history]",$chat);
		if ($history.length > 0) return;
		
		var $history = $("<button>").attr("type","button").attr("data-action","history");
		$history.html(Minitalk.getText("button/history"));
		$history.on("click",function() {
			Minitalk.ui.getHistory();
		});
		
		$chat.prepend($history);
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
		
		var $file = $("input[type=file]");
		
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
					
				case "file" :
					$file.trigger("click");
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
						$("button[data-color]",$dom).on("click",function() {
							var $button = $(this);
							var color = $button.attr("data-color");
							
							if (color == "reset") {
								Minitalk.fonts("color",null);
							} else {
								Minitalk.fonts("color",color);
							}
							
							Minitalk.ui.initFonts();
							$("div[data-role=input] > textarea").focus();
							
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
			}
		} else {
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
	/**
	 * 활성화탭을 변경한다.
	 *
	 * @param object/string $tab 탭의 DOM 객체
	 * @param event e 이벤트객체
	 */
	activeTab:function($tab,e) {
		var $frame = $("div[data-role=frame]");
		var type = $frame.attr("data-tab-type");
		
		var tab = typeof $tab == "object" ? $tab.data("tab") : $tab;
		var $tab = typeof $tab == "object" ? $tab : null;
		
		var $frame = $("div[data-role=frame]");
		var $aside = $("aside");
		var $main = $("main");
		var $tabs = $("ul[data-role]",$aside);
		if ($frame.attr("data-current-tab") == tab) {
			/**
			 * 세로형태의 탭바의 경우, 같은 탭을 클릭할 경우 채팅탭으로 돌아간다.
			 */
			if (type == "vertical") {
				if (tab == "chat") return;
				Minitalk.ui.activeTab("chat");
			}
			return;
		}
		if (Minitalk.fireEvent("beforeActiveTab",[tab,e]) === false) return;
		
		$frame.attr("data-previous-tab",$frame.attr("data-current-tab") ? $frame.attr("data-current-tab") : "chat");
		$frame.attr("data-current-tab",tab);
		
		$("button[data-tab]",$tabs).removeClass("open");
		$("button[data-tab="+tab+"]",$tabs).addClass("open");
		$("section[data-tab]",$main).removeClass("open");
		$("section[data-tab="+tab+"]",$main).addClass("open");
		
		if ($("ul[data-role=lists] > li > button.open",$aside).length > 0) {
			$("button[data-tab=more]",$tabs).addClass("open");
		}
		
		if (tab == "chat") {
			Minitalk.ui.createChat();
		}
		
		if (tab == "users") {
			Minitalk.ui.createUsers();
		}
		
		if (tab == "boxes") {
			Minitalk.ui.createBoxes();
		}
		
		if (tab == "configs") {
			Minitalk.ui.createConfigs();
		}
		
		$aside.removeClass("open");
		Minitalk.fireEvent("afterActiveTab",[tab,e]);
		
		if (e) e.stopImmediatePropagation();
	},
	/**
	 * 탭목록을 토글한다.
	 */
	toggleTabs:function() {
		var $aside = $("aside");
		$aside.toggleClass("open");
	},
	/**
	 * 채팅탭을 구성한다.
	 */
	createChat:function() {
		Minitalk.ui.initTools();
		Minitalk.ui.autoScroll(true);
	},
	/**
	 * 유저탭을 구성한다.
	 *
	 * @param object $button 유저탭 액션버튼 (없을경우 탭 DOM 을 구현한다.)
	 */
	createUsers:function($button) {
		var $frame = $("div[data-role=frame]");
		var $section = $("section[data-tab=users]",$frame);
		
		if ($button === undefined) {
			$section.empty();
			
			/**
			 * 유저탭 HTML 을 정의한다.
			 */
			var html = [
				'<div data-role="search">',
					'<input type="search" placeholder="' + Minitalk.getText("user/keyword") + '">',
					'<button type="button" data-action="search"><i></i><label>' + Minitalk.getText("button/search") + '</label></button>',
					'<button type="button" data-action="refresh"><i></i><label>' + Minitalk.getText("button/refresh") + '</label></button>',
				'</div>',
				'<ul></ul>'
			];
			
			$section.append(html.join(""));
			
			/**
			 * 액션버튼 이벤트를 등록한다.
			 */
			$("button[data-action]",$section).on("click",function(e) {
				Minitalk.ui.createUsers($(this));
				e.stopImmediatePropagation();
			});
		}
		
		var $keyword = $("input[type=search]",$section);
		var $search = $("button[data-action=search]",$section);
		var $lists = $("ul",$section);
		
		/**
		 * 새로고침버튼이벤트일 경우, 기존 검색어를 사용한다.
		 */
		if ($button !== undefined && $button.attr("data-action") == "refresh") {
			$keyword.val($keyword.data("latest") ? $keyword.data("latest") : "");
		}
		var keyword = $keyword.val();
		
		$search.disable();
		$lists.empty();
		$lists.append($("<li>").addClass("loading").append($("<i>").addClass("mi mi-loading")));
		
		/**
		 * 검색창 ENTER 이벤트 추가
		 */
		$keyword.on("keypress",function(e) {
			if (e.keyCode == 13) {
				Minitalk.ui.createUsers($search);
				e.stopImmediatePropagation();
			}
		});
		
		/**
		 * 접속자목록을 무한히 갱신하는 것을 방지하기 위해 새로고침 버튼을 일정시간 비활성화시킨다.
		 */
		var $refresh = $("button[data-action=refresh]",$section);
		$refresh.disable();
		if ($refresh.data("timer")) {
			clearTimeout($refresh.data("timer"));
			$refresh.data("timer",null);
		}
		$refresh.data("timer",setTimeout(function($refresh) { $refresh.data("timer",null); $refresh.enable(); },5000,$refresh));
		
		Minitalk.user.getUsers(1,keyword,function(result) {
			if (result.success == true) {
				/**
				 * 기존접속자목록을 제거한다.
				 */
				$lists.empty();
				
				/**
				 * 키워드가 없을 경우, 자기자신을 접속자목록 제일 처음에 위치하도록 한다.
				 */
				if (result.pagination.keyword == null) result.users.unshift(Minitalk.user.me);
				
				for (var i=0, loop=result.users.length;i<loop;i++) {
					var user = result.users[i];
					var $item = $("<li>");
					if (result.pagination.keyword == null && i > 0 && user.nickname == Minitalk.user.me.nickname) continue;
					
					$item.append(Minitalk.user.getTag(user));
					$lists.append($item);
				}
				
				$keyword.data("latest",result.pagination.keyword);
			}
			
			$search.enable();
		});
	},
	/**
	 * 박스탭을 구성한다.
	 *
	 * @param object $button 박스탭 액션버튼 (없을경우 탭 DOM 을 구현한다.)
	 */
	createBoxes:function($button) {
		var $frame = $("div[data-role=frame]");
		var $section = $("section[data-tab=boxes]",$frame);
		
		if ($button === undefined) {
			$section.empty();
			
			/**
			 * 박스탭 HTML 을 정의한다.
			 */
			var html = [
				'<div data-role="search">',
					'<input type="search" placeholder="' + Minitalk.getText("box/keyword") + '">',
					'<button type="button" data-action="search"><i></i><label>' + Minitalk.getText("button/search") + '</label></button>',
					'<button type="button" data-action="refresh"><i></i><label>' + Minitalk.getText("button/refresh") + '</label></button>',
					'<button type="button" data-action="create"><i></i><label>' + Minitalk.getText("button/box") + '</label></button>',
				'</div>',
				'<ul></ul>'
			];
			
			$section.append(html.join(""));
			
			/**
			 * 액션버튼 이벤트를 등록한다.
			 */
			$("button[data-action]",$section).on("click",function(e) {
				var $button = $(this);
				var action = $button.attr("data-action");
				
				if (action == "create") {
					Minitalk.box.create();
				} else {
					Minitalk.ui.createBoxes($(this));
					e.stopImmediatePropagation();
				}
			});
		}
		
		var $keyword = $("input[type=search]",$section);
		var $search = $("button[data-action=search]",$section);
		var $lists = $("ul",$section);
		
		/**
		 * 새로고침버튼이벤트일 경우, 기존 검색어를 사용한다.
		 */
		if ($button !== undefined && $button.attr("data-action") == "refresh") {
			$keyword.val($keyword.data("latest") ? $keyword.data("latest") : "");
		}
		var keyword = $keyword.val();
		
		$search.disable();
		$lists.empty();
		$lists.append($("<li>").addClass("loading").append($("<i>").addClass("mi mi-loading")));
		
		/**
		 * 검색창 ENTER 이벤트 추가
		 */
		$keyword.on("keypress",function(e) {
			if (e.keyCode == 13) {
				Minitalk.ui.createBoxes($search);
				e.stopImmediatePropagation();
			}
		});
		
		/**
		 * 박스목록을 무한히 갱신하는 것을 방지하기 위해 새로고침 버튼을 일정시간 비활성화시킨다.
		 */
		var $refresh = $("button[data-action=refresh]",$section);
		$refresh.disable();
		if ($refresh.data("timer")) {
			clearTimeout($refresh.data("timer"));
			$refresh.data("timer",null);
		}
		$refresh.data("timer",setTimeout(function($refresh) { $refresh.data("timer",null); $refresh.enable(); },5000,$refresh));
		
		Minitalk.box.getBoxes(1,keyword,function(result) {
			if (result.success == true) {
				/**
				 * 기존 박스목록을 제거한다.
				 */
				$lists.empty();
				
				for (var i=0, loop=result.boxes.length;i<loop;i++) {
					var box = result.boxes[i];
					var $item = $("<li>");
					
					$item.append(Minitalk.box.getTag(box));
					$lists.append($item);
				}
				
				$keyword.data("latest",result.pagination.keyword);
			}
			
			$search.enable();
		});
	},
	/**
	 * 설정탭을 구성한다.
	 *
	 * @param object $dom 설정탭 DOM 객체 (없을경우, DOM을 생성하고, 있을경우 해당 DOM 에 이벤트를 정의한다.)
	 */
	createConfigs:function($dom) {
		var $frame = $("div[data-role=frame]");
		
		if ($dom === undefined) {
			/**
			 * 설정탭 HTML 을 정의한다.
			 */
			var html = [
				'<h2>' + Minitalk.getText("tab/configs") + '</h2>',
				'<button data-action="close"></button>',
				'<div data-role="content">',
					'<h4>' + Minitalk.getText("config/title/default") + '</h4>',
					'<label class="checkbox"><input type="checkbox" name="active_scroll">' + Minitalk.getText("config/active_scroll") + '</label>',
					'<label class="checkbox"><input type="checkbox" name="browser_notification">' + Minitalk.getText("config/browser_notification") + '</label>',
					'<label class="checkbox"><input type="checkbox" name="mute">' + Minitalk.getText("config/mute") + '</label>',
					'<hr>',
					'<h4>' + Minitalk.getText("config/title/whisper") + '</h4>',
					'<label class="checkbox"><input type="checkbox" name="whisper">' + Minitalk.getText("config/whisper") + '</label>',
					'<label class="checkbox"><input type="checkbox" name="whisper_sound">' + Minitalk.getText("config/whisper_sound") + '</label>',
					'<hr>',
					'<h4>' + Minitalk.getText("config/title/call") + '</h4>',
					'<label class="checkbox"><input type="checkbox" name="call">' + Minitalk.getText("config/call") + '</label>',
					'<label class="checkbox"><input type="checkbox" name="call_sound">' + Minitalk.getText("config/call_sound") + '</label>',
				'</div>',
				'<div data-role="button">',
					'<ul>',
						'<li><button type="button" data-action="cancel">' + Minitalk.getText("button/cancel") + '</button></li>',
						'<li><button type="button" data-action="confirm">' + Minitalk.getText("button/confirm") + '</button></li>',
					'</ul>',
				'</div>'
			];
			html = html.join("");
			
			/**
			 * 채팅위젯의 가로크기가 298px 이하인 경우, 새로운 윈도우에 설정탭을 출력한다.
			 */
			if ($frame.width() < 298) {
				/**
				 * 환경설정탭 DOM 을 추가한다.
				 */
				html = '<section data-tab="configs">' + html + '</section>';
				Minitalk.ui.createWindow(html,400,Minitalk.ui.createConfigs);
				
				// 새로운 윈도우를 생성한뒤, 이전에 선택한 탭으로 복귀한다.
				setTimeout(Minitalk.ui.activeTab,100,$frame.attr("data-previous-tab"));
			} else {
				var $section = $("section[data-tab=configs]");
				$section.empty();
				$section.append(html);
				
				Minitalk.ui.createConfigs($section);
			}
		} else {
			var configs = Minitalk.configs();
			$("input[name=active_scroll]",$dom).checked(configs.active_scroll);
			$("input[name=browser_notification]",$dom).checked(configs.browser_notification);
			$("input[name=mute]",$dom).checked(configs.mute);
			$("input[name=whisper]",$dom).checked(configs.whisper);
			$("input[name=whisper_sound]",$dom).checked(configs.whisper);
			$("input[name=call]",$dom).checked(configs.whisper);
			$("input[name=call_sound]",$dom).checked(configs.whisper);
			
			$("button[data-action]",$dom).on("click",function() {
				var $button = $(this);
				var action = $button.attr("data-action");
				
				if (action == "confirm") {
					Minitalk.configs("active_scroll",$("input[name=active_scroll]",$dom).checked());
					Minitalk.configs("browser_notification",$("input[name=browser_notification]",$dom).checked());
					Minitalk.configs("mute",$("input[name=mute]",$dom).checked());
					Minitalk.configs("whisper",$("input[name=whisper]",$dom).checked());
					Minitalk.configs("whisper_sound",$("input[name=whisper_sound]",$dom).checked());
					Minitalk.configs("call",$("input[name=call]",$dom).checked());
					Minitalk.configs("call_sound",$("input[name=call_sound]",$dom).checked());
				}
				
				if ($dom.is("body") === true) {
					Minitalk.ui.closeWindow();
				} else {
					Minitalk.ui.activeTab($frame.attr("data-previous-tab"));
				}
			});
		}
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
	 * 새로운 윈도우를 생성한다.
	 *
	 * @param string html 내부 HTML 내용
	 * @param int width 윈도우 가로크기
	 * @param function callback 윈도우가 초기화되었을때 실행할 callback 함수
	 * @param boolean closable 닫을 수 있는 윈도우여부 (기본값 true)
	 */
	createWindow:function(html,width,callback,closable) {
		var closable = closable === false ? false : true;
		
		/**
		 * 채팅위젯의 부모객체의 가로크기가 설정된 윈도우 가로크기보다 작을경우 팝업윈도우로 생성한다.
		 */
		if ($(parent.window).width() < width) {
			var height = 100;
			if (screen.availWidth < width) width = screen.availWidth - 50;
			if (screen.availHeight < height) height = screen.availHeight - 50;
			
			var windowLeft = Math.ceil((screen.availWidth - width) / 2);
			var windowTop = Math.ceil((screen.availHeight - height) / 2);
			windowTop = windowTop > 20 ? windowTop - 20 : windowTop;
			var opener = window.open("","","top=" + windowTop + ",left=" + windowLeft + ",width=" + width + ",height=" + height + ",scrollbars=1");
			
			if (opener) {
				var dom = opener.document;
				var $target = $(opener);
				$target.data("width",width);
			} else {
				Minitalk.ui.printError("BLOCKED_POPUP");
				return;
			}
		} else {
			var $cover = $("<div>").attr("data-role","cover");
			$cover.data("closable",closable);
			$("div[data-role=frame]").append($cover);
			
			if ($("div[data-role=minitalk-window]",parent.document.body).length > 0) {
				$("div[data-role=minitalk-window]",parent.document.body).remove();
			}
			
			var $background = $("<div>").attr("data-role","minitalk-window");
			$background.css("position","fixed").css("margin",0).css("padding",0).css("left",0).css("top",0).css("zIndex",100000).css("width","100%").css("height","100%").css("background","rgba(0,0,0,0.6) url("+Minitalk.getUrl()+"/images/loading.gif) no-repeat 50% 50%");
			
			var $target = $("<iframe>").css("position","fixed").css("width",width + "px").css("height","100px").css("background","#fff").attr("frameborder",0).attr("scrolling","auto").css("opacity",0);
			$target.data("width",width);
			$background.append($target);
			$background.on("click",function() {
				Minitalk.ui.closeWindow(false);
			});
			$(parent.document.body).append($background);
			
			var dom = $target.get(0).contentWindow.document;
		}
		
		if (dom !== null) {
			dom.removeChild(dom.documentElement);
			
			dom.open();
			dom.write('<!DOCTYPE HTML>');
			dom.write('<html data-id="'+Minitalk.id+'">');
			dom.write('<head>');
			dom.write('<meta charset="utf-8">');
			dom.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
			dom.write('<title>MiniTalk Widget</title>');
			dom.write('<link href="'+MinitalkComponent.getUrl()+'/styles/widget.css.php?channel='+Minitalk.channel+'&templet='+Minitalk.templet+'" type="text/css">');
			dom.write('</head>');
			dom.write('<body><div data-role="window" style="opacity:0;">'+html+'</div></body>');
			dom.write('</html>');
			dom.close();
			
			var $dom = $(dom);
			$dom.data("target",$target);
			$dom.ready(function() {
				$("link",$dom).on("load",function() {
					var width = $dom.data("target").data("width");
					var height = $("body",$dom).prop("scrollHeight");
					
					if ($dom.data("target").is("iframe") == true) {
						if (screen.availHeight < height) height = $(parent.window).height() - 50;
						$target.height(height);
						$target.css("left","calc(50% - " + Math.ceil(width / 2) + "px)");
						$target.css("top","calc(50% - " + Math.ceil(height / 2) + "px)");
						$target.css("opacity",1);
					} else {
						if (screen.availHeight < height) height = screen.availHeight - 50;
						var windowLeft = (screen.availWidth - width) / 2;
						var windowTop = (screen.availHeight - height) / 2;
						
						var resizeWidth = width - $($dom.data("target").get(0).window).width();
						var resizeHeight = height - $($dom.data("target").get(0).window).height();
						
						$dom.data("target").get(0).resizeBy(resizeWidth,resizeHeight);
						$dom.data("target").get(0).moveTo(windowLeft,windowTop);
					}
					
					$("div[data-role=window]",$dom).css("opacity",1);
					
					if (typeof callback == "function") {
						callback($("body",$dom));
					}
				});
				
				setTimeout(function($dom) { $("link",$dom).attr("rel","stylesheet"); },100,$dom);
			});
		}
	},
	/**
	 * 열린 윈도우를 닫는다.
	 *
	 * @param boolean forceClosed 강제닫기여부 (기본값 true)
	 */
	closeWindow:function(forceClosed) {
		var forceClosed = forceClosed === false ? false : true;
		
		if (forceClosed === true || $("div[data-role=cover]",$("div[data-role=frame]")).data("closable") === true) {
			if ($("div[data-role=minitalk-window]",parent.document.body).length > 0) {
				$("div[data-role=minitalk-window]",parent.document.body).remove();
			}
		
			if ($("div[data-role=cover]",$("div[data-role=frame]")).length > 0) {
				$("div[data-role=cover]",$("div[data-role=frame]")).remove();
			}
		}
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
	 * 이전대화기록을 불러온다.
	 */
	getHistory:function() {
		var room = Minitalk.channel;
		/**
		 * 박스인 경우, 박스 아이디를 추가한다.
		 */
		if (Minitalk.box.isBox() == true) {
			room+= "@" + Minitalk.box.getId();
		}
		
		var $chat = $("section[data-tab=chat]");
		var $button = $("button[data-action=history]",$chat);
		var $messages = $("div[data-message-id]",$chat);
		if ($messages.length > 0) {
			var time = $messages.eq(0).attr("data-time");
		} else {
			var time = 0;
		}
		
		$button.status("loading");
		
		$.get({
			url:Minitalk.getApiUrl("history",room) + "?time=" + time,
			dataType:"json",
			headers:{authorization:"TOKEN " + Minitalk.socket.channel.token},
			success:function(result) {
				if (result.success == true) {
					/**
					 * 이전대화를 불러오고 난뒤 원래 보고 있던 위치를 구하기 위하여 현재 버튼의 위치를 기억한다.
					 */
					var top = $button.position().top - $chat.scrollTop();
					
					/**
					 * 로컬에 저장중인 최근대화기록이 지정된 숫자보다 적은경우 로컬에 불러온 이전대화기록을 저장한다.
					 */
					var is_store = Minitalk.log().messages.length < Minitalk.logCount;
					
					for (var i=0, loop=result.history.length;i<loop;i++) {
						if (is_store == true) Minitalk.log(result.history[i]);
						Minitalk.ui.printChatMessage(result.history[i],"history");
					}
					
					var scroll = $button.position().top - top;
					
					var $nButton = $button.clone(true);
					$button.remove();
					$chat.prepend($nButton);
					$nButton.status("default");
					
					/**
					 * 원래 보고 있던 위치로 스크롤을 이동한다.
					 */
					$chat.scrollTop(scroll);
				} else {
					$button.status("default");
				}
			},
			error:function() {
				callback({success:false,error:"CONNECT_ERROR"});
				$button.status("default");
			}
		});
	},
	/**
	 * 채널타이틀을 출력한다.
	 *
	 * @param string title
	 */
	printTitle:function(title) {
		$("h1").html(title);
	},
	/**
	 * 접속자수를 표시한다.
	 *
	 * @param int count 접속자
	 */
	printUserCount:function(count) {
		var $count = $("label[data-role=count]");
		if (count == 0) {
			$count.empty();
		} else {
			$count.html(Minitalk.getText("text/unit").replace("{COUNT}",count));
		}
	},
	/**
	 * 에러메시지를 출력한다.
	 *
	 * @param string code 에러코드
	 * @param function callback
	 */
	printError:function(code,callback) {
		Minitalk.ui.closeWindow();
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
		if (Minitalk.socket.reconnectable == false) {
			var $error = $("<div>").attr("data-role","error");
			var $errorbox = $("<section>");
			$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
			$errorbox.append($("<p>").html(message));
			
			if (Minitalk.box.isBox() == true) {
				var $button = $("<button>").html(Minitalk.getText("button/close"));
				$button.on("click",function() {
					self.close();
				});
				
				$errorbox.append($button);
			} else {
				$errorbox.addClass("textonly");
			}
			$error.append($("<div>").append($errorbox));
			$("body").append($error);
		} else if (Minitalk.socket.isConnected() == false) {
			Minitalk.ui.notify("error","error",message,false,false);
		} else {
			Minitalk.ui.printSystemMessage("error",message);
		}
	},
	/**
	 * 시스템 메시지를 출력한다.
	 *
	 * @param string type 메시지타입 (system, error, notice)
	 * @param string message 메시지
	 */
	printSystemMessage:function(type,message) {
		var $chat = $("section[data-tab=chat]");
		if ($chat.length == 0) return;
		
		var $item = $("<div>").attr("data-role","item").addClass("system").addClass(type).html(message);
		$chat.append($item);
		Minitalk.ui.autoScroll($item);
	},
	/**
	 * 접속자 이벤트 메시지를 출력한다.
	 *
	 * @param string event 이벤트명
	 * @param object user 접속자객체
	 */
	printUserMessage:function(event,user) {
		var $chat = $("section[data-tab=chat]");
		if ($chat.length == 0) return;
		
		var $item = $("<div>").attr("data-role","user").addClass(event);
		
		var $photo = $("<div>").attr("data-role","photo");
		$photo.data("user",user);
		if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
		$photo.on("click",function(e) {
			Minitalk.user.toggleMenus($(this),e);
			e.preventDefault();
			e.stopImmediatePropagation();
		});
		$item.append($photo);
		
		var $nickname = $("<div>").attr("data-role","nickname").append(Minitalk.user.getTag(user,false));
		$item.append($nickname);
		
		var $messageBox = $("<div>").addClass("box");
		$item.append($messageBox);
		
		var $message = $("<div>");
		var $inner = $("<div>");
		$inner.append($("<span>").addClass("text").html(Minitalk.getText("action/" + event).replace("{NICKNAME}",Minitalk.user.getNickname(user,false))));
		
		$message.append($inner);
		$messageBox.append($message);
		
		$chat.append($item);
		
		Minitalk.ui.autoScroll($item);
	},
	/**
	 * 채팅메시지를 출력한다.
	 *
	 * @param string message 메시지 객체
	 * @param string type 메시지 타입 (실시간대화, 최근대화, 이전대화)
	 */
	printChatMessage:function(message,type) {
		var $chat = $("section[data-tab=chat]");
		if ($chat.length == 0) return;
		
		var type = type === undefined ? "realtime" : type;
		var is_log = type === "log" || type === "history";
		var $item = null;
		
		message.message = message.message.toString();
		
		/**
		 * 채팅메시지 및 귓속말인 경우
		 */
		if (message.type == "message" || message.type == "whisper") {
			var user = message.user;
			
			if (message.type == "whisper") {
				var to = message.to;
			} else {
				var to = null;
			}
			
			/**
			 * 기존 메시지가 변경된 것이 아닌 경우 새로운 대화객체를 생성한다.
			 */
			if (message.from === undefined) {
				/**
				 * 실시간 대화이거나 최근대화인 경우, 채팅영역 제일 마지막에 요소에 추가하고,
				 * 이전대화기록의 경우에는 이전대화 불러오기 버튼의 직전요소에 추가한다.
				 */
				if (type === "realtime" || type == "log") {
					var $item = $("> div[data-role]:last",$chat);
				} else {
					/**
					 * 이미 해당 대화가 존재한다면, 무시한다.
					 */
					if ($("div[data-message-id=" + message.id + "]",$chat).length > 0) return;
					
					var $history = $("button[data-action=history]",$chat);
					var $item = $history.prev();
				}
				
				/**
				 * 채팅탭 마지막객체에 메시지를 추가할 수 있다면, 해당 객체에 신규메시지를 추가하고, 그렇지 않다면 채팅메시지 객체를 신규로 생성한다.
				 */
				if ($item.length > 0 && $item.attr("data-role") == "message" && $item.hasClass("log") == is_log && $item.hasClass(message.type) == true && $item.data("nickname") == user.nickname && $item.data("to") == to && $item.position().top > 10) {
					var $messageBox = $("div.box",$item);
				} else {
					$item = $("<div>").attr("data-role","message").addClass(message.type).data("nickname",user.nickname).data("to",to);
					if (is_log === true) $item.addClass("log");
				
					var $photo = $("<div>").attr("data-role","photo");
					$photo.data("user",user);
					$photo.on("click",function(e) {
						Minitalk.user.toggleMenus($(this),e);
						e.preventDefault();
						e.stopImmediatePropagation();
					});
					if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
					$item.append($photo);
					
					if (message.type == "message") {
						var $nickname = $("<div>").attr("data-role","nickname").append(Minitalk.user.getTag(user,false));
						$item.append($nickname);
					} else if (message.type == "whisper") {
						if (message.to == Minitalk.user.me.nickname) {
							var $nickname = $("<div>").attr("data-role","nickname").html(Minitalk.getText("text/whisper_from").replace("{nickname}","<b>" + user.nickname + "</b>"));
							$("b",$nickname).replaceWith(Minitalk.user.getTag(message.user));
						} else {
							var $nickname = $("<div>").attr("data-role","nickname").html(Minitalk.getText("text/whisper_to").replace("{nickname}","<b>" + to + "</b>"));
							$("b",$nickname).replaceWith(Minitalk.user.getTag(message.to));
						}
						$item.append($nickname);
					}
				
					if (user.nickname == Minitalk.user.me.nickname) $item.addClass("me");
				
					var $messageBox = $("<div>").addClass("box");
					$item.append($messageBox);
					
					/**
					 * 실시간 대화이거나 최근대화인 경우, 채팅영역 제일 마지막에 요소에 추가하고,
					 * 이전대화기록의 경우에는 이전대화 불러오기 버튼의 직전요소에 추가한다.
					 */
					if (type == "realtime" || type == "log") {
						$chat.append($item);
					} else {
						var $history = $("button[data-action=history]",$chat);
						if ($history.length == 0) return;
						
						$history.before($item);
					}
				}
			}
			
			var $message = $("<div>").attr("data-message-id",message.id).attr("data-time",message.time);
			var $inner = $("<div>").attr("data-role","normal");
			$inner.append($("<span>").addClass("text").html(Minitalk.ui.decodeMessage(message.message)));
			
			if (message.time === undefined) {
				$inner.append($("<span>").addClass("time").html('<i class="sending"></i>'));
			} else if (message.fail === true) {
				$inner.append($("<span>").addClass("time").html('<i class="fail"></i>'));
			} else {
				$inner.append($("<span>").addClass("time").html($("<time>").attr("datetime",message.time).html(Minitalk.ui.getTime(message.time,Minitalk.dateFormat))));
			}
			
			$message.append($inner);
			
			/**
			 * 추가적인 정보가 있는 경우, 부가적인 정보박스를 추가한다.
			 */
			if (message.data) {
				var $box = $("<div>").attr("data-role",message.data.type);
				if (message.data.type == "website") {
					/**
					 * 비디오가 있을 경우, iframe 임베드처리
					 * @todo 공격용으로 사용될 수 있는가? 검증필요
					 */
					if (message.data.video != null) {
						var $video = $("<div>").attr("data-role","video");
						var $innervideo = $("<div>");
						var $iframe = $("<iframe>").attr("src",message.data.video.url);//.attr("frameborder",0).css("border",0).css("width","100%").css("height","100%");
						
						/**
						 * 가로 세로 크기 데이터가 있을 경우, 세로 % 를 계산하고, 그렇지 않은 경우 16:10 비율로 표시한다.
						 */
						if (message.data.video.width && message.data.video.height) {
							var height = Math.round(message.data.video.height / message.data.video.width * 100);
						} else {
							var height = 62;
						}
						$innervideo.css("paddingBottom",height + "%");
						$innervideo.append($("<div>").append($iframe));
						$video.append($innervideo);
						
						$box.append($video);
					} else {
						/**
						 * 웹사이트 이미지가 있는 경우, 해당 이미지 추가
						 */
						if (message.data.image != null) {
							var $link = $("<a>").attr("href",message.data.url).attr("target","_blank");
							var $image = $("<div>").attr("data-role","image");
							var $innerimage = $("<div>").css("backgroundImage","url(" + message.data.image.url + ")");
							/**
							 * 가로 세로 크기 데이터가 있을 경우, 세로 % 를 계산하고, 그렇지 않은 경우 16:10 비율로 표시한다.
							 */
							if (message.data.image.width && message.data.image.height) {
								var height = Math.round(message.data.image.height / message.data.image.width * 100);
							} else {
								var height = 62;
							}
							
							/**
							 * 세로로 긴 이미지 최대치를 지정한다.
							 */
							height = Math.min(height,200);
							$innerimage.css("paddingBottom",height + "%");
							$image.append($innerimage);
							$link.append($image);
							
							var $title = $("<h4>").html(message.data.title);
							$link.append($title);
							
							var $p = $("<p>").html(message.data.description);
							$link.append($p);
							
							$box.append($link);
						}
					}
				}
				
				$message.append($box);
			}
			
			if (message.from === undefined) {
				/**
				 * 기존 메시지가 변경된 것이 아닌 경우 대화객체를 추가한다.
				 */
				$messageBox.append($message);
				if (type != "history" || $item !== null) Minitalk.ui.autoScroll($item);
			} else {
				/**
				 * 기존 메시지가 변경되었을 경우 기존 대화내용을 대체하고 스크롤 위치를 조절한다.
				 */
				var oHeight = $("div[data-message-id="+message.from+"]").outerHeight(true);
				$("div[data-message-id="+message.from+"]").replaceWith($message);
				var nHeight = $("div[data-message-id="+message.id+"]").outerHeight(true);
				
				Minitalk.ui.scrollBy(nHeight - oHeight)
			}
		}
		
		/**
		 * 파일인 경우
		 */
		if (message.type == "file") {
			var user = message.user;
			
			/**
			 * 실시간 대화이거나 최근대화인 경우, 채팅영역 제일 마지막에 요소에 추가하고,
			 * 이전대화기록의 경우에는 이전대화 불러오기 버튼의 직전요소에 추가한다.
			 */
			if (type === "realtime" || type == "log") {
				var $item = $("> div[data-role]:last",$chat);
			} else {
				/**
				 * 이미 해당 대화가 존재한다면, 무시한다.
				 */
				if ($("div[data-message-id=" + message.id + "]",$chat).length > 0) return;
				
				var $history = $("button[data-action=history]",$chat);
				var $item = $history.prev();
			}
			
			/**
			 * 채팅탭 마지막객체에 메시지를 추가할 수 있다면, 해당 객체에 신규메시지를 추가하고, 그렇지 않다면 채팅메시지 객체를 신규로 생성한다.
			 */
			if ($item.length > 0 && $item.attr("data-role") == "message" && $item.hasClass("log") == is_log && $item.hasClass("message") == true && $item.data("nickname") == user.nickname && $item.data("to") == null && $item.position().top > 10) {
				var $messageBox = $("div.box",$item);
			} else {
				$item = $("<div>").attr("data-role","message").addClass("message").data("nickname",user.nickname);
				if (is_log === true) $item.addClass("log");
			
				var $photo = $("<div>").attr("data-role","photo");
				$photo.data("user",user);
				$photo.on("click",function(e) {
					Minitalk.user.toggleMenus($(this),e);
					e.preventDefault();
					e.stopImmediatePropagation();
				});
				if (user.photo) $photo.css("backgroundImage","url("+user.photo+")");
				$item.append($photo);
				
				var $nickname = $("<div>").attr("data-role","nickname").append(Minitalk.user.getTag(user,false));
				$item.append($nickname);
			
				if (user.nickname == Minitalk.user.me.nickname) $item.addClass("me");
			
				var $messageBox = $("<div>").addClass("box");
				$item.append($messageBox);
				
				/**
				 * 실시간 대화이거나 최근대화인 경우, 채팅영역 제일 마지막에 요소에 추가하고,
				 * 이전대화기록의 경우에는 이전대화 불러오기 버튼의 직전요소에 추가한다.
				 */
				if (type == "realtime" || type == "log") {
					$chat.append($item);
				} else {
					var $history = $("button[data-action=history]",$chat);
					if ($history.length == 0) return;
					
					$history.before($item);
				}
			}
			
			var $message = $("<div>").attr("data-message-id",message.id);
			var $inner = $("<div>").attr("data-role","file");
			
			var $link = $("<a>").attr("href",message.data.download);
			if (message.data.type == "image") {
				var $image = $("<div>").attr("data-role","image");
				var $innerimage = $("<div>").css("backgroundImage","url(" + message.data.view + ")");
				
				/**
				 * 가로 세로 크기 데이터가 있을 경우, 세로 % 를 계산하고, 그렇지 않은 경우 16:10 비율로 표시한다.
				 */
				if (message.data.width && message.data.height) {
					var height = Math.round(message.data.height / message.data.width * 100);
				} else {
					var height = 62;
				}
				
				/**
				 * 세로로 긴 이미지 최대치를 지정한다.
				 */
				height = Math.min(height,200);
				$innerimage.css("paddingBottom",height + "%");
				$image.append($innerimage);
				$link.append($image);
			} else {
				var $icon = $("<i>").attr("data-role","file").attr("data-type",message.data.type).attr("data-extension",message.data.extension);
				var $name = $("<b>").html(message.data.name);
				var $info = $("<p>");
				var $size = $("<span>").addClass("size").html(MinitalkComponent.getFileSize(message.data.size));
				
				// @todo 파일 만료일 표시
//				var $exp_date = $("<time>");
				$info.append($size);
				
				$link.append($icon);
				$link.append($name);
				$link.append($info)
			}
			
			$inner.append($link);
			$message.append($inner);
			
			$messageBox.append($message);
			if ($item !== null) Minitalk.ui.autoScroll($item);
		}
	},
	/**
	 * 파일을 업로드한다.
	 */
	uploadFiles:function() {
		var $file = $("input[type=file]");
		
		/**
		 * 서버접속중이 아니라면 파일전송을 중단한다.
		 */
		if (Minitalk.socket.isConnected() === false) {
			$file.data("files",null);
			$file.data("drafts",null);
			$file.data("current",null);
			$file.val("");
		}
		
		Minitalk.ui.disable(true);
		
		var files = $file.data("files") !== null && typeof $file.data("files") == "object" && $file.data("files").length > 0 ? $file.data("files") : [];
		if (files.length == 0) return;
		
		var current = $file.data("current") !== null && typeof $file.data("current") == "number" ? $file.data("current") : null;
		var drafts = $file.data("drafts") !== null && typeof $file.data("drafts") == "object" && $file.data("drafts").length > 0 ? $file.data("drafts") : [];
		
		/**
		 * 파일이 전송중이라면, 이어서 전송하고 아니라면 대용량 업로드를 위한 업로드주소를 할당받는다.
		 */
		if (current === null) {
			var drafts = [];
			for (var i=0, loop=files.length;i<loop;i++) {
				var draft = {};
				draft.name = files[i].name;
				draft.size = files[i].size;
				draft.type = files[i].type;
				
				drafts.push(draft);
			}
			$.send(Minitalk.getProcessUrl("uploadFiles"),{channel:Minitalk.channel,drafts:JSON.stringify(drafts),user:JSON.stringify(Minitalk.user.me)},function(result) {
				if (result.success == true) {
					$file.data("drafts",result.drafts);
					$file.data("current",0);
					
					for (var i=0, loop=files.length;i<loop;i++) {
						files[i].uploaded = 0;
					}
					
					Minitalk.ui.uploadFiles();
				} else {
					// @todo 파일정보전송 실패시 에러메시지 출력
				}
			});
		} else {
			var draft = drafts[current];
			var file = files[current];
			if (draft === undefined || file === undefined) return;
			
			var chunkSize = 2 * 1000 * 1000;
			file.chunk = file.size > file.uploaded + chunkSize ? file.uploaded + chunkSize : file.size;
			
			$.ajax({
				url:Minitalk.getProcessUrl("uploadFiles")+"?code="+encodeURIComponent(draft.code),
				method:"POST",
				contentType:file.type,
				headers:{
					"Content-Range":"bytes " + file.uploaded + "-" + (file.chunk - 1) + "/" + file.size
				},
				xhr:function() {
					var xhr = $.ajaxSettings.xhr();
	
					if (xhr.upload) {
						xhr.upload.addEventListener("progress",function(e) {
							if (e.lengthComputable) {
								// @todo 여러개의 파일업로드를 동시에 진행할때, 프로그래스바를 어떻게 보이게 할 것인가?
								Minitalk.ui.progress(file.uploaded + e.loaded,file.size);
							}
						},false);
					}
	
					return xhr;
				},
				processData:false,
				data:file.slice(file.uploaded,file.chunk)
			}).done(function(result) {
				if (result.success == true) {
					file.failCount = 0;
					file.uploaded = result.uploaded;
					
					/**
					 * 하나의 파일의 전송이 모두 완료되었을 경우
					 */
					if (file.chunk == file.size) {
						/**
						 * 파일정보를 읽은 후 채팅서버에 전송한다.
						 */
						Minitalk.socket.send("file",result.file);
						
						/**
						 * 다음에 업로드해야하는 파일이 존재할 경우
						 */
						if (files.length > current + 1) {
							$file.data("current",current + 1);
							Minitalk.ui.uploadFiles();
						} else {
							/**
							 * 모든파일의 업로드가 완료되었을 경우
							 */
							$file.data("files",null);
							$file.data("drafts",null);
							$file.data("current",null);
							$file.val("");
							
							/**
							 * UI를 다시 활성화한다.
							 */
							Minitalk.ui.enable(true);
						}
					} else {
						Minitalk.ui.uploadFiles();
					}
				} else {
					if (file.failCount < 3) {
//						file.failCount++;
//						Attachment.upload(id);
					} else {
//						file.status = "FAIL";
					}
				}
			}).fail(function() {
				if (file.failCount < 3) {
//					file.failCount++;
//					Attachment.upload(id);
				}
			});
		}
	},
	/**
	 * 프로그래스바를 출력한다.
	 *
	 * @param int current 현재 진행율
	 * @param int total 전체 진행율
	 */
	progress:function(current,total) {
		var $progress = $("div[data-role=progress]");
		if (total == 0) {
			$("div",$progress).css("width",0);
			$progress.hide();
			return;
		}
		
		$("div",$progress).css("width",Math.round(current / total * 100) + "%");
		$progress.show();
		
		if (current == total) {
			setTimeout(function($progress) { $("div",$progress).css("width",0); $progress.hide(); },1000,$progress);
		}
	},
	/**
	 * 채팅창의 스크롤을 특정위치로 이동한다.
	 *
	 * @param object $item 이동할 위치의 DOM객체
	 */
	autoScroll:function($item) {
		var $chat = $("section[data-tab=chat]");
		if ($chat.length == 0) return;
		
		var $item = $item ? $item : $("div[data-role=item]:last",$chat);
		if ($item === true || $chat.prop("scrollHeight") - $chat.scrollTop() - $chat.height() < $item.outerHeight(true) + 10) {
			$chat.scrollTop($chat.prop("scrollHeight"));
		}
	},
	/**
	 * 채팅창의 특정픽셀만큼 스크롤한다.
	 *
	 * @param int scroll 스크롤할 픽셀
	 */
	scrollBy:function(scroll) {
		var $chat = $("section[data-tab=chat]");
		if ($chat.length == 0) return;
		
		$chat.scrollTop($chat.scrollTop() + scroll);
	},
	/**
	 * 메시지 입력창의 내용을 수정한다.
	 *
	 * @param string message 수정할 내용
	 */
	setInputVal:function(value) {
		var $input = $("div[data-role=input] > textarea");
		$input.focus().val(value);
	},
	/**
	 * 입력폼의 내용에 따라 입력폼의 높이를 조절한다.
	 */
	updateInputHeight:function() {
		var $input = $("div[data-role=input] > textarea");
		$input.css("height","");
		
		var oHeight = $input.outerHeight();
		var maxHeight = Math.min($input.prop("scrollHeight"),150);
		
		if ($input.outerHeight() < maxHeight) {
			$input.outerHeight(maxHeight);
		}
		
		var $chat = $("section[data-tab=chat]");
		$chat.css("top",oHeight - maxHeight);
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
		 * 콜백함수가 있거나, 자동닫기가 활성화되어있거나, 닫을 수 있는 알림인 경우 닫기버튼을 추가한다.
		 */
		var closable = closable === false && autoHide === false ? false : true;
		if (typeof callback == "function" || closable === true) {
			if (typeof callback == "function") {
				$balloon.addClass("callback");
				$balloon.on("click",function() {
					var $notification = $(this).parent();
					callback($notification);
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
	decodeMessage:function(message) {
		/**
		 * 이모티콘을 치환한다.
		 */
		message = message.replace(/\[#([a-z0-9]+)\/([a-z0-9\.]+)\]/gi,'<img src="' + Minitalk.getUrl() + '/emoticons/$1/items/$2" style="vertical-align:middle;">');
		
		return message;
	},
	/**
	 * 메시지를 전송한다.
	 */
	sendMessage:function(message) {
		var message = $.trim(message);
		if (message.length == 0) return;
		
		/**
		 * 전송버튼이 비활성화 되었을 경우 모든 처리를 중단한다.
		 */
		if ($("div[data-role=input] > button").is(":disabled") == true) return;
		
		/**
		 * 슬래시(/) 명령어 처리
		 */
		if (message.indexOf("/") === 0) {
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
					 * 메시지의 고유 ID를 할당한다.
					 */
					var uuid = uuidv4();
					
					/**
					 * 서버로 메시지를 전송한다.
					 */
					Minitalk.socket.send("whisper",{id:uuid,type:"whisper",to:nickname,message:message});
					
					/**
					 * 자신의 메시지를 화면에 출력한다.
					 */
					Minitalk.ui.printChatMessage({id:uuid,type:"whisper",to:nickname,message:Minitalk.ui.encodeMessage(message),user:Minitalk.user.me});
					Minitalk.ui.disable(true);
					
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
				 * 채널관리자 로그인
				 */
				case "login" :
					if (Minitalk.user.me.level == 9) {
						Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("ALREADY_LOGGED"));
						Minitalk.ui.setInputVal("");
						return;
					}
					
					Minitalk.socket.send("login",commands.join(" "));
					break;
					
				/**
				 * 채널관리자 로그아웃
				 */
				case "logout" :
					if (Minitalk.user.me.level != 9) {
						Minitalk.ui.printSystemMessage("error",Minitalk.getErrorText("FORBIDDEN"));
						Minitalk.ui.setInputVal("");
						return;
					}
					
					Minitalk.socket.send("logout");
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
		} else {
			/**
			 * 메시지 전송전 이벤트 처리
			 */
			if (Minitalk.fireEvent("beforeSendMessage",[message,Minitalk.user.me]) === false) return;
			
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
			
			/**
			 * 자신의 메시지를 화면에 출력한다.
			 */
			Minitalk.ui.printChatMessage({id:uuid,type:"message",message:Minitalk.ui.encodeMessage(message),user:Minitalk.user.me});
			Minitalk.ui.disable(true);
			
			/**
			 * 메시지 전송후 이벤트 처리
			 */
			Minitalk.fireEvent("sendMessage",[message,Minitalk.user.me]);
		}
		
		Minitalk.ui.setInputVal("");
	},
	/**
	 * 사운드를 재생한다.
	 *
	 * @param string sound 사운드파일명
	 * @todo 브라우저 정책에 따른 수정필요
	 */
	playSound:function(sound) {
		if (Minitalk.configs("mute") === true) return;
		
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
	 * 토글된 객체를 초기화한다.
	 */
	resetToggle:function() {
		$("aside").removeClass("open");
		$("footer").removeClass("open");
		
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