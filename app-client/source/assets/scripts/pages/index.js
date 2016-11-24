(function () {
	console.log($('.swiper-container.page-chief-sections')[0]);
	var chiefPageContentSliders = new Swiper('.swiper-container.page-chief-sections', {
		direction: 'vertical',
		mousewheelControl: true,
		hashnav: true,
		loop: false,
		pagination: '.swiper-pagination',
		paginationClickable: true
	});
})();