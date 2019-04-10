

  /**
  ** Helper for checking if propert is inside of array 
  */
Handlebars.registerHelper('ifIn', function(elem, list, options) {
  if(list && elem) {
    if(list.indexOf(elem) > -1) {
      return options.fn(this);
    }
    return options.inverse(this);
  } else {
    return 
  }
});


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
    collectionSortOption: '[data-sort-option]',
    collectionDescription: '[data-collection-description]',
    activeTags: '[data-active-tags-container]'
  };


  /**
  ** If there is no filtering system on this page, we do nothing  beyond this point 
  */
  if (!$(selectors.collectionMenu).length) {
      return
  }

  /**
  **This will hold our tags and other info
  */
  var tags = [],
      collection = {
        "products": null,
        "id": $('[data-collection-id]').data('collection-id'),
        "parent": false,
        "childCollections": []
      },
      sortingState = {
        "filter": null, 
        "active": false
      },
      filterState = {
        "active": false,
        "filteredProducts": null,
        "filteredChildCollections": null 
      };


  /**
  **This checks if this a parent collection 
  */
  if($('[data-collection-type]').data('collection-type') == 'parent') {
    collection.parent = true; 
  }


  function filterChildCollections(pCollections, pTags) {

    var tags = pTags; 

    if(tags.length === 0 ) {
      buildChildCollections(pCollections.childCollections); 
      buildActiveTags(tags);
      filterState.childCollectionsShowing = pCollections; 
      filterState.active = false; 
      //$('[data-results-total]').text(products.length); 
      return pCollections
    }

    var collections = pCollections.childCollections; 
    var filteredCollections = []; 
    var existingCollectionsFiltered = [],
        existingCollectionsShowing = filterState.collectionsShowing;

    collections.forEach(function(pCollection) {
      
      var handle = pCollection.handle; 
      var filteredCollection = {},
          products = pCollection.products; 

          filteredCollection.products = [];
          filteredCollection.collection = pCollection.collection;

      if(!filterState.active) {
        filteredCollection.products = products.filter(function(product){
          for(var i = 0; i < tags.length; i++) {
            if(product.tags.indexOf(tags[i]) > -1) {
              return true
            }
          }
          return false 
        });
      } else { 

       var existingCollectionsShowing = filterState.childCollectionsShowing,
           existingCollectionFiltered = {}; 

       filteredCollection.products = products.filter(function(product){
          for(var i = 0; i < tags.length; i++) {
            if(product.tags.indexOf(tags[i]) > -1) {
              return true
            }
          }
          return false 
        });


        for(var i = 0; i < existingCollectionsShowing.length; i++) {
          if(existingCollectionsShowing[i].handle == handle) {
            var filteredProducts = existingCollectionsShowing[i].products.filter(function(product){
              for(var i = 0; i < tags.length; i++) {
                if(product.tags.indexOf(tags[i]) > -1) {
                  return true
                }
              }
              return false 
            });
            existingCollectionFiltered.products = filteredProducts; 
          } 
        }

        existingCollectionFiltered.products.reverse(); 

        filteredCollection.products = existingCollectionFiltered.products.concat(filteredCollection.products.filter(function(product) {
          var found = JSON.stringify(existingCollectionFiltered.products).indexOf(JSON.stringify(product)) == - 1;
          return found; 
        })).reverse(); 

      }

      filteredCollections.push(filteredCollection); 

     }); 

    filterState.childCollectionsShowing = filteredCollections; 
    filterState.active = true; 
    buildActiveTags(tags);
    buildChildCollections(filteredCollections); 
  }   


  function shortenChildCollectionProds(pProducts) {
    var products = pProducts;
    if(products.length > 4) {
      return products.splice(0, 7)
    } else {
      return products.splice(0, 3)
    }
  }


  function buildChildCollections(pFilteredCollections) {
       
    var $collectionsContainer = $('[data-collections-container]');
    var filteredCollections  = pFilteredCollections; 

    if(filteredCollections.length > 0) {

      $collectionsContainer.empty();

      var  data = {
        "collections": []
      }, 
      source = $("#collection-parent-template").html(),
      template = Handlebars.compile(source);

      filteredCollections.forEach(function(pCollections) {
        var dataCollection = {}; 
            dataCollection.products = pCollections.products;
            dataCollection.collection = pCollections.collection; 

        var products = [],
        product = {}, 
        products = dataCollection.products.map(function(productItem) {
          var product = {
            id: productItem.id, 
            description: productItem.body_html.replace(/<\/?[^>]+(>|$)/g, "").split(' ').join(' '), 
            title: productItem.title, 
            price: slate.Currency.formatMoney(productItem.price, '${{amount}}'),
            images: productItem.images,
            url: productItem.url,
            handle: productItem.handle,
            variant: productItem.variants[0].id,
            tags: productItem.tags
          }
          return product; 
        });

        dataCollection.products = products;
        dataCollection.products = shortenChildCollectionProds(dataCollection.products);
        data.collections.push(dataCollection);  
      });   


      $collectionsContainer.append(template(data)); 
      $(document).trigger('reset-thumbnails'); 
    } else {
      $collectionsContainer.empty();
      var source = $("#collection-template-empty").html(),
      template = Handlebars.compile(source);
      $collectionsContainer.append(template()); 
    } 
  }


  function getCollectionProducts(pCollection) {

    if(collection.parent) {
      $.ajax({
          type: 'GET',
          url: '/collections/' + pCollection.id + '?view=parent.json',
          success: function(res){
            var result = JSON.parse(res); 
            collection.childCollections = result;
           },
          error: function(status){
            console.log(status);
          }
      }); 
    } else {
        $.ajax({
          type: 'GET',
          url: '/collections/'+ pCollection.id + '?view=json',
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
  }


  function filterProducts(products, pTags) {

    var tags = pTags; 

    if(tags.length === 0 ) {
      buildFilteredProducts(products); 
      buildActiveTags(tags);
      filterState.productsShowing = []; 
      filterState.active = false; 
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

      existingFiltered.reverse(); 

      filteredProducts = existingFiltered.concat(filteredProducts.filter(function(product) {
        var found = JSON.stringify(existingFiltered).indexOf(JSON.stringify(product)) == - 1;
        return found; 
      })).reverse(); 
    }


    buildFilteredProducts(filteredProducts); 
    

    $('[data-results-total]').text(filteredProducts.length); 
    filterState.active = true; 
    filterState.productsShowing = filteredProducts; 
    buildActiveTags(tags); 
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
          images: productItem.images,
          url: productItem.url,
          handle: productItem.handle,
          variant: productItem.variants[0].id,
          tags: productItem.tags
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
    buildActiveTags(tags);
    getFilterProducts(collection);
  }


  function buildActiveTags(pTags) {
    console.log(pTags); 

    var $tagsContainer = $(selectors.activeTags); 
    var $collectionDescription = $(selectors.collectionDescription); 

    $tagsContainer.empty(); 
    $collectionDescription.hide(); 

    if(pTags.length == 0 || !pTags) {
      $collectionDescription.show(); 
      return  
    }

    var labelTags = [],
    data = {}, 
    source = $("#tags-template").html(),
    template = Handlebars.compile(source);

    pTags.forEach(function(pTagLabel) {
      var tagName = pTagLabel.replace("color-", "");
      var tag = {};
      tag.name = tagName; 
      tag.label = pTagLabel; 

      labelTags.push(tag); 
    });

    data = {
      tag: labelTags
    }

    $tagsContainer.append(template(data)); 

    var $activeTag = $('[data-active-tag]');

    $activeTag.on('click', function() {
      var tagLabel = $(this).data('label');
      $(this).remove(); 
      removeActiveTag(tagLabel);
    }); 
  }

  function removeActiveTag(pTag) {
    var filterOptions = $(selectors.collectionFilterOption); 


    for(var i = 0; i < tags.length; i++) {
      if(pTag === tags[i]) {
        tags.splice(i, 1); 
      }
    }

    for(var b = 0; b < filterOptions.length; b++) {
      var $optionInput = $(filterOptions[b]); 
      if($optionInput.val() === pTag) {
        $optionInput.removeAttr('checked'); 
      }
    }

    if(collection.parent) {
      filterChildCollections(collection, tags); 
    } else {
      filterProducts(collection.products, tags); 
    }
  }



  //
  // Gets the collection's products and stores it so we dont need to make more calls to get all products for it
  //
  getCollectionProducts(collection); 



  //
  // Sets up the filtering elements 
  //
  if($(selectors.collectionFiltersToggle).length > 0 ) {

    var $filterToggle = $(selectors.collectionFiltersToggle); 
    var $filterClose = $('[data-filter-close]'); 

    function toggleFiltersMenu() {
      $('[data-filters-off-canvas]').toggleClass('is-hidden'); 
      $('body').toggleClass('filter-off-canvas-open');
    }

    function closeFilterMenu() {
      $('[data-filters-off-canvas]').addClass('is-hidden'); 
      $('body').removeClass('filter-off-canvas-open');
    }

    $filterToggle.on('click', toggleFiltersMenu); 
    $filterClose.on('click', closeFilterMenu); 

  
    $('[data-clear-filters]').on('click', function() {
      clearAllFilters(); 
    });

  }


   $(selectors.collectionFilterOption).on('change', function(){
      var tag = $(this).val()
      if(tags.indexOf(tag) != -1) {
        _.pull(tags, tag); 
      } else {
        tags.push(tag); 
      }
      if(collection.parent) {
        filterChildCollections(collection, tags)
      } else {
        filterProducts(collection.products, tags); 
      }
   });


  //
  // Sets up the sorting drop down 
  //
 // $(selectors.collectionSortOption).on('change', function() {
 //  var sortOption = this.value; 
 //  sortProducts(filterState.productsShowing, sortOption); 
 // }); 



  // function sortProducts(pProducts, pSortOption) {
  //   var sortedProducts = null; 

  //   function dynamicSort(property) {
  //     var sortOrder = 1;
  //     if(property[0] === "-") {
  //         sortOrder = -1;
  //         property = property.substr(1);
  //     }
  //     return function (a,b) {
  //         var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
  //         return result * sortOrder;
  //     }
  //   }

  //   var sortedProducts = pProduts.sort(dynamicSort(pSortOption));
  //   buildFilteredProducts(sortedProducts);  
  //   sortingState.active = true;
  //   sortingState.option = pSortOption;
  // }




})();

