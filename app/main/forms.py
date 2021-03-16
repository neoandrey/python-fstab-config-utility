from flask import request
from flask_wtf import FlaskForm
from wtforms import PasswordField,BooleanField,StringField, SubmitField, TextAreaField,SelectField
from wtforms.validators import ValidationError, DataRequired, Length, IPAddress
from flask_babel import _, lazy_gettext as _l
from datetime import datetime
#from app.models import User

class LoginForm(FlaskForm):
    username    = StringField('inputUserName', validators=[DataRequired()])
    password    = PasswordField('inputPassword', validators=[DataRequired()])
    remember_me = BooleanField('remember_me')
    submit      = SubmitField('Sign In')

class VCenterForm(FlaskForm):
    name              = StringField(_l('Name'), validators=[DataRequired()])
    ipAddress         = StringField(_l('IP Address'), validators=[DataRequired() , IPAddress(ipv4=True, message='Please type a valid IPV4 address')])
    version           = StringField(_l('Version'), validators=[DataRequired()])
    username          = StringField(_l('Username'), validators=[DataRequired()])
    password          = PasswordField(_l('Password'), validators=[DataRequired()])
    serviceUri        = StringField(_l('Service URI'))
    port              = StringField(_l('Service URI'))
    productLine        = StringField(_l('productLine'))
    creationDate      = StringField(_l('Creation Date'), default =datetime.utcnow())
    active            = SelectField(_l('Active'), choices=[('No', 'No'), ('Yes', 'Yes')], default='Yes')
    lastModifiedDate  = StringField(_l('Last Modified'), default =datetime.utcnow())

"""
class EditProfileForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()])
    about_me = TextAreaField(_l('About me'),
    validators=[Length(min=0, max=140)])
    submit = SubmitField(_l('Submit'))

    def __init__(self, original_username, *args, **kwargs):
        super(EditProfileForm, self).__init__(*args, **kwargs)
        self.original_username = original_username

    def validate_username(self, username):
        if username.data != self.original_username:
            user = User.query.filter_by(username=self.username.data).first()
            if user is not None:
                raise ValidationError(_('Please use a different username.'))
"""

class EmptyForm(FlaskForm):
    submit = SubmitField('Submit')


class PostForm(FlaskForm):
    post = TextAreaField(_l('Say something'), validators=[DataRequired()])
    submit = SubmitField(_l('Submit'))


class SearchForm(FlaskForm):
    q = StringField(_l('Search'), validators=[DataRequired()])

    def __init__(self, *args, **kwargs):
        if 'formdata' not in kwargs:
            kwargs['formdata'] = request.args
        if 'csrf_enabled' not in kwargs:
            kwargs['csrf_enabled'] = False
        super(SearchForm, self).__init__(*args, **kwargs)


class MessageForm(FlaskForm):
    message = TextAreaField(_l('Message'), validators=[
        DataRequired(), Length(min=1, max=140)])
    submit = SubmitField(_l('Submit'))
