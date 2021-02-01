define([
    './ImageLoader',
    'skylark-threejs'
], function (ImageLoader, THREE) {
    'use strict';
    const CubeTextureLoader = {
        load: function (urls, onLoad = () => {
        }, onProgress = () => {
        }, onError) {
            var texture, loaded, progress, all, loadings;
            texture = new THREE.CubeTexture([]);
            loaded = 0;
            progress = {};
            all = {};
            urls.map(function (url, index) {
                ImageLoader.load(url, function (image) {
                    texture.images[index] = image;
                    loaded++;
                    if (loaded === 6) {
                        texture.needsUpdate = true;
                        onLoad(texture);
                    }
                }, function (event) {
                    progress[index] = {
                        loaded: event.loaded,
                        total: event.total
                    };
                    all.loaded = 0;
                    all.total = 0;
                    loadings = 0;
                    for (var i in progress) {
                        loadings++;
                        all.loaded += progress[i].loaded;
                        all.total += progress[i].total;
                    }
                    if (loadings < 6) {
                        all.total = all.total / loadings * 6;
                    }
                    onProgress(all);
                }, onError);
            });
            return texture;
        }
    };
    return CubeTextureLoader;
});