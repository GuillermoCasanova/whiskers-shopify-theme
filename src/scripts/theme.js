
window.slate = window.slate || {};
window.theme = window.theme || {};

/*================ Slate ================*/
// =require slate/a11y.js
// =require slate/cart.js
// =require slate/utils.js
// =require slate/rte.js
// =require slate/sections.js
// =require slate/currency.js
// =require slate/images.js
// =require slate/variants.js

/*================ Sections ================*/
// =require sections/ajaxCart.js
// =require sections/collection-nav.js
// =require sections/product.js
// =require sections/header.js
// =require sections/heroHeader.js
// =require sections/lacingGuide.js


/*================ Templates ================*/
// =require templates/collection-filter.js
// =require templates/collection.js
// =require templates/customers-addresses.js
// =require templates/customers-login.js
// =require templates/customers-orders.js



$(document).ready(function() {

  var sections = new slate.Sections();
  sections.register('product', theme.Product);
  sections.register('header', theme.Header);
  sections.register('collection_nav', theme.collectionNav);
  sections.register('hero_header', theme.heroHeader);
  sections.register('lacing_guide', theme.lacingGuide);
  sections.register('about_laces', theme.CopySectionAlt);
  sections.register('copy_section', theme.CopySectionBox);



  // Common a11y fixes
  slate.a11y.pageLinkFocus($(window.location.hash));

  $('.in-page-link').on('click', function(evt) {
    slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
  });

  // Target tables to make them scrollable
  var tableSelectors = '.rte table';

  slate.rte.wrapTable({
    $tables: $(tableSelectors),
    tableWrapperClass: 'rte__table-wrapper',
  });

  // Target iframes to make them responsive
  var iframeSelectors =
    '.rte iframe[src*="youtube.com/embed"],' +
    '.rte iframe[src*="player.vimeo"]';

  slate.rte.wrapIframe({
    $iframes: $(iframeSelectors),
    iframeWrapperClass: 'rte__video-wrapper'
  });

  // Apply a specific class to the html element for browser support of cookies.
  if (slate.cart.cookiesEnabled()) {
    document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
  }


  //
  // Global Theme Behaviors 
  //
  theme.initCache = function() {
    theme.cache = {
      $window                 : $(window),
      $html                   : $('html'),
      $body                   : $('body')
    };
  };

  theme.afterCartLoad = function() {
    theme.cache.$body.on('ajaxCart.afterCartLoad', function(evt, cart) {
      theme.Header.openCart(); 
    });

    theme.cache.$body.on('ajaxCart.itemAddedOnSmallDevice', function(evt, cart) {
      theme.Header.displaySuccessCartModal(cart); 
    });
  };

  theme.cartInit = function() {
    if (!slate.cart.cookiesEnabled()) {
      theme.cache.$body.addClass('cart--no-cookies');
    }

     ajaxCart.init({
        cartContainer: '#CartContainer',
        addToCartSelector: '[data-thumb-add-to-cart-btn]',
        enableQtySelectors: true,
        moneyFormat: theme.strings.moneyFormat
    });

     ajaxCart.init({
        formSelector: '[data-thumb-add-to-cart-form]',
        cartContainer: '#CartContainer',
        addToCartSelector: '[data-thumb-add-to-cart-btn]',
        enableQtySelectors: true,
        moneyFormat: theme.strings.moneyFormat
    });


  };

  theme.initPlugins = function() {

    //Configuration for lazySizes plugin to lazyload images 
    window.lazySizesConfig = window.lazySizesConfig || {}; 
    window.lazySizesConfig.throttleDelay = 200; 
    window.lazySizesConfig.init = true;
    window.lazySizesConfig.addClasses = true;
    window.lazySizesConfig.loadMode = 1; 
  }; 


  theme.init = function() {
    theme.initCache();
    theme.cartInit();
    theme.afterCartLoad(); 
    theme.initPlugins(); 
  };

  theme.init(); 


});





