
/**
 * Lookbook Slideshow Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the lookbook Slideshow Template
 *
   * @namespace lookbookSlideshow
 */

theme.lookbookSlideshow = (function() {

  var selectors = {
    lookbookSlideshow: '[data-lookbook-slideshow]'
  };

  var lookbookSlideshow = function() { 

    $(selectors.lookbookSlideshow).slick({
      'arrows': false,
      'slidesToShow': 1,
      'mobileFirst': true,
      'autoplaySpeed': 2500,
      'infinite': false,
      'centerMode': true,
      'centerPadding': '40px'
      })
  };

  return lookbookSlideshow;

})();
