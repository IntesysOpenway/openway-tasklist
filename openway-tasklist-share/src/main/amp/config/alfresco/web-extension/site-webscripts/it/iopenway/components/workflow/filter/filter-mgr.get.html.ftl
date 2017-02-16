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
