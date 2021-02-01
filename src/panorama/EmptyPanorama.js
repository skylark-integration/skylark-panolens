define([
    './Panorama',
    'skylark-threejs'
], function (Panorama, THREE) {
    'use strict';
    function EmptyPanorama() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshBasicMaterial({
            color: 0,
            opacity: 0,
            transparent: true
        });
        geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(), 1));
        Panorama.call(this, geometry, material);
    }
    EmptyPanorama.prototype = Object.assign(Object.create(Panorama.prototype), { constructor: EmptyPanorama });
    return EmptyPanorama;
});