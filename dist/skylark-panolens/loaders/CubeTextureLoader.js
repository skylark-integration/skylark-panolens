/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["./ImageLoader","skylark-threejs"],function(t,a){"use strict";return{load:function(e,o=(()=>{}),d=(()=>{}),n){var l,r,u,i,f;return l=new a.CubeTexture([]),r=0,u={},i={},e.map(function(a,e){t.load(a,function(t){l.images[e]=t,6===++r&&(l.needsUpdate=!0,o(l))},function(t){for(var a in u[e]={loaded:t.loaded,total:t.total},i.loaded=0,i.total=0,f=0,u)f++,i.loaded+=u[a].loaded,i.total+=u[a].total;f<6&&(i.total=i.total/f*6),d(i)},n)}),l}}});
//# sourceMappingURL=../sourcemaps/loaders/CubeTextureLoader.js.map
