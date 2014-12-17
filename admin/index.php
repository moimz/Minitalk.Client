<?php
REQUIRE_ONCE '../config/default.conf.php';

$logged = Request('logged','session');

if ($logged !== 'TRUE') {
	INCLUDE './login.php';
} else {
	$XMLData = file_get_contents($_ENV['path'].'/install/db.xml');
	$XML = new SimpleXMLElement($XMLData);
	
	$version = (string)($XML->version);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>미니톡관리</title>
<script type="text/javascript" src="./script/extjs4.js"></script>
<script type="text/javascript" src="./script/extjs4.extend.js"></script>
<link rel="stylesheet" href="./css/extjs4.css" type="text/css" title="style" />
<style type="text/css">
* {margin:0px; padding:0px;}
html, body {overflow:hidden;}
</style>
</head>
<body>

<script type="text/javascript">
Ext.require(['*']);

var ChannelForm = function(channel) {
	new Ext.Window({
		id:"ChannelWindow",
		title:(channel ? "채널수정" : "채널생성"),
		width:600,
		modal:true,
		items:[
			new Ext.form.FormPanel({
				id:"ChannelForm",
				border:false,
				bodyPadding:"5 5 0 5",
				fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%",allowBlank:false},
				items:[
					new Ext.form.FieldSet({
						title:"채널기본설정",
						items:[
							new Ext.form.FieldContainer({
								fieldLabel:"카테고리",
								layout:"hbox",
								items:[
									new Ext.form.ComboBox({
										name:"category1",
										flex:1,
										style:{marginRight:"5px"},
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"1",mode:"simple"}
											},
											remoteSort:false,
											sorters:[{property:"sort",direction:"ASC"}],
											autoLoad:true,
											fields:["idx","category","sort"]
										}),
										displayField:"category",
										valueField:"idx",
										typeAhead:true,
										mode:"local",
										triggerAction:"all",
										editable:false,
										emptyText:"1차 카테고리",
										listeners:{select:{fn:function(form) {
											var selected = form.getValue();
											Ext.getCmp("ChannelForm").getForm().findField("category2").getStore().getProxy().setExtraParam("parent",selected);
											Ext.getCmp("ChannelForm").getForm().findField("category2").getStore().reload();
											if (selected == "0") {
												Ext.getCmp("ChannelForm").getForm().findField("category2").disable();
											} else {
												Ext.getCmp("ChannelForm").getForm().findField("category2").enable();
											}
										}}}
									}),
									new Ext.form.ComboBox({
										name:"category2",
										disabled:true,
										flex:1,
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"2",parent:"0",mode:"simple"}
											},
											remoteSort:false,
											sorters:[{property:"sort",direction:"ASC"}],
											autoLoad:true,
											fields:["idx","category","sort"],
											listeners:{load:{fn:function(store) {
												var value = Ext.getCmp("ChannelForm").getForm().findField("category2").getValue();
												if (value && value != "0") {
													if (store.find("idx",value,0,false,false,true) == -1) {
														Ext.getCmp("ChannelForm").getForm().findField("category2").setValue("").clearInvalid();
													}
												}
											}}}
										}),
										displayField:"category",
										valueField:"idx",
										typeAhead:true,
										mode:"local",
										triggerAction:"all",
										editable:false,
										emptyText:"2차 카테고리"
									})
								]
							}),
							new Ext.form.TextField({
								fieldLabel:"채널명",
								name:"channel",
								emptyText:"영문소문자 및 숫자로만 이루어진 30자 이내 채널명 (차후변경불가)",
								readOnly:channel ? true : false,
								validator:function(value) {
									if (value.search(/^[0-9a-z]+$/) == 0 && value.length <= 30) {
										return true;
									} else {
										return "영어소문자 및 숫자로 30자 이내로 입력하여 주십시오."
									}
								}
							}),
							new Ext.form.TextField({
								fieldLabel:"채널타이틀",
								name:"title",
								emptyText:"미니톡위젯 상단에 표시될 타이틀"
							})
						]
					}),
					new Ext.form.FieldSet({
						title:"채널권한설정",
						items:[
							new Ext.form.ComboBox({
								fieldLabel:"채팅권한",
								name:"grade_chat",
								store:new Ext.data.ArrayStore({
									fields:["display","value"],
									data:[["전체","ALL"],["관리자만","ADMIN"],["파워유저이상","POWERUSER"],["회원권한이상","MEMBER"]]
								}),
								displayField:"display",
								valueField:"value",
								typeAhead:true,
								mode:"local",
								triggerAction:"all",
								width:200,
								editable:false,
								value:"ALL"
							}),
							new Ext.form.ComboBox({
								fieldLabel:"글꼴수정권한",
								name:"grade_font",
								store:new Ext.data.ArrayStore({
									fields:["display","value"],
									data:[["전체","ALL"],["관리자만","ADMIN"],["파워유저이상","POWERUSER"],["회원권한이상","MEMBER"]]
								}),
								displayField:"display",
								valueField:"value",
								typeAhead:true,
								mode:"local",
								triggerAction:"all",
								width:200,
								editable:false,
								value:"ALL"
							})
						]
					}),
					new Ext.form.FieldSet({
						title:"부가옵션",
						items:[
							new Ext.form.Checkbox({
								fieldLabel:"브로드캐스트",
								name:"is_broadcast",
								boxLabel:"이 채널은 브로드캐스트 메세지를 받습니다.",
								checked:true
							}),
							new Ext.form.Checkbox({
								fieldLabel:"닉네임변경",
								name:"is_nickname",
								boxLabel:"유저가 닉네임을 자유롭게 변경할 수 있습니다.",
								checked:true
							}),
							new Ext.form.TextField({
								fieldLabel:"공지사항",
								name:"notice",
								allowBlank:true,
								emptyText:"채널접속시 자동으로 유저에게 알려줄 메세지"
							}),
							new Ext.form.FieldContainer({
								fieldLabel:"최대접속자",
								layout:"hbox",
								items:[
									new Ext.form.NumberField({
										name:"maxuser",
										minValue:1,
										maxValue:15000,
										width:60,
										value:1500
									}),
									new Ext.form.DisplayField({
										value:"&nbsp;명 (최대 15,000명까지 설정가능)"
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
				text:"확인",
				handler:function() {
					Ext.getCmp("ChannelForm").getForm().submit({
						url:"./exec/Admin.do.php?action=channel&do="+(channel ? "modify" :"add"),
						submitEmptyText:false,
						waitTitle:"잠시만 기다려주십시오.",
						waitMsg:"채널을 "+(channel ? "수정" : "추가")+"하고 있습니다.",
						success:function(form,action) {
							Ext.Msg.show({title:"안내",msg:"성공적으로 "+(channel ? "수정" : "추가")+"하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
								Ext.getCmp("ChannelList").getStore().reload();
								Ext.getCmp("ChannelWindow").close();
							}});
						},
						failure:function(form,action) {
							Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
						}
					});
				}
			}),
			new Ext.Button({
				text:"취소",
				handler:function() {
					Ext.getCmp("ChannelWindow").close();
				}
			})
		],
		listeners:{show:{fn:function() {
			if (channel) {
				Ext.getCmp("ChannelForm").getForm().load({
					url:"./exec/Admin.get.php?action=channel&get=info&channel="+channel,
					submitEmptyText:false,
					waitTitle:"잠시만 기다려주십시오.",
					waitMsg:"데이터를 로딩중입니다.",
					success:function(form,action) {
						form.findField("category1").fireEvent("select",form.findField("category1"))
					},
					failure:function(form,action) {
						Ext.Msg.show({title:"에러",msg:"서버에 이상이 있어 데이터를 불러오지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
					}
				});
			}
		}}}
	}).show();
};

var CategoryItemContextMenu = function(grid,record,row,index,e) {
	var menu = new Ext.menu.Menu();

	menu.add('<b class="menu-title">'+record.data.category+'</b>');
	
	menu.add({
		text:"카테고리수정",
		handler:function() {
			new Ext.Window({
				id:"CategoryWindow",
				title:"카테고리수정",
				width:400,
				modal:true,
				items:[
					new Ext.form.FormPanel({
						id:"CategoryForm",
						border:false,
						fieldDefaults:{allowBlank:false,labelWidth:80,labelAlign:"right",anchor:"100%"},
						bodyPadding:"10 10 5 10",
						items:[
							new Ext.form.TextField({
								fieldLabel:"카테고리명",
								name:"category",
								value:record.data.category
							})
						]
					})
				],
				buttons:[
					new Ext.Button({
						text:"확인",
						handler:function() {
							Ext.getCmp("CategoryForm").getForm().submit({
								url:"./exec/Admin.do.php?action=category&do=modify&idx="+record.data.idx,
								submitEmptyText:false,
								waitTitle:"잠시만 기다려주십시오.",
								waitMsg:"카테고리를 수정하고 있습니다.",
								success:function(form,action) {
									Ext.Msg.show({title:"안내",msg:"성공적으로 수정하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
										grid.getStore().getAt(index).set("category",form.findField("category").getValue());
										grid.getStore().commitChanges();
										Ext.getCmp("CategoryWindow").close();
									}});
								},
								failure:function(form,action) {
									Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
								}
							});
						}
					}),
					new Ext.Button({
						text:"취소",
						handler:function() {
							Ext.getCmp("CategoryWindow").close();
						}
					})
				]
			}).show();
		}
	});
	
	menu.add({
		text:"카테고리삭제",
		handler:function() {
			Ext.Msg.show({title:"확인",msg:"카테고리를 삭제하면 하위에 생성된 카테고리와 채널이 삭제됩니다.<br />카테고리를 삭제하시겠습니까?",buttons:Ext.Msg.YESNO,icon:Ext.Msg.QUESTION,fn:function(button) {
				if (button == "yes") {
					Ext.Msg.wait("선택한 작업을 서버에서 처리중입니다.","잠시만 기다려주십시오.");
					Ext.Ajax.request({
						url:"./exec/Admin.do.php",
						success:function(response) {
							var data = Ext.JSON.decode(response.responseText);
							if (data.success == true) {
								Ext.Msg.show({title:"안내",msg:"성공적으로 처리하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
									grid.getStore().reload();
								}});
							} else {
								Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
							}
						},
						failure:function() {
							Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
						},
						params:{action:"category","do":"delete","idx":record.data.idx}
					});
				}
			}});
		}
	});
	
	e.stopEvent();
	menu.showAt(e.getXY());
}

var ChannelStore = new Ext.data.JsonStore({
	proxy:{
		type:"ajax",
		simpleSortMode:true,
		url:"./exec/Admin.get.php",
		reader:{type:"json",root:"lists",totalProperty:"totalCount"},
		extraParams:{action:"channel",get:"list",category1:"0",category2:"0",keyword:""}
	},
	remoteSort:true,
	sorters:[{property:"channel",direction:"DESC"}],
	autoLoad:false,
	pageSize:50,
	fields:["idx","category1","category2","channel","title","apikey","font","fontsize","is_nickname","is_broadcast","grade_font","grade_chat","notice","user","maxuser","server"]
});

var LogStore = new Ext.data.JsonStore({
	proxy:{
		type:"ajax",
		simpleSortMode:true,
		url:"./exec/Admin.get.php",
		reader:{type:"json",root:"lists",totalProperty:"totalCount"},
		extraParams:{action:"log",get:"db",last:"0",channel:"",nickname:"",ip:"",date:""}
	},
	remoteSort:true,
	sorters:[{property:"channel",direction:"DESC"}],
	autoLoad:false,
	fields:[{name:"time",type:"int"},"channel","nickname","ip","message"],
	listeners:{
		load:{fn:function(store) {
			var object = document.getElementById("LogDB-body");
			if (store.getProxy().extraParams.last == "0") {
				object.innerHTML = "";
			}
			
			store.getProxy().setExtraParam("last","0");
			var last = "0";
			for (var i=0, loop=store.getCount();i<loop;i++) {
				last = store.getAt(i).get("time");
				var log = document.createElement("div");
				log.style.padding = "5px";
				log.innerHTML = '<span style="color:#666666;">['+Ext.Date.format(new Date(store.getAt(i).get("time")),"Y-m-d H:i:s")+']</span> <span style="color:blue; font-weight:bold;">#'+store.getAt(i).get("channel")+'</span> <span style="font-weight:bold;">'+store.getAt(i).get("nickname")+' : </span>'+store.getAt(i).get("message")+' <span style="color:#999999;">('+store.getAt(i).get("ip")+')</span>';
				object.appendChild(log);
			}
			
			if (document.getElementById("LogMore")) {
				object.removeChild(document.getElementById("LogMore"));
			}
			
			if (store.getCount() == 50) {
				var more = document.createElement("div");
				more.setAttribute("id","LogMore");
				more.style.padding = "10px";
				more.style.border = "1px solid #E5E5E5";
				more.style.background = "#F4F4F4";
				more.style.textAlign = "center";
				more.style.fontFamily = "NanumGothicWeb";
				more.style.fontWeight = "bold";
				more.style.fontSize = "12px";
				more.style.cursor = "pointer";
				more.style.margin = "5px";
				more.onclick = function() {
					LogStore.getProxy().setExtraParam("last",last);
					LogStore.load();
				}
				more.innerHTML = "로그 더보기";
				
				object.appendChild(more);
			}
		}}
	}
});

var LogFileStore = new Ext.data.JsonStore({
	proxy:{
		type:"ajax",
		simpleSortMode:true,
		url:"./exec/Admin.get.php",
		reader:{type:"json",root:"lists",totalProperty:"totalCount"},
		extraParams:{action:"log",get:"filelist",channel:""}
	},
	remoteSort:true,
	sorters:[{property:"date",direction:"DESC"}],
	autoLoad:false,
	fields:["file","date","channel","size"]
});

var BroadcastStore = new Ext.data.JsonStore({
	proxy:{
		type:"ajax",
		simpleSortMode:true,
		url:"./exec/Admin.get.php",
		reader:{type:"json",root:"lists",totalProperty:"totalCount"},
		extraParams:{action:"broadcast",get:"list",keyword:""}
	},
	remoteSort:true,
	sorters:[{property:"reg_date",direction:"DESC"}],
	autoLoad:false,
	pageSize:50,
	fields:["idx","type","message","url","receiver","reg_date"]
});

var IpStore = new Ext.data.JsonStore({
	proxy:{
		type:"ajax",
		simpleSortMode:true,
		url:"./exec/Admin.get.php",
		reader:{type:"json",root:"lists",totalProperty:"totalCount"},
		extraParams:{action:"ip",get:"list",keyword:""}
	},
	remoteSort:true,
	sorters:[{property:"reg_date",direction:"DESC"}],
	autoLoad:false,
	pageSize:50,
	fields:["ip","nickname","memo","reg_date"]
});

Ext.onReady(function () {
	new Ext.Viewport({
		layout:"fit",
		items:[
			new Ext.Panel({
				title:"미니톡관리",
				padding:"5 5 5 5",
				style:{background:"#D3E1F1"},
				layout:"fit",
				items:[
					new Ext.TabPanel({
						id:"TabPanel",
						border:false,
						tabPosition:"bottom",
						activeTab:0,
						items:[
							new Ext.grid.GridPanel({
								id:"ServerList",
								title:"서버관리",
								border:false,
								tbar:[
									new Ext.Button({
										text:"서버생성",
										icon:"./images/add.png",
										handler:function() {
											new Ext.Window({
												id:"ServerAddWindow",
												title:"서버생성",
												width:500,
												modal:true,
												layout:"fit",
												items:[
													new Ext.form.FormPanel({
														id:"ServerAddForm",
														border:false,
														bodyPadding:"10 10 5 10",
														fieldDefaults:{labelAlign:"right",labelWidth:70,anchor:"100%",allowBlank:false},
														items:[
															new Ext.form.ComboBox({
																name:"type",
																store:new Ext.data.ArrayStore({
																	fields:["display","value"],
																	data:[["자체서버 (자체서버에 서버를 구동하여 사용합니다.)","SELF"],["미니톡서버 (미니톡에서 제공하는 서버를 이용합니다.)","MINITALK"]]
																}),
																displayField:"display",
																valueField:"value",
																typeAhead:true,
																mode:"local",
																triggerAction:"all",
																value:"SELF",
																editable:false,
																listeners:{select:{fn:function(form) {
																	if (form.getValue() == "SELF") {
																		Ext.getCmp("ServerAddMINITALK").hide();
																		Ext.getCmp("ServerAddSELF").show();
																	} else {
																		Ext.getCmp("ServerAddSELF").hide();
																		Ext.getCmp("ServerAddMINITALK").show();
																	}
																}}}
															}),
															new Ext.form.FieldSet({
																id:"ServerAddSELF",
																title:"자체서버생성",
																fieldDefaults:{labelAlign:"right",labelWidth:60,anchor:"100%",allowBlank:false},
																items:[
																	new Ext.form.FieldContainer({
																		fieldLabel:"서버포트",
																		layout:"hbox",
																		items:[
																			new Ext.form.NumberField({
																				name:"port",
																				width:100,
																				value:Ext.getCmp("ServerList").maxPort+1,
																				minValue:1,
																				maxValue:65535
																			}),
																			new Ext.form.DisplayField({
																				value:"&nbsp;(채팅서버접속포트 1~65535)"
																			})
																		]
																	}),
																	new Ext.form.DisplayField({
																		padding:"0 0 0 65",
																		value:'<span style="color:red;">채팅서버로 접속하기 위해 설정한포트가 사용됩니다.<br />해당포트가 이미 사용되고 있는경우 생성이후 서버실행이 되지 않을 수 있으며, 서버가 실행이 되더라도 서버의 방화벽설정으로 해당포트가 차단되어 있을 경우 정상적으로 접속이 이루어지지 않을 수 있습니다.'
																	})
																]
															}),
															new Ext.form.FieldSet({
																id:"ServerAddMINITALK",
																title:"미니톡서버등록",
																hidden:true,
																fieldDefaults:{labelAlign:"right",labelWidth:70,anchor:"100%",allowBlank:true},
																items:[
																	new Ext.form.TextField({
																		fieldLabel:"아이디",
																		name:"user_id",
																		emptyText:"미니톡 홈페이지의 로그인 아이디를 입력합니다."
																	}),
																	new Ext.form.TextField({
																		fieldLabel:"패스워드",
																		name:"password",
																		inputType:"password",
																		emptyText:"미니톡 홈페이지의 로그인 패스워드를 입력합니다."
																	}),
																	new Ext.form.TextField({
																		fieldLabel:"접속코드",
																		name:"mcode",
																		emptyText:"미니톡 홈페이지에서 발급받은 접속코드를 입력합니다."
																	}),
																	new Ext.form.DisplayField({
																		padding:"0 0 0 75",
																		value:'<span style="color:red;">미니톡서버를 등록후 사용하기 위해서는 미니톡홈페이지에서 서버접속이용권이 활성화되어있어야 합니다.'
																	})
																]
															})
														]
													})
												],
												buttons:[
													new Ext.Button({
														text:"확인",
														handler:function() {
															Ext.getCmp("ServerAddForm").getForm().submit({
																url:"./exec/Admin.do.php?action=server&do=add",
																submitEmptyText:false,
																waitTitle:"잠시만 기다려주십시오.",
																waitMsg:"서버를 생성중입니다.",
																success:function(form,action) {
																	if (form.findField("type").getValue() == "SELF") {
																		var msg = "성공적으로 생성하였습니다.<br />생성된 서버를 실행하는 명령은 아래와 같습니다. SSH로 접속 후 실행하여 주십시오.<br /><?php echo $_ENV['path']; ?>/server/minitalk."+Ext.getCmp("ServerAddForm").getForm().findField("port").getValue()+".js &";
																	} else {
																		var msg = "성공적으로 등록하였습니다.";
																	}
																	Ext.Msg.show({title:"안내",msg:msg,buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
																		Ext.getCmp("ServerList").getStore().reload();
																		Ext.getCmp("ServerAddWindow").close();
																	}});
																},
																failure:function(form,action) {
																	if (action.result) {
																		if (action.result.message) {
																			Ext.Msg.show({title:"에러",msg:action.result.message,buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																			return;
																		}
																	}
																	Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																}
															});
														}
													}),
													new Ext.Button({
														text:"취소",
														handler:function() {
															Ext.getCmp("ServerAddWindow").close();
														}
													})
												]
											}).show();
										}
									}),
									'->',
									{xtype:"tbtext",text:"마우스더블클릭 : 서버정보보기 / 우클릭 : 상세메뉴"}
								],
								maxPort:3120,
								columns:[
									new Ext.grid.RowNumberer(),
									{
										header:"서버종류",
										dataIndex:"type",
										width:80,
										renderer:function(value) {
											if (value == "SELF") return "자체서버";
											else return "미니톡서버";
										}
									},{
										header:"서버정보 / 미니톡서버접속코드",
										dataIndex:"mcode",
										width:240,
										summaryType:"count",
										summaryRenderer:function(value) {
											return '총 '+value+'개 서버';
										}
									},{
										header:"서버상태",
										dataIndex:"status",
										width:100,
										renderer:function(value) {
											if (value == "ONLINE") {
												return '<span style="color:blue;">온라인</span>';
											} else if (value == "REAUTH") {
												return '<span style="color:red;">재등록필요</span>';
											} else {
												return '<span style="color:red;">오프라인</span>';
											}
										}
									},{
										header:"개설채널수",
										dataIndex:"channel",
										flex:1,
										renderer:GridNumberFormat,
										summaryType:"sum"
									},{
										header:"접속자수",
										dataIndex:"user",
										flex:1,
										renderer:GridNumberFormat,
										summaryType:"sum"
									},{
										header:"최대접속자수",
										dataIndex:"maxuser",
										width:80,
										renderer:function(value,p,record) {
											if (record.data.type == "SELF") {
												return '<div style="text-align:center;">무제한</div>';
											} else {
												if (value == "UNKNOWN") {
													return '<div style="text-align:center;">확인불가</div>';
												} else {
													return GridNumberFormat(value);
												}
											}
										}
									},{
										header:"접속만료일",
										dataIndex:"expire_time",
										width:160,
										renderer:function(value,p,record) {
											if (record.data.type == "SELF") {
												return '<div style="text-align:center;">무제한</div>';
											} else {
												if (value == "UNKNOWN") {
													return '<div style="text-align:center;">확인불가</div>';
												} else if (value == "") {
													return '<div style="text-align:center; color:red;">접속기간 만료됨</div>';
												} else {
													return value;
												}
											}
										}
									},{
										header:"최종확인시각",
										dataIndex:"check_time",
										width:160
									}
								],
								columnLines:true,
								store:new Ext.data.JsonStore({
									proxy:{
										type:"ajax",
										simpleSortMode:true,
										url:"./exec/Admin.get.php",
										reader:{type:"json",root:"lists",totalProperty:"totalCount"},
										extraParams:{action:"server",get:"list"}
									},
									remoteSort:false,
									sorters:[{property:"idx",direction:"ASC"}],
									autoLoad:true,
									pageSize:50,
									fields:["idx","type",{name:"port",type:"int"},"mcode",{name:"user",type:"int"},{name:"channel",type:"int"},"maxuser","status","expire_time","check_time"],
									listeners:{load:{fn:function(store) {
										if (store.getCount() > 0) {
											var port = 0;
											for (var i=0, loop=store.getCount();i<loop;i++) {
												port = port < store.getAt(i).get("port") ? store.getAt(i).get("port") : port;
											}
											Ext.getCmp("ServerList").maxPort = port;
										}
									}}}
								}),
								features:[{ftype:"summary"}],
								bbar:[
									new Ext.Button({
										text:"새로고침",
										icon:"./images/arrow_refresh.png",
										style:{margin:"1px 0px 1px 0px"},
										handler:function() {
											Ext.getCmp("ServerList").getStore().reload();
										}
									})
								],
								listeners:{
									itemdblclick:{fn:function(grid,record) {
										if (record.data.type == "SELF") {
											Ext.Msg.show({title:"서버정보",msg:"자체적으로 현재서버에 설치된 채팅서버입니다.<br />서버에 SSH ROOT권한으로 접속하여 아래명령어를 입력하시면 서버가 실행됩니다.<br /><?php echo $_SERVER['DOCUMENT_ROOT']; ?>/server/minitalk."+record.data.port+".js &",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO});
										} else {
											Ext.Msg.show({title:"서버정보",msg:"미니톡에서 제공하는 채팅서버입니다.<br />미니톡홈페이지에서 서버접속이용권을 구매후 접속할 수 있습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO});
										}
									}},
									itemcontextmenu:{fn:function(grid,record,row,index,e) {
										grid.getSelectionModel().select(index);
										var menu = new Ext.menu.Menu();
										
										menu.add('<b class="menu-title">'+record.data.mcode+'</b>');
										
										menu.add({
											text:"서버삭제",
											handler:function() {
												Ext.Msg.show({title:"확인",msg:"선택서버를 삭제하시겠습니까?<br />서버가 현재 온라인이고 접속자가 있다면 모두 접속이 끊어집니다.",buttons:Ext.Msg.YESNO,icon:Ext.Msg.QUESTION,fn:function(button) {
													if (button == "yes") {
														Ext.Msg.wait("선택한 작업을 서버에서 처리중입니다.","잠시만 기다려주십시오.");
														Ext.Ajax.request({
															url:"./exec/Admin.do.php",
															success:function(response) {
																var data = Ext.JSON.decode(response.responseText);
																if (data.success == true) {
																	Ext.Msg.show({title:"안내",msg:"성공적으로 처리하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
																		grid.getStore().reload();
																	}});
																} else {
																	Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
																}
															},
															failure:function() {
																Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
															},
															params:{action:"server","do":"delete","idx":record.data.idx}
														});
													}
												}});
											}
										});
										
										e.stopEvent();
										menu.showAt(e.getXY());
									}}
								}
							}),
							new Ext.Panel({
								id:"CategoryList",
								title:"카테고리관리",
								border:false,
								layout:{type:"hbox",align:"stretch"},
								isLoad:false,
								items:[
									new Ext.grid.GridPanel({
										id:"CategoryList1",
										title:"1차 카테고리",
										border:true,
										margin:"5 5 5 5",
										flex:1,
										tbar:[
											new Ext.Button({
												text:"카테고리추가",
												icon:"./images/add.png",
												handler:function() {
													new Ext.Window({
														id:"CategoryWindow",
														title:"카테고리추가",
														width:400,
														modal:true,
														items:[
															new Ext.form.FormPanel({
																id:"CategoryForm",
																border:false,
																fieldDefaults:{allowBlank:false,labelWidth:80,labelAlign:"right",anchor:"100%"},
																bodyPadding:"10 10 5 10",
																items:[
																	new Ext.form.TextField({
																		fieldLabel:"카테고리명",
																		name:"category"
																	})
																]
															})
														],
														buttons:[
															new Ext.Button({
																text:"확인",
																handler:function() {
																	Ext.getCmp("CategoryForm").getForm().submit({
																		url:"./exec/Admin.do.php?action=category&do=add",
																		submitEmptyText:false,
																		waitTitle:"잠시만 기다려주십시오.",
																		waitMsg:"카테고리를 추가하고 있습니다.",
																		success:function(form,action) {
																			Ext.Msg.show({title:"안내",msg:"성공적으로 추가하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
																				Ext.getCmp("CategoryList1").getStore().reload();
																				Ext.getCmp("CategoryWindow").close();
																			}});
																		},
																		failure:function(form,action) {
																			Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																		}
																	});
																}
															}),
															new Ext.Button({
																text:"취소",
																handler:function() {
																	Ext.getCmp("CategoryWindow").close();
																}
															})
														]
													}).show();
												}
											}),
											new Ext.Button({
												id:"CategoryClear1",
												text:"선택해제",
												disabled:true,
												icon:"./images/cross.png",
												handler:function() {
													Ext.getCmp("CategoryList1").getSelectionModel().deselectAll();
												}
											}),
											'->',
											{xtype:"tbtext",text:"마우스클릭:선택 / 우클릭:상세메뉴"}
										],
										columns:[
											new Ext.grid.RowNumberer(),
											{
												header:"카테고리명",
												dataIndex:"category",
												flex:1
											},{
												header:"2차분류수",
												dataIndex:"child",
												width:70,
												renderer:GridNumberFormat,
												summaryType:"sum"
											},{
												header:"채널수",
												dataIndex:"channel",
												width:70,
												renderer:GridNumberFormat,
												summaryType:"sum"
											},{
												header:"접속자수",
												dataIndex:"user",
												width:80,
												renderer:GridNumberFormat,
												summaryType:"sum"
											}
										],
										columnLines:true,
										selModel:new Ext.selection.RowModel({mode:"SINGLE"}),
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"1",keyword:""}
											},
											remoteSort:false,
											sorters:[{property:"category",direction:"ASC"}],
											autoLoad:true,
											pageSize:50,
											fields:["idx","category",{name:"child",type:"int"},{name:"channel",type:"int"},{name:"user",type:"int"}]
										}),
										features:[{ftype:"summary"}],
										listeners:{
											selectionchange:{fn:function(grid,selected) {
												var parent = selected.length == 0 ? "0" : selected.shift().data.idx;
												if (parent == "0") {
													Ext.getCmp("CategoryClear1").disable();
												} else {
													Ext.getCmp("CategoryClear1").enable();
												}
												Ext.getCmp("CategoryList2").getStore().getProxy().setExtraParam("parent",parent);
												Ext.getCmp("CategoryList2").getStore().reload();
												
												Ext.getCmp("CategoryList3").getStore().getProxy().setExtraParam("category1",parent);
												Ext.getCmp("CategoryList3").getStore().getProxy().setExtraParam("category2","0");
												Ext.getCmp("CategoryList3").getStore().reload();
											}},
											itemcontextmenu:CategoryItemContextMenu
										}
									}),
									new Ext.grid.GridPanel({
										id:"CategoryList2",
										title:"2차 카테고리",
										border:true,
										margin:"5 5 5 0",
										flex:1,
										tbar:[
											new Ext.Button({
												text:"카테고리추가",
												icon:"./images/add.png",
												handler:function() {
													new Ext.Window({
														id:"CategoryWindow",
														title:"카테고리추가",
														width:400,
														modal:true,
														items:[
															new Ext.form.FormPanel({
																id:"CategoryForm",
																border:false,
																fieldDefaults:{allowBlank:false,labelWidth:80,labelAlign:"right",anchor:"100%"},
																bodyPadding:"10 10 5 10",
																items:[
																	new Ext.form.TextField({
																		fieldLabel:"카테고리명",
																		name:"category"
																	})
																]
															})
														],
														buttons:[
															new Ext.Button({
																text:"확인",
																handler:function() {
																	Ext.getCmp("CategoryForm").getForm().submit({
																		url:"./exec/Admin.do.php?action=category&do=add&parent="+Ext.getCmp("CategoryList1").getSelectionModel().getSelection().shift().get("idx"),
																		submitEmptyText:false,
																		waitTitle:"잠시만 기다려주십시오.",
																		waitMsg:"카테고리를 추가하고 있습니다.",
																		success:function(form,action) {
																			Ext.Msg.show({title:"안내",msg:"성공적으로 추가하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
																				Ext.getCmp("CategoryList1").getSelectionModel().getSelection().shift().set("child",Ext.getCmp("CategoryList1").getSelectionModel().getSelection().shift().get("child")+1);
																				Ext.getCmp("CategoryList1").getStore().commitChanges();
																				Ext.getCmp("CategoryList2").getStore().reload();
																				Ext.getCmp("CategoryWindow").close();
																			}});
																		},
																		failure:function(form,action) {
																			Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																		}
																	});
																}
															}),
															new Ext.Button({
																text:"취소",
																handler:function() {
																	Ext.getCmp("CategoryWindow").close();
																}
															})
														]
													}).show();
												}
											}),
											new Ext.Button({
												id:"CategoryClear2",
												text:"선택해제",
												disabled:true,
												icon:"./images/cross.png",
												handler:function() {
													Ext.getCmp("CategoryList2").getSelectionModel().deselectAll();
												}
											}),
											'->',
											{xtype:"tbtext",text:"마우스클릭:선택 / 우클릭:상세메뉴"}
										],
										columns:[
											new Ext.grid.RowNumberer(),
											{
												header:"카테고리명",
												dataIndex:"category",
												flex:1
											},{
												header:"채널수",
												dataIndex:"channel",
												width:70,
												renderer:GridNumberFormat
											},{
												header:"접속자수",
												dataIndex:"user",
												width:80,
												renderer:GridNumberFormat
											}
										],
										columnLines:true,
										selModel:new Ext.selection.RowModel({mode:"SINGLE"}),
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"2",parent:"0",keyword:""}
											},
											remoteSort:false,
											sorters:[{property:"category",direction:"ASC"}],
											autoLoad:true,
											pageSize:50,
											fields:["idx","category",{name:"channel",type:"int"},{name:"user",type:"int"}],
											listeners:{
												load:{fn:function(store) {
													if (store.getProxy().extraParams.parent == "0") {
														Ext.getCmp("CategoryList2").setTitle("2차 카테고리 (1차 카테고리를 선택하세요.)");
														Ext.getCmp("CategoryList2").disable();
													} else {
														var title = Ext.getCmp("CategoryList1").getSelectionModel().getSelection().shift().get("category");
														Ext.getCmp("CategoryList2").setTitle(title+" 2차 카테고리");
														Ext.getCmp("CategoryList2").enable();
													}
												}}
											}
										}),
										listeners:{
											selectionchange:{fn:function(grid,selected) {
												var category1 = Ext.getCmp("CategoryList1").getSelectionModel().getSelection().length == 0 ? "0" : Ext.getCmp("CategoryList1").getSelectionModel().getSelection().shift().get("idx");
												var category2 = selected.length == 0 ? "0" : selected.shift().data.idx;
												
												if (category2 == "0") {
													Ext.getCmp("CategoryClear2").disable();
												} else {
													Ext.getCmp("CategoryClear2").enable();
												}
												Ext.getCmp("CategoryList3").getStore().getProxy().setExtraParam("category1",category1);
												Ext.getCmp("CategoryList3").getStore().getProxy().setExtraParam("category2",category2);
												Ext.getCmp("CategoryList3").getStore().reload();
											}},
											itemcontextmenu:CategoryItemContextMenu
										}
									}),
									new Ext.grid.GridPanel({
										id:"CategoryList3",
										title:"카테고리에 개설된 채널",
										border:true,
										margin:"5 5 5 0",
										flex:1,
										tbar:[
											new Ext.Button({
												text:"채널추가",
												icon:"./images/add.png",
												handler:function() {
													Ext.getCmp("TabPanel").setActiveTab(Ext.getCmp("ChannelList"));
													ChannelForm();
												}
											}),
											'->',
											{xtype:"tbtext",text:"채널관리는 채널관리탭에서 가능합니다."}
										],
										columns:[
											new Ext.grid.RowNumberer(),
											{
												header:"채널명",
												dataIndex:"channel",
												width:70
											},{
												header:"채널타이틀",
												dataIndex:"title",
												flex:1
											},{
												header:"접속자수",
												dataIndex:"user",
												width:80,
												renderer:GridNumberFormat
											}
										],
										columnLines:true,
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"3",category1:"0",category2:"0"}
											},
											remoteSort:false,
											sorters:[{property:"channel",direction:"ASC"}],
											autoLoad:true,
											pageSize:50,
											fields:["idx","channel","title",{name:"user",type:"int"}],
											listeners:{load:{fn:function(store) {
												if (store.getProxy().extraParams.category1 == "0") {
													Ext.getCmp("CategoryList3").setTitle("카테고리에 개설된 채널 (카테고리를 선택하세요.)");
													Ext.getCmp("CategoryList3").disable();
												} else {
													var category1 = Ext.getCmp("CategoryList1").getSelectionModel().getSelection().shift().get("category");
													var category2 = Ext.getCmp("CategoryList2").getSelectionModel().getSelection().length == 0 ? "" : Ext.getCmp("CategoryList2").getSelectionModel().getSelection().shift().get("category");
													var title = category2 ? category1+" &gt; "+category2 : category1;
													
													Ext.getCmp("CategoryList3").setTitle(title+"카테고리에 개설된 채널");
													Ext.getCmp("CategoryList3").enable();
												}
											}}}
										})
									})
								]
							}),
							new Ext.grid.GridPanel({
								id:"ChannelList",
								title:"채널관리",
								border:false,
								isLoad:false,
								tbar:[
									new Ext.Button({
										text:"채널생성",
										icon:"./images/add.png",
										handler:function() {
											ChannelForm();
										}
									}),
									'-',
									new Ext.form.ComboBox({
										id:"ChannelCategory1",
										width:100,
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"1",mode:"simple"}
											},
											remoteSort:false,
											sorters:[{property:"sort",direction:"ASC"}],
											autoLoad:true,
											fields:["idx","category","sort"]
										}),
										displayField:"category",
										valueField:"idx",
										typeAhead:true,
										mode:"local",
										triggerAction:"all",
										editable:false,
										emptyText:"1차 카테고리",
										listeners:{select:{fn:function(form) {
											var selected = form.getValue();
											Ext.getCmp("ChannelCategory2").getStore().getProxy().setExtraParam("parent",selected);
											Ext.getCmp("ChannelCategory2").getStore().reload();
											if (selected == "0") {
												Ext.getCmp("ChannelCategory2").disable();
											} else {
												Ext.getCmp("ChannelCategory2").enable();
											}
										}}}
									}),
									new Ext.form.ComboBox({
										id:"ChannelCategory2",
										width:100,
										disabled:true,
										store:new Ext.data.JsonStore({
											proxy:{
												type:"ajax",
												simpleSortMode:true,
												url:"./exec/Admin.get.php",
												reader:{type:"json",root:"lists",totalProperty:"totalCount"},
												extraParams:{action:"category",get:"list",depth:"2",parent:"0",mode:"simple"}
											},
											remoteSort:false,
											sorters:[{property:"sort",direction:"ASC"}],
											autoLoad:true,
											fields:["idx","category","sort"],
											listeners:{load:{fn:function(store) {
												var value = Ext.getCmp("ChannelCategory2").getValue();
												if (value && value != "0") {
													if (store.find("idx",value,0,false,false,true) == -1) {
														Ext.getCmp("ChannelCategory2").setValue("").clearInvalid();
													}
												}
											}}}
										}),
										displayField:"category",
										valueField:"idx",
										typeAhead:true,
										mode:"local",
										triggerAction:"all",
										editable:false,
										emptyText:"2차 카테고리"
									}),
									new Ext.form.TextField({
										id:"ChannelKeyword",
										width:200,
										emptyText:"검색어"
									}),
									new Ext.Button({
										text:"검색",
										icon:"./images/magnifier.png",
										handler:function() {
											Ext.getCmp("ChannelList").getStore().getProxy().setExtraParam("category1",Ext.getCmp("ChannelCategory1").getValue());
											Ext.getCmp("ChannelList").getStore().getProxy().setExtraParam("category2",Ext.getCmp("ChannelCategory2").getValue());
											Ext.getCmp("ChannelList").getStore().getProxy().setExtraParam("keyword",Ext.getCmp("ChannelKeyword").getValue());
											Ext.getCmp("ChannelList").getStore().loadPage(1);
										}
									}),
									'->',
									{xtype:"tbtext",text:"마우스더블클릭 : 채널입장 / 우클릭 : 상세메뉴"}
								],
								columns:[
									new Ext.grid.RowNumberer(),
									{
										header:"채널명",
										dataIndex:"channel",
										width:100
									},{
										header:"1차카테고리",
										dataIndex:"category1",
										width:100
									},{
										header:"2차카테고리",
										dataIndex:"category2",
										width:100
									},{
										header:"채널타이틀",
										dataIndex:"title",
										minWidth:120,
										flex:1
									},{
										header:"사용서버정보 / 미니톡서버접속코드",
										dataIndex:"server",
										width:240,
										renderer:function(value) {
											if (value == "") return '<span style="color:red;">미할당</span>';
											else return value;
										}
									},{
										header:"글꼴권한",
										dataIndex:"grade_font",
										width:80,
										renderer:function(value) {
											if (value == "ADMIN") return '<span style="color:red;">관리자만</span>';
											else if (value == "POWERUSER") return '<span style="color:green;">파워유저이상</span>';
											else if (value == "MEMBER") return '<span style="color:green;">회원이상</span>';
											else return '<span style="color:blue;">전체</span>';
										}
									},{
										header:"대화권한",
										dataIndex:"grade_chat",
										width:80,
										renderer:function(value) {
											if (value == "ADMIN") return '<span style="color:red;">관리자만</span>';
											else if (value == "POWERUSER") return '<span style="color:green;">파워유저이상</span>';
											else if (value == "MEMBER") return '<span style="color:green;">회원이상</span>';
											else return '<span style="color:blue;">전체</span>';
										}
									},{
										header:"채널옵션",
										width:240,
										renderer:function(value,p,record) {
											var sHTML = '';
											if (record.data.is_nickname == "TRUE") sHTML+= '<span style="color:blue;">닉네임변경가능</span>';
											else sHTML+= '<span style="color:red;">닉네임변경불가</span>';
											sHTML+= ' / ';
											if (record.data.is_broadcast == "TRUE") sHTML+= '<span style="color:blue;">브로드캐스트사용</span>';
											else sHTML+= '<span style="color:red;">브로드캐스트무시</span>';
											sHTML+= ' / ';
											if (record.data.notice) sHTML+= '<span style="color:blue;">공지사용</span>';
											else sHTML+= '<span style="color:red;">공지없음</span>';
											return sHTML;
										}
									},{
										header:"현재/최대허용접속자",
										dataIndex:"user",
										width:110,
										renderer:function(value,p,record) {
											return '<span style="color:blue;">'+GetNumberFormat(record.data.user)+"명</span> / "+GetNumberFormat(record.data.maxuser)+"명";
										}
									}
								],
								columnLines:true,
								selModel:new Ext.selection.CheckboxModel({injectCheckbox:"last"}),
								store:ChannelStore,
								bbar:new Ext.PagingToolbar({
									store:ChannelStore,
									displayInfo:true
								}),
								listeners:{
									itemcontextmenu:{fn:function(grid,record,row,index,e) {
										grid.getSelectionModel().select(index);
										var menu = new Ext.menu.Menu();
										
										menu.add('<b class="menu-title">'+record.data.channel+'</b>');
										
										menu.add({
											text:"채널정보수정",
											handler:function() {
												ChannelForm(record.data.channel);
											}
										});
										
										menu.add({
											text:"채널스크립트 생성",
											handler:function() {
												new Ext.Window({
													id:"ScriptCreatorWindow",
													title:"채널스크립트 생성",
													width:950,
													height:500,
													modal:true,
													layout:"fit",
													items:[
														new Ext.Panel({
															border:false,
															layout:{type:"hbox",align:"stretch"},
															items:[
																new Ext.form.FormPanel({
																	id:"ScriptCreatorForm",
																	title:"채널옵션",
																	margin:"5 0 5 5",
																	bodyPadding:"5 5 0 5",
																	fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%",allowBlank:false},
																	width:500,
																	items:[
																		new Ext.form.FieldSet({
																			title:"디자인설정",
																			bodyPadding:"5 5 0 5",
																			items:[
																				new Ext.form.FieldContainer({
																					fieldLabel:"가로크기",
																					layout:"hbox",
																					items:[
																						new Ext.form.NumberField({
																							name:"width",
																							width:60,
																							value:200
																						}),
																						new Ext.form.DisplayField({
																							name:"width_unit",
																							value:"&nbsp;px"
																						}),
																						new Ext.form.NumberField({
																							fieldLabel:"세로크기",
																							name:"height",
																							inputWidth:60,
																							value:500
																						}),
																						new Ext.form.DisplayField({
																							name:"height_unit",
																							value:"&nbsp;px",
																							flex:1
																						}),
																						new Ext.form.Checkbox({
																							boxLabel:"상대비율(%)",
																							name:"isPercent",
																							listeners:{change:{fn:function(form) {
																								if (form.checked == true) {
																									Ext.getCmp("ScriptCreatorForm").getForm().findField("width").setValue(100);
																									Ext.getCmp("ScriptCreatorForm").getForm().findField("width_unit").setValue("%");
																									Ext.getCmp("ScriptCreatorForm").getForm().findField("height").setValue(100);
																								Ext.getCmp("ScriptCreatorForm").getForm().findField("height_unit").setValue("%");
																								} else {
																									Ext.getCmp("ScriptCreatorForm").getForm().findField("width").setValue(200);
																									Ext.getCmp("ScriptCreatorForm").getForm().findField("width_unit").setValue("px");
																									Ext.getCmp("ScriptCreatorForm").getForm().findField("height").setValue(500);
																								Ext.getCmp("ScriptCreatorForm").getForm().findField("height_unit").setValue("px");
																								}
																							}}}
																						})
																					]
																				}),
																				new Ext.form.FieldContainer({
																					fieldLabel:"스킨",
																					layout:"hbox",
																					items:[
																						new Ext.form.ComboBox({
																							name:"skin",
																							width:100,
																							store:new Ext.data.JsonStore({
																								proxy:{
																									type:"ajax",
																									simpleSortMode:true,
																									url:"./exec/Admin.get.php",
																									reader:{type:"json",root:"lists",totalProperty:"totalCount"},
																									extraParams:{action:"channel",get:"skin"}
																								},
																								remoteSort:false,
																								sorters:[{property:"sort",direction:"ASC"}],
																								autoLoad:true,
																								fields:["skin"]
																							}),
																							displayField:"skin",
																							valueField:"skin",
																							typeAhead:true,
																							mode:"local",
																							triggerAction:"all",
																							editable:false,
																							emptyText:"1차 카테고리",
																							value:"default"
																						}),
																						new Ext.form.ComboBox({
																							fieldLabel:"형태",
																							name:"type",
																							inputWidth:100,
																							store:new Ext.data.ArrayStore({
																								fields:["display","value"],
																								data:[["자동","auto"],["가로형태","horizontal"],["세로형태","vertical"]]
																							}),
																							displayField:"display",
																							valueField:"value",
																							typeAhead:true,
																							mode:"local",
																							triggerAction:"all",
																							value:"auto",
																							editable:false
																						})
																					]
																				}),
																				new Ext.form.Checkbox({
																					fieldLabel:"접속자목록",
																					name:"viewUser",
																					boxLabel:"접속자목록을 기본적으로 보이게 설정합니다.",
																					checked:true
																				}),
																				new Ext.form.Checkbox({
																					fieldLabel:"상태아이콘",
																					name:"viewStatusIcon",
																					boxLabel:"유저의 상태표시(온라인 등)아이콘을 접속자목록에 보이게 설정합니다.",
																					checked:true
																				}),
																				new Ext.form.ComboBox({
																					fieldLabel:"툴바아이콘",
																					name:"toolType",
																					store:new Ext.data.ArrayStore({
																						fields:["display","value"],
																						data:[["툴바아이콘을 아이콘만 표시합니다.","icon"],["툴바아이콘을 텍스트만 표시합니다.","text"],["툴바아이콘을 아이콘과 텍스트로 표시합니다.","icontext"]]
																					}),
																					displayField:"display",
																					valueField:"value",
																					typeAhead:true,
																					mode:"local",
																					triggerAction:"all",
																					value:"icon",
																					editable:false
																				})
																			]
																		}),
																		new Ext.form.FieldSet({
																			title:"글로벌설정",
																			bodyPadding:"5 5 0 5",
																			items:[
																				new Ext.form.FieldContainer({
																					layout:"hbox",
																					items:[
																						new Ext.form.ComboBox({
																							fieldLabel:"언어팩",
																							name:"language",
																							inputWidth:100,
																							store:new Ext.data.JsonStore({
																								proxy:{
																									type:"ajax",
																									simpleSortMode:true,
																									url:"./exec/Admin.get.php",
																									reader:{type:"json",root:"lists",totalProperty:"totalCount"},
																									extraParams:{action:"channel",get:"language"}
																								},
																								remoteSort:false,
																								sorters:[{property:"sort",direction:"ASC"}],
																								autoLoad:true,
																								fields:["lang","title"]
																							}),
																							displayField:"title",
																							valueField:"lang",
																							typeAhead:true,
																							mode:"local",
																							triggerAction:"all",
																							value:"ko",
																							editable:false
																						}),
																						new Ext.form.ComboBox({
																							fieldLabel:"인코딩",
																							name:"encode",
																							inputWidth:100,
																							store:new Ext.data.ArrayStore({
																								fields:["value"],
																								data:[["UTF-8"],["EUC-KR"],["EUC-JP"]]
																							}),
																							displayField:"value",
																							valueField:"value",
																							typeAhead:true,
																							mode:"local",
																							triggerAction:"all",
																							value:"UTF-8",
																							editable:false
																						})
																					]
																				})
																			]
																		}),
																		new Ext.form.FieldSet({
																			title:"환경설정",
																			bodyPadding:"5 5 0 5",
																			items:[
																				new Ext.form.FieldContainer({
																					layout:"hbox",
																					items:[
																						new Ext.form.ComboBox({
																							fieldLabel:"접속메세지",
																							name:"alertLimit",
																							flex:1,
																							store:new Ext.data.ArrayStore({
																								fields:["display","value"],
																								data:[["관리자 접속/종료시에만 알림메세지를 출력","ADMIN"],["파워유저이상 접속/종료시에만 알림메세지를 출력","POWERUSER"],["회원권한이상 접속/종료시에만 알림메세지를 출력","MEMBER"],["닉네임을 설정한 유저이상 접속/종료시에만 알림메세지를 출력","NICKGUEST"],["전제유저의 접속/종료 알림메세지를 출력","ALL"]]
																							}),
																							displayField:"display",
																							valueField:"value",
																							typeAhead:true,
																							mode:"local",
																							triggerAction:"all",
																							value:"MEMBER",
																							editable:false
																						}),
																						new Ext.form.Checkbox({
																							boxLabel:"전체숨김",
																							name:"viewAlert",
																							style:{marginLeft:"5px"},
																							listeners:{change:{fn:function(form) {
																								Ext.getCmp("ScriptCreatorForm").getForm().findField("alertLimit").setDisabled(form.checked);
																							}}}
																						})
																					]
																				}),
																				new Ext.form.ComboBox({
																					fieldLabel:"접속자목록",
																					name:"viewUserLimit",
																					flex:1,
																					store:new Ext.data.ArrayStore({
																						fields:["display","value"],
																						data:[["관리자만 유저목록에 표시","ADMIN"],["파워유저권한이상 유저만 유저목록에 표시","POWERUSER"],["회원권한이상 유저만 유저목록에 표시","MEMBER"],["닉네임을 설정한 모든 유저 유저목록에 표시","NICKGUEST"],["전제유저를 유저목록에 표시","ALL"]]
																					}),
																					displayField:"display",
																					valueField:"value",
																					typeAhead:true,
																					mode:"local",
																					triggerAction:"all",
																					value:"ALL",
																					editable:false
																				}),
																				new Ext.form.FieldContainer({
																					fieldLabel:"이전대화기록",
																					layout:"hbox",
																					items:[
																						new Ext.form.NumberField({
																							name:"logLimit",
																							width:60,
																							value:15,
																							minValue:0,
																							maxValue:30
																						}),
																						new Ext.form.DisplayField({
																							value:"&nbsp;줄 (0 ~ 30, 0입력시 이전대화기록 표시하지 않음)"
																						})
																					]
																				})
																			]
																		}),
																		new Ext.form.FieldSet({
																			title:"기타설정",
																			padding:"5 10 10 10",
																			html:"기타 세부적인 설정은 생성된 소스와 채널스크립트API문서를 참고하여 세부적으로 설정할 수 있습니다."
																		})
																	]
																}),
																new Ext.Panel({
																	title:"소스코드",
																	margin:"5 5 5 5",
																	flex:1,
																	layout:"fit",
																	items:[
																		new Ext.form.FormPanel({
																			id:"ScriptCreatorSourceForm",
																			border:false,
																			layout:"fit",
																			items:[
																				new Ext.form.TextArea({
																					name:"source",
																					style:{margin:"-2px -1px -1px -1px"},
																					layout:"fit",
																					border:false,
																					readOnly:true,
																					value:'',
																					selectOnFocus:true,
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
															text:"소스생성",
															handler:function() {
																Ext.getCmp("ScriptCreatorSourceForm").getForm().load({
																	url:"./exec/Admin.get.php?action=channel&get=source",
																	submitEmptyText:false,
																	waitTitle:"잠시만 기다려주십시오.",
																	waitMsg:"소스를 생성중입니다.",
																	success:function(form,action) {
																	},
																	failure:function(form,action) {
																		Ext.Msg.show({title:"에러",msg:"서버에 이상이 있어 데이터를 불러오지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																	},
																	params:{"channel":record.data.channel,"data":Ext.JSON.encode(Ext.getCmp("ScriptCreatorForm").getForm().getFieldValues())}
																});
															}
														}),
														new Ext.Button({
															text:"취소",
															handler:function() {
																Ext.getCmp("ScriptCreatorWindow").close();
															}
														})
													],
													listeners:{show:{fn:function() {
														Ext.getCmp("ScriptCreatorSourceForm").getForm().load({
															url:"./exec/Admin.get.php?action=channel&get=source",
															submitEmptyText:false,
															waitTitle:"잠시만 기다려주십시오.",
															waitMsg:"소스를 생성중입니다.",
															success:function(form,action) {
															},
															failure:function(form,action) {
																Ext.Msg.show({title:"에러",msg:"서버에 이상이 있어 데이터를 불러오지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
															},
															params:{"channel":record.data.channel,"data":Ext.JSON.encode(Ext.getCmp("ScriptCreatorForm").getForm().getFieldValues())}
														});
													}}}
												}).show();
											}
										});
										
										menu.add({
											text:"채널삭제",
											handler:function() {
												Ext.Msg.show({title:"확인",msg:"채널을 삭제하시겠습니까?",buttons:Ext.Msg.YESNO,icon:Ext.Msg.QUESTION,fn:function(button) {
													if (button == "yes") {
														Ext.Msg.wait("선택한 작업을 서버에서 처리중입니다.","잠시만 기다려주십시오.");
														Ext.Ajax.request({
															url:"./exec/Admin.do.php",
															success:function(response) {
																var data = Ext.JSON.decode(response.responseText);
																if (data.success == true) {
																	Ext.Msg.show({title:"안내",msg:"성공적으로 처리하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
																		grid.getStore().reload();
																	}});
																} else {
																	Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
																}
															},
															failure:function() {
																Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
															},
															params:{action:"channel","do":"delete","channel":record.data.channel}
														});
													}
												}});
											}
										});
										
										e.stopEvent();
										menu.showAt(e.getXY());
									}},
									itemdblclick:{fn:function(grid,record) {
										new Ext.Window({
											title:record.data.title,
											width:700,
											height:500,
											modal:true,
											html:'<iframe src="./minitalk.php?channel='+record.data.channel+'" frameborder="0" style="width:100%; height:100%;" scrolling="0"></iframe>'
										}).show();
									}}
								}
							}),
							new Ext.Panel({
								id:"LogList",
								title:"로그관리",
								layout:{type:"hbox",align:"stretch"},
								border:false,
								isLoad:false,
								items:[
									new Ext.Panel({
										id:"LogDB",
										title:"DB로그",
										flex:1,
										margin:"5 5 5 5",
										store:LogStore,
										autoScroll:true,
										tbar:[
											new Ext.form.TextField({
												id:"LogChannel",
												width:90,
												emptyText:"채널명"
											}),
											new Ext.form.TextField({
												id:"LogNickname",
												width:80,
												emptyText:"닉네임"
											}),
											new Ext.form.TextField({
												id:"LogIp",
												width:80,
												emptyText:"아이피"
											}),
											new Ext.form.DateField({
												id:"LogDate",
												format:"Y-m-d",
												width:95,
												emptyText:"날짜"
											}),
											new Ext.Button({
												text:"검색",
												icon:"./images/magnifier.png",
												handler:function() {
													LogStore.getProxy().setExtraParam("channel",Ext.getCmp("LogChannel").getValue());
													LogStore.getProxy().setExtraParam("nickname",Ext.getCmp("LogNickname").getValue());
													LogStore.getProxy().setExtraParam("ip",Ext.getCmp("LogIp").getValue());
													LogStore.getProxy().setExtraParam("date",Ext.getCmp("LogDate").getValue());
													LogStore.reload();
												}
											}),
											'-',
											new Ext.Button({
												text:"파일로저장",
												icon:"./images/disk.png",
												handler:function() {
													new Ext.Window({
														id:"LogFileWindow",
														title:"파일로저장",
														width:400,
														modal:true,
														items:[
															new Ext.form.FormPanel({
																bodyPadding:"10 10 5 10",
																border:false,
																fieldDefaults:{labelAlign:"right",labelWidth:60},
																items:[
																	new Ext.form.FieldContainer({
																		fieldLabel:"기준일자",
																		layout:"hbox",
																		items:[
																			new Ext.form.DateField({
																				id:"LogFileDate",
																				width:95,
																				format:"Y-m-d",
																				value:Ext.Date.format(Ext.Date.add(new Date(),Ext.Date.DAY,-3),"Y-m-d"),
																				maxValue:Ext.Date.format(Ext.Date.add(new Date(),Ext.Date.DAY,-3),"Y-m-d")
																			}),
																			new Ext.form.DisplayField({
																				value:"&nbsp;이전의 로그를 파일로저장"
																			})
																		]
																	})
																]
															})
														],
														buttons:[
															new Ext.Button({
																text:"확인",
																handler:function() {
																	Ext.Msg.show({title:"확인",msg:"DB에 기록된 로그를 파일로저장할 경우 파일로 저장된 로그는 검색, 로그API이용 등이 불가능합니다.<br />DB에 기록된 로그중 더이상 로그API나 검색을 이용할 필요가 없는 날짜이전만 파일로 저장하기 바랍니다.<br />기준일자 이전의 로그를 파일로 저장하시겠습니까?",buttons:Ext.Msg.YESNO,icon:Ext.Msg.INFO,fn:function(button) {
																		if (button == "yes") {
																			new Ext.Window({
																				id:"LogFileProgressWindow",
																				title:"파일로 저장중...",
																				modal:true,
																				closable:false,
																				resizable:false,
																				width:300,
																				items:[
																					new Ext.ProgressBar({
																						id:"LogFileProgress",
																						text:"파일로 저장준비중..."
																					})
																				],
																				listeners:{show:{fn:function() {
																					execFrame.location.href = "./exec/LogFileConvert.do.php?date="+Ext.Date.format(Ext.getCmp("LogFileDate").getValue(),"Y-m-d")
																				}}}
																			}).show();
																		} else {
																			Ext.getCmp("LogFileWindow").close();
																		}
																	}});
																}
															}),
															new Ext.Button({
																text:"취소",
																handler:function() {
																	Ext.getCmp("LogFileWindow").close();
																}
															})
														]
													}).show();
												}
											})
										],
										html:'',
										bbar:[
											new Ext.Button({
												text:"새로고침",
												icon:"./images/arrow_refresh.png",
												style:{margin:"1px 0px 1px 0px"},
												handler:function() {
													LogStore.reload();
													Ext.getCmp("LogTotalLine").fireEvent("render",Ext.getCmp("LogTotalLine"));
												}
											}),
											'->',
											new Ext.toolbar.TextItem({
												id:"LogTotalLine",
												text:"DB에 기록된 총 로그 : 계산중...",
												listeners:{render:{fn:function(button) {
													Ext.Ajax.request({
														url:"./exec/Admin.get.php",
														success:function(response) {
															var data = Ext.JSON.decode(response.responseText);
															button.setText("DB에 기록된 총 로그 : "+GetNumberFormat(data.line)+"줄");
														},
														failure:function() {
														},
														headers:{},
														params:{"action":"log","get":"dbtotal"}
													});
												}}}
											})
										]
									}),
									new Ext.grid.GridPanel({
										id:"LogFile",
										title:"파일보관로그",
										width:400,
										margin:"5 5 5 0",
										tbar:[
											new Ext.form.TextField({
												id:"LogFileChannel",
												width:100,
												emptyText:"채널명"
											}),
											new Ext.Button({
												text:"검색",
												icon:"./images/magnifier.png",
												handler:function() {
													LogFileStore.getProxy().setExtraParam("channel",Ext.getCmp("LogFileChannel").getValue());
													LogFileStore.loadPage(1);
												}
											}),
											'->',
											{xtype:"tbtext",text:"마우스더블클릭:로그보기 / 우클릭:상세메뉴"}
										],
										columns:[
											new Ext.grid.RowNumberer(),
											{
												header:"로그날짜",
												dataIndex:"date",
												width:80
											},{
												header:"채널명",
												dataIndex:"channel",
												flex:1
											},{
												header:"용량",
												dataIndex:"size",
												width:80,
												renderer:function(value) {
													return '<div style="font-family:tahoma; font-size:11px; text-align:right;">'+GetFileSize(value)+'</div>';
												}
											}
										],
										columnLines:true,
										selModel:new Ext.selection.CheckboxModel({injectCheckbox:"last"}),
										store:LogFileStore,
										bbar:new Ext.PagingToolbar({
											store:LogFileStore,
											displayInfo:true
										}),
										listeners:{
											itemcontextmenu:{fn:function(grid,record,row,index,e) {
												grid.getSelectionModel().select(index);
												var menu = new Ext.menu.Menu();
												
												menu.add('<b class="menu-title">'+record.data.channel+'('+record.data.date+')</b>');
												
												menu.add({
													text:"로그파일다운로드",
													handler:function() {
														execFrame.location.href = "./exec/Admin.do.php?action=log&do=download&file="+record.data.file;
													}
												});
												
												menu.add({
													text:"로그파일삭제",
													handler:function() {
														Ext.Msg.show({title:"확인",msg:"해당 로그파일을 삭제하시겠습니까?",buttons:Ext.Msg.YESNO,icon:Ext.Msg.QUESTION,fn:function(button) {
															if (button == "yes") {
																Ext.Msg.wait("선택한 작업을 서버에서 처리중입니다.","잠시만 기다려주십시오.");
																Ext.Ajax.request({
																	url:"./exec/Admin.do.php",
																	success:function(response) {
																		var data = Ext.JSON.decode(response.responseText);
																		if (data.success == true) {
																			Ext.Msg.show({title:"안내",msg:"성공적으로 처리하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
																				grid.getStore().reload();
																			}});
																		} else {
																			Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
																		}
																	},
																	failure:function() {
																		Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
																	},
																	params:{action:"log","do":"delete","file":record.data.file}
																});
															}
														}});
													}
												});
												
												e.stopEvent();
												menu.showAt(e.getXY());
											}},
											itemdblclick:{fn:function(grid,record) {
												new Ext.Window({
													id:"LogFileViewWindow",
													title:record.data.channel+"채널의 "+record.data.date+" 대화기록보기",
													width:700,
													height:400,
													modal:true,
													store:new Ext.data.JsonStore({
														proxy:{
															type:"ajax",
															simpleSortMode:true,
															url:"./exec/Admin.get.php",
															reader:{type:"json",root:"lists",totalProperty:"totalCount"},
															extraParams:{action:"log",get:"file",channel:record.data.channel,"date":record.data.date}
														},
														remoteSort:true,
														sorters:[{property:"time",direction:"ASC"}],
														autoLoad:false,
														fields:[{name:"time",type:"int"},"nickname","ip","message"],
														listeners:{
															load:{fn:function(store) {
																var object = document.getElementById("LogFileView-body");
																object.innerHTML = "";
																
																var last = "0";
																for (var i=0, loop=store.getCount();i<loop;i++) {
																	last = store.getAt(i).get("time");
																	var log = document.createElement("div");
																	log.style.padding = "5px";
																	log.innerHTML = '<span style="color:#666666;">['+Ext.Date.format(new Date(store.getAt(i).get("time")),"Y-m-d H:i:s")+']</span> <span style="font-weight:bold;">'+store.getAt(i).get("nickname")+' : </span>'+store.getAt(i).get("message");
																	object.appendChild(log);
																}
															}}
														}
													}),
													layout:"fit",
													items:[
														new Ext.Panel({
															id:"LogFileView",
															border:false,
															autoScroll:true,
															html:''
														})
													],
													listeners:{show:{fn:function(panel) {
														panel.store.load();
													}}}
												}).show();
											}}
										}
									})
								]
							}),
							new Ext.grid.GridPanel({
								id:"IpList",
								title:"IP차단자관리",
								border:false,
								isLoad:false,
								tbar:[
									new Ext.Button({
										text:"차단IP추가",
										icon:"./images/add.png",
										handler:function() {
											new Ext.Window({
												id:"IpWindow",
												title:"차단IP추가",
												width:400,
												modal:true,
												items:[
													new Ext.form.FormPanel({
														id:"IpForm",
														bodyPadding:"10 10 5 10",
														border:false,
														fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%"},
														items:[
															new Ext.form.TextField({
																fieldLabel:"아이피",
																name:"ip",
																allowBlank:false,
																validator:function(value) {
																	if (value.search(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/) == 0) {
																		return true;
																	} else {
																		return "아이피형식에 맞게 입력하여 주십시오."
																	}
																}
															}),
															new Ext.form.TextField({
																fieldLabel:"닉네임",
																name:"nickname"
															}),
															new Ext.form.TextField({
																fieldLabel:"메모(차단사유)",
																name:"memo"
															})
														]
													})
												],
												buttons:[
													new Ext.Button({
														text:"확인",
														handler:function() {
															Ext.getCmp("IpForm").getForm().submit({
																url:"./exec/Admin.do.php?action=ip&do=add",
																submitEmptyText:false,
																waitTitle:"잠시만 기다려주십시오.",
																waitMsg:"차단IP를 추가하고 있습니다.",
																success:function(form,action) {
																	Ext.Msg.show({title:"안내",msg:"성공적으로 추가하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
																		Ext.getCmp("IpList").getStore().loadPage(1);
																		Ext.getCmp("IpWindow").close();
																	}});
																},
																failure:function(form,action) {
																	Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																}
															});
														}
													}),
													new Ext.Button({
														text:"취소",
														handler:function() {
															Ext.getCmp("IpWindow").close();
														}
													})
												]
											}).show();
										}
									}),
									'-',
									new Ext.form.TextField({
										id:"IpKeyword",
										width:200,
										emptyText:"아이피, 닉네임검색"
									}),
									new Ext.Button({
										text:"검색",
										icon:"./images/magnifier.png",
										handler:function() {
											Ext.getCmp("IpList").getStore().getProxy().setExtraParam("keyword",Ext.getCmp("IpKeyword").getValue());
											Ext.getCmp("IpList").getStore().loadPage(1);
										}
									}),
									'->',
									{xtype:"tbtext",text:"마우스더블클릭:대화기록 / 우클릭:상세메뉴"}
								],
								columns:[
									new Ext.grid.RowNumberer(),
									{
										header:"아이피",
										dataIndex:"ip",
										width:140
									},{
										header:"차단당시 닉네임",
										dataIndex:"nickname",
										width:200
									},{
										header:"메모 (차단사유)",
										dataIndex:"memo",
										flex:1
									},{
										header:"차단일시",
										dataIndex:"reg_date",
										width:140
									}
								],
								columnLines:true,
								selModel:new Ext.selection.CheckboxModel({injectCheckbox:"last"}),
								store:IpStore,
								bbar:new Ext.PagingToolbar({
									store:IpStore,
									displayInfo:true
								}),
								listeners:{
									itemcontextmenu:{fn:function(grid,record,row,index,e) {
										grid.getSelectionModel().select(index);
										var menu = new Ext.menu.Menu();
										
										menu.add('<b class="menu-title">'+record.data.ip+'</b>');
										
										menu.add({
											text:"아이피차단해제(삭제)",
											handler:function() {
												Ext.Msg.show({title:"확인",msg:"해당 아이피를 차단목록에서 삭제하시겠습니까?",buttons:Ext.Msg.YESNO,icon:Ext.Msg.QUESTION,fn:function(button) {
													if (button == "yes") {
														Ext.Msg.wait("선택한 작업을 서버에서 처리중입니다.","잠시만 기다려주십시오.");
														Ext.Ajax.request({
															url:"./exec/Admin.do.php",
															success:function(response) {
																var data = Ext.JSON.decode(response.responseText);
																if (data.success == true) {
																	Ext.Msg.show({title:"안내",msg:"성공적으로 처리하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
																		grid.getStore().reload();
																	}});
																} else {
																	Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
																}
															},
															failure:function() {
																Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
															},
															params:{action:"ip","do":"delete","ip":record.data.ip}
														});
													}
												}});
											}
										});
										
										e.stopEvent();
										menu.showAt(e.getXY());
									}},
									itemdblclick:{fn:function(grid,record) {
										new Ext.Window({
											id:"IpLogWindow",
											title:record.data.ip+" 대화기록보기",
											width:700,
											height:400,
											modal:true,
											store:new Ext.data.JsonStore({
												proxy:{
													type:"ajax",
													simpleSortMode:true,
													url:"./exec/Admin.get.php",
													reader:{type:"json",root:"lists",totalProperty:"totalCount"},
													extraParams:{action:"log",get:"db",last:"0",channel:"",nickname:"",ip:record.data.ip,date:""}
												},
												remoteSort:true,
												sorters:[{property:"time",direction:"ASC"}],
												autoLoad:false,
												fields:[{name:"time",type:"int"},"channel","nickname","ip","message"],
												listeners:{
													load:{fn:function(store) {
														var object = document.getElementById("IpLog-body");
														if (store.getProxy().extraParams.last == "0") {
															object.innerHTML = "";
															if (store.getCount() == 0) {
																Ext.Msg.show({title:"안내",msg:"해당 IP로 DB에 기록된 대화기록이 없습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() { Ext.getCmp("IpLogWindow").close(); }});
															}
														}
														
														store.getProxy().setExtraParam("last","0");
														var last = "0";
														for (var i=0, loop=store.getCount();i<loop;i++) {
															last = store.getAt(i).get("time");
															var log = document.createElement("div");
															log.style.padding = "5px";
															log.innerHTML = '<span style="color:#666666;">['+Ext.Date.format(new Date(store.getAt(i).get("time")),"Y-m-d H:i:s")+']</span> <span style="color:blue; font-weight:bold;">#'+store.getAt(i).get("channel")+'</span> <span style="font-weight:bold;">'+store.getAt(i).get("nickname")+' : </span>'+store.getAt(i).get("message");
															object.appendChild(log);
														}
														
														if (document.getElementById("LogMore")) {
															object.removeChild(document.getElementById("LogMore"));
														}
														
														if (store.getCount() == 50) {
															var more = document.createElement("div");
															more.setAttribute("id","LogMore");
															more.style.padding = "10px";
															more.style.border = "1px solid #E5E5E5";
															more.style.background = "#F4F4F4";
															more.style.textAlign = "center";
															more.style.fontFamily = "NanumGothicWeb";
															more.style.fontWeight = "bold";
															more.style.fontSize = "12px";
															more.style.cursor = "pointer";
															more.style.margin = "5px";
															more.onclick = function() {
																Ext.getCmp("IpLogWindow").store.getProxy().setExtraParam("last",last);
																Ext.getCmp("IpLogWindow").store.load();
															}
															more.innerHTML = "로그 더보기";
															
															object.appendChild(more);
														}
													}}
												}
											}),
											layout:"fit",
											items:[
												new Ext.Panel({
													id:"IpLog",
													border:false,
													autoScroll:true,
													html:''
												})
											],
											listeners:{show:{fn:function(panel) {
												panel.store.load();
											}}}
										}).show();
									}}
								}
							}),
							new Ext.grid.GridPanel({
								id:"BroadcastList",
								title:"브로드캐스트메세지관리",
								border:false,
								isLoad:false,
								tbar:[
									new Ext.Button({
										text:"브로드캐스트메세지전송",
										icon:"./images/add.png",
										handler:function() {
											new Ext.Window({
												id:"BroadcastWindow",
												title:"브로드캐스트메세지전송",
												width:600,
												modal:true,
												items:[
													new Ext.form.FormPanel({
														id:"BroadcastForm",
														bodyPadding:"10 10 5 10",
														border:false,
														fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%"},
														items:[
															new Ext.form.ComboBox({
																fieldLabel:"종류",
																name:"type",
																store:new Ext.data.ArrayStore({
																	fields:["display","value"],
																	data:[["공지 - 브로드캐스트메세지 수신여부와 관련없이 알림창형태로 메세지 전송","notice"],["일반메세지 - 브로드캐스트메세지 수신채널에 한하여 일반 채팅메세지로 전송","broadcast"]]
																}),
																displayField:"display",
																valueField:"value",
																typeAhead:true,
																mode:"local",
																triggerAction:"all",
																value:"notice",
																editable:false,
																listeners:{select:{fn:function(form) {
																	if (form.getValue() == "notice") {
																		Ext.getCmp("BroadcastForm").getForm().findField("nickname").disable();
																	} else {
																		Ext.getCmp("BroadcastForm").getForm().findField("nickname").enable();
																	}
																}}}
															}),
															new Ext.form.TextField({
																fieldLabel:"전송내용",
																name:"message",
																value:"브로드캐스트 메세지 + _+)//",
																allowBlank:false
															}),
															new Ext.form.TextField({
																fieldLabel:"URL주소",
																name:"url",
																value:"http://www.arzz.com",
																emptyText:"메세지를 클릭하면 이동할 주소를 입력할 수 있습니다. (선택)",
																validator:function(value) {
																	if (value.search(/^http(s)?:\/\//) == 0) return true;
																	else return "주소는 http(s):// 로 시작하여야 합니다."
																}
															}),
															new Ext.form.FieldContainer({
																fieldLabel:"전송닉네임",
																layout:"hbox",
																items:[
																	new Ext.form.TextField({
																		name:"nickname",
																		width:120,
																		value:"미니톡관리자",
																		disabled:true,
																		allowBlank:false
																	}),
																	new Ext.form.DisplayField({
																		value:"&nbsp;(일반메세지로 전송시 전송한사람의 닉네임을 설정하세요.)"
																	})
																]
															})
														]
													})
												],
												buttons:[
													new Ext.Button({
														text:"확인",
														handler:function() {
															Ext.getCmp("BroadcastForm").getForm().submit({
																url:"./exec/Admin.do.php?action=broadcast&do=send",
																submitEmptyText:false,
																waitTitle:"잠시만 기다려주십시오.",
																waitMsg:"브로드캐스트메세지를 전송하고 있습니다.",
																success:function(form,action) {
																	Ext.Msg.show({title:"안내",msg:GetNumberFormat(action.result.receiver)+"명에게 성공적으로 전송하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
																		Ext.getCmp("BroadcastList").getStore().loadPage(1);
																		Ext.getCmp("BroadcastWindow").close();
																	}});
																},
																failure:function(form,action) {
																	Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
																}
															});
														}
													}),
													new Ext.Button({
														text:"취소",
														handler:function() {
															Ext.getCmp("BroadcastWindow").close();
														}
													})
												]
											}).show();
										}
									}),
									'-',
									new Ext.form.TextField({
										id:"BroadcastKeyword",
										width:200,
										emptyText:"메세지내용"
									}),
									new Ext.Button({
										text:"검색",
										icon:"./images/magnifier.png",
										handler:function() {
											Ext.getCmp("BroadcastList").getStore().getProxy().setExtraParam("keyword",Ext.getCmp("BroadcastKeyword").getValue());
											Ext.getCmp("BroadcastList").getStore().loadPage(1);
										}
									}),
									'->',
									{xtype:"tbtext"}
								],
								columns:[
									new Ext.grid.RowNumberer(),
									{
										header:"종류",
										dataIndex:"type",
										width:100,
										renderer:function(value) {
											if (value == "NOTICE") return '<span style="color:red;">공지메세지</span>';
											else return '<span style="color:red;">일반메세지</span>';
										}
									},{
										header:"메세지내용",
										dataIndex:"message",
										flex:1
									},{
										header:"링크주소",
										dataIndex:"url",
										width:250
									},{
										header:"수신인원",
										dataIndex:"receiver",
										width:100,
										renderer:GridNumberFormat
									},{
										header:"전송일자",
										dataIndex:"reg_date",
										width:140
									}
								],
								columnLines:true,
								selModel:new Ext.selection.CheckboxModel({injectCheckbox:"last"}),
								store:BroadcastStore,
								bbar:new Ext.PagingToolbar({
									store:BroadcastStore,
									displayInfo:true
								})
							})
						],
						listeners:{tabchange:{fn:function(tabs,tab) {
							if (tab.getId() == "ChannelList" && tab.isLoad == false) {
								tab.isLoad = true;
								Ext.getCmp("ChannelList").getStore().loadPage(1);
							}
							
							if (tab.getId() == "CategoryList" && tab.isLoad == false) {
								tab.isLoad = true;
								Ext.getCmp("CategoryList1").getStore().reload();
							}
							
							if (tab.getId() == "LogList" && tab.isLoad == false) {
								tab.isLoad = true;
								LogStore.reload();
								LogFileStore.reload();
							}
							
							if (tab.getId() == "IpList" && tab.isLoad == false) {
								tab.isLoad = true;
								IpStore.reload();
							}
							
							if (tab.getId() == "BroadcastList" && tab.isLoad == false) {
								tab.isLoad = true;
								BroadcastStore.reload();
							}
							
							if (tab.getId() == "LogList" || tab.getId() == "BroadcastList") {
								if (Ext.getCmp("ServerList").getStore().find("type","MINITALK") != -1) {
									Ext.Msg.show({title:"안내",msg:"로그기록 및 브로드캐스트 기능은 자체 채팅서버에 대해서만 동작합니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO});
								}
							}
						}}}
					})
				],
				bbar:[
					{xtype:"tbtext",text:"미니톡 v<?php echo $version; ?> / copyright(c) minitalk.kr All Rights Reserved."},
					'->',
					new Ext.Button({
						text:"관리자접속정보변경",
						icon:"./images/lock.png",
						handler:function() {
							new Ext.Window({
								id:"MasterWindow",
								title:"관리자접속정보변경",
								width:400,
								modal:true,
								items:[
									new Ext.form.FormPanel({
										id:"MasterForm",
										border:false,
										bodyPadding:"10 10 5 10",
										fieldDefaults:{labelAlign:"right",labelWidth:80,anchor:"100%",allowBlank:false},
										items:[
											new Ext.form.TextField({
												fieldLabel:"아이디",
												name:"user_id"
											}),
											new Ext.form.TextField({
												fieldLabel:"패스워드",
												name:"password1",
												inputType:"password"
											}),
											new Ext.form.TextField({
												fieldLabel:"패스워드확인",
												name:"password2",
												inputType:"password"
											})
										]
									})
								],
								buttons:[
									new Ext.Button({
										text:"확인",
										handler:function() {
											Ext.getCmp("MasterForm").getForm().submit({
												url:"./exec/Admin.do.php?action=master&do=modify",
												submitEmptyText:false,
												waitTitle:"잠시만 기다려주십시오.",
												waitMsg:"관리자접속정보를 수정하고 있습니다.",
												success:function(form,action) {
													Ext.Msg.show({title:"안내",msg:"성공적으로 수정하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function(button) {
														Ext.getCmp("MasterWindow").close();
													}});
												},
												failure:function(form,action) {
													Ext.Msg.show({title:"에러",msg:"입력내용에 오류가 있습니다.<br />입력내용을 다시 한번 확인하여 주십시오.",buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR});
												}
											});
										}
									}),
									new Ext.Button({
										text:"취소",
										handler:function() {
											Ext.getCmp("MasterWindow").close();
										}
									})
								]
							}).show();
						}
					}),
					new Ext.Button({
						text:"로그아웃",
						icon:"./images/lock_break.png",
						handler:function() {
							Ext.Msg.wait("로그아웃중입니다.","잠시만 기다려주십시오.");
							Ext.Ajax.request({
								url:"./exec/Admin.do.php",
								success:function(response) {
									var data = Ext.JSON.decode(response.responseText);
									if (data.success == true) {
										Ext.Msg.show({title:"안내",msg:"성공적으로 로그아웃하였습니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.INFO,fn:function() {
											location.href = location.href;
										}});
									} else {
										Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
									}
								},
								failure:function() {
									Ext.Msg.show({title:"안내",msg:"서버에 이상이 있어 처리하지 못하였습니다.<br />잠시후 다시 시도해보시기 바랍니다.",buttons:Ext.Msg.OK,icon:Ext.Msg.WARNING});
								},
								params:{action:"master","do":"logout"}
							});
						}
					}),
					'-',
					new Ext.Button({
						text:"API문서보기",
						icon:"./images/page_code.png",
						handler:function() {
							new Ext.Window({
								title:"API문서보기",
								minWidth:800,
								minHeight:450,
								maximizable:true,
								modal:true,
								layout:"fit",
								items:[
									new Ext.TabPanel({
										border:false,
										tabPosition:"bottom",
										activeTab:0,
										items:[
											new Ext.Panel({
												title:"채널스크립트API",
												border:false,
												html:'<iframe src="http://www.minitalk.kr/api/document.php?ver=<?php echo $version; ?>" frameborder="0" scrolling="auto" style="width:100%; height:100%;"></iframe>'
											}),
											new Ext.Panel({
												title:"채널생성API",
												border:false,
												html:'<iframe src="../api/example.php?example=channel" frameborder="0" scrolling="auto" style="width:100%; height:100%;"></iframe>'
											}),
											new Ext.Panel({
												title:"로그API",
												border:false,
												html:'<iframe src="../api/example.php?example=log" frameborder="0" scrolling="auto" style="width:100%; height:100%;"></iframe>'
											})
										]
									})
								]
							}).show();
						}
					})
				]
			})
		]
	}).updateLayout();
});
</script>
<iframe name="execFrame" style="display:none;"></iframe>
</body>
</html>

<?php } ?>