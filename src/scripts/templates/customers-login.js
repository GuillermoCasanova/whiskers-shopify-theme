/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Login template
 *
 * @namespace password
 */

theme.customerLogin = (function() {

  var selectors = {
    registerForm: '[data-register-form]',
    loginForm: '[data-login-form]',
    signUpCta: '[data-sign-up-cta]',
    loginCta: '[data-login-cta]',
    showLogin: '[data-show-login]',
    showRegister: '[data-show-register]',
    loginPage: '[data-login]',
    panels: '[data-panel'
  };


  var config = {
    recoverPasswordForm: '#RecoverPassword',
    hideRecoverPasswordLink: '#HideRecoverPasswordLink'
  };




  /**
  ** If the page has a recover password form, we activate the recover password code
  */
  if ($(config.recoverPasswordForm).length) {

    checkUrlHash();
    resetPasswordSuccess();

    $(config.recoverPasswordForm).on('click', onShowHidePasswordForm);
    $(config.hideRecoverPasswordLink).on('click', onShowHidePasswordForm);


    function onShowHidePasswordForm(evt) {
      evt.preventDefault();
      toggleRecoverPasswordForm();
    }

    function checkUrlHash() {
      var hash = window.location.hash;

      // Allow deep linking to recover password form
      if (hash === '#recover') {
        toggleRecoverPasswordForm();
      }

      // if(hash ==='#register') {
      //   toggleRegisterView(); 
      // }
    }

    /**
     *  Show/Hide recover password form
     */
    function toggleRecoverPasswordForm() {
      $('#RecoverPasswordForm').toggleClass('is-hidden');
      $('#RecoverPasswordForm').toggleClass('is-showing');
      $(selectors.loginForm).toggleClass('is-hidden');
    }

    /**
     *  Show reset password success message
     */
    function resetPasswordSuccess() {
      var $formState = $('.reset-password-success');

      // check if reset password form was successfully submited.
      if (!$formState.length) {
        return;
      }

      // show success message
      $('#RecoverPasswordForm').toggleClass('is-hidden');
      $('#RecoverPasswordForm').toggleClass('is-showing');
      $(selectors.loginForm).toggleClass('is-hidden');
    }
  }


  /**
  ** If this isn't the login page, we do nothing  beyond this point 
  */
  if (!$(selectors.loginPage).length) {
    return
  }


  /**
   * Buttons to show/hide register and log in forms
   */
  $(selectors.showRegister).on('click', toggleRegisterView); 
  $(selectors.showLogin).on('click', toggleRegisterView);
  $('body').css('overflow', 'hidden'); 

  /**
   *  Show/Hide Register form state  
   */
   function toggleRegisterView() {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $('.loginPage-inner').scrollTop(0);
    $('.loginPage').scrollTop(0);

    $(selectors.registerForm).toggleClass('is-showing'); 
    $(selectors.loginForm).toggleClass('is-showing'); 
    $(selectors.signUpCta).toggleClass('is-showing'); 
    $(selectors.loginCta).toggleClass('is-showing'); 

    $(selectors.registerForm).toggleClass('is-hidden'); 
    $(selectors.loginForm).toggleClass('is-hidden'); 
    $(selectors.signUpCta).toggleClass('is-hidden'); 
    $(selectors.loginCta).toggleClass('is-hidden'); 

    
    $(selectors.panels).toggleClass('is-showing-register'); 
   }

})();
