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

const createTmpCanvas = () => {
    tmpCanvas = document.createElement('canvas');
};

const init = () => {
    video = document.getElementById('video');
    outputContext = outputCanvas.getContext('2d');
    tmpCanvas.setAttribute('width', clientWidth);
    tmpCanvas.setAttribute('height', clientHeight);
    tmpContext = tmpCanvas.getContext('2d');

    const image = new Image();
    // image.src = '../img/here-soon.png';
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

const logSettings = () => {
    console.log(rColor, gColor, bColor);
    console.log(rRange, gRange, bRange);
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

export const variantA = () => {
    clientWidth = window.innerWidth;
    clientHeight = window.innerHeight;
    initControls();
    createTmpCanvas();
    init();
    logSettings();
    initEvents();
};
