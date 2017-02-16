
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


