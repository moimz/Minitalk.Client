/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 개인채널 개설/참여와 관련된 클래스를 정의한다.
 * 
 * @file /scripts/widget.box.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2021. 1. 24.
 */
Minitalk.box = {
	connection:null,
	types:{talk:{title:Minitalk.getText("box/talk"),width:400,height:600}},
	/**
	 * 박스에 접속하였을 경우 박스를 초기화한다.
	 */
	init:function() {
		Minitalk.box.connection = box;
		
		$("body").html(MinitalkComponent.getLoaderHtml());
		
		/**
		 * 기본 토크박스인 경우, 미니톡 기본 UI 요소를 구성하고, 플러그인 박스인 경우 해당 플러그인에서 UI 를 처리하도록 한다.
		 */
		if (Minitalk.box.connection.type == "talk") {
			Minitalk.ui.init();
		} else {
			var plugin = Minitalk.plugins[Minitalk.box.connection.type];
			if (plugin === undefined) {
				
				return;
			}
			
			var html = plugin.getBoxHtml();
			Minitalk.ui.init(html);
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
			if (Minitalk.socket.isConnected() === false) return;
			if (Minitalk.socket.getPermission("box") === false) {
				Minitalk.ui.printError("FORBIDDEN");
				return;
			}
			
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
						'<hr>',
						'<label class="checkbox">',
							'<input type="checkbox" name="closemode" value="owner">' + Minitalk.getText("box/closemode"),
							'<p>' + Minitalk.getText("box/closemode_help") + '</p>',
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
					
					$button.status("loading");
					
					var title = $.trim($("input[name=title]",$dom).val());
					var type = $.trim($("select[name=type]",$dom).val());
					var password = $.trim($("input[name=password]",$dom).val());
					var closemode = $("input[name=closemode]",$dom).checked() ? "owner" : "all";
					
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
					box.closemode = closemode;
					
					Minitalk.box.open(box);
				}
				
				Minitalk.ui.closeWindow();
			});
		}
	},
	/**
	 * 현재 접속중인 채널이 박스인지 아닌지 확인한다.
	 *
	 * @return boolean isBox
	 */
	isBox:function() {
		return Minitalk.box.connection !== null;
	},
	/**
	 * 현재 접속중인 박스아이디를 가져온다.
	 *
	 * @return string id
	 */
	getId:function() {
		return Minitalk.box.isBox() === true ? Minitalk.box.connection.id : null;
	},
	/**
	 * 현재 접속중인 박스종류를 가져온다.
	 *
	 * @return string type
	 */
	getType:function() {
		return Minitalk.box.isBox() === true ? Minitalk.box.connection.type : null;
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
			dom.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/common.css" type="text/css">');
			dom.write('<link rel="stylesheet" href="'+MinitalkComponent.getUrl()+'/styles/box.css.php?channel='+Minitalk.channel+'&templet='+Minitalk.templet+'&type='+box.type+'" type="text/css">');
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
	 * 나의 박스에 초대한다.
	 *
	 * @param string nickname 초대할 유저닉네임
	 * @param string id 박스아이디
	 */
	invite:function(nickname) {
		if (Minitalk.socket.isConnected() === false) callback({success:false,error:"NOT_CONNECTED"});
	
		$.get({
			url:Minitalk.socket.connection.domain+"/myboxes",
			dataType:"json",
			headers:{authorization:"TOKEN " + Minitalk.socket.token},
			success:function(result) {
				if (result.success == true) {
					if (result.boxes.length == 0) {
						Minitalk.ui.printError("NOT_FOUND_MYBOX");
						return;
					}
					
					/**
					 * 박스 초대 HTML 을 정의한다.
					 */
					var html = [
						'<section data-role="invite">',
							'<h2>' + Minitalk.getText("box/invite") + '</h2>',
							'<button data-action="close"></button>',
							'<div data-role="content">',
								'<label>',
									'<input type="text" name="nickname" placeholder="' + Minitalk.getText("box/invite_nickname") + '" value="' + nickname + '">',
									'<p>' + Minitalk.getText("box/invite_nickname_help") + '</p>',
								'</label>',
								'<label data-role="select">',
									'<select name="id"></select>',
									'<p>' + Minitalk.getText("box/invite_id_help") + '</p>',
								'</label>',
								'<hr>',
								'<label class="checkbox">',
									'<input type="checkbox" name="password" value="TRUE">' + Minitalk.getText("box/invite_password"),
									'<p>' + Minitalk.getText("box/invite_password_help") + '</p>',
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
					
					Minitalk.ui.createWindow(html,400,function($dom) {
						for (var i=0, loop=result.boxes.length;i<loop;i++) {
							$("select[name=id]",$dom).append($("<option>").attr("value",result.boxes[i].id).data("box",result.boxes[i]).html(result.boxes[i].title));
						}
						
						$("button[data-action]",$dom).on("click",function() {
							var $button = $(this);
							var action = $button.attr("data-action");
							
							if (action == "confirm") {
								if (Minitalk.socket.isConnected() === false) {
									Minitalk.ui.printError("NOT_CONNECTED");
									return;
								}
								
								$button.status("loading");
								
								var id = $("select[name=id]",$dom).val();
								var nickname = $.trim($("input[name=nickname]",$dom).val());
								var box = $("select[name=id] > option:selected",$dom).data("box");
								box.password = $("input[name=password]",$dom).checked() == true ? box.password : null;
								
								if (Minitalk.fireEvent("beforeInvite",[box,nickname,Minitalk.user.me]) === false) return;
								
								$.post({
									url:Minitalk.socket.connection.domain+"/invite/" + id,
									dataType:"json",
									headers:{authorization:"TOKEN " + Minitalk.socket.token},
									data:{nickname:nickname,box:JSON.stringify(box)},
									success:function(result) {
										if (result.success == true) {
											Minitalk.ui.printSystemMessage("info",Minitalk.getText("action/invite").replace("{NICKNAME}",nickname).replace("{BOX}",box.title));
											Minitalk.ui.closeWindow(true);
											
											Minitalk.fireEvent("invite",[box,nickname,Minitalk.user.me]);
										}
									},
									error:function(result) {
										if (result.status == 403 || result.status == 404) {
											Minitalk.ui.printError(Minitalk.getErrorCode(result.status));
										} else {
											Minitalk.ui.printError("CONNECT_ERROR");
										}
									}
								});
							} else {
								Minitalk.ui.closeWindow();
							}
						});
					});
				}
			},
			error:function(result) {
				if (result.status == 403 || result.status == 404) {
					Minitalk.ui.printErrorCode(result.status);
				} else {
					callback({success:false,error:"CONNECT_ERROR"});
				}
			}
		});
	},
	/**
	 * 개인박스에 초대받았을 경우
	 *
	 * @param object box 박스정보
	 * @param object from 초대자정보
	 */
	invited:function(box,from) {
		if (Minitalk.fireEvent("beforeInvited",[box,from,Minitalk.user.me]) === false) return;
		
		Minitalk.ui.notify("invite-" + box.id,"action",Minitalk.getText("action/invited").replace("{FROM}",from.nickname).replace("{BOX}",box.title),false,false,box,function($notification) {
			var box = $notification.data("data");
			
			if (confirm(Minitalk.getText("action/invited_confirm")) == true) {
				Minitalk.box.join(box);
			}
			
			Minitalk.ui.unnotify("invite-" + box.id,0);
		});
		
		Minitalk.ui.playSound("query");
		Minitalk.fireEvent("invited",[box,from,Minitalk.user.me]);
	}
};