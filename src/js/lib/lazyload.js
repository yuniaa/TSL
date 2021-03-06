/*! echo.js v1.7.0 | (c) 2015 @toddmotto | https://github.com/toddmotto/lazyload */
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return factory(root);
		});
	} else if (typeof exports === 'object') {
		module.exports = factory;
	} else {
		root.lazyload = factory(root);
	}
})(window, function(root) {
	'use strict';

	var lazyload = {};

	var callback = function() {};

	var offset, poll, delay, useDebounce, unload;

	var inView = function(element, view) {
		var box = element.getBoundingClientRect();
		return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
	};

	var debounceOrThrottle = function() {
		if (!useDebounce && !! poll) {
			return;
		}
		clearTimeout(poll);
		poll = setTimeout(function() {
			lazyload.render();
			poll = null;
		}, delay);
	};

	lazyload.init = function(opts) {
		opts = opts || {};
		var offsetAll = opts.offset || 0;
		var offsetVertical = opts.offsetVertical || offsetAll;
		var offsetHorizontal = opts.offsetHorizontal || offsetAll;
		var optionToInt = function(opt, fallback) {
			return parseInt(opt || fallback, 10);
		};
		offset = {
			t: optionToInt(opts.offsetTop, offsetVertical),
			b: optionToInt(opts.offsetBottom, offsetVertical),
			l: optionToInt(opts.offsetLeft, offsetHorizontal),
			r: optionToInt(opts.offsetRight, offsetHorizontal)
		};
		delay = optionToInt(opts.throttle, 250);
		useDebounce = opts.debounce !== false;
		unload = !! opts.unload;
		callback = opts.callback || callback;
		lazyload.render();
		if (document.addEventListener) {
			root.addEventListener('scroll', debounceOrThrottle, false);
			root.addEventListener('load', debounceOrThrottle, false);
		} else {
			root.attachEvent('onscroll', debounceOrThrottle);
			root.attachEvent('onload', debounceOrThrottle);
		}
	};

	lazyload.render = function() {
		var nodes = document.querySelectorAll('img[data-src], [data-src-background]');
		var length = nodes.length;
		var src, elem;
		var view = {
			l: 0 - offset.l,
			t: 0 - offset.t,
			b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
			r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
		};
		for (var i = 0; i < length; i++) {
			elem = nodes[i];
			if (inView(elem, view)) {

				if (unload) {
					elem.setAttribute('data-src-placeholder', elem.src);
				}

				if (elem.getAttribute('data-src-background') !== null) {
					elem.style.backgroundImage = "url(" + elem.getAttribute('data-src-background') + ")";
				} else {
					elem.src = elem.getAttribute('data-src');
				}

				if (!unload) {
					elem.removeAttribute('data-src');
				}

				callback(elem, 'load');
			} else if (unload && !! (src = elem.getAttribute('data-src-placeholder'))) {

				if (elem.getAttribute('data-src-background') !== null) {
					elem.style.backgroundImage = "url(" + src + ")";
				} else {
					elem.src = src;
				}

				elem.removeAttribute('data-src-placeholder');
				callback(elem, 'unload');
			}
		}
		if (!length) {
			lazyload.detach();
		}
	};

	lazyload.detach = function() {
		if (document.removeEventListener) {
			root.removeEventListener('scroll', debounceOrThrottle);
		} else {
			root.detachEvent('onscroll', debounceOrThrottle);
		}
		clearTimeout(poll);
	};

	return lazyload;

});