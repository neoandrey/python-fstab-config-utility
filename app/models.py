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
from app import db, login
from app.search import add_to_index, remove_from_index, query_index
from flask_mongoengine.wtf import model_form
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

class Teams(PaginatedAPIMixin,db.Document):
    id                  =  db.IntField(primary_key=True)
    team_name           =  db.StringField(max_length = (255))
    team_description    =  db.StringField(max_length = (500))
    creationDate        =  db.DateTimeField(index=True, default=datetime.utcnow)
    lastModifiedDate    =  db.DateTimeField(index=True, default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','teams':{'_id':'id','team_name':'Team Name','team_description':'Team Description','creationDate':'Creation Date','lastModifiedDate':'LastModifiedDate'},'sc':0, 'order': ['_id','team_name','team_description','creationDate','lastModifiedDate']}
      return schema_data

    @staticmethod
    def get_record_count():
        return Teams.objects().all().count()

    @staticmethod
    def get_last_record_id():
        return  int(Teams.objects().order_by('-_id').first()['id']) if  Teams.get_record_count()>0 else 0

class Roles(PaginatedAPIMixin,db.Document):
    id                =  db.IntField(primary_key=True)
    role_name         =  db.StringField(max_length = (255))
    role_description  =  db.StringField(max_length = (500))
    creationDate        = db.DateTimeField(index=True, default=datetime.utcnow)
    lastModifiedDate    = db.DateTimeField(index=True, default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','roles':{'id':'_id','role_name':'Role Name','role_description':'Role Description','creationDate':'Creation Date','lastModifiedDate':'Last Modified Date'},'sc':0, 'order': ['_id','role_name','role_description','creationDate','lastModifiedDate']}
      return schema_data

class Users(UserMixin, PaginatedAPIMixin, db.Document):
    id                  = db.IntField(primary_key=True)
    firstName           = db.StringField(max_length = (255), index=True )
    surname             = db.StringField(max_length = (255), index=True )
    username            = db.StringField(max_length = (64),  index=True, unique=True)
    email               = db.StringField(max_length = (120), index=True, unique=True)
    passwordHash        = db.StringField(max_length = (255))
    creationDate        = db.DateTimeField(index=True, default=datetime.utcnow)
    locked              = db.BooleanField(default=False)
    team                = db.ReferenceField(Teams)
    role                = db.ReferenceField(Roles)
    connectionStatus    = db.BooleanField(default=False)
    active              = db.BooleanField( default=False)
    loginCount          = db.IntField( default=0)
    reset               = db.BooleanField(default=False)
    lastModifiedDate    = db.DateTimeField(index=True, default=datetime.utcnow)
    token               = db.StringField(max_length = (32), index=True, unique=True)
    tokenExpiration     = db.DateTimeField()

    @staticmethod
    def get_schema():
      schema_data = {'idField':'_id','Users':{'_id':'id','firstName':'First Name','surname':'Surname','username':'Username','email':'Email','creationDate':'Creation Date','locked':'Locked','team': 'Team','role' : 'Role', 'connectionStatus':'Connection Status', 'active':'Active', 'loginCount':'Login Count',  'lastModifiedDate':'Last Modified Date', 'tokenExpiration':'Token Expiration'},'sc':3,'order': ['_id','firstName','surname','username','email','creationDate','locked','team','role','connectionStatus','tokenExpiration']}
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
    def get_record_count():
        return Users.objects().all().count()

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
    
    def is_authenticated(self):
        return self.connectionStatus    

@login.user_loader
def load_user(id):
    return Users.objects(id=int(id)).first()

class Vcenters(PaginatedAPIMixin, db.Document):
    id                  = db.IntField(primary_key=True)
    name                = db.StringField(max_length = (255),index=True )
    ipAddress           = db.StringField(max_length = (16), index=True )
    version             = db.StringField(max_length = (20))
    username            = db.StringField(max_length = (255), index=True)
    password            = db.StringField()
    serviceUri          = db.StringField(max_length = (255), unique=True)
    port                = db.IntField()
    productLine         = db.StringField(max_length = (20) )
    creationDate        = db.DateTimeField(index=True, default=datetime.utcnow)
    lastModifiedDate    = db.DateTimeField(index=True, default=datetime.utcnow)
    active              = db.BooleanField( default=True)
    
    @staticmethod
    def get_schema():
      schema_data = {'idField':'_id','vcenters':{'_id':'id','name':'Name','ipAddress':'IPAddress','version':'Version','username':'Username','password':'Password','serviceUri':'ServiceURI','port':'Port','productLine':'ProductLine','creationDate':'CreationDate','lastModifiedDate':'LastModifiedDate','active':'Active'},'sc':3,'order': ['_id','name','ipaddress','version','username','password','serviceUri','port','productLine','creationDate','lastModifiedDate','active'] }
      return schema_data 

    @staticmethod
    def get_record_count():
        return Vcenters.objects().all().count()
    @staticmethod
    def get_last_record_id():
        return  int(Vcenters.objects().order_by('-_id').first()['id']) if  VCenters.get_record_count()>0 else 0

class Tasks(db.Document):
    id          = db.IntField(primary_key=True)
    name        = db.StringField(max_length=(128), index=True)
    description = db.StringField(max_length=(128))
    userID    = db.IntField(db.ReferenceField(Users))
    complete    = db.BooleanField( default=True)
    startTime   = db.DateTimeField(index=True, default=datetime.utcnow)
    endTime     = db.DateTimeField(index=True, default=datetime.utcnow)
    result      = db.StringField(max_length=(128))

    @staticmethod
    def get_schema():
      schema_data = {'idField':'id','Tasks':{'_id':'id','name':'Name','description':'Description','userID':'User ID','complete':'Complete','startTime':'Start Time','endTime':'End Time', 'result':'Result'}, 'sc':0, 'order': ['_id','name','description','userID','complete','startTime','endTime','result']}
      return schema_data 

    def get_rq_job(self):
        try:
            rq_job = rq.job.Job.fetch(self.id, connection=current_app.redis)
        except (redis.exceptions.RedisError, rq.exceptions.NoSuchJobError):
            return None
        return rq_job

    def get_progress(self):
        job = self.get_rq_job()
        return job.meta.get('progress', 0) if job is not None else 100
class AuditTrail(PaginatedAPIMixin,db.Document):
    id                  =  db.IntField(primary_key=True)
    description         =  db.StringField(max_length = (500))
    oldData    			=  db.DictField()
    newData    			=  db.DictField()
    changeTime          =  db.DateTimeField(index=True, default=datetime.utcnow)
    changeType          =  db.StringField(max_length = (15))
    affectedTable       =  db.StringField(max_length = (255))
    userName            =  db.StringField(max_length = (255),index=True)
    userID              =  db.IntField(index=True)
    recordIdentifier    =  db.DictField()

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','audittrail':{'_id':'id','description':'Description','oldData':'Old Data','newData':'New Data','changeTime':'Change Time','changeType':'Change Type','userName':'UserName','UserID':'UserID','recordIdentifier':'Record Identifier'},'sc':0,'order': ['_id','description','oldData','newData','changeTime','changeType','affectedTable','userName','userID','recordIdentifier']}
      return schema_data

    @staticmethod
    def get_record_count():
        return AuditTrail.objects().all().count()

    @staticmethod
    def get_last_record_id():
        return  int(AuditTrail.objects().order_by('-_id').first()['id']) if  AuditTrail.get_record_count()>0 else 0

class SiteSettings(PaginatedAPIMixin,db.Document):
    id                  =  db.IntField(primary_key=True)
    siteName            =  db.StringField()
    siteTitle    	    =  db.StringField()
    siteLogo   	        =  db.StringField()
    ldapServer          =  db.StringField()
    ldapUser            =  db.StringField()
    ldapPassword        =  db.StringField()
    emailServer 	    =  db.StringField()
    emailUser           =  db.StringField()
    emailPassword       =  db.StringField()
    lastModifiedDate    =  db.DateTimeField(index=True, default=datetime.utcnow)

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
    
class Images(PaginatedAPIMixin,db.Document):
    id                  =  db.IntField(primary_key=True)
    fileName            =  db.StringField(index=True, unique=True)
    fileURL    			=  db.StringField(index=True, unique=True)
    fileSize    		=  db.StringField()
    fileFormat          =  db.StringField()
    dimension           =  db.StringField()
    sourceURL           =  db.StringField()
    lastModifiedDate    =  db.DateTimeField(index=True, default=datetime.utcnow)

    @staticmethod
    def get_schema():
      schema_data =  {'idField':'_id','images':{'_id':'id','filename':'File Name','fileurl':'File Url','filesize':'File Size','fileformat':'File Format','dimension':'Dimension','sourceurl':'Source Url','lastModifiedDate':'Last Modified Date'},'sc':0,'order': ['_id','fileName','fileURL','fileSize','fileFormat','dimension','sourceURL','lastModifiedDate']}
      return schema_data

    @staticmethod
    def get_record_count():
        return Images.objects().all().count()

    @staticmethod
    def get_last_record_id():
        return  int(Images.objects().order_by('-_id').first()['id']) if  Images.get_record_count()>0 else 0
