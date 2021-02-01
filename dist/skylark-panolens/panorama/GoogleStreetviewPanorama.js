/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./ImagePanorama","../loaders/GoogleStreetviewLoader","skylark-threejs"],function(e,t,o){"use strict";function s(t,o){e.call(this),this.panoId=t,this.gsvLoader=null,this.loadRequested=!1,this.setupGoogleMapAPI(o)}return s.prototype=Object.assign(Object.create(e.prototype),{constructor:s,load:function(e){this.loadRequested=!0,(e=e||this.panoId||{})&&this.gsvLoader&&this.loadGSVLoader(e)},setupGoogleMapAPI:function(e){const t=document.createElement("script");t.src="https://maps.googleapis.com/maps/api/js?",t.src+=e?"key="+e:"",t.onreadystatechange=this.setGSVLoader.bind(this),t.onload=this.setGSVLoader.bind(this),document.querySelector("head").appendChild(t)},setGSVLoader:function(){this.gsvLoader=new t,this.loadRequested&&this.load()},getGSVLoader:function(){return this.gsvLoader},loadGSVLoader:function(e){this.loadRequested=!1,this.gsvLoader.onProgress=this.onProgress.bind(this),this.gsvLoader.onPanoramaLoad=this.onLoad.bind(this),this.gsvLoader.setZoom(this.getZoomLevel()),this.gsvLoader.load(e),this.gsvLoader.loaded=!0},onLoad:function(t){e.prototype.onLoad.call(this,new o.Texture(t))},reset:function(){this.gsvLoader=void 0,e.prototype.reset.call(this)}}),s});
//# sourceMappingURL=../sourcemaps/panorama/GoogleStreetviewPanorama.js.map
