/*
 *	jQuery AverageColour v1.6
 * Get the average color of an image by looking at a limited sample of pixels.
 *	Returns an object containing r, g, b, and the hex value.
 * It can also colour the background of a parent element and fade the edges of the image
 *
 * Handles <img> elements, or any element that has a background-image.
 *
 *	Copyright (c) 2015 Michael Cook
 *	Released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

function rgbToHex(rgb) {
	return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

(function($) {

	$.fn.averageColor = function(options) {
		var defaults = {
			colorParent: false, // If true, set the background colour of the parent
			fadeEdges: {
				enabled: false,  // If true, apply an inset box-shadow to give the appearance of faded edges
				width: 20,       // Fade properties can be set, or overridden by CSS
				edges: [         // You can exclude edges from the fade by overriding this
					'top',
					'right',
					'bottom',
					'left'
				]
			},
			samples: 1000,      // Look at a limited sample of pixels (change to affect quality/performance)
			defaultColor: {     // defaults to black in case of failure
				r: 0, g: 0, b: 0, hex: "#000000"
			}
		}

		// Test typeof rather than .length as they're objects
		if (typeof options != 'undefined' &&
			 typeof options.fadeEdges != 'undefined' &&
			 typeof options.fadeEdges.edges != 'undefined') {
			// Allow given fadeEdges values to override defaults intuitively despite being in any object
			for (var key in options.fadeEdges) {
				defaults.fadeEdges[key] = options.fadeEdges[key];
			}
		}

		options = $.extend(true, {}, defaults, options);

		//console.log(options.fadeEdges.edges)

		// Create temporary image
		var tempImage = new Image();

		// If it's a img element
		if ($(this).attr('src') && $(this).attr('src').length) {
			tempImage.src = $(this).attr('src');
		}
		// if it's a div with a background-image
		else if ($(this).css('background-image').length) {
			var backgroundImage = $(this).css('background-image');
			if (backgroundImage.slice(0,4) === "url(") {
				backgroundImage = backgroundImage.slice(4, backgroundImage.length-1);
			}
			// Strip any " chars, for firefox's sake (sigh)
			backgroundImage = backgroundImage.replace(/\"/g, '');
			tempImage.src = backgroundImage;
		}
		else {
			console.log("averageColor: couldn't understand the image provided");
			return rgb; // return rgb
		}

		var height = tempImage.height;
		var width = tempImage.width;

		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		var ctx = canvas.getContext && canvas.getContext('2d'),
			rgb = options.defaultColor,
			pixel = {};

		// If it managed to create a canvas
		if (ctx) {
			ctx.drawImage(tempImage, 0, 0);

			var data = ctx.getImageData(0,0,width,height);
			var imageData = data.data;

			try {
				// Add up the sampled pixel colour values
				for (var i = 0; i < options.samples; i++) {
					/*
					 * Gather sample pixel values by using getImageData for 1-pixel wide areas
					 * (This is super inefficient, but useful for debugging):
					 * pixel.x = Math.floor(Math.random() * (width - 1));
					 * pixel.y = Math.floor(Math.random() * (height - 1));
					 * var data = ctx.getImageData(pixel.x, pixel.y, 1, 1);
					 * rgb.r += data.data[0];
					 * rgb.g += data.data[1];
					 * rgb.b += data.data[2];
					 */

					/*
					 * Gather sample pixel values by using image data separated from the DOM for speed
					 */
					// Random 0 -> data.length-4 in multiples of 4 (e.g. 0, 4, 8, etc) as they're in rgba format
					var index = Math.floor(Math.random() * (imageData.length-4)/4) * 4;

					rgb.r += imageData[index];
					rgb.g += imageData[index+1];
					rgb.b += imageData[index+2];
				}

				// Calculate average colour
				rgb.r = Math.floor(rgb.r / options.samples);
				rgb.g = Math.floor(rgb.g / options.samples);
				rgb.b = Math.floor(rgb.b / options.samples);

				// Stick the hex value in there for good measure
				rgb.hex = rgbToHex(rgb);

				// Add some brightness information too
				rgb.brightness = getBrightness(rgb);

			} catch (e) {
				// Security error
				console.log("averageColor: Security Error");
				return rgb; // return rgb
			}
		}

		delete canvas;
		delete data;

		/*
		 * Optionally apply the average color to the background of the parent
		 */
		if (options.colorParent) {
			$(this).parent().css('background-color', rgb.hex);
		}

		/*
		 * Optionally apply an inset box-shadow to give the appearance of faded edges
		 */
		if (options.fadeEdges.enabled == true) {
			/* Set display block, unless already set to inline-block
			 * if ($(this).css('display') != "inline-block") {
			 * 	 $(this).css('display','block'); }
			 */
			// Set inline block for now, handles horizontal centering the best
			$(this).css('display', 'inline-block');

			var shadow = 'inset 0 0 '+options.fadeEdges.width+'px '+options.fadeEdges.width+'px rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
			var top = right = bottom = left = - options.fadeEdges.width + 'px';

			if ($.inArray('top',    options.fadeEdges.edges) !== -1) { top = 0;    }
			if ($.inArray('right',  options.fadeEdges.edges) !== -1) { right = 0;  }
			if ($.inArray('bottom', options.fadeEdges.edges) !== -1) { bottom = 0; }
			if ($.inArray('left',   options.fadeEdges.edges) !== -1) { left = 0;   }

			$(this).addClass('.averagecolor--faded')
				// Wrap in a div and add the fade shadow to an after element inside it
				.wrap('<div />')
				.after('<div />')
				.next()
					.addClass('averagecolor__fade')
					.css({
						'position': 'absolute',
						'top':    top,
						'right':  right,
						'bottom': bottom,
						'left':   left,
						'box-shadow': shadow,
						'-moz-box-shadow': shadow,
						'-webkit-box-shadow': shadow
					})
				.parent()
					.css({
						'position': 'relative',
						'display': 'inline-block',
						'overflow': 'hidden' // for edge exclusion
					});
		}

		return rgb; // return rgb no matter what
	};

	// The W3C brightness algorithm
	// https://www.w3.org/TR/AERT#color-contrast
	function getBrightness(rgb) {
		return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
	}

})(jQuery);
