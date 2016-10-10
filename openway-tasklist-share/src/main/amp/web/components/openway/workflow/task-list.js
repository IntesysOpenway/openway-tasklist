if (typeof Openway == "undefined" || !Openway) {
	Openway = { component : {} };
}

/**
 * TaskList component.
 *
 * @namespace Openway
 * @class Openway.component.TaskList
 */
(function()
{
	/**
	 * YUI Library aliases
	 */
	var Dom = YAHOO.util.Dom,
			Event = YAHOO.util.Event;

	/**
	 * Alfresco Slingshot aliases
	 */
	var $html = Alfresco.util.encodeHTML,
			$siteURL = Alfresco.util.siteURL;

	/**
	 * Preferences
	 */
	var PREFERENCES_MY_TASKS = "it.iopenway.share.my.tasks";
	var PREFERENCES_MY_TASKS_FILTER = PREFERENCES_MY_TASKS + ".filter";
	var PREFERENCES_MY_TASKS_ORDER_SORT = PREFERENCES_MY_TASKS + ".sort";
	var PREFERENCES_MY_TASKS_ORDER_DIR = PREFERENCES_MY_TASKS + ".dir";
	

	YAHOO.lang.augmentObject(Alfresco.util.DataTable.prototype,
	{
		setFilterState : function DataTable_setFilterState(filterState) {
	         
	         if (typeof filterState == "string") {
	        	 filterState = filterState.indexOf(",") > 0 ? filterState.split(",") : [filterState]; 
	         }

	         this.currentFilter = [];
	         for (var i = 0; i < filterState.length; i++) {
		         var filter = {};
		         if (filterState[i].indexOf("|") > 0) {
		            var filterTokens = filterState[i].split("|");
		            filter.filterId = filterTokens[0];
		            filter.filterData = filterTokens.slice(1).join("|"); // Make sure '|' characters in the data value remains
		         } else {
		            filter.filterId = filterState[i].length > 0 ? filterState[i] : undefined;
		         }
		         this.currentFilter.push(filter);
	         }
	    }
	}, true);

	/**
	 * TaskList constructor.
	 *
	 * @param htmlId {String} The HTML id of the parent element
	 * @return {Openway.component.TaskList} The new DocumentList instance
	 * @constructor
	 */
	Openway.component.TaskList = function(htmlId)
	{
		Openway.component.TaskList.superclass.constructor.call(this, "Openway.component.TaskList", htmlId, ["button", "menu", "container", "datasource", "datatable", "paginator", "json", "history"]);

		// Services
		this.services.preferences = new Alfresco.service.Preferences();

		/**
		 * Decoupled event listeners
		 */
		YAHOO.Bubbling.on("filterChanged", this.onFilterChanged, this);
		YAHOO.Bubbling.on("taskListTableReload", this.onTableReload, this);

		YAHOO.Bubbling.on("filterTasksChanged", this.onFilterTasksChanged, this);

		return this;
	};

	/**
	 * Extend from Openway.Base
	 */
	YAHOO.extend(Openway.component.TaskList, Alfresco.component.Base);

	/**
	 * Augment prototype with Common Workflow actions to reuse createFilterURLParameters
	 */
	YAHOO.lang.augmentProto(Openway.component.TaskList, Alfresco.action.WorkflowActions);

	/**
	 * Augment prototype with main class implementation, ensuring overwrite is enabled
	 */
	YAHOO.lang.augmentObject(Openway.component.TaskList.prototype,
	{
		selectedItems : {},
		
		/**
		 * Object container for initialization options
		 *
		 * @property options
		 * @type object
		 */
		options:
		{
			/**
			 * Task types not to display
			 *
			 * @property hiddenTaskTypes
			 * @type Array
			 * @default []
			 */
			hiddenTaskTypes: [],
			/**
			 * Instruction show to resolve filter id & data to url parameters 
			 *
			 * @property filterParameters
			 * @type Array
			 * @default []
			 */
			filterParameters: [],
			/**
			 * Number of tasks to display at the same time
			 *
			 * @property maxItems
			 * @type int
			 * @default 50
			 */
			maxItems: 50,
			/*
			 * Columns to show in table view
			 */
			style: "openway",
			
			order: [],
			
			columns: [],
			
			selectable : false,
			
			projectWorkflows: [],
			
			taskProps: [
				{ prop: "bpm_description", width: 0, formatter: 'renderTitleCell' } ,
				{ prop: "taskType", width: 100, formatter: 'renderTaskTypeCell' },
				{ prop: "bpm_startDate", width: 100, formatter: 'renderDateCell' }, 
				{ prop: "bpm_dueDate", width: 100, formatter: 'renderDateCell' }
			],
			
		},
		
		/**
		 * Fired by YUI when parent element is available for scripting.
		 * Initial History Manager event registration
		 *
		 * @method onReady
		 */
		onReady: function DL_onReady()
		{
			var me = this;
			if( Alfresco.constants.SITE === "" )
			{
				this.loadPreferences();
			}
			else
			{
				var webscript = Alfresco.constants.PROXY_URI + 
						YAHOO.lang.substitute("api/iopenway/project/{projectId}/workflows?exclude={exclude}",
				{
					projectId: encodeURIComponent(Alfresco.constants.SITE),
					exclude: this.options.hiddenWorkflowsNames.join(",")
				});
				Alfresco.util.Ajax.jsonRequest({
					url: webscript,
					method: Alfresco.util.Ajax.GET,
					successCallback:
					{
						fn: function(resp)
						{
							me.options.projectWorkflows = resp.json.data;
							me.loadPreferences();
						},
						scope:this
					},
					failureCallback:
					{
						fn: function (resp)
						{
							if (resp.serverResponse.statusText)
								Alfresco.util.PopupManager.displayMessage({ text: resp.serverResponse.statusText });
						},
						scope:this
					}
				});
			}
		},
		
		loadPreferences: function ()
		{
			// Load preferences (after which the appropriate tasks will be displayed)
			this.services.preferences.request(PREFERENCES_MY_TASKS,
			{
				successCallback:
				{
					fn: this.onPreferencesLoaded,
					scope: this
				}
			});
		},
		
		/**
		 * Process response from preference query
		 *
		 * @method onPreferencesLoaded
		 * @param p_response {object} Response from "api/people/{userId}/preferences" query
		 */
		onPreferencesLoaded: function MyTasks_onPreferencesLoaded(p_response)
		{

			this.preferences = { filter : "", order : {	sort : "", dir : ""	}};
			this.preferences.filter = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_MY_TASKS_FILTER, "");
			this.preferences.order.sort = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_MY_TASKS_ORDER_SORT, "");
			this.preferences.order.dir = Alfresco.util.findValueByDotNotation(p_response.json, PREFERENCES_MY_TASKS_ORDER_DIR, "");

			var compo = this.id.replace("_list_", "_filter-mgr_");
			compo = Alfresco.util.ComponentManager.get(compo);
			compo.options.currentFilter = this.preferences.filter ? this.preferences.filter.split(",") : [];
			compo._loadCurrentFilters();

			this._setupHistory(this.preferences.filter);

			YAHOO.Bubbling.fire("filterTasksChanged");
		},
		
		_setupHistory : function (currentFilter) {
			var History = YAHOO.util.History;

			var me = this;
            var onNewHistoryPagingState = function (pagingState) {
            	if (me.widgets.pagingDataTable) {
                	me.widgets.pagingDataTable.setPagingState(pagingState);
                	if (History.getBookmarkedState("filter") == null || History.getBookmarkedState("filter") == History.getCurrentState("filter")) {
                		me.widgets.pagingDataTable.loadDataTable();
                	}
            	}
            };

            var onNewHistoryFilterState = function (filterState) {
            	if (me.widgets.pagingDataTable) {
                	me.widgets.pagingDataTable.setFilterState(filterState);
                	me.widgets.pagingDataTable.loadDataTable();
            	}
            };

           // Register the module with states taken either from the url (or from the default values if not present)
           History.register("paging", History.getBookmarkedState("paging") || "0|" + this.options.maxItems, onNewHistoryPagingState);
           History.register("filter", History.getBookmarkedState("filter") || "", onNewHistoryFilterState);

           // Initialize the Browser History Manager.
           History.onReady(function () {
        	   YAHOO.util.History.multiNavigate({'filter': currentFilter});
           }, {}, this);
           try
           {
              // Create the html elements needed for history management
              var historyMarkup = '';
              if (YAHOO.env.ua.ie > 0 && !Dom.get("yui-history-iframe"))
              {
                 historyMarkup += '<iframe id="yui-history-iframe" src="' + Alfresco.constants.URL_RESCONTEXT + 'yui/history/assets/blank.html" style="display: none;"></iframe>';
              }
              if (!Dom.get("yui-history-field"))
              {
                 historyMarkup +='<input id="yui-history-field" type="hidden" />';
              }
              if (historyMarkup.length > 0)
              {
                 var historyManagementEl = document.createElement("div");
                 historyManagementEl.innerHTML = historyMarkup;
                 document.body.appendChild(historyManagementEl);
              }
              History.initialize("yui-history-field", "yui-history-iframe");
           }
           catch(e)
           {
              Alfresco.logger.error(this.name + ": Couldn't initialize HistoryManager.", e);
              onHistoryManagerReady();
           }
		},

		initUI: function() {
			
			// Display the toolbar now that we have selected the filter
			// Dom.removeClass(Selector.query(".task-list div", this.id, true), "hidden");
			var colDefs = this._createColumnDefinitions();
			
			this.widgets.pagingDataTable = new Alfresco.util.DataTable(
			{
				dataTable:
				{
					container: this.id + "-tasks",
					columnDefinitions: colDefs,
					config:
					{
						MSG_EMPTY: this.msg("message.noTasks")
					}
				},
				dataSource:
				{
					url: this.getDataSourceURL(),
//					defaultFilter:
//					{
//						filterId: "workflows.active"
//					},
					initialParameters: this.options.filterParameters,
					filterResolver: this.bind(function(filters)
					{
						// Reuse method form WorkflowActions
						var resolvedFilter = "";
						for (var i = 0; i < filters.length; i++) {
							if (resolvedFilter.length > 0) {
								resolvedFilter += "&";
							}
							resolvedFilter += this.createFilterURLParameters(filters[i], this.options.filterParameters);
						}
						return resolvedFilter;
					})
				},
				paginator:
				{
		            hide: false,
					config:
					{
						containers: [this.id + "-paginator", this.id + "-paginatorBottom"],
						rowsPerPage: this.options.maxItems
					}
				}
				
			});
			
			var me = this;
			var dataTable = this.widgets.pagingDataTable.getDataTable();
			dataTable.taskList = me;
			
			var original_doBeforeLoadData = dataTable.doBeforeLoadData;
			

			var sort = this.options.order.sort.replace(":", "_");
			sort = dataTable.getColumn(sort);
			if (sort) {
				var sSortDir = this.options.order.dir ? this.options.order.dir : "asc";
				sSortDir = "yui-dt-" + sSortDir;
		        Dom.addClass(sort.getColEl(), sSortDir);
			}
			
			dataTable.sortColumn = function(oColumn) {
				if(oColumn && (oColumn instanceof YAHOO.widget.Column)) {
			        if(!oColumn.sortable) {
			            return;
			        }

			        // Validate given direction
			        var colEl = oColumn.getColEl();
			        var sSortDir = colEl.classList.contains("yui-dt-asc") ? "yui-dt-desc" : "yui-dt-asc";
			        
			        var columns = this.getColumnSet().keys;
			        for (var i = 0; i < columns.length; i++) {
					    Dom.removeClass(columns[i].getColEl(), "yui-dt-desc");
					    Dom.removeClass(columns[i].getColEl(), "yui-dt-asc");
			        }
			        
			        Dom.addClass(oColumn.getColEl(), sSortDir);

			        // Is the Column currently sorted?
			        var oSortedBy = this.get("sortedBy") || {};
			        var bSorted = (oSortedBy.key === oColumn.key) ? true : false;

			        dataTable.deleteRows(0, dataTable.taskList.widgets.pagingDataTable.lastResultCount);
			        
			        var ok = this.doBeforeSortColumn(oColumn, sSortDir);
			        if(ok) {
		                // Get current state
		                var oState = this.getState();
		                
		                // Reset record offset, if paginated
		                if(oState.pagination) {
		                    oState.pagination.recordOffset = 0;
		                }
		                
		                me.preferences.order.sort = dataTable.taskList.options.order.sort = oColumn.key;
		                me.preferences.order.dir = dataTable.taskList.options.order.dir = sSortDir.replace("yui-dt-", "");

		                me.services.preferences.set(PREFERENCES_MY_TASKS_ORDER_SORT, dataTable.taskList.options.order.sort);
						me.services.preferences.set(PREFERENCES_MY_TASKS_ORDER_DIR, dataTable.taskList.options.order.dir);

		                var dataSource = dataTable.taskList.widgets.pagingDataTable.widgets.dataSource;
		                dataSource.liveData = dataTable.taskList.getDataSourceURL();

		                // Purge selections
		                this.unselectAllRows();
		                this.unselectAllCells(); 
			             
		                dataTable.taskList.widgets.pagingDataTable.reloadDataTable();
		                
			            this.fireEvent("columnSortEvent",{column:oColumn, dir:sSortDir});
			            return;
			        }
			    }
			};
			
			
			dataTable.doBeforeLoadData = function(sRequest, oResponse, oPayload)
			{				
				if(Alfresco.constants.SITE !== "")
				{
					var resp = [];
					for(var i = 0; i < oResponse.results.length; i++)
					{
						var our = false;
						for(var j = 0; j < me.options.projectWorkflows.length; j++)
						{
							if( oResponse.results[i].workflowInstance.id 
									=== me.options.projectWorkflows[j].workflow.id )
							{
								our = true
							}
						}
						if(our)
							resp.push(oResponse.results[i]);
					}
					oResponse.results = resp;
				}
				
				return original_doBeforeLoadData.apply(this, arguments);
			};

	        // File checked handler
	        dataTable.subscribe("checkboxClickEvent", function(e) {
	        	var id = e.target.value; 
	            this.selectedItems[id] = e.target.checked;
	            YAHOO.Bubbling.fire("selectedItemsChanged");
	        }, this, true);
	        
		},

		_createColumnDefinitions : function () {
			var props = [];
			for( var p in this.options.taskProps ) {
				props.push(this.options.taskProps[p]);
			}

			var columns = this.options.columns;
			columns.push('actions');

			var colDefs = [];

			if (this.options.selectable) {
				colDefs.push({ key: "taskId", label: "", sortable: false, formatter: this.renderCellSelected(), width: 16 });
			}

			for (var c in columns)
			{
				var column = columns[c];
				for (var p in props)
				{
					if ( column === props[p].prop && props[p].width >= 0 )
					{
						var cDef = { 
							key: column, 
							label: this.msg("column.title." + column),
							sortable: true, 
							resizable: true, 
							formatter: this.bind(this[ props[p].formatter ])
						};
						if ( props[p].width > 0 )
							cDef.width = props[p].width;
						colDefs.push(cDef);
					}
				}
			}

			colDefs.push( {
				key: "actions", 
				label: this.msg("column.title.actions"),
				sortable: false, 
				formatter: this.bind(this.renderShortActionsCell), 
				width: 200
			});
			
			return colDefs;
		},
		
		renderTextCell: function(elCell, oRecord, oColumn, oData)
		{
			var record = oRecord.getData();
			elCell.setAttribute('data-value', record.properties[oColumn.key]);
			elCell.innerHTML = record.properties[oColumn.key];
		},
				
		renderDateCell: function(elCell, oRecord, oColumn, oData)
		{
			var record = oRecord.getData();
			var date = Alfresco.util.fromISO8601(record.properties[oColumn.key]);
			elCell.innerHTML = ( date !== null ? Alfresco.util.formatDate(date, "mediumDate") : "" );
		},
		
		renderStateCell: function(elCell, oRecord, oColumn, oData)
		{
			var record = oRecord.getData();
			var msgId, cssClass;
			if( !record.workflowInstance.isActive ) {
				msgId = "label.completedWorkflow";
				cssClass = "completed";
			} else {
				if( record.state === "IN_PROGRESS" ) {
					msgId = "label.activeTask";
					cssClass = "todo";
				} else {
					msgId = "label.completedTaskActiveWorkflow";
					cssClass = "pending";
				}
			}
			elCell.innerHTML = '<span class="' + cssClass + '" title="' + this.msg( msgId ) + '">&nbsp;</span>';
		},
		
		renderInitiatorCell: function(elCell, oRecord, oColumn, oData)
		{
			elCell.innerHTML = this.getPersonHTML( oRecord.getData().workflowInstance.initiator );
		},
		
		renderOwnerCell: function(elCell, oRecord, oColumn, oData)
		{
			elCell.innerHTML = this.getPersonHTML( oRecord.getData().owner );
		},
		
		getPersonHTML: function(person)
		{
			return '<span class="person">' 
					+ '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'user/' + person.userName + '/profile">' 
					+ person.firstName + ' ' + person.lastName
					+ '</a></span>';
		},
		
		renderTaskTypeCell: function(elCell, oRecord, oColumn, oData)
		{
			var record = oRecord.getData();
			elCell.innerHTML = record.title;
		},
		
		renderWflTypeCell: function(elCell, oRecord, oColumn, oData)
		{
			var record = oRecord.getData();
			elCell.innerHTML = record.workflowInstance.title;
		},

      /**
       * Returns selector custom datacell formatter
       *
       * @method renderCellSelected
       */
       renderCellSelected: function ()
       {
    	   var scope = this;
         
	       return function (elCell, oRecord, oColumn)
	       {
	           Dom.setStyle(elCell, "width", oColumn.width + "px");
	           Dom.setStyle(elCell.parentNode, "width", oColumn.width + "px");
	           
	           var record = oRecord.getData();
	           elCell.innerHTML = '<input id="checkbox-' + oRecord.getId() + '" type="checkbox" name="fileChecked" value="'+ record.id + '"' + (scope.selectedItems[record.id] ? ' checked="checked">' : '>');
	           
	           
	       };
        },
		
		renderIconsCell: function(elCell, oRecord, oColumn, oData)
		{
			
		},
		
		renderPriorityCell: function(elCell, oRecord, oColumn, oData)
		{
			var priority = oRecord.getData("properties")["bpm_priority"],
					priorityMap = {"1": "high", "2": "medium", "3": "low"},
					priorityKey = priorityMap[priority + ""];
			var desc = '<div class="cell-centered cell-spaced">' 
					+ '<img src="' + Alfresco.constants.URL_RESCONTEXT 
					+ 'components/images/priority-' + priorityKey + '-16.png" ' + 'title="' 
					+ this.msg("label.priority", this.msg("priority." + priorityKey)) + '"/></div>';
			elCell.innerHTML = desc;
		},

		renderTitleCell: function(elCell, oRecord, oColumn, oData)
		{
			var data = oRecord.getData();
			var taskId = data.id,
					message = $html(data.properties["bpm_description"]),
					type = $html(data.title);

			if (message === type)
				message = this.msg("workflow.no_message");

			var href;
			if (oRecord.getData('isEditable'))
				href = $siteURL('task-edit?taskId=' + taskId + '&referrer=tasks&myTasksLinkBack=true') + '" class="theme-color-1" title="' + this.msg("link.editTask");
			else
				href = $siteURL('task-details?taskId=' + taskId + '&referrer=tasks&myTasksLinkBack=true') + '" class="theme-color-1" title="' + this.msg("link.viewTask");

			var info = '<h3><a href="' + href + '">' + message + '</a></h3>';
			elCell.innerHTML = info;
		},

		renderShortActionsCell: function(elCell, oRecord, oColumn, oData)
		{
			// Create actions using WorkflowAction
			if (oRecord.getData('isEditable')) {
				this.createAction(elCell, this.msg("link.editTask"), "task-edit-link", $siteURL('task-edit?taskId=' + oRecord.getData('id') + '&referrer=tasks&myTasksLinkBack=true'));
			}
			this.createAction(elCell, this.msg("link.viewHistory"), "history-view-link", $siteURL('workflow-details?workflowId=' + oRecord.getData('workflowInstance').id + '&' + 'taskId=' + oRecord.getData('id') + '&referrer=tasks&myTasksLinkBack=true#current-tasks'));
			var instance = oRecord.getData('workflowInstance');
			if (instance && instance.isActive) {
				this.createAction(elCell, this.msg("link.viewWorkflowDiagram"), "workflow-view-diagram", function () { this.viewWorkflowDiagram(oRecord); });
			}
		},
		
		getDataSourceURL: function()
		{
			var props = [];
			for( var p in this.options.taskProps )
				props.push(this.options.taskProps[p].prop);
			// Prepare webscript url to task instances
			var webscript = YAHOO.lang.substitute(
				"api/iopenway/task-instances?authority={authority}&properties={prop}&exclude={exclude}&sort={sort}&dir={dir}",
				{
					authority: encodeURIComponent(Alfresco.constants.USERNAME),
					prop: props.join(","),
					exclude: this.options.hiddenTaskTypes.join(","),
					sort: this.options.order.sort,
					dir: this.options.order.dir
				});
			return Alfresco.constants.PROXY_URI + webscript; // + '&' + this.getReqParameters();
		},
		
		onTableReload: function()
		{
			var me = this;
			var webscript = Alfresco.constants.PROXY_URI + 
						YAHOO.lang.substitute("api/iopenway/project/{projectId}/workflows?exclude={exclude}",
			{
				projectId: encodeURIComponent(Alfresco.constants.SITE),
				exclude: this.options.hiddenWorkflowsNames.join(",")
			});
			Alfresco.util.Ajax.jsonRequest({
				url: webscript,
				method: Alfresco.util.Ajax.GET,
				successCallback:
				{
					fn: function(resp)
					{
						me.options.projectWorkflows = resp.json.data;
						this.widgets.pagingDataTable.loadDataTable(/*this.getReqParameters()*/);
					},
					scope:this
				},
				failureCallback:
				{
					fn: function (resp)
					{
						if (resp.serverResponse.statusText)
							Alfresco.util.PopupManager.displayMessage({ text: resp.serverResponse.statusText });
					},
					scope:this
				}
			});
		},
		
		onDetachWorkflow: function(obj)
		{
			return;
			var me = this;
			var workflow = obj.workflow;
			Alfresco.util.PopupManager.displayPrompt(
			{
				title: me.msg("title.detachWorkflowFromProject"),
				text: me.msg("message.detachWorkflowFromProject",  Alfresco.util.encodeHTML(workflow.description)),
				noEscape: true,
				buttons: [
				{
					text: me.msg("button.detachWorkflowFromProject"),
					handler: function()
					{
						var req = {};
									
						// Delete org chart role
						Alfresco.util.Ajax.jsonRequest({
							url: Alfresco.constants.PROXY_URI 
										+ "api/iopenway/project/" + encodeURIComponent(obj['project'].shortName) 
										+ "/workflow/" + encodeURIComponent(workflow.id) + "?alf_method=DELETE",
							method: Alfresco.util.Ajax.POST,
							dataObj: req,
							successCallback:
							{
								fn: function (resp)
								{
									this.destroy();
									if (resp.serverResponse.statusText)
									{
										Alfresco.util.PopupManager.displayMessage({ text: resp.serverResponse.statusText });
									}
									me.widgets.alfrescoDataTable.loadDataTable();
								},
								scope:this
							},
							failureCallback:
							{
								fn: function (resp)
								{
									this.destroy();
									if (resp.serverResponse.statusText)
									{
										Alfresco.util.PopupManager.displayMessage({ text: resp.serverResponse.statusText });
									}
									me.widgets.alfrescoDataTable.loadDataTable();
								},
								scope:this
							}
						});
					}
				},
				{
					text: me.msg("button.cancel"),
					handler: function()
					{
						this.destroy();
					},
					isDefault: true
				}]
			});
		},
		
		
		/**
		 * Fired when the currently active filter has changed
		 *
		 * @method onFilterChanged
		 * @param layer {string} the event source
		 * @param args {object} arguments object
		 */
		onFilterChanged: function BaseFilter_onFilterChanged(layer, args)
		{
//			var filter = Alfresco.util.cleanBubblingObject(args[1]);
//			Dom.get(this.id + "-filterTitle").innerHTML = $html(this.msg("filter." + filter.filterId + (filter.filterData ? "." + filter.filterData : ""), filter.filterData));
		},
		
		onFilterTasksChanged : function _onFilterTasksChanged(layer, args) {
			this.selectedItems = {};
			
			var filterMgr = this.id.replace("_list_", "_filter-mgr_");
			filterMgr = Alfresco.util.ComponentManager.get(filterMgr);
			
			var taskType = null;
			for (var i = 0; i < filterMgr.options.currentFilter.length; i++) {
				var filter = filterMgr.options.currentFilter[i];
				if(filter.indexOf("task-type|")==0) {
					taskType = filter.replace("task-type|", "");
				}
			}
			this.options.selectable = taskType != null && taskType != "" && taskType != "*";
			
			// Recupera le colonne..
			Alfresco.util.Ajax.jsonGet({
				url : Alfresco.constants.URL_SERVICECONTEXT
					+ "components/iopenway/workflow/task-columns?taskType=" + taskType,
				successCallback : {
					fn : function(response) {
						if (response.json !== undefined) {
							this.options.taskProps = response.json.columns;
							this.options.columns = [];
							
							var preferredSorter = false;
							for (i = 0; i < this.options.taskProps.length; i++) {
								var prop = this.options.taskProps[i].prop;
								this.options.columns.push(prop);
								preferredSorter |= this.preferences.order.sort == prop;
							}
							
							if (preferredSorter) {
								this.options.order.sort = this.preferences.order.sort;
								this.options.order.dir  = this.preferences.order.dir;
							} else {
								this.options.order.sort = response.json.columns[0].prop;
								this.options.order.dir  = "desc";
							}
							
							this.initUI();
		                }
					},
					scope : this
				},
				failureMessage : "Errore in fase di inizializzazione della form",
				scope : this
			});
		},
		
		/**
		 * DataTable Cell Renderers
		 */

		/**
		 * Priority & pooled icons custom datacell formatter
		 *
		 * @method TL_renderCellIcons
		 * @param elCell {object}
		 * @param oRecord {object}
		 * @param oColumn {object}
		 * @param oData {object|string}
		 */
		renderCellIcons: function TL_renderCellIcons(elCell, oRecord, oColumn, oData)
		{
			var priority = oRecord.getData("properties")["bpm_priority"],
					priorityMap = {"1": "high", "2": "medium", "3": "low"},
			priorityKey = priorityMap[priority + ""],
					pooledTask = oRecord.getData("isPooled");
			var desc = '<img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/priority-' + priorityKey + '-16.png" title="' + this.msg("label.priority", this.msg("priority." + priorityKey)) + '"/>';
			if (pooledTask)
			{
				desc += '<br/><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/pooled-task-16.png" title="' + this.msg("label.pooledTask") + '"/>';
			}

			if (oRecord.getData("properties")["openwayrwf_relatedWorkflows"] || oRecord.getData("properties")["itdrwf_relatedWorkflows"])
			{
				desc += '<br/><img src="' + Alfresco.constants.URL_RESCONTEXT + 'components/images/with-related-tasks-16.png" title="' + this.msg("label.withRelatedTasks") + '"/>';
			}

			elCell.innerHTML = desc;
		},
		
		/**
		 * Task info custom datacell formatter
		 *
		 * @method TL_renderCellTaskInfo
		 * @param elCell {object}
		 * @param oRecord {object}
		 * @param oColumn {object}
		 * @param oData {object|string}
		 */
		renderCellTaskInfo: function TL_renderCellTaskInfo(elCell, oRecord, oColumn, oData)
		{
			var data = oRecord.getData();
			var taskId = data.id,
					message = $html(data.properties["bpm_description"]),
					dueDateStr = data.properties["bpm_dueDate"],
					dueDate = dueDateStr ? Alfresco.util.fromISO8601(dueDateStr) : null,
					today = new Date(),
					workflowInstance = data.workflowInstance,
					taskStartDate = data.properties["bpm_startDate"] ? Alfresco.util.fromISO8601(data.properties["bpm_startDate"]) : null,
					taskCompletionDate = data.properties["bpm_completionDate"] ? Alfresco.util.fromISO8601(data.properties["bpm_completionDate"]) : null,
					workflowStartDate = workflowInstance.startDate ? Alfresco.util.fromISO8601(workflowInstance.startDate) : null,
					type = $html(data.title),
					status = $html(data.properties["bpm_status"]),
					assignee = data.owner,
					description = $html(data.description),
					initiator = '', initiatorUserName = '';

			if (workflowInstance.initiator)
			{
				initiator = $html(workflowInstance.initiator.firstName + ' ' + workflowInstance.initiator.lastName);
				initiatorUserName = workflowInstance.initiator.userName;
			} else {
				initiator = this.msg("label.unknownUser");
				initiatorUserName = '';
			}

			// if there is a property label available for the status use that instead
			if (data.propertyLabels && Alfresco.util.isValueSet(data.propertyLabels["bpm_status"], false))
			{
				status = data.propertyLabels["bpm_status"];
			}

			// if message is the same as the task type show the <no message> label
			if (message == type)
			{
				message = this.msg("workflow.no_message");
			}

			var href;
			if (oRecord.getData('isEditable'))
			{
				href = $siteURL('task-edit?taskId=' + taskId + '&referrer=tasks&myTasksLinkBack=true') + '" class="theme-color-1" title="' + this.msg("link.editTask");
			}
			else
			{
				href = $siteURL('task-details?taskId=' + taskId + '&referrer=tasks&myTasksLinkBack=true') + '" class="theme-color-1" title="' + this.msg("link.viewTask");
			}

			var info = '<h3><a href="' + href + '">' + message + '</a></h3>';
			info += '<div class="due">' + (dueDate && !taskCompletionDate && today > dueDate ? '<span class="task-delayed"></span>' : '')
					+ '<label>' + this.msg("label.due") + ':</label><span>'
					+ (dueDate ? Alfresco.util.formatDate(dueDate, "longDate") : this.msg("label.none")) + '</span></div>';
			info += '<div class="started"><label>' + this.msg("label.taskStartDate") + ':</label><span>' + (taskStartDate ? Alfresco.util.formatDate(taskStartDate, "longDate") : this.msg("label.none")) + '</span></div>';
			if (taskCompletionDate)
			{
				info += '<div class="ended"><label>' + this.msg("label.ended") + ':</label><span>' + (taskCompletionDate ? Alfresco.util.formatDate(taskCompletionDate, "longDate") : this.msg("label.none")) + '</span></div>';
			}
			/*if (!workflowInstance.isActive)
			 {
			 var endedDate = workflowInstance.endDate ? Alfresco.util.fromISO8601(workflowInstance.endDate) : null;
			 info += '<div class=ended"><label>' + this.msg("label.ended") + ':</label><span>' + (endedDate ? Alfresco.util.formatDate(endedDate, "longDate") : this.msg("label.none")) + '</span></div>';
			 }*/
			info += '<div class="status"><label>' + this.msg("label.status") + ':</label><span>' + status + '</span></div>';
			info += '<div class="started"><label>' + this.msg("label.workflowStartDate") + ':</label><span>' + (workflowStartDate ? Alfresco.util.formatDate(workflowStartDate, "longDate") : this.msg("label.none")) + '</span></div>';
			info += '<div class="type"><label>' + this.msg("label.type", type) + ':</label><span>' + type + '</span></div>';
			// info += '<div class="description"><label>' + this.msg("label.description") + ':</label><span>' + description + '</span></div>';
			info += '<div class="initiator"><label>' + this.msg("label.initiator") + ':</label><span>'
					+ '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'user/' + initiatorUserName + '/profile">' + initiator
					+ '</a></span></div>';
			if (!assignee || !assignee.userName)
			{
				info += '<div class="unassigned"><span class="theme-bg-color-5 theme-color-5 unassigned-task">' + this.msg("label.unassignedTask") + '</span></div>';
			}
			elCell.innerHTML = info;
		},
		
		/**
		 * Actions custom datacell formatter
		 *
		 * @param elCell {object}
		 * @param oRecord {object}
		 * @param oColumn {object}
		 * @param oData {object|string}
		 */
		renderCellActions: function TL_renderCellActions(elCell, oRecord, oColumn, oData)
		{
			// Create actions using WorkflowAction
			if (oRecord.getData('isEditable'))
			{
				this.createAction(elCell, this.msg("link.editTask"), "task-edit-link", $siteURL('task-edit?taskId=' + oRecord.getData('id') + '&referrer=tasks&myTasksLinkBack=true'));
			}
			this.createAction(elCell, this.msg("link.viewTask"), "task-view-link", $siteURL('task-details?taskId=' + oRecord.getData('id') + '&referrer=tasks&myTasksLinkBack=true'));
			this.createAction(elCell, this.msg("link.viewHistory"), "history-view-link", $siteURL('workflow-details?workflowId=' + oRecord.getData('workflowInstance').id + '&' + 'taskId=' + oRecord.getData('id') + '&referrer=tasks&myTasksLinkBack=true#current-tasks'));
		},

		/**
		 * Called when view workflow diagram button is clicked.
		 * WIll display the workflow's diagram.
		 */
		viewWorkflowDiagram: function(oRecord) {
			var diagramUrl = "api/workflow-instances/" + oRecord.getData('workflowInstance').id + "/diagram";
			showLightbox({ src: Alfresco.constants.PROXY_URI + diagramUrl });
		}

	}, true
	);
})();
