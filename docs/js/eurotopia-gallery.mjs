// https://medium.com/axlewebtech/upload-a-file-in-github-using-github-apis-dbb6f38cc63

let knownImages = [];

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
    const fetchedImages = json.map((file) => file.download_url);

    const wrapper = document.getElementById('gallery-wrapper');
    fetchedImages
        .filter((img) => !knownImages.includes(img))
        .forEach((url) => {
            const firstChild = wrapper.firstChild;
            knownImages.unshift(url);
            const image = document.createElement('img');
            image.src = url;
            wrapper.insertBefore(image, firstChild);
        });
};

window.addEventListener('DOMContentLoaded', async (event) => {
    initGallery();
    setInterval(async () => await initGallery(), 10000);
});
