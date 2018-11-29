/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Product template.
 *
   * @namespace product
 */

theme.Product = (function() {

  var selectors = {
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    backBtn: '[data-back-btn]',
    comparePrice: '[data-compare-price]',
    comparePriceText: '[data-compare-text]',
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    productAnimElem: '[data-product-anim-elem]', 
    productFeaturedImage: '[data-product-featured-image]',
    productJson: '[data-product-json]',
    productPrice: '[data-product-price]',
    productThumbs: '[data-product-single-thumbnail]',
    singleOptionSelector: '[data-single-option-selector]',
    zoomBtn: '[data-zoom-btn]',
    zoomModal: '[data-zoom-modal]'
  };
  


  /**
   * Product section constructor. Runs on page load as well as Theme Editor
   * `section:load` events.
   * @param {string} container - selector for the section container DOM element
   */
  function Product(container) {
    this.$container = $(container);
    
    var $container = (this.$container = $(container));
    var sectionId = $container.attr('data-section-id');
    var slideshow = $container.find('[data-ui-component="product-photo-slideshow"]'); 


    //
    // Product page animations
    //
    TweenMax.set($container.find(selectors.productAnimElem), {autoAlpha: 1});

    this.animCtrl = new ScrollMagic.Controller(); 

    this.productAnim = new TimelineMax()
                    .staggerFrom(selectors.productAnimElem, .4, {opacity: 0, y: '20px'}, .04); 

    this.productAnimScene = new ScrollMagic.Scene({
          triggerElement: container, 
          triggerHook: 'onEnter'
      })
      .setTween(this.productAnim)
      .addTo(this.animCtrl); 



    //
    // Product images slideshow 
    //
    slideshow.slick({
      'centerMode': true,
      'centerPadding': '36px',
      'slidesToShow:': 1,
      'mobileFirst': true,
      'arrows': false, 
      'responsive': [ {
          'breakpoint': 720, 
          'settings': {
            'slidesToShow': 1,
            'arrows': false, 
            'centerPadding': '150px'
          }
        },
        {
          'breakpoint': 960, 
          'settings': {
            'slidesToShow': 1,
            'centerMode': false,
            'infinite': false, 
            'arrows': true, 
            'centerPadding': '0px'
          }
        }
      ]
    });

    var nextBtn = $(container).find('.slick-next');
    var prevBtn = $(container).find('.slick-prev');

    nextBtn.text('');
    prevBtn.text('');
    prevBtn.addClass('is-hidden'); 

    slideshow.on('afterChange', function(event, slick, currentSlide, nextSlide) {
      if(currentSlide === (slick.$slides.length - 1)) {
        nextBtn.addClass('is-hidden')
      } else if(currentSlide === 0) {
        prevBtn.addClass('is-hidden')
      } else {
        prevBtn.removeClass('is-hidden')
        nextBtn.removeClass('is-hidden')  
      }
    }); 

    var focusProductImage = function(pIndex) {
      if(slideshow) {
        slideshow.slick('slickGoTo', pIndex); 
      } else{
        return; 
      }
    }; 

    $(selectors.productThumbs).each(function() {
      $(this).on('click',function() {
        var id = $(this).data('slide-index') - 2; 
        focusProductImage(id); 
      }); 
    }); 


    //
    // Stop parsing if we don't have the product json script tag when loading
    // section in the Theme Editor
    //
    if (!$(selectors.productJson, this.$container).html()) {
      return;
    }

    var sectionId = this.$container.attr('data-section-id');
    this.productSingleObject = JSON.parse($(selectors.productJson, this.$container).html());

    var options = {
      $container: this.$container,
      enableHistoryState: this.$container.data('enable-history-state') || false,
      singleOptionSelector: selectors.singleOptionSelector,
      originalSelectorId: selectors.originalSelectorId,
      product: this.productSingleObject
    };

    this.settings = {};
    this.namespace = '.product';
    this.variants = new slate.Variants(options);
    this.$featuredImage = $(selectors.productFeaturedImage, this.$container);

    this.$container.on('variantChange' + this.namespace, this.updateAddToCartState.bind(this));
    this.$container.on('variantPriceChange' + this.namespace, this.updateProductPrices.bind(this));

    if (this.$featuredImage.length > 0) {
      this.settings.imageSize = slate.Image.imageSize(this.$featuredImage.attr('src'));
      slate.Image.preload(this.productSingleObject.images, this.settings.imageSize);

      this.$container.on('variantImageChange' + this.namespace, this.updateProductImage.bind(this));
    }

    this.initAjaxCart(); 
    this.initProductZoom();

  }

  Product.prototype = $.extend({}, Product.prototype, {

    /**
     * Updates the DOM state of the add to cart button
     *
     * @param {boolean} enabled - Decides whether cart is enabled or disabled
     * @param {string} text - Updates the text notification content of the cart
     */
    updateAddToCartState: function(evt) {
      var variant = evt.variant;

      if (variant) {
        $(selectors.priceWrapper, this.$container).removeClass('hide');
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(theme.strings.unavailable);
        $(selectors.priceWrapper, this.$container).addClass('hide');
        return;
      }

      if (variant.available) {
        $(selectors.addToCart, this.$container).prop('disabled', false);
        $(selectors.addToCartText, this.$container).html(theme.strings.addToCart);
      } else {
        $(selectors.addToCart, this.$container).prop('disabled', true);
        $(selectors.addToCartText, this.$container).html(theme.strings.soldOut);
      }
    },

    /**
     * Updates the DOM with specified prices
     *
     * @param {string} productPrice - The current price of the product
     * @param {string} comparePrice - The original price of the product
     */
    updateProductPrices: function(evt) {
      var variant = evt.variant;
      var $comparePrice = $(selectors.comparePrice, this.$container);
      var $compareEls = $comparePrice.add(selectors.comparePriceText, this.$container);

      $(selectors.productPrice, this.$container)
        .html(slate.Currency.formatMoney(variant.price, theme.moneyFormat));

      if (variant.compare_at_price > variant.price) {
        $comparePrice.html(slate.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat));
        $compareEls.removeClass('hide');
      } else {
        $comparePrice.html('');
        $compareEls.addClass('hide');
      }
    },

    /**
     * Updates the DOM with the specified image URL
     *
     * @param {string} src - Image src URL
     */
    updateProductImage: function(evt) {
      var variant = evt.variant;
      var sizedImgUrl = slate.Image.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);

      this.$featuredImage.attr('src', sizedImgUrl);
    },

    /**
     * Event callback for Theme Editor `section:unload` event
     */
    onUnload: function() {
      this.$container.off(this.namespace);
    },
    /**
     * Initializes the AJAX cart with product template properties  
     */
    initAjaxCart: function() {
       ajaxCart.init({
            formSelector: '#AddToCartForm--' + this.$container.attr('data-section-id'),
            cartContainer: '#CartContainer',
            addToCartSelector: '#AddToCart--' + this.$container.attr('data-section-id'),
            enableQtySelectors: true,
            moneyFormat: theme.strings.moneyFormat
      });
    },
    initProductZoom: function() {

      var that = this; 



      if($(window).innerWidth() > 960)  {
         setTimeout(function() {

          var isZoomed = false; 
          $('[data-product-image]').panzoom({
            increment: .6,
            minScale: 1,
            maxScale: 1.6,
            contain: 'invert' 
          }); 
          
          var zoomed = false; 

          $('[data-product-image]').on('click', function() {


            if(!zoomed) {

              if( $('[data-product-image]').panzoom()) {
                $('[data-product-image]').panzoom("reset"); 
              }

              $('[data-product-image]').panzoom("zoom");

              $('[data-product-image]').on('mousemove', function(e) {
       // var parentOffset = $('.product-photoSlideshow-slide').offset();
       //  var relativeXPosition = (e.pageX - parentOffset.left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
       //  var relativeYPosition = (e.pageY - parentOffset.top);
       //    console.log(relativeXPosition)
       //    console.log(relativeYPosition)
       //           // console.log(e); 
       //           var x = e.pageX - $('[data-product-image]').offset().left/$('[data-product-image]').width() * 100 + '%';
       //           var y = e.pageY - $('[data-product-image]').offset().top/$('[data-product-image]').width() * 100 + '%';
                
       //            console.log(x); 
       //            console.log(y); 
       //           $('[data-product-image]').panzoom("pan", x * .100, y * .100); 

                $('[data-product-image]').css({'transform-origin': ((e.pageX - $('.product-photoSlideshow-slide').offset().left) / $('.product-photoSlideshow-slide').width()) * 100 + '% ' + ((e.pageY - $('.product-photoSlideshow-slide').offset().top) / $('.product-photoSlideshow-slide').height()) * 100 +'%'});
              }); 

              // $('.product-photoSlideshow-slide').on('mouseout', function(e) {
              //   $('[data-product-image]').panzoom("reset"); 
              // }); 

              zoomed = true; 
            } else {
              if( $('[data-product-image]').panzoom()) {
                $('[data-product-image]').panzoom("reset"); 
                zoomed = false; 
              }
              // $('[data-product-image]').panzoom("zoom");
              // console.log($('[data-product-image]').panzoom("getTransform")); 
            }
          })
        }, 1200); 
      }



      $(selectors.zoomBtn).on('click', function(event) {

         that.$container.append(`
            <div class="productZoomModal"  data-zoom-modal>
                <a class="productZoomModal-close" data-zoom-modal-close>
                  X
                </a>
              <div class="productZoomModal-inner  grid  grid--center  grid--justifyCenter">
                  <img src="" alt="" class="productZoomModal-image" data-zoom-modal-image>
              </div>
            </div>`);


        var selectors = {
          zoomModal: '[data-zoom-modal]',
          zoomModalClose: '[data-zoom-modal-close]',
          zoomModalImage: '[data-zoom-modal-image]'
        };

        var highResImg = $(event.currentTarget).attr('data-high-res-image'); 


        function ZoomModal(container) {
          this.initEvents(); 
        }; 

        ZoomModal.prototype = $.extend({}, ZoomModal.prototype, {

          iniZooming: function() {


          }, 
          closeModal: function() {
            $(selectors.zoomModal).remove(); 
            delete ZoomModal;
          },
          initEvents: function() {
            $image = $(selectors.zoomModalImage); 

            console.log($(window).innerWidth()); 

            if($(window).innerWidth() > 960) {
              return false 
            } else {

              console.log('small'); 

              var that = this; 
              $(selectors.zoomModalClose).on('click', function(){
                that.closeModal(); 
              });

              $image.attr('width', 1100);
              $image.attr('src', highResImg);

              setTimeout(function() {
                $image.panzoom({
                  increment: 0.5,
                  minScale: 1,
                  maxScale: 2,
                  contain: 'invert'
                }); 
              }, 1000); 


                $image.panzoom("zoom", 1); 

         
            }
          }
        });

        new ZoomModal(selectors.zoomModal); 

      // var $modal = $(selectors.zoomModal);

      //    $modal.show(); 
      //    setTimeout(function() {
      //     var $close = $('data-zoom-modal-close');

      })
    }
  });


  return Product;
})();
