/*-
 * ==============================LICENSE=============================
 * Intesys Openway Tasklist - Share
 * %%
 * Copyright (C) 2016 - 2017 Intesys Openway Srl
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

var groups = null;
var userId = user.id;

logger.log(userId);

function userHasGroup(group) {
	if (groups==null) {
		groups = [];
		var result = remote.call("/api/people/" + stringUtils.urlEncode(userId) + "?groups=true");
		if (result.status == 200) {
			var user = eval('(' + result + ')');
	      	groups = user.groups;
		}
	}
	
    for (i=0; i < groups.length; i++) {
    	if (groups[i].itemName == group) return true;
	}
	return false;
}

function getTaskTypeConfig(itemId) {
	logger.log("getTaskTypeConfig");

	var response = [];
	response.push({ value : "*" , label : "Tutti"});
	// query for configuration for item
	var nodeConfig = config.scoped[itemId];
	if (nodeConfig !== null) {
		var taskTypes = nodeConfig["task-types"];
		if (taskTypes!=null) {
			taskTypes = taskTypes.getChildren("task-type");
			logger.log(" 1- " + taskTypes);
			if (taskTypes!=null) {
				for( i = 0; i < taskTypes.size(); i++) {
					var taskType = taskTypes.get(i);
					
					if (!taskType.hasAttribute("group") || userHasGroup(taskType.getAttribute("group"))) {
						logger.log(" - " + taskType);
						response.push({ 
							value : taskType.getAttribute("value"), 
							label : taskType.getAttribute("label")
						});
					}
				}
			}
		}
	}
	return response;
}

var taskTypes = getTaskTypeConfig(args['workflow-type']);
var json = { taskTypes : taskTypes };
model.json = jsonUtils.toJSONString(json);


