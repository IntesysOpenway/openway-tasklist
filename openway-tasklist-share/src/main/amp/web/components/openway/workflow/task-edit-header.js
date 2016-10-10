(function() {
	
	var Dom = YAHOO.util.Dom,
		Event = YAHOO.util.Event,
		Selector = YAHOO.util.Selector;

	YAHOO.lang.augmentObject(Alfresco.component.TaskEditHeader.prototype,
		{

	      /**
	       * Event handler called when the "taskDetailedData" event is received
	       *
	       * @method: onTaskDetailedData
	       */
	      onTaskDetailedData: function TEH_onTaskDetailedData(layer, args)
	      {
	         var task = args[1];

	         // Save task id so we can use it when invoking actions later
	         this.taskId = task.id;

	         // Save the referrer value
	         this.referrerValue = Alfresco.util.getQueryStringParameter('referrer');

	         // Display actions and create yui buttons
	         Selector.query("h1 span", this.id, true).innerHTML = $html(task.title);

	         // ALF-13115 fix, inform user that this task has been completed
	         if (!task.isEditable)
	         {
	            Alfresco.util.PopupManager.displayMessage(
	            {
	               text: this.msg("message.task.completed"),
	               displayTime: 2
	            });

	            YAHOO.lang.later(2000, this, function()
	            {
	               // Check referrer and fall back to user dashboard if unavailable.
	               if(this.referrerValue) {
	                   if(this.referrerValue == 'tasks') {
	                      document.location.href = $siteURL("iopenway-my-tasks");
	                   } else if(this.referrerValue='workflows') {
	                      document.location.href = $siteURL("my-workflows");
	                   }
	                } else {
	                   document.location.href = this.getSiteDefaultUrl() || Alfresco.constants.URL_CONTEXT;
	               }
	            }, []);
	         }

	         if (task.isReassignable)
	         {
	            // Task is reassignable
	            this.widgets.reassignButton = Alfresco.util.createYUIButton(this, "reassign", this.onReassignButtonClick);
	            Dom.removeClass(Selector.query(".actions .reassign", this.id), "hidden");
	         }
	         
	         if (task.isClaimable)
	         {
	            // Task is claimable
	            this.widgets.claimButton = Alfresco.util.createYUIButton(this, "claim", this.onClaimButtonClick);
	            Dom.removeClass(Selector.query(".actions .claim", this.id), "hidden");
	            Dom.removeClass(Selector.query(".unassigned-message", this.id), "hidden");
	         }
	         
	         if (task.isReleasable)
	         {
	            // Task is releasable
	            this.widgets.releaseButton = Alfresco.util.createYUIButton(this, "release", this.onReleaseButtonClick);
	            Dom.removeClass(Selector.query(".actions .release", this.id), "hidden");
	         }
	      }

		}, true);
})();