// to check
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.chrome.com/blog/offscreen-canvas/
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
// https://stackoverflow.com/questions/21197707/html5-video-to-canvas-playing-very-slow
// https://www.mux.com/blog/canvas-adding-filters-and-more-to-video-using-just-a-browser

// const variantA = require('./greenscreen-variant-a.js').variantA;

import { variantA } from './greenscreen-variant-a.mjs';

let rColor, gColor, bColor, rRange, gRange, bRange;
let clientWidth, clientHeight, finalWidth, finalHeight;
let outputCanvas,
    outputContext,
    video,
    tmpCanvas,
    tmpContext,
    fullscreen = false,
    isPortrait;

const colorChange = (e, color) => {
    const { value } = e.target;
    const parsed = Number.parseInt(value, 10);
    if (color === 'r') {
        rColor = parsed;
    } else if (color === 'g') {
        gColor = parsed;
    } else {
        bColor = parsed;
    }
    document.querySelector(`#${color}-value`).innerHTML = parsed;
    refreshColorSampler();
    logSettings();
};

const rangeChange = (e, color) => {
    const { value } = e.target;
    const parsed = Number.parseInt(value, 10);
    if (color === 'r') {
        rRange = parsed;
    } else if (color === 'g') {
        gRange = parsed;
    } else {
        bRange = parsed;
    }
    document.querySelector(`#${color}-range-value`).innerHTML = parsed;
    logSettings();
};

const logSettings = () => {
    console.log(rColor, gColor, bColor);
    console.log(rRange, gRange, bRange);
};

const initControls = () => {
    const rColorInput = document.querySelector('#r-color');
    const gColorInput = document.querySelector('#g-color');
    const bColorInput = document.querySelector('#b-color');
    const rRangeInput = document.querySelector('#r-range');
    const gRangeInput = document.querySelector('#g-range');
    const bRangeInput = document.querySelector('#b-range');

    rColor = Number.parseInt(rColorInput.value, 10);
    gColor = Number.parseInt(gColorInput.value, 10);
    bColor = Number.parseInt(bColorInput.value, 10);

    rRange = Number.parseInt(rRangeInput.value, 10);
    gRange = Number.parseInt(gRangeInput.value, 10);
    bRange = Number.parseInt(bRangeInput.value, 10);

    rColorInput.addEventListener('change', (e) => colorChange(e, 'r'));
    gColorInput.addEventListener('change', (e) => colorChange(e, 'g'));
    bColorInput.addEventListener('change', (e) => colorChange(e, 'b'));

    rRangeInput.addEventListener('change', (e) => rangeChange(e, 'r'));
    gRangeInput.addEventListener('change', (e) => rangeChange(e, 'g'));
    bRangeInput.addEventListener('change', (e) => rangeChange(e, 'b'));

    document.getElementById('width').innerText = clientWidth;
    document.getElementById('height').innerText = clientHeight;

    // document.getElementById('fullscreen').addEventListener('click', () => {
    //     const elem = document.documentElement;
    //     if (!fullscreen) {
    //         elem.requestFullscreen();
    //     } else {
    //         document.exitFullscreen();
    //     }
    //     fullscreen = !fullscreen;
    // });

    video = document.querySelector('video');
    video.width = clientWidth;
    video.height = clientHeight;
    createNewCanvas();
    outputCanvas.width = clientWidth;
    outputCanvas.height = clientHeight;
    refreshColorSampler();
};

const refreshColorSampler = () => {
    const colorSample = document.getElementById('color-sample');
    colorSample.style.backgroundColor = `rgb(${rColor}, ${gColor}, ${bColor})`;
};

const createNewCanvas = () => {
    outputCanvas = document.createElement('canvas');
    outputCanvas.id = 'output-canvas';
    const holder = document.getElementById('canvas-holder');
    outputCanvas.width = clientWidth;
    outputCanvas.height = clientHeight;
    outputCanvas.style.width = `${clientWidth}px`;
    outputCanvas.style.height = `${clientHeight}px`;
    holder.appendChild(outputCanvas);
    outputContext = outputCanvas.getContext('2d');
};

const createTmpCanvas = () => {
    // tmpCanvas = document.createElement('canvas');
    tmpCanvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
    tmpContext = tmpCanvas.getContext('2d');
};

const isWithinBackgroundRectangle = (x, y) => {
    return true;
};

const hasRequiredColor = (r, g, b) =>
    r > rColor - rRange &&
    r < rColor + rRange &&
    g > gColor - gRange &&
    g < gColor + gRange &&
    b > bColor - bRange &&
    b < bColor + bRange;

const variantB = () => {
    initControls();
    createTmpCanvas();

    const constraints = {
        audio: false,
        video: {
            facingMode: 'environment',
            aspectRatio: {
                exact: 4 / 3,
            },

            height: {
                min: 720,
                ideal: 1920,
                // max: 1920,
            },
        },
    };

    function handleError(error) {
        console.log(
            'navigator.MediaDevices.getUserMedia error: ',
            error.message,
            error.name
        );
    }

    function handleSuccess(stream) {
        video.srcObject = stream;

        // let { width: videoWidth, height: videoHeight } = stream
        const settings = stream.getTracks()[0].getSettings();
        console.log(settings);
        const videoWidth = settings.width;
        const videoHeight = settings.height;

        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;

        let factor = 1;
        const isPortrait = clientWidth < clientHeight;
        if (isPortrait) {
            factor = Number.parseFloat(clientWidth / videoWidth, 100);
        } else {
            factor = Number.parseFloat(clientWidth / videoWidth, 100);
        }

        video.width = videoWidth;
        video.height = videoHeight;
        outputCanvas.width = videoWidth;
        outputCanvas.height = videoHeight;
        tmpCanvas.width = videoWidth;
        tmpCanvas.height = videoHeight;

        // factor = 1
        video.style.transform = `scale(${factor})`;
        video.style.transformOrigin = '0 0';
        outputCanvas.style.transform = `scale(${factor})`;
        outputCanvas.style.transformOrigin = '0 0';

        // requestAnimationFrame();

        const boundingRect = document
            .getElementsByTagName('video')[0]
            .getBoundingClientRect();

        if (isPortrait) {
            const margin = Number.parseInt(
                (clientWidth - Number.parseInt(boundingRect.width, 10)) / 2,
                10
            );
            video.style.marginLeft = `${margin}px`;
            outputCanvas.style.marginLeft = `${margin}px`;
        } else {
            const margin = Number.parseInt(
                (clientHeight - Number.parseInt(boundingRect.height, 10)) / 2,
                10
            );
            video.style.marginTop = `${margin}px`;
            outputCanvas.style.marginTop = `${margin}px`;
        }

        // const img =

        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = 1700;
        imgCanvas.height = 620;
        const imgContext = imgCanvas.getContext('2d');

        const image = new Image();
        image.src = '../img/yolo-wide.png';

        let imageData;

        image.onload = () => {
            imgContext.drawImage(image, 0, 0, 1700, 620);
            imageData = imgContext.getImageData(0, 0, 1700, 620);
            // document.getElementById('test').appendChild(imgCanvas);
        };

        let topLeftX = 0,
            topLeftY = 0,
            topRightX = 0,
            topRightY = 0,
            bottomLeftX = 0,
            bottomLeftY = 0,
            bottomRightX = 0,
            bottomRightY = 0;

        const updateCanvas = () => {
            const updateCorners = (x, y) => {
                if (!topLeftX || x < topLeftX) {
                    topLeftX = x;
                }
                if (!topLeftY || y < topLeftY) {
                    topLeftY = y;
                }

                if (!topRightX || x > topRightX) {
                    topRightX = x;
                }

                if (!topRightY || y < topRightY) {
                    topRightY = y;
                }

                if (!bottomLeftX || x < bottomLeftX) {
                    bottomLeftX = x;
                }
                if (!bottomLeftY || y > bottomLeftY) {
                    bottomLeftY = y;
                }

                if (!bottomRightX || x > bottomRightX) {
                    bottomRightX = x;
                }

                if (!bottomRightY || y > bottomRightY) {
                    bottomRightY = y;
                }

                // console.log(width, height);

                // console.log(
                //     topLeftX,
                //     topLeftY,
                //     topRightX,
                //     topRightY,
                //     bottomLeftX,
                //     bottomLeftY,
                //     bottomRightX,
                //     bottomRightY
                // );
            };

            const width = Number.parseInt(
                (topRightX - topLeftX + (bottomRightX - bottomLeftX)) / 2,
                10
            );

            const height = Number.parseInt(
                (bottomLeftY - topLeftY + (bottomRightY - topRightY)) / 2,
                10
            );

            // if (width && height) {
            //     console.log(width, height);
            //     // console.log(topLeftX, topLeftY);
            //     imgContext.drawImage(
            //         image,
            //         0,
            //         0,
            //         1700,
            //         620,
            //         topLeftX,
            //         topLeftY,
            //         width,
            //         height
            //     );
            //     imageData = imgContext.getImageData(
            //         0,
            //         0,
            //         videoWidth,
            //         videoHeight
            //     );
            // }

            tmpContext.drawImage(video, 0, 0, videoWidth, videoHeight);
            let videoFrame = tmpContext.getImageData(
                0,
                0,
                videoWidth,
                videoHeight
            );

            const arr = new Uint8ClampedArray(videoHeight * videoWidth * 4);
            arr.fill(0, 0, arr.length - 1);

            const frame = new ImageData(arr, videoWidth);

            outputContext.clearRect(0, 0, videoWidth, videoHeight);
            topLeftX = 0;
            topLeftY = 0;
            topRightX = 0;
            topRightY = 0;
            bottomLeftX = 0;
            bottomLeftY = 0;
            bottomRightX = 0;
            bottomRightY = 0;
            for (let i = 0; i < videoFrame.data.length / 4; i++) {
                let r = videoFrame.data[i * 4 + 0];
                let g = videoFrame.data[i * 4 + 1];
                let b = videoFrame.data[i * 4 + 2];

                // weird
                const width = videoWidth;
                const height = videoHeight;

                const x = Math.floor(i % width);
                const y = Math.floor(i / width);

                if (
                    imageData?.data &&
                    hasRequiredColor(r, g, b) &&
                    isWithinBackgroundRectangle(x, y)
                ) {
                    frame.data[i * 4 + 0] = 192;
                    frame.data[i * 4 + 1] = 32;
                    frame.data[i * 4 + 2] = 128;
                    frame.data[i * 4 + 3] = 255;

                    // const backdropPixels = imageData.data.length / 4;
                    // const availableSpace = width * height;
                    // const xOffsetOnScreen =
                    //     x - Number.parseInt((topLeftX + bottomLeftX) / 2, 10);
                    // const yOffsetOnScreen =
                    //     y - Number.parseInt((bottomLeftY + topLeftY) / 2, 10);
                    // xOffsetPercentage = width / xOffsetOnScreen;
                    // yOffsetPercentage = width / yOffsetOnScreen;

                    // 17000 * 6200 * 4

                    // const indexInBackdrop = ???


                    // frame.data[i * 4 + 0] = imageData.data[i * 4 + 0];
                    // frame.data[i * 4 + 1] = imageData.data[i * 4 + 1];
                    // frame.data[i * 4 + 2] = imageData.data[i * 4 + 2];
                    // frame.data[i * 4 + 3] = imageData.data[i * 4 + 3];
                    updateCorners(x, y);
                }
            }

            outputContext.strokeStyle = '#FF0000';
            // outputContext.arc(topLeftX, topLeftY, 10, 2 * Math.PI, false);
            // outputContext.arc(topRightX, topRightY, 10, 2 * Math.PI, false);
            // outputContext.arc(bottomLeftX, bottomLeftY, 10, 2 * Math.PI, false);
            // outputContext.arc(
            //     bottomRightX,
            //     bottomRightY,
            //     10,
            //     2 * Math.PI,
            //     false
            // );
            outputContext.putImageData(frame, 0, 0);
            outputContext.stroke();
            requestAnimationFrame(updateCanvas);
        };

        video.addEventListener(
            'play',
            () => {
                requestAnimationFrame(updateCanvas);
            },
            false
        );

        video.play();
    }

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
};

export const runGreenScreen = () => {
    // variantA();
    variantB();
};
