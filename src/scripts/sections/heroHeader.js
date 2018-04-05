
/**
 * Collection Navigation Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection Navigation template.
 *
   * @namespace header
 */

theme.heroHeader = (function() {

  var selectors = {
    slideshow: '[data-slideshow]'
  };

  var heroHeader = function() { 

    $(selectors.slideshow).slick({
      'arrows': false,
      'slidesToShow': 1,
      'mobileFirst': true,
      'autoplay': true,
      'vertical': true,
      'verticalSwiping': true,
      'autoplaySpeed': 2500
    })

  };

  return heroHeader;

})();
