
/**
 * Lacing Guide Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Lacing Guide template.
/**
   * @namespace Lacing Guide
 */

theme.lacingGuide = (function() {

  var selectors = {
    grid: '[data-grid]',
    lacingStylesThumbs: '[data-lacing-thumb]',
    stepsSlideshow: '[data-steps-slideshow]',
    imagesSlideshow: '[data-images-slideshow]'
  };

  var lacingGuide = function() { 

    // ======================= imagesLoaded Plugin ===============================
    // https://github.com/desandro/imagesloaded

    // $('#my-container').imagesLoaded(myFunction)
    // execute a callback when all images have loaded.
    // needed because .load() doesn't work on cached images

    // callback function gets image collection as argument
    //  this is the container

    // original: MIT license. Paul Irish. 2010.
    // contributors: Oren Solomianik, David DeSandro, Yiannis Chatzikonstantinou

    // blank image data-uri bypasses webkit log warning (thx doug jones)
    var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    $.fn.imagesLoaded = function( callback ) {
      var $this = this,
        deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
        hasNotify = $.isFunction(deferred.notify),
        $images = $this.find('img').add( $this.filter('img') ),
        loaded = [],
        proper = [],
        broken = [];

      // Register deferred callbacks
      if ($.isPlainObject(callback)) {
        $.each(callback, function (key, value) {
          if (key === 'callback') {
            callback = value;
          } else if (deferred) {
            deferred[key](value);
          }
        });
      }

      function doneLoading() {
        var $proper = $(proper),
          $broken = $(broken);

        if ( deferred ) {
          if ( broken.length ) {
            deferred.reject( $images, $proper, $broken );
          } else {
            deferred.resolve( $images );
          }
        }

        if ( $.isFunction( callback ) ) {
          callback.call( $this, $images, $proper, $broken );
        }
      }

      function imgLoaded( img, isBroken ) {
        // don't proceed if BLANK image, or image is already loaded
        if ( img.src === BLANK || $.inArray( img, loaded ) !== -1 ) {
          return;
        }

        // store element in loaded images array
        loaded.push( img );

        // keep track of broken and properly loaded images
        if ( isBroken ) {
          broken.push( img );
        } else {
          proper.push( img );
        }

        // cache image and its state for future calls
        $.data( img, 'imagesLoaded', { isBroken: isBroken, src: img.src } );

        // trigger deferred progress method if present
        if ( hasNotify ) {
          deferred.notifyWith( $(img), [ isBroken, $images, $(proper), $(broken) ] );
        }

        // call doneLoading and clean listeners if all images are loaded
        if ( $images.length === loaded.length ){
          setTimeout( doneLoading );
          $images.unbind( '.imagesLoaded' );
        }
      }

      // if no images, trigger immediately
      if ( !$images.length ) {
        doneLoading();
      } else {
        $images.bind( 'load.imagesLoaded error.imagesLoaded', function( event ){
          // trigger imgLoaded
          imgLoaded( event.target, event.type === 'error' );
        }).each( function( i, el ) {
          var src = el.src;

          // find out if this image has been already checked for status
          // if it was, and src has not changed, call imgLoaded on it
          var cached = $.data( el, 'imagesLoaded' );
          if ( cached && cached.src === src ) {
            imgLoaded( el, cached.isBroken );
            return;
          }

          // if complete is true and browser supports natural sizes, try
          // to check for image status manually
          if ( el.complete && el.naturalWidth !== undefined ) {
            imgLoaded( el, el.naturalWidth === 0 || el.naturalHeight === 0 );
            return;
          }

          // cached images don't fire load sometimes, so we reset src, but only when
          // dealing with IE, or image is complete (loaded) and failed manual check
          // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
          if ( el.readyState || el.complete ) {
            el.src = BLANK;
            el.src = src;
          }
        });
      }

      return deferred ? deferred.promise( $this ) : $this;
    };

    var Grid = (function() {

        // list of items
      var $grid = $(selectors.grid),
        // the items
        $items = $grid.children( 'li' ),
        // current expanded item's index
        current = -1,
        // position (top) of the expanded item
        // used to know if the preview will expand in a different row
        previewPos = -1,
        // extra amount of pixels to scroll the window
        scrollExtra = 0,
        // extra margin when expanded (between preview overlay and the next items)
        marginExpanded = 36,
        $window = $( window ), winsize,
        $body = $( 'html, body' ),
        transEndEventName = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
        // support for csstransitions
        support = Modernizr.csstransitions,
        // default settings
        settings = {
          minHeight : 600,
          speed : 600,
          easing : 'ease-in-out'
        };


      //
      // Initializes the grid expander functionality with settings once all images are loaded 
      //
      function init( config ) {
          
        // the settings..
        settings = $.extend( true, {}, settings, config );

        $grid.imagesLoaded(function() {
          // save item´s size and offset
          saveItemInfo( true );
          // get window´s size
          getWinSize();
          // initialize some events
          initEvents();
          // Setup entry animations with Sroll magic 
          initAnimations(); 
        }); 
      }


      //
      // saves the item´s offset top and height (if saveheight is true)
      //
      function saveItemInfo( saveheight ) {
        $items.each( function() {
          var $item = $( this );
          $item.data( 'offsetTop', $item.offset().top );
          if( saveheight ) {
            $item.data( 'height', $item.height() );
          }
        } );
      }


      //
      // Initializes the events that we will be listening to
      //
      function initEvents() {
        
        initItemsEvents( $items );
        
        // on window resize get the window´s size again
        // reset some values..
        $window.on( 'debouncedresize', function() {
          
          scrollExtra = 0;
          previewPos = -1;
          // save item´s offset
          saveItemInfo();
          getWinSize();
          var preview = $.data( this, 'preview' );
          if( typeof preview != 'undefined' ) {
            hidePreview();
          }

        } );

      }

      //
      // when clicking an item, show the preview with the item´s info and large image.
      // close the item if already expanded.
      // also close if clicking on the item´s cross
      //
      function initItemsEvents( $items ) {
        $items.on( 'click', '.lacingSteps-close', function() {
          hidePreview();
          return false;
        }).children( '[data-lacing-thumb]' ).on( 'click', function(e) {

          var $item = $( this ).parent();
          // check if item already opened
          current === $item.index() ? hidePreview() : showPreview( $item );
          return false;

        } );
      }

      function getWinSize() {
        winsize = { width : $window.width(), height : $window.height() };
      }

      function showPreview( $item ) {

        var preview = $.data( this, 'preview' );
        
        // item´s offset top to indicate its position on the document
        var position = $item.data( 'offsetTop' );

        scrollExtra = 0;

        // if a preview exists and previewPos is different (different row) from item´s top then close it
        if(typeof preview != 'undefined' ) {
          // not in the same row
          if( previewPos !== position ) {
            // if position > previewPos then we need to take te current preview´s height in consideration when scrolling the window
            if( position > previewPos ) {
              scrollExtra = preview.height;
            }
            hidePreview();
          }
          // same row
          else {
            preview.update( $item );
            return false;
          }
        } 

        // update previewPos
        previewPos = position;
        // initialize new preview for the clicked item
        preview = $.data( this, 'preview', new Preview( $item ) );
        // expand preview overlay
        preview.open();

      }

      function hidePreview() {
        current = -1;
        var preview = $.data( this, 'preview' );
        preview.close();
        $.removeData( this, 'preview' );
      }


      //
      // Inits animations with Scroll Magic
      // 
      function initAnimations() {
        
        var animCtrl = new ScrollMagic.Controller(); 
        
        //
        // Defines the entry animations for our lacing guide thumbnails
        //
        $(selectors.lacingStylesThumbs).each(function(index, element) {
          
          var lacingStyle = element;

          TweenMax.set(lacingStyle, {autoAlpha: 1});

          var lacingStyleEntry = new TimelineLite()
                  .from(lacingStyle, .4, {opacity: 0, y: '20px'}, .1 * (index + 1));

          var lacingStyleScene = new ScrollMagic.Scene({
              triggerElement: lacingStyle,
              triggerHook: 'onEnter',
              offset: 100, 
              reverse: false
            })
            .setTween(lacingStyleEntry)
            .addTo(animCtrl); 

        });   
      }

      // the preview obj / overlay
      function Preview( $item ) {
        this.$item = $item;
        this.expandedIdx = this.$item.index();
        this.create();
        this.update();
      }

      Preview.prototype = {

        initSlideshow: function() {

          this.stepsSlideshow = this.$previewEl.find(selectors.stepsSlideshow).slick({
            'arrows': false,
            'slidesToShow': 1,
            'mobileFirst': true,
            'autoplay': false,
            'fade': true,
            'infinite': true,
            'swipe': false
          });

          this.imagesSlideshow = this.$previewEl.find(selectors.imagesSlideshow).slick({
            'arrows': true,
            'slidesToShow': 1,
            'mobileFirst': true,
            'autoplay': false,
            'fade': true,
            'infinite': true,
            'swipe': false,
            'asNavFor': selectors.stepsSlideshow
          });

          this.nextBtn = $(selectors.imagesSlideshow).find('.slick-next');
          this.prevBtn = $(selectors.imagesSlideshow).find('.slick-prev');

          this.nextBtn.text('');
          this.prevBtn.text('');
        },
        destroySlideshows: function() {
          this.stepsSlideshow.slick("unslick"); 
          this.imagesSlideshow.slick("unslick");     
        }, 

        create : function() {

          // create preview structure component 
          this.$previewEl = $( '<div class="lacingSteps"></div>');

          // append preview element to the item
          this.$item.append( this.getEl() );
          // set the transitions for the preview and the item
          this.setTransition();

        },
        update : function( $item ) {

          if( $item ) {
            this.$item = $item;
          }
          
          // if already expanded remove class "is-expanded" from current item and add it to new item
          if( current !== -1 ) {
            var $currentItem = $items.eq( current );
            $currentItem.removeClass( 'is-expanded' );
            this.$item.addClass( 'is-expanded' );
            // position the preview correctly
            this.positionPreview();
          }

          // update current value
          current = this.$item.index();

          // update preview´s content
          var id = this.$item.data('handle'); 
          var template = $('#' + id).html();

          var self = this; 

          // if there are contents in the expander already, we unslick, delete them
          if(self.$previewEl.children('.lacingSteps-inner').length > 0 ) {
            self.destroySlideshows(); 
            this.$previewEl.children('.lacingSteps-inner').remove();
          }
        
          self.$previewEl.append(template);
          self.initSlideshow();

        },
        open : function() {

          setTimeout( $.proxy( function() { 
            // set the height for the preview and the item
            this.setHeights();
            // scroll to position the preview in the right place
            this.positionPreview();
          }, this ), 25 );

        },
        close : function() {
          var self = this;  


          var onEndFn = function() {

            // if( support ) {
            //   $( this ).off( transEndEventName );
            // }
            self.$item.removeClass( 'is-expanded' );
            self.destroySlideshows(); 
            self.$previewEl.remove(); 

          };

          setTimeout( $.proxy( function() {
       
            this.$previewEl.css( 'height', 0 );
            this.$previewEl.css( 'overflow', 'hidden' );
            // the current expanded item (might be different from this.$item)
            var $expandedItem = $items.eq( this.expandedIdx );
            $expandedItem.css( 'height', $expandedItem.data( 'height' ) ).on( transEndEventName, onEndFn );

            // if( !support ) {
            //   onEndFn.call();
            // }

          }, this ), 25 );
          
          return false;

        },
        calcHeight : function() {

          var heightPreview = winsize.height - this.$item.data( 'height' ) - marginExpanded,
            itemHeight = winsize.height;

          if( heightPreview < settings.minHeight ) {
            heightPreview = settings.minHeight;
            itemHeight = settings.minHeight + this.$item.data( 'height' ) + marginExpanded;
          }

          this.height = heightPreview;
          this.itemHeight = itemHeight;

        },
        setHeights : function() {

          var self = this,
            onEndFn = function() {
              // if( support ) {
              //   self.$item.off( transEndEventName );
              // }
              self.$item.addClass( 'is-expanded' );
              self.$previewEl.css( 'overflow', 'visible' );
            };

          this.calcHeight();
          this.$previewEl.css( 'height', this.height );
          this.$item.css( 'height', this.itemHeight ).on( transEndEventName, onEndFn );

          // if( !support ) {
          //   onEndFn.call();
          // }

        },
        positionPreview : function() {

          // scroll page
          // case 1 : preview height + item height fits in window´s height
          // case 2 : preview height + item height does not fit in window´s height and preview height is smaller than window´s height
          // case 3 : preview height + item height does not fit in window´s height and preview height is bigger than window´s height
          var position = this.$item.data( 'offsetTop' );
          var previewOffsetT = this.$previewEl.offset().top - scrollExtra;
          var scrollVal = this.height + this.$item.data( 'height' ) + marginExpanded  <= winsize.height ? position : this.height < winsize.height ? previewOffsetT - (this.$item.data('height') / 6) : previewOffsetT;

          $body.animate( { scrollTop : scrollVal }, settings.speed);

        },
        setTransition  : function() {
          this.$previewEl.css( 'transition', 'height ' + settings.speed + 'ms ' + settings.easing );
          this.$item.css( 'transition', 'height ' + settings.speed + 'ms ' + settings.easing );
        },
        getEl : function() {
          return this.$previewEl;
        }
      }

      return { 
        init : init
      };

    })();


    $(function() {
      Grid.init();
    });

  };

  return lacingGuide;

})();


