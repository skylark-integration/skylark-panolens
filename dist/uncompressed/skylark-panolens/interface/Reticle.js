define(['skylark-threejs'], function (THREE) {
    'use strict';
    function Reticle(color = 16777215, autoSelect = true, dwellTime = 1500) {
        this.dpr = window.devicePixelRatio;
        const {canvas, context} = this.createCanvas();
        const material = new THREE.SpriteMaterial({
            color,
            map: this.createCanvasTexture(canvas)
        });
        THREE.Sprite.call(this, material);
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.context = context;
        this.color = color instanceof THREE.Color ? color : new THREE.Color(color);
        this.autoSelect = autoSelect;
        this.dwellTime = dwellTime;
        this.rippleDuration = 500;
        this.position.z = -10;
        this.center.set(0.5, 0.5);
        this.scale.set(0.5, 0.5, 1);
        this.startTimestamp = null;
        this.timerId = null;
        this.callback = null;
        this.frustumCulled = false;
        this.updateCanvasArcByProgress(0);
    }
    ;
    Reticle.prototype = Object.assign(Object.create(THREE.Sprite.prototype), {
        constructor: Reticle,
        setColor: function (color) {
            this.material.color.copy(color instanceof THREE.Color ? color : new THREE.Color(color));
        },
        createCanvasTexture: function (canvas) {
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            return texture;
        },
        createCanvas: function () {
            const width = 32;
            const height = 32;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const dpr = this.dpr;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            context.scale(dpr, dpr);
            context.shadowBlur = 5;
            context.shadowColor = 'rgba(200,200,200,0.9)';
            return {
                canvas,
                context
            };
        },
        updateCanvasArcByProgress: function (progress) {
            const context = this.context;
            const {canvasWidth, canvasHeight, material} = this;
            const dpr = this.dpr;
            const degree = progress * Math.PI * 2;
            const color = this.color.getStyle();
            const x = canvasWidth * 0.5 / dpr;
            const y = canvasHeight * 0.5 / dpr;
            const lineWidth = 3;
            context.clearRect(0, 0, canvasWidth, canvasHeight);
            context.beginPath();
            if (progress === 0) {
                context.arc(x, y, canvasWidth / 16, 0, 2 * Math.PI);
                context.fillStyle = color;
                context.fill();
            } else {
                context.arc(x, y, canvasWidth / 4 - lineWidth, -Math.PI / 2, -Math.PI / 2 + degree);
                context.strokeStyle = color;
                context.lineWidth = lineWidth;
                context.stroke();
            }
            context.closePath();
            material.map.needsUpdate = true;
        },
        ripple: function () {
            const context = this.context;
            const {canvasWidth, canvasHeight, material} = this;
            const duration = this.rippleDuration;
            const timestamp = performance.now();
            const color = this.color;
            const dpr = this.dpr;
            const x = canvasWidth * 0.5 / dpr;
            const y = canvasHeight * 0.5 / dpr;
            const update = () => {
                const timerId = window.requestAnimationFrame(update);
                const elapsed = performance.now() - timestamp;
                const progress = elapsed / duration;
                const opacity = 1 - progress > 0 ? 1 - progress : 0;
                const radius = progress * canvasWidth * 0.5 / dpr;
                context.clearRect(0, 0, canvasWidth, canvasHeight);
                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fillStyle = `rgba(${ color.r * 255 }, ${ color.g * 255 }, ${ color.b * 255 }, ${ opacity })`;
                context.fill();
                context.closePath();
                if (progress >= 1) {
                    window.cancelAnimationFrame(timerId);
                    this.updateCanvasArcByProgress(0);
                    this.dispatchEvent({ type: 'reticle-ripple-end' });
                }
                material.map.needsUpdate = true;
            };
            this.dispatchEvent({ type: 'reticle-ripple-start' });
            update();
        },
        show: function () {
            this.visible = true;
        },
        hide: function () {
            this.visible = false;
        },
        start: function (callback) {
            if (!this.autoSelect) {
                return;
            }
            this.dispatchEvent({ type: 'reticle-start' });
            this.startTimestamp = performance.now();
            this.callback = callback;
            this.update();
        },
        end: function () {
            if (!this.startTimestamp) {
                return;
            }
            window.cancelAnimationFrame(this.timerId);
            this.updateCanvasArcByProgress(0);
            this.callback = null;
            this.timerId = null;
            this.startTimestamp = null;
            this.dispatchEvent({ type: 'reticle-end' });
        },
        update: function () {
            this.timerId = window.requestAnimationFrame(this.update.bind(this));
            const elapsed = performance.now() - this.startTimestamp;
            const progress = elapsed / this.dwellTime;
            this.updateCanvasArcByProgress(progress);
            this.dispatchEvent({
                type: 'reticle-update',
                progress
            });
            if (progress >= 1) {
                window.cancelAnimationFrame(this.timerId);
                if (this.callback) {
                    this.callback();
                }
                this.end();
                this.ripple();
            }
        }
    });
    return Reticle;
});