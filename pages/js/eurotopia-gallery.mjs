// https://medium.com/axlewebtech/upload-a-file-in-github-using-github-apis-dbb6f38cc63

let knownImages = [];
let zIndexCounter = 0;

const initGallery = async () => {
    const contents = await fetch(
        `https://api.github.com/repos/galeriearchitektury/gab/contents/docs/img/eurotopia/ar/`,
        {
            method: 'GET',
            headers: {
                Authorization:
                    'token ' +
                    atob(
                        'Z2hwX0RoMFkwNGVRNFdQZkhRSGROTEwyenFCdUdCNmNmYzBGUVh2bQ=='
                    ),
                'Content-Type': 'application/json',
            },
        }
    );
    const json = await contents.json();
    const fetchedImages = json
        // .reverse()
        .map((file) => file.download_url);

    const wrapper = document.getElementById('gallery-wrapper');
    fetchedImages
        .filter((img) => !knownImages.includes(img))
        .forEach((url, index) => {
            const firstChild = wrapper.firstChild;
            zIndexCounter++;
            knownImages.unshift(url);
            const pic = document.createElement('div');
            pic.className = 'pic';
            const rotateRadom = Math.floor(Math.random() * 40) - 20;
            const leftRandom = Number.parseInt(Math.random() * 100, 10);
            const topRandom = Number.parseInt(Math.random() * 50, 10);
            pic.style.left = `calc(calc(${leftRandom}% - 20rem) + 20rem)`;
            pic.style.top = `calc(${topRandom}%)`;
            pic.style.transform = `rotateZ(${rotateRadom}deg)`;
            pic.style.zIndex = zIndexCounter;
            const image = document.createElement('img');
            image.id = url;
            // image.addEventListener('load', (event, url) => {
            //     // console.log(event);
            //     const renderedImage = document.getElementById(url)
            //     const isPortrait = renderedImage
            // });
            image.src = url;
            pic.appendChild(image);
            wrapper.insertBefore(pic, firstChild);
        });
};

window.addEventListener('DOMContentLoaded', async (event) => {
    initGallery();
    setInterval(async () => await initGallery(), 5000);
});
