from app import create_app, db, cli
from flask_socketio import SocketIO
from flask_socketio import  emit
#from app.models import User, Post, Message, Notification, Task

app = create_app()
cli.register(app)

@app.shell_context_processor
def make_shell_context():
   pass
   # return {'db': db, 'User': User, 'Post': Post, 'Message': Message,
   #         'Notification': Notification, 'Task': Task}
