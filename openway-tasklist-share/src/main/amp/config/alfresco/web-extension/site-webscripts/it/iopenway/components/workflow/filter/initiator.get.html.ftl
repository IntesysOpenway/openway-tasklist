<div class="filter">
	<@inlineScript group="worklflow">
			if (Openway.component.TaskListFilterManagerRegistry==undefined) {
				Openway.component.TaskListFilterManagerRegistry = [];
			}
		Openway.component.TaskListFilterManagerRegistry.push({"element" : "${args.htmlid?js_string}-check", "filter" : "initiator"});
	</@>
	<input id="${args.htmlid?js_string}-check" type="checkbox" name="initiator" value="${user.id}" style="margin-top: 1em; margin-right: 5px;" />${msg("header")}
</div>