import base64
from datetime import datetime, timedelta
from hashlib import md5
import json
import os
from time import time
from flask import current_app, url_for
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import redis
import rq
from app import db, login, get_debug_template
from app.search import add_to_index, remove_from_index, query_index
#from flask_mongoengine.wtf import model_form
import  json
from uuid import uuid4
from app.couchdbmanager import CouchdbMixin
from app import db
class SearchableMixin(object):
    @classmethod
    def search(cls, expression, page, per_page):
        ids, total = query_index(cls.__tablename__, expression, page, per_page)
        if total == 0:
            return cls.objects(id=0), 0
        when = []
        for i in range(len(ids)):
            when.append((ids[i], i))
        return cls.query.filter(cls.id.in_(ids)).order_by(
            db.case(when, value=cls.id)), total

    @classmethod
    def before_commit(cls, session):
        session._changes = {
            'add': list(session.new),
            'update': list(session.dirty),
            'delete': list(session.deleted)
        }

    @classmethod
    def after_commit(cls, session):
        for obj in session._changes['add']:
            if isinstance(obj, SearchableMixin):
                add_to_index(obj.__tablename__, obj)
        for obj in session._changes['update']:
            if isinstance(obj, SearchableMixin):
                add_to_index(obj.__tablename__, obj)
        for obj in session._changes['delete']:
            if isinstance(obj, SearchableMixin):
                remove_from_index(obj.__tablename__, obj)
        session._changes = None

    @classmethod
    def reindex(cls):
        for obj in cls.query:
            add_to_index(cls.__tablename__, obj)

#db.objects.listen(db.session, 'before_commit', SearchableMixin.before_commit)
#db.objects.listen(db.session, 'after_commit', SearchableMixin.after_commit)
class PaginatedAPIMixin(object):
    @staticmethod
    def to_collection_dict(query, page, per_page, endpoint, **kwargs):
        resources = query.paginate(page, per_page, False)
        data = {
            'items': [item.to_dict() for item in resources.items],
            '_meta': {
                'page': page,
                'per_page': per_page,
                'total_pages': resources.pages,
                'total_items': resources.total
            },
            '_links': {
                'self': url_for(endpoint, page=page, per_page=per_page,
                                **kwargs),
                'next': url_for(endpoint, page=page + 1, per_page=per_page,
                                **kwargs) if resources.has_next else None,
                'prev': url_for(endpoint, page=page - 1, per_page=per_page,
                              **kwargs) if resources.has_prev else None
            }
        }
        return data

class Teams(CouchdbMixin, PaginatedAPIMixin,db.Document):
    doc_type            =  'teams'
    id                  =  db.IntField()
    team_name           =  db.StringField()
    team_description    =  db.StringField()
    creationDate        =  db.DateTimeField( default=datetime.utcnow)
    lastModifiedDate    =  db.DateTimeField( default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','teams':{'_id':'id','team_name':'Team Name','team_description':'Team Description','creationDate':'Creation Date','lastModifiedDate':'LastModifiedDate'},'sc':0, 'order': ['_id','team_name','team_description','creationDate','lastModifiedDate']}
      return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db)       


class Roles(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'roles'
    id                  =  db.IntField()
    role_name           =  db.StringField()
    role_description    =  db.StringField()
    creationDate        = db.DateTimeField( default=datetime.utcnow)
    lastModifiedDate    = db.DateTimeField( default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'id','roles':{'id':'id','role_name':'Role Name','role_description':'Role Description','creationDate':'Creation Date','lastModifiedDate':'Last Modified Date'},'sc':0, 'order': ['_id','role_name','role_description','creationDate','lastModifiedDate']}
      return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

class Users(CouchdbMixin, UserMixin, PaginatedAPIMixin, db.Document):
    doc_type            = 'users'
    id                  = db.IntField()
    firstName           = db.StringField()
    surname             = db.StringField()
    username            = db.StringField( )
    email               = db.StringField(  )
    passwordHash        = db.StringField()
    creationDate        = db.DateTimeField( default=datetime.utcnow)
    locked              = db.BooleanField(default=False)
    team                = db.StringField( )
    role                = db.StringField( )
    connectionStatus    = db.BooleanField(default=False)
    active              = db.BooleanField( default=False)
    loginCount          = db.IntField( default=0)
    reset               = db.BooleanField(default=False)
    lastModifiedDate    = db.DateTimeField( default=datetime.utcnow)
    token               = db.StringField(  )
    tokenExpiration     = db.DateTimeField()

    @staticmethod
    def get_schema():
      schema_data = {'idField':'id','users':{'id':'id','firstName':'First Name','surname':'Surname','username':'Username','email':'Email','creationDate':'Creation Date','locked':'Locked','team': 'Team','role' : 'Role', 'connectionStatus':'Connection Status', 'active':'Active', 'loginCount':'Login Count',  'lastModifiedDate':'Last Modified Date', 'tokenExpiration':'Token Expiration'},'sc':3,'order': ['_id','firstName','surname','username','email','creationDate','locked','team','role','connectionStatus','tokenExpiration']}
      return schema_data

    def __repr__(self):
        return '<User {}>'.format(self.username) 

    def set_password(self, password):
        self.passwordHash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.passwordHash, password)

    def avatar(self, size):
        digest = md5(self.email.lower().encode('utf-8')).hexdigest()
        return 'https://www.gravatar.com/avatar/{}?d=identicon&s={}'.format(digest, size)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode({'reset_password': self.id, 'exp': time() + expires_in},current_app.config['SECRET_KEY'], algorithm='HS256').decode('utf-8')

    @staticmethod
    def get_serial_index():
        return 3
           
    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'],algorithms=['HS256'])['reset_password']
        except:
            return
        return Users.objects(id=id).first()

    def launch_task(self, name, description, *args, **kwargs):
        rq_job = current_app.task_queue.enqueue('app.tasks.' + name, self.id,*args, **kwargs)
        task = Task(id=rq_job.get_id(), name=name, description=description,user=self)
        db.session.add(task)
        return task

    def get_tasks_in_progress(self):
        return Task.objects(user=self, complete=False).all()

    def get_task_in_progress(self, name):
        return Task.objects(name=name, user=self,complete=False).first()

    def to_dict(self, include_email=False):
        data = {      
        }
        if include_email:
            data['email'] = self.email
        return data

    def from_dict(self, data, new_user=False):
        for field in ['username', 'email', 'about_me']:
            if field in data:
                setattr(self, field, data[field])
        if new_user and 'password' in data:
            self.set_password(data['password'])

    def get_token(self, expires_in=3600):
        now = datetime.utcnow()
        if self.token and self.token_expiration > now + timedelta(seconds=60):
            return self.token
        self.token = base64.b64encode(os.urandom(24)).decode('utf-8')
        self.token_expiration = now + timedelta(seconds=expires_in)
        db.session.add(self)
        return self.token

    def revoke_token(self):
        self.token_expiration = datetime.utcnow() - timedelta(seconds=1)

    @staticmethod
    def check_token(token):
        user = Users.objects(token=token).first()
        if user is None or user.token_expiration < datetime.utcnow():
            return None
        return user

    def save(self):
        additional_fields     =  ['passwordHash','lastModifiedDate']
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)
        

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        find_params['additional_fields'] = ['passwordHash']
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        #print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
        #'get', f"data: {data}"))
        return data

    def get_record_count(self):
        return self.get_count(db) 

    def is_authenticated(self):
        return self.connectionStatus

    def is_active(self):   
        return self.active           

    def is_anonymous(self):
        return False          

    def get_id(self):         
        return str(self._id)


class Sites(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'sites'
    id                  =  db.IntField()
    name                =  db.StringField( )
    description         =  db.StringField( )
    creationDate        =  db.DateTimeField()
    lastModifiedDate    =  db.DateTimeField( default=datetime.utcnow)

    @staticmethod
    def get_schema():
        schema_data =  {'idField':'_id','sites':{'_id':'id','name':'Name','description':'Description','creationDate':'crearionDate','lastModifiedDate':'Last Modified Date'},'sc':0,'order': ['_id','name','description','creationDate','lastModifiedDate']}
        return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
        'save', f"self: {self.__dict__}"))
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 
        
class Vcenters(CouchdbMixin, PaginatedAPIMixin, db.Document):
    doc_type            =  'vcenters'
    id                  = db.IntField()
    name                = db.StringField()
    ipAddress           = db.StringField()
    version             = db.StringField()
    username            = db.StringField( )
    password            = db.StringField()
    serviceUri          = db.StringField()
    port                = db.IntField()
    productLine         = db.StringField()
    site                = db.StringField( )
    creationDate        = db.DateTimeField( default=datetime.utcnow)
    lastModifiedDate    = db.DateTimeField( default=datetime.utcnow)
    active              = db.BooleanField( default=True)
    
    @staticmethod
    def get_schema():
      schema_data = {'idField':'_id','vcenters':{'_id':'id','name':'Name','ipAddress':'IPAddress','version':'Version','username':'Username','password':'Password','serviceUri':'ServiceURI','port':'Port','productLine':'ProductLine','creationDate':'CreationDate','lastModifiedDate':'LastModifiedDate','active':'Active','site':'Site'},'sc':3,'order': ['_id','name','ipaddress','version','username','password','serviceUri','port','productLine','site','creationDate','lastModifiedDate','active'] }
      return schema_data 

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

class Tasks(CouchdbMixin ,db.Document):
    doc_type    =  'tasks'
    id          = db.IntField()
    name        = db.StringField( )
    description = db.StringField()
    #userID    = db.IntField(db.ReferenceField(Users))
    userID     = db.IntField( )
    complete    = db.BooleanField(default=True)
    startTime   = db.DateTimeField( default=datetime.utcnow)
    endTime     = db.DateTimeField( default=datetime.utcnow)
    result      = db.StringField()

    @staticmethod
    def get_schema():
      schema_data = {'idField':'_id','tasks':{'_id':'id','name':'Name','description':'Description','userID':'User ID','complete':'Complete','startTime':'Start Time','endTime':'End Time', 'result':'Result'}, 'sc':0, 'order': ['_id','name','description','userID','complete','startTime','endTime','result']}
      return schema_data 

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

    def get_rq_job(self):
        try:
            rq_job = rq.job.Job.fetch(self.id, connection=current_app.redis)
        except (redis.exceptions.RedisError, rq.exceptions.NoSuchJobError):
            return None
        return rq_job

    def get_progress(self):
        job = self.get_rq_job()
        return job.meta.get('progress', 0) if job is not None else 100

class AuditTrail(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'audittrail'
    id                  =  db.IntField()
    description         =  db.StringField()
    oldData    			=  db.DictField()
    newData    			=  db.DictField()
    changeTime          =  db.DateTimeField( default=datetime.utcnow)
    changeType          =  db.StringField()
    affectedTable       =  db.StringField()
    userName            =  db.StringField()
    userID              =  db.IntField()
    recordIdentifier    =  db.DictField()

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','audittrail':{'_id':'id','description':'Description','oldData':'Old Data','newData':'New Data','changeTime':'Change Time','changeType':'Change Type','userName':'UserName','userID':'userID','recordIdentifier':'Record Identifier'},'sc':0,'order': ['_id','description','oldData','newData','changeTime','changeType','affectedTable','userName','userID','recordIdentifier']}
      return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

class SiteSettings(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'sitesettings'
    id                  =  db.IntField()
    siteName            =  db.StringField()
    siteTitle    	    =  db.StringField()
    siteLogo   	        =  db.StringField()
    ldapServer          =  db.StringField()
    ldapUser            =  db.StringField()
    ldapPassword        =  db.StringField()
    emailServer 	    =  db.StringField()
    emailUser           =  db.StringField()
    emailPassword       =  db.StringField()
    lastModifiedDate    =  db.DateTimeField( default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','sitesettings':{'_id':'id','siteName':'Site Name','siteTitle':'Site Title','siteLogo':'Site Logo','ldapServer':'LDAP Server','ldapUser':'LDAP User','ldapPassword':'LDAP Password','emailServer':'Email Server','emailUser':'Email User','emailPassword':'Email Password', 'lastModifiedDate':'Last Modified Date'},'sc':2,'order': ['_id','siteName','siteTitle','siteLogo','ldapServer','ldapUser','ldapPassword','emailServer','emailPassword','emailUser','emailPassword','lastModifiedDate']}
      return schema_data

    @staticmethod
    def get_record_count():
        return 0
    @staticmethod
    def get_last_record_id():
        return  0

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    
class Images(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'images'
    id                  =  db.IntField()
    fileName            =  db.StringField( )
    fileURL    			=  db.StringField( )
    fileSize    		=  db.StringField()
    fileFormat          =  db.StringField()
    dimension           =  db.StringField()
    sourceURL           =  db.StringField()
    lastModifiedDate    =  db.DateTimeField( default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','images':{'_id':'id','filename':'File Name','fileurl':'File Url','filesize':'File Size','fileformat':'File Format','dimension':'Dimension','sourceurl':'Source Url','lastModifiedDate':'Last Modified Date'},'sc':0,'order': ['_id','fileName','fileURL','fileSize','fileFormat','dimension','sourceURL','lastModifiedDate']}
      return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 
        
class Sites(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'sites'
    id                  =  db.IntField()
    siteName            =  db.StringField( )
    lastModifiedDate    =  db.DateTimeField( default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','sites':{'_id':'id','siteName':'Site Name','lastModifiedDate':'Last Modified Date'},'sc':0,'order': ['_id','siteName','lastModifiedDate']}
      return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field=None, value=None, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

class Clusters(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'clusters'
    id                   =  db.IntField()
    modifiedDate         =  db.DateTimeField()
    ds_list              =  db.ListField(db.StringField())
    host_list    	     =  db.ListField(db.StringField())
    resourcePool         =  db.DictField()
    name        		 =  db.StringField()
    site                 =  db.StringField()
    vm_list              =  db.ListField(db.StringField())
    vcenter              =  db.StringField()
    network_list         =  db.ListField(db.StringField())
	
    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','clusters':{'_id':'id','modifiedDate':'Modified Date','ds_list':'Datastores','host_list':'Hosts','resourcePool':'ResourcePool','name':'Name','site':'Site','vm_list':'Virtual Machines','vcenter':'VCenter','network_list':'Networks'},'sc':0,'order': ['_id','modifiedDate','ds_list','host_list','resourcePool','name','site','vm_list','vcenter','network_list']}
      return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 
        
class Datastores(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'datastores'
    id                   =  db.IntField()
    site                 =  db.StringField()
    freeSpace            =  db.StringField()
    vcenter              =  db.StringField()
    capacity             =	db.StringField()
    modifiedDate         =  db.StringField()
    name                 =  db.StringField()
    summary              =  db.DictField()
    cluster              =  db.StringField()
    freeSpacePercentage  =  db.StringField()
    uncommittedSpace     =  db.LongField()
    modifiedDate         =  db.StringField()    
    @staticmethod
    def get_schema():
        schema_data =  {'idField':'_id','datastores':{'_id':'id','site':'Site','freeSpace':'Free Space','vcenter':'VCenter','capacity':'Capacity','modifiedDate':'Modified Date','name':'Name','summary':'Summary','cluster':'Cluster','freeSpacePercentage':'Free Space Percentage','uncommittedSpace':'Uncommitted Space'},'sc':0,'order': ['id','site','freeSpace','vcenter','capacity','modifiedDate','name','summary','cluster','freeSpacePercentage','uncommittedSpace']}
        return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

class Hosts(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'hosts'
    id                   =  db.IntField()
    physical_nics        =  db.ListField(db.DictField())
    cluster              =  db.StringField()
    virtual_switches     =  db.ListField(db.DictField())
    memoryCapacityInMB   =	db.StringField()
    cpuUsage             =  db.LongField()
    virtual_nics         =  db.ListField(db.DictField())
    name                 =  db.StringField()
    ds_list              =  db.ListField(db.DictField())
    vm_list              =  db.ListField(db.StringField())
    memoryUsage          =  db.LongField()
    nw_list              =  db.ListField(db.StringField())
    memoryCapacity       =  db.LongField()
    stats                =  db.DictField()
    ports_groups         =  db.ListField(db.DictField())
    site                 =  db.StringField()
    summary              =  db.DictField()
    hardware             =  db.DictField()
    vcenter              =  db.StringField()
    freeMemoryPercentage =  db.StringField()
    modifiedDate         =  db.StringField()

    @staticmethod
    def get_schema():
        schema_data =  {'idField':'_id','hosts':{'_id':'id','physical_nics':'Physical NICs','cluster':'Cluster','virtual_switches':'Virtual Switches',
        'memoryCapacityInMB':'Memory Capacity (MB)','cpuUsage':'CPU Usage','virtual_nics':'Virtual NICs','name':'Name','ds_list':'Datastores','vm_list':'VMs',
        'memoryUsage':'Memory Usage','nw_list':'Networks','memoryCapacity': 'Memory Capacity','stats':'Statistics','ports_groups':'Port Groups','site':'Site',
        'summary':'Summary', 'hardware':'Hardware','vcenter':'VCenter','freeMemoryPercentage':'freeMemoryPercentage','modifiedDate':'Modified Date'},'sc':0,'order': ['_id','physical_nics','cluster','virtual_switches','memoryCapacityInMB','cpuUsage','virtual_nics','name','ds_list','vm_list','memoryUsage','nw_list','memoryCapacity','stats','ports_groups','site','summary','hardware','vcenter','freeMemoryPercentage','modifiedDate']}
        return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 

class vms(CouchdbMixin,PaginatedAPIMixin,db.Document):
    doc_type            =  'vms'
    id                   =  db.IntField()
    vm_name              =  db.StringField()
    owner                =  db.StringField( )
    team                 =  db.StringField( )
    ip                   =	db.StringField( )
    host                 =  db.StringField()
    connectionState      =  db.StringField()
    powerState           =  db.StringField()
    maxCpuUsage          =  db.StringField()
    maxMemoryUsage       =  db.LongField()
    os_name              =  db.StringField( )
    disks                =  db.ListField(db.DictField())
    disk_summary         =  db.ListField(db.DictField())
    nics                =  db.ListField(db.DictField())
    dns_name		     =  db.StringField()
    datastores           =  db.ListField(db.StringField())
    port_groups         =  db.ListField(db.DictField())
    site                 =  db.StringField()
    vm_is_tempate        =  db.BooleanField( )
    vmPathName           =  db.StringField()
    memorySizeMB         =  db.StringField()
    cpuReservation       =  db.LongField()
    memoryReservation    =  db.LongField()
    numCpu               =  db.LongField()
    numEthernetCards     =  db.LongField()
    numVirtualDisks      =  db.LongField()
    vcenter              =  db.StringField()
    site 				 =  db.StringField()
    cluster              =  db.StringField()
    freeMemoryPercentage =  db.StringField()
    modifiedDate         =  db.StringField()

    @staticmethod
    def get_schema():
        schema_data =  {'idField':'_id','vms':{'_id': 'id','vm_name':'VM Name','owner': 'VM Custodian','ip': 'IP','host': 'Host','connectionState':'Connected','powerState': 'Power','maxCpuUsage':'Maximum CPU','maxMemoryUsage': 'Maximum Memory','os_name': 'Operating System','disk':'Disks','nics':'NICs','dns_name': 'Domain Name','datastores': 'Datastores','disks':'Disks','nics': 'Nics','port_groups': 'Port Groups','vm_is_tempate': 'Template','vmPathName':'VMX FilePath','memorySizeMB':'Memory (MB)','cpuReservation':'CPU Reservation','memoryReservation': 'Memory Reservation','numCpu': 'CPU Count','numEthernetCards':'Ethernet Count','numVirtualDisks': 'Disk Count','site':'Site','vcenter':'VCenter','cluster': 'Cluster','modifiedDate': 'Modified Date','disk_summary':'Disk Summary'},'sc':0,'order': ['_id','vm_name','owner','ip','host','connectionState','powerState','maxCpuUsage','maxMemoryUsage','os_name','disks','nics','dns_name','datastores','disks','disk_summary','nics','port_groups','vm_is_tempate','vmPathName','memorySizeMB','cpuReservation','memoryReservation','numCpu','numEthernetCards','numVirtualDisks','site','vcenter','cluster','modifiedDate']}
        return schema_data

    def save(self):
        additional_fields     =  []
        self.lastModifiedDate = datetime.utcnow()
        self.store(db, additional_fields)      

    def get(self, field, value, find_params=None):
        find_params = {} if find_params==None else  find_params
        field  =   "doc_type" if field is None else  field
        value  =   self.doc_type if  value is None else  value
        data = self.load(db,field=field, value=value,find_params= find_params) 
        return data

    def get_record_count(self):
        return self.get_count(db) 
