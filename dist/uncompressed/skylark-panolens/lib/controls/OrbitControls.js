define(['skylark-threejs'], function (THREE) {
    'use strict';
    function OrbitControls(object, domElement) {
        this.object = object;
        this.domElement = domElement !== undefined ? domElement : document;
        this.frameId = null;
        this.enabled = true;
        this.target = new THREE.Vector3();
        this.center = this.target;
        this.noZoom = false;
        this.zoomSpeed = 1;
        this.minDistance = 0;
        this.maxDistance = Infinity;
        this.minZoom = 0;
        this.maxZoom = Infinity;
        this.noRotate = false;
        this.rotateSpeed = -0.15;
        this.noPan = true;
        this.keyPanSpeed = 7;
        this.autoRotate = false;
        this.autoRotateSpeed = 2;
        this.minPolarAngle = 0;
        this.maxPolarAngle = Math.PI;
        this.momentumDampingFactor = 0.9;
        this.momentumScalingFactor = -0.005;
        this.momentumKeydownFactor = 20;
        this.minFov = 30;
        this.maxFov = 120;
        this.minAzimuthAngle = -Infinity;
        this.maxAzimuthAngle = Infinity;
        this.noKeys = false;
        this.keys = {
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            BOTTOM: 40
        };
        this.mouseButtons = {
            ORBIT: THREE.MOUSE.LEFT,
            ZOOM: THREE.MOUSE.MIDDLE,
            PAN: THREE.MOUSE.RIGHT
        };
        var scope = this;
        var EPS = 1e-7;
        var MEPS = 0.0001;
        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();
        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();
        var panOffset = new THREE.Vector3();
        var offset = new THREE.Vector3();
        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();
        var theta = 0;
        var phi = 0;
        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var pan = new THREE.Vector3();
        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();
        var momentumLeft = 0, momentumUp = 0;
        var eventPrevious;
        var momentumOn = false;
        var keyUp, keyBottom, keyLeft, keyRight;
        var STATE = {
            NONE: -1,
            ROTATE: 0,
            DOLLY: 1,
            PAN: 2,
            TOUCH_ROTATE: 3,
            TOUCH_DOLLY: 4,
            TOUCH_PAN: 5
        };
        var state = STATE.NONE;
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().inverse();
        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };
        this.setLastQuaternion = function (quaternion) {
            lastQuaternion.copy(quaternion);
            scope.object.quaternion.copy(quaternion);
        };
        this.getLastPosition = function () {
            return lastPosition;
        };
        this.rotateLeft = function (angle) {
            if (angle === undefined) {
                angle = getAutoRotationAngle();
            }
            thetaDelta -= angle;
        };
        this.rotateUp = function (angle) {
            if (angle === undefined) {
                angle = getAutoRotationAngle();
            }
            phiDelta -= angle;
        };
        this.panLeft = function (distance) {
            var te = this.object.matrix.elements;
            panOffset.set(te[0], te[1], te[2]);
            panOffset.multiplyScalar(-distance);
            pan.add(panOffset);
        };
        this.panUp = function (distance) {
            var te = this.object.matrix.elements;
            panOffset.set(te[4], te[5], te[6]);
            panOffset.multiplyScalar(distance);
            pan.add(panOffset);
        };
        this.pan = function (deltaX, deltaY) {
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
            if (scope.object instanceof THREE.PerspectiveCamera) {
                var position = scope.object.position;
                var offset = position.clone().sub(scope.target);
                var targetDistance = offset.length();
                targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);
                scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
                scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
            } else if (scope.object instanceof THREE.OrthographicCamera) {
                scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
                scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
            } else {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            }
        };
        this.momentum = function () {
            if (!momentumOn)
                return;
            if (Math.abs(momentumLeft) < MEPS && Math.abs(momentumUp) < MEPS) {
                momentumOn = false;
                return;
            }
            momentumUp *= this.momentumDampingFactor;
            momentumLeft *= this.momentumDampingFactor;
            thetaDelta -= this.momentumScalingFactor * momentumLeft;
            phiDelta -= this.momentumScalingFactor * momentumUp;
        };
        this.dollyIn = function (dollyScale) {
            if (dollyScale === undefined) {
                dollyScale = getZoomScale();
            }
            if (scope.object instanceof THREE.PerspectiveCamera) {
                scale /= dollyScale;
            } else if (scope.object instanceof THREE.OrthographicCamera) {
                scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale));
                scope.object.updateProjectionMatrix();
                scope.dispatchEvent(changeEvent);
            } else {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            }
        };
        this.dollyOut = function (dollyScale) {
            if (dollyScale === undefined) {
                dollyScale = getZoomScale();
            }
            if (scope.object instanceof THREE.PerspectiveCamera) {
                scale *= dollyScale;
            } else if (scope.object instanceof THREE.OrthographicCamera) {
                scope.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale));
                scope.object.updateProjectionMatrix();
                scope.dispatchEvent(changeEvent);
            } else {
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
            }
        };
        this.update = function (ignoreUpdate) {
            var position = this.object.position;
            offset.copy(position).sub(this.target);
            offset.applyQuaternion(quat);
            theta = Math.atan2(offset.x, offset.z);
            phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
            if (this.autoRotate && state === STATE.NONE) {
                this.rotateLeft(getAutoRotationAngle());
            }
            this.momentum();
            theta += thetaDelta;
            phi += phiDelta;
            theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));
            phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
            phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
            var radius = offset.length() * scale;
            radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
            this.target.add(pan);
            offset.x = radius * Math.sin(phi) * Math.sin(theta);
            offset.y = radius * Math.cos(phi);
            offset.z = radius * Math.sin(phi) * Math.cos(theta);
            offset.applyQuaternion(quatInverse);
            position.copy(this.target).add(offset);
            this.object.lookAt(this.target);
            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.set(0, 0, 0);
            if (lastPosition.distanceToSquared(this.object.position) > EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
                if (ignoreUpdate !== true) {
                    this.dispatchEvent(changeEvent);
                }
                lastPosition.copy(this.object.position);
                lastQuaternion.copy(this.object.quaternion);
            }
        };
        this.reset = function () {
            state = STATE.NONE;
            this.target.copy(this.target0);
            this.object.position.copy(this.position0);
            this.object.zoom = this.zoom0;
            this.object.updateProjectionMatrix();
            this.dispatchEvent(changeEvent);
            this.update();
        };
        this.getPolarAngle = function () {
            return phi;
        };
        this.getAzimuthalAngle = function () {
            return theta;
        };
        function getAutoRotationAngle() {
            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
        }
        function getZoomScale() {
            return Math.pow(0.95, scope.zoomSpeed);
        }
        function onMouseDown(event) {
            momentumOn = false;
            momentumLeft = momentumUp = 0;
            if (scope.enabled === false)
                return;
            event.preventDefault();
            if (event.button === scope.mouseButtons.ORBIT) {
                if (scope.noRotate === true)
                    return;
                state = STATE.ROTATE;
                rotateStart.set(event.clientX, event.clientY);
            } else if (event.button === scope.mouseButtons.ZOOM) {
                if (scope.noZoom === true)
                    return;
                state = STATE.DOLLY;
                dollyStart.set(event.clientX, event.clientY);
            } else if (event.button === scope.mouseButtons.PAN) {
                if (scope.noPan === true)
                    return;
                state = STATE.PAN;
                panStart.set(event.clientX, event.clientY);
            }
            if (state !== STATE.NONE) {
                document.addEventListener('mousemove', onMouseMove, false);
                document.addEventListener('mouseup', onMouseUp, false);
                scope.dispatchEvent(startEvent);
            }
            scope.update();
        }
        function onMouseMove(event) {
            if (scope.enabled === false)
                return;
            event.preventDefault();
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
            if (state === STATE.ROTATE) {
                if (scope.noRotate === true)
                    return;
                rotateEnd.set(event.clientX, event.clientY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                rotateStart.copy(rotateEnd);
                if (eventPrevious) {
                    momentumLeft = event.clientX - eventPrevious.clientX;
                    momentumUp = event.clientY - eventPrevious.clientY;
                }
                eventPrevious = event;
            } else if (state === STATE.DOLLY) {
                if (scope.noZoom === true)
                    return;
                dollyEnd.set(event.clientX, event.clientY);
                dollyDelta.subVectors(dollyEnd, dollyStart);
                if (dollyDelta.y > 0) {
                    scope.dollyIn();
                } else if (dollyDelta.y < 0) {
                    scope.dollyOut();
                }
                dollyStart.copy(dollyEnd);
            } else if (state === STATE.PAN) {
                if (scope.noPan === true)
                    return;
                panEnd.set(event.clientX, event.clientY);
                panDelta.subVectors(panEnd, panStart);
                scope.pan(panDelta.x, panDelta.y);
                panStart.copy(panEnd);
            }
            if (state !== STATE.NONE)
                scope.update();
        }
        function onMouseUp() {
            momentumOn = true;
            eventPrevious = undefined;
            if (scope.enabled === false)
                return;
            document.removeEventListener('mousemove', onMouseMove, false);
            document.removeEventListener('mouseup', onMouseUp, false);
            scope.dispatchEvent(endEvent);
            state = STATE.NONE;
        }
        function onMouseWheel(event) {
            if (scope.enabled === false || scope.noZoom === true || state !== STATE.NONE)
                return;
            event.preventDefault();
            event.stopPropagation();
            var delta = 0;
            if (event.wheelDelta !== undefined) {
                delta = event.wheelDelta;
            } else if (event.detail !== undefined) {
                delta = -event.detail;
            }
            if (delta > 0) {
                scope.object.fov = scope.object.fov < scope.maxFov ? scope.object.fov + 1 : scope.maxFov;
                scope.object.updateProjectionMatrix();
            } else if (delta < 0) {
                scope.object.fov = scope.object.fov > scope.minFov ? scope.object.fov - 1 : scope.minFov;
                scope.object.updateProjectionMatrix();
            }
            scope.update();
            scope.dispatchEvent(changeEvent);
            scope.dispatchEvent(startEvent);
            scope.dispatchEvent(endEvent);
        }
        function onKeyUp(event) {
            switch (event.keyCode) {
            case scope.keys.UP:
                keyUp = false;
                break;
            case scope.keys.BOTTOM:
                keyBottom = false;
                break;
            case scope.keys.LEFT:
                keyLeft = false;
                break;
            case scope.keys.RIGHT:
                keyRight = false;
                break;
            }
        }
        function onKeyDown(event) {
            if (scope.enabled === false || scope.noKeys === true || scope.noRotate === true)
                return;
            switch (event.keyCode) {
            case scope.keys.UP:
                keyUp = true;
                break;
            case scope.keys.BOTTOM:
                keyBottom = true;
                break;
            case scope.keys.LEFT:
                keyLeft = true;
                break;
            case scope.keys.RIGHT:
                keyRight = true;
                break;
            }
            if (keyUp || keyBottom || keyLeft || keyRight) {
                momentumOn = true;
                if (keyUp)
                    momentumUp = -scope.rotateSpeed * scope.momentumKeydownFactor;
                if (keyBottom)
                    momentumUp = scope.rotateSpeed * scope.momentumKeydownFactor;
                if (keyLeft)
                    momentumLeft = -scope.rotateSpeed * scope.momentumKeydownFactor;
                if (keyRight)
                    momentumLeft = scope.rotateSpeed * scope.momentumKeydownFactor;
            }
        }
        function touchstart(event) {
            momentumOn = false;
            momentumLeft = momentumUp = 0;
            if (scope.enabled === false)
                return;
            switch (event.touches.length) {
            case 1:
                if (scope.noRotate === true)
                    return;
                state = STATE.TOUCH_ROTATE;
                rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;
            case 2:
                if (scope.noZoom === true)
                    return;
                state = STATE.TOUCH_DOLLY;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyStart.set(0, distance);
                break;
            case 3:
                if (scope.noPan === true)
                    return;
                state = STATE.TOUCH_PAN;
                panStart.set(event.touches[0].pageX, event.touches[0].pageY);
                break;
            default:
                state = STATE.NONE;
            }
            if (state !== STATE.NONE)
                scope.dispatchEvent(startEvent);
        }
        function touchmove(event) {
            if (scope.enabled === false)
                return;
            event.preventDefault();
            event.stopPropagation();
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
            switch (event.touches.length) {
            case 1:
                if (scope.noRotate === true)
                    return;
                if (state !== STATE.TOUCH_ROTATE)
                    return;
                rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                rotateDelta.subVectors(rotateEnd, rotateStart);
                scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
                scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
                rotateStart.copy(rotateEnd);
                if (eventPrevious) {
                    momentumLeft = event.touches[0].pageX - eventPrevious.pageX;
                    momentumUp = event.touches[0].pageY - eventPrevious.pageY;
                }
                eventPrevious = {
                    pageX: event.touches[0].pageX,
                    pageY: event.touches[0].pageY
                };
                scope.update();
                break;
            case 2:
                if (scope.noZoom === true)
                    return;
                if (state !== STATE.TOUCH_DOLLY)
                    return;
                var dx = event.touches[0].pageX - event.touches[1].pageX;
                var dy = event.touches[0].pageY - event.touches[1].pageY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                dollyEnd.set(0, distance);
                dollyDelta.subVectors(dollyEnd, dollyStart);
                if (dollyDelta.y < 0) {
                    scope.object.fov = scope.object.fov < scope.maxFov ? scope.object.fov + 1 : scope.maxFov;
                    scope.object.updateProjectionMatrix();
                } else if (dollyDelta.y > 0) {
                    scope.object.fov = scope.object.fov > scope.minFov ? scope.object.fov - 1 : scope.minFov;
                    scope.object.updateProjectionMatrix();
                }
                dollyStart.copy(dollyEnd);
                scope.update();
                scope.dispatchEvent(changeEvent);
                break;
            case 3:
                if (scope.noPan === true)
                    return;
                if (state !== STATE.TOUCH_PAN)
                    return;
                panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
                panDelta.subVectors(panEnd, panStart);
                scope.pan(panDelta.x, panDelta.y);
                panStart.copy(panEnd);
                scope.update();
                break;
            default:
                state = STATE.NONE;
            }
        }
        function touchend() {
            momentumOn = true;
            eventPrevious = undefined;
            if (scope.enabled === false)
                return;
            scope.dispatchEvent(endEvent);
            state = STATE.NONE;
        }
        this.dispose = function () {
            this.domElement.removeEventListener('mousedown', onMouseDown);
            this.domElement.removeEventListener('mousewheel', onMouseWheel);
            this.domElement.removeEventListener('DOMMouseScroll', onMouseWheel);
            this.domElement.removeEventListener('touchstart', touchstart);
            this.domElement.removeEventListener('touchend', touchend);
            this.domElement.removeEventListener('touchmove', touchmove);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        };
        this.domElement.addEventListener('mousedown', onMouseDown, { passive: false });
        this.domElement.addEventListener('mousewheel', onMouseWheel, { passive: false });
        this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, { passive: false });
        this.domElement.addEventListener('touchstart', touchstart, { passive: false });
        this.domElement.addEventListener('touchend', touchend, { passive: false });
        this.domElement.addEventListener('touchmove', touchmove, { passive: false });
        window.addEventListener('keyup', onKeyUp, { passive: false });
        window.addEventListener('keydown', onKeyDown, { passive: false });
        this.update();
    }
    ;
    OrbitControls.prototype = Object.assign(Object.create(THREE.EventDispatcher.prototype), { constructor: OrbitControls });
    return OrbitControls;
});