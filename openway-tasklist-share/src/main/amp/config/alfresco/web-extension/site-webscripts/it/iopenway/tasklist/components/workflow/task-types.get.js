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


