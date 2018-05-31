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

   var offCanvasMenu = $(selectors.offCanvasMenu);
  var menuToggle = $(selectors.menuToggle); 
  var cartContainer = $(selectors.cartContainer);
  var menuContainer = $(selectors.menuContainer);
  var menuIsOpen = false; 
  var openSection = false; 


  var Header = function(container) {

    this.$container = $(container); 
    var $container = (this.$container = $(container));

    this.template = $container.attr('data-template');

    // ajaxCart.init will run from Product.prototype when on the product page
    if (this.template.indexOf('product') === -1) {
      ajaxCart.init({
        formSelector: '.add-to-cart__form',
        cartContainer: '#CartContainer',
        addToCartSelector: '.add-to-cart',
        enableQtySelectors: true,
        moneyFormat: theme.strings.moneyFormat
      });
    };


    var toggleMenuContainerCSS = function() {
      if(offCanvasMenu.hasClass('is-open')) {
        offCanvasMenu.removeClass('is-open');
        offCanvasMenu.addClass('is-closed');
      } else {
        offCanvasMenu.removeClass('is-closed');
        offCanvasMenu.addClass('is-open');
      }
    };

    var closeEverything = function() {
      menuContainer.removeClass('is-showing');
      cartContainer.removeClass('is-showing');   
      menuIsOpen = false;    
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

    $(selectors.menuToggle).on('click', function(event) {

      var currentTarget = $(event.currentTarget).data('target');

      if(!menuIsOpen) {
        openNavigation();
        if($(event.currentTarget).data('target') == 'menu') {
          openSection = 'menu';
          toggleMenuIcon(); 
          closeEverything();
          menuIsOpen = true;    
          menuContainer.addClass('is-showing'); 
        } else {
          openSection = 'cart';
          closeEverything();
          ajaxCart.load();
          menuIsOpen = true;    
          cartContainer.addClass('is-showing');        
        }
      } else {

        if(currentTarget == openSection) {
          closeEverything();
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
              closeEverything();
              openNavigation();
              menuToggle.removeClass('is-menu-closed');
              menuToggle.addClass('is-menu-open');
              menuContainer.addClass('is-showing'); 
            } else {
              openSection = 'cart';
              closeMenuIcon();
              closeEverything();
              openNavigation();
              ajaxCart.load();
              cartContainer.addClass('is-showing');      
            }
          });
        }
      }
    }); 


    //
    // Code the dropdown menu on small devices 
    //
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


  // Open cart method 
  Header.openCart = function() {
    offCanvasMenu.removeClass('is-closed');
    offCanvasMenu.addClass('is-open');
    cartContainer.addClass('is-showing');   
    openSection = 'cart';
    menuIsOpen = true;  
  }; 

  return Header;

})();




