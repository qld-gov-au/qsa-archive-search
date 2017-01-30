/* JS file for order online form.
sqlQuery() :- Queries and get details from dataset.
getParameterByName() :- Extracts the details from url by name.
getRecordIdValue()	:- For getting the record id from the url.
getResIdValue()		:- For getting the resource id from the url.
Version: V1.0
Date: 18/01/2016
*/

var  getDetails= (function() {
	var factory = {}
	var getDetQuery="";
	var getFinalQuery="";
	var dataObj = "";

    var strDataUrl = 'https://data.qld.gov.au/api/action/datastore_search_sql?sql=';
	factory.sqlQuery = function(itemId, resourceId,successCallback,errorCallback){
		if(itemId != "" && itemId != null && resourceId != "" && resourceId != ""){
			getDetQuery = 'SELECT * FROM ' + '"'+resourceId+'"'+' WHERE _id='+itemId;
			getFinalQuery = strDataUrl + getDetQuery; 
			$.ajax({
			url: getFinalQuery,
	  		data: {},
	  		dataType: 'json',
		    success: successCallback,
	  		error: errorCallback
			});
		}	
	}
	factory.getParameterByName = function(name,url){
		if (!url) {
	      url = window.location.href;
	    }
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	}
	factory.getRecordIdValue = function(){
	var recordId = getDetails.getParameterByName('_id');
      if(recordId!="" && recordId!=null){
        recordId = recordId.trim();
      }
      return recordId;
	}
	factory.getResIdValue = function(){
	var selResourceId = getDetails.getParameterByName('resource_id');
      if(selResourceId!="" && selResourceId!=null){
        selResourceId = selResourceId.trim();
      }
      return selResourceId;
	}

	return factory;
})();



