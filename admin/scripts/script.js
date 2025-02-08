/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자 UI를 정의한다.
 * 
 * @file /admin/scripts/script.js
 * @license MIT License
 * @modified 2025. 2. 7.
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
	/**
	 * 메뉴를 전환한다.
	 *
	 * @param object $tab 탭버튼
	 */
	show:function($tab) {
		var panel = $tab.attr("href").split("/").pop();
		if (Ext.getCmp("MinitalkPanel-"+panel)) {
			Ext.getCmp("MinitalkTabPanel").setActiveTab(Ext.getCmp("MinitalkPanel-"+panel));
		}
		
		return false;
	},
	/**
	 * 검색필드를 추가한다.
	 *
	 * @param int width 넓이
	 * @param string placeHolder placeHolder
	 * @param function 검색함수
	 */
	searchField:function(id,width,placeHolder,handler) {
		return new Ext.form.FieldContainer({
			width:width == "flex" ? null : width,
			flex:width == "flex" ? 1 : null,
			layout:"hbox",
			items:[
				new Ext.form.TextField({
					id:id,
					flex:1,
					enableKeyEvents:true,
					emptyText:placeHolder,
					listeners:{
						keypress:function(form,e) {
							if (e.keyCode == 13) {
								handler(form.getValue());
								e.preventDefault();
							}
						}
					}
				}),
				new Ext.Button({
					iconCls:"mi mi-search",
					handler:function(button) {
						var keyword = button.ownerCt.items.items[0].getValue();
						handler(keyword);
					}
				})
			]
		});
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
	 * 채널관리
	 */
	channel:{
		/**
		 * 카테고리관리
		 */
		category:{
			/**
			 * 카테고리관리 패널
			 */
			panel:function() {
				new Ext.Window({
					id:"MinitalkCategoryWindow",
					title:Admin.getText("channel/category/panel"),
					width:900,
					height:500,
					modal:true,
					border:false,
					layout:"fit",
					items:[
						new Ext.Panel({
							border:false,
							layout:{type:"hbox",align:"stretch"},
							items:[
								new Ext.grid.GridPanel({
									id:"MinitalkCategory1",
									border:true,
									margin:"-1 0 -1 -1",
									flex:5,
									tbar:[
										new Ext.Button({
											iconCls:"mi mi-plus",
											text:Admin.getText("channel/category/add_category1"),
											handler:function() {
												Admin.channel.category.add();
											}
										}),
										new Ext.Button({
											iconCls:"mi mi-trash",
											text:Admin.getText("channel/category/delete"),
											handler:function() {
												Admin.channel.category.delete();
											}
										})
									],
									store:new Ext.data.JsonStore({
										proxy:{
											type:"ajax",
											simpleSortMode:true,
											url:Minitalk.getProcessUrl("@getCategories"),
											extraParams:{parent:0},
											reader:{type:"json"},
										},
										remoteSort:false,
										sorters:[{property:"category",direction:"ASC"}],
										autoLoad:true,
										pageSize:0,
										fields:["idx","category",{name:"children",type:"int"},{name:"channel",type:"int"},{name:"user",type:"int"}]
									}),
									columns:[{
										header:Admin.getText("channel/category/columns/category"),
										dataIndex:"category",
										flex:1
									},{
										header:Admin.getText("channel/category/columns/children"),
										dataIndex:"children",
										width:90,
										align:"right",
										summaryType:"sum",
										renderer:function(value) {
											return Ext.util.Format.number(value,"0,000");
										}
									},{
										header:Admin.getText("channel/category/columns/channel"),
										dataIndex:"channel",
										width:70,
										align:"right",
										summaryType:"sum",
										renderer:function(value) {
											return Ext.util.Format.number(value,"0,000");
										}
									},{
										header:Admin.getText("channel/category/columns/user"),
										dataIndex:"user",
										width:80,
										align:"right",
										summaryType:"sum",
										renderer:function(value) {
											return Ext.util.Format.number(value,"0,000");
										}
									}],
									selModel:new Ext.selection.CheckboxModel(),
									features:[{ftype:"summary"}],
									bbar:[
										new Ext.Button({
											iconCls:"x-tbar-loading",
											handler:function() {
												Ext.getCmp("MinitalkCategory1").getStore().reload();
											}
										}),
										"->",
										{xtype:"tbtext",text:Admin.getText("channel/category/grid_help")}
									],
									listeners:{
										itemdblclick:function(grid,record) {
											Admin.channel.category.add(record.data.idx);
										},
										selectionchange:function(grid,selected) {
											var parent = selected.length == 1 ? selected[0].data.idx : 0;
											if (parent == 0) {
												Ext.getCmp("MinitalkCategory2").getStore().removeAll();
												Ext.getCmp("MinitalkCategory2").disable();
											} else {
												Ext.getCmp("MinitalkCategory2").getStore().getProxy().setExtraParam("parent",parent);
												Ext.getCmp("MinitalkCategory2").getStore().reload();
											}
										},
										itemcontextmenu:function(grid,record,item,index,e) {
											var menu = new Ext.menu.Menu();
											
											menu.addTitle(record.data.category);
											
											menu.add({
												text:Admin.getText("channel/category/modify"),
												iconCls:"xi xi-form",
												handler:function() {
													Admin.channel.category.add(record.data.idx);
												}
											});
											
											menu.add({
												text:Admin.getText("channel/category/delete"),
												iconCls:"mi mi-trash",
												handler:function() {
													Admin.channel.category.delete();
												}
											});
											
											e.stopEvent();
											menu.showAt(e.getXY());
										}
									}
								}),
								new Ext.grid.GridPanel({
									id:"MinitalkCategory2",
									border:true,
									margin:"-1 -1 -1 0",
									disabled:true,
									flex:4,
									tbar:[
										new Ext.Button({
											iconCls:"mi mi-plus",
											text:Admin.getText("channel/category/add_category2"),
											handler:function() {
												var parent = Ext.getCmp("MinitalkCategory2").getStore().getProxy().extraParams.parent;
												Admin.channel.category.add(null,parent);
											}
										}),
										new Ext.Button({
											iconCls:"mi mi-trash",
											text:Admin.getText("channel/category/delete"),
											handler:function() {
												var parent = Ext.getCmp("MinitalkCategory2").getStore().getProxy().extraParams.parent;
												Admin.channel.category.delete(parent);
											}
										})
									],
									store:new Ext.data.JsonStore({
										proxy:{
											type:"ajax",
											simpleSortMode:true,
											url:Minitalk.getProcessUrl("@getCategories"),
											extraParams:{parent:0},
											reader:{type:"json"}
										},
										remoteSort:false,
										sorters:[{property:"category",direction:"ASC"}],
										autoLoad:false,
										pageSize:50,
										fields:["idx","category",{name:"channel",type:"int"},{name:"user",type:"int"}],
										listeners:{
											load:function(store) {
												var title = Ext.getCmp("MinitalkCategory1").getSelectionModel().getSelection().shift().get("category");
												Ext.getCmp("MinitalkCategory2Help").setText(Admin.getText("channel/category/grid_help"));
												Ext.getCmp("MinitalkCategory2").enable();
											}
										}
									}),
									columns:[{
										header:Admin.getText("channel/category/columns/category"),
										dataIndex:"category",
										flex:1
									},{
										header:Admin.getText("channel/category/columns/channel"),
										dataIndex:"channel",
										width:70,
										align:"right",
										summaryType:"sum",
										renderer:function(value) {
											return Ext.util.Format.number(value,"0,000");
										}
									},{
										header:Admin.getText("channel/category/columns/user"),
										dataIndex:"user",
										width:80,
										align:"right",
										summaryType:"sum",
										renderer:function(value) {
											return Ext.util.Format.number(value,"0,000");
										}
									}],
									selModel:new Ext.selection.CheckboxModel(),
									features:[{ftype:"summary"}],
									bbar:[
										new Ext.Button({
											iconCls:"x-tbar-loading",
											handler:function() {
												Ext.getCmp("MinitalkCategory2").getStore().reload();
											}
										}),
										"->",
										{id:"MinitalkCategory2Help",xtype:"tbtext",text:Admin.getText("channel/category/select_first")}
									],
									listeners:{
										itemdblclick:function(grid,record) {
											Admin.channel.category.add(record.data.idx,record.data.parent);
										},
										itemcontextmenu:function(grid,record,item,index,e) {
											var menu = new Ext.menu.Menu();
											
											menu.addTitle(record.data.category);
											
											menu.add({
												text:Admin.getText("channel/category/modify"),
												iconCls:"xi xi-form",
												handler:function() {
													Admin.channel.category.add(record.data.idx,record.data.parent);
												}
											});
											
											menu.add({
												text:Admin.getText("channel/category/delete"),
												iconCls:"mi mi-trash",
												handler:function() {
													Admin.channel.category.delete(record.data.parent);
												}
											});
											
											e.stopEvent();
											menu.showAt(e.getXY());
										},
										disable:function() {
											Ext.getCmp("MinitalkCategory2Help").setText(Admin.getText("channel/category/select_first"));
										}
									}
								})
							]
						})
					]
				}).show();
			},
			/**
			 * 카테고리를 추가한다.
			 *
			 * @param int idx 카테고리고유값
			 * @param int parent 부모카테고리고유값
			 */
			add:function(idx,parent) {
				new Ext.Window({
					id:"MinitalkCategoryAddWindow",
					title:idx ? Admin.getText("channel/category/modify") : (parent ? Admin.getText("channel/category/add_category2") : Admin.getText("channel/category/add_category1")),
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
									fieldLabel:Admin.getText("channel/category/form/category"),
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
													
													if (Ext.getCmp("MinitalkChannelCategory1").getValue() == parent) {
														Ext.getCmp("MinitalkChannelCategory2").getStore().reload();
													}
												} else {
													Ext.getCmp("MinitalkChannelCategory1").getStore().reload();
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
				
				Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("channel/category/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
					if (button == "ok") {
						Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
						$.send(Minitalk.getProcessUrl("@deleteCategory"),{idxes:JSON.stringify(idxes)},function(result) {
							if (result.success == true) {
								Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
									Ext.getCmp("MinitalkCategory1").getStore().load(function(store) {
										if (parent) {
											var index = Ext.getCmp("MinitalkCategory1").getStore().findExact("idx",parent);
											if (index > -1) Ext.getCmp("MinitalkCategory1").getSelectionModel().select(index);
											
											if (Ext.getCmp("MinitalkChannelCategory1").getValue() == parent) {
												Ext.getCmp("MinitalkChannelCategory2").setValue("");
												Ext.getCmp("MinitalkChannelCategory2").getStore().reload();
											}
										} else {
											Ext.getCmp("MinitalkChannelCategory1").setValue("");
											Ext.getCmp("MinitalkChannelCategory1").getStore().reload();
											Ext.getCmp("MinitalkChannelCategory2").setValue("");
											Ext.getCmp("MinitalkChannelCategory2").getStore().reload();
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
												emptyText:Admin.getText("channel/category/category1"),
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
												emptyText:Admin.getText("channel/category/category2")
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
										fieldLabel:Admin.getText("channel/form/allow_nickname_edit"),
										name:"allow_nickname_edit",
										boxLabel:Admin.getText("channel/form/allow_nickname_edit_help")
									}),
									new Ext.form.Checkbox({
										fieldLabel:Admin.getText("channel/form/use_user_tab"),
										name:"use_user_tab",
										boxLabel:Admin.getText("channel/form/use_user_tab_help"),
										checked:true,
										listeners:{
											change:function(form,checked) {
												form.getForm().findField("user_limit").setDisabled(!checked);
											}
										}
									}),
									new Ext.form.Checkbox({
										fieldLabel:Admin.getText("channel/form/use_box_tab"),
										name:"use_box_tab",
										boxLabel:Admin.getText("channel/form/use_box_tab_help"),
										checked:true,
										listeners:{
											change:function(form,checked) {
												form.getForm().findField("box_limit").setDisabled(!checked);
											}
										}
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
									}),
									new Ext.form.FieldContainer({
										fieldLabel:Admin.getText("channel/form/guest_name"),
										layout:"hbox",
										items:[
											new Ext.form.TextField({
												name:"guest_name",
												value:"Guest",
												width:100
											}),
											new Ext.form.DisplayField({
												value:Admin.getText("channel/form/guest_name_help"),
												style:{marginLeft:"5px"},
												flex:1
											})
										]
									}),
									new Ext.form.FieldContainer({
										fieldLabel:Admin.getText("channel/form/file_maxsize"),
										layout:"hbox",
										items:[
											new Ext.form.NumberField({
												name:"file_maxsize",
												value:20,
												width:100
											}),
											new Ext.form.DisplayField({
												value:Admin.getText("channel/form/file_maxsize_unit"),
												style:{marginLeft:"5px"},
												flex:1
											})
										],
										afterBodyEl:'<div class="x-form-help">' + Admin.getText("channel/form/file_maxsize_help") + '</div>'
									}),
									new Ext.form.FieldContainer({
										fieldLabel:Admin.getText("channel/form/file_lifetime"),
										layout:"hbox",
										items:[
											new Ext.form.NumberField({
												name:"file_lifetime",
												value:20,
												width:100
											}),
											new Ext.form.DisplayField({
												value:Admin.getText("channel/form/file_lifetime_unit"),
												style:{marginLeft:"5px"},
												flex:1
											})
										],
										afterBodyEl:'<div class="x-form-help">' + Admin.getText("channel/form/file_lifetime_help") + '</div>'
									})
								]
							}),
							new Ext.form.FieldSet({
								title:Admin.getText("channel/form/permission"),
								items:[
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/send_limit"),
										name:"send_limit",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var i=0;i<10;i++) {
													datas.push([Minitalk.getText("level/"+i),i]);
												}
												
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:0,
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/send_limit_help")+'</div>'
									}),
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/file_limit"),
										name:"file_limit",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var i=0;i<10;i++) {
													datas.push([Minitalk.getText("level/"+i),i]);
												}
												
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:0,
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/file_limit_help")+'</div>'
									}),
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/font_limit"),
										name:"font_limit",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var i=0;i<10;i++) {
													datas.push([Minitalk.getText("level/"+i),i]);
												}
												
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:0,
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/font_limit_help")+'</div>'
									}),
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/user_limit"),
										name:"user_limit",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var i=0;i<10;i++) {
													datas.push([Minitalk.getText("level/"+i),i]);
												}
												
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:0,
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/user_limit_help")+'</div>'
									}),
									new Ext.form.ComboBox({
										fieldLabel:Admin.getText("channel/form/box_limit"),
										name:"box_limit",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var i=0;i<10;i++) {
													datas.push([Minitalk.getText("level/"+i),i]);
												}
												
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:1,
										afterBodyEl:'<div class="x-form-help">'+Admin.getText("channel/form/box_limit_help")+'</div>'
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
		},
		/**
		 * 위젯코드를 생성한다.
		 *
		 * @param object channel 채널정보
		 */
		code:function(channel) {
			new Ext.Window({
				title:Admin.getText("channel/code"),
				width:1000,
				height:600,
				modal:true,
				border:false,
				layout:"fit",
				items:[
					new Ext.Panel({
						layout:"border",
						border:false,
						items:[
							new Ext.Panel({
								region:"west",
								width:500,
								autoScroll:true,
								border:false,
								items:[
									new Ext.form.Panel({
										id:"MinitalkWidgetCodeForm",
										padding:"10 10 5 10",
										border:false,
										fieldDefaults:{allowBlank:true,anchor:"100%",labelWidth:80,labelAlign:"right"},
										items:[
											new Ext.form.FieldSet({
												title:Admin.getText("channel/form/widget_default_configs"),
												items:[
													new Ext.form.TextField({
														fieldLabel:Admin.getText("channel/form/channel"),
														name:"channel",
														value:channel.channel
													}),
													new Ext.form.ComboBox({
														fieldLabel:Admin.getText("channel/form/widget_templet"),
														name:"templet",
														store:new Ext.data.JsonStore({
															proxy:{
																type:"ajax",
																url:Minitalk.getProcessUrl("@getTemplets"),
																reader:{type:"json"}
															},
															autoLoad:false,
															remoteSort:false,
															sorters:[{property:"title",direction:"ASC"}],
															fields:["title","templet"]
														}),
														editable:false,
														displayField:"title",
														valueField:"templet",
														value:"default"
													}),
													new Ext.form.FieldContainer({
														fieldLabel:Admin.getText("channel/form/widget_width"),
														layout:"hbox",
														items:[
															new Ext.form.NumberField({
																name:"width",
																width:100,
																value:400
															}),
															new Ext.form.ComboBox({
																name:"width_unit",
																width:60,
																store:new Ext.data.ArrayStore({
																	fields:["value"],
																	data:[["px"],["%"]]
																}),
																displayField:"value",
																valueField:"value",
																value:"px",
																margin:"0 0 0 5"
															})
														]
													}),
													new Ext.form.FieldContainer({
														fieldLabel:Admin.getText("channel/form/widget_height"),
														layout:"hbox",
														items:[
															new Ext.form.NumberField({
																name:"height",
																width:100,
																value:500
															}),
															new Ext.form.ComboBox({
																name:"height_unit",
																width:60,
																store:new Ext.data.ArrayStore({
																	fields:["value"],
																	data:[["px"],["%"]]
																}),
																displayField:"value",
																valueField:"value",
																value:"px",
																margin:"0 0 0 5"
															})
														]
													})
												]
											}),
											new Ext.form.FieldSet({
												title:Admin.getText("channel/form/widget_use_usercode"),
												checkboxName:"use_usercode",
												checkboxToggle:true,
												collapsed:false,
												items:[
													new Ext.form.TextField({
														fieldLabel:Admin.getText("channel/form/widget_nickname"),
														name:"nickname",
														value:"$member['mb_name']",
														afterBodyEl:'<div class="x-form-help">' + Admin.getText("channel/form/widget_nickname_help") + '</div>'
													}),
													new Ext.form.TextField({
														fieldLabel:Admin.getText("channel/form/widget_nickcon"),
														name:"nickcon",
														value:"'" + location.href.split("admin").shift() + "'.$member['mb_level'].'.gif,{NICKNAME}'",
														afterBodyEl:'<div class="x-form-help">' + Admin.getText("channel/form/widget_nickcon_help") + '</div>'
													}),
													new Ext.form.TextField({
														fieldLabel:Admin.getText("channel/form/widget_photo"),
														name:"photo",
														value:"'" + location.href.split("admin").shift() + "'.$member['mb_photo'].'.jpg'",
														afterBodyEl:'<div class="x-form-help">' + Admin.getText("channel/form/widget_photo_help") + '</div>'
													}),
													new Ext.form.TextField({
														fieldLabel:Admin.getText("channel/form/widget_level"),
														name:"level",
														value:"$member['mb_level']",
														afterBodyEl:'<div class="x-form-help">' + Admin.getText("channel/form/widget_level_help") + '</div>'
													})
												]
											})
										]
									})
								]
							}),
							new Ext.Panel({
								region:"center",
								html:'<iframe id="MinitalkWidgetCodeFrame" src="./code.php" style="width:100%; height:100%; border:0;" frameborder="0"></iframe>'
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						id:"MinitalkWidgetCodeCreateButton",
						text:Admin.getText("channel/form/widget_create_code"),
						handler:function() {
							Ext.getCmp("MinitalkWidgetCodeForm").getForm().submit({
								url:Minitalk.getProcessUrl("@getWidgetCode"),
								submitEmptyText:false,
								waitTitle:Admin.getText("action/wait"),
								waitMsg:Admin.getText("action/saving"),
								success:function(form,action) {
									var $frame = $(document.getElementById("MinitalkWidgetCodeFrame").contentDocument.body);
									$("pre > code",$frame).text(action.result.code);
									document.getElementById("MinitalkWidgetCodeFrame").contentWindow.hljs.highlightAll();
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
					})
				]
			}).show();
		},
		/**
		 * 채널을 삭제한다.
		 */
		delete:function() {
			var selected = Ext.getCmp("MinitalkPanel-channel").getSelectionModel().getSelection();
			if (selected.length == 0) {
				Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
				return;
			}
			
			var channels = [];
			for (var i=0, loop=selected.length;i<loop;i++) {
				channels.push(selected[i].get("channel"));
			}
			
			Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("channel/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
				if (button == "ok") {
					Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
					$.send(Minitalk.getProcessUrl("@deleteChannel"),{channels:JSON.stringify(channels)},function(result) {
						if (result.success == true) {
							Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
								Ext.getCmp("MinitalkPanel-channel").getStore().reload();
							}});
						}
					});
				}
			}});
		}
	},
	/**
	 * 리소스
	 */
	resource:{
		/**
		 * 파일
		 */
		attachment:{
			delete:function() {
				var selected = Ext.getCmp("MinitalkAttachment").getSelectionModel().getSelection();
				if (selected.length == 0) {
					Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
					return;
				}
				
				var hashes = [];
				for (var i=0, loop=selected.length;i<loop;i++) {
					hashes.push(selected[i].get("hash"));
				}
				
				Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("resource/attachment/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
					if (button == "ok") {
						Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
						$.send(Minitalk.getProcessUrl("@deleteAttachment"),{hashes:JSON.stringify(hashes)},function(result) {
							if (result.success == true) {
								Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
									Ext.getCmp("MinitalkAttachment").getStore().reload();
								}});
							}
						});
					}
				}});
			},
			expired:function() {
				Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("resource/attachment/delete_expired_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
					if (button == "ok") {
						Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
						$.send(Minitalk.getProcessUrl("@deleteAttachment"),{mode:"expired"},function(result) {
							if (result.success == true) {
								Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
									Ext.getCmp("MinitalkAttachment").getStore().reload();
								}});
							}
						});
					}
				}});
			}
		},
		/**
		 * 캐시
		 */
		cache:{
			delete:function() {
				var selected = Ext.getCmp("MinitalkCache").getSelectionModel().getSelection();
				if (selected.length == 0) {
					Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("NOT_SELECTED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
					return;
				}
				
				var names = [];
				for (var i=0, loop=selected.length;i<loop;i++) {
					names.push(selected[i].get("name"));
				}
				
				Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("resource/cache/delete_confirm"),buttons:Ext.Msg.OKCANCEL,icon:Ext.Msg.QUESTION,fn:function(button) {
					if (button == "ok") {
						Ext.Msg.wait(Admin.getText("action/working"),Admin.getText("action/wait"));
						$.send(Minitalk.getProcessUrl("@deleteCache"),{names:JSON.stringify(names)},function(result) {
							if (result.success == true) {
								Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("action/worked"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
									Ext.getCmp("MinitalkCache").getStore().reload();
								}});
							}
						});
					}
				}});
			}
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
								value:"",
								listeners:{
									change:function(form,value) {
										if (value == "NOTICE") {
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("channel").hide();
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("channel").disable();
											Ext.getCmp("MinitalkBroadcastSendUser").hide();
											Ext.getCmp("MinitalkBroadcastSendUser").disable();
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("url").show();
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("url").enable();
										} else {
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("channel").show();
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("channel").enable();
											Ext.getCmp("MinitalkBroadcastSendUser").show();
											Ext.getCmp("MinitalkBroadcastSendUser").enable();
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("url").hide();
											Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("url").disable();
										}
										
										setTimeout(function() { Ext.getCmp("MinitalkBroadcastSendWindow").center(); },100);
									}
								}
							}),
							new Ext.form.ComboBox({
								fieldLabel:Admin.getText("broadcast/form/channel"),
								name:"channel",
								store:new Ext.data.JsonStore({
									proxy:{
										type:"ajax",
										url:Minitalk.getProcessUrl("@getChannels"),
										reader:{type:"json"}
									},
									remoteSort:false,
									pageSize:50,
									sorters:[{property:"channel",direction:"ASC"}],
									fields:["channel","title_channel"]
								}),
								queryMode:"remote",
								queryParam:"keyword",
								editable:true,
								anyMatch:true,
								minChars:1,
								triggerAction:"all",
								displayField:"title_channel",
								valueField:"channel",
								afterBodyEl:'<div class="x-form-help">' + Admin.getText("broadcast/form/channel_help") + '</div>'
							}),
							new Ext.form.FieldContainer({
								id:"MinitalkBroadcastSendUser",
								fieldLabel:Admin.getText("broadcast/form/user"),
								layout:{type:"vbox",align:"stretch"},
								margin:"0 0 0 0",
								items:[
									new Ext.form.TextField({
										name:"nickname",
										emptyText:Admin.getText("broadcast/form/nickname")
									}),
									new Ext.form.TextField({
										name:"nickcon",
										emptyText:Admin.getText("broadcast/form/nickcon"),
										allowBlank:true
									}),
									new Ext.form.TextField({
										name:"photo",
										emptyText:Admin.getText("broadcast/form/photo"),
										allowBlank:true
									}),
									new Ext.form.ComboBox({
										name:"level",
										store:new Ext.data.ArrayStore({
											fields:["display","value"],
											data:(function() {
												var datas = [];
												for (var i=0;i<10;i++) {
													datas.push([Minitalk.getText("level/"+i),i]);
												}
												
												return datas;
											})()
										}),
										displayField:"display",
										valueField:"value",
										value:0,
										afterBodyEl:'<div class="x-form-help">' + Admin.getText("broadcast/form/user_help") + '</div>'
									})
								]
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("broadcast/form/message"),
								name:"message",
								allowBlank:false
							}),
							new Ext.form.TextField({
								fieldLabel:Admin.getText("broadcast/form/url"),
								name:"url",
								allowBlank:true,
								emptyText:Admin.getText("broadcast/form/url_help"),
								validator:function(value) {
									if (value.length == 0 || value.search(/^http(s)?:\/\//) == 0) return true;
									else return Admin.getText("broadcast/form/url_error");
								}
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
									Ext.Msg.show({title:Admin.getText("alert/info"),msg:Admin.getText("broadcast/send_confirm"),buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
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
				],
				listeners:{
					show:function() {
						if (data) {
							Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("type").setValue(data.type);
							
							if (data.type == "NOTICE") {
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("message").setValue(data.message);
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("url").setValue(data.url);
							} else {
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("channel").setValue(data.channel);
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("message").setValue(data.message.message);
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("nickname").setValue(data.message.user.nickname);
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("nickcon").setValue(data.message.user.nickcon);
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("photo").setValue(data.message.user.photo);
								Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("level").setValue(data.message.user.level);
							}
						} else {
							Ext.getCmp("MinitalkBroadcastSendForm").getForm().findField("type").setValue("NOTICE");
						}
						Ext.getCmp("MinitalkBroadcastSendWindow").center();
					}
				}
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