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


