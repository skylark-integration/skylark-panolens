define([
    './ImageLoader',
    'skylark-threejs'
], function (ImageLoader, THREE) {
    'use strict';
    const TextureLoader = {
        load: function (url, onLoad = () => {
        }, onProgress, onError) {
            var texture = new THREE.Texture();
            ImageLoader.load(url, function (image) {
                texture.image = image;
                const isJPEG = url.search(/\.(jpg|jpeg)$/) > 0 || url.search(/^data\:image\/jpeg/) === 0;
                texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
                texture.needsUpdate = true;
                onLoad(texture);
            }, onProgress, onError);
            return texture;
        }
    };
    return TextureLoader;
});