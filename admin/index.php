<?php
/**
 * 이 파일은 미니톡 클라이언트의 일부입니다. (https://www.minitalk.io)
 *
 * 미니톡 클라이언트 관리자 레이아웃을 출력한다.
 * 관리자페이지와 관련된 파일은 ExtJS 라이센스정책에 따라 GPLv3 라이센스로 배포됩니다.
 * 
 * @file /admin/index.php
 * @author Arzz (arzz@arzz.com)
 * @license GPLv3
 * @version 7.0.0
 * @modified 2020. 3. 16.
 */
REQUIRE '../configs/init.config.php';
if ($_CONFIGS->installed === false) {
	header("location:../install");
	exit;
}

$MINITALK = new Minitalk();
$logged = $MINITALK->getAdminLogged();

if ($logged !== null && $logged->language == 'ko') {
	$fontStyle = '../styles/font.css.php?font=moimz,XEIcon,FontAwesome,NanumBarunGothic,OpenSans&default=NanumBarunGothic';
} else {
	$fontStyle = '../styles/font.css.php?font=moimz,XEIcon,FontAwesome,OpenSans&default=OpenSans';
}

$current = Request('menu') ? Request('menu') : 'server';
?>
<!DOCTYPE HTML>
<html lang="<?php echo $logged == null ? 'en' : $logged->language; ?>">
<head>
<meta charset="utf-8">
<title>Minitalk Administrator</title>
<script src="../scripts/jquery.js?t=<?php echo filemtime('../scripts/jquery.js'); ?>"></script>
<script src="../scripts/jquery.extend.js?t=<?php echo filemtime('../scripts/jquery.extend.js'); ?>"></script>
<script src="../scripts/moment.js?t=<?php echo filemtime('../scripts/moment.js'); ?>"></script>
<link rel="stylesheet" href="<?php echo $fontStyle; ?>" type="text/css">
<?php if ($logged !== null) { ?>
<link rel="stylesheet" href="./styles/style.css?t=<?php echo filemtime('./styles/style.css'); ?>" type="text/css">
<link rel="stylesheet" href="../styles/extjs.css?t=<?php echo filemtime('../styles/extjs.css'); ?>" type="text/css">
<link rel="stylesheet" href="../styles/extjs.extend.css?t=<?php echo filemtime('../styles/extjs.extend.css'); ?>" type="text/css">
<script src="../scripts/extjs.js?t=<?php echo filemtime('../scripts/extjs.js'); ?>"></script>
<script src="../scripts/extjs.extend.js?t=<?php echo filemtime('../scripts/extjs.extend.js'); ?>"></script>
<?php } else { ?>
<link rel="stylesheet" href="./styles/login.css?t=<?php echo filemtime('./styles/login.css'); ?>" type="text/css">
<?php } ?>
<script src="./scripts/script.js?t=<?php echo filemtime('./scripts/script.js'); ?>"></script>
<script src="../scripts/language.js.php?language=<?php echo $logged == null ? 'en' : $logged->language; ?>"></script>
<link rel="shortcut icon" type="image/x-icon" href="//www.moimz.com/modules/moimz/images/Minitalk.ico">
</head>
<body<?php echo $logged === null ? ' class="login"' : ''; ?>>
<?php
if ($logged === null) {
	INCLUDE './login.php';
} else {
	$menuIcons = array('server'=>'xi-cloud-network','category'=>'xi-sitemap','channel'=>'xi-chat','log'=>'xi-time-back','ip'=>'xi-slash-circle','broadcast'=>'xi-signal','admin'=>'xi-crown');
?>
<header id="MinitalkHeader">
	<h1>Minitalk <small>Administrator</small></h1>
	
	<ul>
		<?php foreach ($MINITALK->getText('admin/menu') as $menu=>$title) { ?>
		<li<?php echo $menu == 'server' ? ' class="selected"' : ''; ?>><button data-tab="<?php echo $menu; ?>"><i class="xi <?php echo $menuIcons[$menu]; ?>"></i><?php echo $title; ?></button></li>
		<?php } ?>
	</ul>
	
	<aside>
		<button type="button" onclick="Admin.logout();">LOGOUT</button>
	</aside>
</header>

<footer id="MinitalkFooter">
	Copyright (c) <?php echo date('Y'); ?> Minitalk <?php echo __MINITALK_VERSION__; ?>, MIT License / <?php echo $_SERVER['SERVER_ADDR']; ?>
</footer>

<script>
Ext.onReady(function () {
	new Ext.Viewport({
		layout:{type:"border"},
		items:[
			new Ext.Panel({
				region:"north",
				height:52,
				border:false,
				contentEl:"MinitalkHeader"
			}),
			new Ext.TabPanel({
				id:"MinitalkTabPanel",
				border:false,
				region:"center",
				activeTab:0,
				items:[
					new Ext.grid.Panel({
						id:"MinitalkPanel-server",
						hasServer:<?php echo is_dir(__MINITALK_PATH__.'/server') == true && is_file(__MINITALK_PATH__.'/server/app.js') == true ? 'true' : 'false'; ?>,
						tbar:[
							new Ext.Button({
								text:Admin.getText("server/add"),
								iconCls:"mi mi-plus",
								handler:function() {
									Admin.server.add();
								}
							}),
							new Ext.Button({
								text:Admin.getText("server/delete"),
								iconCls:"mi mi-trash",
								handler:function() {
									Admin.server.status("delete");
								}
							})
						],
						store:new Ext.data.JsonStore({
							proxy:{
								type:"ajax",
								simpleSortMode:true,
								url:Minitalk.getProcessUrl("@getServers"),
								reader:{type:"json"}
							},
							remoteSort:false,
							sorters:[{property:"domain",direction:"ASC"}],
							autoLoad:true,
							pageSize:0,
							groupField:"type",
							groupDir:"ASC",
							fields:["domain","status","status_message",{"name":"channel","type":"int"},{"name":"user","type":"int"},{"name":"maxuser","type":"int"},{"name":"latest_update","type":"int"},{"name":"exp_date","type":"int"}],
							listeners:{
								load:function(store,records,success,e) {
									if (success == false) {
										if (e.getError()) {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:e.getError(),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR})
										} else {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_LOAD_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR})
										}
									}
								}
							}
						}),
						columns:[{
							text:Admin.getText("server/columns/domain"),
							summaryType:"count",
							dataIndex:"domain",
							minWidth:200,
							flex:1,
							sortable:true,
							summaryRenderer:function(value) {
								return value+" server"+(value > 1 ? "s" : "");
							}
						},{
							text:Admin.getText("server/columns/status"),
							dataIndex:"status",
							width:80,
							sortable:true,
							align:"center",
							renderer:function(value,p) {
								if (value == "ONLINE") p.style = "color:blue;";
								else p.style = "color:red;";
								
								return Admin.getText("server/status/"+value);
							}
						},{
							text:Admin.getText("server/columns/status_message"),
							dataIndex:"status_message",
							width:250,
							sortable:true,
							renderer:function(value,p,record) {
								if (record.data.type == "SERVER") {
									if (record.data.status == "ONLINE") {
										return "Uptime : " + moment(moment().unix() * 1000 - value.uptime * 1000).locale("ko").fromNow(true) + " / Memory : " + Minitalk.getFileSize(value.memory.rss + value.memory.heapTotal + value.memory.heapUsed + value.memory.external);
									} else {
										return;
									}
								} else {
									return value;
								}
							}
						},{
							text:Admin.getText("server/columns/channel"),
							dataIndex:"channel",
							width:120,
							sortable:true,
							align:"right",
							summaryType:"sum",
							renderer:function(value) {
								return Ext.util.Format.number(value,"0,000");
							},
							summaryRenderer:function(value) {
								return Ext.util.Format.number(value,"0,000");
							}
						},{
							text:Admin.getText("server/columns/user"),
							dataIndex:"user",
							width:120,
							sortable:true,
							align:"right",
							summaryType:"sum",
							renderer:function(value) {
								return Ext.util.Format.number(value,"0,000");
							},
							summaryRenderer:function(value) {
								return Ext.util.Format.number(value,"0,000");
							}
						},{
							text:Admin.getText("server/columns/max_user"),
							dataIndex:"max_user",
							width:120,
							sortable:true,
							align:"right",
							summaryType:"sum",
							renderer:function(value) {
								if (value == 0) return '<div style="text-align:center;">'+Admin.getText("server/unlimited")+'</div>';
								return Ext.util.Format.number(value,"0,000");
							},
							summaryRenderer:function(value) {
								if (value == 0) return '<div style="text-align:center;">'+Admin.getText("server/unlimited")+'</div>';
								return Ext.util.Format.number(value,"0,000");
							}
						},{
							text:Admin.getText("server/columns/latest_update"),
							dataIndex:"latest_update",
							width:160,
							sortable:true,
							align:"center",
							summaryType:"max",
							renderer:function(value) {
								if (value == 0) return Admin.getText("server/unknown");
								return moment(value * 1000).locale($("html").attr("lang")).format("YYYY-MM-DD(dd) HH:mm");
							},
							summaryRenderer:function(value) {
								if (value == 0) return Admin.getText("server/unknown");
								return moment(value * 1000).locale($("html").attr("lang")).format("YYYY-MM-DD(dd) HH:mm");
							}
						},{
							text:Admin.getText("server/columns/exp_date"),
							dataIndex:"exp_date",
							width:160,
							sortable:true,
							align:"center",
							summaryType:"max",
							renderer:function(value) {
								if (value == -1) return Admin.getText("server/unknown");
								else if (value == 0) return Admin.getText("server/unlimited");
								return moment(value * 1000).locale($("html").attr("lang")).format("YYYY.MM.DD(dd) HH:mm");
							},
							summaryRenderer:function(value) {
								if (value == 0) return Admin.getText("server/unlimited");
								return moment(value * 1000).locale($("html").attr("lang")).format("YYYY-MM-DD(dd) HH:mm");
							}
						}],
						selModel:new Ext.selection.CheckboxModel(),
						features:[{
							ftype:"groupingsummary",
							groupHeaderTpl:'<tpl if="name == \'SERVER\'">'+Admin.getText("server/type/SERVER")+'<tpl elseif="name == \'SERVICE\'">'+Admin.getText("server/type/SERVICE")+'</tpl>',
							hideGroupedHeader:false,
							enableGroupingMenu:false
						}],
						bbar:[
							new Ext.Button({
								iconCls:"x-tbar-loading",
								handler:function() {
									Ext.getCmp("MinitalkPanel-server").getStore().reload();
								}
							}),
							"->",
							{xtype:"tbtext",text:Admin.getText("server/grid_help")}
						],
						listeners:{
							itemdblclick:function(grid,record) {
								Admin.server.add(record.data.domain);
							},
							itemcontextmenu:function(grid,record,item,index,e) {
								var menu = new Ext.menu.Menu();
								
								menu.addTitle(record.data.domain);
								
								menu.add({
									text:Admin.getText("server/modify"),
									iconCls:"xi xi-form",
									handler:function() {
										Admin.server.add(record.data.domain);
									}
								});
								
								menu.add({
									text:Admin.getText("server/delete"),
									iconCls:"mi mi-trash",
									handler:function() {
										Admin.server.status("delete");
									}
								});
								
								e.stopEvent();
								menu.showAt(e.getXY());
							}
						}
					}),
					new Ext.Panel({
						id:"MinitalkPanel-category",
						border:false,
						layout:{type:"hbox",align:"stretch"},
						items:[
							new Ext.grid.GridPanel({
								id:"MinitalkCategory1",
								title:Admin.getText("category/category1"),
								border:true,
								margin:"5 5 5 5",
								flex:1,
								tbar:[
									new Ext.Button({
										iconCls:"mi mi-plus",
										text:Admin.getText("category/add"),
										handler:function() {
											Admin.category.add();
										}
									}),
									new Ext.Button({
										iconCls:"mi mi-trash",
										text:Admin.getText("category/delete"),
										handler:function() {
											Admin.category.delete();
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
									header:Admin.getText("category/columns/category"),
									dataIndex:"category",
									flex:1
								},{
									header:Admin.getText("category/columns/children"),
									dataIndex:"children",
									width:90,
									align:"right",
									summaryType:"sum",
									renderer:function(value) {
										return Ext.util.Format.number(value,"0,000");
									}
								},{
									header:Admin.getText("category/columns/channel"),
									dataIndex:"channel",
									width:70,
									align:"right",
									summaryType:"sum",
									renderer:function(value) {
										return Ext.util.Format.number(value,"0,000");
									}
								},{
									header:Admin.getText("category/columns/user"),
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
									{xtype:"tbtext",text:Admin.getText("category/grid_help")}
								],
								listeners:{
									itemdblclick:function(grid,record) {
										Admin.category.add(record.data.idx);
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
											text:Admin.getText("category/modify"),
											iconCls:"xi xi-form",
											handler:function() {
												Admin.category.add(record.data.idx);
											}
										});
										
										menu.add({
											text:Admin.getText("category/delete"),
											iconCls:"mi mi-trash",
											handler:function() {
												Admin.category.delete();
											}
										});
										
										e.stopEvent();
										menu.showAt(e.getXY());
									}
								}
							}),
							new Ext.grid.GridPanel({
								id:"MinitalkCategory2",
								title:Admin.getText("category/category2") + " (" + Admin.getText("category/select_first")+")",
								border:true,
								margin:"5 5 5 0",
								disabled:true,
								flex:1,
								tbar:[
									new Ext.Button({
										iconCls:"mi mi-plus",
										text:Admin.getText("category/add"),
										handler:function() {
											var parent = Ext.getCmp("MinitalkCategory2").getStore().getProxy().extraParams.parent;
											Admin.category.add(null,parent);
										}
									}),
									new Ext.Button({
										iconCls:"mi mi-trash",
										text:Admin.getText("category/delete"),
										handler:function() {
											var parent = Ext.getCmp("MinitalkCategory2").getStore().getProxy().extraParams.parent;
											Admin.category.delete(parent);
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
											Ext.getCmp("MinitalkCategory2").setTitle(title+" "+Admin.getText("category/category2"));
											Ext.getCmp("MinitalkCategory2").enable();
										}
									}
								}),
								columns:[{
									header:Admin.getText("category/columns/category"),
									dataIndex:"category",
									flex:1
								},{
									header:Admin.getText("category/columns/channel"),
									dataIndex:"channel",
									width:70,
									align:"right",
									summaryType:"sum",
									renderer:function(value) {
										return Ext.util.Format.number(value,"0,000");
									}
								},{
									header:Admin.getText("category/columns/user"),
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
									{xtype:"tbtext",text:Admin.getText("category/grid_help")}
								],
								listeners:{
									itemdblclick:function(grid,record) {
										Admin.category.add(record.data.idx,record.data.parent);
									},
									itemcontextmenu:function(grid,record,item,index,e) {
										var menu = new Ext.menu.Menu();
										
										menu.addTitle(record.data.category);
										
										menu.add({
											text:Admin.getText("category/modify"),
											iconCls:"xi xi-form",
											handler:function() {
												Admin.category.add(record.data.idx,record.data.parent);
											}
										});
										
										menu.add({
											text:Admin.getText("category/delete"),
											iconCls:"mi mi-trash",
											handler:function() {
												Admin.category.delete(record.data.parent);
											}
										});
										
										e.stopEvent();
										menu.showAt(e.getXY());
									},
									disable:function() {
										Ext.getCmp("MinitalkCategory2").setTitle(Admin.getText("category/category2") + " (" + Admin.getText("category/select_first")+")");
									}
								}
							})
						]
					}),
					new Ext.grid.Panel({
						id:"MinitalkPanel-channel",
						tbar:[
							new Ext.form.ComboBox({
								id:"MinitalkChannelCategory1",
								store:new Ext.data.JsonStore({
									proxy:{
										type:"ajax",
										url:Minitalk.getProcessUrl("@getCategories"),
										extraParams:{parent:0,is_all:"true"},
										reader:{type:"json"}
									},
									autoLoad:true,
									remoteSort:false,
									sorters:[{property:"sort",direction:"ASC"}],
									fields:["idx","category",{name:"sort",type:"int"}]
								}),
								width:120,
								editable:false,
								matchFieldWidth:false,
								listConfig:{
									minWidth:120
								},
								displayField:"category",
								valueField:"idx",
								value:"",
								listeners:{
									change:function(form,value) {
										if (value) {
											Ext.getCmp("MinitalkChannelCategory2").setValue("");
											Ext.getCmp("MinitalkChannelCategory2").getStore().getProxy().setExtraParam("parent",value);
											Ext.getCmp("MinitalkChannelCategory2").getStore().reload();
											
											Ext.getCmp("MinitalkPanel-channel").getStore().getProxy().setExtraParam("category1",value);
											Ext.getCmp("MinitalkPanel-channel").getStore().getProxy().setExtraParam("category2","");
											Ext.getCmp("MinitalkPanel-channel").getStore().loadPage(1);
										}
									}
								}
							}),
							new Ext.form.ComboBox({
								id:"MinitalkChannelCategory2",
								store:new Ext.data.JsonStore({
									proxy:{
										type:"ajax",
										url:Minitalk.getProcessUrl("@getCategories"),
										extraParams:{parent:-1,is_all:"true"},
										reader:{type:"json"}
									},
									autoLoad:true,
									remoteSort:false,
									sorters:[{property:"sort",direction:"ASC"}],
									fields:["idx","category",{name:"sort",type:"int"}]
								}),
								width:120,
								editable:false,
								matchFieldWidth:false,
								listConfig:{
									minWidth:120
								},
								displayField:"category",
								valueField:"idx",
								value:"",
								listeners:{
									change:function(form,value) {
										Ext.getCmp("MinitalkPanel-channel").getStore().getProxy().setExtraParam("category2","");
										Ext.getCmp("MinitalkPanel-channel").getStore().loadPage(1);
									}
								}
							}),
							new Ext.form.TextField({
								id:"MinitalkChannelKeyword",
								width:150,
								emptyText:Admin.getText("channel/columns/channel") + " / " + Admin.getText("channel/columns/title")
							}),
							new Ext.Button({
								iconCls:"mi mi-search",
								handler:function() {
									Ext.getCmp("MinitalkPanel-channel").getStore().getProxy().setExtraParam("keyword",Ext.getCmp("MinitalkChannelKeyword").getValue());
									Ext.getCmp("MinitalkPanel-channel").getStore().loadPage(1);
								}
							}),
							"-",
							new Ext.Button({
								text:Admin.getText("channel/add"),
								iconCls:"mi mi-plus",
								handler:function() {
									Admin.channel.add();
								}
							})
						],
						store:new Ext.data.JsonStore({
							proxy:{
								type:"ajax",
								simpleSortMode:true,
								url:Minitalk.getProcessUrl("@getChannels"),
								reader:{type:"json"}
							},
							remoteSort:true,
							sorters:[{property:"channel",direction:"ASC"}],
							autoLoad:true,
							pageSize:50,
							fields:["channel","title"],
							listeners:{
								load:function(store,records,success,e) {
									if (success == false) {
										if (e.getError()) {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:e.getError(),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR})
										} else {
											Ext.Msg.show({title:Admin.getText("alert/error"),msg:Admin.getErrorText("DATA_LOAD_FAILED"),buttons:Ext.Msg.OK,icon:Ext.Msg.ERROR})
										}
									}
								}
							}
						}),
						columns:[{
							text:Admin.getText("channel/columns/channel"),
							summaryType:"count",
							dataIndex:"channel",
							width:180,
							sortable:true
						},{
							text:Admin.getText("channel/columns/category1"),
							dataIndex:"category1",
							width:120
						},{
							text:Admin.getText("channel/columns/category2"),
							dataIndex:"category2",
							width:120
						},{
							text:Admin.getText("channel/columns/title"),
							dataIndex:"title",
							minWidth:150,
							flex:1,
							sortable:true
						},{
							text:Admin.getText("channel/columns/password"),
							dataIndex:"password",
							width:120
						},{
							text:Admin.getText("channel/columns/server"),
							dataIndex:"server",
							width:240,
							renderer:function(value,p) {
								if (value == null) {
									p.tdStyle = "color:#666;";
									return Admin.getText("channel/unknown");
								} else {
									return value.domain;
								}
							}
						},{
							text:Admin.getText("channel/columns/send_limit"),
							dataIndex:"send_limit",
							width:140,
							align:"center",
							renderer:function(value) {
								return Minitalk.getText("level/"+value);
							}
						},{
							text:Admin.getText("channel/columns/user"),
							dataIndex:"user",
							width:120,
							align:"right",
							sortable:true,
							renderer:function(value,p,record) {
								var sHTML = "";
								sHTML+= '<b style="color:blue;">'+Ext.util.Format.number(value,"0,000")+'</b> / ';
								sHTML+= Ext.util.Format.number(record.data.max_user,"0,000");
								return sHTML;
							}
						},{
							text:Admin.getText("channel/columns/options"),
							dataIndex:"options",
							width:300,
							renderer:function(value,p,record) {
								var sHTML = "";
								if (record.data.allow_nickname_edit == true) {
									sHTML+= '<i class="xi xi-check-boxout"></i>';
								} else {
									sHTML+= '<i class="xi xi-layout-full"></i>';
								}
								sHTML+= ' '+Admin.getText("channel/form/allow_nickname_edit");
								
								sHTML+= "&nbsp;&nbsp;&nbsp;";
								if (record.data.use_user_tab == true) {
									sHTML+= '<i class="xi xi-check-boxout"></i>';
								} else {
									sHTML+= '<i class="xi xi-layout-full"></i>';
								}
								sHTML+= ' '+Admin.getText("channel/form/use_user_tab");
								sHTML+= '(' + record.data.user_limit + '<i class="fa fa-caret-up"></i>)';
								
								sHTML+= "&nbsp;&nbsp;&nbsp;";
								if (record.data.use_box_tab == true) {
									sHTML+= '<i class="xi xi-check-boxout"></i>';
								} else {
									sHTML+= '<i class="xi xi-layout-full"></i>';
								}
								sHTML+= ' '+Admin.getText("channel/form/use_box_tab");
								sHTML+= '(' + record.data.box_limit + '<i class="fa fa-caret-up"></i>)';
								
								return sHTML;
							}
						}],
						selModel:new Ext.selection.CheckboxModel(),
						bbar:new Ext.PagingToolbar({
							store:null,
							displayInfo:false,
							items:[
								"->",
								{xtype:"tbtext",text:"항목 더블클릭 : 상세정보 / 항목 우클릭 : 메뉴"}
							],
							listeners:{
								beforerender:function(tool) {
									tool.bindStore(tool.ownerCt.getStore());
								}
							}
						}),
						listeners:{
							itemdblclick:function(grid,record) {
								Admin.channel.add(record.data.channel);
							},
							itemcontextmenu:function(grid,record,row,index,e) {
								
							}
						}
					})
				],
				listeners:{
					render:function(tab) {
						tab.getTabBar().setVisible(false);
					},
					afterRender:function(tabs) {
						if (Ext.getCmp("MinitalkTabPanel").getActiveTab().getId() == "MinitalkPanel-<?php echo $current; ?>") {
							tabs.fireEvent("tabchange",tabs,Ext.getCmp("MinitalkTabPanel").getActiveTab());
						} else {
							Ext.getCmp("MinitalkTabPanel").setActiveTab("MinitalkPanel-<?php echo $current; ?>");
						}
					},
					tabchange:function(tabs,tab) {
						var panel = tab.getId().split("-").pop();
						$("#MinitalkHeader li.selected").removeClass("selected");
						$("#MinitalkHeader button[data-tab="+panel+"]").parent().addClass("selected");
						
						var title = $("#MinitalkHeader button[data-tab="+panel+"]").text() + " - " + $("title").text().split(" - ").pop();
						history.pushState({panel:panel},title,"<?php echo __MINITALK_DIR__; ?>/admin/" + panel);
						document.title = title;
					}
				}
			}),
			new Ext.Panel({
				region:"south",
				height:25,
				border:false,
				contentEl:"MinitalkFooter"
			})
		]
	});
});
</script>
<?php } ?>
</body>
</html>