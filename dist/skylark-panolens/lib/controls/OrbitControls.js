/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["skylark-threejs"],function(t){"use strict";function e(e,o){this.object=e,this.domElement=void 0!==o?o:document,this.frameId=null,this.enabled=!0,this.target=new t.Vector3,this.center=this.target,this.noZoom=!1,this.zoomSpeed=1,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.noRotate=!1,this.rotateSpeed=-.15,this.noPan=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.momentumDampingFactor=.9,this.momentumScalingFactor=-.005,this.momentumKeydownFactor=20,this.minFov=30,this.maxFov=120,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.noKeys=!1,this.keys={LEFT:37,UP:38,RIGHT:39,BOTTOM:40},this.mouseButtons={ORBIT:t.MOUSE.LEFT,ZOOM:t.MOUSE.MIDDLE,PAN:t.MOUSE.RIGHT};var n,i,a,s,c,r=this,h=new t.Vector2,m=new t.Vector2,u=new t.Vector2,d=new t.Vector2,p=new t.Vector2,l=new t.Vector2,v=new t.Vector3,b=new t.Vector3,f=new t.Vector2,E=new t.Vector2,g=new t.Vector2,y=0,j=0,O=0,M=0,w=1,L=new t.Vector3,P=new t.Vector3,N=new t.Quaternion,T=0,x=0,k=!1,A={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_DOLLY:4,TOUCH_PAN:5},F=A.NONE;this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom;var Y=(new t.Quaternion).setFromUnitVectors(e.up,new t.Vector3(0,1,0)),R=Y.clone().inverse(),S={type:"change"},D={type:"start"},U={type:"end"};function V(){return 2*Math.PI/60/60*r.autoRotateSpeed}function z(){return Math.pow(.95,r.zoomSpeed)}function I(t){if(k=!1,T=x=0,!1!==r.enabled){if(t.preventDefault(),t.button===r.mouseButtons.ORBIT){if(!0===r.noRotate)return;F=A.ROTATE,h.set(t.clientX,t.clientY)}else if(t.button===r.mouseButtons.ZOOM){if(!0===r.noZoom)return;F=A.DOLLY,f.set(t.clientX,t.clientY)}else if(t.button===r.mouseButtons.PAN){if(!0===r.noPan)return;F=A.PAN,d.set(t.clientX,t.clientY)}F!==A.NONE&&(document.addEventListener("mousemove",C,!1),document.addEventListener("mouseup",X,!1),r.dispatchEvent(D)),r.update()}}function C(t){if(!1!==r.enabled){t.preventDefault();var e=r.domElement===document?r.domElement.body:r.domElement;if(F===A.ROTATE){if(!0===r.noRotate)return;m.set(t.clientX,t.clientY),u.subVectors(m,h),r.rotateLeft(2*Math.PI*u.x/e.clientWidth*r.rotateSpeed),r.rotateUp(2*Math.PI*u.y/e.clientHeight*r.rotateSpeed),h.copy(m),n&&(T=t.clientX-n.clientX,x=t.clientY-n.clientY),n=t}else if(F===A.DOLLY){if(!0===r.noZoom)return;E.set(t.clientX,t.clientY),g.subVectors(E,f),g.y>0?r.dollyIn():g.y<0&&r.dollyOut(),f.copy(E)}else if(F===A.PAN){if(!0===r.noPan)return;p.set(t.clientX,t.clientY),l.subVectors(p,d),r.pan(l.x,l.y),d.copy(p)}F!==A.NONE&&r.update()}}function X(){k=!0,n=void 0,!1!==r.enabled&&(document.removeEventListener("mousemove",C,!1),document.removeEventListener("mouseup",X,!1),r.dispatchEvent(U),F=A.NONE)}function H(t){if(!1!==r.enabled&&!0!==r.noZoom&&F===A.NONE){t.preventDefault(),t.stopPropagation();var e=0;void 0!==t.wheelDelta?e=t.wheelDelta:void 0!==t.detail&&(e=-t.detail),e>0?(r.object.fov=r.object.fov<r.maxFov?r.object.fov+1:r.maxFov,r.object.updateProjectionMatrix()):e<0&&(r.object.fov=r.object.fov>r.minFov?r.object.fov-1:r.minFov,r.object.updateProjectionMatrix()),r.update(),r.dispatchEvent(S),r.dispatchEvent(D),r.dispatchEvent(U)}}function Z(t){switch(t.keyCode){case r.keys.UP:i=!1;break;case r.keys.BOTTOM:a=!1;break;case r.keys.LEFT:s=!1;break;case r.keys.RIGHT:c=!1}}function B(t){if(!1!==r.enabled&&!0!==r.noKeys&&!0!==r.noRotate){switch(t.keyCode){case r.keys.UP:i=!0;break;case r.keys.BOTTOM:a=!0;break;case r.keys.LEFT:s=!0;break;case r.keys.RIGHT:c=!0}(i||a||s||c)&&(k=!0,i&&(x=-r.rotateSpeed*r.momentumKeydownFactor),a&&(x=r.rotateSpeed*r.momentumKeydownFactor),s&&(T=-r.rotateSpeed*r.momentumKeydownFactor),c&&(T=r.rotateSpeed*r.momentumKeydownFactor))}}function _(t){if(k=!1,T=x=0,!1!==r.enabled){switch(t.touches.length){case 1:if(!0===r.noRotate)return;F=A.TOUCH_ROTATE,h.set(t.touches[0].pageX,t.touches[0].pageY);break;case 2:if(!0===r.noZoom)return;F=A.TOUCH_DOLLY;var e=t.touches[0].pageX-t.touches[1].pageX,o=t.touches[0].pageY-t.touches[1].pageY,n=Math.sqrt(e*e+o*o);f.set(0,n);break;case 3:if(!0===r.noPan)return;F=A.TOUCH_PAN,d.set(t.touches[0].pageX,t.touches[0].pageY);break;default:F=A.NONE}F!==A.NONE&&r.dispatchEvent(D)}}function q(t){if(!1!==r.enabled){t.preventDefault(),t.stopPropagation();var e=r.domElement===document?r.domElement.body:r.domElement;switch(t.touches.length){case 1:if(!0===r.noRotate)return;if(F!==A.TOUCH_ROTATE)return;m.set(t.touches[0].pageX,t.touches[0].pageY),u.subVectors(m,h),r.rotateLeft(2*Math.PI*u.x/e.clientWidth*r.rotateSpeed),r.rotateUp(2*Math.PI*u.y/e.clientHeight*r.rotateSpeed),h.copy(m),n&&(T=t.touches[0].pageX-n.pageX,x=t.touches[0].pageY-n.pageY),n={pageX:t.touches[0].pageX,pageY:t.touches[0].pageY},r.update();break;case 2:if(!0===r.noZoom)return;if(F!==A.TOUCH_DOLLY)return;var o=t.touches[0].pageX-t.touches[1].pageX,i=t.touches[0].pageY-t.touches[1].pageY,a=Math.sqrt(o*o+i*i);E.set(0,a),g.subVectors(E,f),g.y<0?(r.object.fov=r.object.fov<r.maxFov?r.object.fov+1:r.maxFov,r.object.updateProjectionMatrix()):g.y>0&&(r.object.fov=r.object.fov>r.minFov?r.object.fov-1:r.minFov,r.object.updateProjectionMatrix()),f.copy(E),r.update(),r.dispatchEvent(S);break;case 3:if(!0===r.noPan)return;if(F!==A.TOUCH_PAN)return;p.set(t.touches[0].pageX,t.touches[0].pageY),l.subVectors(p,d),r.pan(l.x,l.y),d.copy(p),r.update();break;default:F=A.NONE}}}function G(){k=!0,n=void 0,!1!==r.enabled&&(r.dispatchEvent(U),F=A.NONE)}this.setLastQuaternion=function(t){N.copy(t),r.object.quaternion.copy(t)},this.getLastPosition=function(){return P},this.rotateLeft=function(t){void 0===t&&(t=V()),M-=t},this.rotateUp=function(t){void 0===t&&(t=V()),O-=t},this.panLeft=function(t){var e=this.object.matrix.elements;v.set(e[0],e[1],e[2]),v.multiplyScalar(-t),L.add(v)},this.panUp=function(t){var e=this.object.matrix.elements;v.set(e[4],e[5],e[6]),v.multiplyScalar(t),L.add(v)},this.pan=function(e,o){var n=r.domElement===document?r.domElement.body:r.domElement;if(r.object instanceof t.PerspectiveCamera){var i=r.object.position.clone().sub(r.target).length();i*=Math.tan(r.object.fov/2*Math.PI/180),r.panLeft(2*e*i/n.clientHeight),r.panUp(2*o*i/n.clientHeight)}else r.object instanceof t.OrthographicCamera?(r.panLeft(e*(r.object.right-r.object.left)/n.clientWidth),r.panUp(o*(r.object.top-r.object.bottom)/n.clientHeight)):console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.")},this.momentum=function(){k&&(Math.abs(T)<1e-4&&Math.abs(x)<1e-4?k=!1:(x*=this.momentumDampingFactor,T*=this.momentumDampingFactor,M-=this.momentumScalingFactor*T,O-=this.momentumScalingFactor*x))},this.dollyIn=function(e){void 0===e&&(e=z()),r.object instanceof t.PerspectiveCamera?w/=e:r.object instanceof t.OrthographicCamera?(r.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom*e)),r.object.updateProjectionMatrix(),r.dispatchEvent(S)):console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")},this.dollyOut=function(e){void 0===e&&(e=z()),r.object instanceof t.PerspectiveCamera?w*=e:r.object instanceof t.OrthographicCamera?(r.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/e)),r.object.updateProjectionMatrix(),r.dispatchEvent(S)):console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.")},this.update=function(t){var e=this.object.position;b.copy(e).sub(this.target),b.applyQuaternion(Y),y=Math.atan2(b.x,b.z),j=Math.atan2(Math.sqrt(b.x*b.x+b.z*b.z),b.y),this.autoRotate&&F===A.NONE&&this.rotateLeft(V()),this.momentum(),y+=M,j+=O,y=Math.max(this.minAzimuthAngle,Math.min(this.maxAzimuthAngle,y)),j=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,j)),j=Math.max(1e-7,Math.min(Math.PI-1e-7,j));var o=b.length()*w;o=Math.max(this.minDistance,Math.min(this.maxDistance,o)),this.target.add(L),b.x=o*Math.sin(j)*Math.sin(y),b.y=o*Math.cos(j),b.z=o*Math.sin(j)*Math.cos(y),b.applyQuaternion(R),e.copy(this.target).add(b),this.object.lookAt(this.target),M=0,O=0,w=1,L.set(0,0,0),(P.distanceToSquared(this.object.position)>1e-7||8*(1-N.dot(this.object.quaternion))>1e-7)&&(!0!==t&&this.dispatchEvent(S),P.copy(this.object.position),N.copy(this.object.quaternion))},this.reset=function(){F=A.NONE,this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(S),this.update()},this.getPolarAngle=function(){return j},this.getAzimuthalAngle=function(){return y},this.dispose=function(){this.domElement.removeEventListener("mousedown",I),this.domElement.removeEventListener("mousewheel",H),this.domElement.removeEventListener("DOMMouseScroll",H),this.domElement.removeEventListener("touchstart",_),this.domElement.removeEventListener("touchend",G),this.domElement.removeEventListener("touchmove",q),window.removeEventListener("keyup",Z),window.removeEventListener("keydown",B)},this.domElement.addEventListener("mousedown",I,{passive:!1}),this.domElement.addEventListener("mousewheel",H,{passive:!1}),this.domElement.addEventListener("DOMMouseScroll",H,{passive:!1}),this.domElement.addEventListener("touchstart",_,{passive:!1}),this.domElement.addEventListener("touchend",G,{passive:!1}),this.domElement.addEventListener("touchmove",q,{passive:!1}),window.addEventListener("keyup",Z,{passive:!1}),window.addEventListener("keydown",B,{passive:!1}),this.update()}return e.prototype=Object.assign(Object.create(t.EventDispatcher.prototype),{constructor:e}),e});
//# sourceMappingURL=../../sourcemaps/lib/controls/OrbitControls.js.map
