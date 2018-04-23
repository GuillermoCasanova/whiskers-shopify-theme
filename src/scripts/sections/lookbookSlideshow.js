
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
            settings: 'unslick'
          }
        ]
      });

      var nextBtn = $(container).find('.slick-next');
      var prevBtn = $(container).find('.slick-prev');

      nextBtn.text('');
      prevBtn.text('');

      var controller = new ScrollMagic.Controller(); 

      var wipeAnimation = new TimelineMax()
        .fromTo(container, 12, { x: "30%"}, { x: "-50%"}, '+=.3');

        new ScrollMagic.Scene({
          triggerElement: '[data-trigger]',
          triggerHook: 'onLeave', 
          offset: '-100%',
          duration: '400%'
        })
        .setPin(container)
        .setTween(wipeAnimation)
        .addTo(controller); 
  };

  return lookbookSlideshow;

})();
