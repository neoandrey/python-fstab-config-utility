
class FormElement{

    constructor(options) {
        this.init(options);
    }
compareSelectFieldOptions(opt1, opt2){
    let areEqual = false;
    let  opt1Type =$.fn.getObjectType(opt1)
    let  opt2Type =$.fn.getObjectType(opt2)

    if (opt1Type=="string" || opt2Type=="string"){
        opt1  = opt1.toString().toLowerCase() 
        opt2  = opt2.toString().toLowerCase()
    }
    
    if(opt1 == opt2){

    }

    return areEqual;

}
init (options) {
    this.type               = options.type;
    this.name               = options.name;
    this.displayName        = options.displayName;
    this.id                 = options.id.replaceAll(' ','_');
    this.editable           = options.editable;
    this.val                = options.value;
    this.value              = options.value;
    this.html               = "";
    this.alternativeValues  = options.alternativeValues;
    this.alternativeKeys    = options.alternativeKeys?options.alternativeKeys:options.alternativeValues;
    this.chosenValue        = options.chosenValue;
    this.errorMessage       = options.errorMessage;
    this.valueMap           = options.valueMap;
    this.validation         = options.validation;
    this.outerDivClass      = options.outerDivClass?options.outerDivClass:'form-group';
    this.value              = options.value?options.value:'';
    this.info               = options.info?options.info:''
    this.action             = options.action?options.action:'';
    this.isFormatted        = options.isFormatted?true:false;
    this.fileFormats        = options.fileFormats?options.fileFormats:null;
    this.multipleFiles      = options.multipleFiles?options.multipleFiles:false;
    this.multiple           = options.multiple?'multiple="multiple"':'';  //option parameter is boolean but it is used as a string in form element
    this.fieldClass         = options.fieldClass?options.fieldClass:"form-control form-control-lg";
} 
render(valueData) {
    var field = this.name.toLowerCase();
    let id_base  = field.replaceAll(' ','_')
    var id = this.id? this.id+ '_id':id_base+ '_id';
    this.id = id;
    var input_name = id_base.toLowerCase() + '_element';
    if (this.displayName == "") {
        field = splitnCapitalizeFirstLetter(field, '_');
        field = field.replace('Id', 'ID');
        field = field.trim();
    } else {

        field = this.displayName;
    }
    this.value = valueData?valueData:this.value;
    var norm_div_id = id_base + '_div';
    var message_id = id_base + '_message';
    var fieldStr = '';
    if (this.type === 'text' && this.editable) {
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<input class="form-control form-control-lg" id="' + id + '" type="text" name="' + input_name + '" value="' + valueData + '"/>' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span></div>';
    } else if (this.type === 'text' && !this.editable) {
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<input class="form-control form-control-lg disabled" type="text" disabled="" placeholder="' + valueData + '" id="' + id + '" name="' + input_name + '" value="' + valueData + '">' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed</span></div> ';
    } else if (this.type === 'select') {
        this.chosenValue = this.value;
    if(this.editable){
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<div class="controls" align="left"><select id="' + id + '" name="' + input_name + '" data-rel="chosen" class="'+this.fieldClass+'" '+this.multiple+' '+this.action+'>';
        var currentValue = this.chosenValue; //this.alternativeValues[this.chosenValue];
        this.alternativeKeys =this.alternativeKeys.length >0?this.alternativeKeys:this.alternativeValues;
        for (var i = 0; i < this.alternativeValues.length; ++i) {

            if (this.alternativeValues[i].toString().toLowerCase() === this.chosenValue.toString().toLowerCase() || this.alternativeKeys[i].toString().toLowerCase() === this.chosenValue.toString().toLowerCase()) {
                fieldStr += '<option value="' + this.alternativeKeys[i] + '" selected>' + this.alternativeValues[i] + '</option>';
            } else {
                fieldStr += '<option value="' + this.alternativeKeys[i] + '">' + this.alternativeValues[i] + '</option>';
            }
        }
        fieldStr += '</select> <input type="hidden" id="' + id + '_value" name="' + input_name + '_value"  value=""/></div> </div>';
    }else{
                this.alternativeKeys =this.alternativeKeys.length >0?this.alternativeKeys:this.alternativeValues;
                for (var i = 0; i < this.alternativeValues.length; ++i) {

                    if (this.alternativeValues[i].toString().toLowerCase() === this.chosenValue.toString().toLowerCase() || this.alternativeKeys[i].toString().toLowerCase() === this.chosenValue.toString().toLowerCase()) {
                                valueData =  this.alternativeValues[i];
                    }
                }
        valueData=valueData.toString().trim().length ==0 ?this.val:valueData
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
        '<input class="form-control form-control-lg disabled" type="text" disabled="" placeholder="' + valueData + '" id="' + id + '" name="' + input_name + '" value="' + valueData + '">' +
        '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed</span></div> ';
    }
    
    } else if (this.type === 'password') {
        // var value = this.value;
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<div class="controls"><input  class="form-control form-control-lg" id="' + id + '" type="password" name="' + input_name + '" value="' + valueData + '"/>' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed</span></div></div>';
        if (field.toLowerCase() =="password"){
                field = 'CONFIRM_PASSWORD';
                input_name = 'confirm_password_element';
                id_base = field.toLowerCase();
                id = id_base + '_id';
                norm_div_id = id_base + '_div';
                message_id = id_base + '_message';
                field = field.replace('_', ' ');
                field = field.toLowerCase();
        } else{
            input_name = field.toLowerCase().replace('password','').replaceAll(' ','')+'_password_confirm_element';
            field = field.toUpperCase().replace('PASSWORD','').replaceAll(' ','')+'_PASSWORD_CONFIRM';
            id_base = field.toLowerCase();
            id = id_base + '_id';
            norm_div_id = id_base + '_div';
            message_id = id_base + '_message';
            let fieldList = field.toLowerCase().split('_');
            field = fieldList.map(x=>$.fn.capitalizeFirstLetter(x)).join(' ');

        }
    
        fieldStr += '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<div class="controls"><input  class="form-control form-control-lg" id="' + id + '" type="password" name="' + input_name + '" value="' + valueData + '" />' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span></div></div>';

    } else if (this.type === 'textarea') {
        let  disabledClass = this.editable? 'disabled': ''
        let  disabledAttr = this.editable? 'disabled=""': ''
        if(this.editable){
            fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label><div class="controls"> <textarea  class="form-control form-control-lg" name="' + input_name + '" class="cleditor" id="' + id + '" rows="5" >' + valueData + '</textarea>' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span></div></div>';
   
        } else {
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label><div class="controls"> <textarea  class="form-control form-control-lg '+disabledClass+'" name="' + input_name + '" class="cleditor" id="' + id + '" rows="5" '+disabledAttr+'>' + valueData + '</textarea>' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span></div></div>';
        }
        } else if (this.type === 'autocomplete') {

        var datasource = this.autoCompleteDataSource;
        datasource = '[&quot;' + datasource.join('&quot;,&quot;') + '&quot;]';

        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<div class="controls"><input class="form-control form-control-lg typeahead"   id="' + id + '" type="text" data-provide="' + id + '" data-items="4"  name="' + input_name + '" value="' + valueData + '" data-source="' + datasource + '">' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span> </div></div>';

    } else if (this.type === 'datepicker' ||this.type === 'datetimepicker') {

        if(this.editable){

            fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '">'+
            '<div class="col-4"><label  class="control-label" for="' + id + '">' + field + '</label></div>' +
            '<div class="controls col-8" als><input class="datepicker form-control form-control-lg" id="' + id + '" type="text"  name="' + input_name + '" value="' + valueData + '" data-provide="datepicker"  />' +
            '<div class="input-group-addon"><span class="glyphicon glyphicon-th"></span>'+
            '</div><span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span> </div></div>'+
            '<script type="text/javascript">$.fn.initializeDatePicker(\''+id+'\')</script>'

        }else{

            fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<input class="form-control form-control-lg disabled" type="text" disabled="" placeholder="' + valueData + '" id="' + id + '" name="' + input_name + '" value="' + valueData + '">' +
            '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed</span></div> ';
        }
        

    } else if (this.type === 'file') {
        let  acceptString   = this.fileFormats?`accept="${this.fileFormats.join(',')}"`:''
        let  multipleString = this.multipleFiles?'multiple':''
        fieldStr = '<div class="'+this.outerDivClass+'" id="' + norm_div_id + '"> <label class="control-label" for="fileInput">' + field + '</label><div class="controls">' +
            '<div class="uploader" id="uniform-fileInput"><input class="form-control-file" id="fileInput" type="file"  id="' + id + '"' + ' name="' + input_name + '" size="19" style="opacity: 75;" '+acceptString+' '+multipleString+'><span class="help-inline text-danger" style="display:none;" id="' + message_id + '">No file selected</span><span class="action">Choose File</span></div></div></div>';

        /*  fieldStr = '<div class="input-group"  id="' + norm_div_id + '">' +
              '<div class="input-group-prepend">' +
              ' <span class="input-group-text" id="inputGroupFileAddon01"> Upload </span>' +
              ' </div>' +
              '<div class="custom-file">' +
              ' <input  name="' + input_name + '" id="' + id + '" + type="file" class="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">' +
              '<label class="custom-file-label" for="inputGroupFile01">' + field + '</label>' +
              '</div>' +
              '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">No file selected</span><span class="action">' +
              '</div>';
              */
    } else if (this.type === 'image') {
         if(input_name.toLowerCase().indexOf('profile')>-1){
            this.info = this.value? '<div align="center"><img src="'+this.value+'" alt="'+field+'" class="rounded-circle"></div>':this.info
         }else {
            this.info = this.value? '<div align="center"><img src="'+this.value+'" alt="'+field+'"></div>':this.info
         }
        
        fieldStr = '<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label>' +
            '<div class="row" id="uniform-fileInput">' +
            '<div id="' + input_name + '-image-preview" style="display:block;margin:auto;" align="center">'+ this.info+'</div>' ;
            if(this.editable){
                fieldStr += 
                '<div class="col-lg-10 mr-0"><input class="form-control form-control-md" id="' + id + '-text" type="text" name="' + input_name + '_text" value="' + valueData + '" /><input id="image-changed" type="hidden" name="image_changed" value="0" /><input id="image-file-path" type="hidden" name="image_file_path" value="'+this.value+'" /></div>' +
                '<div class="col-lg-2 mr-0"><button type="button" class="btn btn-info" onclick="document.querySelector(\'#fileInput\').click();">Upload</button></div>' +
                '<div class="col-lg-2 mr-0"><input class="form-control-file" id="fileInput" type="file"   name="' + input_name + '"  style="opacity: 75; display:none" onchange="document.querySelector(\'#' + id + '-text\').value=document.querySelector(\'#fileInput\').value; $.fn.previewImage(\'' + input_name + '\');document.querySelector(\'#image-changed\').value=1" value="' + valueData + '"/></div>' +
                '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">No file selected</span>' ;
            }
            fieldStr += '</div></div>';

    } else if (this.type === 'prependedtext') {
        fieldStr = '<div class="'+this.outerDivClass+'" id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label><div class="controls">' +
            ' <div class="input-prepend input-append"><span class="add-on">N</span><input  id="' + id + '" type="text" name="' + input_name + '" ' +
            ' value="' + data + '"><span class="add-on">.00</span></div></div> </div>';
    } else if (this.type === 'checkbox') {
        fieldStr = ' <div class="checkbox" id="' + norm_div_id + '"><label class="control-label" for="' + id + '">' + field + '</label> <div class="controls"> ';
        for (var altOpt in alternativeValues) {
            fieldStr += '<label class="checkbox inline"><div class="checker" id="uniform-inlineCheckbox"' + field + '-' + altOpt + '" ><span>';
            ' <input type="checkbox" id="' + id + '-' + altOpt + '" value="option1" style="opacity: 0;"></span></div>' + altOpt + '</label>';
        }
        fieldStr += '</div></div>';
    } else if (this.type === 'radiobutton') {

        fieldStr = '<div class="radio" id="' + norm_div_id + '><label class="control-label" for="' + id + '">' + field + '</label><div class="controls"> ';
        for (var altOpt in alternativeValues) {
            fieldStr += '<label class="radio"><div class="radio" id="uniform-' + id + '-' + altOpt + '"><span class="+(altOpt==this.currentValue?\'checked\':\'\')+">' +
                '<input type="radio" name="optionsRadios" id="options-' + id + '-' + altOpt + '" value="' + altOpt + '" checked="" style="opacity: 0;"></span></div> ' +
                altOpt + '  </label> <div style="clear:both"></div>';
        }
        fieldStr += '</div> </div>';
    }else if (this.type === 'list') {
        if (this.editable) {
            fieldStr = '<div class="'+this.outerDivClass+'" id="' + norm_div_id + '" valign="center"><label class="control-label" for="' + id + '" >' + field + '</label>' +
                '<div class="controls">' +
                '<div class="box span10">' +
                '<div class="box-header well" data-original-title>' +
                '	<h2>' + field + ' </h2>' +
                '	<div class="box-icon">' +
                '		<a href="#" class="btn btn-minimize btn-round"><i class="glyphicon glyphicon-chevron-up"></i></a>' +
                '	</div>' +
                '</div>' +
                '<div class="box-content">' +
                '	<table class="table table-striped table-bordered bootstrap-datatable datatable highlight" id="' + id + '-list-table" >' +
                '		  <thead>' +
                '			  <tr>' +
                '				  <th>No.</th>' +
                '				  <th>Item</th>'+
                '			  </tr>' +
                '		  </thead>   ' +
                '		  <tbody>   ' ;
                
                for (var i = 0; i < this.value.length; i++) {

                    fieldStr += '<tr><td> '+(i+1).toString()+' </td><td>' + this.value[i].toString() + '</td></tr>';


                }
                fieldStr = '		  </tbody>   ' +
                '	 </table>  ' +
                '</div>' +
                '</div>' +
                '</div>';

            fieldStr += '<div >' +
                '<div class="'+this.outerDivClass+'">' +
                '<span><br /><br /><br /><br /></span>' +
                '<div class="controls">' +
                '<input class="form-control form-control-lg" id="' + id + '" type="text" name="' + input_name + '" value="' + valueData + '"/>'
                '<a href="#" title="Click to remove selected ' + field.replace('List', '') + '(s)" data-rel="tooltip" class="btn btn-danger btn-lg" id="remove-' + id.replace('List', '') + '-from-form" onclick ="removeItemFromForm(\'' + id + '\')">Remove ' + field.replace('List', '') + '</a>' +
                '<a href="#" title="Click to add a new ' + field.replace('List', '') + '" data-rel="tooltip" class="btn btn-success btn-lg" id="add-' + id.replace('List', '') + '-to-form" onclick ="addItemToForm(\'' + id + '\')">Add ' + field.replace('List', '') + '</a>' +
                '<input type="hidden" name="' + id + '_item_count" id="' + id + '-item-count" value="0" />' +
                '<input type="hidden" name="' + id + '_added_items" id="' + id + '-added-items" value="" />' +
                '</div>' +
                '</div>' +
                '</div>';
        } else {
            fieldStr = '<div class="'+this.outerDivClass+'" id="' + norm_div_id + '" valign="center"><label class="control-label" for="' + id + '" >' + field + '</label>' +
                '<div class="controls">' +
                '<div class="box span10">' +
                '<div class="box-header well" data-original-title>' +
                '	<h2>' + field + ' </h2>' +
                '	<div class="box-icon">' +
                '		<a href="#" class="btn btn-minimize btn-round"><i class="glyphicon glyphicon-chevron-up"></i></a>' +
                '	</div>' +
                '</div>' +
                '<div class="box-content">' +
                '	<table class="table table-striped table-bordered bootstrap-datatable datatable highlight" id="' + id + '-list-table" >' +
                '		  <thead>' +
                '			  <tr>' +
                '				  <th>No.</th>' +
                '				  <th>Item</th>' +
                '			  </tr>' +
                '		  </thead> <tbody>  ';
            }
            fieldStr += '</div><!--/span-->';;
    
            $('#' + id + '-list-table tbody').on('click', 'tr', function() {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                } else {
                    var table = $('#' + id + '-list-table').DataTable();
                    table.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                }
            });
            var countInfo = id + '_count';
            $.session.delete(countInfo);
            var itemListStr = id + '_item_list';
            $.session.delete(itemListStr);

        } else if (this.type === 'map') {
        if (this.editable) {
            fieldStr = '<div class="'+this.outerDivClass+'" id="' + norm_div_id + '" valign="center"><label class="control-label" for="' + id + '" >' + field + '</label>' +
                '<div class="controls">' +
                '<div class="box span10">' +
                '<div class="box-header well" data-original-title>' +
                '	<h2>' + field + ' </h2>' +
                '	<div class="box-icon">' +
                '		<a href="#" class="btn btn-minimize btn-round"><i class="glyphicon glyphicon-chevron-up"></i></a>' +
                '	</div>' +
                '</div>' +
                '<div class="box-content">' +
                '	<table class="table table-striped table-bordered bootstrap-datatable datatable highlight" id="' + id + '-list-table" >' +
                '		  <thead>' +
                '			  <tr>' +
                '				  <th>No.</th>' +
                '				  <th>Product</th>' +
                '				  <th>Price</th>' +
                '				  <th>Quantity</th> ' +
                '			  </tr>' +
                '		  </thead>   ' +
                '	 </table>  ' +
                '</div>' +
                '</div>' +
                '</div>';

            fieldStr += '<div >' +
                '<div class="'+this.outerDivClass+'">' +
                '<span><br /><br /><br /><br /></span>' +
                '<div class="controls">' +
                '<select id="item-list-for-' + id + '" data-rel="chosen">';
            var products = getAllProducts();
            //    console.dir(products);
            for (var i = 0; i < products.length; i++) {
                fieldStr += '<option>' + products[i] + '</option>';

            }
            fieldStr += '</select><br /><br />' +
                '<a href="#" title="Click to remove selected ' + field.replace('List', '') + '(s)" data-rel="tooltip" class="btn btn-danger btn-lg" id="remove-' + id.replace('List', '') + '-from-form" onclick ="removeItemFromForm(\'' + id + '\')">Remove ' + field.replace('List', '') + '</a>' +
                '<a href="#" title="Click to add a new ' + field.replace('List', '') + '" data-rel="tooltip" class="btn btn-success btn-lg" id="add-' + id.replace('List', '') + '-to-form" onclick ="addItemToForm(\'' + id + '\')">Add ' + field.replace('List', '') + '</a>' +
                '<input type="hidden" name="' + id + '_item_count" id="' + id + '-item-count" value="0" />' +
                '<input type="hidden" name="' + id + '_added_items" id="' + id + '-added-items" value="" />' +
                '</div>' +
                '</div>' +
                '</div>';
        } else {
            fieldStr = '<div class="'+this.outerDivClass+'" id="' + norm_div_id + '" valign="center"><label class="control-label" for="' + id + '" >' + field + '</label>' +
                '<div class="controls">' +
                '<div class="box span10">' +
                '<div class="box-header well" data-original-title>' +
                '	<h2>' + field + ' </h2>' +
                '	<div class="box-icon">' +
                '		<a href="#" class="btn btn-minimize btn-round"><i class="glyphicon glyphicon-chevron-up"></i></a>' +
                '	</div>' +
                '</div>' +
                '<div class="box-content">' +
                '	<table class="table table-striped table-bordered bootstrap-datatable datatable highlight" id="' + id + '-list-table" >' +
                '		  <thead>' +
                '			  <tr>' +
                '				  <th>No.</th>' +
                '				  <th>Product</th>' +
                '				  <th>Price</th>' +
                '				  <th>Quantity</th> ' +
                '			  </tr>' +
                '		  </thead> <tbody>  ';

        }
        fieldStr += '</div><!--/span-->';;

        $('#' + id + '-list-table tbody').on('click', 'tr', function() {
            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                var table = $('#' + id + '-list-table').DataTable();
                table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        });
        var countInfo = id + '_count';
        $.session.delete(countInfo);
        var itemListStr = id + '_item_list';
        $.session.delete(itemListStr);

    } else if (this.type === 'hidden') {
        fieldStr = '<input id="' + id + '" type="hidden" name="' + input_name + '" value="' + valueData + '" />';
    }else  if (this.type === 'editor'){
        fieldStr = `<div class="'+this.outerDivClass+'"  id="' + norm_div_id + '"><label class="control-label" for="' + id + '">` + field + `</label>` +
        `<input class="form-control form-control-lg" id="' + id + '" type="hidden" name="' + input_name + '" value="' + valueData + '"/>` +
 
       // '<span class="help-inline text-danger" style="display:none;" id="' + message_id + '">This value is not allowed<br /></span></div>'+
        `<div id=editorjs></div><pre id="output"></pre>`+
        `<script>
            editor = new EditorJS({
            autofocus: true,
      tools: {
        image: {
            class: SimpleImage,
            inlineToolbar: true,
            config: {
              placeholder: 'Paste image URL'
            }
          }
         ,header: {
                class: Header,
                shortcut: 'CMD+SHIFT+H'
         }
         ,paragraph: {
            class: Paragraph,
            inlineToolbar: true
          }
      }
        });
    </script>`+
    `</div>`;
    }
    this.html = fieldStr;
    return this.html;
 }

}

export default FormElement