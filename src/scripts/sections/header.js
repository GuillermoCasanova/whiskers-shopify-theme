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
    menuToggle: '[data-menu-toggle]'
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

  };

  return Header;

})();
