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

﻿<@markup id="openway-tasklist-js" target="js" action="after" scope="global">
   <#-- JavaScript Dependencies -->
   <@script type="text/javascript" src="${url.context}/res/components/openway/dashlets/my-tasks.js" group="dashlets"/>
</@>

﻿<@markup id="openway-tasklist-html" target="html" action="replace" scope="global">
   <@uniqueIdDiv>
      <#assign id = args.htmlid?html>
      <div class="dashlet my-tasks">
         <div class="title">${msg("header")}</div>
         <div class="toolbar flat-button">
            <div class="hidden">
               <span class="align-left yui-button yui-menu-button" id="${id}-filters">
                  <span class="first-child">
                     <button type="button" tabindex="0"></button>
                  </span>
               </span>
               <select id="${id}-filters-menu">
               <#list filters as filter>
                  <option value="${filter.type?html}">${msg("filter." + filter.type)}</option>
               </#list>
               </select>
               <span class="align-right yui-button-align">
                  <span class="first-child">
                     <a href="${url.context}/page/start-workflow" class="theme-color-1">
                        <img src="${url.context}/res/components/images/workflow-16.png" style="vertical-align: text-bottom" width="16" />
                        ${msg("link.startWorkflow")}</a>
                  </span>
               </span>
               <div class="clear"></div>
            </div>
         </div>
         <div class="toolbar flat-button">
            <div class="align-left" id="${id}-paginator">&nbsp;</div>
            <span class="align-right yui-button-align">
               <span class="first-child">
                  <a href="${url.context}/page/iopenway-my-tasks" class="theme-color-1">${msg("link.detailedView")}</a>
               </span>
            </span>
            <div class="clear"></div>
         </div>
         <div class="body scrollableList" <#if args.height??>style="height: ${args.height?html}px;"</#if>>
            <div id="${id}-tasks"></div>
         </div>
      </div>
   </@>
</@>
