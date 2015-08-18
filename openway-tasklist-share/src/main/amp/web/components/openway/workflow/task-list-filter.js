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
				// this.widgets.transitionsToolbar = Alfresco.util.ComponentManager.get()
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
			
			_onClearClick : function () {
				var registry = Openway.component.TaskListFilterManagerRegistry;
				
				for (i = 0; i < registry.length; i++) {
					var element = Dom.get(registry[i].element);
					var filterId = registry[i].filter;

					if (element.id.indexOf('-check') > 0) {
						element.checked = false;
					} else {
						element.value = null;
					}
				}
				
				this._refresh([]);
			},
			
			_refresh : function (query) {
				this.options.currentFilter = query;

				YAHOO.Bubbling.fire("filterTasksChanged");
				
				YAHOO.util.History.multiNavigate({'filter': query});
			}

		});
})();