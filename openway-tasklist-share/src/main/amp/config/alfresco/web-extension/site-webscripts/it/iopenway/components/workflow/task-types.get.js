
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
					logger.log(" - " + taskType);
					response.push({ 
						value : taskType.getAttribute("value"), 
						label : taskType.getAttribute("label")
					});
				}
			}
		}
	}
	return response;
}

var taskTypes = getTaskTypeConfig(args['workflow-type']);
var json = { taskTypes : taskTypes };
model.json = jsonUtils.toJSONString(json);


