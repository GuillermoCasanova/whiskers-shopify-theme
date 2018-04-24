
/**
 * Whiskers Intro Template Scripts
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Whiskers Intro template.
 *
   * @namespace whiskers_intro
 */

theme.whiskersIntro = (function() {

  var selectors = {
    shoeSlideshow: '[data-shoe-slideshow]',
    shoeSlideshowSlides: '[data-slide]',
    accents: '[data-accent]'
  };

  var whiskersIntro = function(container) { 

    this.$container = $(container); 
    var slides = this.$container.find(selectors.shoeSlideshowSlides); 
    var accents = this.$container.find(selectors.accents); 
    var activeSlide = 0; 
    var slideTotal = slides.length;

    var setActiveSlide = function(pId, pSlides, pAccents) {

      pSlides.each(function() {
        var slide = $(this); 
        var index = slide.data('index');

        if(index == activeSlide) {
          slide.addClass('is-active');
          slide.removeClass('is-hidden');
        } else {
          slide.removeClass('is-active');
          slide.addClass('is-hidden');
        }
      });   


      pAccents.each(function() {
        var elem = $(this); 
        var index = elem.data('index');

        if(index == activeSlide) {
          elem.addClass('is-active');
          elem.removeClass('is-hidden');
        } else {
          elem.removeClass('is-active');
          elem.addClass('is-hidden');
        }
      }); 

    }; 
    
    setActiveSlide(0, slides, accents); 

    setInterval(function() {
      activeSlide = activeSlide + 1; 
      if(activeSlide > slideTotal - 1) {
        activeSlide = 0;
      }
      setActiveSlide(activeSlide, slides, accents); 
    }, 3000); 

  };

  return whiskersIntro;

})();
