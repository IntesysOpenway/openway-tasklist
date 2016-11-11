<#macro template header filterName="">
	<div class="filter">
		<h2>${header}</h2>
		<#assign filterId = "">
		<select id="${args.htmlid?js_string}-select" name="${filterName}" tabindex="0">
			<#list filters as filter>
				<#assign filterId = "${filter.id?js_string}" >
				<option value="${filter.data?js_string}" class="${filterId}" >${msg(filter.label?html)}</option>
			</#list>
		</select>
		
		<@inlineScript group="worklflow">
			if (Openway.component.TaskListFilterManagerRegistry==undefined) {
				Openway.component.TaskListFilterManagerRegistry = [];
			}
			Openway.component.TaskListFilterManagerRegistry.push({"element" : "${args.htmlid?js_string}-select", "filter" : "${filterId}"});
		</@>
	</div>
</#macro>
