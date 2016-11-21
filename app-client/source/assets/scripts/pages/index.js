(function () {
	$('#credit-abstract-pane .operations button').on('click', function(event) {
		$('.popup-layers-back-plate').show();
		$('#pl-taijs-app-promotion').show();
	});

	$('#credit-details-pane .docking button').on('click', function(event) {
		$('#credit-details-pane .expandable').toggleClass('expanded');
	});

	$('#pl-taijs-app-promotion .button-x').on('click', function(event) {
		$('.popup-layers-back-plate').hide();
		$('#pl-taijs-app-promotion').hide();
	});
})();