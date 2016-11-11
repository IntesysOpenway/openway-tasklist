<@markup id="css" >
   <#-- CSS Dependencies -->
   <@link rel="stylesheet" href="${url.context}/res/components/openway/workflow/task-list-filter.css" group="workflow"/>
</@>

<@markup id="js">
   <#-- JavaScript Dependencies -->
   <@script src="${url.context}/res/components/openway/workflow/task-list-filter.js" group="workflow"/>
</@>

<@markup id="widgets">
   <@createWidgets group="workflow"/>
</@>

<@markup id="html">
	<@uniqueIdDiv>
		<div class="filter-manager form-container">
			<div class="form-buttons" id="${args.htmlid}-form-buttons">
		         <span class="yui-button" id="${args.htmlid}-filter-button">
		         	<span class="first-child">
		         		<button type="button">${msg("filter")}</button>
		         	</span>
		         </span>
		         <span class="yui-button" id="${args.htmlid}-clear-button">
		         	<span class="first-child">
		         		<button type="button">${msg("clear")}</button>
		         	</span>
		         </span>
		   </div>
		</div>
	</@>
</@>