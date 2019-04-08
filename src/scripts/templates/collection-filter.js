

  Array.prototype.extend = function (other_array) {
      /* You should include a test to check whether other_array really is an array */
      other_array.forEach(function(v) {this.push(v)}, this);
  }
  

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
      collection = {
        "products": null,
        "id": $('[data-collection-id]').data('collection-id')
      },
      sortingState = {
        "filter": null, 
        "active": false
      },
      filterState = {
        "active": false,
        "filteredProducts": null
      };

  function getFilterProducts(collection){
    filterProducts(collection.products, tags); 
  }

  function getCollectionProducts(collection) {
    $.ajax({
        type: 'GET',
        url: '/collections/'+ collection.id + '?view=json',
        success: function(res){
          var result = JSON.parse(res); 
          filterState.productsShowing = result.products;
          collection.products = result.products; 
         },
        error: function(status){
          console.log(status);
        }
    });
  }


  function filterProducts(products, tags) {

    if(tags.length === 0 ) {
      buildFilteredProducts(products); 
      filterState.productsShowing = []; 
      $('[data-results-total]').text(products.length); 
      return products
    }


    if(!filterState.active) {
      var filteredProducts = products.filter(function(product){
        for(var i = 0; i < tags.length; i++) {
          if(product.tags.indexOf(tags[i]) > -1) {
            return true
          }
        }
        return false 
      });
    } else {

      var filteredProducts = products.filter(function(product){
        for(var i = 0; i < tags.length; i++) {
          if(product.tags.indexOf(tags[i]) > -1) {
            return true
          }
        }
        return false 
      });

      var existingFiltered = filterState.productsShowing.filter(function(product){
        for(var i = 0; i < tags.length; i++) {
          if(product.tags.indexOf(tags[i]) > -1) {
            return true
          }
        }
        return false 
      });

      filteredProducts = existingFiltered.concat(filteredProducts.filter(function(product) {
        var found = JSON.stringify(existingFiltered).indexOf(JSON.stringify(product)) == - 1;
        return found; 
      })).reverse(); 
    }

    if(sortingState.active) {
      sortProducts(filteredProducts, sortingState.option);
    } else {
      buildFilteredProducts(filteredProducts); 
    }

    $('[data-results-total]').text(filteredProducts.length); 
    filterState.active = true; 
    filterState.productsShowing = filteredProducts; 
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
    getFilterProducts(collection);
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
    buildFilteredProducts(sortedProducts);  
    sortingState.active = true;
    sortingState.option = sortOption;
  }




  //
  // Sets up the sorting drop down 
  //
   $(selectors.collectionSortOption).on('change', function() {
    var sortOption = this.value; 
    sortProducts(filterState.productsShowing, sortOption); 
   }); 


   $(selectors.collectionFilterOption).on('change', function(){
      var tag = $(this).val()
      if(tags.indexOf(tag) != -1) {
        _.pull(tags, tag); 
      } else {
        tags.push(tag); 
      }
      getFilterProducts(collection);
   });

  //
  // Sets up the filtering elements 
  //
  if($(selectors.collectionFiltersToggle).length > 0 ) {

    var $filterToggle = $(selectors.collectionFiltersToggle); 

    function toggleFiltersMenu() {
      $('[data-filters-off-canvas]').toggleClass('is-hidden'); 
      $('body').toggleClass('filter-off-canvas-open');
    }

    $filterToggle.on('click', toggleFiltersMenu); 
  
    $('[data-clear-filters]').on('click', function() {
      clearAllFilters(); 
    });

  }


  //
  // Gets the collection's products and stores it so we dont need to make more calls to get all products for it
  //
  getCollectionProducts(collection); 


})();

