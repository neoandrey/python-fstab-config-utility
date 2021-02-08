
function compareNames(a, b) {
    // Use toUpperCase() to ignore character casing
    const bandA = a.name.toLowerCase();
    const bandB = b.name.toLowerCase();
  
    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
      comparison = -1;
    }
    return comparison;
  }

  
function getImageDimensions(imageType){
   let  imageDimensions = {width:50,height:50}
   imageType = imageType.toLowerCase()
    console.log('imageType: '+imageType)

   switch(imageType){

      case 'sitelogo':
            imageDimensions.width  = 120;
            imageDimensions.height = 120;       
      break;
      case 'offercampaign':
        imageDimensions.width  = 500;
        imageDimensions.height = 500;       
        break;
      case 'clients':
            imageDimensions.width  = 360;
            imageDimensions.height = 360;       
      break;
      case 'sitesettings':
            imageDimensions.width  = 315;
            imageDimensions.height = 85;       
      break;
      case 'slideritem':
            imageDimensions.width  = 1920;
            imageDimensions.height = 1001;       
      break;
      case 'banner':
        imageDimensions.width  = 1920;
        imageDimensions.height = 1001;       
        break;
    case 'products':
        imageDimensions.width  = 370;
        imageDimensions.height = 350;       
        break;
   }

  return  imageDimensions;

}


 $.fn.getObjectType=function(object) {
    var stringConstructor  = "test".constructor;
    var arrayConstructor   = [].constructor;
    var objectConstructor  = ({}).constructor;
    var booleanConstructor = true.constructor;
    if (object === null) {
        return "null";
    }else  if (object === undefined) {
        return "undefined";
    }else if (object.constructor === stringConstructor) {
        return "string";
    }else if (object.constructor === arrayConstructor) {
        return "array";
    }else if (object.constructor === objectConstructor) {
        return "object";
    }else if (object.constructor === booleanConstructor) {
        return "boolean";
    }else if ((typeof object).toLowerCase() == 'function') {
        return "function";
    }else if ((typeof object).toLowerCase() == 'number') {
        return "number";
    }else if ((typeof object).toLowerCase() == 'bigint') {
        return "bigint";
    }else if ((typeof object).toLowerCase() == 'symbol') {
        return "symbol";
    }else{
        return "unknown";
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
 Object.assign(String.prototype, {
  equalsIgnoreCase(b) {
    // Use toUpperCase() to ignore character casing
    a = this;
    const bandA = a.name.toLowerCase();
    const bandB = b.name.toLowerCase();
  
    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
      comparison = -1;
    }
    return comparison;
       }
  });


 function runIndexedDBQuery (options, callback){

    var currentDB    	 =  options.db?options.db:"csam"
    var queryType    	 =  options.queryType?options.queryType: "get" 
    var storeType    	 =  options.storeType?options.storeType:"string"
    var data         	 =  options.data? options.data:""
	var db           	 =  {}
	var transaction  	 =  {}
	var stringStore  	 =  {}
	var objectDataStore  =  {}
    
    var stringStoreStr   = "stringStore"
    var objectDataStr    = "objDataStore"
	if (!window.indexedDB) {
		window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	 }
	window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

    if (!window.indexedDB) {
        console.log("IndexedDB Error: Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }
    
   var dbExists = false;
   var request =   window.indexedDB.open(currentDB, 7);
   
      request.onupgradeneeded = function(event) {
        db = event.target.result;
        db.onerror = function(event) {
            console.error("IndexedDB Error: " + JSON.stringify(event.target));
            dbExists = true
        };
        var stringStore   = null;
        var objDataStore  = null;

        if(dbExists){
            try{
                db.deleteObjectStore(stringStoreStr)
                db.deleteObjectStore(objectDataStr)
            }catch(e){
                console.log(e.stack)
            }

        }
        stringStore  = db.createObjectStore(stringStoreStr, { keyPath: "name" });
        stringStore.createIndex("name", "name", { unique: true });
        objDataStore = db.createObjectStore(objectDataStr, { keyPath: "name" });
        objDataStore.createIndex("name", "name", { unique: true });
        console.log('object stores created successfully');
        if(callback) callback(null)
    };
    request.onerror = function(event) {
        console.log("IndexedDB Error: "+ event.target.errorCode);
        if(callback)callback(null)
    };
    request.onsuccess = function(event) {
        db = event.target.result;
        db.onerror = function(event) {
            console.error("IndexedDB Error: " + event.target.errorCode);
        };

        transaction       = db.transaction(db.objectStoreNames,"readwrite");
        stringStore       = transaction.objectStore(stringStoreStr);
        objectDataStore   = transaction.objectStore(objectDataStr);

        if(queryType.toLowerCase() =='put'){
            if(data && data.name){
                if(storeType=="string"){
                
                    stringStore.put({name: data.name,data:data});
                
                }else  if (storeType=="object"){
            
                        objectDataStore.put({name: data.name,data:data});
                    
                }
            }
        }else  if(queryType.toLowerCase() == 'get'){
            let  query = {}
            if(storeType=="string"){
                
                query = stringStore.get(data);
            }else  if (storeType=="object"){
                query =   objectDataStore.get(data);
            }
            query.onsuccess = function(){
                let getData = query.result;

                if(!getData){
                    if(callback)  callback(null)
                    return
                    
                } else if(getData && getData.data && getData.data.data){
                    if(callback)  callback(getData.data.data);
                    return
                    
                }   
            }
        } else  if(queryType.toLowerCase() =='del'){

            if(storeType=="string"){
                stringStore.delete(data.name);
            }else  if (storeType=="object"){
                 objectDataStore.delete(data.name);
            }
        }
            transaction.oncomplete = function(){
                db.close();
                return true;
           }

    
    };

}

 $.fn.sessionSet =function (srcName, srcData){
     let       rawData  = {name:srcName,data:srcData }
     return     runIndexedDBQuery({db:"csam", queryType:"put",storeType: "string" , data:rawData });
}
 $.fn.sessionGet =  function(name, callback){
       runIndexedDBQuery({db:"csam", queryType:"get",storeType: "string", data:name },callback)    
}

$.fn.sessionRemove = function (srcName){

    let       rawData  = {name:srcName }
    return     runIndexedDBQuery({db:"csam", queryType:"del",storeType: "string" , data:rawData });

}



function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

 $.fn.replaceAll= function(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function convertToURLQuery(qObject){
	 let queryStr   = [];
	 for (var index in qObject){
		 
		 queryStr.push(index);
		 queryStr.push("=");
		 queryStr.push(qObject[index]);
		 queryStr.push("&");
	 }
	 
	 return queryStr.join("").slice(0,-1)
}

 $.fn.convertURLQueryToObject = function(queryString){
    let queryObj    = {};
    let  tempQuery  =  queryString.split('&')
    for (let i=0;  i<tempQuery.length; i++){
        let queryMap = tempQuery[i].split('=');
        queryObj[queryMap[0]] = queryMap[1]
    }
    
    return queryObj  
}

 $.fn.runPost = function(url, data,callback) {
  
    $.fn.showLoadingDialog('Updating information...');
    $.post(url, data).done(function(rawData) {
            try {

                data = rawData  && $.fn.getObjectType(rawData)=="string"? JSON.parse(rawData):rawData;
                callback(data)
                $.fn.closeDialog()
                
            } catch (e) {
                 console.log(e.stack);
                 $.fn.showMessageDialog('<div align="center">Data Fetch Error</div>', '<div align = "center" color="red">Error fetching data</div>' + e.stack + '<br /><br />' + data);
             }

        });

}; 

  $.fn.runGet = function (url, data,callback) {
   let  isFetchingData = null; 
        isFetchingData =$('#http-fetch-flag').val(); 
       
        if( (isFetchingData=="0" || isFetchingData=="") && data){
                
            $.get(url, data)
                .done(function(rawData) {
                    try {  
                        $('#http-fetch-flag').val( "1"); 
                        if(rawData)  {                  
            
                            data = (typeof rawData==='object')? rawData:JSON.parse(rawData);
                            $('#http-fetch-flag').val( "0");                                 
                            callback(data)
                        }else {
                        callback({});
                        }              
                    } catch (e) {
                        console.log(e.stack);
                        $.fn.showMessageDialog('<div align="center">Data Fetch Error</div>', '<div align = "center" color="red">Error fetching data</div>' + e.stack + '<br /><br />' + data);
                    }

                });
            }else{
                callback({})
            }   
}
  $.fn.showAlert = function(message, alertType){
       //primary,secondary,success, danger, warning, info, light, dark
       message = $.fn.getObjectType(message)=="object"?JSON.stringify(message):message
       message = message?'<div  class="alert alert-'+alertType+'" role="alert">'+message+'</div>':''
       $.fn.showMessageDialog('<div>Alert Message</div>',message);
  }

  $.fn.runSchemaGet = function(url, srcData,callback) {
  let  tableName      =  srcData.qf
  //console.log("$.fn.runSchemaGet_table: "+tableName)
  let  tableSchema    =   tableName.toLowerCase()+"_schema";
  let  resetFlag      =   tableName.toLowerCase()+"_reset_flag";
  let  tableData      =   null;
  let  isFetchingData =   null;

  $.fn.sessionGet(resetFlag,  function(getData){

    var resetFlag = getData;
    $.fn.sessionGet(tableSchema,  function(getData){
           
            tableData =  $.fn.getObjectType(getData) == "string"? JSON.parse(getData):getData;
            isFetchingData = $('#http-fetch-flag').val(); 
            if (isFetchingData=="0"){

            if( !resetFlag || resetFlag=='null'||  (!tableData || (parseInt(resetFlag)==1) )){
                
                try { 
                    //let data = JSON.stringinfy(srcData);
                    $('#http-fetch-flag').val("1"); 
                    $.ajax({
                    async: false,
                    cache: true,
                    timeout: 300,
                    type: 'GET',
                    url: url,
                    data: srcData,
                    error: function(e) {
                        $.fn.showAlert(e,'warning');
                    },
                    success: function(msg){ 
                    // alert("success")
                        }
                
                            })
                
                        .done(function(rawData) {
                            try {
                                if(rawData){

                                        $.fn.sessionSet(tableSchema, JSON.stringify(rawData)); 
                                        $.fn.sessionSet(resetFlag, "0"); 
                                        let data = rawData && $.fn.getObjectType(rawData)=="string" ? JSON.parse(rawData):rawData
                                        $('#http-fetch-flag').val("0"); 
                                        callback(data)
                                }else {
                                        callback({});
                                }          
                            } catch (e) {
                                    console.log(e.stack);
                                    $.fn.showMessageDialog('<div align="center">Data Fetch Error</div>', '<div align = "center" color="red">Error fetching data</div>' + e.stack + '<br /><br />' + JSON.stringify(srcData));
                            }

                        })
                } catch (e) {
                    
                    $.fn.showMessageDialog('<div align="center">Data Fetch Error</div>', '<div align = "center" color="red">Error fetching data</div>' + e.stack + '<br /><br />' +  JSON.stringify(srcData));
                }
            
                }else {
                    callback(tableData);
                }
                        }else{
                            $.fn.showMessageDialog('HTTP process is still  running')

                        }
        
        });
});

}
    function runPost(url, data,callback) {
        console.log('posting data: '+JSON.stringify(data))
        $.post(url, data).done(function(rawData) {
                try {
    
                    data = JSON.parse(rawData);
                    callback(data)
                    
                } catch (e) {
                     console.log(e.stack);
                     $.fn.showMessageDialog('<div align="center">Data Fetch Error</div>', '<div align = "center" color="red">Error fetching data</div>' + e.stack + '<br /><br />' + data);
                }
    
            });
    
    }
function runImagePost(url, data,callback) {
    $.ajax({
        url: url,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        method: 'POST',
        type: 'POST', // For jQuery < 1.9
        success: function(data){
          // alert(data);
        }
    }).done(function(rawData) {
            try {

                data = $.fn.getObjectType(rawData)=="string"?JSON.parse(rawData):rawData;
                callback(data)
                
            } catch (e) {
                 console.log(e.stack);
                 $.fn.showMessageDialog('<div align="center">Data Fetch Error</div>', '<div align = "center" color="red">Error fetching data</div>' + e.stack + '<br /><br />' + data);
                       }

        });

};

function renderImageTo(input, target) {
    input.value = document.querySelector('#fileInput').value;

    if (input.value.toLowerCase().endsWith("jpg") || input.value.toLowerCase().endsWith("jpeg") || input.value.toLowerCase().endsWith("png") || input.value.toLowerCase().endsWith("gif")) {
        input = document.querySelector('#fileInput');
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                $('#' + target).attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }

    } else {

        $.fn.showMessageDialog('<div align="center"><strong>Image upload Error</strong></div>', '<div align = "center" color="red">Error Uploading Image:</div>' + input.value + ' is not an image file<br /><br />');


        input.value = '';

    }

}

function yyyymmddhhmmss (previousDay) {
    var newDate = new Date();
    var curDate = new Date();
    curDate.setDate(newDate.getDate() - previousDay);
    var yyyy = curDate.getFullYear();
    var mm = curDate.getMonth() < 9 ? "0" + (curDate.getMonth() + 1) : (curDate.getMonth() + 1); // getMonth() is zero-based
    var dd = curDate.getDate() < 10 ? "0" + curDate.getDate() : curDate.getDate();
    var hh = curDate.getHours() < 10 ? "0" + curDate.getHours() : curDate.getHours();
    var min = curDate.getMinutes() < 10 ? "0" + curDate.getMinutes() : curDate.getMinutes();
    var ss = curDate.getSeconds() < 10 ? "0" + curDate.getSeconds() : curDate.getSeconds();
    return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat(" ").concat(hh).concat(":").concat(min).concat(":").concat(ss);
}

function previousWeek() {
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return nextweek;
}

$.fn.closeDialog = function () {
    $('#myModal').modal('hide');
    $('#dialog-message-div').show()
    $('#dialog-bttns').html('');
    $('#myModal').modal('hide');
}
  $.fn.editDialog = function(header, message, bttns) {

    if(header) $('#dialog-header-span').html(header)
    if(message)$('#dialog-message-div').html(message)
    if(bttns) $('#dialog-bttns').bttns(bttns);
}

function showDialog (header) {
    let modalOptions = {
        keyboard: false
        ,focus:true    
        ,backdrop:'static'

    }
    var logo = $('#site-logo').val();
    logo = '<span ><img src="' + logo + '" alt="'+$('#site-name').val()+'  Logo" /> <span>';
    header = (header !== '' || header !== null) ? ('<table width="100%"><tr><td  cols="2">' + logo + '</td><td cols="10">' + header + '</td></tr></table>') : '<div >' + logo + ' '+name+' </div>';
    $('#dialog-header-span').html(header);
    $('#dialog-header-span').css('text-align', 'center');
    $('#myModal').modal(modalOptions);
}
 $.fn.showMessageDialog  =function(header, message) {
    let modalOptions = {
        keyboard: false
        ,focus:true    
        ,backdrop:'static'
    }
    let logo = $('#site-logo').val();
    let name = $('#site-name').val()
    logo = '<img src="' + logo + '" alt="'+name+'  Logo" />';
    header = (header !== '' || header !== null) ? ('<table width="100%"><tr><td cols="2">' + logo + '</td><td cols="10">' + header + '</td></tr></table>') : '<div>' + logo + ' '+name+' </div>';
    $('#dialog-header-span').html( header);
    $('#dialog-message-div').html(message);
    $('#dialog-message-div').css('float', 'center');
    $('#dialog-message-div').css('text-align', 'center');
    $('#dialog-bttns').html('<a href="#" type="button" onclick="$.fn.closeDialog()" class="btn btn-info btn" data-dismiss="modal" id="dialog-ok-bttn">OK</a>')
    $('#dialog-close-bttn').show();
    $('#dialog-bttns').hide();
    $('#myModal').modal(modalOptions);
    $('#myModal').show();
} 
function showConfirmDialog  (header, message, callback) {
    let modalOptions = {
        keyboard: false
        ,focus:true    
        ,backdrop:'static'
    }
    let logo = $('#site-logo').val();
    let name = $('#site-name').val();
    $('#dialog-close-bttn').hide();
    logo = '<img src="' + logo + '" alt="'+name+'  Logo" />';
    header = (header !== '' || header !== null) ? ('<table width="100%"><tr><td  cols="2">' + logo + '</td><td cols="10">' + header + '</td></tr></table>') : '<div>' + logo + ' '+name+' </div>';
    $('#dialog-header-span').html( header);
    $('#dialog-message-div').html(message);
    $('#dialog-message-div').css('float', 'center');
    $('#dialog-message-div').css('text-align', 'center');
    
    $('#dialog-bttns').html('<button class="btn btn-large btn-danger btn-lg" onclick="$(\'#is-confirmed\').val(0); $.fn.closeDialog();" id="dialog-no-bttn">No</button><button class="btn btn-large btn-success btn-lg" onclick="$.fn.closeDialog(); '+callback+'; " id="dialog-yes-bttn">Yes</button>')
    $('#dialog-bttns').show();
    $('#dialog-close-bttn').hide();
    $('#myModal').modal(modalOptions);
    $('#myModal').show();
} 
 $.fn.showDialogBeforeUpdate = function (header, message, callback) {
    let modalOptions = {
        keyboard: false
        ,focus:true    
        ,backdrop:'static'
    }
    let logo = $('#site-logo').val();
    let name = $('#site-name').val();
    $('#dialog-close-bttn').hide();
    logo = '<img src="' + logo + '" alt="'+name+'  Logo" />';
    header = (header !== '' || header !== null) ? ('<table width="100%"><tr><td  cols="2">' + logo + '</td><td cols="10">' + header + '</td></tr></table>') : '<div>' + logo + ' '+name+' </div>';
    $('#dialog-header-span').html( header);
    $('#dialog-message-div').html(message);
    $('#dialog-message-div').css('float', 'center');
    $('#dialog-message-div').css('text-align', 'center');
    
    $('#dialog-bttns').html('<button class="btn btn-large btn-success btn-lg" onclick="$.fn.closeDialog(); ('+callback+')(); " id="dialog-yes-bttn">OK</button>')
    $('#dialog-bttns').show();
    $('#dialog-close-bttn').hide();
    $('#myModal').modal(modalOptions);
    $('#myModal').show();
} 

$.fn.showLoadingDialog = function (header) {
    $('#dialog-message-div').html('<div align="center"><img src="static/images/ajax-loaders/ajax-loader-6.gif" title="ajax-loader"></div>');
    $('#dialog-message-div').show()
    $('#dialog-bttns').html('');
    $('#dialog-close-bttn').hide();
    showDialog(header);
}
 $.fn.getDataFromID= function(tableName, data, idField, id, callback) {
    console.log(tableName)
    console.log(data)
    console.log(idField)
    console.log(id)
    var filteredRecord = {}
    if($.fn.getObjectType(data) ==  "array"){
     filteredRecord = data.filter(function(itm) {
            return itm[idField] == id;
        });
    }else{

        callback(data);
    }

    callback(filteredRecord[0]);
}

function datePrevDaysfromNow(previousDay) {
    var newDate = new Date();
    var curDate = new Date();
    curDate.setDate(newDate.getDate() - previousDay);
    var yyyy = curDate.getFullYear();
    var mm = curDate.getMonth() < 9 ? "0" + (curDate.getMonth() + 1) : (curDate.getMonth() + 1); // getMonth() is zero-based
    var dd = curDate.getDate() < 10 ? "0" + curDate.getDate() : curDate.getDate();
    var hh = curDate.getHours() < 10 ? "0" + curDate.getHours() : curDate.getHours();
    var min = curDate.getMinutes() < 10 ? "0" + curDate.getMinutes() : curDate.getMinutes();
    var ss = curDate.getSeconds() < 10 ? "0" + curDate.getSeconds() : curDate.getSeconds();
    return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat(" ").concat(hh).concat(":").concat(min).concat(":").concat(ss);
}

function getDate() {
    return datePrevDaysfromNow(0);
}
 $.fn.addSpaceBeforeEachCapital =function(word){

    return word.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function addHyphenBeforeEachCapital (word){

    return word.replace(/([a-z])([A-Z])/g, '$1-$2');
}

  $.fn.capitalizeFirstLetter=function  (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};



function isAlphabetic(field) {

    var letters = /^[A-Za-z]+$/;
    if (field.match(letters)) {
        return true;
    } else {

        //showAlert('Username must have alphabet characters only');
        return false;
    }

}

function isValidPage(field) {

    var letters = /^\w+\s*[\-]*\w+\s*$/;
    if (field.match(letters)) {
        return true;
    } else {

        //showAlert('Username must have alphabet characters only');
        return false;
    }

}

function isValidIPAddress(field){
  var  ips = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (field.match(ips)) {
        return true;
    } else {
        return false;
    }
}

function isValidPhoneNumber(field) {
    //var phoneNoformat =  /^[\+]?\(?([0-9]{3})\)?([\-.,\s ])?([0-9]{3})([\-.,\s ])?([\-., \s])?([0-9]{3})([\-.,\s ])?([0-9]{4})$/;
    var phoneNoformat = /^[\+]?[\(]?[\d]+[\)[\s*\-?\s*\d+\s*\-?\s*\d]+[\s]*$/g;

    if (field.match(phoneNoformat)) {
        return true;
    } else {

        return false;
    }
    return false;
}

function isAlphanumeric(field) {

    var letters = /^[0-9a-zA-Z,\s]+$/m;
    if (field.match(letters)) {
        return true;
    } else {

        //showAlert('User address must have alphanumeric characters only');
        return false;
    }


}

function isAlphanumSpecial(field) {

    //var specialChars = /^[!,\",£,$,%,^,&,(,), [\+],[\-],@,~,#,<,>,|]*/m;
    //var data = /^[0-9a-zA-Z,\s]([\-]?[0-9a-zA-Z,\s])*$/m;
    // showAlert(field
    var data = /^[0-9,a-z,A-Z,!,£,$,%,^,&,(,),@,~,#,<,>,|,.,\s,:,/,;,\[,\]]+[\+]*[\-]*[0-9,a-z,A-Z,!,£,$,%,^,&,(,),@,~,_,#,<,>,|,.,\s,:,/,;,\[,\]]*$/m;
    if (field.match(data)) {
        return true;
    } else {
        //showAlert('User address must have alphanumeric characters only');
        return false;
    }


}

function isValidPass(field) {

    if (isNumeric(field)) return false;
    if (isAlphabetic(field)) return false;
    if (isAlphanumSpecial(field)) {

        return true;

    } else return false;
}

function isNumeric(field) {

    var numbers = /^[\d,\d.\d]+$/m;
    if (field.match(numbers)) {
        return true;
    } else {
        //showAlert('ZIP code must have numeric characters only');
        //field.focus();
        return false;
    }
}

function isValidPrice(field) {
    var numbers = /^[0-9]*(\.)?([0-9]{2})+$/m;
    if (field.match(numbers)) {
        return true;
    } else {
        //showAlert('ZIP code must have numeric characters only');
        field.focus();
        return false;
    }
}

function isValidEmail(field) {

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (field.match(mailformat)) {
        return true;
    } else {
        //showAlert("You have entered an invalid email address!");
        return false;
    }
}

function trimString(string) {
    return string.replace(/^\s+|\s+$/g, "");
}

function isValidEmailSet(field, name) {

    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var emailAddressSet = field;
    var addressees = emailAddressSet.split(';');
    var i = 0;
    var invalidAddresses = "";
    var tempAddy = "";
    for (i = 0; i < addressees.length; i++) {
        tempAddy = addressees[i].trim();

        if (tempAddy.length !== 0)

            if (!addressees[i].match(mailformat)) {
            if (invalidAddresses.length === 0) invalidAddresses += addressees[i];
            else invalidAddresses += ", " + addressees[i];
        }
    }


    if (invalidAddresses.length !== 0) {

        $.fn.showAlert('The list below shows the addresses in the \"' + name + '\" field which are not valid: \n ' + invalidAddresses,'danger');
        return false;
    } else {

        return true;
    }
}

function isValidDate(fld) {
    var mo, day, yr;
    var entry = fld.value.substring(0, 10);
    entry = entry.substring(8, 10) + '/' + entry.substring(5, 7) + '/' + entry.substring(0, 4);
    var reLong = /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/;
    var reShort = /\b\d{2}[\/-]\d{1,2}[\/-]\d{1,4}\b/;
    var valid = (reLong.test(entry)) || (reShort.test(entry));
    if (valid) {
        var delimChar = (entry.indexOf("/") !== -1) ? "/" : "-";
        var delim1 = entry.indexOf(delimChar);
        var delim2 = entry.lastIndexOf(delimChar);
        //        yr = parseInt(entry.substring(0, delim1), 10);
        //        mo = parseInt(entry.substring(delim1+1, delim2), 10);
        //        day = parseInt(entry.substring(delim2+1), 10);
        day = parseInt(entry.substring(0, delim1), 10);
        mo = parseInt(entry.substring(delim1 + 1, delim2), 10);
        yr = parseInt(entry.substring(delim2 + 1), 10);
        // handle two-digit year
        if (yr < 100) {
            var today = new Date();
            // get current century floor (e.g., 2000)
            var currCent = parseInt(today.getFullYear() / 100) * 100;
            // two digits up to this year + 15 expands to current century
            var threshold = (today.getFullYear() + 15) - currCent;
            if (yr > threshold) {
                yr += currCent - 100;
            } else {
                yr += currCent;
            }
        }
        var testDate = new Date(yr, mo - 1, day);
        if (testDate.getDate() === day) {
            if (testDate.getMonth() + 1 === mo) {
                if (testDate.getFullYear() === yr) {
                    // fill field with database-friendly format
                    // fld.value = mo + "/" + day + "/" + yr;
                    return true;
                } else {
                    $.fn.showDialog("There is a problem with the year entry.");
                }
            } else {
                $.fn.showDialog("There is a problem with the month entry.");
            }
        } else {
            $.fn.showDialog("There is a problem with the date entry.");
        }
    } else {
        $.fn.showDialog("Incorrect date format. Enter as mm/dd/yyyy.");
    }
    return false;
}


function udpdatePageHeader (options){
    let header = `<div class="container-fluid">
            <div class="row mb-2">
            <div class="col-sm-6">
                <h1>`+options.mainPage+`</h1>
            </div>
            <div class="col-sm-6">
                <ol class="breadcrumb float-sm-right">
                <li class="breadcrumb-item"><a href="#">`+options.mainPage+`</a></li>
                <li class="breadcrumb-item active">`+options.subPage+`</li>
                </ol>
            </div>
            </div>
        </div>`
    $('#page-header').html(header);
    
}

$.fn.showConfirmDialog =function(header, message, callback) {
    header = '<span align="center" style="font-weight:bold; font-size:20px;float: center;">' + header + '</span>';
    $('#dialog-message-div').html('<span>' + message + '</span>');
    //$('#submit-form-loader').hide();
    $('#dialog-bttns').html('<div align="center"><button class="btn btn-large btn-danger btn-lg" onclick=" $.fn.closeDialog();" id="dialog-no-bttn">No</button><button class="btn btn-large btn-success btn-lg" onclick="'+callback+'" id="dialog-yes-bttn">Yes</button></div>');
    $('#dialog-bttns').show();
    let modalOptions = {
        keyboard: false
        ,focus:true    
        ,backdrop:'static'

    }
    var logo = $('#site-logo').val();
    logo = '<span ><img src="' + logo + '" alt="'+$('#site-name').val()+'  Logo" /> <span>';
    header = (header !== '' || header !== null) ? ('<table width="100%"><tr><td  cols="2">' + logo + '</td><td cols="10">' + header + '</td></tr></table>') : '<div >' + logo + ' '+name+' </div>';
    $('#dialog-header-span').html(header);
    $('#dialog-header-span').css('text-align', 'center');
    $('#dialog-close-bttn').hide()
    $('#myModal').modal(modalOptions);
}

$.fn.confirmFormSubmitDialog =function(header, message, id) {
    header = '<span class="center-text" style="font-weight:bold; font-size:20px;float: center;">' + header + '</span>';
    $('#dialog-message-div').html('<strong>' + message + '</strong>');
    //$('#submit-form-loader').hide();
    $('#dialog-bttns').html('<div class="center-text"><button class="btn btn-large btn-danger btn-lg" onclick=" $.fn.closeDialog();" id="dialog-no-bttn">No</button><button class="btn btn-large btn-success btn-lg" onclick="$.fn.submitForm(\'' + id + '\',\'' + id + '_form_elements\')" id="dialog-yes-bttn">Yes</button></div>');
    $('#dialog-bttns').show();
    let modalOptions = {
        keyboard: false
        ,focus:true    
        ,backdrop:'static'
    }  
    var logo = $('#site-logo').val();
    logo = '<span ><img src="' + logo + '" alt="'+$('#site-name').val()+'  Logo" /> <span>';
    header = (header !== '' || header !== null) ? ('<table width="100%"><tr><td  cols="2">' + logo + '</td><td cols="10">' + header + '</td></tr></table>') : '<div >' + logo + ' '+name+' </div>';
    $('#dialog-header-span').html(header);
    $('#dialog-close-bttn').hide();
    $('#dialog-header-span').css('text-align', 'center');
    $('#myModal').modal(modalOptions);
};


    function prepareFormElement  (elementOpts){
        return  Object.assign(elementOpts, {
              name: elementOpts.name,
              type: elementOpts.type?elementOpts.type:'text',
              validation:  elementOpts.validation?elementOpts.validation:'alphanumspecial',
              id: addHyphenBeforeEachCapital($.fn.capitalizeFirstLetter(elementOpts.name)),
              editable: elementOpts.editable?elementOpts.editable:false,
              value:  elementOpts.value?elementOpts.value:"",
              class: elementOpts.class?elementOpts.class:"input focused",
              alternativeValues: elementOpts.alternativeValues?elementOpts.alternativeValues:[],
              chosenValue:elementOpts.chosenValue?elementOpts.chosenValue: "",
              errorMessage: elementOpts.errorMessage?elementOpts.errorMessage: "",
              valueMap: elementOpts.valueMap?elementOpts.valueMap: "",
              data: elementOpts.data?elementOpts.data: new Array(),
              dataCount:elementOpts.dataCount?elementOpts.dataCount: 0,
              size: elementOpts.size?elementOpts.size: 0,
              displayName: $.fn.addSpaceBeforeEachCapital($.fn.capitalizeFirstLetter(elementOpts.name).trim())
          });
      };

$.fn.ajaxFormSubmit = function(formTarget, formInputs, nextPage, callback) {
    $('#submit-bttn').hide();
    $('#submit-form-loader').show();
    var isFormDataValid = document.getElementById('is-form-data-valid').value;
    var response = "";
    var targetComps = formTarget.split('_');
    var tempEntStore = targetComps[0].split('/');
    var entity = tempEntStore[(tempEntStore.length - 1)];
    var xmlhttp = null;


    if (isFormDataValid === 'YES') {
      //  console.log("uri: "+formTarget);
        console.log(formInputs)
        if(formInputs['qf']){
            let inputFields = formInputs['qf'].split(':');
            for (let i=0; i<inputFields.length; i++ ){
                  
                if(i % 2== 0){
                    let  original  =  inputFields[i]
                    inputFields[i] =  inputFields[i].replaceAll(",","");
                    inputFields[i] =  inputFields[i].replaceAll("'",'"');
                    formInputs['qf'] = formInputs['qf'].replaceAll(original,inputFields[i])
                }
            }

            
        }
        $.fn.runPost(formTarget,formInputs,function(response) {
           
            if (response) {

                var respInt         = response.isSuccessful ? 1 : 0; // parseInt(response);
                var siteName        = $('#site-name').val();
                var message         = response.message;
                var error           = response.error;
                var collectionName  = response.model;
                var headerStr       = response.header; // mode == 1 ? capitalizeFirstLetter(collectionName) + " Successfully Updated" : " 1 Item Successfully Added to " + collectionName;

                if(!error){

                    if (respInt === 1) { 

                        $.fn.sessionSet(collectionName + "_reset_flag", "1");
                        $.fn.emit('datachanged', response);       

                        message = error? message+'<br /><div style="color:red">error: <br />'+error+'</div>':message;
                        //$.fn.showDialogBeforeUpdate (headerStr,message, '$.fn.updateCurrentTable()');
                    // $.fn.showMessageDialog(headerStr,message);
                        $('#submit-form-loader').hide();
                     }
                 } else{
                    $('#submit-form-loader').hide();
                    $.fn.showMessageDialog(headerStr,message);
                    let  currentItem = $('#current-item').val().toLowerCase()

                }
        }

        if(callback)callback();
    });

    }
}