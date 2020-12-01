<import resource="classpath:/alfresco/site-webscripts/org/alfresco/share/imports/share-header.lib.js">
/*-
 * ==============================LICENSE=============================
 * Intesys Openway Tasklist - Share
 * %%
 * Copyright (C) 2016 - 2020 Intesys Openway Srl
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * ============================LICENSE-END===========================
 */

//var appMenu = widgetUtils.findObject(model.jsonModel, "id", "HEADER_APP_MENU_BAR");
//
//for each (widget in appMenu.config.widgets) {
//	HEADER_TASKS
//}

var myTasksWidget = widgetUtils.findObject(model.jsonModel, "id", "HEADER_MY_TASKS");
myTasksWidget.config.targetUrl = "iopenway-my-tasks";
	
