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
    var that = this; 

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
            'fade': true,
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
      that.initProductZoom();
    }); 

    slideshow.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
      that.initProductZoom(true);
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
    initProductZoom: function(destroy) {

      var that = this; 

      if(destroy && this.$activeImage.panzoom()) {
        this.$activeImage.panzoom("reset");
        this.$activeImage.panzoom("destroy");
        console.log('destroy'); 
        console.log(this.$activeImage.panzoom("instance")); 
      }

      if($(window).innerWidth() > 960)  {

        var selectors = {
          activeImage: '.slick-active',
          photoSlideshow: '.product-photoSlideshow',
          productImage: '[data-product-image]',
          zoomModal: '[data-zoom-modal]'
        };

        var $photoSlideshow = $(selectors.photoSlideshow); 
        var $productImage = $(selectors.productImage);  
        this.$activeImage =  $(selectors.activeImage).find('[data-product-image]'); 

        this.$activeImage.panzoom({
          increment: .6,
          minScale: 1,
          maxScale: 2.2,
          contain: 'invert' 
        }); 
        
          this.$activeImage.css('cursor','none');

          $('.product-photoSlideshow-slide').append(`
            
            <div class="productZoomCursor">
                <svg version="1.1" class="zoom-in" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                   viewBox="0 0 22.2 22.2" style="enable-background:new 0 0 22.2 22.2;" xml:space="preserve">
                <g>
                  <g>
                    <path class="st0" d="M14.1,16c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S18.5,16,14.1,16z M14.1,1c-3.9,0-7,3.1-7,7s3.1,7,7,7
                      s7-3.1,7-7S18,1,14.1,1z"/>
                  </g>
                  <g>
                    <path class="st0" d="M14.1,12.8c-0.3,0-0.5-0.2-0.5-0.5V3.8c0-0.3,0.2-0.5,0.5-0.5s0.5,0.2,0.5,0.5v8.5
                      C14.6,12.6,14.4,12.8,14.1,12.8z"/>
                  </g>
                  <g>
                    <path class="st0" d="M0.5,22.2c-0.1,0-0.3,0-0.4-0.1c-0.2-0.2-0.2-0.5,0-0.7L8.4,13c0.2-0.2,0.5-0.2,0.7,0s0.2,0.5,0,0.7l-8.3,8.3
                      C0.8,22.2,0.6,22.2,0.5,22.2z"/>
                  </g>
                  <g>
                    <path class="st0" d="M18.4,8.5H9.8C9.5,8.5,9.3,8.3,9.3,8c0-0.3,0.2-0.5,0.5-0.5h8.6c0.3,0,0.5,0.2,0.5,0.5
                      C18.9,8.3,18.7,8.5,18.4,8.5z"/>
                  </g>
                </g>
                </svg>

                <svg version="1.1" class="zoom-out" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                   viewBox="0 0 22.2 22.2" style="enable-background:new 0 0 22.2 22.2;" xml:space="preserve">
                <g>
                  <g>
                    <path class="st0" d="M14.1,16c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S18.5,16,14.1,16z M14.1,1c-3.9,0-7,3.1-7,7s3.1,7,7,7
                      s7-3.1,7-7S18,1,14.1,1z"/>
                  </g>
                  <g>
                    <path class="st0" d="M0.5,22.2c-0.1,0-0.3,0-0.4-0.1c-0.2-0.2-0.2-0.5,0-0.7L8.4,13c0.2-0.2,0.5-0.2,0.7,0s0.2,0.5,0,0.7l-8.3,8.3
                      C0.8,22.2,0.6,22.2,0.5,22.2z"/>
                  </g>
                  <g>
                    <path class="st0" d="M18.4,8.5H9.8C9.5,8.5,9.3,8.3,9.3,8c0-0.3,0.2-0.5,0.5-0.5h8.6c0.3,0,0.5,0.2,0.5,0.5
                      C18.9,8.3,18.7,8.5,18.4,8.5z"/>
                  </g>
                </g>
                </svg>

            </div>
            `);

          
          $('.zoom-out').hide(); 
          var zoomed = false; 

          this.$activeImage.on('click', function() {

            if(!zoomed) {
              $('.zoom-in').hide(); 
              $('.zoom-out').show(); 

              if(that.$activeImage.panzoom()) {
                that.$activeImage.panzoom("reset"); 
              }
              that.$activeImage.panzoom("zoom");
              that.$activeImage.on('mousemove', function(e) {
                that.$activeImage.css({'transform-origin': ((e.pageX - $photoSlideshow.offset().left) / $photoSlideshow.width()) * 100 + '% ' + ((e.pageY - $photoSlideshow.offset().top) / $photoSlideshow.height()) * 100 +'%'});
              }); 
              zoomed = true; 
            } else {
              if(that.$activeImage.panzoom()) {
                that.$activeImage.panzoom("reset"); 
                $('.zoom-in').show(); 
                $('.zoom-out').hide(); 
                zoomed = false; 
              }
            }
          });

          $photoSlideshow.on('hover', function() {
              $(window).css('cursor','none');
          }); 

          $photoSlideshow.on('mousemove', function(event) {
              $(window).css('cursor','none');
              var x = event.pageX - $photoSlideshow.offset().left + 8;
              var y = event.pageY - $photoSlideshow.offset().top + 8;
              $('.productZoomCursor').css('left', x + 'px');
              $('.productZoomCursor').css('top', y + 'px');
          }); 

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

            if($(window).innerWidth() > 960) {
              return false 
            } else {

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
