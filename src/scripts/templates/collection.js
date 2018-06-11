
/**
 * Collection Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled code to the Collection template.
 *
   * @namespace collection
 */

theme.collection = (function() {

  var selectors = {
    collectionHeader: '[data-page-header]',
    collectionHeadline: '[data-page-headline]',
    headerBackground: '[data-header-bg]',
    products: '[data-product]',
  };

  this.animCtrl = null;
  this.pageScene = null; 
  this.tweens = {};

  var self = this; 

  setTimeout(function(){
    
    //
    // Defining the animations with ScrollMagic
    //
    self.animCtrl = new ScrollMagic.Controller(); 


    //
    // Defines the entry animations for our page header 
    //
    TweenMax.set(selectors.headerBackground, {autoAlpha: 1});
    TweenMax.set(selectors.collectionHeadline, {autoAlpha: 1});

    self.tweens.headerEntry = new TimelineMax()
        .from(selectors.headerBackground, .4, {y: '100%'})
        .from(selectors.collectionHeadline, .4, {y: '20px', opacity: 0});


    self.pageScene = new ScrollMagic.Scene({
          triggerElement: selectors.collectionHeader,
          triggerHook: 'onEnter'
        })
        .setTween(self.tweens.headerEntry)
        .addTo(self.animCtrl); 


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

      // TweenMax.set('[data-product-img]', {autoAlpha: 1});

      // var productEntry = new TimelineLite()
      //         .from('[data-product-img]', .3, {opacity: 0});

      // var productScene = new ScrollMagic.Scene({
      //     triggerElement: ,
      //     triggerHook: 'onEnter'
      //   })
      //   .setTween(productEntry)
      //   .addTo(self.animCtrl); 

  }, 200); 

})();
