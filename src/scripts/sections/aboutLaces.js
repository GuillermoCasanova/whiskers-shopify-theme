
/**
 * Collection Navigation Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection Navigation template.
 *
   * @namespace header
 */

theme.aboutLaces = (function() {

  var selectors = {
    aboutSlideshow: '[data-about-lace-slideshow]',
    aboutSlides: '[data-slide]'
  };

  var aboutLaces = function() { 


    // pSlides.each(function() {
    //    $(this).addClass('ng-leave'); 
    // }); 

    var slides = $(selectors.aboutSlides); 
    var activeSlide = 0; 
    var slideTotal = slides.length;

    var setActiveSlide = function(pId, pSlides) {

      pSlides.each(function() {
        var slide = $(this); 
        var index = slide.data('slide-index');

        if(index == activeSlide) {
          slide.addClass('is-active');
          slide.removeClass('is-hidden');
        } else if(index == 2) {
          slide.removeClass('is-active');
          setTimeout(function() {
            slide.addClass('is-hidden'); 
          }, 600); 
        } else {
          slide.removeClass('is-active');
        }
      }); 

    }; 
    
    setActiveSlide(activeSlide, slides); 

    setInterval(function() {
      activeSlide = activeSlide + 1; 
      if(activeSlide > slideTotal - 1) {
        activeSlide = 0;
      }
      setActiveSlide(activeSlide, slides); 
    }, 4000); 

  };

  return aboutLaces;

})();
