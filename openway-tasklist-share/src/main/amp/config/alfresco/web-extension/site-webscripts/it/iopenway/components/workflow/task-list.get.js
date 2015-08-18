<import resource="classpath:alfresco/site-webscripts/org/alfresco/components/workflow/workflow.lib.js">
<import resource="classpath:alfresco/site-webscripts/org/alfresco/components/workflow/filter/filter.lib.js">

function main()
{
	model.hiddenTaskTypes = getHiddenTaskTypes();
	model.hiddenWorkflowsNames = getHiddenWorkflowNames();
	model.filterParameters = getFilterParameters();
	model.maxItems = getMaxItems();
	
	var myConfig = new XML(config.script),
		headerHidden = myConfig["headerHidden"],
		sorters = [];
	

	model.headerHidden = true;
	if (headerHidden && headerHidden=="false") {
		model.headerHidden = false;
	}
	
	for each(var xmlSorter in myConfig.sorters.sorter)
	{
	   sorters.push(
	   {
	      type: xmlSorter.@type.toString(),
	      sortField: xmlSorter.@parameters.toString()
	   });
	}
	model.sorters = sorters;
	
//	// Aggiunta dei filtri da config
//	var filters = config.scoped["taskList"]["filters-parameters"].getChildren("filter");
//	model.filterParameters = filters.concat(model.filterParameters);
	
	
	// Aggiunta colonne
	var properties = [];
	for each(var xmlProp in myConfig..property)
	{
//		logger.log("Colonna");
//		logger.log(typeof xmlProp);
//		logger.log(xmlProp);
		
		properties.push(
	   {
	      name: xmlProp.@name.toString(),
	      width: xmlProp.@width.toString(),
	      formatter: xmlProp.@formatter.toString(),
	   });
	}
	model.properties = properties;
	
	if (myConfig..order) {
		model.sort= myConfig..order[0].@sort.toString();
		model.dir = myConfig..order[0].@dir.toString();
	} else {
		model.sort= "bpmn_dueDate";
		model.dir = "asc";
	}
	
}

main();

