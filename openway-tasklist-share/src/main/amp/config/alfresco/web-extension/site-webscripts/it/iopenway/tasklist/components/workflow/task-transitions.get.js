
function getTransitionsConfig(itemId) {
	logger.log("getTransitionsConfig");

	var response = [];
	// query for configuration for item
	var nodeConfig = config.scoped[itemId];
	if (nodeConfig !== null) {
		var transitions = nodeConfig.transitions;
		
		if (transitions!=null) {
			transitions = transitions.getChildValue("options");
			if (transitions!=null) {
				transitions = transitions.split("#alf#");
				for( i = 0; i < transitions.length; i++) {
					logger.log(" - " + transitions[i]);
					var transition = transitions[i].split("\\|");
					response.push({ value : transition[0] , label : transition[1]});
				}
			}
		}
	}
	return response;
}

var transitions = getTransitionsConfig(args.taskType);
var json = { transitions : transitions };
model.json = jsonUtils.toJSONString(json);


