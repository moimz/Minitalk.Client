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
			for (var i=0, loop=Minitalk.box.types.length;i<loop;i++) {
				var $option = $("<option>").attr("value",Minitalk.box.types[i].type).text(Minitalk.box.types[i].title);
				$("select[name=type]",$dom).append($option);
			}
			
			$("button[data-action]",$dom).on("click",function() {
				var $button = $(this);
				var action = $button.attr("data-action");
				
				if (action == "confirm") {
					var title = $.trim($("input[name=title]",$dom).val());
					var type = $.trim($("select[name=type]",$dom).val());
					var password = $.trim($("input[name=password]",$dom).val());
					
					if (title.length == 0) {
						$("input[name=title]",$dom).status("error",Minitalk.getErrorText("REQUIRED"));
						return;
					}
					
					var box = {};
					box.title = title;
					box.type = type;
					box.password = password.length == 0 ? null : password;
					
					/**
					 * 박스 팝업윈도우를 오픈한다.
					 */
					var width = 1500;
					var height = 1000;
					var windowLeft = Math.ceil((screen.width-width)/2);
					var windowTop = Math.ceil((screen.height-height)/2 > 2);
					
					var createWindow = window.open("","createWindow","top="+windowTop+",left="+windowLeft+",width="+width+",height="+height+",scrollbars=0");
					if (createWindow) {
						/**
						 * 박스 개설 팝업윈도우의 DOM 객체를 정의한다.
						 */
						createWindow.document.removeChild(createWindow.document.documentElement);
						
						createWindow.document.open();
						createWindow.document.write('<!DOCTYPE HTML>');
						createWindow.document.write('<html data-id="'+Minitalk.id+'">');
						createWindow.document.write('<head>');
						createWindow.document.write('<meta charset="utf-8">');
						createWindow.document.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
						createWindow.document.write('<title>'+box.title+'</title>');
						createWindow.document.write('<script src="'+MinitalkComponent.getUrl()+'/scripts/box.js.php?channel='+Minitalk.channel+'&templet='+Minitalk.templet+'"></script>');
						createWindow.document.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/box.css.php?channel='+Minitalk.channel+'&templet='+Minitalk.templet+'" type="text/css">');
						createWindow.document.write('<script>var box = '+JSON.stringify(box)+';</script>');
						createWindow.document.write('</head>');
						createWindow.document.write('<body data-mode="create" data-usercode="'+Minitalk.usercode+'" data-authorization="'+Minitalk.session("authorization")+'">'+MinitalkComponent.getLoaderHtml()+'</body>');
						createWindow.document.write('</html>');
						createWindow.document.close();
					} else {
						Minitalk.ui.alert("error",Minitalk.getErrorText("BLOCKED_POPUP"));
						return false;
					}
				}
				
				Minitalk.ui.closeWindow();
			});
		}
	},
};