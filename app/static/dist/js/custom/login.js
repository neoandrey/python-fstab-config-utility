$(document).ready(function(){

/** login **/
$.fn.submitLogin = function(e){
    if (e && e.keyCode == 13) {
        $('#login-submit-bttn').click()
        return false;
    }
}
$('#password').on('keypress',function(e){
   if($('#password').val() && $('#password').val().length >=6){
        $('#password-errors').html('');
        $.fn.submitLogin();
   }
});

$('#username').on('keypress',function(e){
    $('#username-errors').html('');
    $.fn.submitLogin();
});

//$('.form-group').css('max-width','90%');


$("#login-form").submit(function(e){
    //$('#login-submit-bttn').hide()
    let isConfirmed = $('#is-confirmed').val()
    if (isConfirmed !='9999999999') {
        e.preventDefault();
   
    var  username = $('#username').val()
    var  password = $('#password').val()
  if (username ==''){

      $.fn.showMessageDialog('<div align="center">Login Failed</div>', '<div align = "center" color="red">Username cannot be empty</div>');
    $('#username-errors').html('<p>Please type a username</p>')
    } else{

        if (password ==''){
    
               $.fn.showMessageDialog('<div align="center">Login Failed</div>','<div align = "center" color="red">Password cannot be empty</div>');
                if(username!=''){
                    $('#password-errors').html('<p>Please the password for '+username)
                }
    
   }
}
 }
    if ( username != '' &&  password != ''){
        
           $('#is-confirmed').val('9999999999')
    }  
});

});
