let rColor, gColor, bColor, rRange, gRange, bRange;

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

runGreenScreen = () => {
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

    logSettings();

    var imageCapture;

    function onGetUserMediaButtonClick() {
        navigator.mediaDevices
            .getUserMedia({
                video: {
                    facingMode: 'environment',
                },
            })
            .then((mediaStream) => {
                document.querySelector('video').srcObject = mediaStream;

                const track = mediaStream.getVideoTracks()[0];
                imageCapture = new ImageCapture(track);
            })
            .catch((error) => ChromeSamples.log(error));
    }

    function onGrabFrameButtonClick() {
        var myImageData = c1.toDataURL();
        console.log(myImageData);
        document.querySelector('img').src = myImageData;
    }

    function onTakePhotoButtonClick() {
        imageCapture
            .takePhoto()
            .then((blob) => createImageBitmap(blob))
            .then((imageBitmap) => {
                const canvas = document.querySelector('#takePhotoCanvas');
                drawCanvas(canvas, imageBitmap);
            })
            .catch((error) => ChromeSamples.log(error));
    }

    function drawCanvas(canvas, img) {
        canvas.width = getComputedStyle(canvas).width.split('px')[0];
        canvas.height = getComputedStyle(canvas).height.split('px')[0];
        let ratio = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
        );
        let x = (canvas.width - img.width * ratio) / 2;
        let y = (canvas.height - img.height * ratio) / 2;
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        canvas
            .getContext('2d')
            .drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                x,
                y,
                img.width * ratio,
                img.height * ratio
            );
    }

    document
        .querySelector('#getUserMediaButton')
        .addEventListener('click', onGetUserMediaButtonClick);
    // document
    //     .querySelector('#grabFrameButton')
    //     .addEventListener('click', onGrabFrameButtonClick);

    document.addEventListener('DOMContentLoaded', () => {
        init();
        video.addEventListener('play', function () {
            document.querySelector('#grabFrameButton').disabled = false;
        });
        video.addEventListener('play', computeFrame);
    });

    let video = document.querySelector('video');

    let video2, c1, ctx1, c_tmp, ctx_tmp, img_gal, imgCanvas, img_data;

    c1 = document.getElementById('output-canvas');
    ctx1 = c1.getContext('2d');

    const topLeftX = 303;
    const topLeftY = 15;
    const topRightX = 458;
    const topRightY = 20;

    const bottomLeftX = 297;
    const bottomLeftY = 223;
    const bottomRightX = 440;
    const bottomRightY = 234;

    function computeFrame() {
        if (video.paused || video.ended) {
            return;
        }
        ctx_tmp.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        let frame = ctx_tmp.getImageData(
            0,
            0,
            video.videoWidth,
            video.videoHeight
        );

        // ctx_tmp.drawImage(video2, 0, 0, video2.videoWidth, video2.videoHeight);
        // let frame2 = ctx_tmp.getImageData(
        //     0,
        //     0,
        //     video2.videoWidth,
        //     video2.videoHeight
        // );

        for (let i = 0; i < frame.data.length / 4; i++) {
            let r = frame.data[i * 4 + 0];
            let g = frame.data[i * 4 + 1];
            let b = frame.data[i * 4 + 2];

            const width = 640;
            const height = 480;
            // const dataLength = width * height * 4;

            const x = Math.floor(i % width);
            // console.log(x)
            // const y = Math.floor(dataLength / i / );
            const y = Math.floor(i / width);
            // debugger

            if (
                hasRequiredColor(r, g, b) &&
                isWithinBackgroundRectangle(x, y)
            ) {
                frame.data[i * 4 + 0] = 32;
                frame.data[i * 4 + 1] = 32;
                frame.data[i * 4 + 2] = 192;
            }
        }
        ctx1.putImageData(frame, 0, 0);
        setTimeout(computeFrame, 0);
    }

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

    function init() {
        video = document.getElementById('video');

        video2 = document.createElement('video');
        video2.src = '../kombucha-compressed.mp4';
        video2.muted = true;
        video2.autoplay = true;

        c1 = document.getElementById('output-canvas');
        ctx1 = c1.getContext('2d');

        c_tmp = document.createElement('canvas');
        c_tmp.setAttribute('width', 640);
        c_tmp.setAttribute('height', 480);
        ctx_tmp = c_tmp.getContext('2d');

        const image = new Image();
        image.src = '../img/here-soon.png';
        image.onload = () => {
            imgCanvas = document.createElement('canvas');
            imgCanvas.width = 640;
            imgCanvas.height = 480;

            var context = imgCanvas.getContext('2d');
            context.drawImage(image, 0, 0);

            img_data = context.getImageData(
                0,
                0,
                imgCanvas.width,
                imgCanvas.height
            );
        };

        video.addEventListener('play', computeFrame);
        // img_gal = document.createElement('img');
        // img_gal.src =
    }
};
