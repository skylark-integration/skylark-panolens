define([
    './panolens',
    './Constants',
    './lib/controls/OrbitControls',
    './lib/controls/DeviceOrientationControls',
    './lib/effects/CardboardEffect',
    './lib/effects/StereoEffect',
    './widget/Widget',
    './interface/Reticle',
    './infospot/Infospot',
    './DataImage',
    './panorama/Panorama',
    './panorama/VideoPanorama',
    './panorama/CameraPanorama',
    'skylark-threejs',
    'skylark-tweenjs'
], function (panolens,Constants, OrbitControls, DeviceOrientationControls, CardboardEffect, StereoEffect, Widget, Reticle, Infospot, DataImage, Panorama, VideoPanorama, CameraPanorama, THREE, TWEEN) {
    'use strict';
    function Viewer(options) {
        let container;
        options = options || {};
        options.controlBar = options.controlBar !== undefined ? options.controlBar : true;
        options.controlButtons = options.controlButtons || [
            'fullscreen',
            'setting',
            'video'
        ];
        options.autoHideControlBar = options.autoHideControlBar !== undefined ? options.autoHideControlBar : false;
        options.autoHideInfospot = options.autoHideInfospot !== undefined ? options.autoHideInfospot : true;
        options.horizontalView = options.horizontalView !== undefined ? options.horizontalView : false;
        options.clickTolerance = options.clickTolerance || 10;
        options.cameraFov = options.cameraFov || 60;
        options.reverseDragging = options.reverseDragging || false;
        options.enableReticle = options.enableReticle || false;
        options.dwellTime = options.dwellTime || 1500;
        options.autoReticleSelect = options.autoReticleSelect !== undefined ? options.autoReticleSelect : true;
        options.viewIndicator = options.viewIndicator !== undefined ? options.viewIndicator : false;
        options.indicatorSize = options.indicatorSize || 30;
        options.output = options.output ? options.output : 'none';
        options.autoRotate = options.autoRotate || false;
        options.autoRotateSpeed = options.autoRotateSpeed || 2;
        options.autoRotateActivationDuration = options.autoRotateActivationDuration || 5000;
        this.options = options;
        if (options.container) {
            container = options.container;
            container._width = container.clientWidth;
            container._height = container.clientHeight;
        } else {
            container = document.createElement('div');
            container.classList.add('panolens-container');
            container.style.width = '100%';
            container.style.height = '100%';
            container._width = window.innerWidth;
            container._height = window.innerHeight;
            document.body.appendChild(container);
        }
        this.container = container;
        this.camera = options.camera || new THREE.PerspectiveCamera(this.options.cameraFov, this.container.clientWidth / this.container.clientHeight, 1, 10000);
        this.scene = options.scene || new THREE.Scene();
        this.renderer = options.renderer || new THREE.WebGLRenderer({
            alpha: true,
            antialias: false
        });
        this.sceneReticle = new THREE.Scene();
        this.viewIndicatorSize = this.options.indicatorSize;
        this.reticle = {};
        this.tempEnableReticle = this.options.enableReticle;
        this.mode = Constants.MODES.NORMAL;
        this.panorama = null;
        this.widget = null;
        this.hoverObject = null;
        this.infospot = null;
        this.pressEntityObject = null;
        this.pressObject = null;
        this.raycaster = new THREE.Raycaster();
        this.raycasterPoint = new THREE.Vector2();
        this.userMouse = new THREE.Vector2();
        this.updateCallbacks = [];
        this.requestAnimationId = null;
        this.cameraFrustum = new THREE.Frustum();
        this.cameraViewProjectionMatrix = new THREE.Matrix4();
        this.autoRotateRequestId = null;
        this.outputDivElement = null;
        this.touchSupported = 'ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch;
        this.HANDLER_MOUSE_DOWN = this.onMouseDown.bind(this);
        this.HANDLER_MOUSE_UP = this.onMouseUp.bind(this);
        this.HANDLER_MOUSE_MOVE = this.onMouseMove.bind(this);
        this.HANDLER_WINDOW_RESIZE = this.onWindowResize.bind(this);
        this.HANDLER_KEY_DOWN = this.onKeyDown.bind(this);
        this.HANDLER_KEY_UP = this.onKeyUp.bind(this);
        this.HANDLER_TAP = this.onTap.bind(this, {
            clientX: this.container.clientWidth / 2,
            clientY: this.container.clientHeight / 2
        });
        this.OUTPUT_INFOSPOT = false;
        this.tweenLeftAnimation = new TWEEN.Tween();
        this.tweenUpAnimation = new TWEEN.Tween();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0, 0);
        this.renderer.autoClear = false;
        this.renderer.domElement.classList.add('panolens-canvas');
        this.renderer.domElement.style.display = 'block';
        this.container.style.backgroundColor = '#000';
        this.container.appendChild(this.renderer.domElement);
        this.orbitControls = new OrbitControls(this.camera, this.container);
        this.orbitControls.id = 'orbit';
        this.orbitControls.minDistance = 1;
        this.orbitControls.noPan = true;
        this.orbitControls.autoRotate = this.options.autoRotate;
        this.orbitControls.autoRotateSpeed = this.options.autoRotateSpeed;
        this.deviceOrientationControls = new DeviceOrientationControls(this.camera, this.container);
        this.deviceOrientationControls.id = 'device-orientation';
        this.deviceOrientationControls.enabled = false;
        this.camera.position.z = 1;
        if (this.options.passiveRendering) {
            console.warn('passiveRendering is now deprecated');
        }
        this.controls = [
            this.orbitControls,
            this.deviceOrientationControls
        ];
        this.control = this.orbitControls;
        this.cardboardEffect = new CardboardEffect(this.renderer);
        this.cardboardEffect.setSize(this.container.clientWidth, this.container.clientHeight);
        this.stereoEffect = new StereoEffect(this.renderer);
        this.stereoEffect.setSize(this.container.clientWidth, this.container.clientHeight);
        this.effect = this.cardboardEffect;
        this.addReticle();
        if (this.options.horizontalView) {
            this.orbitControls.minPolarAngle = Math.PI / 2;
            this.orbitControls.maxPolarAngle = Math.PI / 2;
        }
        if (this.options.controlBar !== false) {
            this.addDefaultControlBar(this.options.controlButtons);
        }
        if (this.options.viewIndicator) {
            this.addViewIndicator();
        }
        if (this.options.reverseDragging) {
            this.reverseDraggingDirection();
        }
        if (this.options.enableReticle) {
            this.enableReticleControl();
        } else {
            this.registerMouseAndTouchEvents();
        }
        if (this.options.output === 'overlay') {
            this.addOutputElement();
        }
        this.registerEventListeners();
        this.animate.call(this);
    }
    ;
    Viewer.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), {
        constructor: Viewer,
        add: function (object) {
            if (arguments.length > 1) {
                for (let i = 0; i < arguments.length; i++) {
                    this.add(arguments[i]);
                }
                return this;
            }
            this.scene.add(object);
            if (object.addEventListener) {
                object.addEventListener('panolens-viewer-handler', this.eventHandler.bind(this));
            }
            if (object instanceof Panorama && object.dispatchEvent) {
                object.dispatchEvent({
                    type: 'panolens-container',
                    container: this.container
                });
            }
            if (object instanceof CameraPanorama) {
                object.dispatchEvent({
                    type: 'panolens-scene',
                    scene: this.scene
                });
            }
            if (object.type === 'panorama') {
                this.addPanoramaEventListener(object);
                if (!this.panorama) {
                    this.setPanorama(object);
                }
            }
        },
        remove: function (object) {
            if (object.removeEventListener) {
                object.removeEventListener('panolens-viewer-handler', this.eventHandler.bind(this));
            }
            this.scene.remove(object);
        },
        addDefaultControlBar: function (array) {
            if (this.widget) {
                console.warn('Default control bar exists');
                return;
            }
            const widget = new Widget(this.container);
            widget.addEventListener('panolens-viewer-handler', this.eventHandler.bind(this));
            widget.addControlBar();
            array.forEach(buttonName => {
                widget.addControlButton(buttonName);
            });
            this.widget = widget;
        },
        setPanorama: function (pano) {
            const leavingPanorama = this.panorama;
            if (pano.type === 'panorama' && leavingPanorama !== pano) {
                this.hideInfospot();
                const afterEnterComplete = function () {
                    if (leavingPanorama) {
                        leavingPanorama.onLeave();
                    }
                    pano.removeEventListener('enter-fade-start', afterEnterComplete);
                };
                pano.addEventListener('enter-fade-start', afterEnterComplete);
                (this.panorama = pano).onEnter();
            }
        },
        eventHandler: function (event) {
            if (event.method && this[event.method]) {
                this[event.method](event.data);
            }
        },
        dispatchEventToChildren: function (event) {
            this.scene.traverse(function (object) {
                if (object.dispatchEvent) {
                    object.dispatchEvent(event);
                }
            });
        },
        activateWidgetItem: function (controlIndex, mode) {
            const mainMenu = this.widget.mainMenu;
            const ControlMenuItem = mainMenu.children[0];
            const ModeMenuItem = mainMenu.children[1];
            let item;
            if (controlIndex !== undefined) {
                switch (controlIndex) {
                case 0:
                    item = ControlMenuItem.subMenu.children[1];
                    break;
                case 1:
                    item = ControlMenuItem.subMenu.children[2];
                    break;
                default:
                    item = ControlMenuItem.subMenu.children[1];
                    break;
                }
                ControlMenuItem.subMenu.setActiveItem(item);
                ControlMenuItem.setSelectionTitle(item.textContent);
            }
            if (mode !== undefined) {
                switch (mode) {
                case Constants.MODES.CARDBOARD:
                    item = ModeMenuItem.subMenu.children[2];
                    break;
                case Constants.MODES.STEREO:
                    item = ModeMenuItem.subMenu.children[3];
                    break;
                default:
                    item = ModeMenuItem.subMenu.children[1];
                    break;
                }
                ModeMenuItem.subMenu.setActiveItem(item);
                ModeMenuItem.setSelectionTitle(item.textContent);
            }
        },
        enableEffect: function (mode) {
            if (this.mode === mode) {
                return;
            }
            if (mode === Constants.MODES.NORMAL) {
                this.disableEffect();
                return;
            } else {
                this.mode = mode;
            }
            const fov = this.camera.fov;
            switch (mode) {
            case Constants.MODES.CARDBOARD:
                this.effect = this.undefined;
                this.enableReticleControl();
                break;
            case Constants.MODES.STEREO:
                this.effect = this.undefined;
                this.enableReticleControl();
                break;
            default:
                this.effect = null;
                this.disableReticleControl();
                break;
            }
            this.activateWidgetItem(undefined, this.mode);
            this.dispatchEventToChildren({
                type: 'panolens-dual-eye-effect',
                mode: this.mode
            });
            this.camera.fov = fov + 0.01;
            this.effect.setSize(this.container.clientWidth, this.container.clientHeight);
            this.render();
            this.camera.fov = fov;
            this.dispatchEvent({
                type: 'mode-change',
                mode: this.mode
            });
        },
        disableEffect: function () {
            if (this.mode === Constants.MODES.NORMAL) {
                return;
            }
            this.mode = Constants.MODES.NORMAL;
            this.disableReticleControl();
            this.activateWidgetItem(undefined, this.mode);
            this.dispatchEventToChildren({
                type: 'panolens-dual-eye-effect',
                mode: this.mode
            });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.render();
            this.dispatchEvent({
                type: 'mode-change',
                mode: this.mode
            });
        },
        enableReticleControl: function () {
            if (this.reticle.visible) {
                return;
            }
            this.tempEnableReticle = true;
            this.unregisterMouseAndTouchEvents();
            this.reticle.show();
            this.registerReticleEvent();
            this.updateReticleEvent();
        },
        disableReticleControl: function () {
            this.tempEnableReticle = false;
            if (!this.options.enableReticle) {
                this.reticle.hide();
                this.unregisterReticleEvent();
                this.registerMouseAndTouchEvents();
            } else {
                this.updateReticleEvent();
            }
        },
        enableAutoRate: function () {
            this.options.autoRotate = true;
            this.undefined.autoRotate = true;
        },
        disableAutoRate: function () {
            clearTimeout(this.autoRotateRequestId);
            this.options.autoRotate = false;
            this.undefined.autoRotate = false;
        },
        toggleVideoPlay: function (pause) {
            if (this.panorama instanceof VideoPanorama) {
                this.panorama.dispatchEvent({
                    type: 'video-toggle',
                    pause: pause
                });
            }
        },
        setVideoCurrentTime: function (percentage) {
            if (this.panorama instanceof VideoPanorama) {
                this.panorama.dispatchEvent({
                    type: 'video-time',
                    percentage: percentage
                });
            }
        },
        onVideoUpdate: function (percentage) {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({
                    type: 'video-update',
                    percentage: percentage
                });
            }
        },
        addUpdateCallback: function (fn) {
            if (fn) {
                this.updateCallbacks.push(fn);
            }
        },
        removeUpdateCallback: function (fn) {
            const index = this.updateCallbacks.indexOf(fn);
            if (fn && index >= 0) {
                this.updateCallbacks.splice(index, 1);
            }
        },
        showVideoWidget: function () {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({ type: 'video-control-show' });
            }
        },
        hideVideoWidget: function () {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({ type: 'video-control-hide' });
            }
        },
        updateVideoPlayButton: function (paused) {
            const {widget} = this;
            if (widget && widget.videoElement && widget.videoElement.controlButton) {
                widget.videoElement.controlButton.update(paused);
            }
        },
        addPanoramaEventListener: function (pano) {
            pano.addEventListener('enter-fade-start', this.setCameraControl.bind(this));
            if (pano instanceof VideoPanorama) {
                pano.addEventListener('enter-fade-start', this.showVideoWidget.bind(this));
                pano.addEventListener('leave', function () {
                    if (!(this.panorama instanceof VideoPanorama)) {
                        this.hideVideoWidget.call(this);
                    }
                }.bind(this));
            }
        },
        setCameraControl: function () {
            this.undefined.target.copy(this.panorama.position);
        },
        getControl: function () {
            return this.control;
        },
        getScene: function () {
            return this.scene;
        },
        getCamera: function () {
            return this.camera;
        },
        getRenderer: function () {
            return this.renderer;
        },
        getContainer: function () {
            return this.container;
        },
        getControlId: function () {
            return this.control.id;
        },
        getNextControlId: function () {
            return this.controls[this.getNextControlIndex()].id;
        },
        getNextControlIndex: function () {
            const controls = this.controls;
            const control = this.control;
            const nextIndex = controls.indexOf(control) + 1;
            return nextIndex >= controls.length ? 0 : nextIndex;
        },
        setCameraFov: function (fov) {
            this.camera.fov = fov;
            this.camera.updateProjectionMatrix();
        },
        enableControl: function (index) {
            index = index >= 0 && index < this.controls.length ? index : 0;
            this.control.enabled = false;
            this.control = this.controls[index];
            this.control.enabled = true;
            switch (index) {
            case Constants.CONTROLS.ORBIT:
                this.camera.position.copy(this.panorama.position);
                this.camera.position.z += 1;
                break;
            case Constants.CONTROLS.DEVICEORIENTATION:
                this.camera.position.copy(this.panorama.position);
                break;
            default:
                break;
            }
            this.control.update();
            this.activateWidgetItem(index, undefined);
        },
        disableControl: function () {
            this.control.enabled = false;
        },
        toggleNextControl: function () {
            this.enableControl(this.getNextControlIndex());
        },
        getScreenVector: function (worldVector) {
            const vector = worldVector.clone();
            const widthHalf = this.container.clientWidth / 2;
            const heightHalf = this.container.clientHeight / 2;
            vector.project(this.camera);
            vector.x = vector.x * widthHalf + widthHalf;
            vector.y = -(vector.y * heightHalf) + heightHalf;
            vector.z = 0;
            return vector;
        },
        checkSpriteInViewport: function (sprite) {
            this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
            this.cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
            this.cameraFrustum.setFromMatrix(this.cameraViewProjectionMatrix);
            return sprite.visible && this.cameraFrustum.intersectsSprite(sprite);
        },
        reverseDraggingDirection: function () {
            this.undefined.rotateSpeed *= -1;
            this.undefined.momentumScalingFactor *= -1;
        },
        addReticle: function () {
            this.reticle = new Reticle(16777215, true, this.options.dwellTime);
            this.reticle.hide();
            this.camera.add(this.reticle);
            this.sceneReticle.add(this.camera);
        },
        tweenControlCenter: function (vector, duration, easing) {
            if (this.control !== this.undefined) {
                return;
            }
            if (vector instanceof Array) {
                duration = vector[1];
                easing = vector[2];
                vector = vector[0];
            }
            duration = duration !== undefined ? duration : 1000;
            easing = easing || TWEEN.Easing.Exponential.Out;
            let scope, ha, va, chv, cvv, hv, vv, vptc, ov, nv;
            scope = this;
            chv = this.camera.getWorldDirection(new THREE.Vector3());
            cvv = chv.clone();
            vptc = this.panorama.getWorldPosition(new THREE.Vector3()).sub(this.camera.getWorldPosition(new THREE.Vector3()));
            hv = vector.clone();
            hv.x *= -1;
            hv.add(vptc).normalize();
            vv = hv.clone();
            chv.y = 0;
            hv.y = 0;
            ha = Math.atan2(hv.z, hv.x) - Math.atan2(chv.z, chv.x);
            ha = ha > Math.PI ? ha - 2 * Math.PI : ha;
            ha = ha < -Math.PI ? ha + 2 * Math.PI : ha;
            va = Math.abs(cvv.angleTo(chv) + (cvv.y * vv.y <= 0 ? vv.angleTo(hv) : -vv.angleTo(hv)));
            va *= vv.y < cvv.y ? 1 : -1;
            ov = {
                left: 0,
                up: 0
            };
            nv = {
                left: 0,
                up: 0
            };
            this.tweenLeftAnimation.stop();
            this.tweenUpAnimation.stop();
            this.tweenLeftAnimation = new TWEEN.Tween(ov).to({ left: ha }, duration).easing(easing).onUpdate(function (ov) {
                scope.control.rotateLeft(ov.left - nv.left);
                nv.left = ov.left;
            }).start();
            this.tweenUpAnimation = new TWEEN.Tween(ov).to({ up: va }, duration).easing(easing).onUpdate(function (ov) {
                scope.control.rotateUp(ov.up - nv.up);
                nv.up = ov.up;
            }).start();
        },
        tweenControlCenterByObject: function (object, duration, easing) {
            let isUnderScalePlaceHolder = false;
            object.traverseAncestors(function (ancestor) {
                if (ancestor.scalePlaceHolder) {
                    isUnderScalePlaceHolder = true;
                }
            });
            if (isUnderScalePlaceHolder) {
                const invertXVector = new THREE.Vector3(-1, 1, 1);
                this.tweenControlCenter(object.getWorldPosition(new THREE.Vector3()).multiply(invertXVector), duration, easing);
            } else {
                this.tweenControlCenter(object.getWorldPosition(new THREE.Vector3()), duration, easing);
            }
        },
        onWindowResize: function (windowWidth, windowHeight) {
            let width, height;
            const expand = this.container.classList.contains('panolens-container') || this.container.isFullscreen;
            if (windowWidth !== undefined && windowHeight !== undefined) {
                width = windowWidth;
                height = windowHeight;
                this.container._width = windowWidth;
                this.container._height = windowHeight;
            } else {
                const isAndroid = /(android)/i.test(window.navigator.userAgent);
                const adjustWidth = isAndroid ? Math.min(document.documentElement.clientWidth, window.innerWidth || 0) : Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                const adjustHeight = isAndroid ? Math.min(document.documentElement.clientHeight, window.innerHeight || 0) : Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                width = expand ? adjustWidth : this.container.clientWidth;
                height = expand ? adjustHeight : this.container.clientHeight;
                this.container._width = width;
                this.container._height = height;
            }
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            if (this.options.enableReticle || this.tempEnableReticle) {
                this.updateReticleEvent();
            }
            this.dispatchEvent({
                type: 'window-resize',
                width: width,
                height: height
            });
            this.scene.traverse(function (object) {
                if (object.dispatchEvent) {
                    object.dispatchEvent({
                        type: 'window-resize',
                        width: width,
                        height: height
                    });
                }
            });
        },
        addOutputElement: function () {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.right = '10px';
            element.style.top = '10px';
            element.style.color = '#fff';
            this.container.appendChild(element);
            this.outputDivElement = element;
        },
        outputPosition: function () {
            const intersects = this.raycaster.intersectObject(this.panorama, true);
            if (intersects.length > 0) {
                const point = intersects[0].point.clone();
                const converter = new THREE.Vector3(-1, 1, 1);
                const world = this.panorama.getWorldPosition(new THREE.Vector3());
                point.sub(world).multiply(converter);
                const message = `${ point.x.toFixed(2) }, ${ point.y.toFixed(2) }, ${ point.z.toFixed(2) }`;
                if (point.length() === 0) {
                    return;
                }
                switch (this.options.output) {
                case 'console':
                    console.info(message);
                    break;
                case 'overlay':
                    this.outputDivElement.textContent = message;
                    break;
                default:
                    break;
                }
            }
        },
        onMouseDown: function (event) {
            event.preventDefault();
            this.userMouse.x = event.clientX >= 0 ? event.clientX : event.touches[0].clientX;
            this.userMouse.y = event.clientY >= 0 ? event.clientY : event.touches[0].clientY;
            this.userMouse.type = 'mousedown';
            this.onTap(event);
        },
        onMouseMove: function (event) {
            event.preventDefault();
            this.userMouse.type = 'mousemove';
            this.onTap(event);
        },
        onMouseUp: function (event) {
            let onTarget = false;
            this.userMouse.type = 'mouseup';
            const type = this.userMouse.x >= event.clientX - this.options.clickTolerance && this.userMouse.x <= event.clientX + this.options.clickTolerance && this.userMouse.y >= event.clientY - this.options.clickTolerance && this.userMouse.y <= event.clientY + this.options.clickTolerance || event.changedTouches && this.userMouse.x >= event.changedTouches[0].clientX - this.options.clickTolerance && this.userMouse.x <= event.changedTouches[0].clientX + this.options.clickTolerance && this.userMouse.y >= event.changedTouches[0].clientY - this.options.clickTolerance && this.userMouse.y <= event.changedTouches[0].clientY + this.options.clickTolerance ? 'click' : undefined;
            if (event && event.target && !event.target.classList.contains('panolens-canvas')) {
                return;
            }
            event.preventDefault();
            if (event.changedTouches && event.changedTouches.length === 1) {
                onTarget = this.onTap({
                    clientX: event.changedTouches[0].clientX,
                    clientY: event.changedTouches[0].clientY
                }, type);
            } else {
                onTarget = this.onTap(event, type);
            }
            this.userMouse.type = 'none';
            if (onTarget) {
                return;
            }
            if (type === 'click') {
                const {
                    options: {autoHideInfospot, autoHideControlBar},
                    panorama,
                    toggleControlBar
                } = this;
                if (autoHideInfospot && panorama) {
                    panorama.toggleInfospotVisibility();
                }
                if (autoHideControlBar) {
                    toggleControlBar();
                }
            }
        },
        onTap: function (event, type) {
            const {left, top} = this.container.getBoundingClientRect();
            const {clientWidth, clientHeight} = this.container;
            this.raycasterPoint.x = (event.clientX - left) / clientWidth * 2 - 1;
            this.raycasterPoint.y = -((event.clientY - top) / clientHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.raycasterPoint, this.camera);
            if (!this.panorama) {
                return;
            }
            if (event.type !== 'mousedown' && this.touchSupported || this.OUTPUT_INFOSPOT) {
                this.outputPosition();
            }
            const intersects = this.raycaster.intersectObjects(this.panorama.children, true);
            const intersect_entity = this.getConvertedIntersect(intersects);
            const intersect = intersects.length > 0 ? intersects[0].object : undefined;
            if (this.userMouse.type === 'mouseup') {
                if (intersect_entity && this.pressEntityObject === intersect_entity && this.pressEntityObject.dispatchEvent) {
                    this.pressEntityObject.dispatchEvent({
                        type: 'pressstop-entity',
                        mouseEvent: event
                    });
                }
                this.pressEntityObject = undefined;
            }
            if (this.userMouse.type === 'mouseup') {
                if (intersect && this.pressObject === intersect && this.pressObject.dispatchEvent) {
                    this.pressObject.dispatchEvent({
                        type: 'pressstop',
                        mouseEvent: event
                    });
                }
                this.pressObject = undefined;
            }
            if (type === 'click') {
                this.panorama.dispatchEvent({
                    type: 'click',
                    intersects: intersects,
                    mouseEvent: event
                });
                if (intersect_entity && intersect_entity.dispatchEvent) {
                    intersect_entity.dispatchEvent({
                        type: 'click-entity',
                        mouseEvent: event
                    });
                }
                if (intersect && intersect.dispatchEvent) {
                    intersect.dispatchEvent({
                        type: 'click',
                        mouseEvent: event
                    });
                }
            } else {
                this.panorama.dispatchEvent({
                    type: 'hover',
                    intersects: intersects,
                    mouseEvent: event
                });
                if (this.hoverObject && intersects.length > 0 && this.hoverObject !== intersect_entity || this.hoverObject && intersects.length === 0) {
                    if (this.hoverObject.dispatchEvent) {
                        this.hoverObject.dispatchEvent({
                            type: 'hoverleave',
                            mouseEvent: event
                        });
                        this.reticle.end();
                    }
                    this.hoverObject = undefined;
                }
                if (intersect_entity && intersects.length > 0) {
                    if (this.hoverObject !== intersect_entity) {
                        this.hoverObject = intersect_entity;
                        if (this.hoverObject.dispatchEvent) {
                            this.hoverObject.dispatchEvent({
                                type: 'hoverenter',
                                mouseEvent: event
                            });
                            if (this.options.autoReticleSelect && this.options.enableReticle || this.tempEnableReticle) {
                                this.reticle.start(this.onTap.bind(this, event, 'click'));
                            }
                        }
                    }
                    if (this.userMouse.type === 'mousedown' && this.pressEntityObject != intersect_entity) {
                        this.pressEntityObject = intersect_entity;
                        if (this.pressEntityObject.dispatchEvent) {
                            this.pressEntityObject.dispatchEvent({
                                type: 'pressstart-entity',
                                mouseEvent: event
                            });
                        }
                    }
                    if (this.userMouse.type === 'mousedown' && this.pressObject != intersect) {
                        this.pressObject = intersect;
                        if (this.pressObject.dispatchEvent) {
                            this.pressObject.dispatchEvent({
                                type: 'pressstart',
                                mouseEvent: event
                            });
                        }
                    }
                    if (this.userMouse.type === 'mousemove' || this.options.enableReticle) {
                        if (intersect && intersect.dispatchEvent) {
                            intersect.dispatchEvent({
                                type: 'hover',
                                mouseEvent: event
                            });
                        }
                        if (this.pressEntityObject && this.pressEntityObject.dispatchEvent) {
                            this.pressEntityObject.dispatchEvent({
                                type: 'pressmove-entity',
                                mouseEvent: event
                            });
                        }
                        if (this.pressObject && this.pressObject.dispatchEvent) {
                            this.pressObject.dispatchEvent({
                                type: 'pressmove',
                                mouseEvent: event
                            });
                        }
                    }
                }
                if (!intersect_entity && this.pressEntityObject && this.pressEntityObject.dispatchEvent) {
                    this.pressEntityObject.dispatchEvent({
                        type: 'pressstop-entity',
                        mouseEvent: event
                    });
                    this.pressEntityObject = undefined;
                }
                if (!intersect && this.pressObject && this.pressObject.dispatchEvent) {
                    this.pressObject.dispatchEvent({
                        type: 'pressstop',
                        mouseEvent: event
                    });
                    this.pressObject = undefined;
                }
            }
            if (intersect && intersect instanceof Infospot) {
                this.infospot = intersect;
                if (type === 'click') {
                    return true;
                }
            } else if (this.infospot) {
                this.hideInfospot();
            }
            if (this.options.autoRotate && this.userMouse.type !== 'mousemove') {
                clearTimeout(this.autoRotateRequestId);
                if (this.control === this.undefined) {
                    this.undefined.autoRotate = false;
                    this.autoRotateRequestId = window.setTimeout(this.enableAutoRate.bind(this), this.options.autoRotateActivationDuration);
                }
            }
        },
        getConvertedIntersect: function (intersects) {
            let intersect;
            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].distance >= 0 && intersects[i].object && !intersects[i].object.passThrough) {
                    if (intersects[i].object.entity && intersects[i].object.entity.passThrough) {
                        continue;
                    } else if (intersects[i].object.entity && !intersects[i].object.entity.passThrough) {
                        intersect = intersects[i].object.entity;
                        break;
                    } else {
                        intersect = intersects[i].object;
                        break;
                    }
                }
            }
            return intersect;
        },
        hideInfospot: function () {
            if (this.infospot) {
                this.infospot.onHoverEnd();
                this.infospot = undefined;
            }
        },
        toggleControlBar: function () {
            const {widget} = this;
            if (widget) {
                widget.dispatchEvent({ type: 'control-bar-toggle' });
            }
        },
        onKeyDown: function (event) {
            if (this.options.output && this.options.output !== 'none' && event.key === 'Control') {
                this.OUTPUT_INFOSPOT = true;
            }
        },
        onKeyUp: function () {
            this.OUTPUT_INFOSPOT = false;
        },
        update: function () {
            TWEEN.update();
            this.updateCallbacks.forEach(function (callback) {
                callback();
            });
            this.control.update();
            this.scene.traverse(function (child) {
                if (child instanceof Infospot && child.element && (this.hoverObject === child || child.element.style.display !== 'none' || child.element.left && child.element.left.style.display !== 'none' || child.element.right && child.element.right.style.display !== 'none')) {
                    if (this.checkSpriteInViewport(child)) {
                        const {x, y} = this.getScreenVector(child.getWorldPosition(new THREE.Vector3()));
                        child.translateElement(x, y);
                    } else {
                        child.onDismiss();
                    }
                }
            }.bind(this));
        },
        render: function () {
            if (this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) {
                this.renderer.clear();
                this.effect.render(this.scene, this.camera);
                this.effect.render(this.sceneReticle, this.camera);
            } else {
                this.renderer.clear();
                this.renderer.render(this.scene, this.camera);
                this.renderer.clearDepth();
                this.renderer.render(this.sceneReticle, this.camera);
            }
        },
        animate: function () {
            this.requestAnimationId = window.requestAnimationFrame(this.animate.bind(this));
            this.onChange();
        },
        onChange: function () {
            this.update();
            this.render();
        },
        registerMouseAndTouchEvents: function () {
            const options = { passive: false };
            this.container.addEventListener('mousedown', this.HANDLER_MOUSE_DOWN, options);
            this.container.addEventListener('mousemove', this.HANDLER_MOUSE_MOVE, options);
            this.container.addEventListener('mouseup', this.HANDLER_MOUSE_UP, options);
            this.container.addEventListener('touchstart', this.HANDLER_MOUSE_DOWN, options);
            this.container.addEventListener('touchend', this.HANDLER_MOUSE_UP, options);
        },
        unregisterMouseAndTouchEvents: function () {
            this.container.removeEventListener('mousedown', this.HANDLER_MOUSE_DOWN, false);
            this.container.removeEventListener('mousemove', this.HANDLER_MOUSE_MOVE, false);
            this.container.removeEventListener('mouseup', this.HANDLER_MOUSE_UP, false);
            this.container.removeEventListener('touchstart', this.HANDLER_MOUSE_DOWN, false);
            this.container.removeEventListener('touchend', this.HANDLER_MOUSE_UP, false);
        },
        registerReticleEvent: function () {
            this.addUpdateCallback(this.HANDLER_TAP);
        },
        unregisterReticleEvent: function () {
            this.removeUpdateCallback(this.HANDLER_TAP);
        },
        updateReticleEvent: function () {
            const clientX = this.container.clientWidth / 2 + this.container.offsetLeft;
            const clientY = this.container.clientHeight / 2;
            this.removeUpdateCallback(this.HANDLER_TAP);
            this.HANDLER_TAP = this.onTap.bind(this, {
                clientX,
                clientY
            });
            this.addUpdateCallback(this.HANDLER_TAP);
        },
        registerEventListeners: function () {
            window.addEventListener('resize', this.HANDLER_WINDOW_RESIZE, true);
            window.addEventListener('keydown', this.HANDLER_KEY_DOWN, true);
            window.addEventListener('keyup', this.HANDLER_KEY_UP, true);
        },
        unregisterEventListeners: function () {
            window.removeEventListener('resize', this.HANDLER_WINDOW_RESIZE, true);
            window.removeEventListener('keydown', this.HANDLER_KEY_DOWN, true);
            window.removeEventListener('keyup', this.HANDLER_KEY_UP, true);
        },
        dispose: function () {
            this.tweenLeftAnimation.stop();
            this.tweenUpAnimation.stop();
            this.unregisterEventListeners();
            function recursiveDispose(object) {
                for (let i = object.children.length - 1; i >= 0; i--) {
                    recursiveDispose(object.children[i]);
                    object.remove(object.children[i]);
                }
                if (object instanceof Panorama || object instanceof Infospot) {
                    object.dispose();
                    object = null;
                } else if (object.dispatchEvent) {
                    object.dispatchEvent('dispose');
                }
            }
            recursiveDispose(this.scene);
            if (this.widget) {
                this.widget.dispose();
                this.widget = null;
            }
            if (THREE.Cache && THREE.Cache.enabled) {
                THREE.Cache.clear();
            }
        },
        destroy: function () {
            this.dispose();
            this.render();
            window.cancelAnimationFrame(this.requestAnimationId);
        },
        onPanoramaDispose: function (panorama) {
            if (panorama instanceof VideoPanorama) {
                this.hideVideoWidget();
            }
            if (panorama === this.panorama) {
                this.panorama = null;
            }
        },
        loadAsyncRequest: function (url, callback = () => {
        }) {
            const request = new window.XMLHttpRequest();
            request.onloadend = function (event) {
                callback(event);
            };
            request.open('GET', url, true);
            request.send(null);
        },
        addViewIndicator: function () {
            const scope = this;
            function loadViewIndicator(asyncEvent) {
                if (asyncEvent.loaded === 0)
                    return;
                const viewIndicatorDiv = asyncEvent.target.responseXML.documentElement;
                viewIndicatorDiv.style.width = scope.viewIndicatorSize + 'px';
                viewIndicatorDiv.style.height = scope.viewIndicatorSize + 'px';
                viewIndicatorDiv.style.position = 'absolute';
                viewIndicatorDiv.style.top = '10px';
                viewIndicatorDiv.style.left = '10px';
                viewIndicatorDiv.style.opacity = '0.5';
                viewIndicatorDiv.style.cursor = 'pointer';
                viewIndicatorDiv.id = 'panolens-view-indicator-container';
                scope.container.appendChild(viewIndicatorDiv);
                const indicator = viewIndicatorDiv.querySelector('#indicator');
                const setIndicatorD = function () {
                    scope.radius = scope.viewIndicatorSize * 0.225;
                    scope.currentPanoAngle = scope.camera.rotation.y - THREE.Math.degToRad(90);
                    scope.fovAngle = THREE.Math.degToRad(scope.camera.fov);
                    scope.leftAngle = -scope.currentPanoAngle - scope.fovAngle / 2;
                    scope.rightAngle = -scope.currentPanoAngle + scope.fovAngle / 2;
                    scope.leftX = scope.radius * Math.cos(scope.leftAngle);
                    scope.leftY = scope.radius * Math.sin(scope.leftAngle);
                    scope.rightX = scope.radius * Math.cos(scope.rightAngle);
                    scope.rightY = scope.radius * Math.sin(scope.rightAngle);
                    scope.indicatorD = 'M ' + scope.leftX + ' ' + scope.leftY + ' A ' + scope.radius + ' ' + scope.radius + ' 0 0 1 ' + scope.rightX + ' ' + scope.rightY;
                    if (scope.leftX && scope.leftY && scope.rightX && scope.rightY && scope.radius) {
                        indicator.setAttribute('d', scope.indicatorD);
                    }
                };
                scope.addUpdateCallback(setIndicatorD);
                const indicatorOnMouseEnter = function () {
                    this.style.opacity = '1';
                };
                const indicatorOnMouseLeave = function () {
                    this.style.opacity = '0.5';
                };
                viewIndicatorDiv.addEventListener('mouseenter', indicatorOnMouseEnter);
                viewIndicatorDiv.addEventListener('mouseleave', indicatorOnMouseLeave);
            }
            this.loadAsyncRequest(DataImage.ViewIndicator, loadViewIndicator);
        },
        appendControlItem: function (option) {
            const item = this.widget.createCustomItem(option);
            if (option.group === 'video') {
                this.widget.videoElement.appendChild(item);
            } else {
                this.widget.barElement.appendChild(item);
            }
            return item;
        },
        clearAllCache: function () {
            THREE.Cache.clear();
        }
    });
    return panolens.Viewer = Viewer;
});