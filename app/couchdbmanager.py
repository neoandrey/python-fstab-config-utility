import couchdb
from flask import current_app, _app_ctx_stack
from couchdb.mapping import Document,TextField,FloatField,IntegerField,LongField,BooleanField,DecimalField,DateTimeField,DateField,DictField,ListField
import  json
from uuid import uuid4
from inspect import currentframe, getframeinfo

def get_debug_template():
    from inspect import currentframe, getframeinfo
    return "\nFile \"{}\", line {}\nFunction (Method): '{}'\nMessage: {}\n",getframeinfo,currentframe

class CouchdbMixin(object):
    selector        	= None
    selector_list       = []
    sort_list           = []
    limit    	    	= None
    skip     	    	= None
    fields          	= []
    search_template 	= None
    _id                 = TextField()
    _rev                = TextField()
    _deleted            = BooleanField()
    LT       		    = "$lt"
    LTE			        = "$lte"
    EQ			        = "$eq"
    NE                  = "$ne"
    GT			        = "$gt"
    GTE                 = "$gte"
    EXISTS              = "$exists"
    TYPE                = "$type"
    IN                  = "$in"
    NIN			        = "$nin"
    SIZE		        = "$size"
    MOD                 = "$mod"
    REGEX		        = "$regex"
    AND                 = "$and"
    OR                  = "$or"
    NOT                 = "$not" 
    NOR                 = "$nor" 
    ALL                 = "$all"
    ELEMATCH		    = "$elemMatch"
    ALLMATCH		    = "$allmatch"
    KEYMAPMATCH         = "$keyMapMatch"
    ASC                 = "$asc"
    DESC                =  "$desc"

    def  get_mango(self):
         self.build_selector()
         selector_object= {}
         filter_list =["selector","limit","skip","fields","sort_list"]
         for  field in  filter_list:  
             if  getattr(self, field):
                 selector_object[field] =  getattr(self, field) #self.__dict__[field]
         return  selector_object
    	 
    def  build_selector(self):
        selector_builder  = {}
        id_list           = []
        for slctr in self.selector_list:
            temp_selector_list = {}
            if slctr.id not in id_list:
                ref_id   = None
                if slctr.glue:
                    selector_builder[slctr.glue]=[]
                    temp_selector = {}
                    temp_selector[slctr.field] = {}
                    temp_selector[slctr.field][slctr.operator] = slctr.value
                    selector_builder[slctr.glue].append(json.dumps(temp_selector.__dict__))
                    id_list.append(slctr.id)
                    ref_id = slctr.ref_id
                    while ref_id and  ref_id not in id_list:
                        slctr2 = [x for x in self.selector_list if x.id == slctr.ref_id]
                        temp_selector = {}
                        temp_selector[slctr2.field] = {}
                        temp_selector[slctr2.field][slctr2.operator] = slctr2.value
                        selector_builder[slctr.glue].append(json.dumps(temp_selector.__dict__))
                        id_list.append(slctr2.id)
                        ref_id = slctr2.ref_id
                elif not slctr.is_json:
                        selector_builder[slctr.field] = {}
                        selector_builder[slctr.field][slctr.operator] = slctr.value
                        id_list.append(slctr.id)
                elif slctr.is_json:
                        selector_builder[slctr.field]  = {}
                        selector_builder[slctr.field] = slctr.value
                        id_list.append(slctr.id)
        self.selector= selector_builder   
    	    
    def add_selector(self, selector):
        self.selector_list.append(self.SelectorMap(selector))

    def add_sort(self, sort):
        self.sort_list.append(self.SortMap(sort))
        
    def add_field(self, field):
        self.fields.append(field) 
    def reset_selector(self):
        self.selector_list.clear()
        self.fields.clear()

    def init_attributes(self,attribs,fields=None):
        fields = self.get_schema() if fields is None else fields
        for key,value  in attribs.items():
            if isinstance(fields, list)  and len(fields) > 0 and key in fields:
                if  hasattr(self, key):
                    self[key]= value
            else:
                if  hasattr(self, key):
                    self[key]= value       
        return self

    def find(self,db, findObj):
        schema               = self.get_schema()
        fields               = schema[self.doc_type]
        fields['id']         = 'id'
        fields['_id']        = '_id'
        fields['doc_type']   = 'doc_type'
        fields['_rev']       = '_rev'
        if 'additional_fields' in  findObj:
            for  field in findObj['additional_fields']:
        #       print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
        #                'find', "additional field: {}".format(field)))      
               fields[field] = field 
        if 'selector_list' in findObj:
            for selector in  findObj['selector_list']:
                self.add_selector(selector)
        for field in fields:
            self.add_field(field)
        result_list          =  [] 
        self.skip            = findObj['page']-1 * findObj['record_count'] if  ('page' in findObj) else 0
        self.limit           = findObj['limit'] if ('limit' in findObj) else  0
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
                                'find', "Mango: {}".format(self.get_mango())))
        data = list(db.database.find(self.get_mango()))
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
                                'find', "data: {}".format(data)))       
        if len(data) > 1 :
            for row in data:
                temp_data = type(self)().init_attributes(row,fields)
                result_list.append(temp_data)
        else:
            result_list = type(self)().init_attributes(data[0],fields) if  type(data) == list and len(data) >0 else None
        self.reset_selector()
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
                                'find', "result_list: {}".format(result_list))) 
        return result_list

    def fetch(self,db,json_map,find_params=None):
        schema               = self.get_schema()
        fields               = schema[self.doc_type]
        fields['_id']        = '_id'
        fields['doc_type']   = 'doc_type'
        fields['_rev']       = '_rev'
        if  find_params  and 'additional_fields' in  find_params:
            for  field in findObj['additional_fields']:     
                fields[field] = field
            for field in fields:
                self.add_field(field)
        result_list          =  []
        if find_params:
            self.skip            =  find_params['page']-1 * find_params['record_count'] if  ('page' in find_params) else 0
            self.limit           =  find_params['limit'] if ('limit' in find_params) else  0
            self.sort_list       =  find_params['sort_list'] if ('sort_list' in find_params) else  []
        else:
            self.skip = 0
            self.limit = 0
            self.sort_list = []
        selector_object= {}
        selector_object["selector"] = json_map
        filter_list =["limit","skip","fields","sort_list"]
        for  field in  filter_list:  
            if  getattr(self, field):
                selector_object[field] =  getattr(self, field)
        data = list(db.database.find(selector_object))
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
                    'fetch', "data: {}".format(data)))       
        if len(data) > 1 :
            for row in data:
                temp_data = type(self)().init_attributes(row,fields)
                result_list.append(temp_data)
        else:
            result_list = type(self)().init_attributes(data[0],fields) if  type(data) == list and len(data) >0 else None
        self.reset_selector()
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
                'fetch', "result_list: {}".format(result_list))) 
        return result_list
	
    def store(self, db,additional_fields = []):
        schema    = self.get_schema()
        fields    = schema[self.doc_type]
        temp_data = {} 
        if hasattr(self,'_id'):
            self['_id'] =  uuid4().hex if '_id' not in self.__dict__['_data'] else self.__dict__['_data']['_id']
        temp_data['_id']     =  self['_id'] if self['_id'] else  uuid4().hex
        if hasattr(self,'id'):
            temp_data['id'] =  1 if 'id' not in self.__dict__['_data'] else self.__dict__['_data']['id']
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
        'STORE', "self: {}".format(self.__dict__))) 
        temp_data['doc_type']= self.doc_type
        for field in fields:
            temp_data[field] = self.__dict__['_data'][field]
        for field in additional_fields:
            temp_data[field] = self.__dict__['_data'][field]
        if '_rev'  in  self.__dict__['_data']:
            temp_data['_rev']   = self.__dict__['_data']['_rev']
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
        'STORE', "temp_data: {}".format(temp_data))) 
        self['_id'], self['_rev'] = db.database.save(temp_data)

    def get_count(self,db):
        data= self.load(db, "doc_type",self.doc_type)
        count = 0
        if type(data) is list:
            count = len(data)
        elif isinstance(data, type(self)) :
            count  = 1
        return  count
    
    def load(self,db,field, value,find_params=None):
        selector ={ 'id':1,'field':field, 'glue':None, 'operator':None,'value':value,'ref_id':None,'is_json': True}
        self.add_selector(selector)
        find_params = {'page':1,'limit':0,'record_count':1} if not find_params else find_params
        data= self.find(db,find_params)
        return  data if data else []

    def get_last_record_id(self):
        records = self.get("doc_type", self.doc_type)
        if isinstance(records, type(self)) or (type(records) == list  and len(records)==1):
            return  1
        elif type(records) == list  and len(records)==0:
            return 0
        elif type(records) == list  and len(records)>1:
             id_list = [x.id for  x  in  records]
        max_id = 0
        print(get_debug_template()[0].format(get_debug_template()[1](get_debug_template()[2]()).filename, get_debug_template()[1](get_debug_template()[2]()).lineno,
                        'get_last_record_id', "id_list: {}".format(id_list)))
        if   isinstance(id_list, list) and None not in id_list:
            max_id = max(id_list)
        else:
            max_id = 0
        return   max_id
   
    def delete(self):
        schema    = self.get_schema()
        fields    = schema[self.doc_type]
        temp_data = {} 
        temp_data['_deleted']= True
        for field in fields:
            temp_data[field] = self[field]
        if '_rev'  in  self.__dict__['_data']:
            temp_data['_rev']   = self.__dict__['_data']['_rev']
        self['_id'], self['_rev'] = db.database.save(temp_data)

    class SelectorMap:
        field      	= None
        sub_field  	= None
        glue       	= None
        id         	= None
        operator   	= None
        value      	= None
        ref_id     	= None
        is_json    	= False
        
        def __init__(self, selector):
            self.id   	  = selector['id'] if   selector['id'] else None
            self.field	  = selector['field']
            self.glue 	  = selector['glue'] if  selector['glue']  else None
            self.operator = selector['operator']
            self.value    = selector['value']
            self.ref_id   = selector['ref_id']
            self.is_json  = selector['is_json']
                 
    class SortMap:
        field      = None
        field_sort = "asc"
        
        def init_sort(self,sort):
            self.field     = sort['field']
            self.sort_type = sort['sort_type'] if sort['sort_type']  else None

class CouchDBManager(object):
    server   = None
    database = None
    databaseName = None
    username = None
    password = None
    port     = None
    use_ssl  = False
    app      = None
    couch    = None
    Document    	= Document 
    StringField 	= TextField
    FloatField 	    = FloatField
    IntField 	    = IntegerField
    LongField 	    = LongField
    BooleanField 	= BooleanField
    DecimalField 	= DecimalField
    DateField     	= DateField
    DateTimeField 	= DateTimeField
    DictField     	= DictField
    ListField     	= ListField
    
    def __init__(self, app=None):
        self.app = app
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.config.setdefault('COUCH_DATABASE', ':memory:')
        settings          =  app.config['COUCH_SETTINGS']
        self.server       =  settings['server']
        self.databaseName =  settings['database']
        self.username     =  settings['username']
        self.password     =  settings['password']
        self.port         =  settings['port']
        self.use_ssl      =  settings['use_ssl']
        self.connect()
        #app.teardown_appcontext(self.teardown)
    
    def connect(self):
        if self.use_ssl:
           self.couch =  self.connect_ssl()
        else:
           self.couch = self.connect_no_ssl()
        if self.databaseName in self.couch:
           self.database = self.couch[self.databaseName]
        else:
            self.database = self.couch.create(self.databaseName)
    
    def connect_no_ssl(self):
         return couchdb.Server('http://{u}:{ps}@{s}:{pt}/'.format(u=self.username, ps=self.password, s=self.server,pt= self.port))

    def connect_ssl(self):
         return couchdb.Server('https://{u}:{ps}@{s}:{pt}/'.format(u=self.username,ps=self.password, s=self.server, pt=self.port))

    def teardown(self, exception):
        ctx = _app_ctx_stack.top
        if hasattr(ctx, 'couchdb'):
            ctx.couchdb.close()
    @property
    def connection(self):
        ctx = _app_ctx_stack.top
        if ctx is not None:
            if not hasattr(ctx, 'couchdb'):
                ctx.couchdb = self.connect()
            return ctx.couchdb
