/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./Panorama","skylark-threejs"],function(t,e){"use strict";function r(){const r=new e.BufferGeometry,n=new e.MeshBasicMaterial({color:0,opacity:0,transparent:!0});r.addAttribute("position",new e.BufferAttribute(new Float32Array,1)),t.call(this,r,n)}return r.prototype=Object.assign(Object.create(t.prototype),{constructor:r}),r});
//# sourceMappingURL=../sourcemaps/panorama/EmptyPanorama.js.map
