
/**
 * About Laces Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the About Laces Template
 *
   * @namespace About Laces
 */

theme.aboutLaces = (function() {

  var selectors = {
    aboutSlideshow: '[data-about-lace-slideshow]',
    aboutSlides: '[data-slide]',
    accents: '[data-accent]'
  };

  var aboutLaces = function(container) { 

    this.$container = $(container); 
    this.slides = this.$container.find(selectors.aboutSlides); 
    this.accents = this.$container.find(selectors.accents); 
    this.activeSlide = 0; 
    this.slideTotal = this.slides.length;

    var self = this; 

    var setActiveSlide = function(pId, pSlides, pAccents) {

      pSlides.each(function() {
        var slide = $(this); 
        var index = slide.data('slide-index');

        if(index == self.activeSlide) {
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

      pAccents.each(function() {
        var elem = $(this); 
        var index = elem.data('index');

        if(index == self.activeSlide) {
          elem.addClass('is-active');
          elem.removeClass('is-hidden');
        } else {
          elem.removeClass('is-active');
          elem.addClass('is-hidden');
        }
      }); 

    }; 
    
    setActiveSlide(self.activeSlide, self.slides, self.accents); 

    setInterval(function() {
      self.activeSlide = self.activeSlide + 1; 
      if(self.activeSlide > self.slideTotal - 1) {
        self.activeSlide = 0;
      }
      setActiveSlide(self.activeSlide, self.slides, self.accents); 
    }, 4000); 
  };

  return aboutLaces;

})();
