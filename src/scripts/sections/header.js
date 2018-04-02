/**
 * Header Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Header template.
 *
   * @namespace header
 */

theme.Header = (function() {

  var selectors = {
    offCanvasMenu: '[data-off-canvas-menu]',
    menuToggle: '[data-menu-toggle]',
    dropDownToggle: '[data-drop-down-toggle]',
    menuContainer: '[data-menu]',
    cartContainer: '[data-cart]'
  };

  function Header(container) {

    this.$container = $(container); 
    var offCanvasMenu = $(selectors.offCanvasMenu);
    var menuToggle = $(selectors.menuToggle); 
    var cartContainer = $(selectors.cartContainer);
    var menuContainer = $(selectors.menuContainer);
    var menuIsOpen = false; 
    var openSection = false; 


    var toggleMenuContainerCSS = function() {
      if(offCanvasMenu.hasClass('is-open')) {
        offCanvasMenu.removeClass('is-open');
        offCanvasMenu.addClass('is-closed');
      } else {
        offCanvasMenu.removeClass('is-closed');
        offCanvasMenu.addClass('is-open');
      }
    };

    $(selectors.menuToggle).on('click', function(event) {

      var currentTarget = $(event.currentTarget).data('target');

      var closeEverything = function() {
        menuContainer.removeClass('is-showing');
        cartContainer.removeClass('is-showing');          
      };

      var closeNavigation = function() {
        offCanvasMenu.removeClass('is-open');
        offCanvasMenu.addClass('is-closed');
        menuIsOpen = false;    
      }; 

      var openNavigation = function() {
        offCanvasMenu.addClass('is-open');
        offCanvasMenu.removeClass('is-closed');
        menuIsOpen = true;
      }; 


      var toggleMenuIcon = function() {
        if(menuToggle.hasClass('is-menu-open')) {
          menuToggle.removeClass('is-menu-open');
          menuToggle.addClass('is-menu-closed');
        } else {
          menuToggle.removeClass('is-menu-closed');
          menuToggle.addClass('is-menu-open');
        }
      }

      var closeMenuIcon = function() {
        menuToggle.removeClass('is-menu-open');
        menuToggle.addClass('is-menu-closed');
      };

      if(!menuIsOpen) {
        openNavigation();
        if($(event.currentTarget).data('target') == 'menu') {
          openSection = 'menu';
          toggleMenuIcon(); 
          closeEverything();
          menuContainer.addClass('is-showing'); 
        } else {
          openSection = 'cart';
          closeEverything();
          cartContainer.addClass('is-showing');        
        }
      } else {

        if(currentTarget == openSection) {
          closeNavigation();
          closeMenuIcon();
          openSection = false;
        } else {
          openSection = false;
          offCanvasMenu.removeClass('is-open');
          offCanvasMenu.addClass('is-closed');
          offCanvasMenu.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(event) {
            if(currentTarget == 'menu') {
              openSection = 'menu';
              toggleMenuIcon(); 
              closeEverything();
              openNavigation();
              menuContainer.addClass('is-showing'); 
            } else {
              openSection = 'cart';
              closeMenuIcon();
              closeEverything();
              openNavigation();
              cartContainer.addClass('is-showing');      
            }
          });
        }
      }
    }); 


    $(selectors.dropDownToggle).on('click', function(event, target) {
      var id = $(event.target).data('toggle-id'); 

      $('[data-dropdown-id]').each(function() {
        if($(this).hasClass('is-open') && $(this).data('dropdown-id') !== id) {
          $(this).removeClass('is-open');
        }
      });

      if($('[data-dropdown-id=' + id + ']').hasClass('is-open')) {
        $('[data-dropdown-id=' + id + ']').removeClass('is-open');
      } else {
        $('[data-dropdown-id=' + id + ']').addClass('is-open');
      }

    }); 

  };

  return Header;

})();




