import Serializer from './Serializer.js'; 

var formValidater;

class FormValidator {

    constructor(options){     
       this.init(options); 
       formValidater  =  this;
       formValidater.validate();
   }

   init(options){
    
    this.fieldCounter 		  = 0;
    this.formID               = options.formID? options.formID:0
    this.formFields           = options.formFields? options.formFields:''; //JSON.parse($.session.get(elementsStr));
    this.nextPageBttn  		  = options.nextPageBttn?   options.nextPageBttn:'';//$.session.get(formId + '_next_pages');
    this.validationResponse   = options.validationResponse?   options.validationResponse:{};
    this.serialCount          = options.serialCount?options.serialCount:0;
    this.serializer           = new Serializer();
   // this.formTarget           = options.formTarget?   options.formTarget:;

  }
  validate(){    
  
        let formFields          = formValidater.formFields
        for (let fieldEnt in formFields) {

            if (fieldEnt) {
                let formField         = formFields[fieldEnt];
                let fieldName         = formField.name.replaceAll(' ','_');
                let fieldValidation   = formField.validation?formField.validation:'nocheck';
                let validationMessage = '';
                let fieldID           = formField.id.replaceAll(' ','_');           
                let field             = document.getElementById(fieldID);
                let invalidHighlight  = "border-color: #ff3333;  box-shadow: none; -webkit-box-shadow: none"
                let validHighlight    = "border-color: #1aff1a;  box-shadow: none; -webkit-box-shadow: none"; //box-shadow: 3px 6px #888888; -webkit-box-shadow: 3px 6px #888888"
                let value             = $('#'+fieldID).val();             
                let messageID         = fieldName.toLowerCase() + '_message';
                let nameOnly          = fieldName.replace('_element', '').replace('_', ' ');
                nameOnly              = $.fn.addSpaceBeforeEachCapital($.fn.capitalizeFirstLetter(nameOnly.replace('_', ' ')));
                let fieldDivStr       = fieldName.toLowerCase() + '_div';
                let formInputfieldDiv =  document.getElementById(fieldID);
                let isValid           = false;
                switch (fieldValidation) {
                    case 'ipaddress':
                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isValidIPAddress(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style     = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should be a valid IP Address";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The ' + nameOnly + ' field should be a valid IP Address</li>';
                            }
                        }
                        break;                    
                    case 'alphanumeric':
                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isAlphanumeric(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style     = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should be alphabets and numbers only";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The ' + nameOnly + ' field should be alphabets and numbers only</li>';
                            }
                        }
                        break;
                    case 'email':
                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isValidEmail(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style     = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field  does not contain a valid email address";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The  ' + nameOnly + ' field  does not contain a valid email address</li>';
                            }
                        }
                        break;
                    case 'numeric':
                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isNumeric(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style     = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should be numbers only";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The  ' + nameOnly + ' field should be numbers only</li>';
                            }
                        }
                        break;
                    case 'alphanumspecial':

                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isAlphanumSpecial(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style     = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should consist of alphabets, numbers and special characters only";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The  ' + nameOnly + ' field should be alphabets only</li>';
                            }
                        }
                        break;
                    case 'password':
                        var minPasswordLen = 8;
   
                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = 'This field is required';
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The Password field is required</li>';
                            var confirmFieldValidationMessage = '';
                        } else {
                            $("#" + messageID).hide();

                            var confirmFieldPrefix = '';
                            var confirmFieldNameSuffix = '_password_confirm_element';
                            var confirmFieldIdSuffix   = '_password_confirm_id';
                            var confirmValue = '';
                            var confirmMessageID = '';
                            var confirmFieldDivStr = '';
                            var confirmFormInputfield = '';
                            if ((fieldName === 'password'  || fieldName === 'confirm_password') ||(fieldName === 'password_element'  || fieldName === 'confirm_password_element') ){
                                if (fieldName === 'password'|| fieldName === 'password_element') {
                                    confirmFieldPrefix = 'confirm_';
                                } else if (fieldName === 'confirm_password'|| fieldName === 'confirm_password_element') {
                                    confirmFieldPrefix = '';
                                }
                                confirmValue = $('#confirm_password_id').val();
                                confirmMessageID = fieldName === 'password'? confirmFieldPrefix + fieldName+'_message' :confirmFieldPrefix + fieldName.replace('element', 'message');
                                confirmFieldDivStr = fieldName === 'password'? confirmFieldPrefix + fieldName+'_div' : confirmFieldPrefix + fieldName.replace('element', 'div');
                                confirmFormInputfield = document.getElementById('confirm_password_id');
                               
                            } else{
                                let confirmFieldName=  fieldName.toLowerCase().replace('password','')+confirmFieldNameSuffix;
                                let confirmFieldId=  fieldName.toLowerCase().replace('password','')+confirmFieldIdSuffix;
                               // console.log(confirmFieldId);
                               // console.log(confirmFieldName);
                               // console.log(fieldName);
                               // console.log(fieldID);
                                confirmValue = $('#'+confirmFieldId).val();
                                confirmMessageID = confirmFieldName.replace('element', 'message');
                                confirmFieldDivStr =confirmFieldName.replace('element', 'div');
                               // console.log(confirmMessageID);
                               // console.log(confirmFieldDivStr);
                                confirmFormInputfield = document.getElementById(confirmFieldId);
                            }
                            

                            if (confirmValue && confirmValue.length === 0) {
                                $("#" + confirmMessageID).show();
                                document.getElementById(confirmMessageID).innerHTML = 'Please type the confirmation password';
                                confirmFormInputfield.style    = invalidHighlight;
                                confirmFieldValidationMessage = '<li>Password confirmation is required</li>';
                            } else {
                                $("#" + confirmMessageID).hide();
                                confirmFormInputfield.className = "form-control form-control-lg";
                                confirmFormInputfield.style     = validHighlight;
                            }
                            if (value.length > 0 && confirmValue.length > 0) {
                            if ((confirmValue === value) && (value.length >= minPasswordLen)) {
                                if (formValidater.isValidPass(value)) {
                                    isValid = true;
                                    $("#" + messageID).hide();
                                    formInputfieldDiv.className = "form-control form-control-lg has-success";
                                    $("#" + confirmMessageID).hide();
                                    confirmFormInputfield.className = "form-control form-control-lg has-success";
                                    confirmFormInputfield.style     = validHighlight;
                                    formInputfieldDiv.className = "form-control form-control-lg";
                                    formInputfieldDiv.style     = validHighlight;
                                    confirmFormInputfield.value =(formValidater.serializer.multiCrypt(value, formValidater.serialCount))
                                    $('#'+fieldID).val(confirmFormInputfield.value);
                                } else {
                                    $("#" + messageID).show();
                                    document.getElementById("#" + messageID).innerHTML = 'Password is invalid';
                                    formInputfieldDiv.style = invalidHighlight;
                                    validationMessage = '<li>Password field is not valid</li>';
                                    $("#" + confirmMessageID).show();
                                    document.getElementById(confirmMessageID).innerHTML = 'Password is invalid';
                                    confirmFormInputfield.style = invalidHighlight;
                                    validationMessage = '<li>Confirmation Password field is not valid</li>';

                                }

                            } else if (confirmValue !== value) {

                                $("#" + messageID).show();
                                document.getElementById(messageID).innerHTML = 'Password mismatch';
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>Password mismatch</li>';
                                $("#" + confirmMessageID).show();
                                document.getElementById(confirmMessageID).innerHTML = 'Password mismatch';
                                confirmFormInputfield.style = invalidHighlight;
                                confirmFieldValidationMessage = '<li>Confirmation Password mismatch</li>';
                                confirmFormInputfield.style     = invalidHighlight;

                            } else if ((confirmValue === value) && (value.length < minPasswordLen)) {

                                $("#" + messageID).show();
                                document.getElementById(messageID).innerHTML = 'Password is too short';
                                $('.password-new-input').hide();
                                $('#email-profiles-form input[name=' + fieldName + '_alt]').attr('value', '' + value);
                                $('#email-profiles-form input[name=' + fieldName + ']').attr('value', null);
                                $('.password-invalid-input1').show();
                                $('.password-invalid-input2').show();
                                document.getElementById("password_message").innerHTML = 'Password is too short';
                                validationMessage = '<li> Password is too short</li>';

                                $("#" + confirmMessageID).show();
                                document.getElementById(confirmMessageID).innerHTML = 'Password is too short';
                                confirmFormInputfield.style = invalidHighlight;
                                confirmFieldValidationMessage = '<li> Confirmation Password is too short</li>';

                            }
                       }
                    }

                        break;

                    case 'alpha':
                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isAlphabetic(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should be alphabets only";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The  ' + nameOnly + ' field should be alphabets only</li>';
                            }
                        }
                        break;
                    case 'phone':

                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isValidPhoneNumber(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "form-control form-control-lg";
                                formInputfieldDiv.style = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should consist of valid phone numbers only";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The  ' + nameOnly + ' field should consist of valid phone numbers only</li>';
                            }
                        }
                        break;
                    case 'date':

                        if (value.length === 0) {
                            document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should not be empty";
                            $("#" + messageID).show();
                            formInputfieldDiv.style = invalidHighlight;
                            validationMessage = '<li>The ' + nameOnly + ' field should not be empty</li>';
                        } else {
                            if (formValidater.isValidDate(value)) {
                                isValid = true;
                                $("#" + messageID).val('');
                                $("#" + messageID).hide();
                                formInputfieldDiv.className = "datetimepicker form-control form-control-lg";
                                formInputfieldDiv.style     = validHighlight;
                            } else {
                                document.getElementById(messageID).innerHTML = "The " + nameOnly + " field should consist of date input only";
                                $("#" + messageID).show();
                                formInputfieldDiv.style = invalidHighlight;
                                validationMessage = '<li>The  ' + nameOnly + ' field should consist of date input  only</li>';
                            }
                        }
                        break;
                    case 'nocheck':
                       
                        isValid = true;
                        break;
                }

                formValidater.validationResponse[formValidater.fieldCounter] = {
                    fieldName: fieldName,
                    valid: isValid,
                    message: validationMessage
                };
                ++formValidater.fieldCounter;
                
            }         
         }
        var formTarget = $('#' + formValidater.formID).attr('action');
        this.showValidationReport(formValidater.formID, formValidater.validationResponse, formTarget, formValidater.nextPageBttn);
}  
    isAlphabetic(field) {

       var letters = /^[A-Za-z]+$/;
       if (field.match(letters)) {
           return true;
       } else {

           return false;
       }

   }
    isValidPage(field) {

       var letters = /^\w+\s*[\-]*\w+\s*$/;
       if (field.match(letters)) {
           return true;
       } else {
           return false;
       }
   }

    isValidPhoneNumber(field) {
       //var phoneNoformat =  /^[\+]?\(?([0-9]{3})\)?([\-.,\s ])?([0-9]{3})([\-.,\s ])?([\-., \s])?([0-9]{3})([\-.,\s ])?([0-9]{4})$/;
       var phoneNoformat = /^[\+]?[\(]?[\d]+[\)[\s*\-?\s*\d+\s*\-?\s*\d]+[\s]*$/g;

       if (field.match(phoneNoformat)) {
           return true;
       } else {

           return false;
       }
       return false;
   }

    isAlphanumeric(field) {

       var letters = /^[0-9a-zA-Z,\s]+$/m;
       if (field.match(letters)) {
           return true;
       } else {

           //showAlert('User address must have alphanumeric characters only');
           return false;
       }


   }

    isAlphanumSpecial(field) {
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

    isValidPass(field) {

       if (isNumeric(field)) return false;
       if (isAlphabetic(field)) return false;
       if (isAlphanumSpecial(field)) {

           return true;

       } else return false;
   }

    isNumeric(field) {

       var numbers = /^[\d,\d.\d]+$/m;
       if (field.match(numbers)) {
           return true;
       } else {
           return false;
       }
   }

    isValidPrice(field) {
       var numbers = /^[0-9]*(\.)?([0-9]{2})+$/m;
       if (field.match(numbers)) {
           return true;
       } else {
           field.focus();
           return false;
       }
   }

    isValidEmail(field) {

       var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
       if (field.match(mailformat)) {
           return true;
       } else {
           return false;
       }
   }

    trimString(string) {
       return string.replace(/^\s+|\s+$/g, "");
   }

    isValidEmailSet(field, name) {

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

           showAlert('The list below shows the addresses in the \"' + name + '\" field which are not valid: \n ' + invalidAddresses);
           return false;
       } else {

           return true;
       }
   }

    isValidDate(fld) {
 
       var mo, day, yr;
       var entry = fld.substring(0, 10);
       entry = entry.substring(8, 10) + '/' + entry.substring(5, 7) + '/' + entry.substring(0, 4);
       var reLong = /\b\d{4}[\/-]\d{1,2}[\/-]\d{1,2}\b/;
       var reShort = /\b\d{2}[\/-]\d{1,2}[\/-]\d{1,4}\b/;
       var valid = (reLong.test(entry)) || (reShort.test(entry));
       if (valid) {
           var delimChar = (entry.indexOf("/") !== -1) ? "/" : "-";
           var delim1 = entry.indexOf(delimChar);
           var delim2 = entry.lastIndexOf(delimChar);
           day = parseInt(entry.substring(0, delim1), 10);
           mo = parseInt(entry.substring(delim1 + 1, delim2), 10);
           yr = parseInt(entry.substring(delim2 + 1), 10);
           
           if (yr < 100) {
               var today = new Date();
               
               var currCent = parseInt(today.getFullYear() / 100) * 100;
               
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
                       showDialog("There is a problem with the year entry.");
                   }
               } else {
                   showDialog("There is a problem with the month entry.");
               }
           } else {
               showDialog("There is a problem with the date entry.");
           }
       } else {
           showDialog("Incorrect date format. Enter as mm/dd/yyyy.");
       }
       return false;
   }

   isValidIPAddress(field){
    var  ips = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      if (field.match(ips)) {
          return true;
      } else {
          return false;
      }
  }
	showValidationReport (formId, validationResponses, formTarget, nextPageBttn) {

        var invalidFields = '<div align="left"><strong> Please verify the following input details:</strong> </div><br />';
        invalidFields += '<div align="left" style="color:red"><ol>';
        var isFormValid = {};
        var eleCounter = 0;
  
        for (var reponseInd in validationResponses) {
            var name = validationResponses[reponseInd].fieldName;
            var message = validationResponses[reponseInd].message;
            var isValid = validationResponses[reponseInd].valid;
            invalidFields += message;

            if (!isValid) {
                isFormValid[eleCounter] = false;

            } else {
                isFormValid[eleCounter] = true;

            }
            ++eleCounter;
        }

        var shouldProceed = true;
    
        for (var i in isFormValid) {
            if (!isFormValid[i]) {
                shouldProceed = false;
                break;
            }
        }
        
        if (!shouldProceed) {
            invalidFields += '</ol></div>';
            let header ='<span align="center" style="font-weight:bold; font-size:20px;">New ' + $.fn.addSpaceBeforeEachCapital($.fn.capitalizeFirstLetter(formValidater.formID.toString().replace('s_id',''))) + ' Entry</span>';
            let  message = invalidFields
            $.fn.showMessageDialog (header,message);

        } else {

            $('#is-form-data-valid').val('YES');
            let formType         =  $('#qt').val();
            var payload          = {};
            var fInputs          = {};
            let formData         = new FormData();
            var imageCount       = 0;
            var  imageCategory   =  null;
             $('#' + formId).find('input').each(function() {
                 var formElement = $(this);
                 let elementName = $(this).attr('name');
                 let elementID   = $(this).attr('id')

                 if((elementName.toLowerCase().indexOf('image')>0||elementName.toLowerCase().indexOf('logo')>0) && elementName.indexOf('text')<0 ){    
                     console.log("name: "+elementName)     
                     let eleName  = elementName.replace('_element','');
                     console.log('Element ID: '+elementID)
                     let imageFile = $('#'+elementID).prop('files')[0];
                     if(imageFile){
                         console.dir(imageFile)
                         imageCategory = eleName;
                         formData.append('imagecategory',imageCategory);
                         formData.append('filename',imageFile['name']);
                         formData.append('fileformat',imageFile['type']);
                         formData.append('filesize',imageFile['size']);
                         formData.append('sourceUrl',$('#'+elementID).val());
                         formData.append('action','add');
                         formData.append('lastmodifieddate', moment(imageFile['lastModified']).format('YYYY/MM/DD hh:mm:ss'));
                         formData.append('image_file', imageFile);
                         ++imageCount;
                      } else{
                            console.log("No image found.")
                      }
                 } 

             });

                 if(imageCount >0 ){
             
                    let  imageDimensions = JSON.stringify(getImageDimensions(imageCategory));
                    console.log("image dimensions: "+imageDimensions)
                    formData.append('dimensions', imageDimensions)
                   
                    runImagePost('/images',formData,function(response) {
                    if (!response.error) {
                        console.dir(response)
                        let  imageUrl = response['uploadPath'];
                        let  imageElementName = response['imageCategory'].toLowerCase();
                        
                        $('#' + formId).find('input,text,select,textarea').each(function() {
                            let  nameOfElement              = $(this).attr('name').replace('_element','');
                            let  valueOfElement             = $(this).val();
           
                            if(nameOfElement.toLowerCase()  == imageElementName){

                                valueOfElement    = imageUrl;
                            }

                            if ($(this).attr('type')=="hidden"){
                                fInputs[nameOfElement]= valueOfElement;
                            } else{
                                payload[nameOfElement]= valueOfElement;
                            }
                            });          
                            $('#cancel-bttn').hide();
                                let fData = {pl: payload}
                                Object.assign(fInputs, fData);
                                $.fn.ajaxFormSubmit(formTarget, fInputs, nextPageBttn, $.fn.closeDialog());
                            }  else{

                                $.fn.showMessageDialog ("Image Upload Error", response.error);
                                ;
                            }
                });
            } else{


                $('#' + formId).find('input,text,select,textarea').each(function() {

                    let  nameOfElement              = $(this).attr('name').replace('_element','');
                    let  valueOfElement             = $(this).val();
                    let  elementID                  = $(this).attr('id')
                    let  imageIDSuffix              = "_id-text"
   
                    if ($(this).attr('type')=="hidden"){
                        fInputs[nameOfElement]= valueOfElement;
                    } else if(nameOfElement.indexOf('image')>0 && nameOfElement.indexOf('text')<0 ){
                        valueOfElement        =  document.getElementById(nameOfElement+imageIDSuffix).value
                        payload[nameOfElement]= valueOfElement;
                    }else{
                        payload[nameOfElement]= valueOfElement;
                    }
                });  

                   $('#cancel-bttn').hide();
                    let formData = {pl: payload}
                   // alert('running default post')
                    Object.assign(fInputs, formData);
                    $.fn.ajaxFormSubmit(formTarget, fInputs, nextPageBttn, $.fn.closeDialog());
                }
        }
        //var page_url =window.location.href;
    }
}

export default  FormValidator