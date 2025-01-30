// image file to convert
var fn = "Knitviper.png";
// array of colors in the palette
var palette = [
	[230,222,205],
	[197,180,139],
	[172,148,90],
	[106,90,65],
	[16,16,16],
	[141,106,57],
	[107,77,35],
	[72,53,28],
	[46,34,18],
	[238,164,213],
	[205,98,180],
	[164,74,139],
	[123,49,106],
	[90,16,74],
	[255,255,255],
	[0,0,0],
	[180,180,180],
	[109,109,109],
	[59,59,59]
];

// image manipulation
var Jimp = require('jimp');
// color difference equation
var cde = require('color-delta-e');
var deltaE = cde.deltaE;
// here to convert hex and decimal
var toolbox = require('./toolbox.js');

// given Jimp's decimal representation of a hexcode, return RGBA array
function hexIntToRgba(hex) {
	let conv = toolbox.convertBases(hex, 10, 16);
	while(conv.length < 8) {
		conv = "0" + conv;
	}
	let r = parseInt(toolbox.convertBases(conv[0]+conv[1], 16, 10));
	let g = parseInt(toolbox.convertBases(conv[2]+conv[3], 16, 10));
	let b = parseInt(toolbox.convertBases(conv[4]+conv[5], 16, 10));
	let a = parseInt(toolbox.convertBases(conv[6]+conv[7], 16, 10));
	return [r, g, b, a];
}
// given RGBA array, return Jimp's decimal representation of a hexcode
function rgbaArrayToHex(rgb) {
	let rgba = [rgb[0], rgb[1], rgb[2]];
	if(rgb.length < 4) {
		rgba.push(255);
	}else{
		rgba.push(rgb[3]);
	}
	let r = toolbox.convertBases(rgba[0], 10, 16);
	let g = toolbox.convertBases(rgba[1], 10, 16);
	let b = toolbox.convertBases(rgba[2], 10, 16);
	let a = toolbox.convertBases(rgba[3], 10, 16);
	let vals = [r, g, b, a];
	for(let v in vals) {
		while(vals[v].length < 2) {
			vals[v] = "0" + vals[v];
		}
	}
	let hexString = vals.join("");
	let hexInt = toolbox.convertBases(hexString, 16, 10);
	return hexInt;
}
// given RGBA array, find the palette color with the lowest deltaE
// deltaE measures difference to a human eye, from 0 to 100
function findNearestColors(rgb) {
	if(typeof rgb == "number")
		rgb = hexIntToRgba(rgb);
	rgb = [rgb[0], rgb[1], rgb[2]];
	let best = [-1, 101];
	for(let index in palette) {
		let testRGB = palette[index];
		let dif = deltaE(testRGB, rgb, "rgb");
		if(dif < best[1])
			best = [palette[index], dif];
	}
	return rgbaArrayToHex(best[0]);
}
// convert an image
function convert(fn) {
	Jimp.read(fn, (err, img) => {
		if(err) {
			console.log(err);
		}else{
			// for each pixel in the image...
			let max_x = img.bitmap.width;
			let max_y = img.bitmap.height;
			for(let x=1; x<=max_x; x++) {
				for(let y=1; y<=max_y; y++) {
					// grab its color
					// skip transparent pixels
					// erase barely visible pixels
					// convert remaining pixels
					let color = img.getPixelColor(x, y);
					let rgba = hexIntToRgba(color);
					if(rgba[3] == 0)
						continue;
					if(rgba[3] < 100) {
						img.setPixelColor(0x00000000, x, y);
					}else{
						let newColor = findNearestColors(rgba);
						img.setPixelColor(newColor, x, y);
					}
				}
			}
			img.write("output.png");
		}
	})
}
convert(fn);
