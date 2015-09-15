// <import resource="classpath:alfresco/site-webscripts/org/alfresco/components/workflow/filter/filter.lib.js">

var groups = null;
var userId = user.id;

function userHasGroup(group) {
	if (groups==null) {
		groups = [];
		var result = remote.call("/api/people/" + stringUtils.urlEncode(userId) + "?groups=true");
		if (result.status == 200) {
			var user = eval('(' + result + ')');
	      	groups = user.groups;
		}
	}
	
    for (i=0; i < groups.length; i++) {
    	if (groups[i].itemName == group) return true;
	}
	return false;
}

/**
 * Parses the config file and returns an object model of the filters
 */
function getFilters()
{
   var myConfig = new XML(config.script),
      filterParameters = [];
   for each(var xmlFilter in myConfig..filter)
   {
	   var group = xmlFilter.@group.toString();
	   if (group=="*" || userHasGroup(group)) {
	      filterParameters.push({
	         id: xmlFilter.@id.toString(),
	         data: xmlFilter.@data.toString(),
	         label: xmlFilter.@label.toString()
	      });
	   }
   }
   return filterParameters;
}



model.filters = getFilters();