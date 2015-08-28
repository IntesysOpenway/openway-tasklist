<#include "/org/alfresco/components/component.head.inc">

<@markup id="css" >
	<@link href="${url.context}/res/components/openway/workflow/task-list.css" />
</@>

<@markup id="js">
	<@script src="${url.context}/res/components/workflow/workflow-actions.js" />
	<@script src="${url.context}/res/components/openway/workflow/task-list.js" />
</@>

<@markup id="html">
	<#import "/org/alfresco/components/workflow/workflow.lib.ftl" as workflow/>
	<#import "/org/alfresco/components/workflow/filter/filter.lib.ftl" as filter/>
	
	<#assign el=args.htmlid?html>
	<div id="${el}-body" class="task-list">
	   <div class="yui-g task-list-bar flat-button theme-bg-color-1">
	      <div class="yui-u first">
	         <div id="${el}-paginator" class="paginator">&nbsp;</div>
	      </div>
		</div>
		<div id="${el}-tasks" class="tasks"></div>
		<div class="yui-u">
			<div id="${el}-paginatorBottom" class="paginator">&nbsp;</div>
		</div>
	</div>
</@>

<@inlineScript group="worklflow">
	(function()
	{
	   new Openway.component.TaskList("${el}").setOptions(
	   {
	      filterParameters: <@filter.jsonParameterFilter filterParameters />,
	      hiddenTaskTypes: <@workflow.jsonHiddenTaskTypes hiddenTaskTypes/>,
	      hiddenWorkflowsNames: [<#list hiddenWorkflowsNames as workflow>"${workflow}"<#if workflow_has_next>, </#if></#list>],
	      maxItems: ${maxItems!"50"},
	      order: {
	      	sort: "${sort?js_string}",
	      	dir: "${dir?js_string}",
	      },
	      sorters:
	      {<#list sorters as sorter>
	         "${sorter.type?js_string}": "${sorter.sortField?js_string}"<#if sorter_has_next>,</#if>
	      </#list>}
	      <#if properties??>
	      , taskProps: [
				<#list properties as prop>
					{ prop: "${prop.name?js_string}", width: ${prop.width?js_string}, formatter: "${prop.formatter?js_string}" }
					<#if prop_has_next>,</#if>
				</#list>
			]
	      </#if>
	   }).setMessages(
	      ${messages}
	   );
	})();
</@>
