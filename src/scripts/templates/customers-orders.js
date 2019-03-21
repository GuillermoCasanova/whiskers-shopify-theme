/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Customer Addresses
 * template.
 *
 * @namespace customerOrders
 */

theme.customerOrders = (function() {
  var $orderToggles = $('[data-order]');

  if (!$orderToggles.length) {
    return;
  }

  function initOrderToggles(orderToggles) {

    $(orderToggles).each(function(index, elem) {

    	var id = $(this).data('order-id');
    	$(this).find('[data-order-toggle]').on('click', function() {
    			$('[data-order-id="' + id + '"]').toggleClass('is-active'); 
    		$('[data-order-id="' + id + '"]').find('[data-secondary-order-info]').slideToggle(200); 
    	});
    	$(this).on('click', function() {
    		 $('[data-order-id="' + id + '"]').toggleClass('is-active'); 
    		$('[data-order-id="' + id + '"]').find('[data-secondary-order-info]').slideToggle(200); 
    	})
    }); 
  }
  
    initOrderToggles('[data-order]');

})();