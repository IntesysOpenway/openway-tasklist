<#--
 ==============================LICENSE=============================
 Intesys Openway Tasklist - Share
 %%
 Copyright (C) 2016 - 2017 Intesys Openway Srl
 %%
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Lesser Public License for more details.
 
 You should have received a copy of the GNU General Lesser Public
 License along with this program.  If not, see
 <http://www.gnu.org/licenses/lgpl-3.0.html>.
 ============================LICENSE-END===========================
-->
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
