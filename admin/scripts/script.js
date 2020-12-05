/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자 UI를 정의한다.
 * 
 * @file /admin/scripts/script.js
 * @author Arzz (arzz@arzz.com)
 * @license MIT License
 * @version 6.4.0
 * @modified 2020. 12. 4.
 */
var Admin = {
	/**
	 * 미니톡 클라이언트 관리자의 언어셋을 가져온다.
	 *
	 * @param string code
	 * @param string replacement 일치하는 언어코드가 없을 경우 반환될 메시지 (기본값 : null, $code 반환)
	 * @return string language 실제 언어셋 텍스트
	 */
	getText:function(code,replacement) {
		var text = code.search(/^(text|alert|action|button)\//) > -1 ? Minitalk.getText(code,replacement) : Minitalk.getText("admin/"+code,replacement);
		return text;
	},
	/**
	 * 미니톡 클라이언트 관리자의 에러메시지 가져온다.
	 *
	 * @param string code 에러코드
	 * @return string message 에러메시지
	 */
	getErrorText:function(code) {
		return Minitalk.getErrorText(code);
	},
	/**
	 * 관리자 로그인을 처리한다.
	 */
	login:function($form) {
		$form.send(Minitalk.getProcessUrl("login"),function(result) {
			if (result.success == true) {
				location.replace(location.href);
			} else {
				$("main").addClass("error").shake();
				$form.status("error");
			}
		});
	},
	/**
	 * 관리자 로그인을 처리한다.
	 */
	logout:function() {
		$.send(Minitalk.getProcessUrl("logout"),function(result) {
			if (result.success == true) {
				location.replace(location.pathname);
			}
		});
	},
	show:function($tab) {
		var panel = $tab.attr("href").split("/").pop();
		if (Ext.getCmp("MinitalkPanel-"+panel)) {
			Ext.getCmp("MinitalkTabPanel").setActiveTab(Ext.getCmp("MinitalkPanel-"+panel));
		}
		
		return false;
	},
	/**
	 * 서버관리패널
	 */
	server:{
		/**
		 * 서버추가
		 */
		add:function(domain) {
			new Ext.Window({
				id:"MinitalkServerAddWindow",
				title:(domain ? Admin.getText("server/modify") : Admin.getText("server/add")),
				width:600,
				modal:true,
				border:false,
				resizeable:false,
				autoScroll:true,
				items:[
					new Ext.form.Panel({
						id:"MinitalkServerAddForm",
						border:false,
						bodyPadding:"10 10 0 10",
						fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%",allowBlank:false},
						items:[
							new Ext.form.Hidden({
								name:"domain",
								disabled:(domain ? false : true)
							}),
							new Ext.form.ComboBox({
								name:"type",
								store:new Ext.data.ArrayStore({
									fields:["display","value"],
									data:(function() {
										var datas = [];
										for (var type in Admin.getText("server/type")) {
											if (type == "SERVER" && Ext.getCmp("MinitalkPanel-server").hasServer === false) continue;
											datas.push([Admin.getText("server/type/"+type),type]);
										}
										return datas;
									})()
								}),
								displayField:"display",
								valueField:"value",
								value:(Ext.getCmp("MinitalkPanel-server").hasServer === true ? "SERVER" : "SERVICE"),
								listeners:{
									change:function(form,value) {
										if (value == "SERVER") {
											Ext.getCmp("MinitalkServerAddServer").enable().show();
											Ext.getCmp("MinitalkServerAddHosting").disable().hide();
										} else {
											Ext.getCmp("MinitalkServerAddServer").disable().hide();
											Ext.getCmp("MinitalkServerAddHosting").enable().show();
										}
									}
								}
							}),
							new Ext.form.FieldSet({
								id:"MinitalkServerAddServer",
								title:Admin.getText("server/type/SERVER"),
								hidden:Ext.getCmp("MinitalkPanel-server").hasServer !== true,
								disabled:Ext.getCmp("MinitalkPanel-server").hasServer !== true,
								items:[
									new Ext.form.FieldContainer({
										fieldLabel:Admin.getText("server/form/server"),
										layout:"hbox",
										items:[
											new Ext.form.TextField({
												name:"ip",
												value:location.host,
												flex:1
											}),
											new Ext.form.NumberField({
												fieldLabel:Admin.getText("server/form/port"),
												name:"port",
												value:3121,
												minValue:3121,
												maxValue:65535,
												width:200,
												fieldStyle:{textAlign:"left"},
												allowThousandSeparator:false
											})
										],
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("server/form/server_help")+'</div>'
									}),
									new Ext.form.Checkbox({
										name:"is_ssl",
										fieldLabel:Admin.getText("server/form/ssl"),
										boxLabel:Admin.getText("server/form/ssl_help"),
										checked:location.protocol.indexOf("https") === 0
									})
								]
							}),
							new Ext.form.FieldSet({
								id:"MinitalkServerAddHosting",
								title:Admin.getText("server/type/SERVICE"),
								hidden:Ext.getCmp("MinitalkPanel-server").hasServer !== false,
								disabled:Ext.getCmp("MinitalkPanel-server").hasServer !== false,
								items:[
									new Ext.form.TextField({
										fieldLabel:Admin.getText("server/form/hosting_client_id"),
										name:"client_id",
										emptyText:Admin.getText("server/form/hosting_client_id_help")
									}),
									new Ext.form.TextField({
										fieldLabel:Admin.getText("server/form/hosting_client_secret"),
										name:"client_secret",
										emptyText:Admin.getText("server/form/hosting_client_secret_help"),
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("server/form/hosting_help")+'<br><a href="https://www.minitalk.io/ko/service/mypage" target="_blank">https://www.minitalk.io/ko/service/mypage</a></div>'
									})
								]
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						text:Admin.getText("button/confirm"),
						handler:function() {
							Ext.getCmp("MinitalkServerAddForm").getForm().submit({
								url:Minitalk.getProcessUrl("@saveServer"),
								submitEmptyText:false,
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/saving"),
								success:function(form,action) {
									Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/saved"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
										Ext.getCmp("MinitalkPanel-server").getStore().reload();
										Ext.getCmp("MinitalkServerAddWindow").close();
									}});
								},
								failure:function(form,action) {
									if (action.result) {
										if (action.result.message) {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
										} else {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_SAVE_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
										}
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("INVALID_FORM_DATA"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
								}
							});
						}
					}),
					new Ext.Button({
						text:Admin.getText("button/cancel"),
						handler:function() {
							Ext.getCmp("MinitalkServerAddWindow").close();
						}
					})
				],
				listeners:{
					show:function() {
						if (domain) {
							Ext.getCmp("MinitalkServerAddForm").getForm().load({
								url:Minitalk.getProcessUrl("@getServer"),
								params:{domain:domain},
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/loading"),
								success:function(form,action) {
									
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_LOAD_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
									Ext.getCmp("MinitalkServerAddWindow").close();
								}
							});
						}
					}
				}
			}).show();
		},
		/**
		 * 서버상태를 변경한다.
		 */
		status:function(type,domain) {
			if (domain) {
				var domains = [domain];
			} else {
				var selected = Ext.getCmp("MinitalkPanel-server").getSelectionModel().getSelection();
				if (selected.length == 0) {
					Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
					return;
				}
				
				var domains = [];
				for (var i=0, loop=selected.length;i<loop;i++) {
					domains.push(selected[i].get("domain"));
				}
			}
			
			Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("server/"+type+"_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
				if (button == "ok") {
					Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
					$.send(Minitalk.getProcessUrl("@changeServer"),{domains:JSON.stringify(domains),type:type},function(result) {
						if (result.success == true) {
							Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
								Ext.getCmp("MinitalkPanel-server").getStore().reload();
							}});
						}
					});
				}
			}});
		}
	},
	/**
	 * 카테고리관리
	 */
	category:{
		/**
		 * 카테고리를 추가한다.
		 *
		 * @param int idx 카테고리고유값
		 * @param int parent 부모카테고리고유값
		 */
		add:function(idx,parent) {
			new Ext.Window({
				id:"MinitalkCategoryAddWindow",
				title:idx ? Admin.getText("category/modify") : Admin.getText("category/add"),
				width:400,
				modal:true,
				border:false,
				items:[
					new Ext.form.Panel({
						id:"MinitalkCategoryAddForm",
						border:false,
						fieldDefaults:{allowBlank:false,labelWidth:80,labelAlign:"right",anchor:"100%"},
						bodyPadding:"10 10 5 10",
						items:[
							new Ext.form.Hidden({
								name:"idx"
							}),
							new Ext.form.Hidden({
								name:"parent",
								value:parent ? parent : 0
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("category/form/category"),
								name:"category"
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						text:Admin.getText("button/confirm"),
						handler:function() {
							Ext.getCmp("MinitalkCategoryAddForm").getForm().submit({
								url:Minitalk.getProcessUrl("@saveCategory"),
								submitEmptyText:false,
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/saving"),
								success:function(form,action) {
									Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/saved"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
										Ext.getCmp("MinitalkCategory1").getStore().load(function(store) {
											if (parent) {
												var index = Ext.getCmp("MinitalkCategory1").getStore().findExact("idx",parent);
												if (index > -1) Ext.getCmp("MinitalkCategory1").getSelectionModel().select(index);
											}
										});
										Ext.getCmp("MinitalkCategoryAddWindow").close();
									}});
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_SAVE_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
								}
							});
						}
					}),
					new Ext.Button({
						text:Admin.getText("button/cancel"),
						handler:function() {
							Ext.getCmp("MinitalkCategoryAddWindow").close();
						}
					})
				],
				listeners:{
					show:function() {
						if (idx) {
							Ext.getCmp("MinitalkCategoryAddForm").getForm().load({
								url:Minitalk.getProcessUrl("@getCategory"),
								params:{idx:idx},
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/loading"),
								success:function(form,action) {
									
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_LOAD_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
									Ext.getCmp("MinitalkCategoryAddWindow").close();
								}
							});
						}
					}
				}
			}).show();
		},
		/**
		 * 카테고리를 삭제한다.
		 */
		delete:function(parent) {
			var selected = Ext.getCmp(parent ? "MinitalkCategory2" : "MinitalkCategory1").getSelectionModel().getSelection();
			if (selected.length == 0) {
				Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
				return;
			}
			
			var idxes = [];
			for (var i=0, loop=selected.length;i<loop;i++) {
				idxes.push(selected[i].get("idx"));
			}
			
			Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("category/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
				if (button == "ok") {
					Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
					$.send(Minitalk.getProcessUrl("@deleteCategory"),{idxes:JSON.stringify(idxes)},function(result) {
						if (result.success == true) {
							Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
								Ext.getCmp("MinitalkCategory1").getStore().load(function(store) {
									if (parent) {
										var index = Ext.getCmp("MinitalkCategory1").getStore().findExact("idx",parent);
										if (index > -1) Ext.getCmp("MinitalkCategory1").getSelectionModel().select(index);
									}
								});
							}});
						}
					});
				}
			}});
		}
	},
	/**
	 * 채널관리
	 */
	channel:{
		/**
		 * 채널을 추가한다.
		 *
		 * @param string channel 채널명
		 */
		add:function(channel) {
			new Ext.Window({
				id:"MinitalkChannelAddWindow",
				title:channel ? Admin.getText("channel/modify") : Admin.getText("channel/add"),
				width:600,
				modal:true,
				border:false,
				autoScroll:true,
				items:[
					new Ext.form.Panel({
						id:"MinitalkChannelAddForm",
						border:false,
						fieldDefaults:{allowBlank:false,labelWidth:80,labelAlign:"right",anchor:"100%"},
						bodyPadding:"10 10 5 10",
						items:[
							new Ext.form.Hidden({
								name:"oChannel"
							}),
							new Ext.form.FieldSet({
								title:Admin.getText("channel/form/default"),
								items:[
									new Ext.form.FieldContainer({
										fieldLabel:Admin.getText("channel/form/category"),
										layout:"hbox",
										items:[
											new Ext.form.ComboBox({
												name:"category1",
												store:new Ext.data.JsonStore({
													proxy:{
														type:"ajax",
														url:Minitalk.getProcessUrl("@getCategories"),
														extraParams:{parent:0,is_none:"true"},
														reader:{type:"json"}
													},
													autoLoad:true,
													remoteSort:false,
													sorters:[{property:"sort",direction:"ASC"}],
													fields:["idx","category",{name:"sort",type:"int"}]
												}),
												flex:1,
												editable:false,
												displayField:"category",
												valueField:"idx",
												allowBlank:true,
												emptyText:Admin.getText("category/category1"),
												listeners:{
													change:function(form,value) {
														form.getForm().findField("category2").getStore().getProxy().setExtraParam("parent",value ? value : -1);
														form.getForm().findField("category2").getStore().reload();
													}
												}
											}),
											new Ext.form.ComboBox({
												name:"category2",
												store:new Ext.data.JsonStore({
													proxy:{
														type:"ajax",
														url:Minitalk.getProcessUrl("@getCategories"),
														extraParams:{parent:-1,is_none:"true"},
														reader:{type:"json"}
													},
													autoLoad:true,
													remoteSort:false,
													sorters:[{property:"sort",direction:"ASC"}],
													fields:["idx","category",{name:"sort",type:"int"}],
													listeners:{
														load:function(store) {
															var value = Ext.getCmp("MinitalkChannelAddForm").getForm().findField("category2").getValue();
															if (value && store.findExact("idx",value) === -1) {
																Ext.getCmp("MinitalkChannelAddForm").getForm().findField("category2").setValue("");
															}
														}
													}
												}),
												flex:1,
												editable:false,
												displayField:"category",
												valueField:"idx",
												allowBlank:true,
												style:{marginLeft:"5px"},
												emptyText:Admin.getText("category/category2")
											})
										]
									}),
									new Ext.form.TextField({
										fieldLabel:Admin.getText("channel/form/channel"),
										name:"channel",
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/channel_help")+'</div>'
									}),
									new Ext.form.TextField({
										fieldLabel:Admin.getText("channel/form/title"),
										name:"title",
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/title_help")+'</div>'
									})
								]
							}),
							new Ext.form.FieldSet({
								title:Admin.getText("channel/form/grade"),
								items:[
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/grade_chat"),
										name:"grade_chat",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var key in Admin.getText("grade")) {
													datas.push([Admin.getText("grade/" + key),key]);
												}
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:"ALL"
									}),
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/grade_font"),
										name:"grade_font",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var key in Admin.getText("grade")) {
													datas.push([Admin.getText("grade/" + key),key]);
												}
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:"ALL"
									}),
									new Ext.form.TextField({
										fieldLabel:Admin.getText("channel/form/password"),
										name:"password",
										allowBlank:true,
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/password_help")+'</div>'
									})
								]
							}),
							new Ext.form.FieldSet({
								title:Admin.getText("channel/form/option"),
								items:[
									new Ext.form.Checkbox({
										fieldLabel:Admin.getText("channel/form/is_broadcast"),
										name:"is_broadcast",
										boxLabel:Admin.getText("channel/form/is_broadcast_help"),
										checked:true
									}),
									new Ext.form.Checkbox({
										fieldLabel:Admin.getText("channel/form/is_nickname"),
										name:"is_nickname",
										boxLabel:Admin.getText("channel/form/is_nickname_help"),
										checked:true
									}),
									new Ext.form.TextField({
										fieldLabel:Admin.getText("channel/form/notice"),
										name:"notice",
										allowBlank:true,
										emptyText:Admin.getText("channel/form/notice_help")
									}),
									new Ext.form.FieldContainer({
										fieldLabel:Admin.getText("channel/form/max_user"),
										layout:"hbox",
										items:[
											new Ext.form.NumberField({
												name:"max_user",
												value:2000,
												width:100,
												maxValue:2000,
												minValue:1
											}),
											new Ext.form.DisplayField({
												value:Admin.getText("channel/form/max_user_help"),
												style:{marginLeft:"5px"},
												flex:1
											})
										]
									})
								]
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						text:Admin.getText("button/confirm"),
						handler:function() {
							Ext.getCmp("MinitalkChannelAddForm").getForm().submit({
								url:Minitalk.getProcessUrl("@saveChannel"),
								submitEmptyText:false,
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/saving"),
								success:function(form,action) {
									Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/saved"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
										Ext.getCmp("MinitalkPanel-channel").getStore().reload();
										Ext.getCmp("MinitalkChannelAddWindow").close();
									}});
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_SAVE_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
								}
							});
						}
					}),
					new Ext.Button({
						text:Admin.getText("button/cancel"),
						handler:function() {
							Ext.getCmp("MinitalkChannelAddWindow").close();
						}
					})
				],
				listeners:{
					show:function() {
						if (channel) {
							Ext.getCmp("MinitalkChannelAddForm").getForm().load({
								url:Minitalk.getProcessUrl("@getChannel"),
								params:{channel:channel},
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/loading"),
								success:function(form,action) {
									
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_LOAD_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
									Ext.getCmp("MinitalkChannelAddWindow").close();
								}
							});
						}
					}
				}
			}).show();
		},
		/**
		 * 채널을 미리본다.
		 *
		 * @param object channel 채널정보
		 */
		preview:function(channel) {
			new Ext.Window({
				title:channel.title,
				width:700,
				height:500,
				modal:true,
				html:'<iframe src="./preview.php?channel='+channel.channel+'" frameborder="0" style="width:100%; height:100%;" scrolling="0"></iframe>'
			}).show();
		}
	},
	/**
	 * 차단IP
	 */
	banip:{
		add:function(ip) {
			new Ext.Window({
				id:"MinitalkBanIpAddWindow",
				title:ip ? Admin.getText("banip/modify") : Admin.getText("banip/add"),
				width:400,
				modal:true,
				border:false,
				items:[
					new Ext.form.Panel({
						id:"MinitalkBanIpAddForm",
						border:false,
						fieldDefaults:{allowBlank:false,labelWidth:80,labelAlign:"right",anchor:"100%"},
						bodyPadding:"10 10 5 10",
						items:[
							new Ext.form.Hidden({
								name:"oIp"
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("banip/form/ip"),
								name:"ip",
								emptyText:"0.0.0.0"
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("banip/form/nickname"),
								name:"nickname",
								allowBlank:true
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("banip/form/memo"),
								allowBlank:true,
								name:"memo"
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						text:Admin.getText("button/confirm"),
						handler:function() {
							Ext.getCmp("MinitalkBanIpAddForm").getForm().submit({
								url:Minitalk.getProcessUrl("@saveBanIp"),
								submitEmptyText:false,
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/saving"),
								success:function(form,action) {
									Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/saved"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
										Ext.getCmp("MinitalkPanel-banip").getStore().reload();
										Ext.getCmp("MinitalkBanIpAddWindow").close();
									}});
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_SAVE_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
								}
							});
						}
					}),
					new Ext.Button({
						text:Admin.getText("button/cancel"),
						handler:function() {
							Ext.getCmp("MinitalkBanIpAddWindow").close();
						}
					})
				],
				listeners:{
					show:function() {
						if (ip) {
							Ext.getCmp("MinitalkBanIpAddForm").getForm().load({
								url:Minitalk.getProcessUrl("@getBanIp"),
								params:{ip:ip},
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/loading"),
								success:function(form,action) {
								},
								failure:function(form,action) {
									if (action.result && action.result.message) {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_LOAD_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
									Ext.getCmp("MinitalkBanIpAddWindow").close();
								}
							});
						}
					}
				}
			}).show();
		},
		/**
		 * 차단아이피를 삭제한다.
		 */
		delete:function(parent) {
			var selected = Ext.getCmp("MinitalkPanel-banip").getSelectionModel().getSelection();
			if (selected.length == 0) {
				Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
				return;
			}
			
			var ips = [];
			for (var i=0, loop=selected.length;i<loop;i++) {
				ips.push(selected[i].get("ip"));
			}
			
			Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("banip/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
				if (button == "ok") {
					Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
					$.send(Minitalk.getProcessUrl("@deleteBanIp"),{ips:JSON.stringify(ips)},function(result) {
						if (result.success == true) {
							Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
								Ext.getCmp("MinitalkPanel-banip").getStore().reload();
							}});
						}
					});
				}
			}});
		}
	},
	/**
	 * 브로드캐스트
	 */
	broadcast:{
		send:function(data) {
			new Ext.Window({
				id:"MinitalkBroadcastSendWindow",
				title:Admin.getText("broadcast/send"),
				width:600,
				modal:true,
				border:false,
				resizeable:false,
				autoScroll:true,
				items:[
					new Ext.form.Panel({
						id:"MinitalkBroadcastSendForm",
						bodyPadding:"10 10 5 10",
						border:false,
						fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%",allowBlank:false},
						items:[
							new Ext.form.ComboBox({
								fieldLabel:Admin.getText("broadcast/form/type"),
								name:"type",
								store:new Ext.data.ArrayStore({
									fields:["display","value"],
									data:(function() {
										var datas = [];
										for (var type in Admin.getText("broadcast/type")) {
											datas.push([Admin.getText("broadcast/type/" + type) + " - " + Admin.getText("broadcast/type_help/" + type),type]);
										}
										return datas;
									})()
								}),
								displayField:"display",
								valueField:"value",
								value:data ? data.type : "NOTICE",
								listeners:{
									select:function(form,value) {
										if (value == "NOTICE") {
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("nickname").disable();
										} else {
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("nickname").enable();
										}
									}
								}
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("broadcast/form/message"),
								name:"message",
								value:data ? data.message : null,
								allowBlank:false
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("broadcast/form/url"),
								name:"url",
								value:data ? data.url : null,
								emptyText:Admin.getText("broadcast/form/url_help"),
								validator:function(value) {
									if (value.search(/^http(s)?:\/\//) == 0) return true;
									else return Admin.getText("broadcast/form/url_error");
								}
							}),
							new Ext.form.FieldContainer({
								fieldLabel:Admin.getText("broadcast/form/nickname"),
								layout:"hbox",
								items:[
									new Ext.form.TextField({
										name:"nickname",
										width:120,
										value:data && data.type == "MESSAGE" ? data.nickname : "admin",
										disabled:data && data.type == "MESSAGE" ? false : true
									}),
									new Ext.form.DisplayField({
										value:"&nbsp;(" + Admin.getText("broadcast/form/nickname_help")+")"
									})
								]
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						text:Admin.getText("button/confirm"),
						handler:function() {
							Ext.getCmp("MinitalkBroadcastSendForm").getForm().submit({
								url:Minitalk.getProcessUrl("@sendBroadcast"),
								submitEmptyText:false,
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/saving"),
								success:function(form,action) {
									Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("broadcast/send_confirm").replace("{receiver}",action.result.receiver),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
										Ext.getCmp("MinitalkPanel-broadcast").getStore().loadPage(1);
										Ext.getCmp("MinitalkBroadcastSendWindow").close();
									}});
								},
								failure:function(form,action) {
									if (action.result) {
										if (action.result.message) {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
										} else {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_SAVE_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
										}
									} else {
										Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("INVALID_FORM_DATA"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
									}
								}
							});
						}
					}),
					new Ext.Button({
						text:Admin.getText("button/cancel"),
						handler:function() {
							Ext.getCmp("MinitalkBroadcastSendWindow").close();
						}
					})
				]
			}).show();
		},
		/**
		 * 브로드캐스트 전송내역을 삭제한다.
		 */
		delete:function(parent) {
			var selected = Ext.getCmp("MinitalkPanel-broadcast").getSelectionModel().getSelection();
			if (selected.length == 0) {
				Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
				return;
			}
			
			var ids = [];
			for (var i=0, loop=selected.length;i<loop;i++) {
				ids.push(selected[i].get("id"));
			}
			
			Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("broadcast/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
				if (button == "ok") {
					Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
					$.send(Minitalk.getProcessUrl("@deleteBroadcast"),{ids:JSON.stringify(ids)},function(result) {
						if (result.success == true) {
							Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
								Ext.getCmp("MinitalkPanel-broadcast").getStore().reload();
							}});
						}
					});
				}
			}});
		}
	}
};

/**
 * 미니톡 위젯 스크립트 가상화
 * 관리자페이지에서는 미니톡 위젯 스크립트를 불러오지 않으므로, 미니톡 위젯 변수를 가상화해준다.
 */
var Minitalk = {
	/**
	 * 미니톡 경로를 가져온다.
	 */
	getUrl:function() {
		return "..";
	},
	/**
	 * 프로세스 경로를 가져온다.
	 */
	getProcessUrl:function(action) {
		return Minitalk.getUrl() + "/process/"+action;
	},
	/**
	 * 미니톡 클라이언트 언어셋을 추가한다.
	 *
	 * @param object lang 설정된 언어셋
	 * @param object oLang 모듈 기본언어셋
	 */
	addLanguage:function(type,target,lang,oLang) {
		if (type == "core") {
			Minitalk._LANG = lang;
			Minitalk._OLANG = oLang;
		} else {
			if (type == "module") {
				if (window[target] === undefined) window[target] = {};
				var targetObject = window[target];
			}
			
			targetObject._LANG = lang;
			targetObject._OLANG = oLang;
			
			targetObject.getText = function(code,replacement) {
				var replacement = replacement ? replacement : null;
				var returnString = null;
				var temp = code.split("/");
				
				var string = this._LANG;
				for (var i=0, loop=temp.length;i<loop;i++) {
					if (string[temp[i]]) {
						string = string[temp[i]];
					} else {
						string = null;
						break;
					}
				}
				
				if (string != null) {
					returnString = string;
				} else if (this._OLANG != null) {
					var string = this._OLANG;
					for (var i=0, loop=temp.length;i<loop;i++) {
						if (string[temp[i]]) {
							string = string[temp[i]];
						} else {
							string = null;
							break;
						}
					}
					
					if (string != null) returnString = string;
				}
				
				/**
				 * 언어셋 텍스트가 없는경우 iModule 코어에서 불러온다.
				 */
				if (returnString != null) return returnString;
				else if ($.inArray(temp[0],["text","button","action"]) > -1) return Minitalk.getText(code,replacement);
				else return replacement == null ? code : replacement;
			};
			
			targetObject.getErrorText = function(code) {
				var message = this.getText("error/"+code,code);
				if (message === code && typeof Admin == "object") message = Admin.getText("error/"+code,code);
				if (message === code) message = Minitalk.getErrorText(code);
				
				return message;
			};
		}
	},
	/**
	 * 미니톡 클라이언트의 언어셋을 가져온다.
	 *
	 * @param string code
	 * @param string replacement 일치하는 언어코드가 없을 경우 반환될 메시지 (기본값 : null, $code 반환)
	 * @return string language 실제 언어셋 텍스트
	 */
	getText:function(code,replacement) {
		var replacement = replacement ? replacement : null;
		var temp = code.split("/");
		
		var string = this._LANG;
		for (var i=0, loop=temp.length;i<loop;i++) {
			if (string[temp[i]]) {
				string = string[temp[i]];
			} else {
				string = null;
				break;
			}
		}
		
		if (string != null) {
			return string;
		} else if (this._OLANG != null) {
			var string = this._OLANG;
			for (var i=0, loop=temp.length;i<loop;i++) {
				if (string[temp[i]]) {
					string = string[temp[i]];
				} else {
					return replacement == null ? code : replacement;
				}
			}
		}
		
		console.log(code);
		
		return replacement == null ? code : replacement;
	},
	/**
	 * 미니톡 클라이언트의 에러메시지 가져온다.
	 *
	 * @param string code 에러코드
	 * @return string message 에러메시지
	 */
	getErrorText:function(code) {
		var message = Minitalk.getText("error/"+code,code);
		if (message === code) message = Minitalk.getText("error/UNKNOWN")+" ("+code+")";
		
		return message;
	},
	/**
	 * 파일크기를 계산한다.
	 *
	 * @param int size
	 * @return string size
	 */
	/**
	 * 파일사이즈를 KB, MB, GB 단위로 변환한다.
	 *
	 * @param int fileSize 파일사이즈 (byte단위)
	 * @param boolean isKiB 1000 으로 나눈 값이 아닌 1024로 나눈 KiB 단위사용 여부
	 */
	getFileSize:function(fileSize,isKiB) {
		var isKiB = isKiB === true;
		var depthSize = isKiB == true ? 1024 : 1000;
		
		fileSize = parseInt(fileSize);
		return depthSize > fileSize ? fileSize+"B" : depthSize * depthSize > fileSize ? (fileSize/depthSize).toFixed(2)+(isKiB == true ? "KiB" : "KB") : depthSize * depthSize * depthSize > fileSize ? (fileSize/depthSize/depthSize).toFixed(2)+(isKiB == true ? "MiB" : "MB") : (fileSize/depthSize/depthSize/depthSize).toFixed(2)+(isKiB == true ? "GiB" : "GB");
	},
	getNumberFormat:function(number,decimals,dec_point,thousands_sep) {
		number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
		var n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
			dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
			s = '',
			toFixedFix = function (n, prec) {
				var k = Math.pow(10, prec);
				return '' + Math.round(n * k) / k;
			};
		s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		}
		if ((s[1] || '').length < prec) {
			s[1] = s[1] || '';
			s[1] += new Array(prec - s[1].length + 1).join('0');
		}
		return s.join(dec);
	}
};

$(document).ready(function() {
	if ($("#MinitalkLoginForm").length == 1) {
		$("#MinitalkLoginForm").on("submit",function() {
			Admin.login($(this));
			return false;
		});
	}
	
	$("#MinitalkHeader > ul > li > button[data-tab]").on("click",function() {
		var tab = $(this).attr("data-tab");
		Ext.getCmp("MinitalkTabPanel").setActiveTab("MinitalkPanel-"+tab);
	});
	
	$(window).on("popstate",function(e) {
		if (e.originalEvent.state && e.originalEvent.state.panel) {
			var panel = e.originalEvent.state.panel;
			Ext.getCmp("MinitalkTabPanel").setActiveTab("MinitalkPanel-"+panel);
		} else {
			location.replace(location.pathname);
		}
	});
});