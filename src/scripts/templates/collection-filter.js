

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
** Helper for checking if array is longer than a specified value 
*/
Handlebars.registerHelper('checkLength', function(array, val2, options) {
  if (array.length > val2) {
    return options.fn(this);
  }
  return options.inverse(this); 
})


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
    collectionFilterOptions: '[data-filter-option]',
    collectionEnforcedOptions: '[data-enforced-filter-option]',
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
        "filteredChildCollections": [],
        "childCollectionsShowing": []
      };


  /**
  **This checks if this a parent collection 
  */
  if($('[data-collection-type]').data('collection-type') == 'parent') {
    collection.parent = true; 
  }

  function showCollectionMenu(pCollection) {
    $(selectors.collectionMenu).addClass('is-showing');
    
    var $resultsTotal = $('[data-results-total]'), 
        $resultsContainer = $('[data-results-container]'),
        totalProducts = 0; 
        
        $resultsTotal.text("(0)");
        $resultsContainer.data('text', $resultsContainer.data('text') + " " + "(0)");

    if(pCollection.childCollections) {
      var childCollections = pCollection.childCollections;
      childCollections.forEach(function(collection){
        totalProducts = totalProducts + collection.products.length;
      })
    }

    if(pCollection.products) {
      totalProducts = pCollection.products.length; 
    }

    $resultsTotal.text("(" + totalProducts + ")");
    $resultsContainer.attr('data-text', $resultsContainer.text()); 
  } 


  function reloadYotpo() {
    var api = new Yotpo.API(yotpo);
    api.refreshWidgets();
  }


  function getCollectionProducts(pCollection) {

    if(collection.parent) {
      $.ajax({
          type: 'GET',
          url: '/collections/' + pCollection.id + '?view=parent.json',
          success: function(res){
            var result = JSON.parse(res); 
            collection.childCollections = result;
            filterState.childCollectionsShowing = result;            
            showCollectionMenu(collection); 
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
            showCollectionMenu(collection); 
           },
          error: function(status){
            console.log(status);
          }
      });
    }
  } 

  function filterChildCollections(pCollections, pTags) {

    var tags = pTags; 
    var enforcedOptions = getEnforcedOptions(); 

    if(tags.length === 0 ) {
      buildChildCollections(pCollections.childCollections); 
      buildActiveTags(tags);
      filterState.childCollectionsShowing = pCollections; 
      filterState.active = false; 
      return pCollections
    }


    if(enforcedOptions) {
      tags = tags.filter(function(tag) {
        for(var i = 0; i < enforcedOptions.length; i++) {
          if(tag == enforcedOptions[i]) {
            return false
          } 
        }
        return true 
      })

      if(tags.length === 0) {
        tags = enforcedOptions
      }
    }


    var collections = pCollections.childCollections; 
    var filteredCollections = []; 

    var existingCollectionsFiltered = [],
        existingCollectionsShowing = filterState.childCollectionsShowing;


    for(var c = 0; c < collections.length; c++) {
      var handle = collections[c].collection.handle; 
      var filteredCollection = {},
          products = collections[c].products; 

          filteredCollection.products = [];
          filteredCollection.collection = collections[c].collection;

      filteredCollection.products = products.filter(function(product){
        for(var i = 0; i < tags.length; i++) {
          if(product.tags.indexOf(tags[i]) > -1 && checkForEnforcedOptions(enforcedOptions, product.tags)) {
            return true
          }
        }
        return false 
      });

      filteredCollections.push(filteredCollection); 
    }

    buildActiveTags(tags);
    buildChildCollections(filteredCollections, filterState.active); 
    filterState.childCollectionsShowing = filteredCollections; 
    filterState.active = true; 
  }   



  function buildChildCollections(pFilteredCollections, pFilteringActive) {
    
    var filteredCollections  = pFilteredCollections; 

    if(filteredCollections.length > 0) {

      var  data = {}, 
      source = $("#collection-products-template").html(),
      template = Handlebars.compile(source),
      $resultsTotal = $('[data-results-total]'),
      $resultsContainer = $('[data-results-container]'),
      totalProducts = 0; 

      filteredCollections.forEach(function(collection) {

        var collectionInfo = collection.collection,
            $collectionContainer = $("[data-collection-container-id=" + collectionInfo.id + "]");

        if(collection.products.length > 0) {

            var products = [],
            product = {}, 
            products = collection.products.map(function(productItem) {
              var product = {
                id: productItem.id, 
                description: productItem.body_html.replace(/<\/?[^>]+(>|$)/g, "").split(' ').join(' '), 
                title: productItem.title, 
                price: slate.Currency.formatMoney(productItem.price, '${{amount}}'),
                images: productItem.images,
                url: productItem.url,
                handle: productItem.handle,
                variant: productItem.variants[0].id,
                tags: productItem.tags,
                available: productItem.available
              }
              return product; 
            });

            data = {
              product: products,
              collection: collectionInfo
            } 

            var newProds = [],
                oldProds = [];

            if(pFilteringActive) {
              data.product.forEach(function(product){

                var isOld = false,
                    lastProductsShown =  filterState.childCollectionsShowing;

                for(var i = 0; i < lastProductsShown.length; i++) {
                  if(lastProductsShown[i].collection.id == collectionInfo.id) {
                    for(var b = 0; b < lastProductsShown[i].products.length; b++) {
                      if(product.id == lastProductsShown[i].products[b].id) {
                        $("[data-id=" + product.id + "]").data('already-showing', true); 
                        isOld = true
                      } 
                    }
                    if(isOld) {
                      oldProds.push(product)
                    } else {
                      newProds.push(product)
                    }                
                  }
                } 
              })
              data.product = newProds.concat(oldProds); 
            }
    
            
            totalProducts = totalProducts + data.product.length; 
            data.product = data.product.splice(0, 7); 
            $collectionContainer.empty(); 
            $collectionContainer.prepend(template(data)); 

            var moreProductsThumb = $("#view-more-prods-thumb-template").html(),
            moreProdsThumbTemplate = Handlebars.compile(moreProductsThumb);
            $collectionContainer.append(moreProdsThumbTemplate(data)); 

        } else {
          $collectionContainer.empty();
          var emptyTemplateSource = $("#collection-empty-template").html(),
          emptyTemplate = Handlebars.compile(emptyTemplateSource);
          $collectionContainer.append(emptyTemplate(collection)); 
        }   

      });

      $resultsTotal.text("(" + totalProducts + ")");
      $resultsContainer.attr('data-text', $resultsContainer.text()); 
      $(document).trigger('reset-thumbnails'); 
      reloadYotpo()

    } 
  }


  function getEnforcedOptions() {
    if($(selectors.collectionEnforcedOptions + ':checked').length > 0) {
        var $optionInputs = $(selectors.collectionEnforcedOptions + ':checked'); 
        var enforcedOptions = []; 
        var passes = true; 

        $optionInputs.each(function(index, element){
          enforcedOptions.push($(element).val());
        });  
        return enforcedOptions
    } else {
      return [] 
    }
  }

  function checkForEnforcedOptions(pEnforcedOptions, pProductTags) {

    var enforcedTags = pEnforcedOptions; 
    var productTags = pProductTags; 
    var passes = true; 

    if(enforcedTags.length > 0 ) {
      for(var i = 0; i < enforcedTags.length; i++) {
        if(productTags.indexOf(enforcedTags[i]) == -1) {
          passes = false 
        } else {
          passes = true
          break
        }
      }
    } else {
      passes = true 
    }

    return passes 
  }

  function filterProducts(products, pTags) {

    var tags = pTags; 
    var enforcedOptions = getEnforcedOptions(); 


    if(tags.length === 0 ) {

      if(!_.isEqual(_.sortBy(products), _.sortBy(filterState.productsShowing))) {
        buildFilteredProducts(products); 
      }

      buildActiveTags(tags);
      filterState.productsShowing = products; 
      filterState.active = false; 
      return products
    }

    if(enforcedOptions) {
      tags = tags.filter(function(tag) {
        for(var i = 0; i < enforcedOptions.length; i++) {
          if(tag == enforcedOptions[i]) {
            return false
          } 
        }
        return true 
      })

      if(tags.length === 0) {
        tags = enforcedOptions
      }
    }

    var filteredProducts = products.filter(function(product){
      for(var i = 0; i < tags.length; i++) {
        if(product.tags.indexOf(tags[i]) > -1 && checkForEnforcedOptions(enforcedOptions, product.tags)) {
          return true
        }
      }
      return false 
    });

    if(!_.isEqual(_.sortBy(filteredProducts), _.sortBy(filterState.productsShowing))) {
      buildFilteredProducts(filteredProducts, filterState.active); 
    }

    filterState.active = true; 
    filterState.productsShowing = filteredProducts; 
    buildActiveTags(tags); 
    return filteredProducts;
  }

  function removeProductsInView(pProdThumbnails, pFilteredProducts) {

      var products = pFilteredProducts;
      var $productThumbnails = $(pProdThumbnails); 

      $productThumbnails.filter(function(product) {
        for(var i = 0; i < products.length; i++) {
          if($(this).data('id').toString() === products[i].id) {
            $(this).find('[data-product]').data('already-showing', true); 
            return true 
          }
        }
        $(this).remove();
        return false  
      })
      
  }

  function filterDuplicatesAlreadyDisplaying(pProdThumbnails, pFilteredProducts) {

    var products = pFilteredProducts; 
    var $productThumbnails = $(pProdThumbnails).toArray(); 

    products = products.filter(function(product){
      for(var i = 0; i < $productThumbnails.length; i++) {
        if($($productThumbnails[i]).data('id').toString() === product.id) {
          return false 
        }
      }
      return true 
    });

    return products; 
  }

  function buildFilteredProducts(pFilteredProducts, pFilteringActive) {

    var $productsContainer = $('[data-products-container]');
    var filteredProducts = pFilteredProducts,
        $resultsTotal = $('[data-results-total]'),
        $resultsContainer = $('[data-results-container]'),
        totalProducts = 0; 


    if(filteredProducts.length > 0) {

      if(!pFilteringActive) {
        $productsContainer.empty(); 
      }

      var products = [],    
      product = {}, 
      data = {}, 
      source = $("#product-thumb-template").html(),
      template = Handlebars.compile(source);
      products = filteredProducts.map(function(productItem) {
        
        var product = {
          id: productItem.id, 
          description: productItem.body_html.replace(/<\/?[^>]+(>|$)/g, "").split(' ').join(' '), 
          title: productItem.title, 
          price: slate.Currency.formatMoney(productItem.price, '${{amount}}'),
          images: productItem.images,
          url: productItem.url,
          handle: productItem.handle,
          variant: productItem.variants[0].id,
          tags: productItem.tags, 
          available: productItem.available
        }

        return product; 
      });
          
      data = {
        product: products
      } 
      
      totalProducts = data.product.length; 

      if(pFilteringActive) {
        removeProductsInView('[data-product-thumb]', data.product); 
        data.product = filterDuplicatesAlreadyDisplaying('[data-product-thumb]', data.product);
      }

      $productsContainer.prepend(template(data)); 

    } else {
      $productsContainer.empty();
      var source = $("#collection-template-empty").html(),
      template = Handlebars.compile(source);
      $productsContainer.append(template()); 
    } 

    $resultsTotal.text("(" + totalProducts + ")");
    $resultsContainer.attr('data-text', $resultsContainer.text());     
    $(document).trigger('reset-thumbnails'); 
    reloadYotpo()

  }


  function clearAllFilters() {
    tags = []; 
    $(selectors.collectionFilterOptions).removeAttr('checked');
    
    if(collection.parent) {
      filterChildCollections(collection, tags); 
    } else {
      filterProducts(collection.products, tags); 
    }
  }


  function buildActiveTags(pTags) {

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
    var filterOptions = $(selectors.collectionFilterOptions); 


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


  function disableDisabledInputs(pInputs) {

    var $inputs = $(pInputs);

    $inputs.each(function(index, element) {
      var $element = $(element); 
      if($element.parent().hasClass('is-disabled')) {
        $element.prop("disabled", true);
      } 
    })
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


  //
  // Listens for any collection filters to change in order to filter products 
  //
   $(selectors.collectionFilterOptions).on('change', function(){
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


  // //
  // // Listens for any enforced collection filters to change in order to filter products 
  // //
  //  $(selectors.collectionEnforcedOptions).on('change', function(){
  //   var tag = $(this).val()
  //   if(tags.indexOf(tag) != -1) {
  //     _.pull(tags, tag); 
  //   } else {
  //     tags.push(tag); 
  //   }
  //   if(collection.parent) {
  //     filterChildCollections(collection, tags)
  //   } else {
  //     filterProducts(collection.products, tags); 
  //   }
  //  });


   disableDisabledInputs(selectors.collectionFilterOptions); 

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

