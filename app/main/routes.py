from datetime import datetime
import flask
from flask import render_template, flash, redirect, url_for, request, g, jsonify, current_app,abort, send_from_directory
from werkzeug.utils import secure_filename
from flask_login import current_user, login_required
from flask_babel import _, get_locale
#from guess_language import guess_language
from app import db, moment
from app.main.forms import LoginForm,VCenterForm #, EditProfileForm, EmptyForm, PostForm, SearchForm, MessageForm
from app.models import Users, Teams, Roles, Vcenters, AuditTrail, SiteSettings,Images,VMs,Datastores,Clusters, Hosts #, Post, Message, Notification
#from app.translate import translate
from app.main import bp
import traceback, json
from app.main.serializer import Serializer
import os
from PIL import Image,ImageEnhance
#@bp.before_app_request
#def before_request():
#    if current_user.is_authenticated:
#        current_user.last_seen = datetime.utcnow()
#        db.session.commit()
##        g.search_form = SearchForm()
#    g.locale = str(get_locale())

@bp.route('/main/images', methods=['GET', 'POST'])
@bp.route('/images', methods=['GET', 'POST'])
@login_required
def process_image_request():
    response     = {}
    path_sep     = os.path.sep
    record_index = 0
    print(request)
    for i in request.form.keys():
       print('key:{k} => value:{v}'.format(k=i,v=request.form[i]))
    for i in request.files.keys():
       print('file keys:{k} => value:{v}'.format(k=i,v=request.files[i]))
    try:
        if current_user.is_authenticated:
          method                 =  request.method.lower()      
          action                 =  request.form['action'] if request.form['action'] else None
          action                 =  request.form['qt']     if None== action and request.form['qt'] else action
          action                 =  request.form['t']      if None== action and request.form['t'] else action
          query_fields           =  request.form['qf']     if request.form['qf'] else None
          query_fields           =  request.form['f']      if request.form['f'] else query_fields
          display_format         =  request.form['df']     if request.form['df'] else 'table'
          if method              == 'post':
            if action            == 'add':
                image_path       =  ''
                uploaded_file    = request.files['image_file']
                filename         = request.form['filename']
                fileFormat       = request.form['fileformat']
                fileSize         = request.form['filesize']
                lastModifiedDate = request.form['lastmodifieddate']
                imageCategory    = request.form['imagecategory']
                dimensions       = json.loads(request.form['dimensions'])
                if filename != '':
                    filename = secure_filename(filename)
                    file_ext = os.path.splitext(filename)[1]
                    if file_ext not in current_app.config['IMAGE_UPLOAD_EXTENSIONS']: #or file_ext != validate_image(uploaded_file.stream):
                        abort(400)
                image_folder = current_app.config['IMAGE_UPLOAD_DIRECTORY']+path_sep+imageCategory
                if not os.path.exists(image_folder):
                    os.mkdir(image_folder)
                uploaded_file_path = os.path.join(image_folder, filename)
                record_index     =  Images.get_last_record_id() +1
                image            =  Images(id       = record_index,
                    fileName               =  filename,
                    fileFormat             =  fileFormat,
                    fileURL                =  os.path.sep+uploaded_file_path.split(os.path.sep)[-4]+os.path.sep+uploaded_file_path.split(os.path.sep)[-3]+os.path.sep+uploaded_file_path.split(os.path.sep)[-2]+os.path.sep+uploaded_file_path.split(os.path.sep)[-1],
                    fileSize               =  fileSize,
                    dimension              =  request.form['dimensions'],
                    sourceURL              =  request.form['sourceUrl'] ,
                    lastModifiedDate       =  lastModifiedDate
                    )
                image.save()
                uploaded_file.save(uploaded_file_path)
                image_path             =  os.path.sep+uploaded_file_path.split(os.path.sep)[-4]+os.path.sep+uploaded_file_path.split(os.path.sep)[-3]+os.path.sep+uploaded_file_path.split(os.path.sep)[-2]+os.path.sep+uploaded_file_path.split(os.path.sep)[-1]
                model                  =  'Images'
                trailIndex             =  AuditTrail.get_last_record_id() +1
                query_fields           =  {'id':record_index}
                description_info       =  'Addition of new record to {m}'.format(m=model)  
                change_type            =  'INSERT'
                oldData				  =   {}
                newData 			      =   image.to_mongo()
                auditTrail                =   AuditTrail(id=trailIndex,description= description_info, oldData=oldData, newData=newData,affectedTable=model,changeTime=str(datetime.utcnow()),changeType=change_type,userName=current_user.username,userID=current_user.id,recordIdentifier=query_fields )
                auditTrail.save()
                image                     = Image.open(uploaded_file_path)
                resized_image             = image.resize((dimensions['width'], dimensions['height']))
                sharp_image               = ImageEnhance.Sharpness(resized_image)
                sharp_image.enhance(1.85).save(uploaded_file_path)
                response['uploadPath']    = image_path
                response['imageCategory'] = imageCategory
                response['isSuccessful']  = True
                response['model']         = 'Images'
                response['header']        = 'New Image Record'
                response['error']         = None
                response['record_index']  = record_index
                return jsonify(response)
            elif  action == 'del':
                model                    =  'Images'
                action                   =  'del'
                trailIndex               =  AuditTrail.get_last_record_id() +1
                newData				     =   {}
                description_info         =  'Removal of {m} record with details: {d} '.format(m=model,d=query_fields)
                change_type              =  'DELETE'
                oldData              	 =  image.to_mongo() 
                auditTrail               =  AuditTrail(id=trailIndex,description= description_info, oldData=oldData, newData=newData,affectedTable=model,changeTime=str(datetime.utcnow()),changeType=change_type,userName=current_user.username,userID=current_user.id,recordIdentifier=query_fields )
                auditTrail.save()
                        
                image					 = Images.objects(__raw__=query_fields).first()
                image.delete()
                response['message']      = 'Images with  ID \'{}\' has been successfully removed'.format(record_index)
                response['isSuccessful'] = True
                response['model']        = 'Images'
                response['header']       = 'Images Record Removal'
                response['error']        = None
                response['record_index'] = query_fields['_id']
                return jsonify(response)
         
    except Exception as e:
        traceback.print_exc()
        response['message']      = 'There was an error uploading the image'
        response['isSuccessful'] = False
        response['model']        = 'Images'
        response['error']        = str(e)
        response['header']       = "Image Upload Error"
        return jsonify(response)
        
@bp.route('/main/schema', methods=['GET'])
@bp.route('/schema',methods=['GET'] )
@login_required
def getSchema():
    model =  request.args.get('qf').lower()
    print('model: {}'.format(model))
    if model == 'vcenters':
        return jsonify(Vcenters.get_schema())
    elif model == 'teams':
        return jsonify(Teams.get_schema())
    elif model == 'audittrail':
        return jsonify(AuditTrail.get_schema())
    elif model == 'sitesettings':
        return jsonify(SiteSettings.get_schema())
    elif model == 'images':
        return jsonify(Images.get_schema())
    elif model == 'sites':
        return jsonify(Sites.get_schema())
    elif model == 'hosts':
        return jsonify(Hosts.get_schema())
    elif model == 'datastores':
        return jsonify(Datastores.get_schema())
    elif model == 'clusters':
        return jsonify(Clusters.get_schema())



@bp.route('/main/data', methods=['GET', 'POST'])
@bp.route('/data', methods=['GET', 'POST'])
@login_required
def process_data_request():
    response = {}
    for i in request.form.keys():
       if 'password' in i:      
        print('key:{k} => value:{v}'.format(k=i,v=Serializer().multiDemystify(request.form[i],3)))
       else:
           print('key:{k} => value:{v}'.format(k=i,v=request.form[i]))
    print('request method: {}'.format(flask.request.method))
    is_valid       =  None
    model          =  None
    query_fields   =  None
    display_format =  None
    action         =  None
    newData        =  {}
    oldData        =  None
    try:
        if current_user.is_authenticated:
            method       =  flask.request.method.lower()      
            if method == 'post':
                for  key in  request.form.keys():
                    print('post key: '+key)
                    if key =='is_form_data_valid':
                        is_valid     =  request.form[key].lower()
                    elif key =='data_item' or key == 'c':
                        model     =  request.form[key].lower()
                    elif key =='f' or key =='qf':
                        query_fields    =  request.form[key].lower()
                    elif key =='t'  or key =='qt':
                        action    =  request.form[key].lower()
                    if  'pl' in key:
                       formatted_key = key.replace('pl[','').replace(']','')
                       newData[formatted_key] = request.form[key]          
                print('action: '+action)
                print('query_fields: '+query_fields)
            elif   method  == 'get':
                model            =  request.args.get('c').lower() if request.args.get('c') else None
                action           =  request.args.get('qt') if request.args.get('qt') else 'sel'
                display_format   =  request.args.get('df') if request.args.get('df') else None
                query_fields     =  json.loads(request.args.get('qf')) if request.args.get('qf') != None  else None
            print('action: '+action)
            print('model: '+model)
            trailIndex           =  AuditTrail.get_last_record_id() +1
            if action  in ['add','udt', 'del']:
                if action            !='add':
                  query_fields       =  json.loads(query_fields)
                  if   model         == 'vcenters':
                       oldData        = Vcenters.objects(__raw__=query_fields).first()
                  elif model         == 'teams':
                       oldData        = Teams.objects(__raw__=query_fields).first()
                else:
                    query_fields     = {}
                description_info     = None
                change_type          = None
                if action            == 'add':
                    description_info  =  'Addition of new record to {m}'.format(m=model)  
                    change_type       =  'INSERT'
                elif action          == 'udt':
                    description_info  =  'Modification of {m} record with details: {d} '.format(m=model,d=query_fields)
                    change_type       =  'UPDATE'
                elif action          == 'del':
                    description_info  =  'Removal of {m} record with details: {d} '.format(m=model,d=query_fields)
                    change_type       =  'DELETE'
                print('logging change...')
                oldData=  oldData.to_mongo() if oldData else {}
                auditTrail            =  AuditTrail(id=trailIndex,description= description_info, oldData=oldData, newData=newData,affectedTable=model,changeTime=str(datetime.utcnow()),changeType=change_type,userName=current_user.username,userID=current_user.id,recordIdentifier=query_fields )
                auditTrail.save()
        
            if method == 'post':
                is_form_valid =  True if is_valid =='yes' else False
                if is_form_valid:
                    if action == 'add':
                        if model =='vcenters':
                            print('last record if: '+str(Vcenters.get_last_record_id()))
                            record_index     =  Vcenters.get_last_record_id() +1
                            print('record index: {}'.format(record_index))
                            vcenter          = Vcenters(id       = record_index,
                            name             =  request.form['pl[name]'],
                            ipAddress        =  request.form['pl[ipaddress]'],
                            version          =  request.form['pl[version]'],
                            username         =  request.form['pl[username]'],
                            password         =  request.form['pl[password]'],
                            serviceUri       =  request.form['pl[serviceuri]'],
                            port             =  request.form['pl[port]'],
                            productLine      =  request.form['pl[productline]'],
                            creationDate     =  request.form['pl[creationdate]'],
                            lastModifiedDate =  request.form['pl[lastmodifieddate]'],
                            active           = True if str(request.form['pl[active]']).lower()== 'yes' else False)
                            vcenter.save()
                            response['message']      = 'A new record  has been successfully added to VCenters'
                            response['isSuccessful'] = True
                            response['model']        = 'VCenters'
                            response['header']       = 'New VCenter Record'
                            response['error']        = None
                            response['record_index'] = record_index
                            return jsonify(response)
                        elif (model =='teams'):
                            print('last record if: '+str(Teams.get_last_record_id()))
                            record_index     =  Teams.get_last_record_id() +1
                            print('record index: {}'.format(record_index))
                            team             =  Teams(id       = record_index,
                            team_name             =  request.form['pl[team_name]'],
                            team_description      =  request.form['pl[team_description]'],
                            creationDate     =  request.form['pl[creationdate]'],
                            lastModifiedDate =  request.form['pl[lastmodifieddate]'])
                            team.save()
                            response['message']      = 'A new record  has been successfully added to Teams'
                            response['isSuccessful'] =  True
                            response['model']        = 'Teams'
                            response['header']       = 'New team Record'
                            response['error']        = None
                            response['record_index'] = record_index
                            return jsonify(response)
                        elif (model =='sitesettings'):
                            print('last record if: '+str(SiteSettings.get_last_record_id()))
                            record_index     =  SiteSettings.get_last_record_id() +1
                            print('record index: {}'.format(record_index))
                            siteSetting              =  SiteSettings(id       = record_index,
                            siteName                 =  request.form['pl[sitename]'],
                            siteTitle                =  request.form['pl[sitetitle]'],
                            siteLogo         	     =  request.form['pl[sitelogo]'],
                            ldapServer               =  request.form['pl[ldapserver]'], 
                            ldapUser                 =  request.form['pl[ldapuser]'], 
                            ldapPassword             =  request.form['pl[ldappassword]'],
                            emailServer              =  request.form['pl[emailserver]'], 
                            emailUser                =  request.form['pl[emailuser]'],
                            emailPassword            =  request.form['pl[emailpassword]'],
                            lastModifiedDate         =  request.form['pl[lastmodifieddate]']
                                )
                            siteSetting.save()
                            response['message']      = 'A new record  has been successfully added to SiteSettings'
                            response['isSuccessful'] =  True
                            response['model']        = 'SiteSettings'
                            response['header']       = 'New Site Settings Record'
                            response['error']        = None
                            response['record_index'] = record_index
                            return jsonify(response)
                        elif (model =='sites'):
                            print('last record if: '+str(Sites.get_last_record_id()))
                            record_index     =  Sites.get_last_record_id() +1
                            print('record index: {}'.format(record_index))
                            site                     =  Sites(id       = record_index,
                            siteName                 =  request.form['pl[sitename]'],
                            lastModifiedDate         =  request.form['pl[lastmodifieddate]']
                                )
                            site.save()
                            response['message']      = 'A new record  has been successfully added to Sites'
                            response['isSuccessful'] =  True
                            response['model']        = 'Sites'
                            response['header']       = 'New Site Settings Record'
                            response['error']        = None
                            response['record_index'] = record_index
                            return jsonify(response)
                    elif action ==  'udt':
                        print('updating record')
                        if (model =='vcenters'):
                           
                            vcenter                 =  Vcenters.objects(__raw__=query_fields).update( 
                            set__name               =  request.form['pl[name]'],
                            set__ipAddress          =  request.form['pl[ipaddress]'],
                            set__version            =  request.form['pl[version]'],
                            set__username           =  request.form['pl[username]'],
                            set__password           =  request.form['pl[password]'],
                            set__serviceUri         =  request.form['pl[serviceuri]'],
                            set__port               =  int(request.form['pl[port]'].strip()),
                            set__productLine        =  request.form['pl[productline]'],
                            set__lastModifiedDate   =  datetime.utcnow(),
                            set__active             =  True if str(request.form['pl[active]']).lower()== 'yes' else False               
                            )
                            response['message']      = 'The details of the \'{}\' have been successfully updated'.format(request.form['pl[name]'])
                            response['isSuccessful'] = True
                            response['model']        = 'VCenters'
                            response['header']       = 'VCenters Record Update'
                            response['error']        = None
                            response['record_index'] = query_fields['_id']
                        elif (model =='teams'):
                            team      				=  Teams.objects(__raw__=query_fields).update( 
                            set__team_name               =  request.form['pl[team_name]'],
                            set__team_description        =  request.form['pl[team_description]'],
                            set__lastModifiedDate   =  datetime.utcnow(),              
                            )
                            response['message']      = 'The details of the \'{}\' have been successfully updated'.format(request.form['pl[name]'])
                            response['isSuccessful'] = True
                            response['model']        = 'teams'
                            response['header']       = 'teams Record Update'
                            response['error']        = None
                            response['record_index'] = query_fields['_id']
                        elif (model =='sitesettings'):
                            siteSettings      		 =  SiteSettings.objects(__raw__=query_fields).update( 
                            set__siteName            =  request.form['pl[sitename]'],
                            set__siteTitle           =  request.form['pl[sitetitle]'],
                            set__siteLogo            =  request.form['pl[sitelogo]'], 
							set__ldapServer          =  request.form['pl[ldapserver]'], 
 							set__ldapUser            =  request.form['pl[ldapuser]'],
                            set__ldapPassword        =  request.form['pl[ldappassword]'],
						    set__emailServer         =  request.form['pl[emailserver]'],
							set__emailUser           =  request.form['pl[emailuser]'],
							set__emailPassword       =  request.form['pl[emailpassword]'],
							set__lastModifiedDate    =  request.form['pl[lastmodifieddate]']							
                            )
                            response['message']      = 'The details of the \'{}\' have been successfully updated'.format(request.form['pl[sitename]'])
                            response['isSuccessful'] = True
                            response['model']        = 'SiteSettings'
                            response['header']       = 'SiteSettings Update'
                            response['error']        = None
                            response['record_index'] = query_fields['_id']
                        return  jsonify(response)   
                        elif (model =='sites'):
                            siteSettings      		 =  Sites.objects(__raw__=query_fields).update( 
                            set__siteName            =  request.form['pl[sitename]'],
							set__lastModifiedDate    =  request.form['pl[lastmodifieddate]']							
                            )
                            response['message']      = 'The details of the \'{}\' have been successfully updated'.format(request.form['pl[sitename]'])
                            response['isSuccessful'] = True
                            response['model']        = 'Sites'
                            response['header']       = 'Sites Update'
                            response['error']        = None
                            response['record_index'] = query_fields['_id']
                        return  jsonify(response)  
                    elif action ==  'del':
                        print('deleting record...')
                        record_index = query_fields['_id']
                        if (model =='vcenters'):
                            vcenter   = Vcenters.objects(__raw__=query_fields).first()
                            vcenter.delete()
                            response['message']      = 'VCenters with  ID \'{}\' has been successfully removed'.format(record_index)
                            response['isSuccessful'] = True
                            response['model']        = 'VCenters'
                            response['header']       = 'VCenters Record Removal'
                            response['error']        = None
                            response['record_index'] = record_index
                        elif (model =='teams'):
                            team   = Teams.objects(__raw__=query_fields).first()
                            team.delete()
                            response['message']      = 'Teams with  ID \'{}\' has been successfully removed'.format(record_index)
                            response['isSuccessful'] = True
                            response['model']        = 'Teams'
                            response['header']       = 'Teams Record Removal'
                            response['error']        = None
                            response['record_index'] = record_index
                        return  jsonify(response)           
                        elif (model =='sites'):
                            team   = Sites.objects(__raw__=query_fields).first()
                            team.delete()
                            response['message']      = 'Sites with  ID \'{}\' has been successfully removed'.format(record_index)
                            response['isSuccessful'] = True
                            response['model']        = 'Sites'
                            response['header']       = 'Sites Record Removal'
                            response['error']        = None
                            response['record_index'] = record_index
                        return  jsonify(response) 
            elif method  == 'get':
                print("model: {}".format(model))
                print("action: {}".format(action))
                print("query_fields: {}".format(query_fields))
                print("display_format: {}".format(display_format))
                if model == 'vcenters':
                    if action=='sel' and display_format=='form':
                        results          = Vcenters.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        print('creationDate: {}'.format(results['creationDate']))
                        print('lastModifiedDate: {}'.format(results['lastModifiedDate']))
                        results['creationDate']      = str( (results['creationDate']))
                        results['lastModifiedDate']  = str((results['lastModifiedDate']))
                        return  jsonify({'columns':(Vcenters.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        vcenter_records = Vcenters.objects.all()
                        return jsonify({'columns':(Vcenters.get_schema())[model],'tabData':vcenter_records,'dataCount':(Vcenters.get_record_count())})
                elif model == 'teams':
                    if action=='sel' and display_format=='form':
                        results   = Teams.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Teams.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        team_records = Teams.objects.all()
                        return jsonify({'columns':(Teams.get_schema())[model],'tabData':team_records,'dataCount':(Teams.get_record_count())})   
                elif model == 'audittrail':
                    if action=='sel' and display_format=='form':
                        results   = AuditTrail.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(AuditTrail.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        audit_records = AuditTrail.objects.all()
                        return jsonify({'columns':(AuditTrail.get_schema())[model],'tabData':audit_records,'dataCount':(AuditTrail.get_record_count())})                    
                elif model == 'sitesettings':
                    if action=='sel' and display_format=='form':
                        results   = SiteSettings.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(SiteSettings.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        site_records = SiteSettings.objects.all()
                        return jsonify({'columns':(SiteSettings.get_schema())[model],'tabData':site_records,'dataCount':(SiteSettings.get_record_count())}) 
                elif model =='images':
                    if action=='sel' and display_format=='form':
                        results         = Images.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Images.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = Images.objects.all()
                        return jsonify({'columns':(Images.get_schema())[model],'tabData':image_record,'dataCount':(Images.get_record_count())})                
                elif model =='vms':
                    if action=='sel' and display_format=='form':
                        results         = VMs.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(VMs.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = VMs.objects.all()
                        return jsonify({'columns':(VMs.get_schema())[model],'tabData':image_record,'dataCount':(VMs.get_record_count())})              
                elif model =='sites':
                    if action=='sel' and display_format=='form':
                        results         = Sites.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Sites.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = Sites.objects.all()
                        return jsonify({'columns':(Sites.get_schema())[model],'tabData':image_record,'dataCount':(Sites.get_record_count())})
                elif model =='clusters':
                    if action=='sel' and display_format=='form':
                        results         = Clusters.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Clusters.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = Clusters.objects.all()
                        return jsonify({'columns':(Clusters.get_schema())[model],'tabData':image_record,'dataCount':(Clusters.get_record_count())})  						
                elif model =='datastores':
                    if action=='sel' and display_format=='form':
                        results         = Datastores.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Datastores.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = Datastores.objects.all()
                        return jsonify({'columns':(Datastores.get_schema())[model],'tabData':image_record,'dataCount':(Datastores.get_record_count())})  
                elif model =='datastores':
                    if action=='sel' and display_format=='form':
                        results         = Datastores.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Datastores.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = Datastores.objects.all()
                        return jsonify({'columns':(Datastores.get_schema())[model],'tabData':image_record,'dataCount':(Datastores.get_record_count())}) 
                elif model =='hosts':
                    if action=='sel' and display_format=='form':
                        results         = Hosts.objects(__raw__=query_fields).first() if  query_fields is not None else []
                        return  jsonify({'columns':(Hosts.get_schema())[model],'tabData':results,'dataCount':1 })
                    elif action=='sel' and display_format=='table' :
                        image_record = Hosts.objects.all()
                        return jsonify({'columns':(Hosts.get_schema())[model],'tabData':image_record,'dataCount':(Hosts.get_record_count())}) 
        else:
            response['message']      = 'form is not valid'
            response['isSuccessful'] = False
            response['model']        = 'VCenters'
    except Exception as e:
        traceback.print_exc()
        response['message']      = 'There was an error during the data update. Please contact your administrator'
        response['isSuccessful'] = False
        response['model']        = model
        response['error']        = str(e)
        response['header']       = "Error Updating {m} Information: ".format(m=model)
    return  jsonify(response)

@bp.route('/main/vcenters', methods=['GET', 'POST'])
@bp.route('/vcenters',methods=['GET', 'POST'] )
@login_required
def vcenter():
    if current_user.is_authenticated:
        if flask.request.method == 'POST':
            form = VCenterForm()
            if form.validate_on_submit():
                pass           
    return bp.send_static_file("data.html")

@bp.route('/', methods=['GET', 'POST'])
@bp.route('/main/index', methods=['GET', 'POST'])
@bp.route('/index', methods=['GET', 'POST'])
@login_required
def index():
    #
    # form = PostForm()
    #if form.validate_on_submit():
       # language = guess_language(form.post.data)
       # if language == 'UNKNOWN' or len(language) > 5:
       #     language = ''
       # post = Post(body=form.post.data, author=current_user, language=language)
       # db.session.add(post)
       # db.session.commit()
       # flash(_('Your post is now live!'))
       # return redirect(url_for('main.index'))
    #page = request.args.get('page', 1, type=int)
    #posts = current_user.followed_posts().paginate(page, current_app.config['POSTS_PER_PAGE'], False)
    #next_url = url_for('main.index', page=posts.next_num) \
    #    if posts.has_next else None
    #prev_url = url_for('main.index', page=posts.prev_num) \
    #    if posts.has_prev else None
    opts ={} 
    opts['logo']        =  None
    opts['startTime']   =  datetime.utcnow()
    opts['timeOut']     =  None
    opts['siteName']    =  'CSAM'
    opts['userName']    =  None
    opts['previousDest']=  None
    opts['currentTime'] =  datetime.utcnow()
    opts['siteTitle']   =   'Compute and Storage Self-Service Platform (CS3P)'
    return render_template('index.html', title='Dashboard',pageID='dashboard',options=opts)

"""
@bp.route('/explore')
@login_required
def explore():
    page = request.args.get('page', 1, type=int)
    posts = Post.query.order_by(Post.timestamp.desc()).paginate(
        page, current_app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('main.explore', page=posts.next_num) \
        if posts.has_next else None
    prev_url = url_for('main.explore', page=posts.prev_num) \
        if posts.has_prev else None
    return render_template('index.html', title=_('Explore'),
                           posts=posts.items, next_url=next_url,
                           prev_url=prev_url)


@bp.route('/user/<username>')
@login_required
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    posts = user.posts.order_by(Post.timestamp.desc()).paginate(
        page, current_app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('main.user', username=user.username,
                       page=posts.next_num) if posts.has_next else None
    prev_url = url_for('main.user', username=user.username,
                       page=posts.prev_num) if posts.has_prev else None
    form = EmptyForm()
    return render_template('user.html', user=user, posts=posts.items,
                           next_url=next_url, prev_url=prev_url, form=form)


@bp.route('/user/<username>/popup')
@login_required
def user_popup(username):
    user = User.query.filter_by(username=username).first_or_404()
    form = EmptyForm()
    return render_template('user_popup.html', user=user, form=form)


@bp.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.about_me = form.about_me.data
        db.session.commit()
        flash(_('Your changes have been saved.'))
        return redirect(url_for('main.edit_profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    return render_template('edit_profile.html', title=_('Edit Profile'),
                           form=form)


@bp.route('/follow/<username>', methods=['POST'])
@login_required
def follow(username):
    form = EmptyForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=username).first()
        if user is None:
            flash(_('User %(username)s not found.', username=username))
            return redirect(url_for('main.index'))
        if user == current_user:
            flash(_('You cannot follow yourself!'))
            return redirect(url_for('main.user', username=username))
        current_user.follow(user)
        db.session.commit()
        flash(_('You are following %(username)s!', username=username))
        return redirect(url_for('main.user', username=username))
    else:
        return redirect(url_for('main.index'))


@bp.route('/unfollow/<username>', methods=['POST'])
@login_required
def unfollow(username):
    form = EmptyForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=username).first()
        if user is None:
            flash(_('User %(username)s not found.', username=username))
            return redirect(url_for('main.index'))
        if user == current_user:
            flash(_('You cannot unfollow yourself!'))
            return redirect(url_for('main.user', username=username))
        current_user.unfollow(user)
        db.session.commit()
        flash(_('You are not following %(username)s.', username=username))
        return redirect(url_for('main.user', username=username))
    else:
        return redirect(url_for('main.index'))


@bp.route('/translate', methods=['POST'])
@login_required
def translate_text():
    return jsonify({'text': translate(request.form['text'],
                                      request.form['source_language'],
                                      request.form['dest_language'])})


@bp.route('/search')
@login_required
def search():
    if not g.search_form.validate():
        return redirect(url_for('main.explore'))
    page = request.args.get('page', 1, type=int)
    posts, total = Post.search(g.search_form.q.data, page,
                               current_app.config['POSTS_PER_PAGE'])
    next_url = url_for('main.search', q=g.search_form.q.data, page=page + 1) \
        if total > page * current_app.config['POSTS_PER_PAGE'] else None
    prev_url = url_for('main.search', q=g.search_form.q.data, page=page - 1) \
        if page > 1 else None
    return render_template('search.html', title=_('Search'), posts=posts,
                           next_url=next_url, prev_url=prev_url)


@bp.route('/send_message/<recipient>', methods=['GET', 'POST'])
@login_required
def send_message(recipient):
    user = User.query.filter_by(username=recipient).first_or_404()
    form = MessageForm()
    if form.validate_on_submit():
        msg = Message(author=current_user, recipient=user,
                      body=form.message.data)
        db.session.add(msg)
        user.add_notification('unread_message_count', user.new_messages())
        db.session.commit()
        flash(_('Your message has been sent.'))
        return redirect(url_for('main.user', username=recipient))
    return render_template('send_message.html', title=_('Send Message'),
                           form=form, recipient=recipient)


@bp.route('/messages')
@login_required
def messages():
    current_user.last_message_read_time = datetime.utcnow()
    current_user.add_notification('unread_message_count', 0)
    db.session.commit()
    page = request.args.get('page', 1, type=int)
    messages = current_user.messages_received.order_by(
        Message.timestamp.desc()).paginate(
            page, current_app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('main.messages', page=messages.next_num) \
        if messages.has_next else None
    prev_url = url_for('main.messages', page=messages.prev_num) \
        if messages.has_prev else None
    return render_template('messages.html', messages=messages.items,
                           next_url=next_url, prev_url=prev_url)


@bp.route('/export_posts')
@login_required
def export_posts():
    if current_user.get_task_in_progress('export_posts'):
        flash(_('An export task is currently in progress'))
    else:
        current_user.launch_task('export_posts', _('Exporting posts...'))
        db.session.commit()
    return redirect(url_for('main.user', username=current_user.username))


@bp.route('/notifications')
@login_required
def notifications():
    since = request.args.get('since', 0.0, type=float)
    notifications = current_user.notifications.filter(
        Notification.timestamp > since).order_by(Notification.timestamp.asc())
    return jsonify([{
        'name': n.name,
        'data': n.get_data(),
        'timestamp': n.timestamp
    } for n in notifications])
"""
