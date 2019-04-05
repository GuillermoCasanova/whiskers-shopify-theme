
/**
 * Collection Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled code to the Collection templates.
 *
   * @namespace collection
 */

theme.collection = (function() {

  var selectors = {
    products: '[data-product]'
  };

  this.animCtrl = null;
  this.pageScene = null; 

  var self = this; 

  var setUpThumbAnimations = function() {

    setTimeout(function(){
    
    //
    // Defining the animations with ScrollMagic
    //
    self.animCtrl = new ScrollMagic.Controller(); 


      //
      // Defines the entry animations for our products
      //
      $(selectors.products).each(function(index, element) {
        
        var product = element;

        TweenMax.set($(product).find('[data-product-img]'), {autoAlpha: 1});

        var delay = ((index + 1) === 4) ?  1 : (index + 1);

        var productEntry = new TimelineLite()
                .from($(product).find('[data-product-img]'), .3, {opacity: 0}, .02 * delay);

        var productScene = new ScrollMagic.Scene({
            triggerElement: product,
            triggerHook: 'onEnter',
            reverse: false
          })
          .setTween(productEntry)
          .addTo(self.animCtrl); 

      });

    },200); 
  }


  setUpThumbAnimations(); 


  // $(document).on('reset-thumbnails', function() {
  //   setUpThumbAnimations(); 
  // })


})();
