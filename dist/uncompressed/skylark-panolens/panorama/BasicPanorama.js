define([
    './CubePanorama',
    '../DataImage'
], function (CubePanorama, DataImage) {
    'use strict';
    function BasicPanorama() {
        const images = [];
        for (let i = 0; i < 6; i++) {
            images.push(DataImage.WhiteTile);
        }
        CubePanorama.call(this, images);
    }
    BasicPanorama.prototype = Object.assign(Object.create(CubePanorama.prototype), { constructor: BasicPanorama });
    return BasicPanorama;
});