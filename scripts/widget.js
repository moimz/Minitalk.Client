/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 채팅위젯 내부 클래스를 정의한다.
 * 
 * @file /scripts/widget.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2021. 1. 24.
 */
var MinitalkComponent = parent.MinitalkComponent;
var Minitalk = MinitalkComponent.get($("html").attr("data-id"));

$(document).ready(function() {
	/**
	 * 에러가 발생했다면, 에러코드를 출력한다.
	 */
	if ($("body").attr("data-error")) {
		var $error = $("<div>").attr("data-role","error");
		var $errorbox = $("<section>");
		$errorbox.append($("<h2>").html(Minitalk.getText("text/error")));
		$errorbox.append($("<p>").html(Minitalk.getText("error/"+$("body").attr("data-error"))));
		$errorbox.append($("<a>").attr("href","https://www.minitalk.io/ko/manual/documents").attr("target","_blank").html(Minitalk.getText("text/document")));
		$error.append($("<div>").append($errorbox));
		$("body").append($error);
		return;
	}
	
	/**
	 * 이벤트리스너를 등록한다.
	 */
	for (var eventName in Minitalk.listeners) {
		Minitalk.on(eventName,Minitalk.listeners[eventName]);
	}
	
	/**
	 * 채팅위젯 클래스를 초기화한다.
	 */
	Minitalk.user.init();
	Minitalk.ui.init();
	
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
});