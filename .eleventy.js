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
    let markdownLib = markdownIt(options).use(markdownItAttrs);
    eleventyConfig.setLibrary('md', markdownLib);
    const pluginPWA = require('eleventy-plugin-pwa');
    eleventyConfig.addPlugin(pluginPWA);
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
            'css', // css is not yet a recognized template extension in Eleventy
        ],
        dir: {
            input: 'pages',
            output: 'docs',
        },
    };
};
