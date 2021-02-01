/**
 * skylark-panolens - A version of panolens that ported to running on skylarkjs
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-panolens/
 * @license MIT
 */
define(["skylark-threejs"],function(e){"use strict";return function(t){var r=new e.OrthographicCamera(-1,1,1,-1,0,1),a=new e.Scene,n=new e.StereoCamera;n.aspect=.5;var i={minFilter:e.LinearFilter,magFilter:e.NearestFilter,format:e.RGBAFormat},s=new e.WebGLRenderTarget(512,512,i);s.scissorTest=!0,s.texture.generateMipmaps=!1;var o=new e.Vector2(.441,.156),l=new e.PlaneBufferGeometry(1,1,10,20).removeAttribute("normal").toNonIndexed(),u=l.attributes.position.array,c=l.attributes.uv.array;l.attributes.position.count*=2,l.attributes.uv.count*=2;var d=new Float32Array(2*u.length);d.set(u),d.set(u,u.length);var h=new Float32Array(2*c.length);h.set(c),h.set(c,c.length);for(var p=new e.Vector2,v=u.length/3,g=0,w=d.length/3;g<w;g++){p.x=d[3*g+0],p.y=d[3*g+1];var m=p.dot(p),y=1.5+(o.x+o.y*m)*m,f=g<v?0:1;d[3*g+0]=p.x/y*1.5-.5+f,d[3*g+1]=p.y/y*3,h[2*g]=.5*(h[2*g]+f)}l.attributes.position.array=d,l.attributes.uv.array=h;var x=new e.MeshBasicMaterial({map:s.texture}),b=new e.Mesh(l,x);a.add(b),this.setSize=function(e,r){t.setSize(e,r);var a=t.getPixelRatio();s.setSize(e*a,r*a)},this.render=function(e,i){e.updateMatrixWorld(),null===i.parent&&i.updateMatrixWorld(),n.update(i);var o=s.width/2,l=s.height;t.autoClear&&t.clear(),s.scissor.set(0,0,o,l),s.viewport.set(0,0,o,l),t.setRenderTarget(s),t.render(e,n.cameraL),t.clearDepth(),s.scissor.set(o,0,o,l),s.viewport.set(o,0,o,l),t.setRenderTarget(s),t.render(e,n.cameraR),t.clearDepth(),t.setRenderTarget(null),t.render(a,r)}}});
//# sourceMappingURL=../../sourcemaps/lib/effects/CardboardEffect.js.map
