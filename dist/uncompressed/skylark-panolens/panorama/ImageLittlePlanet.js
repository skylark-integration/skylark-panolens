define([
    './LittlePlanet',
    'skylark-threejs'
], function (LittlePlanet, THREE) {
    'use strict';
    function ImageLittlePlanet(source, size, ratio) {
        LittlePlanet.call(this, 'image', source, size, ratio);
    }
    ImageLittlePlanet.prototype = Object.assign(Object.create(LittlePlanet.prototype), {
        constructor: ImageLittlePlanet,
        onLoad: function (texture) {
            this.updateTexture(texture);
            LittlePlanet.prototype.onLoad.call(this, texture);
        },
        updateTexture: function (texture) {
            texture.minFilter = texture.magFilter = THREE.LinearFilter;
            this.material.uniforms['tDiffuse'].value = texture;
        },
        dispose: function () {
            const tDiffuse = this.material.uniforms['tDiffuse'];
            if (tDiffuse && tDiffuse.value) {
                tDiffuse.value.dispose();
            }
            LittlePlanet.prototype.dispose.call(this);
        }
    });
    return ImageLittlePlanet;
});