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
