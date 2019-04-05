

/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection template
 *
 * @namespace collectionFilter
 */
theme.collectionFilter = (function() {


  var selectors = {
      collectionMenu: '[data-ui-component="collection-menu"]'
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
          url: '/collections/'+ collection + '/products.json?limit=250?fields=url',
          dataType: 'json',
          success: function(res){
              filterProducts(res.products, tags)
           },
          error: function(status){
               alert(status);
          }
      })
  }

  function filterProducts(products, tags) {
    if(tags.length === 0 ) {
      buildFilteredProducts(products); 
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
    console.log(filteredProducts); 
    return filteredProducts;
  }


  function buildFilteredProducts(filteredProds) {
          
    var $productContainer = $('[data-section-type="collection"]');
        
        $productContainer.empty();
        var products = [],
        product = {}, 
        data = {}, 
        source = $("#collection-template").html(),
        template = Handlebars.compile(source);
        products = filteredProds.map(function(productItem) {
        
        console.log(productItem); 

         var product = {
            id: productItem.id, 
            description: productItem.body_html.replace(/<\/?[^>]+(>|$)/g, "").split(' ').join(' '), 
            title: productItem.title, 
            price: slate.Currency.formatMoney(productItem.variants[0].price, '${{amount}}'),
            featuredImg: productItem.images[0].src,
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
  }

  $(function(){
      $('[data-ui-component="filter-option"]').on('change', function(){
          var tag = $(this).val()
          if(tags.indexOf(tag) != -1) {
            _.pull(tags, tag); 
            console.log('tag already here');
          } else {
            tags.push(tag); 
            console.log('new');
          }
          getFilterProducts(tags, collectionId);
      });
  });

})();

