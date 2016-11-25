(function () {
	var chiefPageContentSliders = new Swiper('.swiper-container.page-chief-sections', {
		direction: 'vertical',
		mousewheelControl: true,
		hashnav: true,
		loop: false,
		pagination: '.swiper-pagination',
		paginationClickable: true,

		onScroll: function(thisSwiper, event) {
			console.log(thisSwiper.activeIndex, thisSwiper);
			if (Math.random() > 0.5) {
				thisSwiper.lockSwipes();
			} else {
				thisSwiper.unlockSwipes();
			}
		}
	});
	chiefPageContentSliders.slideTo(chiefPageContentSliders.slides.length - 1, 5);
})();