/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인채널 개설/참여와 관련된 클래스를 정의한다.
 * 
 * @file /scripts/widget.box.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 7. 8.
 */
Minitalk.box = {
	connection:null,
	types:{talk:{title:Minitalk.getText("box/talk"),width:400,height:600}},
	init:function() {
		Minitalk.box.connection = box;
		
		$("body").html(MinitalkComponent.getLoaderHtml());
		
		/**
		 * 기본 토크박스인 경우, 미니톡 기본 UI 요소를 구성하고, 플러그인 박스인 경우 해당 플러그인에서 UI 를 처리하도록 한다.
		 */
		if (Minitalk.box.connection.type == "talk") {
			Minitalk.ui.init();
		} else {
			
		}
		
		/**
		 * 로딩 레이어를 제거한다.
		 */
		$("body > div[data-role=loading]").remove();
	},
	/**
	 * 박스를 개설한다.
	 *
	 * @param object $dom 박스개설 윈도우 DOM 객체 (없을경우, DOM을 생성하고, 있을경우 해당 DOM 에 이벤트를 정의한다.)
	 */
	create:function($dom) {
		if ($dom === undefined) {
			/**
			 * 박스 개설 HTML 을 정의한다.
			 */
			var html = [
				'<section data-role="create">',
					'<h2>' + Minitalk.getText("box/create") + '</h2>',
					'<button data-action="close"></button>',
					'<div data-role="content">',
						'<label><input type="text" name="title" placeholder="' + Minitalk.getText("box/title") + '"></label>',
						'<label><select name="type"></select></label>',
						'<label>',
							'<input type="text" name="password" placeholder="' + Minitalk.getText("box/password") + '">',
							'<p>' + Minitalk.getText("box/password_help") + '</p>',
						'</label>',
					'</div>',
					'<div data-role="button">',
						'<ul>',
							'<li><button type="button" data-action="cancel">' + Minitalk.getText("button/cancel") + '</button></li>',
							'<li><button type="button" data-action="confirm">' + Minitalk.getText("button/confirm") + '</button></li>',
						'</ul>',
					'</div>',
				'</section>'
			];
			html = html.join("");
			
			Minitalk.ui.createWindow(html,400,Minitalk.box.create);
		} else {
			/**
			 * 박스 플러그인 등으로 부터 박스 종류를 불러온다.
			 */
			for (var type in Minitalk.box.types) {
				var $option = $("<option>").attr("value",type).text(Minitalk.box.types[type].title);
				$("select[name=type]",$dom).append($option);
			}
			
			$("button[data-action]",$dom).on("click",function() {
				var $button = $(this);
				var action = $button.attr("data-action");
				
				if (action == "confirm") {
					if (Minitalk.socket.isConnected() === false) {
						Minitalk.ui.printError("NOT_CONNECTED");
						return;
					}
					
					var title = $.trim($("input[name=title]",$dom).val());
					var type = $.trim($("select[name=type]",$dom).val());
					var password = $.trim($("input[name=password]",$dom).val());
					
					if (title.length == 0) {
						$("input[name=title]",$dom).status("error",Minitalk.getErrorText("REQUIRED"));
						return;
					}
					
					/**
					 * 박스정보를 담는다.
					 */
					var box = {};
					box.mode = "create";
					box.title = title;
					box.type = type;
					box.password = password.length == 0 ? null : password;
					
					Minitalk.box.open(box);
				}
				
				Minitalk.ui.closeWindow();
			});
		}
	},
	/**
	 * 박스에 참여한다.
	 *
	 * @param string box 박스고유값
	 */
	join:function(box) {
		var type = Minitalk.box.types[box.type] !== undefined ? Minitalk.box.types[box.type] : null;
		if (type == null) return;
		
		box.mode = "join";
		Minitalk.box.open(box);
	},
	/**
	 * 박스 팝업윈도우를 오픈한다.
	 *
	 * @param object box 박스정보
	 */
	open:function(box) {
		var type = Minitalk.box.types[box.type] !== undefined ? Minitalk.box.types[box.type] : null;
		if (type == null) return;
		
		/**
		 * 박스 팝업윈도우를 오픈한다.
		 */
		var width = type.width;
		var height = type.height;
		var windowLeft = Math.ceil((screen.availWidth - width) / 2);
		var windowTop = Math.ceil((screen.availHeight - height) / 2);
		
		var opener = window.open("","","top="+windowTop+",left="+windowLeft+",width="+width+",height="+height+",scrollbars=0");
		if (opener) {
			var dom = opener.document;
		} else {
			Minitalk.ui.printError("BLOCKED_POPUP");
			return;
		}
		
		if (dom !== null) {
			/**
			 * 박스 개설 팝업윈도우의 DOM 객체를 정의한다.
			 */
			dom.removeChild(dom.documentElement);
			
			dom.open();
			dom.write('<!DOCTYPE HTML>');
			dom.write('<html data-id="'+Minitalk.id+'">');
			dom.write('<head>');
			dom.write('<meta charset="utf-8">');
			dom.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
			dom.write('<title>MiniTalk Widget</title>');
			dom.write('<script src="'+MinitalkComponent.getUrl()+'/scripts/box.js.php?channel='+Minitalk.channel+'&templet='+Minitalk.templet+'"></script>');
			dom.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/widget.css.php?channel='+Minitalk.channel+'&templet='+Minitalk.templet+'" type="text/css">');
			dom.write('<script>var box = '+JSON.stringify(box)+';</script>');
			dom.write('</head>');
			dom.write('<body>'+MinitalkComponent.getLoaderHtml()+'</body>');
			dom.write('</html>');
			dom.close();
			
			var $dom = $(dom);
			$dom.data("width",width);
			$dom.data("height",height);
			var $target = $(opener);
			$dom.data("target",$target);
			$dom.ready(function() {
				setTimeout(function($dom) {
					var width = $dom.data("width");
					var height = $dom.data("height");
					
					if (screen.availHeight < height) height = screen.availHeight - 50;
					var windowLeft = (screen.availWidth - width) / 2;
					var windowTop = (screen.availHeight - height) / 2;
					
					var resizeWidth = width - $($dom.data("target").get(0).window).width();
					var resizeHeight = height - $($dom.data("target").get(0).window).height();
					
					$dom.data("target").get(0).resizeBy(resizeWidth,resizeHeight);
					$dom.data("target").get(0).moveTo(windowLeft,windowTop);
				},100,$dom);
			});
		}
	},
	/**
	 * 박스목록을 가져온다.
	 *
	 * @param int page 박스목록페이지번호
	 * @param string keyword 검색어
	 * @param function callback
	 */
	getBoxes:function(page,keyword,callback) {
		if (Minitalk.socket.isConnected() === false) callback({success:false,error:"NOT_CONNECTED"});
		
		$.get({
			url:Minitalk.socket.connection.domain+"/boxes",
			dataType:"json",
			data:{start:(page - 1),limit:50,keyword:keyword},
			headers:{authorization:"TOKEN " + Minitalk.socket.token},
			success:function(result) {
				if (result.success == true && result.boxes === undefined) result.success = false;
				callback(result);
			},
			error:function() {
				callback({success:false,error:"CONNECT_ERROR"});
			}
		});
	},
	/**
	 * 박스태그를 가져온다.
	 *
	 * @param object user 유저객체
	 * @return object $user 유저태그
	 */
	getTag:function(box) {
		var $box = $("<label>").attr("data-role","box").data("box",box);
		
		var $icon = $("<i>").addClass("icon");
		if (box.type == "talk") {
			$icon.addClass("talk");
		} else {
			$icon.css("background-image","url(./plugins/" + box.type + "/images/icon.png");
		}
		$box.append($icon);
		
		var $title = $("<span>").addClass("title");
		if (box.password !== null) {
			var $secret = $("<i>").addClass("secret").html(Minitalk.getText("text/secret"));
			$title.append($secret);
		}
		
		$title.append(box.title);
		
		$box.append($title);
		
		$box.on("click",function(e) {
			Minitalk.box.join($(this).data("box"));
			e.preventDefault();
			e.stopImmediatePropagation();
		});
		
		return $box;
	},
	/**
	 * 박스의 형태를 추가한다.
	 *
	 * @param string type 타입
	 * @param string title 타입명
	 * @param int width 박스가로크기
	 * @param int height 박스세로크기
	 */
	addType:function(type,title,width,height) {
		Minitalk.box.types[type] = {title:title,width:width,height:height};
	}
};