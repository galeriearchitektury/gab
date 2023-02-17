// to check
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
// https://developer.chrome.com/blog/offscreen-canvas/
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
// https://stackoverflow.com/questions/21197707/html5-video-to-canvas-playing-very-slow
// https://www.mux.com/blog/canvas-adding-filters-and-more-to-video-using-just-a-browser

let rColor, gColor, bColor, rRange, gRange, bRange;
let img_gal, imgCanvas, img_data;
let clientWidth, clientHeight;
let outputCanvas,
    outputContext,
    video,
    imageCapture,
    tmpCanvas,
    tmpContext,
    fullscreen = false;

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

const onGetUserMediaButtonClick = () => {
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: {
                facingMode: 'environment',
                frameRate: {
                    ideal: 20,
                    max: 30,
                },
            },
        })
        .then((mediaStream) => {
            console.log('hiiir');
            // let { width, height } = mediaStream.getTracks()[0].getSettings();
            // console.log(width, height)
            // document.getElementById('videowidth').innerText = width;
            // document.getElementById('videoheight').innerText = height;
            document.querySelector('video').srcObject = mediaStream;
            // const track = mediaStream.getVideoTracks()[0];
            // imageCapture = new ImageCapture(track);
        })
        .catch((error) => ChromeSamples.log(error));
};

const topLeftX = 303;
const topLeftY = 15;
const topRightX = 458;
const topRightY = 20;

const bottomLeftX = 297;
const bottomLeftY = 223;
const bottomRightX = 440;
const bottomRightY = 234;

const isWithinBackgroundRectangle = (x, y) => {
    return true;
    // return (
    //     x > Math.min(topLeftX, bottomLeftX) &&
    //     x < Math.max(topRightX, bottomRightX) &&
    //     y > Math.min(topLeftY, topRightY) &&
    //     y < Math.max(bottomLeftY, bottomRightY)
    // );
};

// rgb(120,80,59)
// rgb(105,66,49)
// rgb(98,51,30)
// rgb(90,48,38)
// rgb(113,66,37)

const hasRequiredColor = (r, g, b) =>
    //  rgb(189, 93, 44);
    // rgb(185,91,44)
    // r > 120 && r < 220 && g > 70 && g < 110 && b > 40 && b < 60;
    // r > 80 && r < 180 && g > 42 && g < 95 && b > 10 && b < 70;
    r > rColor - rRange &&
    r < rColor + rRange &&
    g > gColor - gRange &&
    g < gColor + gRange &&
    b > bColor - bRange &&
    b < bColor + bRange;
// false;

const computeFrame = () => {
    if (video.paused || video.ended) {
        return;
    }
    tmpContext.drawImage(video, 0, 0, clientWidth, clientHeight);
    let frame = tmpContext.getImageData(0, 0, clientWidth, clientHeight);

    for (let i = 0; i < frame.data.length / 4; i++) {
        let r = frame.data[i * 4 + 0];
        let g = frame.data[i * 4 + 1];
        let b = frame.data[i * 4 + 2];

        const width = clientWidth;
        const height = clientHeight;

        const x = Math.floor(i % width);
        const y = Math.floor(i / width);

        if (hasRequiredColor(r, g, b) && isWithinBackgroundRectangle(x, y)) {
            frame.data[i * 4 + 0] = 32;
            frame.data[i * 4 + 1] = 32;
            frame.data[i * 4 + 2] = 192;
        }
    }
    outputContext.putImageData(frame, 0, 0);
    requestAnimationFrame(computeFrame);
};

const init = () => {
    video = document.getElementById('video');
    outputContext = outputCanvas.getContext('2d');
    tmpCanvas.setAttribute('width', clientWidth);
    tmpCanvas.setAttribute('height', clientHeight);
    tmpContext = tmpCanvas.getContext('2d');

    const image = new Image();
    image.src = '../img/here-soon.png';
    image.onload = () => {
        imgCanvas = document.createElement('canvas');
        imgCanvas.width = clientWidth;
        imgCanvas.height = clientHeight;

        var context = imgCanvas.getContext('2d');
        context.drawImage(image, 0, 0);

        img_data = context.getImageData(
            0,
            0,
            imgCanvas.width,
            imgCanvas.height
        );
    };
};

const initEvents = () => {
    function onGrabFrameButtonClick() {
        const myImageData = outputCanvas.toDataURL();
        document.querySelector('img').src = myImageData;
    }

    document
        .querySelector('#getUserMediaButton')
        .addEventListener('click', onGetUserMediaButtonClick);
    document
        .querySelector('#grabFrameButton')
        .addEventListener('click', onGrabFrameButtonClick);

    video.addEventListener('play', function () {
        document.querySelector('#grabFrameButton').disabled = false;
    });
    // video.play()
    video.addEventListener('play', computeFrame);
};

const variantA = () => {
    initControls();
    createTmpCanvas();
    init();
    logSettings();
    initEvents();
};

const variantB = () => {
    initControls();
    createTmpCanvas();
    tmpCanvas.setAttribute('width', clientWidth);
    tmpCanvas.setAttribute('height', clientHeight);
    tmpContext = tmpCanvas.getContext('2d');

    video.width = clientWidth;
    video.height = clientHeight;

    const constraints = {
        audio: false,
        video: {
            facingMode: 'environment',
            frameRate: {
                ideal: 30,
                max: 30,
            },
            width: 1920
        },
    };

    // const drawOnTop = (stream) => {
    //     // let frame = stream.getImageData(0, 0, clientWidth, clientHeight);
    //     // console.log(frame)
    //     // const track = stream.getVideoTracks()[0]
    //     // console.log(track)
    //     outputContext.drawImage(video, clientWidth, clientHeight);
    //     // const pic = outputContext.getImageData();
    // };

    // function handleSuccess(stream) {
    //     video.srcObject = stream;
    //     video.addEventListener('play', () => drawOnTop(stream));
    //     // video.play()
    // }

    function handleError(error) {
        console.log(
            'navigator.MediaDevices.getUserMedia error: ',
            error.message,
            error.name
        );
    }

    // video, outputCanvas, outputContext

    function handleSuccess(stream) {
        video.srcObject = stream;

        console.log('hiiir');
        let { width, height } = stream.getTracks()[0].getSettings();
        console.log(width, height);
        document.getElementById('videowidth').innerText = width;
        document.getElementById('videoheight').innerText = height;

        const updateCanvas = () => {
            console.log('updating');
            // outputContext.drawImage(video, 100, 100, clientWidth, clientHeight);
            tmpContext.drawImage(video, 0, 0, clientWidth, clientHeight);
            let videoFrame = tmpContext.getImageData(
                0,
                0,
                clientWidth,
                clientHeight
            );

            const arr = new Uint8ClampedArray(clientHeight * clientWidth * 4);
            arr.fill(0, 0, arr.length - 1);
            const frame = new ImageData(arr, clientWidth);

            // const data = new Uint8ClampedArray(
            //     clientHeight * clientHeight * 4
            // );
            // const frame = new ImageData(data, clientWidth, clientHeight);

            for (let i = 0; i < videoFrame.data.length / 4; i++) {
                let r = videoFrame.data[i * 4 + 0];
                let g = videoFrame.data[i * 4 + 1];
                let b = videoFrame.data[i * 4 + 2];

                const width = clientHeight;
                const height = clientWidth;

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
            // console.log(frame[3333])
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

    console.log('yo');
};

const runGreenScreen = () => {
    clientWidth = window.innerWidth;
    clientHeight = window.innerHeight;
    // variantA()
    variantB();
};
