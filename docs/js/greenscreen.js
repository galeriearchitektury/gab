// to check
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.chrome.com/blog/offscreen-canvas/
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
// https://stackoverflow.com/questions/21197707/html5-video-to-canvas-playing-very-slow
// https://www.mux.com/blog/canvas-adding-filters-and-more-to-video-using-just-a-browser

// const variantA = require('./greenscreen-variant-a.js').variantA;

import { variantA } from './greenscreen-variant-a.js';

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

        let { width: videoWidth, height: videoHeight } = stream
            .getTracks()[0]
            .getSettings();

        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;

        let factor;
        const isPortrait = clientWidth < clientHeight;
        if (isPortrait) {
            factor = clientHeight / videoHeight;
        } else {
            factor = clientWidth / videoWidth;
        }
        videoWidth = Number.parseInt(videoWidth * factor, 10);
        videoHeight = Number.parseInt(videoHeight * factor, 10);

        if (isPortrait) {
            const leftMargin = `${(clientWidth - videoWidth) / 2}px`;
            video.style.marginLeft = leftMargin;
            outputCanvas.style.marginLeft = leftMargin;
        } else {
            const topMargin = `${(clientHeight - videoHeight) / 2}px`;
            video.style.marginTop = topMargin;
            outputCanvas.style.marginTop = topMargin;
        }

        // videoWidth = Number.parseInt(videoWidth * 1.5, 10);
        // videoHeight = Number.parseInt(videoHeight * 1.5, 10);

        // canvas, video, tmpCanvas, client

        // WORKS OK ON DESKTOP BUT NEEDS TO SCALE UP
        // clientWidth = window.innerWidth;
        // clientHeight = window.innerHeight;
        // video.width = videoWidth;
        // video.height = videoHeight;
        // outputCanvas.width = videoWidth;
        // outputCanvas.height = videoHeight;
        // tmpCanvas.width = videoWidth;
        // tmpCanvas.height = videoHeight;

        video.width = videoWidth;
        video.height = videoHeight;
        outputCanvas.width = videoWidth;
        outputCanvas.height = videoHeight;
        tmpCanvas.width = videoWidth;
        tmpCanvas.height = videoHeight;

        const updateCanvas = () => {
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

            for (let i = 0; i < videoFrame.data.length / 4; i++) {
                let r = videoFrame.data[i * 4 + 0];
                let g = videoFrame.data[i * 4 + 1];
                let b = videoFrame.data[i * 4 + 2];

                // weird
                const width = videoHeight;
                const height = videoHeight;

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
