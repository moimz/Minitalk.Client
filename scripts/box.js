/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인박스 내부 클래스를 정의한다.
 * 
 * @file /scripts/box.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.6.0
 * @modified 2021. 9. 27.
 */
var MinitalkComponent = opener.MinitalkComponent.clone();
var Minitalk = MinitalkComponent.get($("html").attr("data-id"),true);

$(document).ready(function() {
	/**
	 * 에러가 발생했다면, 에러코드를 출력한다.
	 */
	if ($("body").attr("data-error")) {
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(Minitalk.getText("error/"+$("body").attr("data-error"))));
		$errorbox.append($("<a>").attr("href","https://www.minitalk.io/").attr("target","_blank").html(Minitalk.getText("text/minitalk_homepage")));
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
		return;
	}
	
	/**
	 * 개인박스 클래스를 초기화한다.
	 */
	Minitalk.box.init();
	
	/**
	 * 활성화된 플러그인을 초기화한다.
	 */
	for (var plugin in Minitalk.plugins) {
		if (typeof Minitalk.plugins[plugin].init == "function") {
			Minitalk.plugins[plugin].init();
		}
	}
	
	/**
	 * 채팅위젯 템플릿 스타일시트를 새로 불러왔을 경우, 스타일시트에 영향을 받는 요소를 초기화한다.
	 */
	$("link[rel=stylesheet]").on("load",function() {
		Minitalk.ui.initFrame();
	});
	
	/**
	 * 초기화완료 이벤트를 발생한다.
	 */
	Minitalk.fireEvent("init");
	
	/**
	 * 소켓서버에 접속한다.
	 */
	Minitalk.socket.connect();
	
	/**
	 * 박스가 종료될 때, 박스관련 변수들을 초기화하고, 박스목록을 갱신한다.
	 */
	$(window).on("beforeunload",function() {
		try {
			window.sessionStorage.removeItem("minitalk-" + Minitalk.version + "-" + Minitalk.box.connection.id);
			window.localStorage.removeItem("minitalk-" + Minitalk.version + "-" + Minitalk.box.connection.id);
			window.sessionStorage.removeItem("minitalk-" + Minitalk.version + "-" + Minitalk.box.connection.id + "-extras");
			window.localStorage.removeItem("minitalk-" + Minitalk.version + "-" + Minitalk.box.connection.id + "-extras");
			opener.Minitalk.ui.createBoxes();
		} catch (e) {
		}
	});
});