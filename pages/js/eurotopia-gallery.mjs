// https://medium.com/axlewebtech/upload-a-file-in-github-using-github-apis-dbb6f38cc63
const token = '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';

const initGallery = async () => {
    const contents = await fetch(
        `https://api.github.com/repos/galeriearchitektury/gab/contents/docs/img/eurotopia/ar/`,
        {
            method: 'GET',
            headers: {
                Authorization: `token ${token}`,
                'Content-Type': 'application/json',
            },
        }
    );
    const json = await contents.json();
    const urls = json
        .sort((a, b) => a.name - b.name)
        .map((file) => file.download_url);

    const wrapper = document.getElementById('gallery-wrapper');
    urls.forEach((url) => {
        const image = document.createElement('img');
        image.src = url;
        wrapper.appendChild(image);
    });
};

window.addEventListener('DOMContentLoaded', (event) => {
    initGallery();
});
