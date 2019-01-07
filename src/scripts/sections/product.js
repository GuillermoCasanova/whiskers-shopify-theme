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
    this.initImageSlideshow(slideshow); 
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
    /**
    * Initializes the produc image slideshow 
    **/
    initImageSlideshow: function(slideshowContainer) {

      var slideshow = slideshowContainer; 
      var that = this; 

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

      var nextBtn = $(slideshow).find('.slick-next');
      var prevBtn = $(slideshow).find('.slick-prev');

      nextBtn.text('');
      prevBtn.text('');
      prevBtn.addClass('is-hidden'); 

      //
      // Checks for showing the next or prev button depending on pos and inits the product zoom 
      //
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


      //
      // Cancels the product zoom before changing slides
      //
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

    },
    /**
    * Inits product zoom behavior, if destroy =  true, it removes all events and destroys behavior
    **/
    initProductZoom: function(destroy) {
      
      var that = this; 


      function initNonTouchZoom(destroy) {

        var that = this; 

        if(destroy && this.$activeImage && this.$activeImage.panzoom()) {
          this.$activeImage.panzoom("reset");
          this.$activeImage.panzoom("destroy");
          return 
        }

        var selectors = {
          activeSlide: '.slick-active',
          photoSlideshow: '.product-photoSlideshow',
          productImage: '[data-product-image]',
          zoomModal: '[data-zoom-modal]',
        };

        var $photoSlideshow = $(selectors.photoSlideshow); 
        var $productImage = $(selectors.productImage); 
        var $activeSlide = $(selectors.activeSlide);  
        var zoomed = false; 
        this.$activeImage =  $(selectors.activeSlide).find(selectors.productImage); 

        this.$activeImage.panzoom({
          increment: .6,
          minScale: 1,
          maxScale: 2.2,
          contain: 'invert' 
        }); 

        //
        // Setsup  the zoom icon for in and out 
        //
        function setupZoomIcon() {
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
        }
        
        this.$activeImage.css('cursor','none');

        setupZoomIcon(); 

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

        $activeSlide.on('hover', function() {
          $(window).css('cursor','none');
        }); 

        $activeSlide.on('mousemove', function(event) {
            $(window).css('cursor','none');
            var x = event.pageX - $photoSlideshow.offset().left + 8;
            var y = event.pageY - $photoSlideshow.offset().top + 8;
            $activeSlide.find('.productZoomCursor').css('left', x + 'px');
            $activeSlide.find('.productZoomCursor').css('top', y + 'px');
        }); 
      }

      function initTouchZoom(destroy) {

        if(destroy && this.$activeImageZoomBtn) {
          this.$activeImageZoomBtn.unbind('click'); 
          return 
        }

        this.$activeImageZoomBtn = $('.slick-active').find(selectors.zoomBtn); 

        //
        // Launches zoom modal when clicking the zoom button 
        //
        this.$activeImageZoomBtn.on('click', function(event) {

          var ZoomModal = function() {
            this.initEvents(); 
          };  

         that.$container.append(`
            <div class="productZoomModal"  data-zoom-modal>
                <button class="productZoomModal-close" data-zoom-modal-close>
                </button>

                <div class="productZoomModal-gestureIndicator" data-zoom-modal-gesture>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 102.8 102.8">
                    <title>
                    Use two fingers to pinch zoom in and zoom-out.
                    </title>
                    <style>
                      .st2{fill:#f7f7fb}
                    </style>
                    <path d="M97.3 102.8H5.4c-3 0-5.4-2.4-5.4-5.4v-92C0 2.4 2.4 0 5.4 0h91.9c3 0 5.4 2.4 5.4 5.4v91.9c.1 3-2.4 5.5-5.4 5.5z" fill="#393743" opacity=".9" id="bg"/>
                    <g class="pinchIn">
                      <path class="st2" d="M40.1 28.8l2.1-1h-.7l2.3-2.2-.4-.3-2.2 2.2v-.7l-1.1 2zM36.4 32.9l2.2-2.2v.8l1.1-2.1-2.1 1h.7L36 32.6zM70.1 43.6l-.2.2.2-.2c0 .1 0 0 0 0zM42.2 47.4c-.1 0-.1 0 0 0-.1 0-.1 0 0 0-.1 0-.1 0 0 0z"/>
                      <path class="st2" d="M74.8 43.5c-.8-.9-1.7-1.1-2.5-1-.5 0-1 .3-1.5.6-.2.1-.4.3-.7.5-.2.1-.3.3-.5.4l.3-.3c-.4.3-.7.6-1.1.9 1.1-2.7 1.9-6.7-1.5-8.1-1.1-.5-2-.4-2.9.1-.6.3-1.1.7-1.5 1.4l-.6 1.2c-.4-2.6-2.9-4.6-5.6-3.8-1.6.5-2.3 2.3-3.2 3.7-.3-.3-.4-1.2-.4-1.5-.1-.9-.2-1.7-.2-2.6 0-1.5-.2-3-.3-4.5-.1-.8-.1-1.5 0-2.3 3.3-1 5.8-4.2 5.8-7.9 0-4.5-3.7-8.2-8.2-8.2-4.5 0-8.2 3.7-8.2 8.2 0 3 1.6 5.6 3.9 7 0 .2-.1.3-.1.5-.2.9-.4 1.7-.4 2.6-.2 2.3-.1 4.5 0 6.8v3.1c0 .4 0 .8-.2 1.2-.2.4-.3.8-.5 1.2-.6 1.7-1.2 3.4-2.5 4.6.1-.1.2-.2.3-.2l-.3.3c-.1 0-.1.1-.2.1l.1-.1c-.1.1-.2.1-.3.2-.7.4-.8-.7-1-1.3-.2-.9-.7-1.7-1.1-2.6-.2-.4-.4-.7-.5-1.1.3-.9.5-1.9.5-2.9 0-4.5-3.7-8.2-8.2-8.2-4.5 0-8.2 3.7-8.2 8.2 0 4.5 3.7 8.2 8.2 8.2.6 0 1.1-.1 1.6-.2.1.4.2.9.3 1.3.5 2.3.5 4.6.6 6.9.2 4.7 2.1 9.2 3.1 13.8.4 1.8.5 3.5.4 5.3-.1 1.6-.5 3.3-.8 4.9-.4 2-1 4.1-1.6 6.1-.1 4.8 6.1 7.2 10 8.1 3.9.9 9.2 1.3 12.4-1.5 2.1-1.8 1.3-4.7 1.9-7.1.4-1.8.9-3.5 1.4-5.3.6-2.4 1.5-4.6 2.9-6.7 1-1.4 2.2-2.5 3.3-3.8 1.1-1.3 2-2.8 2.8-4.4 2.1-4.2 2.9-8.7 4.5-13.1.5-1.5 1.1-3.1 1.3-4.7 0-1.2.1-2.9-.8-4zM36.1 39c-1.6-1.1-3.9-2.2-5.8-1.6-.8.3-1.6 1-1.8 1.8-.1.6.3 1.3.7 1.8.7.9 1.5 1.7 2.3 2.6.3.3.5.6.7 1h-.6c-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c2.5 0 4.5 1.9 4.8 4.3-.2 0-.2-.1-.3-.1zm1.3 1.1c-.2-.3-.5-.5-.8-.7-.2-2.7-2.4-4.8-5.1-4.8-2.8 0-5.1 2.3-5.1 5.1s2.3 5.1 5.1 5.1c.2 0 .5 0 .7-.1.1.2.2.5.3.7-.3.1-.7.1-1 .1-3.3 0-5.9-2.6-5.9-5.9 0-3.3 2.7-5.9 5.9-5.9 3.3 0 5.9 2.6 5.9 5.9v.5zm.9 1.1c-.2-.3-.4-.6-.7-.8v-.6c0-3.4-2.8-6.2-6.2-6.2-3.4 0-6.2 2.8-6.2 6.2 0 3.4 2.8 6.2 6.2 6.2.4 0 .8 0 1.1-.1.1.2.2.5.2.7-.4.1-.9.1-1.3.1-3.8 0-6.9-3.1-6.9-6.9s3.1-6.9 6.9-6.9c3.8 0 6.9 3.1 6.9 6.9.1.4.1.9 0 1.4zm.2.3c.1-.6.2-1.1.2-1.7 0-4-3.2-7.2-7.2-7.2s-7.2 3.2-7.2 7.2 3.2 7.2 7.2 7.2c.5 0 1 0 1.4-.1.1.3.1.5.2.8-.5.1-1 .2-1.6.2-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8c0 .9-.2 1.8-.4 2.6-.2-.5-.4-.8-.6-1zM46 27.2c-2.2-1.4-3.7-3.9-3.7-6.8 0-4.4 3.6-8 8-8s8 3.6 8 8c0 3.5-2.3 6.5-5.5 7.6 0-.3 0-.6.1-.8 2.7-1 4.7-3.7 4.7-6.7 0-4-3.2-7.2-7.2-7.2s-7.2 3.2-7.2 7.2c0 2.5 1.3 4.7 3.2 6-.2.1-.3.4-.4.7zm.3-1.5v.4c-1.8-1.3-3-3.3-3-5.7 0-3.8 3.1-6.9 6.9-6.9 3.8 0 6.9 3.1 6.9 6.9 0 2.9-1.8 5.4-4.4 6.5 0-.3.1-.6.1-.8 2.1-1 3.5-3.1 3.5-5.6 0-3.4-2.8-6.2-6.2-6.2-3.4 0-6.2 2.8-6.2 6.2 0 1.9.9 3.6 2.2 4.7.2.1.2.3.2.5zm0-.9c-1.2-1.1-2-2.7-2-4.4 0-3.3 2.6-5.9 5.9-5.9 3.3 0 5.9 2.6 5.9 5.9 0 2.3-1.3 4.3-3.2 5.3 0-.3.1-.6.1-1 1.4-.9 2.3-2.5 2.3-4.3 0-2.8-2.3-5.1-5.1-5.1s-5.1 2.3-5.1 5.1c0 1.3.5 2.5 1.3 3.4 0 .3-.1.7-.1 1zm1.4-4.7c.3-.6.7-1.2 1.2-1.6-.4.4-.8.9-1.2 1.6zm2.1-2c-1 .2-1.7 1.2-2.2 2.1-.6 1-1 2.2-1.2 3.4-.7-.8-1.1-1.9-1.1-3.1 0-2.7 2.2-4.9 4.9-4.9s4.9 2.2 4.9 4.9c0 1.6-.8 3.1-2 4 .2-1.6.3-3.2 0-4.6-.4-1.6-1.9-2.2-3.3-1.8zm14.3 54.8c.3-.3.6-.7.8-1-.3.3-.6.6-.8 1z"/>

                    </g>
                    <g class="pinchOut">
                        <path class="st2" d="M47.6 26.1l3.2-1.9-.2.8 1.7-2.1-2.7.6.9.2-3.2 1.9zM34.5 34h.1l2.6-.6-.8-.2 3.2-1.9-.3-.5-3.2 1.9.2-.8-1.7 2.1h-.1.1z"/>
                        <path transform="rotate(-31.455 46.401 26.56)" class="st2" d="M46 26.3h.9v.6H46z"/>
                        <path transform="rotate(-31.461 44.99 27.469)" class="st2" d="M44.6 27.2h.9v.6h-.9z"/>
                        <path transform="rotate(-31.444 43.578 28.35)" class="st2" d="M43.2 28.1h.9v.6h-.9z"/>
                        <path transform="rotate(-31.468 42.176 29.254)" class="st2" d="M41.7 29h.9v.6h-.9z"/>
                        <path transform="rotate(-31.45 40.76 30.128)" class="st2" d="M40.3 29.8h.9v.6h-.9z"/>
                        <path class="st2" d="M76 55.8c-.1-1.7-1.3-3.9-3.3-3.8-.6 0-.8 0-1.1-.6-.4-.7-.3-1.7-.4-2.5-.3-2-1.8-3.6-3.9-3.4-.1 0-.2 0-.4.1-.2 0-.5.1-.6.1-.1 0-.2 0-.3-.1-.1-.1 0-.9-.1-1.1-.1-.5-.3-1-.5-1.5-1.1-1.9-3.1-2.6-5.3-2.4-.3 0-.7.1-1 .2-.3.1-.5-.4-.6-.6-.4-.7-.4-1.5-.3-2.3.1-1.7.7-3.3 1.2-4.9.5-1.7.6-3.5 1-5.2.1-.3.1-.5.2-.8.5 0 1.1-.1 1.6-.3 4.2-1.1 6.7-5.5 5.5-9.7-1.1-4.2-5.5-6.7-9.7-5.5-4.2 1.1-6.7 5.5-5.5 9.7.3 1.2.9 2.2 1.7 3.1-.6 1.6-1.2 3.1-1.6 4.7-.4 1.7-.5 3.4-.9 5.1-.9 3.7-2 7.7-4.5 10.6-.4.5-.9.9-1.4 1.3-.6.4-1.2.7-1.8 1-.9.5-1.2 1.7-2.2 2.1-1.7.4-2.5-1.7-3.1-2.9-.9-2-2.1-3.7-3.6-5.4.3-1.2.3-2.5-.1-3.8-1.1-4.2-5.5-6.7-9.7-5.5-4.2 1.1-6.7 5.5-5.5 9.7 1.1 4.2 5.5 6.7 9.7 5.5.1 0 .3-.1.4-.1.9 1.8 1.8 3.6 2.5 5.5.6 1.4.5 3 1 4.4.4 1.3 1.1 2.5 1.6 3.7.7 1.6 1.3 3.3 2.2 4.8.6 1.2 1.4 2.3 1.8 3.6.9 2.8-.3 6-1.1 8.7-.8 2.3-1.7 4.6-2.6 6.8-.8 2.1.3 4.1 1.8 5.6 2 2 4.7 3.3 7.4 4.1 4.6 1.4 11 1.6 14.4-2.5.4-.4.2-1.2.3-1.8.1-.8.3-1.7.5-2.5.4-1.7 1-3.4 1.7-5 .5-1.2 1.1-2.1 2.1-3 1.5-1.3 2.6-3.1 3.8-4.7 1.3-1.9 3-3.5 4-5.6 1.1-2.3 2.3-4.5 3.5-6.8.8-1.9 1.4-3.9 1.2-6.1zM30.9 37.4c-1.3-.6-2.7-.9-4.1-.7-.7.1-1.4.4-1.9.8-.4.4-.6 1.1-.6 1.7-.1.9.4 1.4 1.1 1.9.8.6 1.6 1.2 2.3 2 .2.2.3.4.4.6-2.3.4-4.6-1.1-5.2-3.4-.7-2.5.8-5 3.3-5.7 2.5-.7 5 .8 5.7 3.3v.1c-.4-.3-.7-.5-1-.6zm-3.5-.8zm4.7 1.5c0-.1 0-.2-.1-.3-.7-2.6-3.4-4.1-6-3.4-2.6.7-4.1 3.4-3.4 6 .7 2.5 3.1 4 5.6 3.5.2.2.3.4.4.7-2.9.7-6-1.1-6.8-4-.8-3 1-6.1 4-6.9 3-.8 6.1 1 6.9 4 .1.4.2.8.2 1.2-.2-.4-.5-.6-.8-.8zm1.8 1.6l-.7-.7c0-.5-.1-1-.2-1.4-.9-3.1-4.1-5-7.2-4.1-3.1.9-5 4.1-4.1 7.2.8 3.1 4 4.9 7.1 4.2.1.2.3.4.4.7h-.1c-3.5 1-7.2-1.1-8.1-4.6-1-3.5 1.1-7.2 4.6-8.1 3.5-1 7.2 1.1 8.1 4.6.2.6.3 1.4.2 2.2zm.9.9c-.2-.2-.4-.5-.6-.7.1-.9 0-1.8-.2-2.6-1-3.7-4.8-5.8-8.5-4.8s-5.8 4.8-4.8 8.5 4.8 5.8 8.5 4.8h.2c.1.2.2.4.4.7-.1 0-.2.1-.3.1-4.1 1.1-8.3-1.3-9.4-5.3-1.1-4.1 1.3-8.3 5.3-9.4s8.3 1.3 9.4 5.3c.2 1 .2 2.3 0 3.4zM54.2 24c-.7-.8-1.2-1.8-1.5-2.9-1.1-4.1 1.3-8.3 5.3-9.4 4.1-1.1 8.3 1.3 9.4 5.3 1.1 4.1-1.3 8.3-5.3 9.4l-1.5.3c.1-.3.1-.5.2-.8.4 0 .7-.1 1.1-.2 3.7-1 5.8-4.8 4.8-8.5s-4.8-5.8-8.5-4.8-5.8 4.8-4.8 8.5c.2.9.6 1.6 1.1 2.3 0 .3-.2.5-.3.8zm.5-1c-.5-.6-.8-1.3-1-2.1-1-3.5 1.1-7.2 4.6-8.1 3.5-1 7.2 1.1 8.1 4.6 1 3.5-1.1 7.2-4.6 8.1-.3.1-.6.1-.9.2.1-.2.1-.4.2-.5 0-.1.1-.2.1-.3.2 0 .3-.1.5-.1 3.1-.9 5-4.1 4.1-7.2-.9-3.1-4.1-5-7.2-4.1-3.1.9-5 4.1-4.1 7.2.1.5.4 1 .7 1.5-.3.2-.4.5-.5.8zm.4-1.1c-.2-.4-.4-.8-.5-1.3-.8-3 1-6.1 4-6.9 3-.8 6.1 1 6.9 4 .8 3-1 6.1-4 6.9-.1 0-.2.1-.3.1.1-.3.3-.6.4-.9 2.4-.8 3.9-3.4 3.2-5.9-.7-2.6-3.4-4.1-6-3.4-2.6.7-4.1 3.4-3.4 6 .1.2.1.4.2.6-.2.2-.3.5-.5.8zm2.7-5.1c-.9 1.1-1.5 2.5-2.1 3.8 0-.1-.1-.2-.1-.3-.7-2.5.8-5 3.3-5.7 2.5-.7 5 .8 5.7 3.3.6 2.3-.6 4.7-2.8 5.6.1-.2.2-.4.2-.6.6-1.6 1.1-3.3.8-5-.2-1.7-1.5-2.3-3.1-2.2-.7 0-1.4.5-1.9 1.1z"/>
                      </g>

                  </svg>
                </div>

              <div class="productZoomModal-inner  grid  grid--center  grid--justifyCenter">
                  <img src="" alt="" class="productZoomModal-image" data-zoom-modal-image>
              </div>
            </div>`);

          that.$container.append(`
              <div class="productZoomModalLoading  grid  grid--center  grid--justifyCenter"  data-zoom-modal-load-screen>
                <div class="productZoomModalLoading-loader  loader">
                </div>
              <div>
            `);

 
          var selectors = {
            zoomModal: '[data-zoom-modal]',
            zoomModalLoadScreen: '[data-zoom-modal-load-screen]',
            zoomModalClose: '[data-zoom-modal-close]',
            zoomModalImage: '[data-zoom-modal-image]',
            zoomModalGesture: '[data-zoom-modal-gesture]'
          };

          var highResImg = $(event.currentTarget).attr('data-high-res-image'),
              $zoomModalGesture = $(selectors.zoomModalGesture),
              $zoomModal = $(selectors.zoomModal), 
              $zoomModalLoadScreen =  $(selectors.zoomModalLoadScreen),
              $zoomModalClose = $(selectors.zoomModalClose); 


          ZoomModal.prototype = $.extend({}, ZoomModal.prototype, {
            initZooming: function() {
              if(this.$image.panzoom("instance")) {
                return
              } else {
                this.$image.panzoom({
                  increment: .6,
                  minScale: 1.5,
                  maxScale: 2.6,
                  contain: 'invert'
                }).panzoom("zoom", 2, {animate: false});
              }
            }, 
            closeModal: function() {
              var that = this; 
              $zoomModal.remove();
            },
            initEvents: function() {
              var that = this; 
              var modalLoaderTimeout = null 

              this.$image = $(selectors.zoomModalImage); 
              this.$image.attr('src', highResImg);
              this.initLoader = function() {

                $zoomModalLoadScreen.css('opacity', 0); 
                $zoomModalLoadScreen.animate({opacity: 1}, 200, 'linear');

                $zoomModalLoadScreen.on('click', function() {
                  $zoomModal.hide();
                  $zoomModalLoadScreen.animate({opacity: 0}, 200, 'linear', function() {
                    $zoomModalLoadScreen.hide(); 
                    $('body').css('overflow', 'visible'); 
                  });
                }); 
              }


              $zoomModalGesture.css('opacity', 0); 
              $zoomModal.css('opacity', 0); 
              $('body').css('overflow', 'hidden'); 


              $zoomModalClose.on('click', function(){
                that.closeModal(); 
                $('body').css('overflow', 'visible'); 
              });


              this.initLoader();
  
              $zoomModal.imagesLoaded().done(function() {
                $zoomModalLoadScreen.animate({opacity: 0}, 200, 'linear', function() {
                  $zoomModalLoadScreen.hide(); 
                });
                that.initZooming(); 
                $zoomModal.animate({opacity: 1}, 200, 'linear', function() {
                  if(!sessionStorage.test) {
                    setTimeout(function() {
                     $zoomModalGesture.animate({opacity: 1}, 200, 'linear');
                      setTimeout(function() {
                        $zoomModalGesture.animate({opacity: 0}, 200, 'linear', function() {
                          $zoomModalGesture.hide(); 
                          sessionStorage.test = true
                        });
                      }, 1500);  

                    }, 200); 
                  }
                }); 
              }); 
            }
          });

          //
          // Creates the zoom modal object instance 
          //
          new ZoomModal(selectors.zoomModal); 

        });
      }

      //
      // If the device is at or larger than grid-medium use panzoom instead of zooming modal on small devices
      //
      if($(window).innerWidth() >= 680) {
        initNonTouchZoom(destroy);
      } else {
        initTouchZoom(destroy); 
      }
    }
  });


  return Product;
})();
