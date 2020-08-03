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
				'<h2>' + Minitalk.getText("box/create") + '</h2>',
				'<button data-action="close"></button>',
				'<div data-role="content">',
					'<h4>' + Minitalk.getText("config/title/default") + '</h4>',
					'<div data-role="input"><input type="text" name="title" value="test"></div>',
					'<div data-role="input"><select name="type"></select></div>',
					'<div data-role="input"><input type="password" name="password"></div>',
				'</div>',
				'<div data-role="button">',
					'<ul>',
						'<li><button type="button" data-action="cancel">' + Minitalk.getText("button/cancel") + '</button></li>',
						'<li><button type="button" data-action="confirm">' + Minitalk.getText("button/confirm") + '</button></li>',
					'</ul>',
				'</div>'
			];
			html = html.join("");
			
			Minitalk.ui.createWindow(html,500,Minitalk.box.create);
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
	 * 박스의 형태를 추가한다.
	 *
	 * @param string type 타입
	 * @param string title 타입명
	 * @param int width 박스가로크기
	 * @param int height 박스세로크기
	 */
	addType:function(type,title,width,height) {
		console.log(type,title);
		Minitalk.box.types[type] = {title:title,width:width,height:height};
	}
};