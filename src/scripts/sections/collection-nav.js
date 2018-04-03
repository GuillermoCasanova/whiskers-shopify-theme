
/**
 * Collection Navigation Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection Navigation template.
 *
   * @namespace header
 */

theme.collectionNav = (function() {

  var selectors = {
    collectionNavSelect: '[data-collection-nav-select]',
    tags: '[data-collection-tag]'
  };

  var collectionNav = function() {

  var updateActiveTag = function() {
    $(selectors.tags).each(function() {

      var tag = $(this); 
      if(tag.data('url') == window.location.pathname) {
        tag.addClass('is-active'); 
      } else {
        tag.removeClass('is-active');
      }
    }); 
  }; 

   $(selectors.collectionNavSelect)
      .on('change', function(event) {
        var destination = this.value; 
        window.location.href = destination;
      }
    );

    $(selectors.collectionNavSelect).val(window.location.pathname); 

    updateActiveTag();

  };

  return collectionNav;

})();
