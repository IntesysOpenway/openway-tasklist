/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * WorkflowForm component.
 *
 * The workflow details page form is actually a form display of the workflow's start task and data form the workflow itself.
 * To be able to display all this information the following approach is taken:
 *
 * 1. The page loads with a url containing the workflowId as an argument.
 * 2. Since we actually want to display the start task the data-loader component has been bound in to the bottom of the page,
 *    instructed to load detailed workflow data based on the workflowId url argument,
 *    so we can get the startTaskInstanceId needed to request the form.
 * 3. A dynamically/ajax loaded form is brought in using the startTaskInstanceId which gives us a start task form with the
 *    "More Info", "Roles" and "Items" sections.
 * 4. However we shall also display info from the workflow itsel, so once the form is loaded and inserted in to the Dom,
 *    the additional sections "Summary", "General", "Current Tasks" & "Workflow History" are inserted inside the form.
 *
 * @namespace Alfresco.component
 * @class Alfresco.component.WorkflowForm
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      Selector = YAHOO.util.Selector;

   /**
    * Alfresco Slingshot aliases
    */
   var $html = Alfresco.util.encodeHTML,
      $siteURL = Alfresco.util.siteURL,
      $userProfileLink = Alfresco.util.userProfileLink;


   YAHOO.lang.augmentObject(Alfresco.component.WorkflowForm.prototype, 
   {
	   getCurrentTasksColumnDefinitions : function () {
		   return [
	               { key: "name", label: this.msg("column.type"), formatter: this.bind(this.renderCellType) },
	               { key: "owner", label: this.msg("column.assignedTo"), formatter: this.bind(this.renderCellOwner) },
	               { key: "id", label: this.msg("column.dueDate"), formatter: this.bind(this.renderCellDueDate) },
	               { key: "properties", label: this.msg("column.actions"), formatter: this.bind(this.renderCellCurrentTasksActions) }
	            ];
	   },
	   
	   getHistoryColumnDefinitions : function () {
	        return [
	           { key: "name", label: this.msg("column.type"), formatter: this.bind(this.renderCellType) },
	           { key: "owner", label: this.msg("column.completedBy"), formatter: this.bind(this.renderCellCompletedBy) },
	           { key: "id", label: this.msg("column.dateCompleted"), formatter: this.bind(this.renderCellDateCompleted) },
	           { key: "state", label: this.msg("column.outcome"), formatter: this.bind(this.renderCellOutcome) },
	           { key: "properties", label: this.msg("column.comment"), formatter: this.bind(this.renderCellComment) }
	        ];
	   },

      /**
       * Called when a workflow form has been loaded.
       * Will insert the form in the Dom.
       *
       * @method onWorkflowFormLoaded
       * @param response {Object}
       */
      onWorkflowFormLoaded: function WorkflowForm_onWorkflowFormLoaded(response)
      {
         // Insert the form html
         var formEl = Dom.get(this.id + "-body");
         formEl.innerHTML = response.serverResponse.responseText;

         // Insert the summary & general sections in the top of the form
         var formFieldsEl = Selector.query(".form-fields", this.id, true),
            workflowSummaryEl = Dom.get(this.id + "-summary-form-section"),
            generalSummaryEl = Dom.get(this.id + "-general-form-section");

         formFieldsEl.insertBefore(generalSummaryEl, Dom.getFirstChild(formFieldsEl));
         formFieldsEl.insertBefore(workflowSummaryEl, generalSummaryEl);

         // Create header and data table elements
         var currentTasksContainerEl = Dom.get(this.id + "-currentTasks-form-section"),
            currentTasksTasksEl = Selector.query("div", currentTasksContainerEl, true);

         // DataTable column definitions for current tasks
         var currentTasksColumnDefinitions = this.getCurrentTasksColumnDefinitions();

         // Create current tasks data table filled with current tasks
         var currentTasksDS = new YAHOO.util.DataSource(this.currentTasks,
         {
            responseType: YAHOO.util.DataSource.TYPE_JSARRAY
         });
         this.widgets.currentTasksDataTable = new YAHOO.widget.DataTable(currentTasksTasksEl, currentTasksColumnDefinitions, currentTasksDS,
         {
            MSG_EMPTY: this.msg("label.noTasks")
         });

         // DataTable column definitions workflow history
         var historyColumnDefinitions = this.getHistoryColumnDefinitions();

         // Create header and data table elements
         var historyContainerEl = Dom.get(this.id + "-workflowHistory-form-section"),
            historyTasksEl = Selector.query("div", historyContainerEl, true);
         
         // Create workflow history data table filled with history tasks
         var workflowHistoryDS = new YAHOO.util.DataSource(this.historyTasks,
         {
            responseType: YAHOO.util.DataSource.TYPE_JSARRAY
         });
         this.widgets.historyTasksDataTable = new YAHOO.widget.DataTable(historyTasksEl, historyColumnDefinitions, workflowHistoryDS,
         {
            MSG_EMPTY: this.msg("label.noTasks")
         });

         // Display tables
         Selector.query(".form-fields", this.id, true).appendChild(currentTasksContainerEl);
         Selector.query(".form-fields", this.id, true).appendChild(historyContainerEl);

         // Fire event so other components knows the form finally has been loaded
         YAHOO.Bubbling.fire("workflowFormReady", this);
      },

      /**
       * Render task outcome
       *
       * @method renderCellOutcome
       * @param elCell {object}
       * @param oRecord {object}
       * @param oColumn {object}
       * @param oData {object|string}
       */
      renderCellOutcome: function WorkflowForm_renderCellOutcome(elCell, oRecord, oColumn, oData)
      {
    	  var outcome = oRecord.getData("outcome");
    	  elCell.innerHTML = $html(outcome && outcome!="null" ? outcome : "");
      },

   }, true);

})();
