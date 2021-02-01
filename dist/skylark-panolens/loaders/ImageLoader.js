/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["../DataImage","skylark-threejs"],function(e,t){"use strict";return{load:function(n,r=(()=>{}),o=(()=>{}),d=(()=>{})){let a,i,s,c,l,w,u;t.Cache.enabled=!0;for(let t in e)e.hasOwnProperty(t)&&n===e[t]&&(u=t);if(void 0!==(a=t.Cache.get(u||n)))return r&&setTimeout(function(){o({loaded:1,total:1}),r(a)},0),a;l=window.URL||window.webkitURL,w=document.createElementNS("http://www.w3.org/1999/xhtml","img"),t.Cache.add(u||n,w);const f=()=>{l.revokeObjectURL(w.src),r(w)};if(0===n.indexOf("data:"))return w.addEventListener("load",f,!1),w.src=n,w;w.crossOrigin=void 0!==this.crossOrigin?this.crossOrigin:"",(i=new window.XMLHttpRequest).open("GET",n,!0),i.responseType="arraybuffer",i.addEventListener("error",d),i.addEventListener("progress",e=>{if(!e)return;const{loaded:t,total:n,lengthComputable:r}=e;r&&o({loaded:t,total:n})}),i.addEventListener("loadend",e=>{if(!e)return;const{currentTarget:{response:t}}=e;s=new Uint8Array(t),c=new window.Blob([s]),w.addEventListener("load",f,!1),w.src=l.createObjectURL(c)}),i.send(null)}}});
//# sourceMappingURL=../sourcemaps/loaders/ImageLoader.js.map
