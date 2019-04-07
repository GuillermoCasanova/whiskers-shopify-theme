

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection template
 *
 * @namespace collectionFilter
 */
theme.collectionFilter = (function() {


  var selectors = {
    collectionMenu: '[data-ui-component="collection-menu"]',
    collectionFiltersToggle: '[data-filter-toggle]'
  };


  /**
  ** If there is no filtering system on this page, we do nothing  beyond this point 
  */
  if (!$(selectors.collectionMenu).length) {
      return
  }

  /**
  //This will hold our tags 
  */
  var tags = []; 
  var collectionId = $('[data-collection-id]').data('collection-id'); 

  function getFilterProducts(tags, collection){
      $.ajax({
          type: 'GET',
          url: '/collections/'+ collection + '?view=json',
          success: function(res){
            console.log(res); 
            var result = JSON.parse(res); 
            console.log(res);
            filterProducts(result.products, tags)
           },
          error: function(status){
             alert(status);
          }
      })
  }

  function filterProducts(products, tags) {
    if(tags.length === 0 ) {
      buildFilteredProducts(products); 
      $('[data-results-total]').text(products.length); 
      return products
    }

    var filteredProducts = products.filter(function(product){
      for(var i = 0; i < tags.length; i++) {
        if(product.tags.indexOf(tags[i]) > -1) {
          return true
        }
      }
      return false 
    });

    buildFilteredProducts(filteredProducts); 
    $('[data-results-total]').text(filteredProducts.length); 
    return filteredProducts;
  }


  function buildFilteredProducts(filteredProds) {
          
    var $productContainer = $('[data-section-type="collection"]');
      
    if(filteredProds.length > 0) {

     $productContainer.empty();
      var products = [],
      product = {}, 
      data = {}, 
      source = $("#collection-template").html(),
      template = Handlebars.compile(source);
      products = filteredProds.map(function(productItem) {
        
       var product = {
          id: productItem.id, 
          description: productItem.body_html.replace(/<\/?[^>]+(>|$)/g, "").split(' ').join(' '), 
          title: productItem.title, 
          price: slate.Currency.formatMoney(productItem.price, '${{amount}}'),
          featuredImg: productItem.images[0],
          secondaryImg: productItem.secondaryImg,
          url: productItem.url,
          handle: productItem.handle,
          variant: productItem.variants[0].id
      }

      console.log(product); 
        return product; 
    });
        
    data = {
        product: products
    } 

    $productContainer.append(template(data)); 
    $(document).trigger('reset-thumbnails'); 
    } else {
      $productContainer.empty();
      var source = $("#collection-template-empty").html(),
      template = Handlebars.compile(source);
      $productContainer.append(template()); 
    } 
  }


  function clearAllFilters() {
    tags = []; 
    $('[data-ui-component="filter-option"]').removeAttr('checked');
    getFilterProducts(tags, collectionId);
  }

  $('[data-ui-component="filter-option"]').on('change', function(){
      var tag = $(this).val()
      if(tags.indexOf(tag) != -1) {
        _.pull(tags, tag); 
      } else {
        tags.push(tag); 
      }
      getFilterProducts(tags, collectionId);
  });


   $('[data-clear-filters]').on('click', function() {
      clearAllFilters(); 
   });

  if($(selectors.collectionFiltersToggle).length > 0 ) {

  var $filterToggle = $(selectors.collectionFiltersToggle); 

  function toggleFiltersMenu() {
    $('[data-filters-off-canvas]').toggleClass('is-hidden'); 
  }

  $filterToggle.on('click', toggleFiltersMenu); 
  }


})();

