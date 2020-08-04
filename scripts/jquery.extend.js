/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * jQuery 의 기능을 확장하기 위한 클래스
 * 
 * @file /scripts/jquery.extend.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 7.0.0
 * @modified 2020. 3. 16.
 */
(function($) {
	$.propHooks.disabled = {
		set:function(el,value) {
			el.disabled = value;
			if (value == true) $(el).trigger("disable");
			else $(el).trigger("enable");
		}
	};
	
	$.propHooks.checked = {
		set:function(el,value) {
			el.checked = value;
			if (value == true) $(el).trigger("change");
			else $(el).trigger("change");
		}
	};
	
	$.attrHooks.disabled = {
		set:function(el,value) {
			el.disabled = value;
			if (value == true) $(el).trigger("disable");
			else $(el).trigger("enable");
		}
	};
	
	$.attrHooks.checked = {
		set:function(el,value) {
			el.checked = value;
			if (value == true) $(el).trigger("change");
			else $(el).trigger("change");
		}
	};
	
	$.valHooks.select = {
		set:function(el,value) {
			if (typeof value == "string" && $(el).val() != value) {
				el.value = value;
				$(el).trigger("change");
			}
		}
	};
	
	/**
	 * jQuery ajax 확장
	 *
	 * @param string url 데이터를 전송할 URL
	 * @param object data 전송할 데이터 (data 가 없을 경우 2번째 인자가 콜백함수가 될 수 있다.)
	 * @param function callback 콜백함수
	 */
	$.send = function(url,data,callback,count) {
		if (typeof data == "function") {
			callback = data;
			data = null;
		}
		var count = count !== undefined ? count : 0;
		
		$.ajax({
			type:"POST",
			url:url,
			data:data,
			dataType:"json",
			success:function(result) {
				if (typeof callback == "function" && callback(result) === false) return false;
				if (result.success == false) {
					if (result.message || result.error) {
						if (typeof Ext == "object") {
							Ext.Msg.show({title:Minitalk.getText("text/error"),msg:result.message ? result.message : result.error,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
						} else {
							if (result.message && Minitalk.alert) Minitalk.alert.show("error",result.message,5);
						}
					}
				}
			},
			error:function() {
				if (count === false || count == 3) {
					if (typeof Ext == "object") {
						if (count !== false) Ext.Msg.show({title:Minitalk.getText("text/error"),msg:Minitalk.getErrorText("DISCONNECT_ERROR"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
					} else {
						if (count !== false && Minitalk.alert) Minitalk.alert.show("error",Minitalk.getErrorText("DISCONNECT_ERROR"),5);
						if (typeof callback == "function") callback({success:false});
					}
				} else {
					setTimeout(function(url,data,callback,count) { $.send(url,data,callback,count); },1000,url,data,callback,++count);
				}
			}
		});
	};
	
	/**
	 * 폼 데이터를 Ajax 방식으로 서버에 전송한다.
	 *
	 * @param string url 전송할 URL
	 * @param function callback 전송이 완료된 후 처리할 콜백함수
	 */
	$.fn.send = function(url,callback,count) {
		/**
		 * 전송대상이 form 이 아닐경우 아무런 행동을 하지 않는다.
		 */
		if (this.is("form") == false) return;
		
		if (this.triggerHandler("beforesubmit",[this]) === false) return;
		
		var count = count !== undefined ? count : 1;
		var $form = this;
		var data = $("input[type=file]",$form).length == 0 ? $form.serialize() : new FormData($form[0]);
		
		$("input, select, textarea",$form).each(function() {
			if ($(this).attr("type") == "checkbox") {
				$(this).data("submitValue",$(this).is(":checked"));
			} else {
				$(this).attr("submitValue",$(this).val());
			}
		});
		
		$form.status("loading");
		
		$.ajax({
			type:"POST",
			url:url,
			data:data,
			processData:$("input[type=file]",$form).length == 0 ? true : false,
			dataType:"json",
			contentType:$("input[type=file]",$form).length == 0 ? "application/x-www-form-urlencoded; charset=UTF-8" : false,
			success:function(result) {
				if (typeof callback == "function" && callback(result) === false) return false;
				if (result.success == false && result.errors) $form.status("error",result.errors);
				if (result.message) {
					if (Minitalk.alert) Minitalk.alert.show(result.success == true ? "success" : "error",result.message);
					$form.status("default");
				}
			},
			error:function() {
				/**
				 * 재시도 횟수가 3회일 경우 에러를 발생하고 멈춘다.
				 */
				if (count === false || count == 3) {
					if (count !== false) $form.status("error");
					if (count !== false && Minitalk.alert) Minitalk.alert.show("error",Minitalk.getErrorText("DISCONNECT_ERROR"),5);
					if (typeof callback == "function") callback({success:false});
				} else {
					setTimeout(function($form,url,callback,count) { $form.status("default"); $form.send(url,callback,count); },1000,$form,url,callback,++count);
				}
			}
		});
	};
	
	/**
	 * 객체를 좌우로 흔든다.
	 */
	$.fn.shake = function(distance,times) {
		var interval = 100;
		var distance = distance ? distance : 10;
		var times = times ? times : 4;

		this.css("position","relative");

		for (var i=0, loop=times+1;i<loop;i++) {
			this.animate({left:(i%2 == 0 ? distance : distance*-1)},interval);
		}

		this.animate({left:0},interval);
	};
	
	/**
	 * 모바일 디바이스의 줌을 막는다.
	 */
	$.fn.preventZoom = function() {
		$(this).bind('touchstart', function preventZoom(e){
			var t2 = e.timeStamp;
			var t1 = $(this).data('lastTouch') || t2;
			var dt = t2 - t1;
			var fingers = e.originalEvent.touches.length;
			$(this).data('lastTouch', t2);
			if (!dt || dt > 500 || fingers > 1){
				return;
			}
			e.preventDefault();
			$(e.target).trigger('click');
		});
	};
	
	/**
	 * 대상을 회전시킨다.
	 */
	$.fn.rotate = function(options) {
		var $this=$(this);
		
		if (typeof options == "number") {
			$this.css({"transform":"rotate("+options+"deg"});
			return;
		}
		
		var prefixes, opts, wait4css=0;
		prefixes=['-Webkit-', '-Moz-', '-O-', '-ms-', ''];
		opts=$.extend({
			startDeg: false,
			endDeg: 360,
			duration: 1,
			count: 1,
			easing: 'linear',
			animate: {},
			forceJS: false
		}, options);
	
		function supports(prop) {
			var can=false, style=document.createElement('div').style;
			$.each(prefixes, function(i, prefix) {
				if (style[prefix.replace(/\-/g, '')+prop]==='') {
					can=true;
				}
			});
			return can;
		}
	
		function prefixed(prop, value) {
			var css={};
			if (!supports.transform) {
				return css;
			}
			$.each(prefixes, function(i, prefix) {
				css[prefix.toLowerCase()+prop]=value || '';
			});
			return css;
		}
	
		function generateFilter(deg) {
			var rot, cos, sin, matrix;
			if (supports.transform) {
				return '';
			}
			rot=deg>=0 ? Math.PI*deg/180 : Math.PI*(360+deg)/180;
			cos=Math.cos(rot);
			sin=Math.sin(rot);
			matrix='M11='+cos+',M12='+(-sin)+',M21='+sin+',M22='+cos+',SizingMethod="auto expand"';
			return 'progid:DXImageTransform.Microsoft.Matrix('+matrix+')';
		}
	
		supports.transform=supports('Transform');
		supports.transition=supports('Transition');
	
		opts.endDeg*=opts.count;
		opts.duration*=opts.count;
	
		if (supports.transition && !opts.forceJS) { // CSS-Transition
			if ((/Firefox/).test(navigator.userAgent)) {
				wait4css=(!options||!options.animate)&&(opts.startDeg===false||opts.startDeg>=0)?0:25;
			}
			$this.queue(function(next) {
				if (opts.startDeg!==false) {
					$this.css(prefixed('transform', 'rotate('+opts.startDeg+'deg)'));
				}
				setTimeout(function() {
					$this
						.css(prefixed('transition', 'all '+opts.duration+'s '+opts.easing))
						.css(prefixed('transform', 'rotate('+opts.endDeg+'deg)'))
						.css(opts.animate);
				}, wait4css);
	
				setTimeout(function() {
					$this.css(prefixed('transition'));
					if (!opts.persist) {
						$this.css(prefixed('transform'));
					}
					next();
				}, (opts.duration*1000)-wait4css);
			});
	
		} else { // JavaScript-Animation + filter
			if (opts.startDeg===false) {
				opts.startDeg=$this.data('rotated') || 0;
			}
			opts.animate.perc=100;
	
			$this.animate(opts.animate, {
				duration: opts.duration*1000,
				easing: $.easing[opts.easing] ? opts.easing : '',
				step: function(perc, fx) {
					var deg;
					if (fx.prop==='perc') {
						deg=opts.startDeg+(opts.endDeg-opts.startDeg)*perc/100;
						$this
							.css(prefixed('transform', 'rotate('+deg+'deg)'))
							.css('filter', generateFilter(deg));
					}
				},
				complete: function() {
					if (opts.persist) {
						while (opts.endDeg>=360) {
							opts.endDeg-=360;
						}
					} else {
						opts.endDeg=0;
						$this.css(prefixed('transform'));
					}
					$this.css('perc', 0).data('rotated', opts.endDeg);
				}
			});
		}
	
		return $this;
	};
	
	$.fn.enable = function() {
		if (this.is("input, select, textarea, button") == true) {
			this.prop("disabled",false);
		}
		
		return this;
	};
	
	$.fn.disable = function() {
		if (this.is("input, select, textarea, button") == true) {
			this.prop("disabled",true);
		}
		
		return this;
	};
	
	$.fn.checked = function(checked) {
		if (checked === undefined) {
			return this.prop("checked");
		} else {
			if (this.is("input[type=radio]") == true || this.is("input[type=checkbox]") == true) {
				this.prop("checked",checked);
			}
			
			return this;
		}
	}
	
	$.fn.setDisabled = function(value) {
		if (value == true) this.disable();
		else this.enable();
	};
})(jQuery);