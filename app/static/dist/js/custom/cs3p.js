

import Table from './Table.js';
import FormElement from './FormElement.js';
import Serializer from './Serializer.js';
import FormValidator from './FormValidator.js';
import Form from './Form.js';

$.fn.emit = function(msg,data){
    //console.log('socket: ')       
    //console.dir( $.fn.socket) 
    //console.log(msg);
    //console.log(data)   
    $('#current-item-type').val('table')
    $.fn.socket.emit(msg, data); 
            
}
$.fn.drawSidebar =  function(){

    let paramString     = 'c=sidebarheader&qt=sel&df=table';
    $.fn.runGet('/main/data',paramString, function(data){
         let sidebarHeader = []
         let headers = $.fn.getObjectType(data)=="string"?JSON.parse(data):data;
        //$.fn.showAlert( headers);
         sidebarHeader.push(`<div class="col-sm-2 col-lg-2"> <div class="sidebar-nav"><div class="nav-canvas"><div class="nav-sm nav nav-stacked"> </div><ul class="nav nav-pills nav-stacked main-menu">`);
         if  (parseInt(headers.dataCount) >0) {       
                for (let header of headers.tabData){
                    header = $.fn.getObjectType(header)=="string"?JSON.parse(header):header;
                    //console.dir(header)
                    sidebarHeader.push(`<li class="nav-header" id="${header.elementID}">${header.label}</li>`);
                        for (let j in header.menus){
                            let menu = header.menus[j];
                            menu = $.fn.getObjectType(menu)=="string"?JSON.parse(menu):menu;
                        if (menu.hasSubMenu){
                            sidebarHeader.push(`<li class="accordion" id="${menu.elementID}"><a href="${menu.href}"><i class="glyphicon glyphicon-plus"></i><span>${menu.label}</span></a>`);
                            sidebarHeader.push(`<ul class="nav nav-pills nav-stacked">`)
                            for (let  i in menu.subMenus){
                                let  subMenu = menu.subMenus[i];
                                subMenu = $.fn.getObjectType(subMenu)=="string"?JSON.parse(subMenu):subMenu;
                                let funcName =  (subMenu.elementID.replaceAll("-",""))
                                funcName     =  funcName+"();"
                                sidebarHeader.push(`<li id="${subMenu.elementID}"><a href="${subMenu.href}" onclick="${funcName}">${subMenu.label}</a></li>`);
                                }
                            sidebarHeader.push(`</ul></li>`)
                        
                        }else{
                            let functionName = menu.elementID.replaceAll('-','')+"();"
                            sidebarHeader.push(`<li id="${menu.elementID}"><a class="${menu.elementClass}" href="${menu.href}" onclick="${functionName}"><i class="${menu.iconClass}"></i><span> ${menu.label}</span></a></li>`);
                        }
                    }
                }     
            sidebarHeader.push(`</ul> <label id="for-is-ajax" for="is-ajax"><input id="is-ajax" type="checkbox">lock</label></div></div></div>`);
            $("#sidebar").html(sidebarHeader.join(''));
            $.fn.refreshCharisma();
        }
    
    
    });
    
    }
    
$.fn.getExcludedColumnList = function (table, type){
    table = table.toLowerCase();
        if (type== 'table'){
            switch(table){
                case 'vcenters':
                    return  ['_id','password','productLine', 'creationdate','username','port']
                break;
                case 'teams':
                    return  ['_id', 'creationdate']
                case 'audittrail':
                    return  [ 'oldData', 'newData']
                break;
                case 'sitesettings':
                    return ['ldapUser','ldapPassword','emailUser','emailPassword', 'lastModifiedDate']
                default:
                    return ['_id']

            }
        } else if (type== 'form'){
            switch(table){
                case 'vcenters':
                    return  ['_id']
                break;
                default:
                    return ['_id']

            }

}

}
$.fn.getFormData =function (opts){
   // alert(JSON.stringify(opts))
		
    let  currentItem = $('#current-item').val();
    udpdatePageHeader({'mainPage':currentItem, 'subPage':'New'});  
    $("#page-content").hide();
    $("#table-content").hide();
    $("#form-content").show();
    $("#form-div").html('<div style="text-align:center"> <img src="static/images/ajax-loaders/ajax-loader-6.gif" /> </div>');
    $("#form-title").html(currentItem+": Provide details for new record");

    let currentTable 	= opts.currentTable?opts.currentTable.toLowerCase():'';
    let tableIDField 	= opts.tableIDField?opts.tableIDField:'';
    let id 		 	    = opts.id?opts.id:'';
    let formName     	= opts.formName?opts.formName:''
    let dataType     	= opts.dataType?opts.dataType:''
    let recordInd       = opts.recordInd? opts.recordInd:-1;  
    if (opts.resetFlag ==1){
        $.fn.sessionSet(currentTable.toLowerCase()+"_reset_flag",'1')
    }

    $.fn.runSchemaGet('/main/schema',{qf:currentTable},function(tData){
        //console.log('line 66: form Schema Data');
        //console.dir(tData);      
        tData                       = (typeof tData).toLowerCase() =='object'?tData:JSON.parse(tData)           
        let options                 = {};
        let pryKey                  = tData && tData['idField']? tData['idField']: opts.tableIDField;
        let fieldID                 = $.fn.capitalizeFirstLetter(currentTable);
        options.access              =  opts.access;//   recordInd!= -1 ?'edit':'new';
        options.parentPage          = '';
        options.currentPage         = currentTable;
        options.currentItem         = currentTable;
        options.tableID             = currentTable;
        options.presentData         = '<table id="' + options.tableID + '"></table>';
        options.tableName           = currentTable;
        options.sourceUrl           = '/main/data';
        options.idColumn            = pryKey; 
        options.formDetails         = '';
        options.elementList         = new Array();
        options.resetFlag           =  0;
        options.tagID               = 'form-div';
        options.sectionIDCol        = '';
        options.editMode            =  opts.isEditable;
        options.recordID            =  recordInd;
        options.class               =  ''
        options.encType             = opts.encType?opts.encType:'multipart/form-data'
        options.id                  =  currentTable//tData['idField'];
        options.name                = ''
        options.method              = 'post'
        options.action              =  '/main/data'
        options.type                =  recordInd >0 ?'existing':'new'
        options.dataType            =  dataType
        options.nextPageUrl         =  '' 
        options.resetFlag           = opts.resetFlag?opts.resetFlag:0
        options.allFields           = tData[currentTable]
        options.excludedColList     = opts.excludedColList?opts.excludedColList:['_id'];
        options.headerTitle         = opts.access=="view"?currentTable+': Details of record '+recordInd: `${currentItem}: New Entry Creation Form`
        options.primaryKey          = tData['idField'];
        options.columns             = tData[currentTable];
        options.serialCount         = tData['sc']
        
        $.fn.getFormElementList ({'serialCount':options.serialCount,'tableName':currentTable,'cols':tData[currentTable.toLowerCase()],'excludedCols': options.excludedColList  ,'recordInd':recordInd, 'access':opts.access, 'order':tData['order'], 'callback':function(eleList){
            options.elementList     = eleList;

            $.fn.drawForm(options);
        }} );
});
}

$.fn.viewEntry = function(recordInd) {

  $('#current-item-type').val('form')
  recordInd = parseInt(recordInd);

  let tableContents = $('#current-item').val().toLowerCase();

  let resetFlag = tableContents+'_reset_flag'

  var options  = {};
  options.access              = 'view' //!isEditable ? 'view' : 'edit';
  options.parentPage          = 'Settings';
  options.sourceUrl           = '/main/data';
  options.encType             = 'application/x-www-form-urlencoded'
  options.method              = 'post'
  options.action              =  '/main/data'
  options.editMode            =  0;
  options.recordID            = recordInd;
  options.class               = ''
  options.nextPageUrl         = '' 
  options.type                = recordInd >0 ?'existing':'new'
  options.tagID               = 'form-div';

  $.fn.sessionGet(resetFlag,  function(getData){
    options.resetFlag =getData
    if (tableContents === 'vcenters') {

        $.fn.getFormData({
         currentTable :'VCenters'
        , tableIDField :'_id'
        ,id:'vcenters-form'
        ,formName:'vcenter_mode'
        ,dataType :'vcenters'
        ,recordInd: recordInd
        ,access: 'view'
        ,enctype:'application/x-www-form-urlencoded'
        ,excludedColList:  $.fn.getExcludedColumnList('vcenters', 'form')
        ,options:{isEditable:true, isViewable:true, isIndelible: true}
        , resetFlag:1
        });

    }  else if (tableContents === 'teams') {

        $.fn.getFormData({
         currentTable :'Teams'
        , tableIDField :'_id'
        ,id:'teams-form'
        ,formName:'teams_mode'
        ,dataType :'teams'
        ,recordInd: recordInd
        ,access: 'view'
        ,enctype:'application/x-www-form-urlencoded'
        ,excludedColList: $.fn.getExcludedColumnList('teams', 'form')
        ,options:{isEditable:true, isViewable:true, isIndelible: true}
        });

    } else if (tableContents === 'audittrail') {
        $.fn.getFormData({
         currentTable :'AuditTrail'
        ,tableIDField :'_id'
        ,id:'audittrail-form'
        ,formName:'audittrail_mode'
        ,dataType :'audittrail'
        ,recordInd: recordInd
        ,access: 'view'
        ,enctype:'application/x-www-form-urlencoded'
        ,excludedColList: []
        ,options:{isEditable:false, isViewable:true, isIndelible: false}
        ,resetFlag: 1
        });
    }else if (tableContents === 'sitesettings') {
        $.fn.getFormData({
         currentTable :'SiteSettings'
        ,tableIDField :'_id'
        ,id:'sitesettings-form'
        ,formName:'sitesettings_mode'
        ,dataType :'sitesettings'
        ,recordInd: recordInd
        ,access: 'view'
        ,enctype:'multipart/form-data'
        ,excludedColList: $.fn.getExcludedColumnList('sitesettings','form')
        ,options:{isEditable:true, isViewable:true, isIndelible: true}
        ,resetFlag: 1
        });
    } else if (tableContents === 'images') {
        $.fn.getFormData({
         currentTable :'Images'
        ,tableIDField :'_id'
        ,id:'images-form'
        ,formName:'images_mode'
        ,dataType :'images'
        ,recordInd: recordInd
        ,access: 'view'
        ,enctype:'multipart/form-data'
        ,excludedColList: $.fn.getExcludedColumnList('images','form')
        ,options:{isEditable:true, isViewable:true, isIndelible: true}
        ,resetFlag: 1
        });
    } 
});
};


$.fn.updateCurrentTable = function(){
    try{   
                         
        var  currentItemType            = ($('#current-item-type').val()).toLowerCase();
        var  currentItem                = ($('#current-item').val()).toLowerCase()
        var  currentItemCreateInfo      = ($('#current-item').val()).toLowerCase()+"_create_info";

        $.fn.sessionGet(currentItemCreateInfo,function(options){
            options     = $.fn.getObjectType(options)=="string"?JSON.parse(options):options;
            options =  Object.assign(options,{currentTable:currentItem
                ,header:  currentItem+' Records'
                ,tableID: currentItem+'-table-data'
                ,tableIDField :'_id'
               ,id:currentItem+'-form'
               ,tableName:currentItem
               ,dataType :currentItem
               ,excludedColList:$.fn.getExcludedColumnList(currentItem, 'table')
               ,parentID: 'table-tag-div'
               ,changeable:true
               ,mainPage: 'Settings'
               ,subPage: currentItem
               ,currentTable: currentItem
               ,options: {isEditable:true, isViewable:true, isIndelible: false}
               });
           // console.log('Table data')
            //console.dir(options)
            if(options ) {     
                $.fn.sessionSet(currentItem+'_reset_flag',1);  
                $.fn.getTableData(options);  
            }						
          						
        });
  
      }catch(e){
        console.log(e.stackTrace)
      }
}



$.fn.drawTable = function (options){
     try{
      new  Table(options);
      $.fn.closeDialog();
    }catch(e){
        console.log(e.stack)
    }
}


$.fn.drawForm = function (options){

    try{
             new  Form(options);
            $.fn.closeDialog();
    }catch(e){
        console.log(e.stack)
    }
    };

 $.fn.getFormElementList = function(opts) {
       
        let tableName           = opts.tableName
        let cols                = opts.cols
        let excludedCols        = opts.excludedCols
        let recordInd           = opts.recordInd
        let access              = opts.access
        let callback            = opts.callback
        let serialCount         = opts.serialCount
        let  order              = opts.order
        let  rawElementList     = [];
        let  elementList        = [];
        let  rawData            =   null;
   

        $.fn.sessionGet(tableName.toLowerCase(), function(getData){
            rawData                 =  getData?getData:null;
            let  responseData       =  $.fn.getObjectType(rawData)=="string"? JSON.parse(rawData):rawData;

            let  tableColumns       =  Object.keys(cols);
            let  displayColumns     =  Object.values(cols);
            let  tableData          =  (responseData && responseData.tabData) ? responseData.tabData :[];
            let  pauseCallback      =  false;

            let  rowKey  = {}
            let objKeys = rawData? Object.keys(rawData):0;
            let dataKey = objKeys.length >1?objKeys[0]:objKeys

            for (let i of tableColumns){
                let  skipElement      =  false;
                let formElement = {};
                formElement['name']   =  i;
                formElement['displayName']   =  displayColumns[i];

              if(excludedCols.indexOf(formElement['name'].toLowerCase())<0){
                    console.log(`key: ${dataKey}`)
                   // console.log(tableData[dataKey][i]);
                    formElement['value']    =  recordInd >0 && tableData[dataKey] &&  tableData[dataKey][i]? tableData[dataKey][i]:null;
                    formElement['val']      =  formElement['value'];
                    if(formElement['name'].toLowerCase().indexOf('password')> -1){
                        formElement['info'] = serialCount
                    }
    
                    let formData               =  $.fn.formatFormField(formElement,skipElement, pauseCallback, access);
                    formElement                =  formData['formElement']
                    skipElement                =  formData['skipElement']
                    pauseCallback              =  formData['pauseCallback']
                    formElement['isFormatted'] = true;
                    if(!skipElement) rawElementList.push(new FormElement(prepareFormElement(formElement)));
                }
            }
            rawElementList.map(function(x){ 
                let index = order.indexOf(x.name);   
                elementList[index]=x 
            });
 
            // elementList.sort(compareNames);
            console.dir(elementList)
            
           if(!pauseCallback) callback (elementList);
      });    
     }

$.fn.formatFormField =  function(formElement, skipElement, pauseCallback, access){
    let  formData =  {}
   
       
    if ((formElement['name'].toLowerCase().endsWith("id")||formElement['name'].toLowerCase()==("currencymap")||formElement['name'].toLowerCase()==("currencysymbol") ) && formElement['name'].toLowerCase().indexOf("image") == -1){
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = false
        formElement['validation']           = 'nocheck'
        formElement['displayName']          = formElement['name'].toUpperCase().replace('_','')
        formElement['value']                = !formElement['value']   && formElement['name'].toLowerCase()==("currencysymbol")?'#8358;': formElement['value']  
        formElement['value']                = !formElement['value']   && formElement['name'].toLowerCase()==("currencymap")?"{'Naira':'&#8358;'}": formElement['value']  
   
    } else if(formElement['name'].toLowerCase()==('favorites' )){
        formElement['outerDivClass']        = "form-group";
        formElement['editable']             =  access=='view'?false:true;
        formElement['validation']           = 'nocheck' ;
        formElement['value']                = '';    
        formElement['displayName']          = 'preferences';
    }else if( formElement['name'].toLowerCase()==('moreinformation' )){
        formElement['outerDivClass']        = "form-group";
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck' ;  
        formElement['value']                = '';    
    }else if(formElement['name'].toLowerCase().indexOf("date")>-1 || formElement['name'].toLowerCase().indexOf("time")>-1){

        formElement['outerDivClass']        = "input-group date"
        formElement['editable']             =  access=='view'?false:true;
        formElement['type']                 = 'datepicker'
        formElement['validation']           = 'date'
        formElement['data']                 = formElement['value']? moment(new Date(formElement['value']['$date'] )).format('YYYY-MM-DD hh:mm:ss'): yyyymmddhhmmss(0);         
        formElement['val']                  = formElement['value']
        formElement['value']                = formElement['data']
        formElement['outerDivClass']        = 'row'
        formElement['size']                 = 255  
        formElement['editable']             = (access=='view') ||(['creationdate','lastmodifieddate'].indexOf(formElement['name'].toLowerCase())>-1)?false:true;    

    } else if( formElement['name'].toLowerCase() == 'sliderimage' || ( ( formElement['name'].toLowerCase().indexOf("image") >-1 ||formElement['name'].toLowerCase().indexOf("fileurl") >-1 ||  formElement['name'].toLowerCase().indexOf("logo") > -1 ) && formElement['name'].toLowerCase().indexOf("id") < 0 && formElement['name'].toLowerCase().indexOf("name") < 0  ) ){          
       
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['type']                 = 'image'
        formElement['validation']           = 'nocheck'
        formElement['data']                 = formElement['value']?formElement['value']:''
        formElement['value']                = formElement['data']
        formElement['size']                 = '' 
        formElement['displayName']          = 'Image Location'              
    } else if(formElement['name'].toLowerCase().indexOf("gender") > -1 ){
        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'
        formElement['alternativeValues']    = ['Male','Female','Others']
        formElement['chosenValue']          = formElement['value']?formElement['value']:'Male'
        formElement['value']                = formElement['chosenValue']
        formElement['size']                 = 255                    
    }else if(formElement['name'].toLowerCase().indexOf("country") > -1 ){
        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'
        formElement['alternativeValues']    = ["Afghanistan","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antarctica","Antigua and Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas (the)","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia (Plurinational State of)","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Bouvet Island","Brazil","British Indian Ocean Territory (the)","Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Cayman Islands (the)","Central African Republic (the)","Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands (the)","Colombia","Comoros (the)","Congo (the Democratic Republic of the)","Congo (the)","Cook Islands (the)","Costa Rica","Croatia","Cuba","Curaçao","Cyprus","Czechia","Côte d'Ivoire","Denmark","Djibouti","Dominica","Dominican Republic (the)","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Falkland Islands (the) [Malvinas]","Faroe Islands (the)","Fiji","Finland","France","French Guiana","French Polynesia","French Southern Territories (the)","Gabon","Gambia (the)","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Heard Island and McDonald Islands","Holy See (the)","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran (Islamic Republic of)","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Korea (the Democratic People's Republic of)","Korea (the Republic of)","Kuwait","Kyrgyzstan","Lao People's Democratic Republic (the)","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macao","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands (the)","Martinique","Mauritania","Mauritius","Mayotte","Mexico","Micronesia (Federated States of)","Moldova (the Republic of)","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands (the)","New Caledonia","New Zealand","Nicaragua","Niger (the)","Nigeria","Niue","Norfolk Island","Northern Mariana Islands (the)","Norway","Oman","Pakistan","Palau","Palestine, State of","Panama","Papua New Guinea","Paraguay","Peru","Philippines (the)","Pitcairn","Poland","Portugal","Puerto Rico","Qatar","Republic of North Macedonia","Romania","Russian Federation (the)","Rwanda","Réunion","Saint Barthélemy","Saint Helena, Ascension and Tristan da Cunha","Saint Kitts and Nevis","Saint Lucia","Saint Martin (French part)","Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Sint Maarten (Dutch part)","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Georgia and the South Sandwich Islands","South Sudan","Spain","Sri Lanka","Sudan (the)","Suriname","Svalbard and Jan Mayen","Sweden","Switzerland","Syrian Arab Republic","Taiwan (Province of China)","Tajikistan","Tanzania, United Republic of","Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands (the)","Tuvalu","Uganda","Ukraine","United Arab Emirates (the)","United Kingdom of Great Britain and Northern Ireland (the)","United States Minor Outlying Islands (the)","United States of America (the)","Uruguay","Uzbekistan","Vanuatu","Venezuela (Bolivarian Republic of)","Viet Nam","Virgin Islands (British)","Virgin Islands (U.S.)","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe","Åland Islands"];
        formElement['chosenValue']          = formElement['value']?formElement['value']:'Nigeria'
        formElement['value']                = formElement['chosenValue']
        formElement['size']                 = 255                    
    }else if(formElement['name'].toLowerCase().indexOf("version") > -1 ){
        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'
        formElement['alternativeValues']    = ["5.5","6.0","6.5","6.7","7.0"];
        formElement['value']                = formElement['value']?formElement['value']:'6.5'
        formElement['chosenValue']          = formElement['value']
        formElement['size']                 = 255                    
    }else if(formElement['name'].toLowerCase()==("blogbody")){
        formElement['type']                 = "editor";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'date'
        formElement['data']                 = formElement['value']?formElement['value']:''
        formElement['value']                = formElement['data']
        formElement['size']                 = 255                    
    }else if(formElement['name'].toLowerCase().indexOf("active")>-1){
        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'                     
        formElement['alternativeValues']    = ['No', 'Yes']
        formElement['value']                = formElement['value'] && (formElement['value'].toString().toLowerCase()=='true')?'Yes':'No'
        formElement['chosenValue']          = formElement['value']  
        //alert(formElement['chosenValue'] )
    }else if(formElement['name'].toLowerCase().indexOf("currencyname")>-1){

        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'
        formElement['alternativeValues']    = [ 'euro-currency','cruzeiro','french franc','lira','peseta','drachma','german penny','austral','livre tournois','dollar','cent','pound','currency','yen','armenian dram','afghani','nko dorome','nko taman','bengali rupee mark','bengali rupee','bengali ganda mark','gujarati rupee','tamil rupee','thai currency symbol baht','khmer currency symbol riel','colon','naira','rupee','won','new sheqel','dong','euro','kip','tugrik','peso','guarani','hryvnia','cedi','tenge','indian rupee','turkish lira','nordic mark','manat','ruble','lari','bitcoin','north indic rupee mark','rial','small dollar','fullwidth dollar','fullwidth cent','fullwidth pound','fullwidth yen','fullwidth won','indic siyaq rupee mark','mill','spesmilo']
        formElement['chosenValue']          = 'naira'
        formElement['value']                = 'naira'
        formElement['size']                 = 255  
        formElement['action']               = "onchange='$.fn.updateCurrencySymbol()'"

    }else if(formElement['name'].toLowerCase().indexOf("isproductonoffer")>-1){

        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'
        formElement['alternativeValues']    = [ 'Yes','No']
        formElement['chosenValue']          = 'No'
        formElement['value']                = 'No'
        formElement['size']                 = 255  
        //formElement['action']               = "onchange='$.fn.updateCurrencySymbol()'"

    }else if(formElement['name'].toLowerCase().indexOf("defaultcurrency")>-1){

        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'
        formElement['value']                = formElement['value']?formElement['value']:'naira'
        formElement['alternativeValues']    = null;
        formElement['alternativeValues']    = null;                        
        var listitems = '';
        pauseCallback = true;
        skipElement   = true;
        
        getListForSelect('Currency', 'currencyName','currencyName',  function(currencyData){
        var listitems = '';
        let itemList  = [];
        $.each(currencyData, function(key, value){
                listitems += '<option value=' + key + '>' + value + '</option>';
                itemList.push(value);
        });

       formElement['alternativeValues']     =   itemList
    
        if(pauseCallback){
            pauseCallback = false;
            elementList.push(new FormElement(prepareFormElement(formElement)));
            elementList.sort(compareNames);
            callback (elementList);
        }

        });           

        formElement['size']                 = 255  
        //formElement['action']             = "onchange='$.fn.updateCurrencySymbol()'"
    }else if(formElement['name'].toLowerCase()== "productcategory"){

        formElement['type']                 = "select";
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'nocheck'  
        formElement['alternativeValues']    = null;  
        formElement['value']                = null;                          
        var listitems = '';
        pauseCallback = true;
        skipElement   = true;

        getListForSelect('ProductCategories', 'productCategoryName','productCategoryName',  function(currencyData){

            let firstVal   = null;
            let itemList   = []
            for(let  i in  currencyData){
            let key    =  i
            let value  =  currencyData[i]
            firstVal =  firstVal?firstVal:value
            listitems += '<option value=' + key + '>' + value + '</option>';
            itemList.push(value)
            }                                                  
                 
            formElement['alternativeValues']     =   itemList
            formElement['value']                = formElement['value']?formElement['value']:'Herbs';  
            console.log(formElement['alternativeValues']);
           
            if(pauseCallback){
                pauseCallback = false;
                elementList.push(new FormElement(prepareFormElement(formElement)));
                elementList.sort(compareNames);
                callback (elementList);
            }
            });
            formElement['size']                 = 255  
       // formElement['action']               = "onload='$.fn.updateProductSelectOpts()'"
    } else if(formElement['name'].toLowerCase().indexOf('productline' )>-1){
            formElement['outerDivClass']        = "form-group";
            formElement['editable']             =  access=='view'?false:true;
            formElement['validation']           = 'alphanumspecial' ;
            formElement['value']                = 'vpx';    
    } else if(formElement['name'].toLowerCase()== 'password' || formElement['name'].toLowerCase()== 'emailpassword' || formElement['name'].toLowerCase()== 'ldappassword'){
        formElement['type']                 = "password";
        formElement['outerDivClass']        = "form-group";
        formElement['editable']             =  true;
        formElement['validation']           = 'password' ;  
        let serializer                      = new Serializer();
        formElement['value']                = formElement['value'] && formElement['value'].length > 20 ?serializer.multiDemystify(formElement['value'], parseInt( formElement['info']) ):formElement['value']
        formElement['val']                  = formElement['value']   
    }else if(formElement['name'].toLowerCase().indexOf("email")>-1 && ['emailserver','emailuser'].indexOf(formElement['name'].toLowerCase())<0){
        formElement['outerDivClass']        = "form-group"
        formElement['editable']             = access=='view'?false:true;
        formElement['validation']           = 'email'
        formElement['data']                 = formElement['value']?formElement['value']:''
        formElement['value']                = formElement['data']
        formElement['size']                 = 255                    
    } else if(formElement['name'].toLowerCase().indexOf('ip' )>-1 && formElement['name'].toLowerCase().indexOf('address' )>-1){
        formElement['type']                 = "text";
        formElement['outerDivClass']        = "form-group";
        formElement['editable']             =  access=='view'?false:true;;
        formElement['validation']           = 'ipaddress' ;
       
     } else if(formElement['name'].toLowerCase().indexOf('description' )>-1 ||formElement['name'].toLowerCase().indexOf('olddata' )>-1 ||formElement['name'].toLowerCase().indexOf('newdata' )>-1||formElement['name'].toLowerCase().indexOf('recordidentifier' )>-1||formElement['name'].toLowerCase().indexOf('dimension' )>-1){
        formElement['type']                 = "textarea";
        formElement['outerDivClass']        = "form-group";
        formElement['editable']             =  access=='view'?false:true;;
        formElement['validation']           = 'nocheck' ;
       
        formElement['value']                = formElement['name'].toLowerCase().indexOf('olddata' )>-1 ||formElement['name'].toLowerCase().indexOf('newdata' )>-1 ||formElement['name'].toLowerCase().indexOf('recordidentifier' )>-1?JSON.stringify(formElement['value']).replaceAll(",",",\r\n").replaceAll("}","\r\n}").replaceAll("{","{\r\n"): formElement['value']
        formElement['val']                  = formElement['value'] 
     }else{
        formElement['outerDivClass']        =  "form-group"
        formElement['editable']             =  access=='view'?false:true;
        formElement['data']                 =  formElement['value']?formElement['value']:''
        formElement['value']                =  formElement['value']?formElement['value']:''
    } 
    formData['formElement']                 =  formElement;
    formData['skipElement']                 =  skipElement  
    formData['pauseCallback']               =  pauseCallback
    return formData;
}
    
$.fn.loadPreviousPage = function(){

    let  dataItem = $('#current-item').val();
    if(dataItem.toLowerCase() == "vcenters"){
        $('#vcenter-table').click();
    } else if(dataItem.toLowerCase() == "teams"){
        $('#team-table').click();
    }else if(dataItem.toLowerCase() == "audittrail"){
        $('#audit-table').click();
    }else if(dataItem.toLowerCase() == "sitesettings"){
        $('#sitesettings-table').click()
    }else if(dataItem.toLowerCase() == "images"){
        $('#image-table').click()
    }
}
     
$.fn.getTableData = function (opts){
	 
	udpdatePageHeader({'mainPage':opts.mainPage, 'subPage':opts.subPage});  
	$("#page-content").hide();
    $("#table-content").show();
    $("#table-tag-div").html('<div style="text-align:center"> <img src="static/images/ajax-loaders/ajax-loader-6.gif" /> </div>');
	$("#form-content").hide();	
    var currentTable = opts.currentTable;
    $('#table-header').html($.fn.capitalizeFirstLetter(currentTable))
    $('#current-item').val(currentTable)
    $('#current-item-type').val('table')
    let currentTableIDField =  opts.tableIDField
    if(opts.changeable){
        $('#add-bttn').show();
    }else{
        $('#add-bttn').hide();
    }
    let dataPh = {}

    let resetFlag  = currentTable+'_reset_flag'
    
    $.fn.sessionGet(resetFlag,  function(getData){
       let tableResetFlag = getData
        $.fn.runSchemaGet('/main/schema',{qf:currentTable.toLowerCase()},function(data){
           
            data                        = $.fn.getObjectType(data) =='object'?data:JSON.parse(data)
            dataPh.tabData              = [];
            dataPh.dataCount            =  0;
            let fieldID                 =  currentTable.toLowerCase();
            dataPh.columns              =  Object.values(data[fieldID])

            let pryKey = data && data['idField']? data['idField']:opts.tableIDField;
            let tableInfo = {
                tableName: currentTable
                ,tagID:'table-tag-div'
                ,columns:Object.values(data[fieldID])
                ,className:'table table-striped table-bordered bootstrap-datatable datatable responsive datatable'
                ,tableUrlParams:"qt=sel&c="+currentTable+"&df=table"
                ,tableID:currentTable
                ,tableUrl:'/main/data'
                ,excludedColList:$.fn.getExcludedColumnList(currentTable,  'table')
                ,mode:0
                ,order: [[ 1, "asc" ]]
                ,id:opts.tableID
                ,name:opts.tableName
                ,dataType:opts.dataType
                ,opts:opts.options
                ,isSessionSaved:true
                ,primaryKey: pryKey
                ,dataPlaceholder: dataPh
                ,parentID:opts.parentId?opts.parentId:''
                ,tableResetFlag: 1// tableResetFlag
                ,header:opts.header
                    
            };
               $.fn.drawTable(tableInfo);

        }); 

 });

}
$.fn.editEntry = function(recordInd) {
    let  currentItem = $('#current-item').val();
    udpdatePageHeader({'mainPage':currentItem, 'subPage':'New'});  
    $("#page-content").hide();
    $("#table-content").hide();
    $("#form-content").show();
    $("#form-div").html('<div style="text-align:center"> <img src="static/images/ajax-loaders/ajax-loader-6.gif" /> </div>');
    $('#current-item-type').val('form')
    let msg = recordInd >= 0? "Loading record "+recordInd+" of "+currentItem:"Loading  form for new " + currentItem+" record";
    $("#form-title").html(msg);
    let currentTable = currentItem.toLowerCase();
    var idColumn  = [];

    $.fn.runSchemaGet('/main/schema',{qf:currentTable},function(tData){

        tData                       = (typeof tData).toLowerCase() =='object'?tData:JSON.parse(tData);
        let options                 = {};
        let fieldID                 =  $.fn.capitalizeFirstLetter(currentTable);
        options.access              = recordInd != -1 ?'edit':'new';
        options.parentPage          = '';
        options.currentPage         = currentTable;
        options.currentItem         = currentTable;
        options.tableID             = currentTable;
        options.presentData         = '<table id="' + options.tableID + '"></table>';
        options.tableName           = currentTable;
        options.sourceUrl           = '/main/data';
        options.idColumn            = idColumn.join(",");
        options.formDetails         = '';
        options.elementList         = new Array();
        options.resetFlag           =  1;
        options.tagID               = 'form-div';
        options.sectionIDCol        = '';
        options.editMode            =  1;
        options.recordID            = recordInd;
        options.class               =  ''
        options.encType             = 'multipart/form-data'
        options.id                  =  tData['idField'];
        options.name                = ''
        options.method              = 'post'
        options.action              =  '/main/data'
        options.type                =  recordInd >0 ?'existing':'new'
        options.dataType            =  ''
        options.nextPageUrl         =  '' 
        options.allFields           =  tData[currentTable]
        options.excludedColList     =  $.fn.getExcludedColumnList(currentTable, 'form');
        options.headerTitle         =  recordInd!= -1 ?currentTable+': Details of record  with '+tData['idField'].toUpperCase().replaceAll('','')+':'+recordInd:currentTable+': New Record Form'
        options.primaryKey          =  tData['idField'];
        options.columns             =  tData[currentTable]; 
        options.serialCount         =  tData['sc']

        $.fn.getFormElementList ({'serialCount':options.serialCount,'tableName':currentTable,'cols':tData[currentTable.toLowerCase()],'excludedCols': options.excludedColList  ,'recordInd':recordInd, 'access':'edit', 'order':tData['order'], 'callback':function(eleList){
            options.elementList     =  eleList
            //console.log('form Elements');
            //console.dir(eleList)
            $.fn.drawForm(options);
         } 
        });

});
}

$.fn.deleteEntry        = function(recordInd) {
	let currentTable       = $('#current-item').val();
	let tableContents      = currentTable;
    currentTable           = $.fn.capitalizeFirstLetter(currentTable);
	$.fn.runSchemaGet('/main/schema',{qf:currentTable}, function(tData) {
        tData                  = (typeof tData).toLowerCase() =='object'?tData:JSON.parse(tData)  ;
        let idColumn           =  tData['idField']
        if (recordInd){
            let hdr            =  "Removal of record from "+ currentTable
            let msg            =  "Are you sure you want to delete entry with "+idColumn+" as "+recordInd+" from "+currentTable+"?";
            $.fn.showConfirmDialog(hdr,msg, '$.fn.removeRecord (\''+currentTable+'\',\''+idColumn+'\','+recordInd+')'  );
        }
    
    });
};
	
	
$.fn.removeRecord = function(currentTable,idColumn,recordInd){
    let options             = {}
    let temp                = {}
    temp[idColumn]          = recordInd;
    Object.assign(options, {'f': JSON.stringify(temp)});
    Object.assign(options, {'t': 'del'});
    Object.assign(options, {'is_form_data_valid': 'yes'});
    Object.assign(options, {'data_item': currentTable});
    let formTarget          ='/main/data'

    $.fn.runPost(formTarget,options,function(response) {
        response = $.fn.getObjectType(response)=="string"?JSON.parse(response):response;
        console.log('Delete Response: ')
        console.dir(response)
        if 	(response) {
           let  res           =  response;
           let  header        =  res.header;
           let  message       =  res.message;
           let  error         =  res.error;
           let  isSuccessful  =  res.isSuccessful;
           let  collection    =  res.model;
          if (isSuccessful){
            $.fn.sessionSet(collection.toLowerCase() + "_reset_flag", 1)
            $.fn.updateCurrentTable();

          }else{
            $.fn.showMessageDialog(header,error );
          }        

        }}); 
}

$(document).ready(function(){

    $('#add-item').on('click', function(e){
        $.fn.editEntry(-1);
    });

    $('#user-logout').on('click', function(e){
        let isConfirmed = $('#is-confirmed').val();
        if(isConfirmed!='9999999999'){
            e.preventDefault();
        let header = '<h2 class="text-center">Logging off....</h2>';
        let message = '<h4> Are you sure you want to log off? </h4>';
        showConfirmDialog(header,message,"(window.location='auth/logout')");        
        }
    });

        $('#sitesettings-table').on('click', function(e){
        let  currentTable = 'SiteSettings';
        let opts = {
                     currentTable:currentTable
                    ,header:'Site Settings'
                    ,tableID:'sitesettings-table-data'
                    ,tableIDField :'_id'
                   ,formID:'sitesettings-form'
                   ,tableName:'SiteSettings'
                   ,dataType :'sitesettings'
                   ,excludedColList:$.fn.getExcludedColumnList(currentTable, 'table')
                   ,parentID: 'table-tag-div'
                   ,options: {isEditable:true, isViewable:true, isIndelible: true}
                   ,changeable:true
                   ,mainPage:'Settings'
                   ,subPage:'Site Settings'
                 }
                // $.fn.showAlert(JSON.stringify(opts),'primary')
                 $.fn.getTableData(opts)
       
    });  

    $('#vcenter-table').on('click', function(e){
        let  currentTable = 'VCenters';
        let opts = {
                     currentTable:currentTable
                    ,header:'VCenter Records'
                    ,tableID:'vcenter-table-data'
                    ,tableIDField :'_id'
                   ,formID:'vcenter-form'
                   ,tableName:'vcenter_mode'
                   ,dataType :'vcenter'
                   ,excludedColList:$.fn.getExcludedColumnList(currentTable, 'table')
                   ,parentID: 'table-tag-div'
                   ,options: {isEditable:true, isViewable:true, isIndelible: false}
                   ,changeable:true
                   ,mainPage:'Settings'
                   ,subPage:'VCenters'
                 }
                 $.fn.getTableData(opts)
       
    });  

    $('#team-table').on('click', function(e){
        let  currentTable = 'Teams';
        let opts = {
                     currentTable:currentTable
                    ,header:'Team Records'
                    ,tableID:'team-table-data'
                    ,tableIDField :'_id'
                   ,formID:'team-form'
                   ,tableName:'Teams'
                   ,dataType :'team'
                   ,excludedColList:$.fn.getExcludedColumnList(currentTable, 'table')
                   ,parentID: 'table-tag-div'
                   ,options: {isEditable:true, isViewable:true, isIndelible: false}
                   ,changeable:true
                   ,mainPage:'Settings'
                   ,subPage:'Teams'
                 }
                 $.fn.getTableData(opts)
       
    });  

    
    $('#audit-table').on('click', function(e){
        let  currentTable = 'AuditTrail';
        let opts = {
                     currentTable:currentTable
                    ,header:'Audit Records'
                    ,tableID:'audit-table-data'
                    ,tableIDField :'_id'
                   ,formID:'audit-form'
                   ,tableName:'AuditTrail'
                   ,dataType :'audittrail'
                   ,excludedColList:$.fn.getExcludedColumnList(currentTable, 'table')
                   ,parentID: 'table-tag-div'
                   ,options: {isEditable:false, isViewable:true, isIndelible: true}
                   ,changeable:false
                   ,mainPage:'Settings'
                   ,subPage:'Audit Trail'
                 }
                 $.fn.getTableData(opts)
       
    });  

        $('#image-table').on('click', function(e){
        let  currentTable = 'images';
        let opts = {
                     currentTable:currentTable
                    ,header:'Image Records'
                    ,tableID:'image-table-data'
                    ,tableIDField :'_id'
                   ,formID:'image-form'
                   ,tableName:'images'
                   ,dataType :'images'
                   ,excludedColList:$.fn.getExcludedColumnList(currentTable, 'table')
                   ,parentID: 'table-tag-div'
                   ,options: {isEditable:false, isViewable:true, isIndelible: false}
                   ,changeable:false
                   ,mainPage:'Settings'
                   ,subPage:'Images'
                 }
                 $.fn.getTableData(opts)
       
    });  


});
