from flask import render_template, redirect, url_for, flash, request
from werkzeug.urls import url_parse
from flask_login import login_user, logout_user, current_user
from flask_babel import _
from app import db
from app.auth import bp
from app.auth.forms import LoginForm, RegistrationForm, ResetPasswordRequestForm, ResetPasswordForm
from app.models import Users
from app.auth.email import send_password_reset_email
from datetime import datetime

@bp.route('/auth/login', methods=['GET', 'POST'])
@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated and not current_user.locked:
        return redirect(url_for('main.index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = Users.objects(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('auth.login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            user.connectionStatus = True
            login_count = user.loginCount
            user.loginCount = login_count+1
            user.save()
            next_page = url_for('main.index')
        return redirect(next_page)
    opts ={} 
    opts['logo']        =  None
    opts['startTime']   =  datetime.utcnow()
    opts['timeOut']     =  None
    opts['siteName']    =  'CSAM'
    opts['userName']    =  None
    opts['previousDest']=  None
    opts['currentTime'] =  datetime.utcnow()
    opts['siteTitle']   =   'Compute and Storage Self-Service Platform (CS3P)'
    return render_template('login.html', title=_('Sign In'), pageID='login', options=opts, year='2020', form=form)


@bp.route('/logout')
def logout():
    current_user.connectionStatus  = False
    current_user.save()
    logout_user()
    return redirect(url_for('auth.login'))

@bp.route('/auth/register', methods=['GET', 'POST'])
@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        #user = Users(request.form['text'], email=form.email.data)
        user  = Users(id=(Users.get_record_count()+1),firstName =request.form['firstName'],surname  =request.form['surname'],username  =request.form['username'],
                    email     =request.form['email'],
                    creationDate =datetime.utcnow(),
                    locked      =False if str(request.form['locked']).lower()== 'no' else True,
                    team       =request.form['team'],
                    role       =request.form['role'],
                    connectionStatus = False  if str(request.form['connectionStatus']).lower()== 'yes' else True,
                    active =  True if str(request.form['active']).lower()== 'yes' else False,
                    reset = True if str(request.form['reset']).lower()== 'yes' else False,
                    lastModifiedDate =datetime.utcnow(),
                    loginCount =0
        )
        user.set_password(form.password.data)
        ##print(user)
        #db.session.add(user)
        #db.session.commit()
        user.save()
        flash(_('User account has been successfully added!'))
        return redirect(url_for('auth.login'))
    else:
        print('form is not valid')
    opts ={} 
    opts['logo']        =  None
    opts['startTime']   =  datetime.utcnow()
    opts['timeOut']     =  None
    opts['siteName']    =  'CSAM'
    opts['userName']    =  None
    opts['previousDest']=  None
    opts['currentTime'] =  datetime.utcnow()
    opts['siteTitle']   =   'Compute and Storage Assets Manager'
    return render_template('register.html',pageID='register', options=opts, title=_('Add User'),form=form)


@bp.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    form = ResetPasswordRequestForm()
    if form.validate_on_submit():
        user = Users.objects(email=form.email.data).first()
        if user:
            send_password_reset_email(user)
        flash(
            _('Check your email for the instructions to reset your password'))
        return redirect(url_for('auth.login'))
    return render_template('auth/reset_password_request.html',
                           title=_('Reset Password'), form=form)


@bp.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    user = Users.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('main.index'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash(_('Your password has been reset.'))
        return redirect(url_for('auth.login'))
    return render_template('auth/reset_password.html', form=form)
