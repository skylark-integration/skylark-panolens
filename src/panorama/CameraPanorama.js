define([
    './Panorama',
    '../media/Media',
    'skylark-threejs'
], function (Panorama, Media, THREE) {
    'use strict';
    function CameraPanorama(constraints) {
        const radius = 5000;
        const geometry = new THREE.SphereBufferGeometry(radius, 60, 40);
        const material = new THREE.MeshBasicMaterial({ visible: false });
        Panorama.call(this, geometry, material);
        this.media = new Media(constraints);
        this.radius = radius;
        this.addEventListener('enter', this.start.bind(this));
        this.addEventListener('leave', this.stop.bind(this));
        this.addEventListener('panolens-container', this.onPanolensContainer.bind(this));
        this.addEventListener('panolens-scene', this.onPanolensScene.bind(this));
    }
    CameraPanorama.prototype = Object.assign(Object.create(Panorama.prototype), {
        constructor: CameraPanorama,
        onPanolensContainer: function ({container}) {
            this.media.setContainer(container);
        },
        onPanolensScene: function ({scene}) {
            this.media.setScene(scene);
        },
        start: function () {
            return this.media.start();
        },
        stop: function () {
            this.media.stop();
        }
    });
    return CameraPanorama;
});