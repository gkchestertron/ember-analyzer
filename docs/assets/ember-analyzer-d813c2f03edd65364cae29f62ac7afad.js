"use strict"
define("ember-analyzer/app",["exports","ember-analyzer/resolver","ember-load-initializers","ember-analyzer/config/environment"],function(e,t,n,a){Object.defineProperty(e,"__esModule",{value:!0})
var i=Ember.Application.extend({modulePrefix:a.default.modulePrefix,podModulePrefix:a.default.podModulePrefix,Resolver:t.default});(0,n.default)(i,a.default.modulePrefix),e.default=i}),define("ember-analyzer/components/audio-visualizer",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Component.extend({init:function(){var e=this
this._super.apply(this,arguments),this.get("audioCtx").fetchBuffers(["./samples/guitar_1.mp3","./samples/guitar_2.mp3","./samples/vocal.mp3"]).then(function(t){e.set("audioCtx.gains.0.gain.value",.25),e.set("audioCtx.gains.1.gain.value",.3),e.set("audioCtx.gains.2.gain.value",2),e.set("visualizer",Ember.inject.service("visualizer")),e.set("loading",!1),setTimeout(function(){document.body.appendChild(e.get("visualizer.el"))},100)})},actions:{fastForward:function(){this.get("audioCtx").adjustTime(10)},togglePlay:function(){this.get("audioCtx.playing")?this.get("audioCtx").pause():this.get("audioCtx").play()},stop:function(){this.get("audioCtx").stop()},rewind:function(){this.get("audioCtx").adjustTime(-10)},sliderChanged:function(e,t){this.get("audioCtx.gains")[t].gain.value=e/50}},audioCtx:Ember.inject.service("audio-ctx"),loading:!0,visualizer:Ember.inject.service("visualizer")})}),define("ember-analyzer/components/loading-bars",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Component.extend({})}),define("ember-analyzer/components/range-slider",["exports","ember-cli-nouislider/components/range-slider"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/components/track-control",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Component.extend({classNames:["track-control-wrapper"],sliderRange:{min:0,max:100},gainValue:Ember.computed(function(){return 50*this.get("audioCtx.gains")[this.get("idx")].gain.value}),actions:{activatePedal:function(e,t){e.bypass?this.set("fx."+t+".bypass",0):this.set("fx."+t+".bypass",1)},sliderChanged:function(e){this.sendAction("sliderChanged",e,this.idx)}}})}),define("ember-analyzer/helpers/app-version",["exports","ember-analyzer/config/environment","ember-cli-app-version/utils/regexp"],function(e,t,n){function a(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}
return t.hideSha?i.match(n.versionRegExp)[0]:t.hideVersion?i.match(n.shaRegExp)[0]:i}Object.defineProperty(e,"__esModule",{value:!0}),e.appVersion=a
var i=t.default.APP.version
e.default=Ember.Helper.helper(a)}),define("ember-analyzer/helpers/fx",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={Chorus:{rate:1.5,feedback:.2,delay:.0045,bypass:1},Phaser:{rate:1.2,depth:.3,feedback:.2,stereoPhase:30,baseModulationFrequency:700,bypass:1},Overdrive:{outputGain:.7,drive:1,curveAmount:.7,algorithmIndex:0,bypass:1},Compressor:{threshold:.5,makeupGain:1,attack:1,release:0,ratio:4,knee:5,automakeup:!0,bypass:1}}}),define("ember-analyzer/helpers/pluralize",["exports","ember-inflector/lib/helpers/pluralize"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/helpers/singularize",["exports","ember-inflector/lib/helpers/singularize"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/helpers/sum",["exports"],function(e){function t(e){return e.reduce(function(e,t){return e+t})}Object.defineProperty(e,"__esModule",{value:!0}),e.sum=t,e.default=Ember.Helper.helper(t)}),define("ember-analyzer/initializers/app-version",["exports","ember-cli-app-version/initializer-factory","ember-analyzer/config/environment"],function(e,t,n){Object.defineProperty(e,"__esModule",{value:!0})
var a=n.default.APP,i=a.name,r=a.version
e.default={name:"App Version",initialize:(0,t.default)(i,r)}}),define("ember-analyzer/initializers/container-debug-adapter",["exports","ember-resolver/resolvers/classic/container-debug-adapter"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"container-debug-adapter",initialize:function(){var e=arguments[1]||arguments[0]
e.register("container-debug-adapter:main",t.default),e.inject("container-debug-adapter:main","namespace","application:main")}}}),define("ember-analyzer/initializers/data-adapter",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"data-adapter",before:"store",initialize:function(){}}}),define("ember-analyzer/initializers/ember-data",["exports","ember-data/setup-container","ember-data"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"ember-data",initialize:t.default}}),define("ember-analyzer/initializers/export-application-global",["exports","ember-analyzer/config/environment"],function(e,t){function n(){var e=arguments[1]||arguments[0]
if(!1!==t.default.exportApplicationGlobal){var n
if("undefined"!=typeof window)n=window
else if("undefined"!=typeof global)n=global
else{if("undefined"==typeof self)return
n=self}var a,i=t.default.exportApplicationGlobal
a="string"==typeof i?i:Ember.String.classify(t.default.modulePrefix),n[a]||(n[a]=e,e.reopen({willDestroy:function(){this._super.apply(this,arguments),delete n[a]}}))}}Object.defineProperty(e,"__esModule",{value:!0}),e.initialize=n,e.default={name:"export-application-global",initialize:n}}),define("ember-analyzer/initializers/injectStore",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"injectStore",before:"store",initialize:function(){}}}),define("ember-analyzer/initializers/store",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"store",after:"ember-data",initialize:function(){}}}),define("ember-analyzer/initializers/transforms",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"transforms",before:"store",initialize:function(){}}}),define("ember-analyzer/instance-initializers/ember-data",["exports","ember-data/instance-initializers/initialize-store-service"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"ember-data",initialize:t.default}}),define("ember-analyzer/resolver",["exports","ember-resolver"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),e.default=t.default}),define("ember-analyzer/router",["exports","ember-analyzer/config/environment"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0})
var n=Ember.Router.extend({location:t.default.locationType,rootURL:t.default.rootURL})
n.map(function(){}),e.default=n}),define("ember-analyzer/routes/index",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.Route.extend({})}),define("ember-analyzer/services/ajax",["exports","ember-ajax/services/ajax"],function(e,t){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"default",{enumerable:!0,get:function(){return t.default}})}),define("ember-analyzer/services/audio-ctx",["exports","ember-analyzer/helpers/fx"],function(e,t){function n(e,n){var a=new Tuna(n),i=n.createAnalyser()
i.fftSize=2048,i.smoothingTimeConstant=r
var o=n.createChannelMerger(e),l=Array(e).fill().map(function(e,t){return n.createGain()}),s=Array(e).fill().map(function(){return Object.keys(t.default).map(function(e){return new a[e](t.default[e])})}),u=n.createGain()
return u.gain.value=1,s.forEach(function(e,t){e.forEach(function(t,n){n>0&&e[n-1].connect(t.input)}),e[e.length-1].connect(l[t]),l[t].connect(o)}),o.connect(u),u.connect(i),i.connect(n.destination),{fx:s,gains:l,merger:o,analyserNode:i}}function a(e,t){var n=t.createBufferSource()
return n.buffer=e,n}function i(e,t){return e.map(function(e){return a(e,t)})}Object.defineProperty(e,"__esModule",{value:!0})
var r=.8,o=0,l=0
e.default=Ember.Service.extend({init:function(){this._super.apply(this,arguments),window.AudioContext=window.AudioContext||window.webkitAudioContext,this.set("ctx",new AudioContext)},adjustTime:function(e){var t=this.get("playing")
this.pause(),o+=e,o<0&&(o=0),t&&this.play()},fetchBuffers:function(e){var t=this
return new Promise(function(n,a){new BufferLoader(t.get("ctx"),e,function(e){return n(e)}).load()}).then(function(e){var a=n(e.length,t.get("ctx")),i=a.fx,r=a.analyserNode,o=a.merger,l=a.gains
return t.setProperties({analyserNode:r,bufferList:e,fx:i,gains:l,merger:o}),e})},getDuration:function(){return this.get("bufferList")[0].duration},getPosition:function(){return this.get("playing")?this.get("ctx").currentTime-l:o},pause:function(){this.get("playing")&&(this.tracks.forEach(function(e){return e.stop(0)}),o=this.get("ctx").currentTime-l,this.set("playing",!1))},play:function(){var e=this,t=o
this.tracks=i(this.bufferList,this.get("ctx")),this.tracks.forEach(function(t,n){return t.connect(e.fx[n][0].input)}),this.tracks.forEach(function(e){return e.start(0,t)}),l=this.get("ctx").currentTime-t,o=0,this.set("playing",!0)},playing:!1,stop:function(){this.tracks.forEach(function(e){return e.stop(0)}),l=0,o=0,this.set("playing",!1)}})}),define("ember-analyzer/services/visualizer",["exports"],function(e){function t(e,t,n){if(e.rotation.y+=2*f,e.rotation.x+=f,!(n>t||n<0)){var a=c/t
e.position.x=a*n+l}}function n(e,t,n,i,r){for(var s=[],d=0;d<u;d++){var f=l+d*p,c=a(f,p/2,o+5*d)
e.add(c),s.push(c)}return s}function a(e,t,n){var a=new THREE.BoxGeometry(t,t,t),i=new THREE.MeshPhongMaterial({color:n}),r=new THREE.Mesh(a,i)
return r.position.set(e,0,0),r.rotation.x=.3,r.rotation.y=.3,r}function i(e,t,n){e.scale.y=t/255*d+s,n?e.rotation.y+=f:e.rotation.y-=f}function r(e,t){var n=new Uint8Array(e.frequencyBinCount)
e.getByteFrequencyData(n)
for(var a=e.frequencyBinCount/u,r=0;r<u;r++){var o=r*a
i(t[r],n.slice(o,(r+1)*a).reduce(function(e,t){return e+t})/a,r%2==0)}}Object.defineProperty(e,"__esModule",{value:!0})
var o=13369344,l=-5,s=.5,u=48,d=50,f=.02,c=10,p=c/u
e.default=Ember.Service.extend({init:function(){var e=this.get("audioCtx"),i=new THREE.Scene,s=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3)
s.position.z=5
var d=new THREE.HemisphereLight(16777147,526368,1)
i.add(d)
var f=new THREE.WebGLRenderer
f.setSize(window.innerWidth-10,window.innerHeight-10)
var c=n(i,u,l,p,o),m=a(l,p/2,14483694)
m.position.y=-.5,i.add(m);(function n(){requestAnimationFrame(n)
var a=e.getPosition(),o=e.getDuration()
r(e.get("analyserNode"),c),t(m,o,a),f.render(i,s)})(),this.set("el",f.domElement)},audioCtx:Ember.inject.service("audio-ctx")})}),define("ember-analyzer/templates/application",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"xtC2Ci3y",block:'{"symbols":[],"statements":[[1,[18,"outlet"],false],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/application.hbs"}})}),define("ember-analyzer/templates/components/audio-visualizer",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"2OYJxE90",block:'{"symbols":["f","index"],"statements":[[4,"if",[[19,0,["loading"]]],null,{"statements":[[0,"  "],[1,[18,"loading-bars"],false],[0,"\\n"]],"parameters":[]},null],[6,"div"],[9,"id","top-controls"],[7],[0,"\\n  "],[6,"button"],[3,"action",[[19,0,[]],"rewind"]],[7],[0,"<<"],[8],[0,"\\n  "],[6,"button"],[10,"class",[26,[[25,"if",[[19,0,["audioCtx","playing"]],"blue","green"],null]]]],[3,"action",[[19,0,[]],"togglePlay"]],[7],[1,[25,"if",[[19,0,["audioCtx","playing"]],"pause","play"],null],false],[8],[0,"\\n  "],[6,"button"],[9,"class","red"],[3,"action",[[19,0,[]],"stop"]],[7],[0,"stop"],[8],[0,"\\n  "],[6,"button"],[3,"action",[[19,0,[]],"fastForward"]],[7],[0,">>"],[8],[0,"\\n"],[8],[0,"\\n\\n"],[6,"div"],[9,"id","bottom-controls"],[7],[0,"\\n"],[4,"each",[[19,0,["audioCtx","fx"]]],null,{"statements":[[0,"    "],[1,[25,"track-control",null,[["fx","audioCtx","idx","sliderChanged"],[[19,1,[]],[19,0,["audioCtx"]],[19,2,[]],"sliderChanged"]]],false],[0,"\\n"]],"parameters":[1,2]},null],[8],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/components/audio-visualizer.hbs"}})}),define("ember-analyzer/templates/components/loading-bars",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"N9SwxqGA",block:'{"symbols":[],"statements":[[6,"div"],[9,"class","loader"],[7],[8],[0,"\\n"],[6,"div"],[9,"class","loader-message"],[7],[0,"Loading Audio..."],[8],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/components/loading-bars.hbs"}})}),define("ember-analyzer/templates/components/track-control",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"nZyoY5t7",block:'{"symbols":["f","jdx"],"statements":[[6,"button"],[9,"class","fx"],[7],[0,"track "],[1,[25,"sum",[[19,0,["idx"]],1],null],false],[8],[0,"\\n"],[1,[25,"range-slider",null,[["start","on-slide"],[[19,0,["gainValue"]],"sliderChanged"]]],false],[0,"\\n"],[4,"each",[[19,0,["fx"]]],null,{"statements":[[0,"  "],[6,"button"],[10,"class",[26,["fx ",[25,"if",[[19,1,["bypass"]],"","red"],null]]]],[3,"action",[[19,0,[]],"activatePedal",[19,1,[]],[19,2,[]]]],[7],[1,[19,1,["name"]],false],[8],[0,"\\n"]],"parameters":[1,2]},null]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/components/track-control.hbs"}})}),define("ember-analyzer/templates/index",["exports"],function(e){Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ember.HTMLBars.template({id:"PbSqm5Wd",block:'{"symbols":[],"statements":[[1,[18,"audio-visualizer"],false],[0,"\\n"],[1,[18,"outlet"],false],[0,"\\n"]],"hasEval":false}',meta:{moduleName:"ember-analyzer/templates/index.hbs"}})})
define("ember-analyzer/config/environment",["ember"],function(e){try{var t="ember-analyzer/config/environment",n=document.querySelector('meta[name="'+t+'"]').getAttribute("content"),a=JSON.parse(unescape(n)),i={default:a}
return Object.defineProperty(i,"__esModule",{value:!0}),i}catch(e){throw new Error('Could not read config from meta tag with name "'+t+'".')}}),runningTests||require("ember-analyzer/app").default.create({name:"ember-analyzer",version:"0.0.0+7cd541f5"})