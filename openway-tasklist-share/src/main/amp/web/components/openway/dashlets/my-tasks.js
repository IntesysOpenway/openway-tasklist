/**
 * Openway Extension Dashboard MyTasks template.
 *
 * @namespace Alfresco.dashlet
 * @class Alfresco.dashlet.OwExt.MyTasks
 */
(function()
{
	/**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom;

   YAHOO.lang.augmentObject(Alfresco.dashlet.MyTasks.prototype, {
		
	   /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function MyTasks_onReady()
      {
         // Create filter menu
         this.widgets.filterMenuButton = Alfresco.util.createYUIButton(this, "filters", this.onFilterSelected,
         {
            type: "menu",
            menu: "filters-menu",
            lazyloadmenu: false
         });

         // Load preferences (after which the appropriate tasks will be displayed)
         this.PREFERENCES_TASKS_DASHLET = this.services.preferences.getDashletId(this, "tasks");
         this.PREFERENCES_TASKS_DASHLET_FILTER = this.PREFERENCES_TASKS_DASHLET + ".filter";
         var prefs = this.services.preferences.get();

         // Select the preferred filter in the ui
         var filter = Alfresco.util.findValueByDotNotation(prefs, this.PREFERENCES_TASKS_DASHLET_FILTER, "activeTasks");
         filter = this.options.filters.hasOwnProperty(filter) ? filter : "activeTasks";
         this.widgets.filterMenuButton.set("label", this.msg("filter." + filter));
         this.widgets.filterMenuButton.value = filter;

         // Display the toolbar now that we have selected the filter
         Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");

         // Prepare webscript url to task instances
         /**
          * Openway Extension: modificato url webscript affinche' venga usato quello di openway che permette l'ordinamento dei risultati
          */
         var webscript = YAHOO.lang.substitute("api/iopenway/task-instances?authority={authority}&properties={properties}&exclude={exclude}&sort={sort}&dir={dir}",
         {
            authority: encodeURIComponent(Alfresco.constants.USERNAME),
            properties: ["bpm_priority", "bpm_status", "bpm_dueDate", "bpm_description"].join(","),
            exclude: this.options.hiddenTaskTypes.join(","),
            sort: this.options.sort ? this.options.sort : "bpm_startDate",
            dir: this.options.dir ? this.options.dir : "desc",
         });

         /**
          * Create datatable with a simple pagination that only displays number of results.
          * The pagination is handled in the "base" data source url and can't be changed in the dashlet
          */
         this.widgets.alfrescoDataTable = new Alfresco.util.DataTable(
         {
            dataSource:
            {
               url: Alfresco.constants.PROXY_URI + webscript,
               filterResolver: this.bind(function()
               {
                  // Reuse method form WorkflowActions
                  var filter = this.widgets.filterMenuButton.value;
                  var filterParameters = this.options.filters[filter];
                  return this.substituteParameters(filterParameters) || "";
               })
            },
            dataTable:
            {
               container: this.id + "-tasks",
               columnDefinitions:
               [
                  { key: "isPooled", sortable: false, formatter: this.bind(this.renderCellIcons), width: 24 },
                  { key: "title", sortable: false, formatter: this.bind(this.renderCellTaskInfo) },
                  { key: "name", sortable: false, formatter: this.bind(this.renderCellActions), width: 45 }
               ],
               config:
               {
                  MSG_EMPTY: this.msg("message.noTasks")
               }
            },
            paginator:
            {
               history: false,
               hide: false,
               config:
               {
                  containers: [this.id + "-paginator"],
                  template: "{FirstPageLink} {PreviousPageLink} {CurrentPageReport} {NextPageLink} {LastPageLink}",
                  firstPageLinkLabel: "&lt;&lt;",
                  previousPageLinkLabel: "&lt;",
                  nextPageLinkLabel: "&gt;",
                  lastPageLinkLabel: "&gt;&gt;",
                  pageReportTemplate: this.msg("pagination.template.page-report"),
                  rowsPerPage: this.options.maxItems
               }               
            }
         });

         // Override DataTable function to set custom empty message
         var me = this,
            dataTable = this.widgets.alfrescoDataTable.getDataTable(),
            original_doBeforeLoadData = dataTable.doBeforeLoadData;

         dataTable.doBeforeLoadData = function MyTasks_doBeforeLoadData(sRequest, oResponse, oPayload)
         {
            // Hide the paginator if there are fewer rows than would cause pagination
            if (oResponse.results.length === 0)
            {
               Dom.addClass(this.configs.paginator.getContainerNodes(), "hidden");
            }
            else
            {
               Dom.removeClass(this.configs.paginator.getContainerNodes(), "hidden");
            }

            if (oResponse.results.length === 0)
            {
               oResponse.results.unshift(
               {
                  isInfo: true,
                  title: me.msg("empty.title"),
                  description: me.msg("empty.description")
               });
            }

            return original_doBeforeLoadData.apply(this, arguments);
         };
      }
   }, true);
   
})();
