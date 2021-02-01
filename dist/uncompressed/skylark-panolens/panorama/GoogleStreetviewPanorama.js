define([
    './ImagePanorama',
    '../loaders/GoogleStreetviewLoader',
    'skylark-threejs'
], function (ImagePanorama, GoogleStreetviewLoader, THREE) {
    'use strict';
    function GoogleStreetviewPanorama(panoId, apiKey) {
        ImagePanorama.call(this);
        this.panoId = panoId;
        this.gsvLoader = null;
        this.loadRequested = false;
        this.setupGoogleMapAPI(apiKey);
    }
    GoogleStreetviewPanorama.prototype = Object.assign(Object.create(ImagePanorama.prototype), {
        constructor: GoogleStreetviewPanorama,
        load: function (panoId) {
            this.loadRequested = true;
            panoId = panoId || this.panoId || {};
            if (panoId && this.gsvLoader) {
                this.loadGSVLoader(panoId);
            }
        },
        setupGoogleMapAPI: function (apiKey) {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?';
            script.src += apiKey ? 'key=' + apiKey : '';
            script.onreadystatechange = this.setGSVLoader.bind(this);
            script.onload = this.setGSVLoader.bind(this);
            document.querySelector('head').appendChild(script);
        },
        setGSVLoader: function () {
            this.gsvLoader = new GoogleStreetviewLoader();
            if (this.loadRequested) {
                this.load();
            }
        },
        getGSVLoader: function () {
            return this.gsvLoader;
        },
        loadGSVLoader: function (panoId) {
            this.loadRequested = false;
            this.gsvLoader.onProgress = this.onProgress.bind(this);
            this.gsvLoader.onPanoramaLoad = this.onLoad.bind(this);
            this.gsvLoader.setZoom(this.getZoomLevel());
            this.gsvLoader.load(panoId);
            this.gsvLoader.loaded = true;
        },
        onLoad: function (canvas) {
            ImagePanorama.prototype.onLoad.call(this, new THREE.Texture(canvas));
        },
        reset: function () {
            this.gsvLoader = undefined;
            ImagePanorama.prototype.reset.call(this);
        }
    });
    return GoogleStreetviewPanorama;
});