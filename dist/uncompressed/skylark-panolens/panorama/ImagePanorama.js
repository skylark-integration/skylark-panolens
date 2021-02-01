define([
    './Panorama',
    '../loaders/TextureLoader',
    'skylark-threejs'
], function (Panorama, TextureLoader, THREE) {
    'use strict';
    function ImagePanorama(image, _geometry, _material) {
        const radius = 5000;
        const geometry = _geometry || new THREE.SphereBufferGeometry(radius, 60, 40);
        const material = _material || new THREE.MeshBasicMaterial({
            opacity: 0,
            transparent: true
        });
        Panorama.call(this, geometry, material);
        this.src = image;
        this.radius = radius;
    }
    ImagePanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: ImagePanorama,
        load: function (src) {
            src = src || this.src;
            if (!src) {
                console.warn('Image source undefined');
                return;
            } else if (typeof src === 'string') {
                TextureLoader.load(src, this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this));
            } else if (src instanceof HTMLImageElement) {
                this.onLoad(new THREE.Texture(src));
            }
        },
        onLoad: function (texture) {
            texture.minFilter = texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            this.updateTexture(texture);
            window.requestAnimationFrame(Panorama.prototype.onLoad.bind(this));
        },
        reset: function () {
            Panorama.prototype.reset.call(this);
        },
        dispose: function () {
            const {
                material: {map}
            } = this;
            THREE.Cache.remove(this.src);
            if (map) {
                map.dispose();
            }
            Panorama.prototype.dispose.call(this);
        }
    });
    return ImagePanorama;
});