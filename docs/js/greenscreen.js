// to check
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.chrome.com/blog/offscreen-canvas/
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
// https://stackoverflow.com/questions/21197707/html5-video-to-canvas-playing-very-slow
// https://www.mux.com/blog/canvas-adding-filters-and-more-to-video-using-just-a-browser

// const variantA = require('./greenscreen-variant-a.js').variantA;

import { variantA } from './greenscreen-variant-a.js';

let rColor, gColor, bColor, rRange, gRange, bRange;
let clientWidth, clientHeight, videoWidth, videoHeight;
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

    document.getElementById('fullscreen').addEventListener('click', () => {
        const elem = document.documentElement;
        if (!fullscreen) {
            elem.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        fullscreen = !fullscreen;
    });

    video = document.querySelector('video');
    video.width = clientWidth;
    video.height = clientHeight;
    createNewCanvas();
    outputCanvas.width = clientWidth;
    outputCanvas.height = clientHeight;
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
    tmpCanvas = document.createElement('canvas');
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
            frameRate: {
                ideal: 30,
                max: 30,
            },
            width: 1920,
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

        let { width, height } = stream.getTracks()[0].getSettings();

        videoWidth = width;
        videoHeight = height;
        outputCanvas.width = videoWidth;
        outputCanvas.height = videoHeight;
        video.widh = videoWidth;
        video.height = videoHeight;

        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;
        isPortrait = clientHeight > clientWidth;

        const cameraAspectRatio =
            Math.max(videoWidth, videoHeight) /
            Math.min(videoWidth, videoHeight);
        console.log(cameraAspectRatio);

        let displayedWidth, displayedHeight;
        const smallerViewPortDimension = Math.min(clientWidth, clientHeight);
        const computedBiggerDimension = Number.parseInt(
            cameraAspectRatio * smallerViewPortDimension
        );
        if (isPortrait) {
            displayedWidth = smallerViewPortDimension;
            displayedHeight = computedBiggerDimension;
        } else {
            displayedWidth = computedBiggerDimension;
            displayedHeight = smallerViewPortDimension;
        }

        tmpCanvas.setAttribute('width', clientWidth);
        tmpCanvas.setAttribute('height', clientHeight);
        
        tmpContext = tmpCanvas.getContext('2d');

        video.width = videoWidth;
        video.height = videoHeight;

        console.log(width, height);
        document.getElementById('videowidth').innerText = width;
        document.getElementById('videoheight').innerText = height;

        const updateCanvas = () => {
            // console.log(
            //     'updating',
            //     clientWidth * clientHeight * 4,
            //     videoWidth * videoHeight * 4
            // );
            tmpContext.drawImage(video, 0, 0, clientWidth, clientHeight);
            let videoFrame = tmpContext.getImageData(
                0,
                0,
                videoWidth,
                videoHeight
            );

            const arr = new Uint8ClampedArray(videoHeight * videoWidth * 4);
            arr.fill(0, 0, arr.length - 1);
            const frame = new ImageData(arr, videoWidth);

            for (let i = 0; i < videoFrame.data.length / 4; i++) {
                let r = videoFrame.data[i * 4 + 0];
                let g = videoFrame.data[i * 4 + 1];
                let b = videoFrame.data[i * 4 + 2];

                const width = clientHeight;
                const height = videoWidth;

                const x = Math.floor(i % width);
                const y = Math.floor(i / width);

                if (
                    hasRequiredColor(r, g, b) &&
                    isWithinBackgroundRectangle(x, y)
                ) {
                    frame.data[i * 4 + 0] = 32;
                    frame.data[i * 4 + 1] = 32;
                    frame.data[i * 4 + 2] = 192;
                    frame.data[i * 4 + 3] = 255;
                }
            }
            outputContext.putImageData(frame, 0, 0);
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
