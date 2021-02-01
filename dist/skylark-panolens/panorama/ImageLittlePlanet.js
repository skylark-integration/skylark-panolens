/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./LittlePlanet","skylark-threejs"],function(t,e){"use strict";function i(e,i,o){t.call(this,"image",e,i,o)}return i.prototype=Object.assign(Object.create(t.prototype),{constructor:i,onLoad:function(e){this.updateTexture(e),t.prototype.onLoad.call(this,e)},updateTexture:function(t){t.minFilter=t.magFilter=e.LinearFilter,this.material.uniforms.tDiffuse.value=t},dispose:function(){const e=this.material.uniforms.tDiffuse;e&&e.value&&e.value.dispose(),t.prototype.dispose.call(this)}}),i});
//# sourceMappingURL=../sourcemaps/panorama/ImageLittlePlanet.js.map
