from datetime import datetime
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, SelectField
from wtforms.validators import ValidationError, DataRequired, Email, EqualTo
from flask_babel import _, lazy_gettext as _l
from app.models import Users


class LoginForm(FlaskForm):
    username = StringField(_l('Username'), validators=[DataRequired()])
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    remember_me = BooleanField(_l('Remember Me'))
    submit = SubmitField(_l('Sign In'))

class RegistrationForm(FlaskForm):
    firstName         = StringField(_l('FirstName'), validators=[DataRequired()])
    surname           = StringField(_l('Surname'), validators=[DataRequired()])
    username          = StringField(_l('Username'), validators=[DataRequired()])
    email             = StringField(_l('Email'), validators=[DataRequired(),Email()])
    password          = PasswordField(_l('Password'), validators=[DataRequired()])
    confirmPassword   = PasswordField(_l('Confirm Password'), validators=[DataRequired(),EqualTo('password', message='Passwords must match')])
    creationDate      = StringField(_l('Creation Date'), default =datetime.utcnow())
    locked            = SelectField(_l('Locked'), choices=[('No', 'No'), ('Yes', 'Yes')], default='No')
    team              = SelectField(_l('Team'), choices=[('Compute', 'Compute'), ('Core Technology', 'Core Technology')])
    role              = SelectField(_l('Role'), choices=[('Admin', 'Admin'), ('Guest', 'Guest')], default='Guest')
    connectionStatus  = SelectField(_l('Connected'),  choices=[('No', 'No'), ('Yes', 'Yes')], default='No')
    active            = SelectField(_l('Active'), choices=[('No', 'No'), ('Yes', 'Yes')], default='Yes')
    loginCount        = StringField(_l('Login Count'), default =0)
    reset             = SelectField(_l('Reset'),  choices=[('No', 'No'), ('Yes', 'Yes')], default='No')
    lastModifiedDate  = StringField(_l('Last Modified'), default =datetime.utcnow())
    token             = StringField(_l('Token'))
    tokenExpiration   = StringField(_l('Token Expiration'), default =datetime.utcnow())
    submit            = SubmitField(_l('Save'))

    def validate_username(self, username):
        user= Users().get("username",username.data )
        if  bool(user):
            raise ValidationError(_('Please use a different username.'))

    def validate_email(self, email):
        user= Users().get("email",email.data )
        if  bool(user):
            raise ValidationError(_('Please use a different email address.'))

class ResetPasswordRequestForm(FlaskForm):
    email = StringField(_l('Email'), validators=[DataRequired(), Email()])
    submit = SubmitField(_l('Request Password Reset'))


class ResetPasswordForm(FlaskForm):
    password = PasswordField(_l('Password'), validators=[DataRequired()])
    password2 = PasswordField(_l('Repeat Password'), validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField(_l('Request Password Reset'))
