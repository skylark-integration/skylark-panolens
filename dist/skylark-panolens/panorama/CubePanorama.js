/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./Panorama","../loaders/CubeTextureLoader","skylark-threejs"],function(e,t,i){"use strict";function r(t=[]){const r=Object.assign({},i.ShaderLib.cube),s=new i.BoxBufferGeometry(1e4,1e4,1e4),a=new i.ShaderMaterial({fragmentShader:r.fragmentShader,vertexShader:r.vertexShader,uniforms:r.uniforms,side:i.BackSide,transparent:!0});e.call(this,s,a),this.images=t,this.edgeLength=1e4,this.material.uniforms.opacity.value=0}return r.prototype=Object.assign(Object.create(e.prototype),{constructor:r,load:function(){t.load(this.images,this.onLoad.bind(this),this.onProgress.bind(this),this.onError.bind(this))},onLoad:function(t){this.material.uniforms.tCube.value=t,e.prototype.onLoad.call(this)},dispose:function(){const{value:t}=this.material.uniforms.tCube;this.images.forEach(e=>{i.Cache.remove(e)}),t instanceof i.CubeTexture&&t.dispose(),e.prototype.dispose.call(this)}}),r});
//# sourceMappingURL=../sourcemaps/panorama/CubePanorama.js.map
