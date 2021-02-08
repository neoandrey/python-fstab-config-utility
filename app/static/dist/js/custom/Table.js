var currentTable;

$.fn.dataTable.pipeline = function ( opts ) {
    // Configuration options
    var conf = $.extend( {
        pages: 5,     // number of pages to cache
        url: currentTable.tableUrl,      // script url
        data: (typeof currentTable.tableUrlParams).toLowerCase != 'object'?  $.fn.convertURLQueryToObject (currentTable.tableUrlParams):currentTable.tableUrlParams,   // function or object with parameters to send to the server
                      // matching how `ajax.data` works in DataTables
        method: 'GET' // Ajax HTTP method
    }, opts );
    // Private variables for storing the cache
    var cacheLower = -1;
    var cacheUpper = null;
    var cacheLastRequest = null;
    var cacheLastJson = null;
 
    return function ( request, drawCallback, settings ) {
        var ajax          = false;
        var requestStart  = request.start;
        var drawStart     = request.start;
        var requestLength = request.length;
        var requestEnd    = requestStart + requestLength;
         
        if ( settings.clearCache ) {
            // API requested that the cache be cleared
            ajax = true;
            settings.clearCache = false;
        }
        else if ( cacheLower < 0 || requestStart < cacheLower || requestEnd > cacheUpper ) {
            // outside cached data - need to make a request
            ajax = true;
        }
        else if ( JSON.stringify( request.order )   !== JSON.stringify( cacheLastRequest.order ) ||
                  JSON.stringify( request.columns ) !== JSON.stringify( cacheLastRequest.columns ) ||
                  JSON.stringify( request.search )  !== JSON.stringify( cacheLastRequest.search )
        ) {
            // properties changed (ordering, columns, searching)
            ajax = true;
        }
         
        // Store the request for checking next time around
        cacheLastRequest = $.extend( true, {}, request );
 
        if ( ajax ) {
            // Need data from the server
            if ( requestStart < cacheLower ) {
                requestStart = requestStart - (requestLength*(conf.pages-1));
 
                if ( requestStart < 0 ) {
                    requestStart = 0;
                }
            }        
            cacheLower = requestStart;
            cacheUpper = requestStart + (requestLength * conf.pages);
 
            request.start = requestStart;
            request.length = requestLength*conf.pages;
            request.qf  ={}
            request.qf[opts.priKey]  = {}
            request.qf[opts.priKey]['$gte'] =  isNaN(requestStart)?0:requestStart
            request.qf[opts.priKey]['$lte'] =   isNaN(requestLength*conf.pages)?50:requestLength*conf.pages
 
            // Provide the same `data` options as DataTables.
            if ( typeof conf.data === 'function' ) {
                // As a function it is executed with the data object as an arg
                // for manipulation. If an object is returned, it is used as the
                // data object to submit
                var d = conf.data( request );
                if ( d ) {
                    $.extend( request, d );
                }
            }
            else if ( $.isPlainObject( conf.data ) ) {
                // As an object, the data given extends the default
                $.extend( request, conf.data );
            }
 
            settings.jqXHR = $.ajax( {
                "type":     conf.method,
                "url":      conf.url,
                "data": (typeof currentTable.tableUrlParams).toLowerCase != 'object'?  $.fn.convertURLQueryToObject (currentTable.tableUrlParams):currentTable.tableUrlParams,
                "priKey":currentTable.primaryKey,
                "dataType": "json",
                "cache":    false,
                "success":  function ( json ) {
                    json.data = json.tabData
                  //vgf  console.dir(json.data );
                    json.tabData= null
                    if (!requestLength || requestLength < 0 ) {
                        requestLength = 0;
                    }
                    cacheLastJson = $.extend(true, {}, json);
                    if ( cacheLower != drawStart ) {
                        json.data.splice( 0, drawStart-cacheLower );
                    }
                    if ( requestLength >= -1 ) {
                       json.data.splice( requestLength, json.data.length);
                    }
                    
                    drawCallback( json );
                }
            } );
        } else {
            json = $.extend( true, {}, cacheLastJson );
            json.draw = request.draw; // Update the echo for each response
            json.data = json.tabData
            json.tabData= null
            json.data.splice( 0, requestStart-cacheLower );
            json.data.splice( requestLength, json.data.length );
 
            drawCallback(json);
        }
    }
};
 

$.fn.dataTable.Api.register( 'clearPipeline()', function () {
    return this.iterator( 'table', function ( settings ) {
        settings.clearCache = true;
    } );
} );
 
const TablePrototype = {
    name: '',
    id: '',
    columns: "",
    header: "",
    bodyID: "",
    className: "",
    tableUrl: "",
    tableData: "",
    dataCount: 0,
    headerStr: "",
    bodyStr: '',
    remove: "",
    tableclass: "",
    type: "",
    datatype: "",
    responsive: true,
    destroy: true,
    scrollX: true,
    serverside: false,
    ordering: true,
    scrollcollapse: true,
    info: "",
    scrollCollapse: true,
    tableUrlParams: "",
    excludedColList: [],
    order: [
        [0, 'asc']
    ],
    paging: true,
    AutoWidth: true,
    searching: true,
    stateSave: true,
    fetchResults: "",
    isViewable: true,
    isEditable: false,
    isIndelible: false,
    body:[]
  
  
};

class Table {
	
	constructor(options){ 
        let header   = options.header?options.header:options.tableName
        $('#dashbody-header-title').html(header);
        $.fn.sessionSet('previous_item',options.tableID);
        $.fn.sessionSet('previous_page', $('#body-content').html());
        $.fn.sessionSet(options.tableName.toLowerCase()+'_create_info',JSON.stringify(options));
		this.init(options);	
        this.tableUrlParams = (typeof this.tableUrlParams).toLowerCase ==Object?convertToURLQuery(this.tableUrlParams):this.tableUrlParams
        let responseData =[];
        currentTable = this;
        let tableSessionData  =  {};
        $.fn.sessionGet(options.tableName.toLowerCase(), function(tabData){
            //console.dir(tabData)
            tableSessionData  =   $.fn.getObjectType(tabData)=="string"? JSON.parse(tabData): tabData;
            console.dir(tableSessionData)
            $.fn.sessionGet(options.tableName.toLowerCase() + "_reset_flag", function(resetFlag){
                    console.log('reset flag: '+ currentTable.tableResetFlag)
                    currentTable.tableResetFlag   =   (parseInt(resetFlag)==  1 || parseInt(currentTable.tableResetFlag)==1)? true : false;
                    

                        if (tableSessionData  && (currentTable.mode === 0 && !currentTable.tableResetFlag) ) {  
                            let responseData       = tableSessionData;
                            currentTable.columns   = responseData.columns.length > 0 ? responseData.columns:currentTable.columns ;
                            currentTable.tableData = responseData.tabData.length > 0 ? responseData.tabData : [];
                            currentTable.dataCount = responseData.dataCount;
                            currentTable.buildHeader();
                            currentTable.body      = currentTable.buildBody(currentTable.tableData)   
                            currentTable.buildFooter();
                            currentTable.render();   

                        } else {

                            let  queryObj = (typeof currentTable.tableUrlParams).toLowerCase() != 'object'? $.fn.convertURLQueryToObject (currentTable.tableUrlParams): currentTable.tableUrlParams;  
                           // console.log('fetching fresh data...')
                           // console.log(currentTable.tableUrl)
                           // console.dir(queryObj)
                            $.fn.runGet(currentTable.tableUrl,queryObj, function(data){
                                    console.dir(data)
                                    let responseData = data;// && data.tabData && data.tabData.length >0?data: currentTable.dataPlaceholder;     
                                    if (responseData.columns && responseData.columns.length > 0) {   
                                               
                                        if(data && data.tabData && data.tabData.length >0 ) {
                                            $.fn.sessionSet(currentTable.name.toLowerCase(), JSON.stringify(responseData));
                                            $.fn.sessionSet(currentTable.name.toLowerCase()+ "_reset_flag", "0");
                                        }

                                        
                                        currentTable.columns   = responseData.columns.length> 0?Object.values(responseData.columns):currentTable.columns ;
                                        currentTable.tableData = responseData.tabData? responseData.tabData : [];
                                        currentTable.dataCount = responseData.dataCount;
                                        currentTable.buildHeader(); 

                                        currentTable.body  = currentTable.buildBody(currentTable.tableData)                   
                                        currentTable.buildFooter(); 
                                        currentTable.render();          
                                    }else{
                                        currentTable.tableData = responseData.tabData? responseData.tabData : [];
                                        currentTable.columns   = responseData.columns? Object.values(responseData.columns):currentTable.columns ;
                                        currentTable.dataCount = responseData.dataCount;                   
                                        currentTable.buildHeader();  
                                        currentTable.body  = currentTable.buildBody(currentTable.tableData)                     
                                        currentTable.buildFooter(); 
                                        currentTable.render();          
                                    }
                            } );
                
                        }

        });
    });

    }

    formatData(column, value){
        let formattedValue = value;

        if(column.toLowerCase().indexOf("date")>-1 || column.toLowerCase().indexOf("time")>-1){
            formattedValue =  moment(new Date(value['$date'] )).format('YYYY-MM-DD hh:mm:ss')
             
        }else if(column.toLowerCase().indexOf("identifier")>-1 || column.toLowerCase().indexOf("description")>-1){
            formattedValue =  JSON.stringify(value).replace('_id','ID').replace('{','').replace('}','').replaceAll("\':","\'=")
             
        }else if( $.fn.getObjectType(value)=="boolean" &&  value){
            formattedValue ="Yes"
        }else if($.fn.getObjectType(value)=="boolean" && !value){
            formattedValue ="No"
        }
        

        return formattedValue;

    }

    init (options) {
        this.name       	= options.tableName;
        this.id         	= options.tableID;
        this.columns    	= options.columns;
        this.tableResetFlag = options.tableResetFlag?options.tableResetFlag:0
        this.header     	= options.header?options.header:"";
        this.bodyID     	= options.bodyID?options.bodyID:"";
        this.className  	= options.className?options.className:"";
        this.tableUrl  		= options.tableUrl?options.tableUrl:"";
        this.tableData  	= options.tableData?options.tableData:"";
        this.dataCount  	= options.dataCount?options.dataCount:"";
        this.headerStr  	= options.headerStr?options.headerStr:"";
        this.bodyStr    	= options.bodyStr?options.bodyStr:"";
        this.footerStr    	= options.footerStr?options.footerStr:"";
        this.remove     	= options.remove?options.remove:"";
        this.tableclass 	= options.tableclass?options.tableclass:"";
        this.type 			= options.type?options.type:"";
        this.datatype   	= options.datatype?options.datatype:"";
        this.responsive 	= options.responsive?options.responsive:"";
        this.destroy 		= options.destroy?options.destroy:true;
        this.scrollX 		= options.scrollX?options.scrollX:true;
        this.scrollY		= options.scrollY?options.scrollY:'100vh';
        this.serverside		= options.serverside?options.serverside:false;
        this.ordering 		= options.ordering?options.ordering:true;
        this.scrollcollapse = options.scrollcollapse?options.scrollcollapse:true;
        this.info 			= options.info?options.info:"";
        this.order 			= options.order?options.order:[[1, 'asc']];
        this.paging 		= options.paging?options.paging:true;
        this.AutoWidth 		= options.AutoWidth?options.AutoWidth:true;
        this.searching		= options.searching?options.searching:true;
        this.stateSave 		= options.stateSave?options.stateSave:true;
        this.className 		= options.className?options.className:"";
        this.isViewable 	= options.opts.isViewable?options.opts.isViewable:true;
        this.isEditable 	= options.opts.isEditable?options.opts.isEditable:false;
        this.isIndelible 	= options.opts.isIndelible?options.opts.isIndelible:false;
        this.excludedColList= options.excludedColList?options.excludedColList:[];
        this.tableUrlParams = options.tableUrlParams?options.tableUrlParams:[];
        this.tagID      	= options.tagID?options.tagID:"";
        this.pagingType     = options.pagingType?options.pagingType:"full_numbers";
        this.deferLoading   = options.deferLoading?options.deferLoading:[500,100];
        this.primaryKey     = options.primaryKey?options.primaryKey:'';
        this.dataPlaceholder= options.dataPlaceholder? options.dataPlaceholder:{"columns":[],"tabData":{}}
        this.body           = [];
        this.mode           = options.mode?options.mode:0;
    }

    buildHeader () {
        this.headerStr = '<table class="' + this.className + '" id ="' + this.id + '" role="grid"><thead><tr>'; //'<th style="display:none">HIDDEN</th>';
        var column = '';
        for(let i=0; i<currentTable.excludedColList.length; i++){
            currentTable.excludedColList[i] = currentTable.excludedColList[i].toLowerCase();
        }
        
        if( currentTable.columns){
            for (var j = 0; j < currentTable.columns.length; j++) {    
                if (currentTable.excludedColList.indexOf(currentTable.columns[j].toLowerCase().replaceAll(' ','')) === -1) {
                    column = currentTable.columns[j].toUpperCase();
                    currentTable.headerStr += '<th>' + $.fn.replaceAll(column, '_', ' ') + '</th>';
                }
                 
            }
            
         }
        if (currentTable.isEditable || !currentTable.isIndelible) {
               currentTable.headerStr += '<th style="min-width:13em"> OPTIONS</th></tr></thead>';

        } else{
               currentTable.headerStr += '<th> OPTIONS</th></tr></thead>';
        }
            
    }
    buildBody(tData){
        console.log('tData:')
       
        let  tableData = [];
        let  columns = [];
        for(let i=0; i<currentTable.excludedColList.length; i++){
            currentTable.excludedColList[i] = currentTable.excludedColList[i].toLowerCase();
        }

        columns.push({title:'Hidden'});
        if( currentTable.columns){
            for (var j = 0; j < currentTable.columns.length; j++) {

                if (currentTable.excludedColList.indexOf(currentTable.columns[j].toLowerCase().replaceAll(' ','')) === -1) {
                    columns.push({title: currentTable.columns[j]}); 
                }

            }
        }
        columns.push({title:'Options'});
        var rowKey = null;
        console.dir(tData)
        var size = (tData) ? tData.length : 0;
        for (var i = 0; i < size; i++) {
            let row    = [];
            
            for (var j = 0; j < currentTable.columns.length; j++) {
                rowKey = null;

                if (currentTable.excludedColList.indexOf(currentTable.columns[j].toLowerCase().replaceAll(' ','')) === -1) {
                    let objKeys = Object.keys(tData[i]);
                 
                    for(let key of objKeys ){
                         if ( key.toLowerCase().replaceAll('_','').replaceAll(' ','') == currentTable.columns[j].toLowerCase().replaceAll('_','').replaceAll(' ','')){
                            rowKey = key;
                            break;

                         }

                    }
                   // console.log(`rowkey: ${rowKey}`)
               
                 if(rowKey)   row.push(currentTable.formatData(rowKey, tData[i][rowKey]));               
                }  
            } 

            let  options ='';
            if (currentTable.isViewable) {
                options  += '<a class="btn btn-success btn" href="#" onclick="$.fn.viewEntry(\'' + tData[i][currentTable.primaryKey].toString() + '\')">' +
                    '<i class="glyphicon glyphicon-zoom-in icon-white"></i>View</a>';
            }
            if (currentTable.isEditable) {
                options  += '<a class="btn btn-info btn" href="#" onclick="$.fn.editEntry(\'' + tData[i][currentTable.primaryKey].toString() + '\')">' +
                    '<i class="glyphicon glyphglyphicon glyphicon-edit icon-white"></i> ' +
                    'Edit</a>';
            }
            if (!currentTable.isIndelible) {
                options  += '<a class="btn btn-danger btn" href="#"  onclick="$.fn.deleteEntry(\'' + tData[i][currentTable.primaryKey].toString()  + '\')"><i class="glyphicon glyphglyphicon glyphicon-edit icon-white"></i>Delete</a>';
            }
            row.push(options)
            tableData.push(row);
        }
 
       return tableData;
    }
    buildFooter () {
        this.footerStr = '<tfoot><tr>';//'<th style="display:none"></th>';
        var column = '';
        for(let i=0; i<this.excludedColList.length; i++){
            this.excludedColList[i] = this.excludedColList[i].toLowerCase();
        }
        if(this.columns){
        for (var j = 0; j < this.columns.length; j++) {            

            if (this.excludedColList.indexOf(this.columns[j].toLowerCase().replaceAll(' ','')) === -1) {
                column = this.columns[j].toUpperCase();
                this.footerStr += '<th>' + $.fn.replaceAll(column, '_', ' ') + '</th>';
            }
        }
    }
         if (currentTable.isEditable || !currentTable.isIndelible) {
               this.footerStr += '<th style="min-width:13em"> OPTIONS</th></tr></thead>';
        } else{
               this.footerStr += '<th> OPTIONS</th></tr></thead>';
        }
    }

   draw() {
        if (currentTable.tableData.length < 1000000) {
           
            $('#' + currentTable.id).dataTable({
                "data": currentTable.body,
                "processing": currentTable.processing,
                "serverSide":  currentTable.serverSide,
                "responsive":  currentTable.responsive,
                "scrollCollapse": currentTable.scrollCollapse,
           //     "order": currentTable.order,
                "paging": currentTable.paging,
                "AutoWidth": currentTable.AutoWidth,
                "searching": currentTable.searching,
                "stateSave": currentTable.stateSave
            });
        } else {
            $('#' + currentTable.id).dataTable({
                "data":  currentTable.body,
                "processing": currentTable.processing,
                "serverSide":  currentTable.serverSide,
                "responsive":  currentTable.responsive,
                "scrollCollapse": currentTable.scrollCollapse,
                "order": currentTable.order,
                "paging": currentTable.paging,
                "AutoWidth": currentTable.AutoWidth,
                "searching": currentTable.searching,
                "stateSave": currentTable.stateSave,
                "ajax": $.fn.dataTable.pipeline(  {
                    url: currentTable.tableUrl,
                    type: 'GET',
                    dataType: 'JSON',
                    dataSrc:function(data){
                        return currentTable.applyColumnFilter(data.tabData)
                    },
                  //  data: (typeof currentTable.tableUrlParams).toLowerCase != 'object'?  $.fn.convertURLQueryToObject (currentTable.tableUrlParams):currentTable.tableUrlParams,
                    priKey:currentTable.primaryKey

                }),
                "deferLoading": currentTable.deferLoading,
                "paging": currentTable.paging,
                "error": function(response) {
                    console.dir(response);
                }

            });
      
        }
    }
	
	render(){
    
       // $('#' + currentTable.tagID).html(currentTable.headerStr+currentTable.bodyStr + currentTable.footerStr);
        $('#' + currentTable.tagID).html(currentTable.headerStr+ currentTable.footerStr);
      //   $('#' + currentTable.tagID).html('<table class="' + currentTable.className + '" id ="' + currentTable.id + '" role="grid"></table>');
	    currentTable.draw();	
		
    }
  
};

export default  Table;