define([
    './Panorama',
    '../loaders/CubeTextureLoader',
    'skylark-threejs'
], function (Panorama, CubeTextureLoader, THREE) {
    'use strict';
    function CubePanorama(images = []) {
        const edgeLength = 10000;
        const shader = Object.assign({}, THREE.ShaderLib['cube']);
        const geometry = new THREE.BoxBufferGeometry(edgeLength, edgeLength, edgeLength);
        const material = new THREE.ShaderMaterial({
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: shader.uniforms,
            side: THREE.BackSide,
            transparent: true
        });
        Panorama.call(this, geometry, material);
        this.images = images;
        this.edgeLength = edgeLength;
        this.material.uniforms.opacity.value = 0;
    }
    CubePanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: CubePanorama,
        load: function () {
            CubeTextureLoader.load(this.images, this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this));
        },
        onLoad: function (texture) {
            this.material.uniforms['tCube'].value = texture;
            Panorama.prototype.onLoad.call(this);
        },
        dispose: function () {
            const {value} = this.material.uniforms.tCube;
            this.images.forEach(image => {
                THREE.Cache.remove(image);
            });
            if (value instanceof THREE.CubeTexture) {
                value.dispose();
            }
            Panorama.prototype.dispose.call(this);
        }
    });
    return CubePanorama;
});