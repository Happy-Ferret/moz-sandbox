/* The original program is buggy, as the blur of pixels to the right
   of and below previously processed pixels will incorporate the
   blurred values, not the original pixel values (input array ==
   output array).  This program fixes that bug by having a separate
   output array.
*/

"use strict";

// Common computation code.
// Call setup() before computeBlur();

var kernel_, kernelSize_, kernelSum_;

function setup() {
    var sigma = 10;		// radius
    var ss = sigma * sigma;
    var factor = 2 * Math.PI * ss;
    var kernel = [];

    kernel.push([]);
    var i = 0;
    do {
        var g = Math.exp(-(i * i) / (2 * ss)) / factor;
        if (g < 1e-3) break;
        kernel[0].push(g);
        ++i;
    } while (i < 7);

    var kernelSize = i;
    for (var j = 1; j < kernelSize; ++j) {
        kernel.push([]);
        for (var i = 0; i < kernelSize; ++i) {
            var g = Math.exp(-(i * i + j * j) / (2 * ss)) / factor;
            kernel[j].push(g);
        }
    }

    var kernelSum = 0;
    for (var j = 1 - kernelSize; j < kernelSize; ++j) {
        for (var i = 1 - kernelSize; i < kernelSize; ++i) {
            kernelSum += kernel[Math.abs(j)][Math.abs(i)];
        }
    }

    [kernel_,kernelSize_,kernelSum_] = [kernel, kernelSize, kernelSum];
}

function computeBlur(y_min, y_lim, height, width, dataIn, dataOut) {
    var kernel = kernel_;
    var kernelSize = kernelSize_;
    var kernelSum = kernelSum_;

    for (var y = y_min; y < y_lim; ++y) {
        for (var x = 0; x < width; ++x) {
	    var r = 0, g = 0, b = 0, a = 0;
	    for (var j = 1 - kernelSize; j < kernelSize; ++j) {
                if (y + j < 0 || y + j >= height) continue;
                for (var i = 1 - kernelSize; i < kernelSize; ++i) {
		    if (x + i < 0 || x + i >= width) continue;
		    r += dataIn[4 * ((y + j) * width + (x + i)) + 0] * kernel[Math.abs(j)][Math.abs(i)];
		    g += dataIn[4 * ((y + j) * width + (x + i)) + 1] * kernel[Math.abs(j)][Math.abs(i)];
		    b += dataIn[4 * ((y + j) * width + (x + i)) + 2] * kernel[Math.abs(j)][Math.abs(i)];
		    a += dataIn[4 * ((y + j) * width + (x + i)) + 3] * kernel[Math.abs(j)][Math.abs(i)];
                }
	    }
	    dataOut[4 * (y * width + x) + 0] = r / kernelSum;
	    dataOut[4 * (y * width + x) + 1] = g / kernelSum;
	    dataOut[4 * (y * width + x) + 2] = b / kernelSum;
	    dataOut[4 * (y * width + x) + 3] = a / kernelSum;
        }
    }
}

