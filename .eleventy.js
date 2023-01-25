module.exports = function (eleventyConfig) {
    eleventyConfig.addWatchTarget('./pages');
    eleventyConfig.browserSyncConfig = {
        https: true,
    };
    const markdownIt = require('markdown-it');
    const markdownItAttrs = require('markdown-it-attrs');
    let options = {
        html: true,
        breaks: true,
        linkify: true,
    };
    let markdownLib = markdownIt(options)
        .use(markdownItAttrs)
        // TODO modify so that I can link between notes and make it
        // a obsidian / eleventy plugin
        .use(function (md) {
            // Recognize Mediawiki links ([[text]])
            md.linkify.add('[[', {
                validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
                normalize: (match) => {
                    const parts = match.raw.slice(2, -2).split('|');
                    parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, '');
                    match.text = (parts[1] || parts[0]).trim();
                    match.url = `/notes/${parts[0].trim()}/`;
                },
            });
        });
    eleventyConfig.setLibrary('md', markdownLib);
    // const pluginPWA = require('eleventy-plugin-pwa');
    // eleventyConfig.addPlugin(pluginPWA);
    return {
        templateFormats: [
            'md',
            'jpg',
            'png',
            'mp4',
            'pdf',
            'ico',
            'json',
            'html',
            'patt',
            'css', // css is not yet a recognized template extension in Eleventy
        ],
        dir: {
            input: 'pages',
            output: 'docs',
        },
    };
};
