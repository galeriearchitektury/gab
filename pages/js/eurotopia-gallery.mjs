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
