/*
 *	jQuery AverageColour v1.1
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
			samples: 1000, // Look at a limited sample of pixels (change to affect quality/performance)
			defaultColor: {r: 0, g: 0, b: 0} // defaults to black in case of failure
		}


		var options = $.extend(defaults, options);

		// Create temporary image
		var tempImage = new Image();
		tempImage.src = $(this).attr('src');

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
					 *
					 * pixel.x = Math.floor(Math.random() * (width - 1));
					 * pixel.y = Math.floor(Math.random() * (height - 1));
					 *
					 * var data = ctx.getImageData(pixel.x, pixel.y, 1, 1);
					 *
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
