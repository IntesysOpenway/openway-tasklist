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

function getColumnConfig(itemId) {
	logger.log("getColumnConfig");
	
	var response = [];
	
	// query for configuration for item
	var nodeConfig = config.scoped[itemId];
	if (nodeConfig !== null) {
		var propertiesCfg = nodeConfig.properties;
		if (propertiesCfg!=null) {
			propertiesCfg = propertiesCfg.getChildren("property");
			if (propertiesCfg!=null) {
				logger.log(propertiesCfg.size());
				for( i = 0; i < propertiesCfg.size(); i++) {
					var property = propertiesCfg.get(i);

					logger.log(property);
					
					response.push({
						prop : property.getAttribute("name"),
						width : property.getAttribute("width"),
						formatter : property.getAttribute("formatter")
					});
				}
			}
		}
	}
	
	return response;
}


var response = [];
if (args.taskType != null && args.taskType != "*") {
	response = getColumnConfig(args.taskType);
}
if (response.length == 0 && args.workflowType != null) {
	response = getColumnConfig(args.workflowType);
}

// Se non trova una configurazione mette quella di default...
if (response==null || response.length == 0) {
	response = [
	    { prop: "bpm_description", width: 0, formatter: 'renderTitleCell' },
		{ prop: "taskType", width: 100, formatter: 'renderTaskTypeCell' },
    	{ prop: "bpm_startDate", width: 100, formatter: 'renderDateCell' }, 
    	{ prop: "bpm_dueDate", width: 100, formatter: 'renderDateCell' }
    ];
}

var json = { 
	columns : response
};
model.json = jsonUtils.toJSONString(json);


