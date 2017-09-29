"use strict"
define("ember-analyzer/app",["exports","ember-analyzer/resolver","ember-load-initializers","ember-analyzer/config/environment"],function(e,t,n,a){Object.defineProperty(e,"__esModule",{value:!0})
var r=Ember.Application.extend({modulePrefix:a.default.modulePrefix,podModulePrefix:a.default.podModulePrefix,Resolver:t.default});(0,n.default)(r,a.default.modulePrefix),e.default=r}),define("ember-analyzer/components/audio-visualizer",["exports","ember-analyzer/helpers/fx"],function(e,t){function n(e,n){var a=new Tuna(n),r=n.createAnalyser()
r.fftSize=2048,r.smoothingTimeConstant=v
var i=n.createChannelMerger(e),o=Array(e).fill().map(function(e,t){var a=n.createGain()
return a.gain.value=2===t?2:.5,a}),l=Array(e).fill().map(function(){return Object.keys(t.default).map(function(e){return new a[e](t.default[e])})})
return l.forEach(function(e,t){e.forEach(function(t,n){n>0&&e[n-1].connect(t.input)}),e[e.length-1].connect(o[t]),o[t].connect(i)}),i.connect(r),r.connect(n.destination),{fx:l,gains:o,merger:i,analyserNode:r}}function a(e,t){return e.map(function(e){return r(e,t)})}function r(e,t){var n=t.createBufferSource()
return n.buffer=e,n}function i(e,t,n,a,r){var i=new THREE.Scene,d=new THREE.HemisphereLight(16777147,526368,1)
i.add(d)
var f=new THREE.WebGLRenderer
f.setSize(window.innerWidth-10,window.innerHeight-10)
var c=l(t,i),m=s(p,z/2,g)
m.position.y=-.5,i.add(m)
return function l(s){requestAnimationFrame(l),u(t,c),o(e.currentTime,a.duration,r,m),f.render(i,n)}(),f.domElement}function o(e,t,n,a){a.rotation.y+=2*h,a.rotation.x+=h
var r=e-n.startedAt
if(n.playing&&!(r>t)){var i=x/t
a.position.x=i*r+p}}function l(e,t){for(var n=[],a=0;a<b;a++){var r=p+a*z,i=s(r,z/2,c+5*a)
t.add(i),n.push(i)}return n}function s(e,t,n){var a=new THREE.BoxGeometry(t,t,t),r=new THREE.MeshPhongMaterial({color:n}),i=new THREE.Mesh(a,r)
return i.position.set(e,0,0),i.rotation.x=.3,i.rotation.y=.3,i}function u(e,t){var n=new Uint8Array(e.frequencyBinCount)
e.getByteFrequencyData(n)
for(var a=e.frequencyBinCount/b,r=0;r<b;r++){var i=r*a
d(t[r],n.slice(i,(r+1)*a).reduce(function(e,t){return e+t})/a,r%2==0)}}function d(e,t,n){e.scale.y=t/255*y+m,n?e.rotation.y+=h:e.rotation.y-=h}function f(e,t){return new Promise(function(n,a){new BufferLoader(e,t,function(e){return n(e)}).load()})}Object.defineProperty(e,"__esModule",{value:!0})
var c=13369344,p=-5,m=.5,b=48,y=50,h=.02,v=.8,x=10,g=14483694,z=x/b
e.default=Ember.Component.extend({init:function(){var e=this
window.AudioContext=window.AudioContext||window.webkitAudioContext,this.audioCtx=new AudioContext,this.pointers={pausedAt:0,startedAt:0},this.set("pointers.playing",!1)
var t=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3)
t.position.z=5,f(this.audioCtx,["./samples/guitar_1.mp3","./samples/guitar_2.mp3","./samples/vocal.mp3"]).then(function(a){e.set("bufferList",a)
var r=n(a.length,e.audioCtx),o=r.fx,l=r.analyserNode,s=r.merger,u=r.gains
e.merger=s,e.gains=u,e.set("fx",o)
var d=i(e.audioCtx,l,t,a[0],e.pointers)
document.body.appendChild(d)}),this._super.apply(this,arguments)},actions:{togglePlay:function(){this.pointers.playing?this.stop():this.play()},pause:function(){this.pointers.playing&&(this.tracks.forEach(function(e){return e.stop(0)}),this.pointers.pausedAt=this.audioCtx.currentTime-this.pointers.startedAt,this.set("pointers.playing",!1))},sliderChanged:function(e,t){this.gains[t].gain.value=e/50}},play:function(){var e=this,t=this.pointers.pausedAt
this.tracks=a(this.bufferList,this.audioCtx),this.tracks.forEach(function(t,n){return t.connect(e.fx[n][0].input)}),this.tracks.forEach(function(e){return e.start(0,t)}),this.pointers.startedAt=this.audioCtx.currentTime-t,this.pointers.pausedAt=0,this.set("pointers.playing",!0)},stop:function(){this.tracks.forEach(function(e){return e.stop(0)}),this.pointers.startedAt=0,this.pointers.pausedAt=0,this.set("pointers.playing",!1)}})}),define("ember-analyzer/components/range-slider",["exports","ember-cli-nouislider/components/range-slider"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/components/track-control",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Component.extend({classNames:["track-control-wrapper"],sliderRange:{min:0,max:100},actions:{activatePedal:function(e,t){e.bypass?this.set("fx."+t+".bypass",0):this.set("fx."+t+".bypass",1)},sliderChanged:function(e){this.sendAction("sliderChanged",e,this.idx)}}})}),define("ember-analyzer/helpers/app-version",["exports","ember-analyzer/config/environment","ember-cli-app-version/utils/regexp"],function(e,t,n){function a(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}
return t.hideSha?r.match(n.versionRegExp)[0]:t.hideVersion?r.match(n.shaRegExp)[0]:r}Object.defineProperty(e,"__esModule",{value:!0}),e.appVersion=a
var r=t.default.APP.version
e.default=Ember.Helper.helper(a)}),define("ember-analyzer/helpers/fx",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={Chorus:{rate:1.5,feedback:.2,delay:.0045,bypass:1},Phaser:{rate:1.2,depth:.3,feedback:.2,stereoPhase:30,baseModulationFrequency:700,bypass:1},Overdrive:{outputGain:.7,drive:1,curveAmount:.7,algorithmIndex:0,bypass:1},Compressor:{threshold:.5,makeupGain:1,attack:1,release:0,ratio:4,knee:5,automakeup:!0,bypass:1}}}),define("ember-analyzer/helpers/pluralize",["exports","ember-inflector/lib/helpers/pluralize"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/helpers/singularize",["exports","ember-inflector/lib/helpers/singularize"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/helpers/sum",["exports"],function(e){function t(e){return e.reduce(function(e,t){return e+t})}Object.defineProperty(e,"__esModule",{value:!0}),e.sum=t,e.default=Ember.Helper.helper(t)}),define("ember-analyzer/initializers/app-version",["exports","ember-cli-app-version/initializer-factory","ember-analyzer/config/environment"],function(e,t,n){Object.defineProperty(e,"__esModule",{value:!0})
var a=n.default.APP,r=a.name,i=a.version
e.default={name:"App Version",initialize:(0,t.default)(r,i)}}),define("ember-analyzer/initializers/container-debug-adapter",["exports","ember-resolver/resolvers/classic/container-debug-adapter"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"container-debug-adapter",initialize:function(){var e=arguments[1]||arguments[0]
e.register("container-debug-adapter:main",t.default),e.inject("container-debug-adapter:main","namespace","application:main")}}}),define("ember-analyzer/initializers/data-adapter",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"data-adapter",before:"store",initialize:function(){}}}),define("ember-analyzer/initializers/ember-data",["exports","ember-data/setup-container","ember-data"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"ember-data",initialize:t.default}}),define("ember-analyzer/initializers/export-application-global",["exports","ember-analyzer/config/environment"],function(e,t){function n(){var e=arguments[1]||arguments[0]
if(!1!==t.default.exportApplicationGlobal){var n
if("undefined"!=typeof window)n=window
else if("undefined"!=typeof global)n=global
else{if("undefined"==typeof self)return
n=self}var a,r=t.default.exportApplicationGlobal
a="string"==typeof r?r:Ember.String.classify(t.default.modulePrefix),n[a]||(n[a]=e,e.reopen({willDestroy:function(){this._super.apply(this,arguments),delete n[a]}}))}}Object.defineProperty(e,"__esModule",{value:!0}),e.initialize=n,e.default={name:"export-application-global",initialize:n}}),define("ember-analyzer/initializers/injectStore",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"injectStore",before:"store",initialize:function(){}}}),define("ember-analyzer/initializers/store",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"store",after:"ember-data",initialize:function(){}}}),define("ember-analyzer/initializers/transforms",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"transforms",before:"store",initialize:function(){}}}),define("ember-analyzer/instance-initializers/ember-data",["exports","ember-data/instance-initializers/initialize-store-service"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"ember-data",initialize:t.default}}),define("ember-analyzer/resolver",["exports","ember-resolver"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/router",["exports","ember-analyzer/config/environment"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0})
var n=Ember.Router.extend({location:t.default.locationType,rootURL:t.default.rootURL})
n.map(function(){}),e.default=n}),define("ember-analyzer/routes/index",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Route.extend({})}),define("ember-analyzer/services/ajax",["exports","ember-ajax/services/ajax"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.default}})}),define("ember-analyzer/templates/application",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"xtC2Ci3y",block:'{"symbols":[],"statements":[[1,[18,"outlet"],false],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/application.hbs"}})}),define("ember-analyzer/templates/components/audio-visualizer",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"2G7nXZlY",block:'{"symbols":["f","index"],"statements":[[6,"div"],[9,"id","top-controls"],[7],[0,"\\n  "],[6,"button"],[10,"class",[26,[[25,"if",[[19,0,["pointers","playing"]],"red","green"],null]]]],[3,"action",[[19,0,[]],"togglePlay"]],[7],[1,[25,"if",[[19,0,["pointers","playing"]],"stop","play"],null],false],[8],[0,"\\n  "],[6,"button"],[9,"class","blue"],[3,"action",[[19,0,[]],"pause"]],[7],[0,"pause"],[8],[0,"\\n"],[8],[0,"\\n\\n"],[6,"div"],[9,"id","bottom-controls"],[7],[0,"\\n"],[4,"each",[[19,0,["fx"]]],null,{"statements":[[0,"    "],[1,[25,"track-control",null,[["fx","idx","sliderChanged"],[[19,1,[]],[19,2,[]],"sliderChanged"]]],false],[0,"\\n"]],"parameters":[1,2]},null],[8],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/components/audio-visualizer.hbs"}})}),define("ember-analyzer/templates/components/track-control",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"DZnHsjmN",block:'{"symbols":["f","jdx"],"statements":[[6,"button"],[9,"class","fx"],[7],[0,"track "],[1,[25,"sum",[[19,0,["idx"]],1],null],false],[8],[0,"\\n"],[1,[25,"range-slider",null,[["start","on-slide"],[50,"sliderChanged"]]],false],[0,"\\n"],[4,"each",[[19,0,["fx"]]],null,{"statements":[[0,"  "],[6,"button"],[10,"class",[26,["fx ",[25,"if",[[19,1,["bypass"]],"","red"],null]]]],[3,"action",[[19,0,[]],"activatePedal",[19,1,[]],[19,2,[]]]],[7],[1,[19,1,["name"]],false],[8],[0,"\\n"]],"parameters":[1,2]},null]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/components/track-control.hbs"}})}),define("ember-analyzer/templates/index",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"PbSqm5Wd",block:'{"symbols":[],"statements":[[1,[18,"audio-visualizer"],false],[0,"\\n"],[1,[18,"outlet"],false],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/index.hbs"}})}),define("ember-analyzer/config/environment",["ember"],function(e){try{var t="ember-analyzer/config/environment",n=document.querySelector('meta[name="'+t+'"]').getAttribute("content"),a=JSON.parse(unescape(n)),r={default:a}
return Object.defineProperty(r,"__esModule",{value:!0}),r}catch(e){throw new Error('Could not read config from meta tag with name "'+t+'".')}}),runningTests||require("ember-analyzer/app").default.create({name:"ember-analyzer",version:"0.0.0+4ea9126d"})