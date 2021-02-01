define([
    '../infospot/Infospot',
    '../DataImage',
    'skylark-threejs',
    'skylark-tweenjs'
], function (Infospot, DataImage, THREE, TWEEN) {
    'use strict';
    function Panorama(geometry, material) {
        THREE.Mesh.call(this, geometry, material);
        this.type = 'panorama';
        this.ImageQualityLow = 1;
        this.ImageQualityFair = 2;
        this.ImageQualityMedium = 3;
        this.ImageQualityHigh = 4;
        this.ImageQualitySuperHigh = 5;
        this.animationDuration = 1000;
        this.defaultInfospotSize = 350;
        this.container = undefined;
        this.loaded = false;
        this.linkedSpots = [];
        this.isInfospotVisible = false;
        this.linkingImageURL = undefined;
        this.linkingImageScale = undefined;
        this.material.side = THREE.BackSide;
        this.material.opacity = 0;
        this.scale.x *= -1;
        this.renderOrder = -1;
        this.active = false;
        this.infospotAnimation = new TWEEN.Tween(this).to({}, this.animationDuration / 2);
        this.addEventListener('load', this.fadeIn.bind(this));
        this.addEventListener('panolens-container', this.setContainer.bind(this));
        this.addEventListener('click', this.onClick.bind(this));
        this.setupTransitions();
    }
    Panorama.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
        constructor: Panorama,
        add: function (object) {
            let invertedObject;
            if (arguments.length > 1) {
                for (var i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            if (object instanceof Infospot) {
                invertedObject = object;
                if (object.dispatchEvent) {
                    const {container} = this;
                    if (container) {
                        object.dispatchEvent({
                            type: 'panolens-container',
                            container
                        });
                    }
                    object.dispatchEvent({
                        type: 'panolens-infospot-focus',
                        method: function (vector, duration, easing) {
                            this.dispatchEvent({
                                type: 'panolens-viewer-handler',
                                method: 'tweenControlCenter',
                                data: [
                                    vector,
                                    duration,
                                    easing
                                ]
                            });
                        }.bind(this)
                    });
                }
            } else {
                invertedObject = new THREE.Object3D();
                invertedObject.scale.x = -1;
                invertedObject.scalePlaceHolder = true;
                invertedObject.add(object);
            }
            THREE.Object3D.prototype.add.call(this, invertedObject);
        },
        load: function () {
            this.onLoad();
        },
        onClick: function (event) {
            if (event.intersects && event.intersects.length === 0) {
                this.traverse(function (object) {
                    object.dispatchEvent({ type: 'dismiss' });
                });
            }
        },
        setContainer: function (data) {
            let container;
            if (data instanceof HTMLElement) {
                container = data;
            } else if (data && data.container) {
                container = data.container;
            }
            if (container) {
                this.children.forEach(function (child) {
                    if (child instanceof Infospot && child.dispatchEvent) {
                        child.dispatchEvent({
                            type: 'panolens-container',
                            container: container
                        });
                    }
                });
                this.container = container;
            }
        },
        onLoad: function () {
            this.loaded = true;
            this.dispatchEvent({ type: 'load' });
        },
        onProgress: function (progress) {
            this.dispatchEvent({
                type: 'progress',
                progress: progress
            });
        },
        onError: function () {
            this.dispatchEvent({ type: 'error' });
        },
        getZoomLevel: function () {
            let zoomLevel;
            if (window.innerWidth <= 800) {
                zoomLevel = this.ImageQualityFair;
            } else if (window.innerWidth > 800 && window.innerWidth <= 1280) {
                zoomLevel = this.ImageQualityMedium;
            } else if (window.innerWidth > 1280 && window.innerWidth <= 1920) {
                zoomLevel = this.ImageQualityHigh;
            } else if (window.innerWidth > 1920) {
                zoomLevel = this.ImageQualitySuperHigh;
            } else {
                zoomLevel = this.ImageQualityLow;
            }
            return zoomLevel;
        },
        updateTexture: function (texture) {
            this.material.map = texture;
            this.material.needsUpdate = true;
        },
        toggleInfospotVisibility: function (isVisible, delay) {
            delay = delay !== undefined ? delay : 0;
            const visible = isVisible !== undefined ? isVisible : this.isInfospotVisible ? false : true;
            this.traverse(function (object) {
                if (object instanceof Infospot) {
                    if (visible) {
                        object.show(delay);
                    } else {
                        object.hide(delay);
                    }
                }
            });
            this.isInfospotVisible = visible;
            this.infospotAnimation.onComplete(function () {
                this.dispatchEvent({
                    type: 'infospot-animation-complete',
                    visible: visible
                });
            }.bind(this)).delay(delay).start();
        },
        setLinkingImage: function (url, scale) {
            this.linkingImageURL = url;
            this.linkingImageScale = scale;
        },
        link: function (pano, position, imageScale, imageSrc) {
            let scale, img;
            this.visible = true;
            if (!position) {
                console.warn('Please specify infospot position for linking');
                return;
            }
            if (imageScale !== undefined) {
                scale = imageScale;
            } else if (pano.linkingImageScale !== undefined) {
                scale = pano.linkingImageScale;
            } else {
                scale = 300;
            }
            if (imageSrc) {
                img = imageSrc;
            } else if (pano.linkingImageURL) {
                img = pano.linkingImageURL;
            } else {
                img = DataImage.Arrow;
            }
            const spot = new Infospot(scale, img);
            spot.position.copy(position);
            spot.toPanorama = pano;
            spot.addEventListener('click', function () {
                this.dispatchEvent({
                    type: 'panolens-viewer-handler',
                    method: 'setPanorama',
                    data: pano
                });
            }.bind(this));
            this.linkedSpots.push(spot);
            this.add(spot);
            this.visible = false;
        },
        reset: function () {
            this.children.length = 0;
        },
        setupTransitions: function () {
            this.fadeInAnimation = new TWEEN.Tween(this.material).easing(TWEEN.Easing.Quartic.Out).onStart(function () {
                this.visible = true;
                this.dispatchEvent({ type: 'enter-fade-start' });
            }.bind(this));
            this.fadeOutAnimation = new TWEEN.Tween(this.material).easing(TWEEN.Easing.Quartic.Out).onComplete(function () {
                this.visible = false;
                this.dispatchEvent({ type: 'leave-complete' });
            }.bind(this));
            this.enterTransition = new TWEEN.Tween(this).easing(TWEEN.Easing.Quartic.Out).onComplete(function () {
                this.dispatchEvent({ type: 'enter-complete' });
            }.bind(this)).start();
            this.leaveTransition = new TWEEN.Tween(this).easing(TWEEN.Easing.Quartic.Out);
        },
        onFadeAnimationUpdate: function () {
            const alpha = this.material.opacity;
            const {uniforms} = this.material;
            if (uniforms && uniforms.opacity) {
                uniforms.opacity.value = alpha;
            }
        },
        fadeIn: function (duration) {
            duration = duration >= 0 ? duration : this.animationDuration;
            this.fadeOutAnimation.stop();
            this.fadeInAnimation.to({ opacity: 1 }, duration).onUpdate(this.onFadeAnimationUpdate.bind(this)).onComplete(function () {
                this.toggleInfospotVisibility(true, duration / 2);
                this.dispatchEvent({ type: 'enter-fade-complete' });
            }.bind(this)).start();
        },
        fadeOut: function (duration) {
            duration = duration >= 0 ? duration : this.animationDuration;
            this.fadeInAnimation.stop();
            this.fadeOutAnimation.to({ opacity: 0 }, duration).onUpdate(this.onFadeAnimationUpdate.bind(this)).start();
        },
        onEnter: function () {
            const duration = this.animationDuration;
            this.leaveTransition.stop();
            this.enterTransition.to({}, duration).onStart(function () {
                this.dispatchEvent({ type: 'enter-start' });
                if (this.loaded) {
                    this.fadeIn(duration);
                } else {
                    this.load();
                }
            }.bind(this)).start();
            this.dispatchEvent({ type: 'enter' });
            this.children.forEach(child => {
                child.dispatchEvent({ type: 'panorama-enter' });
            });
            this.active = true;
        },
        onLeave: function () {
            const duration = this.animationDuration;
            this.enterTransition.stop();
            this.leaveTransition.to({}, duration).onStart(function () {
                this.dispatchEvent({ type: 'leave-start' });
                this.fadeOut(duration);
                this.toggleInfospotVisibility(false);
            }.bind(this)).start();
            this.dispatchEvent({ type: 'leave' });
            this.children.forEach(child => {
                child.dispatchEvent({ type: 'panorama-leave' });
            });
            this.active = false;
        },
        dispose: function () {
            this.infospotAnimation.stop();
            this.fadeInAnimation.stop();
            this.fadeOutAnimation.stop();
            this.enterTransition.stop();
            this.leaveTransition.stop();
            this.dispatchEvent({
                type: 'panolens-viewer-handler',
                method: 'onPanoramaDispose',
                data: this
            });
            function recursiveDispose(object) {
                const {geometry, material} = object;
                for (var i = object.children.length - 1; i >= 0; i--) {
                    recursiveDispose(object.children[i]);
                    object.remove(object.children[i]);
                }
                if (object instanceof Infospot) {
                    object.dispose();
                }
                if (geometry) {
                    geometry.dispose();
                    object.geometry = null;
                }
                if (material) {
                    material.dispose();
                    object.material = null;
                }
            }
            recursiveDispose(this);
            if (this.parent) {
                this.parent.remove(this);
            }
        }
    });
    return Panorama;
});