<@markup id="css" >
   <#-- CSS Dependencies -->
   <@link rel="stylesheet" href="${url.context}/res/components/workflow/task-list-toolbar.css" group="workflow"/>
</@>

<@markup id="js">
   <#-- JavaScript Dependencies -->
   <@script src="${url.context}/res/components/form/workflow/transitions.js" group="workflow"/>
   <@script src="${url.context}/res/components/form/workflow/activiti-transitions.js" group="workflow"/>
   <@script src="${url.context}/res/components/workflow/task-list-toolbar.js" group="workflow"/>
   <@script src="${url.context}/res/components/openway/workflow/task-list-toolbar.js" group="workflow"/>
</@>

<@markup id="widgets">
   <@createWidgets group="workflow"/>
</@>

<@markup id="html">
   <@uniqueIdDiv>
      <#assign el=args.htmlid?html>
      <div id="${el}-body" class="task-list-toolbar toolbar">
         <div id="${el}-headerBar" class="header-bar theme-bg-2 hideable hidden">
            <div class="left flat-button">
				<div class="start-workflow"><button id="${el}-startWorkflow-button" name="startWorkflow">${msg("button.startWorkflow")}</button></div>
            </div>
            <div class="left flat-button">
				<#-- TASK SELECT -->
				<@markup id="taskSelect">
					<div class="task-select hidden">
						<button id="${el}-taskSelect-button" name="taskSelect-button">${msg("menu.select")}</button>
						<div id="${el}-taskSelect-menu" class="yuimenu">
							<div class="bd">
								<ul>
									<li><a href="#"><span class="selectAll">${msg("menu.select.all")}</span></a></li>
									<li><a href="#"><span class="selectInvert">${msg("menu.select.invert")}</span></a></li>
									<li><a href="#"><span class="selectNone">${msg("menu.select.none")}</span></a></li>
		                         </ul>
							</div>
						</div>
					</div>
				</@>
            </div>
            <div class="left">
				<#-- TASK TRANSITIONS -->
				<@markup id="transitions">
					<div id="${el}-transitions">
   						<div id="${el}-transitions-buttons">
						</div>
					</div>
				</@>
            </div>
         </div>
      </div>
   </@>
</@>
