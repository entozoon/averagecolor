# Average Color
Get the average color of an image by looking at a limited sample of pixels.

## Usage
```
var averageColor = $('.image').averageColor();
```
Will yield an object containing the r, g, b and matching hex value for the average colour.


Say for example, if you had an image and wanted to set it's container to have the average background colour, you could write:
```
var averageHex = $('.image').averageColour().hex;
$('.image').parent().css('background-color', averageHex);
```

## Options
- **samples** ```(integer - default: 1000) Change the number of pixels it samples to calculate the average for quality/performance.```
- **defaultColor** ```(color - default: black) Change the default background colour if there is a problem with the image.```
- **colorParent** ```(boolean - default: false) If true, set the background colour of the parent```
- **fadeEdges** ```(object - enabled by default) Enable / set various properties to do with the faded edges, see below.```


### Full example:
```
var averageColor = $('.image').averageColor({
	samples: 50,
	defaultColor: {r:255, g:255, b:255},
	colorParent: true,
	fadeEdges: {
		enabled: true,   // If true, apply an inset box-shadow to give the appearance of faded edges
		width: 20,       // Fade width can be set, or overridden by CSS
		edges: [         // You can exclude edges from the fade by overriding this
			'left',
			'right'
		]
	}
});
```