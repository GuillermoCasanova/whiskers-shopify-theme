
/**
 * Hero Header Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Hero Header template.
 *
   * @namespace Hero Header
 */

theme.heroHeader = (function() {

  var selectors = {
    slideshow: '[data-slideshow]',
    slides: '[data-slide]',
    accents: '[data-accent]',
    contentSlide: '[data-content-slide]',
    headline: '[data-headline]',
    headlinesContainer: '[data-headlines]',
    paragraph: '[data-body]',
    cta: '[data-cta]',
    ctasContainer: '[data-ctas]'
  };


  var heroHeader = function(container) { 

    this.$container = $(container); 
    this.$slideshow = $(selectors.slideshow); 
    this.slides = this.$container.find(selectors.slides); 
    this.accents = this.$container.find(selectors.accents); 
    this.contentSlides = this.$container.find(selectors.contentSlide); 
    this.headlines = this.$container.find(selectors.headline);
    this.headlinesContainer = this.$container.find(selectors.headlinesContainer);
    this.ctas = this.$container.find(selectors.cta);
    this.ctasContainer = this.$container.find(selectors.ctasContainer);
    this.activeSlide = 0; 
    this.slideTotal = this.slides.length;
    this.$slideshow.addClass('is-loading'); 
    this.interval = null; 

    var that = this; 


    this.setActiveSlide = function(pId, pSlides, pContentSlides) {
    
      pSlides.each(function() {
        var slide = $(this); 
        var index = slide.data('index');

        if(index == pId) {
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

      pContentSlides.each(function() {
        var slide = $(this); 
        var index = slide.data('index');

        setTimeout(function() {
          if(index == pId) {
            setTimeout(function() {
              slide.addClass('is-active');
              slide.removeClass('is-hidden');
            }, 700);
            slide.css('visibility', 'visible'); 
          } else {
            slide.addClass('is-hidden');
            slide.removeClass('is-active');
          }
        }, 200); 
      })
    }; 

    this.pauseSlideshow = function() {
      clearInterval(self.interval); 
    }; 


    this.loadSlideshow  = function() {

      var self = this; 

      TweenMax.set(self.$container.find(selectors.headlinesContainer) , {autoAlpha: 1});
      TweenMax.set(self.$container.find(selectors.ctasContainer) , {autoAlpha: 1});

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
          self.setActiveSlide(self.activeSlide, self.slides, self.contentSlides); 
          if(self.$slideshow.hasClass('is-loading')) {
            self.$slideshow.removeClass('is-loading'); 
          }

          self.interval = setInterval(function() {
            self.activeSlide = self.activeSlide + 1; 
            if(self.activeSlide > self.slideTotal - 1) {
              self.activeSlide = 0;
            }
            self.setActiveSlide(self.activeSlide, self.slides, self.contentSlides); 
          }, 4400); 
        }, 200); 
      } else {
        self.setActiveSlide(self.activeSlide, self.slides, self.contentSlides); 
      }
    }

    $(window).resize(function() {
      setTimeout(function() {
        this.loadSlideshow();

      }, 200); 
    }); 

    this.loadSlideshow();
  };


  //
  // Events to listen to when using the theme editor 
  //
  heroHeader.prototype = $.extend({}, heroHeader.prototype, {

    onBlockSelect: function(evt) {
      var id = $('[data-block-id="' + evt.detail.blockId + '"]').data('index');
      this.setActiveSlide(id, this.slides, this.accents, this.headlines, this.ctas); 
      this.pauseSlideshow(); 
    }

  })


  return heroHeader;

})();

