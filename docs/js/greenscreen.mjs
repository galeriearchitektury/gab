// to check
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.chrome.com/blog/offscreen-canvas/
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
// https://stackoverflow.com/questions/21197707/html5-video-to-canvas-playing-very-slow
// https://www.mux.com/blog/canvas-adding-filters-and-more-to-video-using-just-a-browser

import { variantA } from './greenscreen-variant-a.mjs';

let rColor,
    gColor,
    bColor,
    rRange,
    gRange,
    bRange,
    snapButton,
    redoButton,
    saveButton;
let clientWidth, clientHeight, videoWidth, videoHeight;
let outputCanvas,
    outputContext,
    video,
    tmpCanvas,
    tmpContext,
    preview,
    previewBcg,
    spinner,
    fullscreen = false,
    pictureIsLoading = false;

// wide
let backdropWidth = 1700;
let backdropHeight = 620;

// cardboard
// let backdropWidth = 410;
// let backdropHeight = 260;

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

const combineVideoAndCanvas = () => {
    const thirdCanvas = document.createElement('canvas');
    const thirdContext = thirdCanvas.getContext('2d');
    thirdCanvas.width = videoWidth;
    thirdCanvas.height = videoHeight;

    const finalFrame = thirdContext.getImageData(0, 0, videoWidth, videoHeight);

    let videoFrame = tmpContext.getImageData(0, 0, videoWidth, videoHeight);

    let keyedFrame = outputContext.getImageData(0, 0, videoWidth, videoHeight);

    for (let i = 0; i < videoFrame.data.length / 4; i++) {
        if (keyedFrame.data[i * 4 + 3] === 255) {
            finalFrame.data[i * 4] = keyedFrame.data[i * 4];
            finalFrame.data[i * 4 + 1] = keyedFrame.data[i * 4 + 1];
            finalFrame.data[i * 4 + 2] = keyedFrame.data[i * 4 + 2];
            finalFrame.data[i * 4 + 3] = keyedFrame.data[i * 4 + 3];
        } else {
            finalFrame.data[i * 4] = videoFrame.data[i * 4];
            finalFrame.data[i * 4 + 1] = videoFrame.data[i * 4 + 1];
            finalFrame.data[i * 4 + 2] = videoFrame.data[i * 4 + 2];
            finalFrame.data[i * 4 + 3] = videoFrame.data[i * 4 + 3];
        }
    }
    thirdContext.putImageData(finalFrame, 0, 0);
    return thirdCanvas.toDataURL();
};

const snap = () => {
    pictureIsLoading = true;
    snapButton.disabled = !snapButton.disabled;
    spinner.style.display = 'block';
    previewBcg.style.display = 'block';
    preview.src = combineVideoAndCanvas();
    pictureIsLoading = false;
    redoButton.disabled = !redoButton.disabled;
    saveButton.disabled = !saveButton.disabled;
    preview.style.display = 'block';
    spinner.style.display = 'none';
};

const redo = () => {
    previewBcg.style.display = 'none';
    snapButton.disabled = !snapButton.disabled;
    preview.style.display = 'none';
    redoButton.disabled = !redoButton.disabled;
    saveButton.disabled = !saveButton.disabled;
};

const save = () => {};

const initControls = () => {
    const rColorInput = document.querySelector('#r-color');
    const gColorInput = document.querySelector('#g-color');
    const bColorInput = document.querySelector('#b-color');
    const rRangeInput = document.querySelector('#r-range');
    const gRangeInput = document.querySelector('#g-range');
    const bRangeInput = document.querySelector('#b-range');
    snapButton = document.querySelector('#snap');
    redoButton = document.querySelector('#redo');
    saveButton = document.querySelector('#save');
    preview = document.getElementById('preview');
    previewBcg = document.getElementById('preview-bcg');
    spinner = document.getElementById('spinner');

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

    snapButton.addEventListener('click', snap);
    redoButton.addEventListener('click', redo);
    saveButton.addEventListener('click', save);

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
    outputCanvas = document.getElementById('output-canvas');
    outputContext = outputCanvas.getContext('2d');
};

const createTmpCanvas = () => {
    tmpCanvas = document.createElement('canvas');
    tmpContext = tmpCanvas.getContext('2d', {
        willReadFrequently: true,
    });
};

const isWithinBackgroundRectangle = (x, y) => {
    return true;
    // return x > 50 && x < 870 && y > 120 && y < 400;
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
        videoWidth = settings.width;
        videoHeight = settings.height;

        clientWidth = window.innerWidth;
        clientHeight = window.innerHeight;

        let factor = 1;
        factor =
            videoWidth <= clientWidth
                ? Number.parseFloat(videoWidth / clientWidth, 100)
                : Number.parseFloat(clientWidth / videoWidth, 100);

        video.width = videoWidth;
        video.height = videoHeight;
        outputCanvas.width = videoWidth;
        outputCanvas.height = videoHeight;
        tmpCanvas.width = videoWidth;
        tmpCanvas.height = videoHeight;
        // preview.style.width = `calc(${videoWidth}px - 2rem})`;
        // preview.style.height = auto;

        video.style.transform = `scale(${factor})`;
        video.style.transformOrigin = '0 0';
        outputCanvas.style.transform = `scale(${factor})`;
        outputCanvas.style.transformOrigin = '0 0';

        const boundingRect = document
            .getElementsByTagName('video')[0]
            .getBoundingClientRect();

        console.log(boundingRect);

        // const uiPadding = `calc(2rem + ${boundingRect.height}px + 2rem)`;
        // document.getElementById('ui').style.marginTop = uiPadding;

        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = backdropWidth;
        imgCanvas.height = backdropHeight;
        const imgContext = imgCanvas.getContext('2d');

        const image = new Image();
        image.src = '../img/yolo-wide.png';
        // image.src = '../img/karton.png';

        let imageData;

        image.onload = () => {
            imgContext.drawImage(image, 0, 0, backdropWidth, backdropHeight);
            imageData = imgContext.getImageData(
                0,
                0,
                backdropWidth,
                backdropHeight
            );
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
            const updateCorners = (minX, minY, maxX, maxY) => {
                topLeftX = minX;
                topLeftY = minY;
                topRightX = maxX;
                topRightY = maxY;
                bottomLeftX = minX;
                bottomLeftY = maxY;
                bottomRightX = maxX;
                bottomRightY = maxY;
            };

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

            let minX = Number.MAX_VALUE,
                minY = Number.MAX_VALUE,
                maxX = 0,
                maxY = 0;

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
                    const cutoffWidth = bottomRightX - topLeftX;
                    const cutoffHeight = bottomRightY - topLeftY;

                    const xPct = (x - topLeftX) / cutoffWidth;
                    const yPct = (y - topLeftY) / cutoffHeight;

                    const xCoordInPicture = Number.parseInt(
                        backdropWidth * xPct,
                        10
                    );
                    const yCoordInPicture = Number.parseInt(
                        backdropHeight * yPct,
                        10
                    );

                    const pictIndex =
                        yCoordInPicture * backdropWidth + xCoordInPicture;

                    frame.data[i * 4 + 0] = imageData.data[pictIndex * 4 + 0];
                    frame.data[i * 4 + 1] = imageData.data[pictIndex * 4 + 1];
                    frame.data[i * 4 + 2] = imageData.data[pictIndex * 4 + 2];
                    frame.data[i * 4 + 3] = imageData.data[pictIndex * 4 + 3];

                    if (y === 260 && x === 507 && !!xPct && !!yPct) {
                        // debugger;
                    }

                    const isMinY = (y, minY) => {
                        let someIsOutOfRange = false;
                        // todo to (re)think?

                        //     for (let index = 0; index < 10; index++) {
                        //         const nuIndex = i + width * 4;

                        //         const nuR = videoFrame.data[nuIndex * 4 + 0];
                        //         const nuG = videoFrame.data[nuIndex * 4 + 1];
                        //         const nuB = videoFrame.data[nuIndex * 4 + 2];

                        //         if (!hasRequiredColor(nuR, nuG, nuB)) {
                        //             someIsOutOfRange = true;
                        //         }
                        //     }

                        return (!y || y < minY) && !someIsOutOfRange;
                    };

                    if (isMinY(y, minY, videoFrame, i)) {
                        minY = y;
                    }
                    if (!x || x < minX) {
                        minX = x;
                    }
                    if (y > maxY) {
                        maxY = y;
                    }
                    if (x > maxX) {
                        maxX = x;
                    }
                }
            }

            updateCorners(minX, minY, maxX, maxY);

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
            // lastFrame = frame;
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
