
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
    this.$slideshow = $(selectors.slideshow); 
    this.slides = this.$container.find(selectors.slides); 
    this.accents = this.$container.find(selectors.accents); 
    this.activeSlide = 0; 
    this.slideTotal = this.slides.length;
    this.$slideshow.addClass('is-loading'); 

    this.loadSlideshow  = function() {

      var self = this; 


      var setActiveSlide = function(pId, pSlides, pAccents) {
      
        // var imgUrl =  $(pSlides[pId]).data('image-src'); 
        // $(pSlides[pId]).find('[data-image]').css('background-image', 'url(' + imgUrl + ')'); 

        pSlides.each(function() {
          var slide = $(this); 
          var index = slide.data('index');

          if(index == self.activeSlide) {
            slide.addClass('is-active');
            slide.css('visibility', 'visible'); 
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

          setTimeout(function() {
            if(index == self.activeSlide) {
              elem.addClass('is-active');
              elem.removeClass('is-hidden');
            } else {
              elem.removeClass('is-active');
              elem.addClass('is-hidden');
            }
          }, 200); 
        }); 

      }; 

      var loadImages = function(pSlides) {
        pSlides.each(function() {
          var slide = $(this); 
          var imgUrl = slide.data('image-src'); 
         slide.find('[data-image]').css('background-image', 'url(' + imgUrl + ')'); 
        })
      };


      if(window.innerWidth > 640) {
        loadImages(self.slides);

        setTimeout(function() {
          setActiveSlide(self.activeSlide, self.slides, self.accents); 
          if(self.$slideshow.hasClass('is-loading')) {
            self.$slideshow.removeClass('is-loading'); 
          }

          setInterval(function() {
            self.activeSlide = self.activeSlide + 1; 
            if(self.activeSlide > self.slideTotal - 1) {
              self.activeSlide = 0;
            }
            setActiveSlide(self.activeSlide, self.slides, self.accents); 
          }, 4000); 
        }, 500); 
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
