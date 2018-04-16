
/**
 * Lookbook Slideshow Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the lookbook Slideshow Template
 *
   * @namespace lookbookSlideshow2
 */

theme.lookbookSlideshow2 = (function() {

  var selectors = {
    lookbookSlideshow: '[data-lookbook-slideshow-2]'
  };

  var lookbookSlideshow = function(container) { 

    $(selectors.lookbookSlideshow).slick({
      'arrows': false,
      'slidesToShow': 1,
      'mobileFirst': true,
      'autoplaySpeed': 2500,
      'infinite': false,
      'centerMode': true,
      'centerPadding': '40px',
      'touchThreshold': 10,
      'rtl': true,
      'responsive' : [
          {
            breakpoint: 640, 
            settings: {
              slidesToShow: 2,
              arrows: true,
              initialSlide: 1,
              centerPadding: '60px',
            }
          },
          {
            breakpoint: 960, 
            settings: {
              slidesToShow: 3,
              arrows: true,
              initialSlide: 1,
              centerPadding: '60px',
            }
          }
        ]
      });

      var nextBtn = $(container).find('.slick-next');
      var prevBtn = $(container).find('.slick-prev');

      nextBtn.text('');
      prevBtn.text('');

  };

  return lookbookSlideshow;

})();
