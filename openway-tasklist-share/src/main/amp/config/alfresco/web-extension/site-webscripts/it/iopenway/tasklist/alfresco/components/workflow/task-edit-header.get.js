<import resource="classpath:alfresco/site-webscripts/org/alfresco/components/workflow/workflow.lib.js">

for each (widget in model.widgets) {
	if (widget.id = "TaskEditHeader") {
		widget.options.submitUrl = getSiteUrl("iopenway-my-tasks");
	}
}
