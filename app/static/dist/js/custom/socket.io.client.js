$(document).ready(function(){ 
    $.fn.socket = io.connect();

    $.fn.socket.on('datachanged',function(data){
                  console.log('Emitting data change')
                  console.dir(data)
                  let error        =  data['error']
                  let header       =  data['header']
                  let isSuccessful =  data['isSuccessful']
                  let message      =  data['message']
                  let recordID     =  data['record_index']
                  let model        =  data['model'].toLowerCase()

                  var  modelResetFlag         = model.toLowerCase()+"_reset_flag";
                  var  currentItem                = ($('#current-item').val()).toLowerCase()
                  $.fn.sessionSet(modelResetFlag,1);
                  
                  console.log('isSuccessful'+isSuccessful)
                  console.log('model'+model)
                  console.log('currentItem'+currentItem)
                  if (isSuccessful && (model  == currentItem) ){
                    var   currentItemType           = ($('#current-item-type').val()).toLowerCase();
                    var  currentItemCreateInfo      =   ($('#current-item').val()).toLowerCase()+"_create_info";
                    var  currentFormCreateInfo      = ($('#current-item').val()).toLowerCase()+"_form_create_info";
                    console.log(`currentItemType: ${currentItemType}`)
                    console.log(`currentItem: ${currentItem}`)
                    console.log(`currentItemCreateInfo: ${currentItemCreateInfo}`)  

                    $.fn.sessionGet(currentItemCreateInfo,function(options){
                    $.fn.sessionGet(currentFormCreateInfo, function(formOptions){
                        options =  $.fn.getObjectType(options)=="string"?JSON.parse(options):options;
                        formOptions =  $.fn.getObjectType(formOptions)=="string"?JSON.parse(formOptions):formOptions;
                        if(options && options.tableName && options.tableName.toLowerCase() === currentItem ) {        
                        if(currentItemType ==='table'){
                            $.fn.sessionRemove(options.tableName.toLowerCase());
                            $.fn.sessionRemove(options.tableName.toLowerCase()+'_schema');
                            $.fn.sessionRemove(options.tableName.toLowerCase()+'_form_create_info');
                            $.fn.updateCurrentTable();
 
                        }else if(currentItemType ==='form'){

                             let  idInfo  =$('#qf').val();
                             if(idInfo){
                                console.log(idInfo)
                                let inputFields = idInfo.split(':');
                                for (let i=0; i<inputFields.length; i++ ){
                                      
                                    if(i % 2== 0){
                                        let  original  =  inputFields[i]
                                        inputFields[i] =  inputFields[i].replaceAll(",","");
                                        inputFields[i] =  inputFields[i].replaceAll("'",'"');
                                        idInfo         =  idInfo.replaceAll(original,inputFields[i])
                                    }
                                }                       
                            idInfo=   JSON.parse(idInfo);
                            //console.log('idInfo: '+idInfo['_id'])
                            //console.log('recordID: '+recordID)
                            if (parseInt(parseInt(idInfo['_id'])) == parseInt(recordID)){
                                $.fn.editEntry(recordID);
                            }
                        }
                             

                        }
                        }							
                        }); 							
                    });

                  }
    
               });
            });