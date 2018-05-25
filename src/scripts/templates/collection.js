
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
        .from(selectors.headerBackground, .6, {y: '100%'}, .4)
        .from(selectors.collectionHeadline, .6, {y: '20px', opacity: 0}, '-=.4');


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

        console.log(product);

        TweenMax.set($(product).find('[data-product-img]'), {autoAlpha: 1});

        var productEntry = new TimelineLite()
                .from($(product).find('[data-product-img]'), .6, {y: "101%"}, .2 + (index * .10));

        var productScene = new ScrollMagic.Scene({
            triggerElement: product,
            triggerHook: 'onEnter'
          })
          .setTween(productEntry)
          .addTo(self.animCtrl); 

      });

  }, 200); 

})();
