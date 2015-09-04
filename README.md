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
```samples``` (default: 200) Change the number of pixels it samples to calculate the average.
e.g.
```
var averageColor = $('.image').averageColor({samples: 50});
```