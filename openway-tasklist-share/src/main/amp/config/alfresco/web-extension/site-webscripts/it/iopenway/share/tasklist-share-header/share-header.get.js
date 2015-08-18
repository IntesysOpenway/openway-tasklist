<import resource="classpath:/alfresco/site-webscripts/org/alfresco/share/imports/share-header.lib.js">

//var appMenu = widgetUtils.findObject(model.jsonModel, "id", "HEADER_APP_MENU_BAR");
//
//for each (widget in appMenu.config.widgets) {
//	HEADER_TASKS
//}

var myTasksWidget = widgetUtils.findObject(model.jsonModel, "id", "HEADER_MY_TASKS");
myTasksWidget.config.targetUrl = "iopenway-my-tasks#filter=workflows|active"
	