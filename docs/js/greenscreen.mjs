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
    saveButton,
    arButton,
    nextButton,
    previousButton,
    controlsButton;
let clientWidth, clientHeight, videoWidth, videoHeight;
let outputCanvas,
    outputContext,
    video,
    tmpCanvas,
    tmpContext,
    preview,
    fileToSave,
    image,
    blob,
    fileName,
    base64,
    // previewBcg,
    spinner,
    fullscreen = false,
    pictureIsLoading = false;

// wide
// let backdropWidth = 1700;
// let backdropHeight = 620;
// let backdropWidth = 3200;
// let backdropHeight = 2200;
let backdropWidth = 1600;
let backdropHeight = 1100;

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

function b64toBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
}

const snap = async () => {
    spinner.innerText = 'Zachytávám koláž';
    preview.style.display = 'block';
    outputCanvas.style.display = 'none';
    video.style.display = 'none';
    snapButton.disabled = true;
    redoButton.disabled = false;
    const thirdCanvas = document.createElement('canvas');
    thirdCanvas.width = videoWidth;
    thirdCanvas.height = videoHeight;
    const thirdContext = thirdCanvas.getContext('2d');
    const worker = new Worker('../js/snap-worker.js');

    const finalFrame = thirdContext.getImageData(0, 0, videoWidth, videoHeight);
    let videoFrame = tmpContext.getImageData(0, 0, videoWidth, videoHeight);
    let keyedFrame = outputContext.getImageData(0, 0, videoWidth, videoHeight);

    worker.postMessage([finalFrame, videoFrame, keyedFrame]);

    worker.addEventListener('message', (event) => {
        const processedFrame = event.data;

        thirdContext.putImageData(processedFrame, 0, 0);
        base64 = thirdCanvas.toDataURL();
        preview.src = base64;

        blob = b64toBlob(base64);

        fileName = `${new Date().getTime()}.png`;
        fileToSave = new File([blob], fileName, {
            type: 'image/png',
        });
        saveButton.disabled = false;
        spinner.innerText = '';
    });
};

const redo = () => {
    preview.style.display = 'none';
    video.style.display = 'block';
    outputCanvas.style.display = 'block';
    spinner.innerText = '';
    preview.src = '';
    snapButton.disabled = false;
    redoButton.disabled = true;
    saveButton.disabled = true;
};

const shareASnap = async () => {
    const filesArray = [fileToSave];
    if (navigator.share && navigator.canShare({ files: filesArray })) {
        navigator.share({
            title: 'Koláž z Eurotopie',
            text: 'Posílám koláž vytvořenou v rámci výstava Eurotopia',
            files: filesArray,
        });
    }
};

const saveASnapToGithub = async () => {
    const data = JSON.stringify({
        message: 'snap_file',
        content: base64.replace('data:image/png;base64,', ''),
    });

    fileName = `${new Date().getTime()}.png`;
    spinner.innerText = 'Sdílím s Eurotopií';
    setTimeout(() => {
        spinner.innerText = '';
    }, 5000);
    await fetch(
        `https://api.github.com/repos/galeriearchitektury/gab/contents/docs/img/eurotopia/ar/${fileName}`,
        {
            method: 'PUT',
            headers: {
                Authorization:
                    'token ' +
                    atob(
                        'Z2hwX0RoMFkwNGVRNFdQZkhRSGROTEwyenFCdUdCNmNmYzBGUVh2bQ=='
                    ),
                'Content-Type': 'application/json',
            },
            body: data,
        }
    );

    await fetch(
        `https://api.github.com/repos/galeriearchitektury/gab/contents/pages/img/eurotopia/ar/${fileName}`,
        {
            method: 'PUT',
            headers: {
                Authorization:
                    'token ' +
                    atob(
                        'Z2hwX0RoMFkwNGVRNFdQZkhRSGROTEwyenFCdUdCNmNmYzBGUVh2bQ=='
                    ),
                'Content-Type': 'application/json',
            },
            body: data,
        }
    );
};

const save = () => {
    shareASnap();
    saveASnapToGithub();
};

const toggleAr = () => {
    outputCanvas.style.display === 'block'
        ? (outputCanvas.style.display = 'none')
        : (outputCanvas.style.display = 'block');
};

// const backdropArray = [
//     '../img/eurotopia/backdrops/merkel1.png',
//     '../img/eurotopia/backdrops/ljm2.png',
//     '../img/eurotopia/backdrops/iran.png',
//     '../img/eurotopia/backdrops/merkel2.png',
//     '../img/eurotopia/backdrops/ljm3.png',
//     '../img/eurotopia/backdrops/iran2.png',
//     '../img/eurotopia/backdrops/ljm1.png',
//     '../img/eurotopia/backdrops/hottova.png',
// ];

const backdropArray = [
    '../img/eurotopia/backdrops/merkel1-medium.png',
    '../img/eurotopia/backdrops/max-medium.png',
    '../img/eurotopia/backdrops/greens-medium.png',
    '../img/eurotopia/backdrops/via-5-medium.png',
    '../img/eurotopia/backdrops/ljm2-medium.png',
    '../img/eurotopia/backdrops/iran-medium.png',
    '../img/eurotopia/backdrops/mda-medium.png',
    '../img/eurotopia/backdrops/merkel2-medium.png',
    '../img/eurotopia/backdrops/via-2-medium.png',
    '../img/eurotopia/backdrops/ljm3-medium.png',
    '../img/eurotopia/backdrops/greens-2-medium.png',
    '../img/eurotopia/backdrops/iran2-medium.png',
    '../img/eurotopia/backdrops/ljm1-medium.png',
    '../img/eurotopia/backdrops/hottova-medium.png',
    '../img/eurotopia/backdrops/via-4-medium.png',
];

let backdropIndex = 0;
const next = () => {
    if (backdropIndex === backdropArray.length - 1) {
        backdropIndex = 0;
    } else {
        backdropIndex++;
    }
    image.src = backdropArray[backdropIndex];
    spinner.innerText = 'Načítání obrázku';
};

const previous = () => {
    if (backdropIndex === 0) {
        backdropIndex = backdropArray.length - 1;
    } else {
        backdropIndex--;
    }
    image.src = backdropArray[backdropIndex];
    spinner.innerText = 'Načítání obrázku';
};

const toggleControls = () => {
    controls.style.display === 'flex'
        ? (controls.style.display = 'none')
        : (controls.style.display = 'flex');
};

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
    arButton = document.querySelector('#ar');
    nextButton = document.querySelector('#next');
    previousButton = document.querySelector('#previous');
    controlsButton = document.querySelector('#controlsBtn');
    preview = document.getElementById('preview');
    // previewBcg = document.getElementById('preview-bcg');
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

    snapButton.addEventListener('click', async () => {
        snap();
    });
    redoButton.addEventListener('click', redo);
    saveButton.addEventListener('click', save);
    arButton?.addEventListener('click', toggleAr);
    nextButton.addEventListener('click', next);
    previousButton.addEventListener('click', previous);
    controlsButton?.addEventListener('click', toggleControls);

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
        // console.log(settings);
        videoWidth = Math.min(settings.width, settings.height);
        videoHeight = Math.max(settings.height, settings.width);

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
        preview.width = videoWidth;

        video.style.transform = `scale(${factor})`;
        video.style.transformOrigin = '0 0';
        outputCanvas.style.transform = `scale(${factor})`;
        outputCanvas.style.transformOrigin = '0 0';
        preview.style.transform = `scale(${factor})`;
        preview.style.transformOrigin = '0 0';

        const imgCanvas = document.createElement('canvas');
        imgCanvas.width = backdropWidth;
        imgCanvas.height = backdropHeight;
        const imgContext = imgCanvas.getContext('2d');

        image = new Image();
        image.src = backdropArray[0];

        spinner.innerText = 'Načítání obrázku';
        image.addEventListener('load', () => (spinner.innerText = ''));

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

        // const frameWorker = new Worker('../js/frame-worker.js');

        // frameWorker.addEventListener('message', (event) => {
        //     const { minY, minX, maxY, maxX, frame } = event.data;
        //     // console.log(event);

        // });

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

        const arr = new Uint8ClampedArray(videoHeight * videoWidth * 4);
        let frame = new ImageData(arr, videoWidth);

        const updateCanvas = () => {
            tmpContext.drawImage(video, 0, 0, videoWidth, videoHeight);
            let videoFrame = tmpContext.getImageData(
                0,
                0,
                videoWidth,
                videoHeight
            );

            arr.fill(0, 0, arr.length - 1);

            frame = new ImageData(arr, videoWidth);

            let minX = Number.MAX_VALUE,
                minY = Number.MAX_VALUE,
                maxX = 0,
                maxY = 0;
            const width = videoWidth;

            const cutoffWidth = bottomRightX - topLeftX;
            const cutoffHeight = bottomRightY - topLeftY;

            if (imageData?.data) {
                for (let i = 0; i < videoFrame.data.length / 4; i++) {
                    let r = videoFrame.data[i * 4 + 0];
                    let g = videoFrame.data[i * 4 + 1];
                    let b = videoFrame.data[i * 4 + 2];

                    const x = Math.floor(i % width);
                    const y = Math.floor(i / width);

                    if (
                        hasRequiredColor(r, g, b) &&
                        isWithinBackgroundRectangle(x, y)
                    ) {
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

                        frame.data[i * 4 + 0] =
                            imageData.data[pictIndex * 4 + 0];
                        frame.data[i * 4 + 1] =
                            imageData.data[pictIndex * 4 + 1];
                        frame.data[i * 4 + 2] =
                            imageData.data[pictIndex * 4 + 2];
                        frame.data[i * 4 + 3] =
                            imageData.data[pictIndex * 4 + 3];

                        // if (y === 260 && x === 507 && !!xPct && !!yPct) {
                        //     // debugger;
                        // }

                        if (!y || y < minY) {
                            minY = y;
                        }
                        if (!x || x < minX) {
                            minX = x;
                        }
                        if (x > maxX) {
                            maxX = x;
                        }

                        const backdropRatio = 320 / 220;
                        const width = maxX - minX;

                        if (y > maxY) {
                            maxY = Number.parseInt(
                                width / backdropRatio + minY,
                                10
                            );
                        }
                    }
                }
            }

            updateCorners(minX, minY, maxX, maxY);

            // outputContext.strokeStyle = '#FF0000';
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
