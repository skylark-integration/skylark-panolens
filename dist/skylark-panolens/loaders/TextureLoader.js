/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./ImageLoader","skylark-threejs"],function(e,a){"use strict";return{load:function(r,t=(()=>{}),n,o){var s=new a.Texture;return e.load(r,function(e){s.image=e;const n=r.search(/\.(jpg|jpeg)$/)>0||0===r.search(/^data\:image\/jpeg/);s.format=n?a.RGBFormat:a.RGBAFormat,s.needsUpdate=!0,t(s)},n,o),s}}});
//# sourceMappingURL=../sourcemaps/loaders/TextureLoader.js.map
