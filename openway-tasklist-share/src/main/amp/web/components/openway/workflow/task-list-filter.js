if (typeof Openway == "undefined" || !Openway) {
	Openway = { component : {} };
}

(function() {

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

				this.widgets.filterButton =  Alfresco.util.createYUIButton(this, "filter-button", this._onFilterClick);
				this.widgets.clearButton =  Alfresco.util.createYUIButton(this, "clear-button", this._onClearClick);

				var workflowTypeId =  this.id.replace('_filter-mgr_', '_workflow-type-filter_') + '-select';
				var taskTypeId =  this.id.replace('_filter-mgr_', '_task-type-filter_') + '-select';
				YAHOO.util.Event.onContentReady(workflowTypeId, function() {
					new YAHOO.util.Element(workflowTypeId).on("change", function() { me._onWorkflowTypeChange(workflowTypeId, taskTypeId) });
					me._onWorkflowTypeChange(workflowTypeId, taskTypeId);
				}, this, true);
				
				this._clear();
			},
			
			_onWorkflowTypeChange : function (workflowTypeId, taskTypeId) {
				var workflowType = Dom.get(workflowTypeId).value;
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
								    if (i == 0) {
								    	option.selected = true;
								    }
								    taskTypeEl.add(option, 0);
								}
			                }
						},
						scope : this
					},
					failureMessage : "Errore in fase di inizializzazione della form",
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

				YAHOO.Bubbling.fire("filterTasksChanged");
				
				YAHOO.util.History.multiNavigate({'filter': query});
			}

		});
})();