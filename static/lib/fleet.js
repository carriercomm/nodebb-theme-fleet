$('document').ready(function() {
	requirejs([
		'fleet/masonry',
		'fleet/imagesLoaded',
	], function(Masonry, imagesLoaded) {
		var fixed = localStorage.getItem('fixed') || 0,
			masonry;

		app.openChat = function (username, touid) {
			window.location.href = "/chats/" + username.trim();
		};





		function doMasonry() {
			if($('.home').length) {
				masonry = new Masonry('.row.home > div', {
					itemSelector: '.category-item',
					columnWidth: '.category-item',
					transitionDuration: 0,
					isInitLayout: false
				});

				$('.row.home > div p img').imagesLoaded(function() {
					masonry.layout();
				});

				var saved = JSON.parse(localStorage.getItem('masonry:layout'));
				if (saved) {
					for (var cid in saved) {
						if (saved.hasOwnProperty(cid)) {
							var category = saved[cid];

							$('.category-item[data-cid="' + cid + '"]').css({
								left: category.left,
								top: category.top,
								position: 'absolute'
							});
						}
					}
				}

				masonry.on('layoutComplete', function() {
					var saved = {};

					$('.category-item').each(function() {
						var $this = $(this);

						saved[$this.attr('data-cid')] = {
							left: $this.css('left'),
							top: $this.css('top'),
						};
					});

					localStorage.setItem('masonry:layout', JSON.stringify(saved));
				});
			}

			// Code to lock the menu to the top when scrolling past the header.
			// Enabled on all pages other than the homepage
			if($('.home').length == 0) {
				$(window).on('scroll', function() {
					if($(window).scrollTop() > $('#banner').outerHeight(true)) {
						$('.navbar').addClass('navbar-fixed');
						// We have taken the navbar out of it's place in the DOM. 
						// Add some padding to make up for the space we have taken, so the page doesn't jump.
						$('#content').css('padding-top', $('.navbar').outerHeight(true));
					} else {
						$('.navbar').removeClass('navbar-fixed');
						$('#content').css('padding-top', 0);
					}
				});
			} else {
				$('.navbar').removeClass('navbar-fixed');
				$('#content').css('padding-top', 0);
			}
		}

		function resize(fixed) {
			fixed = parseInt(fixed, 10);

			var container = fixed ? $('.container-fluid') : $('.container');
			container.toggleClass('container-fluid', fixed !== 1).toggleClass('container', fixed === 1);
			localStorage.setItem('fixed', fixed);
			doMasonry();
		}

		$(window).on('action:ajaxify.end', function(ev, data) {
			var url = data.url;

			if(!/^admin\//.test(url) && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				if (url === "") {
					doMasonry();
					$('.category-header .badge i').tooltip();
				}

				resize(fixed);
			}
		});

		if (!$('.admin').length) {
			setupResizer();
		}

		$(window).on('action:posts.loaded', function() {
			doMasonry();
		});

		function setupResizer() {
			var div = $('<div class="overlay-container"><div class="panel resizer pointer"><div class="panel-body"><i class="fa fa-arrows-h fa-2x"></i></div></div></div>');

			div.css({
				position:'fixed',
				bottom: '20px',
				right: '20px'
			}).hide().appendTo(document.body);

			$(window).on('mousemove', function(ev) {
				if (ev.clientX > $(window).width() - 150 && ev.clientY > $(window).height() - 150) {
					div.fadeIn();
				} else {
					div.stop(true, true).fadeOut();
				}
			});

			div.find('.resizer').on('click', function() {
				fixed = parseInt(fixed, 10) === 1 ? 0 : 1;
				resize(fixed);
			});
		}
	});

	(function() {
		// loading animation
		var refreshTitle = app.refreshTitle,
			loadingBar = $('.loading-bar');

		$(window).on('action:ajaxify.start', function(data) {
			loadingBar.fadeIn(0).removeClass('reset');
		});

		$(window).on('action:ajaxify.loadingTemplates', function() {
			loadingBar.css('width', '90%');
		});

		app.refreshTitle = function(url) {
			loadingBar.css('width', '100%');
			setTimeout(function() {
				loadingBar.fadeOut(250);

				setTimeout(function() {
					loadingBar.addClass('reset').css('width', '0%');
				}, 250);
			}, 750);

			return refreshTitle(url);
		};
	}());
});