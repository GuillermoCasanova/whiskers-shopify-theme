
/**
 * Collection Navigation Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection Navigation template.
 *
   * @namespace header
 */

theme.heroHeader = (function() {

  var selectors = {
    slideshow: '[data-slideshow]',
    slides: '[data-slide]',
    accents: '[data-accent]'
  };

  var heroHeader = function(container) { 

    this.$container = $(container); 
    this.slides = this.$container.find(selectors.slides); 
    this.accents = this.$container.find(selectors.accents); 
    this.activeSlide = 0; 
    this.slideTotal = this.slides.length;

    this.loadSlideshow  = function() {

      var self = this; 

      var setActiveSlide = function(pId, pSlides, pAccents) {
        
        pSlides.each(function() {
          var slide = $(this); 
          var index = slide.data('index');

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

      var loadImages = function(pSlides) {
        pSlides.each(function() {
          var slide = $(this); 
          var imgUrl = slide.data('image'); 
          slide.find('[data-image]').css('background-image', 'url(' + imgUrl + ')'); 
        })
      };


      if(window.innerWidth > 640) {

        loadImages(self.slides); 
        setActiveSlide(self.activeSlide, self.slides, self.accents); 

        setTimeout(function() {

          setInterval(function() {
            self.activeSlide = self.activeSlide + 1; 
            if(self.activeSlide > self.slideTotal - 1) {
              self.activeSlide = 0;
            }
            setActiveSlide(self.activeSlide, self.slides, self.accents); 
          }, 4000); 

        }, 400); 

      } else {
        setActiveSlide(self.activeSlide, self.slides, self.accents); 
      }

    }

    $(window).resize(function() {

      setTimeout(function() {
        this.loadSlideshow();
      }, 200); 

    }); 

    this.loadSlideshow();

  };

  return heroHeader;

})();
