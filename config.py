import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    #SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    #SQLALCHEMY_TRACK_MODIFICATIONS = False
    #MONGO_DATABASE_URI= 'mongodb://{username}:{password}@{host}:{port}'.format(username=MONGO_USER, password=MONGO_PASS,host=MONGO_SERVER,port=MONGO_PORT) if MONGO_USER and MONGO_PASS else  'mongodb://{host}:{port}'.format(host=MONGO_SERVER,port=MONGO_PORT) 
    MONGODB_DB        = 'cs3p'
    MONGODB_HOST      = os.environ.get('MONGODB_HOST') or '127.0.0.1'
    MONGODB_PORT      = os.environ.get('MONGODB_PORT')    or  27017
    MONGODB_USERNAME  = os.environ.get('MONGODB_USERNAME')    or  ''
    MONGODB_PASSWORD  = os.environ.get('MONGODB_PASSWORD')    or  ''
    MONGODB_CONNECT   = True
    MONGODB_SETTINGS  = {
        'db': MONGODB_DB,
        'host': MONGODB_HOST,
        'port': MONGODB_PORT,
        'username':MONGODB_USERNAME,
        'password':MONGODB_PASSWORD,
        'connect': MONGODB_CONNECT
    }
    LOG_TO_STDOUT = os.environ.get('LOG_TO_STDOUT')
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 25)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMINS = ['your-email@example.com']
    LANGUAGES = ['en', 'es']
    MS_TRANSLATOR_KEY = os.environ.get('MS_TRANSLATOR_KEY')
    ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL')
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://'
    RECORDS_PER_PAGE = 25
    MAX_CONTENT_LENGTH = 8 * 1024 *1024
    IMAGE_UPLOAD_EXTENSIONS = ['.jpg', '.png', '.gif','.tiff','.bmp','.ico']
    IMAGE_UPLOAD_DIRECTORY  = os.path.dirname(os.path.realpath(__file__))+os.path.sep+'app'+os.path.sep+'static'+os.path.sep+'images'