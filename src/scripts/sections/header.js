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
    dropDownToggle: '[data-drop-down-toggle]'
  };

  function Header(container) {

    this.$container = $(container); 

    var offCanvasMenu = $(selectors.offCanvasMenu);
    var menuToggle = $(selectors.menuToggle); 

    $(selectors.menuToggle).on('click', function() {
      if(offCanvasMenu.hasClass('is-open')) {
        offCanvasMenu.removeClass('is-open');
        offCanvasMenu.addClass('is-closed');
        menuToggle.removeClass('is-menu-open'); 
        menuToggle.addClass('is-menu-closed');
      } else {
        offCanvasMenu.removeClass('is-closed');
        offCanvasMenu.addClass('is-open');
        menuToggle.removeClass('is-menu-closed'); 
        menuToggle.addClass('is-menu-open');
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
