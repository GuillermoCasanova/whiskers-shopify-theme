
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
    slides: '[data-slide]'
  };

  var heroHeader = function(container) { 

    var $container = $(container); 


    function loadSlideshow() {

      if(window.innerWidth > 640) {

        var slides = $container.find(selectors.slides); 
        var activeSlide = 0; 
        var slideTotal = slides.length;

        var setActiveSlide = function(pId, pSlides) {
          
          pSlides.each(function() {
            var slide = $(this); 
            var index = slide.data('index');

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

        var loadImages = function(pSlides) {

          pSlides.each(function() {
            var slide = $(this); 
            var imgUrl = slide.data('image'); 
            slide.find('[data-image]').css('background-image', 'url(' + imgUrl + ')'); 
          })
        }

        loadImages(slides); 

        setActiveSlide(activeSlide, slides); 

        setInterval(function() {
          activeSlide = activeSlide + 1; 
          if(activeSlide > slideTotal - 1) {
            activeSlide = 0;
          }
          setActiveSlide(activeSlide, slides); 
        }, 4000); 

      }  
    }


    $(window).resize(function() {

      setTimeout(function() {
        loadSlideshow();
      }, 200); 

    }); 

    loadSlideshow();


  };

  return heroHeader;

})();
