from os import environ, path
from dotenv import load_dotenv
import redis

basedir =  path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))

class Config(object):
    SECRET_KEY =  environ.get('SECRET_KEY') or 'you-will-never-guess'
    SESSION_TYPE= environ.get('SESSION_TYPE')    or  'redis'
    REDIS_URL = environ.get('REDIS_URL') or 'redis://' 
    SESSION_REDIS = redis.from_url(REDIS_URL)
    #SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    #SQLALCHEMY_TRACK_MODIFICATIONS = False
    #MONGO_DATABASE_URI= 'COUCH://{username}:{password}@{host}:{port}'.format(username=MONGO_USER, password=MONGO_PASS,host=MONGO_SERVER,port=MONGO_PORT) if MONGO_USER and MONGO_PASS else  'COUCH://{host}:{port}'.format(host=MONGO_SERVER,port=MONGO_PORT) 
    COUCH_SERVER    =  environ.get('COUCH_SERVER')       or '127.0.0.1'
    COUCH_PORT      =  environ.get('COUCH_PORT')        or  5984
    COUCH_USERNAME  =  environ.get('COUCH_USERNAME')    or  'root'
    COUCH_PASSWORD  =  environ.get('COUCH_PASSWORD')    or  'Password12'
    COUCH_DATABASE  =  environ.get('COUCH_DATABASE')    or  'cs3p'
    COUCH_USE_SSL   =  False
    COUCH_SETTINGS  = {
        'server': COUCH_SERVER,
        'port': COUCH_PORT,
        'username':COUCH_USERNAME,
        'password':COUCH_PASSWORD,
        'database': COUCH_DATABASE,
        'use_ssl' : COUCH_USE_SSL
    }
    LOG_TO_STDOUT = environ.get('LOG_TO_STDOUT')
    MAIL_SERVER = environ.get('MAIL_SERVER')
    MAIL_PORT = int(environ.get('MAIL_PORT') or 25)
    MAIL_USE_TLS = environ.get('MAIL_USE_TLS') is not None
    MAIL_USERNAME = environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = environ.get('MAIL_PASSWORD')
    ADMINS = ['your-email@example.com']
    LANGUAGES = ['en', 'es']
    MS_TRANSLATOR_KEY = environ.get('MS_TRANSLATOR_KEY')
    #ELASTICSEARCH_URL = environ.get('ELASTICSEARCH_URL')
    RECORDS_PER_PAGE = 25
    MAX_CONTENT_LENGTH = 8 * 1024 *1024
    IMAGE_UPLOAD_EXTENSIONS = ['.jpg', '.png', '.gif','.tiff','.bmp','.ico']
    IMAGE_UPLOAD_DIRECTORY  = path.dirname(path.realpath(__file__))+path.sep+'app'+path.sep+'static'+path.sep+'images'