/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./Panorama","../loaders/TextureLoader","skylark-threejs"],function(e,t,o){"use strict";function s(t,s,i){const n=s||new o.SphereBufferGeometry(5e3,60,40),r=i||new o.MeshBasicMaterial({opacity:0,transparent:!0});e.call(this,n,r),this.src=t,this.radius=5e3}return s.prototype=Object.assign(Object.create(e.prototype),{constructor:s,load:function(e){(e=e||this.src)?"string"==typeof e?t.load(e,this.onLoad.bind(this),this.onProgress.bind(this),this.onError.bind(this)):e instanceof HTMLImageElement&&this.onLoad(new o.Texture(e)):console.warn("Image source undefined")},onLoad:function(t){t.minFilter=t.magFilter=o.LinearFilter,t.needsUpdate=!0,this.updateTexture(t),window.requestAnimationFrame(e.prototype.onLoad.bind(this))},reset:function(){e.prototype.reset.call(this)},dispose:function(){const{material:{map:t}}=this;o.Cache.remove(this.src),t&&t.dispose(),e.prototype.dispose.call(this)}}),s});
//# sourceMappingURL=../sourcemaps/panorama/ImagePanorama.js.map
