import FormValidator from './FormValidator.js';

var  currentForm;
const FormPrototype = {
    name: "",
    id: "",
    method: "",
    encType: "",
    dataType: "",
    type: "new",
    accessType: "view",
    action: "",
    class: "",
    nextPageUrl: "",
    allFields: new Array(),
    data: new Array(),
    dataCount: 0,
    html: "",
    elementList: new Array(),
    head: "",
    foot: "",
	tagID:"",
	tableName :"",
	targetUrl:"",
	editMode:0 ,
	idColumn:"",
	recordID:0,
	formDetails:"",
    resetFlag:0,
    primaryKey: '',
    formCardClass: '',
    serialCount: 0
     
};

$.fn.loadEmptyForm = async function (){

        var curElement 	 = "";            
        for(let i=0; i<currentForm.excludedColList.length; i++){
            currentForm.excludedColList[i] = currentForm.excludedColList[i].toLowerCase();
        }       
        for (var index in currentForm.elementList) {

        let  curElement = currentForm.elementList[index].name.toUpperCase();
        if ( currentForm.excludedColList.indexOf(curElement.toLowerCase())==-1) {
           currentForm.elementList[index].value =  currentForm.elementList[index].value.toString().replace(null, '');
           currentForm.elementList[index].value =  currentForm.elementList[index].value.toString().replace('undefined', '');
           currentForm.elementList[index].val =  currentForm.elementList[index].val.toString().replace(null, '');
           currentForm.elementList[index].val =  currentForm.elementList[index].val.toString().replace('undefined', '');
                                                                 
            let  rData                 = {};
            let pData                  = new Promise( function (resolve, reject) { 

            $.fn.formatFormField(currentForm.elementList[index],false,false,currentForm.access.toLowerCase(), function(data){

                 if(data) resolve( data);
                 else  reject([]);
            
                           });
                });
                rData       =  await pData;
              currentForm.elementList[index] =  rData['formElement']
        }
        currentForm.elementList[index].render(currentForm.elementList[index].value);
        //currentForm.addElement(currentForm.elementList[index]);
        }
        let formData = currentForm.render();

        $('#' +currentForm.tagID).html(formData);
        $.fn.closeDialog();
}
$.fn.initializeDatePicker = function(id){
  //  $('#'+id).datepicker( { "dateFormat":"yy-mm-dd", "showAnim":"clip","showButtonPanel": true, "numberOfMonths": 3});
  $('#'+id).datetimepicker( {format:'Y-m-d H:i:s'});
}

$.fn.previewImage = function(eleName) {
    var imageInput = document.querySelector("input[name='" + eleName + "']");
    var imageTag = "#" + eleName + "-image-preview";
    if (imageInput.files && imageInput.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $(imageTag).html('<img src="' + e.target.result + '" alt="image not found"  />');
        }
        reader.readAsDataURL(imageInput.files[0]);
    }
}

$.fn.submitForm = function(id, elementsStr) {
    try {

       new   FormValidator({formID:id,formFields:currentForm.elementList, serialCount:currentForm.serialCount});
    } catch (e) {
       // alert(e.stack)
       $.fn.closeDialog();
       $.fn.showMessageDialog('Error Adding new record ', 'Data from form: ' + id + ' could not be submitted.<br /> Reason: <br /> ' + e.stack);
    }
   // closeDialog();
};


class Form {
		 constructor (options) {

            $.fn.sessionSet('previous_item_type', 'table')
            $.fn.sessionSet('previous_item',options.tableID);
            $.fn.sessionSet(options.tableName.toLowerCase()+'_form_create_info', JSON.stringify(options) );

            this.init(options)
            var responseData    = '';
            var searchCriteria  = {}
            searchCriteria[this.primaryKey]= parseInt(this.recordID)
			var paramString     = 'c=' + this.tableName + '&qt=sel&qf=' + JSON.stringify(searchCriteria)+"&df=form";
			var formTarget      = options.sourceUrl;
			var xmlhttp         = null;
            var formSessionData = null;
            currentForm         = this;
            console.log("List: ")
            console.dir(currentForm.elementList)

            $.fn.sessionGet(this.tableName.toLowerCase(),  function(getData){
                formSessionData = getData?JSON.parse(getData):null
                var formData        = "";
                console.log("Saved Session data");
                console.log(formSessionData)
                console.log("type: "+ currentForm.type.toLowerCase());

                
                if ( currentForm.recordID == -1 || (currentForm.type.toLowerCase() === 'new')) {        
                        console.log('loading empty form')
                         $.fn.loadEmptyForm();
                } else if ( currentForm.type.toLowerCase() === 'existing' && formSessionData && currentForm.resetFlag == 0  ) { 
                        console.log('loading existing data')
                        try {
                            responseData = $.fn.getObjectType(formSessionData)=='string'?JSON.parse(formSessionData):formSessionData;

                            if (responseData.tabData.length > 0) { 
                                currentForm.data      = responseData.tabData.length > 0 ? responseData.tabData : null;
                                currentForm.data = currentForm.data  && $.fn.getObjectType(currentForm.data )=="string"?JSON.parse(currentForm.data ) : currentForm.data ;
                                currentForm.dataCount = responseData.dataCount;d
                                $.fn.getDataFromID(currentForm.tableName, currentForm.data, currentForm.primaryKey, currentForm.recordID, 
                                async function(cRecord){    
                                        
                                     if(cRecord){
                                        let  rowKey  = {}
                                        let objKeys = Object.keys(cRecord);
                                        for (var index in currentForm.elementList) {
                                           let curElement = currentForm.elementList[index].name;
                                           rowKey = objKeys.filter(x=> x.toLowerCase().replaceAll('_','').replaceAll(' ','')== curElement.toLowerCase().replaceAll('_','').replaceAll(' ',''))[0]           
                                            for(let i=0; i<currentForm.excludedColList.length; i++){
                                                currentForm.excludedColList[i] = currentForm.excludedColList[i].toLowerCase();
                                            }

                                            if (cRecord[rowKey]   &&   currentForm.excludedColList.indexOf(rowKey.toLowerCase())==-1) {
                                                currentForm.elementList[index].name  = rowKey
                                                currentForm.elementList[index].value = cRecord[rowKey]

                                                let fieldProps = {}
                                                if( ["select","datepicker","password"].indexOf( currentForm.elementList[index]['type'])>-1 || ["clickaction","description","olddata","newdata","recordidentifier"].indexOf(rowKey.toLowerCase())>-1 || !currentForm.elementList[index]['isFormatted']){
                                                   
                                                    let  rData                 = {};
                                                    let pData                  = new Promise( function (resolve, reject) { 

                                                    $.fn.formatFormField(currentForm.elementList[index],false,false,currentForm.access.toLowerCase(), function(data){

                                                         if(data) resolve( data);
                                                         else  reject([]);
                                                    
                                                                   });
                                                        });
                                                        rData       =  await pData;
                                                        fieldProps  =  rData
                                                }else{
                                                    fieldProps =      {'formElement':currentForm.elementList[index]};
                                                }
                                                 
                                                let formField  =  fieldProps['formElement']
                                                formField.render(formField.value);
                                                
                                            } else if(currentForm.excludedColList.indexOf(curElement.toLowerCase())==-1){
       
                                                currentForm.elementList[index].value = '';
                                                currentForm.elementList[index].render('');
                                            }
                        
                                        }
                                           let formData = currentForm.render();
                                            $('#' + currentForm.tagID).html(formData);
                                    }
                                            $.fn.closeDialog();
                            
                                    });
                            } else {
                                $.fn.closeDialog();
                                $.fn.showMessageDialog('Local Storage Cache for Form is empty', 'There  is no data stored locally for currentForm form');
                            }

                        } catch (e) {
                            $.fn.closeDialog();
                            $.fn.sessionRemove(currentForm.tableName.toLowerCase());
                            $.fn.sessionRemove(currentForm.tableName.toLowerCase()+'_schema');
                            $.fn.sessionRemove(currentForm.tableName.toLowerCase()+'_form_create_info');
                            $.fn.sessionSet(currentForm.tableName.toLowerCase()+'_reset_flag',1);
                            $.fn.showMessageDialog('<strong>Error loading data from local storage</strong>', e.stack);
                        }
                } else if ( currentForm.type.toLowerCase() === 'existing' && (!formSessionData || currentForm.resetFlag == 1)  ) { 
                    //console.log('getting data afresh')
                    $.fn.runGet(currentForm.sourceUrl,paramString, function(data){
                                try {   
                                        //alert(JSON.stringify(data) )    
                                        responseData = $.fn.getObjectType(data)=="string"?JSON.parse(data):data;
                                        
                                        if (responseData.tabData) {                        
                                            currentForm.allFields = responseData.columns;
                                            currentForm.data = responseData.tabData? responseData.tabData : null;
                                            currentForm.data = currentForm.data  && $.fn.getObjectType(currentForm.data )=="string"?JSON.parse(currentForm.data ) : currentForm.data ;
                                            var p = 0;
                                             $.fn.getDataFromID(currentForm.tableName, currentForm.data, currentForm.primaryKey, currentForm.recordID, 
                                             async function(cRecord){       
                                               if(cRecord){
                                                        console.dir(cRecord)
                                                        let  rowKey  = {} 
                                                        let objKeys = Object.keys(cRecord);
                                                        //console.dir(currentForm.elementList)
                                                        //console.dir(currentForm.excludedColList)
                                                        for (var index in currentForm.elementList) {
                                                            let  curElement = currentForm.elementList[index].name;
                                                            rowKey = objKeys.filter(x=> x.toLowerCase().replaceAll('_','').replaceAll(' ','')== curElement.toLowerCase().replaceAll('_','').replaceAll(' ',''))[0]
                                                            
                                                            for(let i=0; i<currentForm.excludedColList.length; i++){
                                                                currentForm.excludedColList[i] = currentForm.excludedColList[i].toLowerCase();
                                                            }
                                                            //console.log('Unfiltered: '+rowKey);
                                                            if ( currentForm.excludedColList.indexOf(curElement.toLowerCase())==-1) {
                                                                currentForm.elementList[index].name  = rowKey
                                                               
                                                                currentForm.elementList[index].value = cRecord[rowKey];
                                                                let fieldProps =  {};
                                                                //console.log('Filtered: '+rowKey);
                                                                if( ["select","datepicker","password"].indexOf( currentForm.elementList[index]['type'])>-1 || ["clickaction","description","olddata","newdata","recordidentifier"].indexOf( rowKey.toLowerCase())>-1|| !currentForm.elementList[index]['isFormatted']){                                                                 
                                                                    
                                                                        let  rData                 = {};
                                                                        let pData                  = new Promise( function (resolve, reject) { 

                                                                        $.fn.formatFormField(currentForm.elementList[index],false,false,currentForm.access.toLowerCase(), function(data){

                                                                            if(data) resolve( data);
                                                                            else  reject([]);

                                                                            });
                                                                            });
                                                                            rData       =  await pData;
                                                                            fieldProps  =  rData

                                                                        }else{
                                                                            fieldProps =      {'formElement':currentForm.elementList[index]};
                                                                        }
     
                                                                let formField  =  fieldProps['formElement']
                                                                formField.render(formField.value);
                                                            } else if(currentForm.excludedColList.indexOf(curElement.toLowerCase())==-1){
                                                                currentForm.elementList[index].value = '';
                                                                currentForm.elementList[index].render('');
                                                            }
                                                        }
                                                            formData = currentForm.render();
                
                                                                        
                                                            $('#' + currentForm.tagID).html(formData);
                                                            $.fn.closeDialog();
                                                            
                                                            
                                                    }
                                                    });
                                                
                                            } else {
                                                $.fn.closeDialog();
                                                $.fn.loadEmptyForm();
                                            }
                                        
                                        } catch (e) {
                                            $.fn.closeDialog();
                                            $.fn.sessionRemove(currentForm.tableName.toLowerCase());
                                            $.fn.sessionRemove(currentForm.tableName.toLowerCase()+'_schema');
                                            $.fn.sessionRemove(currentForm.tableName.toLowerCase()+'_form_create_info');
                                            $.fn.sessionSet(currentForm.tableName.toLowerCase()+'_reset_flag',1);
                                            $.fn.showMessageDialog('Error Comminucating with Server', e.stack + '<br /><br />' );
                                        }
    
                        
                            


                    });
               }
                $.fn.closeDialog();
          });
        }
        init(options){
            this.tagID  		 = options.tagID?options.tagID:0
			this.tableName		 = options.tableName?options.tableName:""
			this.targetUrl		 = options.targetUrl?options.targetUrl:""
			this.editMode  		 = options.editMode?options.editMode:0 
			this.idColumn		 = options.idColumn?options.idColumn:""
			this.recordID		 = options.recordID?options.recordID:0
			this.formDetails	 = options.formDetails?options.formDetails:""
			this.elementList     = options.elementList?options.elementList:[]
            this.resetFlag 		 = options.resetFlag?options.resetFlag:0
            this.class 		     = options.class?options.class:'';
            this.id 		     = options.id?options.id:'';
            this.name 		     = options.name?options.name:'';
            this.encType 	     = options.encType?options.encType:'';
            this.method 	     = options.method?options.method:'post';
            this.action 	     = options.action?options.action:'';
            this.type 		     = options.type?options.type:'';
            this.dataType 	     = options.dataType?options.dataType:'';
            this.access          = options.access?options.access:'';
            this.nextPageUrl     = options.nextPageUrl?options.nextPageUrl:'';
            this.isSessionSaved  = options.isSessionSaved?options.isSessionSaved:false;
            this.allFields       = options.allFields?options.allFields:false;
            this.excludedColList = options.excludedColList  ? options.excludedColList:[] 
            this.headerStr       = options.headerStr?options.headerStr:'';
            this.footerStr       = options.footerStr?options.footerStr:'';
            this.headerTitle     = options.headerTitle?options.headerTitle:'Details Page'
            this.primaryKey      = options.primaryKey?options.primaryKey:'';
            this.sourceUrl       = options.sourceUrl?options.sourceUrl:'';
            this.formCardClass   = options.formCardClass?options.formCardClass:'card-primary';
            this.serialCount     = options.serialCount?options.serialCount:0;
         }
        getHeaderStr() {
            let formQuery = {}
            let formIDField = currentForm.id
            formQuery[formIDField] =  currentForm.type =='existing'? parseInt(currentForm.recordID): -1
            currentForm.headerStr = '<div class="card '+this.formCardClass+'"><div id="form-alert-header" class="card-header" align="center"></div><div class="card-body"><form role="form" class="' + currentForm.class + '" enctype="' + currentForm.encType + '"  id ="' + currentForm.id + '" name="' + currentForm.name + '" method ="' + currentForm.method + '" action="' + currentForm.action + '" >' +
                '<fieldset><input id="is-form-data-valid" type="hidden" name="is_form_data_valid" value="NO"/> ';
                currentForm.headerStr += '   <input type ="hidden"  id="edit-type" name="edit_type" value="' + currentForm.type + '" />' +
                '<input id="data-item" type="hidden" name="data_item" value="' + currentForm.tableName + '"/>' +
                '<input id="c" type="hidden" name="c" value="' + currentForm.tableName + '"/>' +
                '<input id="qf" type="hidden" name="qf" value="' + JSON.stringify(formQuery).replaceAll('"',"'") +'"/>' +
                '<input id="pk" type="hidden" name="pk" value="' + currentForm.id +'"/>' +
                '<input id="qt" type="hidden" name="qt" value="'+(currentForm.type =='new'?"add":'udt')+'"/>';     
        }
        getFooterStr() {
            currentForm.footerStr = '';
            currentForm.footerStr += '</div><div class="card-footer"><div class="form-actions"<div id="submit-form-loader"  align="center" style="display:none;"> <img src="/static/img/ajax-loaders/ajax-loader-7.gif" title="ajax-loader-7.gif"> ' +
                '<br />&nbsp;<br /> </div>';
            var elementListtring = JSON.stringify(currentForm.elementList);
           $.fn.sessionSet(currentForm.id + '_form_elements', elementListtring);
           $.fn.sessionSet(currentForm.id + '_next_pages', currentForm.nextPageUrl);

            if (currentForm.access.toLowerCase() === 'edit' || currentForm.type.toLowerCase()  === 'new') {
                currentForm.footerStr += '<div align="center" id="' + currentForm.id + '-footer-section"><button type="button" class="btn btn-primary btn-lg" id="submit-bttn" onclick="$.fn.confirmFormSubmitDialog(\'Saving Changes\',\'Are you sure you want to save?\',\'' + currentForm.id + '\');" >Save</button>' +
                    '<span><a data-original-title="' + currentForm.dataType + '" style="display:none" href="" class="btn btn-danger btn-lg" data-rel="popover" data-content="Go back to ' + currentForm.dataType + ' page" id="' + currentForm.dataType + '-table-bttn">' + currentForm.dataType + ' </a> ' +
                    '<button class="btn  btn-secondary btn-lg" id="cancel-form-bttn" type="reset" onclick="$.fn.loadPreviousPage();" >Cancel</button> </div>';
            } else if (currentForm.access.toLowerCase()  === 'view') {
                currentForm.footerStr += '<div align="center" id="' + currentForm.id + '-footer-section"><a align="center" href = "#" onclick="$.fn.loadPreviousPage();" class="btn btn-primary" id="' + currentForm.id + '-footer-section-link"> Back</a></div>';
            }
            currentForm.footerStr += '</div></fieldset></form></div></div>';

        }
        addElement(element) {
            currentForm.elementList.push(element);
        }
        render () {
            currentForm.getHeaderStr()
            currentForm.html = currentForm.headerStr;
            for (var index in currentForm.elementList) {
                currentForm.html += currentForm.elementList[index].html;
            }
            currentForm.getFooterStr()
            currentForm.html += currentForm.footerStr;
            return currentForm.html;
        }
    }
    
    export default  Form;