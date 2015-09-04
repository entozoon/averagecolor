/*
 *	jQuery AverageColour v1
 *  Get the average color of an image by looking at a limited sample of pixels.
 *	Returns an object containing r, g, b, and the hex value.
 *
 *	Copyright (c) 2016 Michael Cook
 *	Released under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 */

(function($) {

	$.fn.averageColor = function(options) {
		var defaults = {
			samples: 200, // Look at a limited sample of pixels
			defaultColor: {r: 0, g: 0, b: 0} // defaults to black in case of failure
		}

		var options = $.extend(defaults, options);

		var canvas = document.createElement('canvas'),
			ctx = canvas.getContext && canvas.getContext('2d'),
			rgb = options.defaultColor;

		// If it can create a canvas
		if (ctx) {
			// Create temporary canvas image
			var tempImage = new Image();
			tempImage.src = $(this).attr('src');

			var height = tempImage.height;
			var width = tempImage.width;

			ctx.drawImage(tempImage, 0, 0);

			try {
				var data = ctx.getImageData(0, 0, width, height);
				var length = data.length;
				data = data.data;

				// Add up the sampled pixel colour values
				for (var i=0; i<options.samples; i++) {
					// ~~() = Math.floor()
					//console.log(data[~~(Math.random() * (length-3))]);
					rgb.r += data[~~(Math.random() * (length-3))]
					rgb.g += data[~~(Math.random() * (length-3)) + 1]
					rgb.b += data[~~(Math.random() * (length-3)) + 2]
				}

				// Calculate average colour
				rgb.r = ~~(rgb.r / options.samples);
				rgb.g = ~~(rgb.g / options.samples);
				rgb.b = ~~(rgb.b / options.samples);

				// Stick the hex value in there for good measure
				rgb.hex = rgbToHex(rgb);


			} catch (e) {
				// Security error
			}
		}

		delete canvas;
		delete data;

		return rgb; // return rgb no matter what
	};

    function rgbToHex(rgb) {
	 	return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
	}

})(jQuery);
