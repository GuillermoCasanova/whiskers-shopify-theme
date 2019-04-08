

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
    collectionFiltersToggle: '[data-filter-toggle]',
    collectionFilterOption: '[data-filter-option]',
    collectionSortOption: '[data-sort-option]'
  };


  /**
  ** If there is no filtering system on this page, we do nothing  beyond this point 
  */
  if (!$(selectors.collectionMenu).length) {
      return
  }

  /**
  //This will hold our tags and other info
  */
  var tags = [],
      collectionId = $('[data-collection-id]').data('collection-id'),
      productsShowing = null;  

  function getFilterProducts(tags, collection){
      $.ajax({
          type: 'GET',
          url: '/collections/'+ collection + '?view=json',
          success: function(res){
            var result = JSON.parse(res); 
            filterProducts(result.products, tags)
           },
          error: function(status){
             alert(status);
          }
      })
  }

  function getCollectionProducts(collection) {
    $.ajax({
        type: 'GET',
        url: '/collections/'+ collection + '?view=json',
        success: function(res){
          var result = JSON.parse(res); 
          productsShowing = result.products;
          console.log(productsShowing); 
         },
        error: function(status){
          console.log(status);
        }
    });
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
    $(selectors.collectionFilterOption).removeAttr('checked');
    getFilterProducts(tags, collectionId);
  }

  function sortProducts(products, sortOption) {
    var sortedProducts = null; 

    function dynamicSort(property) {
      var sortOrder = 1;
      if(property[0] === "-") {
          sortOrder = -1;
          property = property.substr(1);
      }
      return function (a,b) {
          var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
          return result * sortOrder;
      }
    }

    var sortedProducts = products.sort(dynamicSort(sortOption));
    console.log(sortedProducts);
    buildFilteredProducts(sortedProducts);  
  }


  getCollectionProducts(collectionId); 


  $(selectors.collectionFilterOption).on('change', function(){
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

   $(selectors.collectionSortOption).on('click', function() {
    var sortOption = $(this).data('value');
    sortProducts(productsShowing, sortOption); 
   }); 

  if($(selectors.collectionFiltersToggle).length > 0 ) {

  var $filterToggle = $(selectors.collectionFiltersToggle); 

  function toggleFiltersMenu() {
    $('[data-filters-off-canvas]').toggleClass('is-hidden'); 
  }

  $filterToggle.on('click', toggleFiltersMenu); 
  
  }
})();

