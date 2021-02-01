/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./Panorama","../media/Media","skylark-threejs"],function(e,t,n){"use strict";function i(i){const s=new n.SphereBufferGeometry(5e3,60,40),a=new n.MeshBasicMaterial({visible:!1});e.call(this,s,a),this.media=new t(i),this.radius=5e3,this.addEventListener("enter",this.start.bind(this)),this.addEventListener("leave",this.stop.bind(this)),this.addEventListener("panolens-container",this.onPanolensContainer.bind(this)),this.addEventListener("panolens-scene",this.onPanolensScene.bind(this))}return i.prototype=Object.assign(Object.create(e.prototype),{constructor:i,onPanolensContainer:function({container:e}){this.media.setContainer(e)},onPanolensScene:function({scene:e}){this.media.setScene(e)},start:function(){return this.media.start()},stop:function(){this.media.stop()}}),i});
//# sourceMappingURL=../sourcemaps/panorama/CameraPanorama.js.map
