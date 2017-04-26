<import resource="classpath:alfresco/site-webscripts/org/alfresco/components/workflow/workflow.lib.js">
<import resource="classpath:alfresco/site-webscripts/org/alfresco/components/workflow/filter/filter.lib.js">

function main()
{
	var hiddenTaskTypes = getHiddenTaskTypes();
	var hiddenWorkflowsNames = getHiddenWorkflowNames();
	var filterParameters = getFilterParameters();
	var maxItems = getMaxItems();
	
	var myConfig = new XML(config.script),
		sorters = [];
	

	model.headerHidden = true;
	
	for each(var xmlSorter in myConfig.sorters.sorter)
	{
	   sorters.push(
	   {
	      type: xmlSorter.@type.toString(),
	      sortField: xmlSorter.@parameters.toString()
	   });
	}
	
//	// Aggiunta dei filtri da config
//	var filters = config.scoped["taskList"]["filters-parameters"].getChildren("filter");
//	model.filterParameters = filters.concat(model.filterParameters);
	
	
	// Aggiunta colonne
	var properties = [];
	for each(var xmlProp in myConfig..property) {
		properties.push({
			name: xmlProp.@name.toString(),
			width: xmlProp.@width.toString(),
			formatter: xmlProp.@formatter.toString(),
		});
	}
	
	var sort, dir;
	if (myConfig..order) {
		sort= myConfig..order[0].@sort.toString();
		dir = myConfig..order[0].@dir.toString();
	} else {
		sort= "bpmn_dueDate";
		dir = "asc";
	}
	
	model.widgets = [{
		id : "TaskList",
		name : "Openway.component.TaskList",
		options : {
			filterParameters: filterParameters,
			hiddenTaskTypes: hiddenTaskTypes,
			hiddenWorkflowsNames: hiddenWorkflowsNames,
			maxItems: (maxItems ? maxItems : 50),
			order: {
				sort: sort,
				dir: dir
			},
			sorters: sorters,
			taskProps: properties
   		}
	}];

}

main();

