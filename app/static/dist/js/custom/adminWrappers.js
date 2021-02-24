$.fn.drawPageHeader =function(currentPage, mainPage,subPageList){
	let subPages     = [];
	let subPageCount = subPageList.length;
	let count 		 = 0;
	subPageList.forEach(function(subPage) {
		++count;
		if (count  ==subPageCount){
			subPages.append(`<li class="breadcrumb-item active" id="${subPage}-id">${subPage}</li>`);
		}else{
			subPages.append(`<li class="breadcrumb-item" id="${subPage}-id">${subPage}</li>`);
		}
		
	});
	 return `<div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1>${currentPage}</h1>
          </div>
          <div class="col-sm-6" id="page-header">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item" id="${mainPage}-id"><a href="#">${mainPage}</a></li>
             ${subPages.join('')}
            </ol>
          </div>
        </div>
      </div><!-- /.container-fluid -->`;
	
}

$.fn.addRowWrapper =  function(columnList){	
	 return `<div class="row">${columnList.join('')}`
}

$.fn.addColumnWrapper =function(colClass, colCardList){
	
	return `<div class="${colClass}">
			  ${colCardList.join('')}
          </div>
          <!-- /.col -->`
	
}

$.fn.addCardWrapper = function(cardTitle,cardContent, cardFooter, cardBodyClass="card-body",cardTools=null){
	let cardTools =  cardTools?`
                <div class="card-tools">
                 ${cardTools}
                </div>`:'';
	let template  = ` <div class="card">
					  <div class="card-header">
						<h3 class="card-title">${cardTitle}</h3>
                     ${cardTools}
					  </div>
					  <!-- /.card-header -->
					  <div class="${cardBodyClass}">
						  ${cardContent}
					  </div>
                      <!-- /.card-body -->`;
     let footerTemplate=`<div class="card-footer clearfix">${cardFooter}</div>`
				
     if(cardFooter.length() > 0){
	   template =template+footerTemplate;   
     }     
     template =template+`</div><!-- /.card -->`
	 return template;	
}

$.fn.drawTableContent  = function(tableClass,tabCols, tabData){

	let tableHeader    = `<tr><td>${tabCols.join('</td><td>')}</td> </tr>`;
	let tableBody      = [];
	tableBody.push('<tbody>');
	tabData.forEach(function(row){
		let rowData=[] 
		    rowData.push('<tr>')
			for(let i=0; i<tabCols.length; i++ ){
				
				rowData.push(`<td>${row[i]}</td>`);
				
			}
			rowData.push('</tr>')
		   tableBody.push(rowData.join(''))			
		});
	tableBody.push('</tbody>');
	tableBody=  tableBody.join('')
	return `<table class="${tableClass}">${tableHeader}${tableBody}</table>`;
}

$.fn.drawStatusBox = function(statusClass,statusCount,statusTitle,linkText){
	return `<div class="col-lg-3 col-6">
            <!-- small box -->
            <div class="small-box bg-${statusClass}">
              <div class="inner">
                <h3>${statusCount}</h3>

                <p>${statusTitle}</p>
              </div>
              <div class="icon">
                <i class="ion ion-bag"></i>
              </div>
              <a href="#" class="small-box-footer">${linkText}<i class="fas fa-arrow-circle-right"></i></a>
            </div>
          </div>`
	
}