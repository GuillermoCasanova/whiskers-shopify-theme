
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

    this.$carousel = $(selectors.lookbookSlideshow); 
    this.animCtrl = null; 
    this.scrollScene = null; 
    this.reInitTimeout = null; 

    var self = this; 


    this.initInteractivity = function() {

      if(this.animCtrl) {
        this.animCtrl.destroy(this.scrollScene); 
        this.animCtrl.destroy();
        this.animCtrl = null; 
        this.scrollScene.destroy(); 
        this.scrollScene = null; 
        this.$carousel.removeAttr("style");
      }

      if(window.innerWidth < 641) {
        this.$carousel.removeClass("grid  grid--center  med-grid--justifySpaceAround  med-grid--1of3");
        this.$carousel.not('.slick-initialized').slick({
          'arrows': false,
          'slidesToShow': 1,
          'mobileFirst': true,
          'autoplaySpeed': 2500,
          'infinite': false,
          'centerPadding': '40px',
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
      } else {
        this.$carousel.addClass("grid  grid--center  med-grid--justifySpaceAround  med-grid--1of3");
        this.animCtrl = new ScrollMagic.Controller(); 
        var containerWidth = $(container).find(selectors.lookbookSlideshow).innerWidth(); 

        var wipeAnimation = new TimelineMax()
          .fromTo(selectors.lookbookSlideshow, 20, { x: "-50%"}, { x: "30%"});

        this.scrollScene = new ScrollMagic.Scene({
            triggerElement: '[data-trigger-2]',
            triggerHook: 'onLeave', 
            offset: -100,
            duration:  (containerWidth) + 'px'
          })
          .setPin(container)
          .setTween(wipeAnimation)
          .addTo(this.animCtrl); 
      }
    }

    setTimeout(function() {
      self.initInteractivity(); 
    }, 200); 

    window.addEventListener('resize', function() {
      clearTimeout(this.reInitTimeout); 
      this.reInitTimeout = setTimeout(self.initInteractivity(), 1400); 
    }); 
  };

  return lookbookSlideshow;

})();
