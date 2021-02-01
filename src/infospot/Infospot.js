define([
    'skylark-threejs',
    '../DataImage',
    '../Constants',
    '../loaders/TextureLoader',
    'skylark-tweenjs'
], function (THREE, DataImage, Constants, TextureLoader, TWEEN) {
    'use strict';
    function Infospot(scale = 300, imageSrc, animated) {
        const duration = 500, scaleFactor = 1.3;
        imageSrc = imageSrc || DataImage.Info;
        THREE.Sprite.call(this);
        this.type = 'infospot';
        this.animated = animated !== undefined ? animated : true;
        this.isHovering = false;
        this.frustumCulled = false;
        this.element = null;
        this.toPanorama = null;
        this.cursorStyle = null;
        this.mode = Constants.MODES.NORMAL;
        this.scale.set(scale, scale, 1);
        this.rotation.y = Math.PI;
        this.container = null;
        this.originalRaycast = this.raycast;
        this.HANDLER_FOCUS = null;
        this.material.side = THREE.DoubleSide;
        this.material.depthTest = false;
        this.material.transparent = true;
        this.material.opacity = 0;
        this.scaleUpAnimation = new TWEEN.Tween();
        this.scaleDownAnimation = new TWEEN.Tween();
        const postLoad = function (texture) {
            if (!this.material) {
                return;
            }
            const ratio = texture.image.width / texture.image.height;
            const textureScale = new THREE.Vector3();
            texture.image.width = texture.image.naturalWidth || 64;
            texture.image.height = texture.image.naturalHeight || 64;
            this.scale.set(ratio * scale, scale, 1);
            textureScale.copy(this.scale);
            this.scaleUpAnimation = new TWEEN.Tween(this.scale).to({
                x: textureScale.x * scaleFactor,
                y: textureScale.y * scaleFactor
            }, duration).easing(TWEEN.Easing.Elastic.Out);
            this.scaleDownAnimation = new TWEEN.Tween(this.scale).to({
                x: textureScale.x,
                y: textureScale.y
            }, duration).easing(TWEEN.Easing.Elastic.Out);
            this.material.map = texture;
            this.material.needsUpdate = true;
        }.bind(this);
        this.showAnimation = new TWEEN.Tween(this.material).to({ opacity: 1 }, duration).onStart(this.enableRaycast.bind(this, true)).easing(TWEEN.Easing.Quartic.Out);
        this.hideAnimation = new TWEEN.Tween(this.material).to({ opacity: 0 }, duration).onStart(this.enableRaycast.bind(this, false)).easing(TWEEN.Easing.Quartic.Out);
        this.addEventListener('click', this.onClick);
        this.addEventListener('hover', this.onHover);
        this.addEventListener('hoverenter', this.onHoverStart);
        this.addEventListener('hoverleave', this.onHoverEnd);
        this.addEventListener('panolens-dual-eye-effect', this.onDualEyeEffect);
        this.addEventListener('panolens-container', this.setContainer.bind(this));
        this.addEventListener('dismiss', this.onDismiss);
        this.addEventListener('panolens-infospot-focus', this.setFocusMethod);
        TextureLoader.load(imageSrc, postLoad);
    }
    ;
    Infospot.prototype = Object.assign(Object.create(THREE.Sprite.prototype), {
        constructor: Infospot,
        setContainer: function (data) {
            let container;
            if (data instanceof HTMLElement) {
                container = data;
            } else if (data && data.container) {
                container = data.container;
            }
            if (container && this.element) {
                container.appendChild(this.element);
            }
            this.container = container;
        },
        getContainer: function () {
            return this.container;
        },
        onClick: function (event) {
            if (this.element && this.getContainer()) {
                this.onHoverStart(event);
                this.lockHoverElement();
            }
        },
        onDismiss: function () {
            if (this.element) {
                this.unlockHoverElement();
                this.onHoverEnd();
            }
        },
        onHover: function () {
        },
        onHoverStart: function (event) {
            if (!this.getContainer()) {
                return;
            }
            const cursorStyle = this.cursorStyle || (this.mode === Constants.MODES.NORMAL ? 'pointer' : 'default');
            const {scaleDownAnimation, scaleUpAnimation, element} = this;
            this.isHovering = true;
            this.container.style.cursor = cursorStyle;
            if (this.animated) {
                scaleDownAnimation.stop();
                scaleUpAnimation.start();
            }
            if (element && event.mouseEvent.clientX >= 0 && event.mouseEvent.clientY >= 0) {
                const {left, right, style} = element;
                if (this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) {
                    style.display = 'none';
                    left.style.display = 'block';
                    right.style.display = 'block';
                    element._width = left.clientWidth;
                    element._height = left.clientHeight;
                } else {
                    style.display = 'block';
                    if (left) {
                        left.style.display = 'none';
                    }
                    if (right) {
                        right.style.display = 'none';
                    }
                    element._width = element.clientWidth;
                    element._height = element.clientHeight;
                }
            }
        },
        onHoverEnd: function () {
            if (!this.getContainer()) {
                return;
            }
            const {scaleDownAnimation, scaleUpAnimation, element} = this;
            this.isHovering = false;
            this.container.style.cursor = 'default';
            if (this.animated) {
                scaleUpAnimation.stop();
                scaleDownAnimation.start();
            }
            if (element && !this.element.locked) {
                const {left, right, style} = element;
                style.display = 'none';
                if (left) {
                    left.style.display = 'none';
                }
                if (right) {
                    right.style.display = 'none';
                }
                this.unlockHoverElement();
            }
        },
        onDualEyeEffect: function (event) {
            if (!this.getContainer()) {
                return;
            }
            let element, halfWidth, halfHeight;
            this.mode = event.mode;
            element = this.element;
            halfWidth = this.container.clientWidth / 2;
            halfHeight = this.container.clientHeight / 2;
            if (!element) {
                return;
            }
            if (!element.left && !element.right) {
                element.left = element.cloneNode(true);
                element.right = element.cloneNode(true);
            }
            if (this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) {
                element.left.style.display = element.style.display;
                element.right.style.display = element.style.display;
                element.style.display = 'none';
            } else {
                element.style.display = element.left.style.display;
                element.left.style.display = 'none';
                element.right.style.display = 'none';
            }
            this.translateElement(halfWidth, halfHeight);
            this.container.appendChild(element.left);
            this.container.appendChild(element.right);
        },
        translateElement: function (x, y) {
            if (!this.element._width || !this.element._height || !this.getContainer()) {
                return;
            }
            let left, top, element, width, height, delta, container;
            container = this.container;
            element = this.element;
            width = element._width / 2;
            height = element._height / 2;
            delta = element.verticalDelta !== undefined ? element.verticalDelta : 40;
            left = x - width;
            top = y - height - delta;
            if ((this.mode === Constants.MODES.CARDBOARD || this.mode === Constants.MODES.STEREO) && element.left && element.right && !(x === container.clientWidth / 2 && y === container.clientHeight / 2)) {
                left = container.clientWidth / 4 - width + (x - container.clientWidth / 2);
                top = container.clientHeight / 2 - height - delta + (y - container.clientHeight / 2);
                this.setElementStyle('transform', element.left, 'translate(' + left + 'px, ' + top + 'px)');
                left += container.clientWidth / 2;
                this.setElementStyle('transform', element.right, 'translate(' + left + 'px, ' + top + 'px)');
            } else {
                this.setElementStyle('transform', element, 'translate(' + left + 'px, ' + top + 'px)');
            }
        },
        setElementStyle: function (type, element, value) {
            const style = element.style;
            if (type === 'transform') {
                style.webkitTransform = style.msTransform = style.transform = value;
            }
        },
        setText: function (text) {
            if (this.element) {
                this.element.textContent = text;
            }
        },
        setCursorHoverStyle: function (style) {
            this.cursorStyle = style;
        },
        addHoverText: function (text, delta = 40) {
            if (!this.element) {
                this.element = document.createElement('div');
                this.element.style.display = 'none';
                this.element.style.color = '#fff';
                this.element.style.top = 0;
                this.element.style.maxWidth = '50%';
                this.element.style.maxHeight = '50%';
                this.element.style.textShadow = '0 0 3px #000000';
                this.element.style.fontFamily = '"Trebuchet MS", Helvetica, sans-serif';
                this.element.style.position = 'absolute';
                this.element.classList.add('panolens-infospot');
                this.element.verticalDelta = delta;
            }
            this.setText(text);
        },
        addHoverElement: function (el, delta = 40) {
            if (!this.element) {
                this.element = el.cloneNode(true);
                this.element.style.display = 'none';
                this.element.style.top = 0;
                this.element.style.position = 'absolute';
                this.element.classList.add('panolens-infospot');
                this.element.verticalDelta = delta;
            }
        },
        removeHoverElement: function () {
            if (this.element) {
                if (this.element.left) {
                    this.container.removeChild(this.element.left);
                    this.element.left = null;
                }
                if (this.element.right) {
                    this.container.removeChild(this.element.right);
                    this.element.right = null;
                }
                this.container.removeChild(this.element);
                this.element = null;
            }
        },
        lockHoverElement: function () {
            if (this.element) {
                this.element.locked = true;
            }
        },
        unlockHoverElement: function () {
            if (this.element) {
                this.element.locked = false;
            }
        },
        enableRaycast: function (enabled = true) {
            if (enabled) {
                this.raycast = this.originalRaycast;
            } else {
                this.raycast = () => {
                };
            }
        },
        show: function (delay = 0) {
            const {animated, hideAnimation, showAnimation, material} = this;
            if (animated) {
                hideAnimation.stop();
                showAnimation.delay(delay).start();
            } else {
                this.enableRaycast(true);
                material.opacity = 1;
            }
        },
        hide: function (delay = 0) {
            const {animated, hideAnimation, showAnimation, material} = this;
            if (animated) {
                showAnimation.stop();
                hideAnimation.delay(delay).start();
            } else {
                this.enableRaycast(false);
                material.opacity = 0;
            }
        },
        setFocusMethod: function (event) {
            if (event) {
                this.HANDLER_FOCUS = event.method;
            }
        },
        focus: function (duration, easing) {
            if (this.HANDLER_FOCUS) {
                this.HANDLER_FOCUS(this.position, duration, easing);
                this.onDismiss();
            }
        },
        dispose: function () {
            const {geometry, material} = this;
            const {map} = material;
            this.removeHoverElement();
            if (this.parent) {
                this.parent.remove(this);
            }
            if (map) {
                map.dispose();
                material.map = null;
            }
            if (geometry) {
                geometry.dispose();
                this.geometry = null;
            }
            if (material) {
                material.dispose();
                this.material = null;
            }
        }
    });
    return Infospot;
});