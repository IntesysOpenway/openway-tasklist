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
if (typeof Openway == "undefined" || !Openway) {
	Openway = { component : {} };
}

(function() {

	/**
	 * Preferences
	 */
	var PREFERENCES_MY_TASKS = "it.iopenway.share.my.tasks";
	var PREFERENCES_MY_TASKS_FILTER = PREFERENCES_MY_TASKS + ".filter";
	var PREFERENCES_MY_TASKS_ORDER_SORT = PREFERENCES_MY_TASKS + ".sort";
	var PREFERENCES_MY_TASKS_ORDER_DIR = PREFERENCES_MY_TASKS + ".dir";
	
	/**
	 * Openway.component.TaskListFilterManager constructor.
	 *
	 * @param name {String} The name of the component
	 * @param id {String} he DOM ID of the parent element
	 * @param components {Array} Optional: Array of required YAHOO
	 * @return {object} The new instance
	 * @constructor
	 */
	Openway.component.TaskListFilterManager = function (htmlId) {
		Openway.component.TaskListFilterManager.superclass.constructor.call(this, "Openway.component.TaskListFilterManager", htmlId);
		return this;
	};

	YAHOO.extend(Openway.component.TaskListFilterManager, Alfresco.component.Base,
		{
			widgets : {
				filterButton : null,
				clearButton : null
			},
			
			options : {
				currentFilter : []
			},
			
			onReady : function FilterManager_onReady() {
				var me = this;

				// Services
				this.services.preferences = new Alfresco.service.Preferences();

				this.widgets.filterButton =  Alfresco.util.createYUIButton(this, "filter-button", this._onFilterClick);
				this.widgets.clearButton =  Alfresco.util.createYUIButton(this, "clear-button", this._onClearClick);

				var workflowTypeId =  this.id.replace('_filter-mgr_', '_workflow-type-filter_') + '-select';
				var taskTypeId =  this.id.replace('_filter-mgr_', '_task-type-filter_') + '-select';
				YAHOO.util.Event.onContentReady(workflowTypeId, function() {
					new YAHOO.util.Element(workflowTypeId).on("change", function() { 
						var workflowType = Dom.get(workflowTypeId).value;
						me._onWorkflowTypeChange(taskTypeId, workflowType, null) 
					});

					var workflowType = Dom.get(workflowTypeId).value;
					me._onWorkflowTypeChange(taskTypeId, workflowType, null);
				}, this, true);
				
				this._clear();
			},
			
			_onWorkflowTypeChange : function (taskTypeId, workflowType, value) {
				var taskTypeEl = Dom.get(taskTypeId);
				for(i = taskTypeEl.options.length-1; i >= 0; i--) {
					taskTypeEl.remove(i);
			    }
				
				Alfresco.util.Ajax.jsonGet({
					url : Alfresco.constants.URL_SERVICECONTEXT
						+ "components/iopenway/workflow/task-types?workflow-type=" + workflowType,
					successCallback : {
						fn : function(response) {
							if (response.json !== undefined 
									&& response.json.taskTypes 
									&& response.json.taskTypes.length > 0) {

								for (var i = response.json.taskTypes.length - 1; i >=0 ; i--) {
									var option = document.createElement('option');
								    option.text = response.json.taskTypes[i].label;
								    option.value = response.json.taskTypes[i].value;
								    Dom.addClass(option, "task-type");
								    
								    if (value) {
								    	if (value == option.value) {
									    	option.selected = true;
								    	}
								    } 
								    else if (i == 0) {
								    	option.selected = true;
								    }
								    taskTypeEl.add(option, 0);
								}
			                }
						},
						scope : this
					},
					failureMessage : this.msg("error.forminitialize"),
					scope : this
				});
				
			},
			
			_onFilterClick : function () {
				var registry = Openway.component.TaskListFilterManagerRegistry;
				
				var query = [];
				for (i = 0; i < registry.length; i++) {
					var element = Dom.get(registry[i].element);
					var filterId = registry[i].filter;
					
					var value = null;
					if (element.id.indexOf('-check') > 0) {
						value = element.checked ? element.value : '*';
					} else {
						value = element.value;
					}
					query.push(filterId + '|' + value);
				}

				this._refresh(query);
			},
			
			_clear : function () {
				var registry = Openway.component.TaskListFilterManagerRegistry;
				
				for (i = 0; i < registry.length; i++) {
					var element = Dom.get(registry[i].element);
					var filterId = registry[i].filter;

					if (element.id.indexOf('-check') > 0) {
						element.checked = false;

					} else if (element.id.indexOf('-select') > 0) {
						element.selectedIndex = 0;
					} else {
						element.value = null;
					}
				}
			},
			
			_onClearClick : function () {
				this._clear();
				this._refresh([]);
			},
			
			_refresh : function (query) {
				this.options.currentFilter = query;
				
				
				this.services.preferences.set(PREFERENCES_MY_TASKS,  {
					filter : query ? query.toString() : "",
							sort : "",
							dir : "desc"
						});

				YAHOO.Bubbling.fire("filterTasksChanged");
				
				YAHOO.util.History.multiNavigate({'filter': query});
			},

			_loadCurrentFilters : function () {
				
				var filter = {};
				for (i = 0; i < this.options.currentFilter.length; i++) {
					var keyValue = this.options.currentFilter[i].split("|");
					filter[keyValue[0]] = keyValue[1];
				}

				var registry = Openway.component.TaskListFilterManagerRegistry;

				for (i = 0; i < registry.length && filter["workflow-type"]; i++) {
					if (registry[i].filter == "task-type") {
						var taskTypeId =  this.id.replace('_filter-mgr_', '_task-type-filter_') + '-select';
						this._onWorkflowTypeChange(taskTypeId, filter["workflow-type"], filter["task-type"]);
						break;
					}
				}
				
				for (i = 0; i < registry.length; i++) {
					var element = Dom.get(registry[i].element);
					var filterId = registry[i].filter;
					var value = filter[filterId];
					
					if (registry[i].filter == "task-type") {
						// Do nothing...
					}
					else if (element.id.indexOf('-check') > 0) {
						element.checked = value && value != "*";

					} else if (element.id.indexOf('-select') > 0) {
						var index = 0;
						if (value) {
							for (j = 0; j < element.options.length; j++) {
								if (value == element.options[j].value) {
									index = j;
								}
							}
						}
						element.selectedIndex = index;

					} else {
						element.value = value;
					}
				}
			}
			
		});
})();
