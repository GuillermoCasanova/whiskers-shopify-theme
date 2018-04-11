
/**
   * @namespace Lacing Styles
 */

theme.lacingStyles = (function() {

  var selectors = {
    grid: '[data-grid]',
    stepsSlideshow: '[data-steps-slideshow]',
    imagesSlideshow: '[data-images-slideshow]'
  };

  var lacingStyles = function() { 


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
        marginExpanded = 10,
        $window = $( window ), winsize,
        $body = $( 'html, body' ),
        // transitionend events
        transEndEventNames = {
          'WebkitTransition' : 'webkitTransitionEnd',
          'MozTransition' : 'transitionend',
          'OTransition' : 'oTransitionEnd',
          'msTransition' : 'MSTransitionEnd',
          'transition' : 'transitionend'
        },
        transEndEventName = transEndEventNames['transition'],
        // support for csstransitions
        support = Modernizr.csstransitions,
        // default settings
        settings = {
          minHeight : 600,
          speed : 600,
          easing : 'ease-in-out'
        };

      function init( config ) {
          
        // the settings..
        settings = $.extend( true, {}, settings, config );
        // save item´s size and offset
        saveItemInfo( true );
        // get window´s size
        getWinSize();
        // initialize some events
        initEvents();
      }

      // add more items to the grid.
      // the new items need to appended to the grid.
      // after that call Grid.addItems(theItems);
      function addItems( $newitems ) {

        $items = $items.add( $newitems );

        $newitems.each( function() {
          var $item = $( this );
          $item.data( {
            offsetTop : $item.offset().top,
            height : $item.height()
          } );
        } );

        initItemsEvents( $newitems );

      }


       function initSlideshow() {

        $(selectors.stepsSlideshow).slick({
          'arrows': false,
          'slidesToShow': 1,
          'mobileFirst': true,
          'autoplay': false,
          'fade': true,
          'infinite': false,
          'swipe': false
        });

        $(selectors.imagesSlideshow).slick({
          'arrows': true,
          'slidesToShow': 1,
          'mobileFirst': true,
          'autoplay': false,
          'fade': true,
          'infinite': false,
          'swipe': false,
          'asNavFor': selectors.stepsSlideshow
        });

        var nextBtn = $(selectors.imagesSlideshow).find('.slick-next');
        var prevBtn = $(selectors.imagesSlideshow).find('.slick-prev');

        nextBtn.text('');
        prevBtn.text('');

      };


      // saves the item´s offset top and height (if saveheight is true)
      function saveItemInfo( saveheight ) {
        $items.each( function() {
          var $item = $( this );
          $item.data( 'offsetTop', $item.offset().top );
          if( saveheight ) {
            $item.data( 'height', $item.height() );
          }
        } );
      }

      function initEvents() {
        
        // when clicking an item, show the preview with the item´s info and large image.
        // close the item if already expanded.
        // also close if clicking on the item´s cross
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

      function initItemsEvents( $items ) {
        $items.on( 'click', '.lacingSteps-close', function() {
          hidePreview();
          return false;
        } ).children( 'a' ).on( 'click', function(e) {

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

        var preview = $.data( this, 'preview' ),
          // item´s offset top
          position = $item.data( 'offsetTop' );

        scrollExtra = 0;

        // if a preview exists and previewPos is different (different row) from item´s top then close it
        if( typeof preview != 'undefined' ) {

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

      // the preview obj / overlay
      function Preview( $item ) {
        this.$item = $item;
        this.expandedIdx = this.$item.index();
        this.create();
        this.update();
      }

      Preview.prototype = {
        create : function() {
          // create Preview structure:

          //var template = this.$item.data('lacing-template');
          var id = this.$item.data('handle'); 
          console.log('#' + id); 
          var template = $('#' + id).html();
          this.$previewEl = $( '<div class="lacingSteps"></div>').append(template);

          // append preview element to the item
          this.$item.append( this.getEl() );
          // set the transitions for the preview and the item
          this.setTransition();
        
          if(!$(selectors.stepsSlideshow).hasClass('slick-slider')) {
            initSlideshow();
          }

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

            if($(selectors.stepsSlideshow).hasClass('slick-slider')) {
                $(selectors.stepsSlideshow).slick("unslick"); 
                $(selectors.imagesSlideshow).slick("unslick"); 
              initSlideshow()
            }
          }

          // update current value
          current = this.$item.index();

          // // update preview´s content
          // var id = this.$item.data('handle'); 
          // var template = $('#' + id).html();
          // this.$previewEl = $( '<div class="lacingSteps"></div>').append(template);

        },
        open : function() {

          setTimeout( $.proxy( function() { 
            // set the height for the preview and the item
            this.setHeights();
            // scroll to position the preview in the right place
            this.positionPreview();
            if(!$(selectors.stepsSlideshow).hasClass('slick-slider')) {
              initSlideshow()
            }
          }, this ), 25 );

        },
        close : function() {

          var self = this;  

          var onEndFn = function() {

              if( support ) {
                $( this ).off( transEndEventName );
              }


              self.$item.removeClass( 'is-expanded' );
             // self.$previewEl.remove();
            };

          setTimeout( $.proxy( function() {

            if($(selectors.stepsSlideshow).hasClass('slick-slider')) {
                $(selectors.stepsSlideshow).slick("unslick"); 
                $(selectors.imagesSlideshow).slick("unslick"); 
              }
              

            if( typeof this.$largeImg !== 'undefined' ) {
              this.$largeImg.fadeOut( 'fast' );
            }
            this.$previewEl.css( 'height', 0 );
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
              if( support ) {
                self.$item.off( transEndEventName );
              }
              self.$item.addClass( 'is-expanded' );
            };

          this.calcHeight();
          this.$previewEl.css( 'height', this.height );
          this.$item.css( 'height', this.itemHeight ).on( transEndEventName, onEndFn );

          if( !support ) {
            onEndFn.call();
          }

        },
        positionPreview : function() {

          // scroll page
          // case 1 : preview height + item height fits in window´s height
          // case 2 : preview height + item height does not fit in window´s height and preview height is smaller than window´s height
          // case 3 : preview height + item height does not fit in window´s height and preview height is bigger than window´s height
          var position = this.$item.data( 'offsetTop' ),
            previewOffsetT = this.$previewEl.offset().top - scrollExtra,
            scrollVal = this.height + this.$item.data( 'height' ) + marginExpanded <= winsize.height ? position : this.height < winsize.height ? previewOffsetT - ( winsize.height - this.height ) : previewOffsetT;
          
          $body.animate( { scrollTop : scrollVal }, settings.speed );

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
        init : init,
        addItems : addItems
      };

    })();

      $(function() {
        Grid.init();
      });

  };

  return lacingStyles;

})();


