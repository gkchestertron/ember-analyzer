"use strict";



define('ember-analyzer/app', ['exports', 'ember-analyzer/resolver', 'ember-load-initializers', 'ember-analyzer/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
define('ember-analyzer/components/audio-visualizer', ['exports', 'ember-analyzer/helpers/fx'], function (exports, _fx) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  // constants for visualizer options
  var COLOR = 0xcc0000;
  var OFFSET = -5;
  var INITIAL_HEIGHT = 0.5;
  var NUM_CUBES = 48;
  var SCALE = 50;
  var ROTATION_RATE = 0.02;
  var SMOOTHING = 0.8;
  var TOTAL_WIDTH = 10;
  var TRACKING_COLOR = 0xdd00ee;
  var WIDTH = TOTAL_WIDTH / NUM_CUBES;

  exports.default = Ember.Component.extend({

    /**
     * load tracks and setup visualizer
     */
    init: function init() {
      var _this = this;

      // cross-browser audio context
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // flags
      this.pointers = {
        pausedAt: 0,
        startedAt: 0
      };
      this.set('pointers.playing', false); // using set makes it reactive

      // create the camera
      var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // fetch the buffers
      fetchBuffers(this.audioCtx, ['./samples/guitar_1.mp3', './samples/guitar_2.mp3', './samples/vocal.mp3'])

      // setup the visualizer
      .then(function (bufferList) {
        // save bufferList
        _this.set('bufferList', bufferList);

        // build the audio path

        var _buildAudioPath = buildAudioPath(bufferList.length, _this.audioCtx),
            fx = _buildAudioPath.fx,
            analyserNode = _buildAudioPath.analyserNode,
            merger = _buildAudioPath.merger,
            gains = _buildAudioPath.gains;

        _this.merger = merger;
        _this.gains = gains;
        _this.set('fx', fx);

        // create the visualizer and append it to the body
        var visualizer = createVisualizer(_this.audioCtx, analyserNode, camera, bufferList[0], _this.pointers);
        document.body.appendChild(visualizer);
      });

      this._super.apply(this, arguments);
    },


    actions: {

      /**
       * plays all the tracks from the beginning
       */
      togglePlay: function togglePlay() {
        if (!this.pointers.playing) {
          this.play();
        } else {
          this.stop();
        }
      },


      /**
       * pause playback if it's playing
       */
      pause: function pause() {
        // block errantly setting pausedAt
        if (!this.pointers.playing) return;

        // stop them!
        this.tracks.forEach(function (track) {
          return track.stop(0);
        });

        // track time
        this.pointers.pausedAt = this.audioCtx.currentTime - this.pointers.startedAt;

        // set playToggleLabel
        this.set('pointers.playing', false);
      },


      /**
       * update gain node for track when slider changes
       */
      sliderChanged: function sliderChanged(value, idx) {
        this.gains[idx].gain.value = value / 50;
      }
    },

    /**
     * play tracks and init start/paused flags
     */
    play: function play() {
      var _this2 = this;

      var offset = this.pointers.pausedAt;

      // create the tracks
      this.tracks = createTracks(this.bufferList, this.audioCtx);

      // connect the tracks to the merger
      this.tracks.forEach(function (track, idx) {
        return track.connect(_this2.fx[idx][0].input);
      });

      // start em up
      this.tracks.forEach(function (track) {
        return track.start(0, offset);
      });

      // track time
      this.pointers.startedAt = this.audioCtx.currentTime - offset;
      this.pointers.pausedAt = 0;

      // set playToggleLabel
      this.set('pointers.playing', true);
    },


    /**
     * stop the tracks and clears paused/started flags
     */
    stop: function stop() {
      // stop them!
      this.tracks.forEach(function (track) {
        return track.stop(0);
      });

      // track time
      this.pointers.startedAt = 0;
      this.pointers.pausedAt = 0;

      // set playToggleLabel
      this.set('pointers.playing', false);
    }
  });


  /**
   * builds the audio path
   * @private
   * @param {number} numChannels - number of channels
   * @param {AudioContext} audioCtx - the component's audio context
   * @return {}
   */
  function buildAudioPath(numChannels, audioCtx) {
    var tuna = new Tuna(audioCtx);

    // create the analyserNode
    var analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2048;
    analyserNode.smoothingTimeConstant = SMOOTHING;

    // create the merger
    var merger = audioCtx.createChannelMerger(numChannels);

    // create and connect the gain nodes
    var gains = Array(numChannels).fill().map(function (v, i) {
      var gain = audioCtx.createGain();

      if (i === 2) gain.gain.value = 2; // ugly hack for bad vocal track volume
      else gain.gain.value = 0.5;
      return gain;
    });

    // create fx
    var fx = Array(numChannels).fill().map(function () {
      return Object.keys(_fx.default).map(function (name) {
        return new tuna[name](_fx.default[name]);
      });
    });

    // build the path
    fx.forEach(function (chain, idx) {
      // connect pedals together
      chain.forEach(function (pedal, jdx) {
        if (jdx > 0) chain[jdx - 1].connect(pedal.input);
      });

      chain[chain.length - 1].connect(gains[idx]);
      gains[idx].connect(merger);
    });
    merger.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    return { fx: fx, gains: gains, merger: merger, analyserNode: analyserNode };
  }

  /**
   * creates tracks to be played from a list of audio buffers
   * @private
   * @param {Buffer[]} bufferList - a list of buffers
   * @returns {AudioBufferSourceNode}[]} - an array of source nodes
   */
  function createTracks(bufferList, audioCtx) {
    return bufferList.map(function (buffer) {
      return createTrack(buffer, audioCtx);
    });
  }

  /**
   * creates an individual audio track
   * @private
   * @param {Buffer} buffer
   * @returns {AudioBufferSourceNode}
   */
  function createTrack(buffer, audioCtx) {
    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  /**
   * creates the 3d visualizer for the audio
   * @private
   * @param {AudioBufferSourceNode} audioCtx
   * @param {AnalyserNode} analyserNode
   * @param {THREE.PerspectiveCamera} camera
   * @param {AudioBuffer} buffer
   * @param {object} pointers
   * @returns {Element}
   */
  function createVisualizer(audioCtx, analyserNode, camera, buffer, pointers) {
    // crete the scene
    var scene = new THREE.Scene();

    // add some lighting
    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(light);

    // create renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);

    // add cubes for frequency visualization
    var cubes = addCubes(analyserNode, scene);

    // add cube for tracking position in song
    var trackingCube = createCube(OFFSET, WIDTH / 2, TRACKING_COLOR);
    trackingCube.position.y = -0.5;
    scene.add(trackingCube);

    // animate update of cubes
    var animate = function animate(force) {
      // get the animation frame
      requestAnimationFrame(animate);

      // update analyser cubes
      updateCubes(analyserNode, cubes);

      // update the tracking cube
      updateTrackingCube(audioCtx.currentTime, buffer.duration, pointers, trackingCube);

      // draw the scene
      renderer.render(scene, camera);
    };
    animate();

    // return the dom element for appending
    return renderer.domElement;
  }

  /**
   * updates tracking cube
   * @private
   * @param {number} currentTime
   * @param {number} duration
   * @param {object} pointers
   * @param {THREE.Mesh} trackingCube
   */
  function updateTrackingCube(currentTime, duration, pointers, trackingCube) {
    trackingCube.rotation.y += ROTATION_RATE * 2;

    var position = currentTime - pointers.startedAt;

    // fail fast if not playing
    if (!pointers.playing || position > duration) return;

    // set the position
    var secWidth = TOTAL_WIDTH / duration;
    trackingCube.position.x = secWidth * position + OFFSET;
  }

  /**
   * adds all the cubes to the scene
   * @private
   * @param {AnalyserNode} analyserNode
   * @param {THREE.Scene} scene
   * @returns {THREE.Mesh[]}
   */
  function addCubes(analyserNode, scene) {
    var cubes = [];

    for (var i = 0; i < NUM_CUBES; i++) {
      var offset = OFFSET + i * WIDTH;
      var cube = createCube(offset, WIDTH / 2, COLOR + i * 5);
      scene.add(cube);
      cubes.push(cube);
    }

    return cubes;
  }

  /**
   * creates a cube
   * @private
   * @param {number} offset - offset from the left edge of the analyzer
   * @param {number} width - width of space for cube
   * @param {number} color - hexidecimal number for cube
   * @returns {THREE.Mesh}
   */
  function createCube(offset, width, color) {
    var geometry = new THREE.BoxGeometry(width, width, width);
    var material = new THREE.MeshPhongMaterial({ color: color });
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(offset, 0, 0);
    cube.rotation.x = 0.3;
    cube.rotation.y = 0.3;
    return cube;
  }

  /**
   * updates a list of cubes, given an analyserNode
   * @private
   * @param {AnalyserNode} analyserNode
   * @param {THREE.Mesh[]} cubes
   */
  function updateCubes(analyserNode, cubes) {
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(freqByteData);
    var bucketSize = analyserNode.frequencyBinCount / NUM_CUBES;

    for (var i = 0; i < NUM_CUBES; i++) {
      var freq = i * bucketSize;
      var cube = cubes[i];
      var avg = freqByteData.slice(freq, (i + 1) * bucketSize).reduce(function (a, b) {
        return a + b;
      }) / bucketSize;

      updateCube(cube, avg, i % 2 === 0);
    }
  }

  /**
   * updates the properties of a cube
   * @private
   * @param {THREE.Mesh} cube - cube mesh to update
   * @param {number} value - value to use for update
   * @param {boolean} clockwise - direction for rotation
   */
  function updateCube(cube, value, clockwise) {
    cube.scale.y = value / 255 * SCALE + INITIAL_HEIGHT;

    if (clockwise) cube.rotation.y += ROTATION_RATE;else cube.rotation.y -= ROTATION_RATE;
  }

  /**
   * fetches buffers by filename
   * @private
   * @param {AudioContext} audioCtx - an audio context
   * @param {string[]} files - an array of filenames
   * @returns {Promise}
   */
  function fetchBuffers(audioCtx, files) {
    return new Promise(function (resolve, reject) {
      var bufferLoader = new BufferLoader(audioCtx, files, function (bufferList) {
        return resolve(bufferList);
      });
      bufferLoader.load();
    });
  }
});
define('ember-analyzer/components/range-slider', ['exports', 'ember-cli-nouislider/components/range-slider'], function (exports, _rangeSlider) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _rangeSlider.default;
});
define('ember-analyzer/components/track-control', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    classNames: ['track-control-wrapper'],
    sliderRange: { min: 0, max: 100 },
    actions: {
      activatePedal: function activatePedal(pedal, idx) {
        if (pedal.bypass) this.set('fx.' + idx + '.bypass', 0);else this.set('fx.' + idx + '.bypass', 1);
      },


      /**
       * sends the value and index of track up to parent component
       * @param {number} value
       */
      sliderChanged: function sliderChanged(value) {
        this.sendAction('sliderChanged', value, this.idx);
      }
    }
  });
});
define('ember-analyzer/components/welcome-page', ['exports', 'ember-welcome-page/components/welcome-page'], function (exports, _welcomePage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
define('ember-analyzer/helpers/app-version', ['exports', 'ember-analyzer/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  var version = _environment.default.APP.version;
  function appVersion(_) {
    var hash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (hash.hideSha) {
      return version.match(_regexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_regexp.shaRegExp)[0];
    }

    return version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
define("ember-analyzer/helpers/fx", ["exports"], function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		Chorus: {
			rate: 1.5, // 0.01 to 8+
			feedback: 0.2, // 0 to 1+
			delay: 0.0045, // 0 to 1
			bypass: 1 // the value 1 starts the effect as bypassed, 0 or 1
		},
		// Delay: {
		// 	feedback                : 0.45,                          // 0 to 1+
		// 	delayTime               : 150,                           // how many milliseconds should the wet signal be delayed?
		// 	wetLevel                : 0.25,                          // 0 to 1+
		// 	dryLevel                : 1,                             // 0 to 1+
		// 	cutoff                  : 20,                            // cutoff frequency of the built in highpass-filter. 20 to 22050
		// 	bypass                  : 1
		// },
		Phaser: {
			rate: 1.2, // 0.01 to 8 is a decent range, but higher values are possible
			depth: 0.3, // 0 to 1
			feedback: 0.2, // 0 to 1+
			stereoPhase: 30, // 0 to 180
			baseModulationFrequency: 700, // 500 to 1500
			bypass: 1
		},
		Overdrive: {
			outputGain: 0.7, // 0 to 1+
			drive: 1, // 0 to 1
			curveAmount: 0.7, // 0 to 1
			algorithmIndex: 0, // 0 to 5, selects one of our drive algorithms
			bypass: 1
		},
		Compressor: {
			threshold: 0.5, // -100 to 0
			makeupGain: 1, // 0 and up
			attack: 1, // 0 to 1000
			release: 0, // 0 to 3000
			ratio: 4, // 1 to 20
			knee: 5, // 0 to 40
			automakeup: true, // true/false
			bypass: 1
		}
		// Tremolo: {
		// 	intensity               : 0.3,                           // 0 to 1
		// 	rate                    : 0.1,                           // 0.001 to 8
		// 	stereoPhase             : 0,                             // 0 to 180
		// 	bypass                  : 1
		// }
	};
});
define('ember-analyzer/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
define('ember-analyzer/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
define("ember-analyzer/helpers/sum", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.sum = sum;
  function sum(params) {
    return params.reduce(function (a, b) {
      return a + b;
    });
  }

  exports.default = Ember.Helper.helper(sum);
});
define('ember-analyzer/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'ember-analyzer/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _config$APP = _environment.default.APP,
      name = _config$APP.name,
      version = _config$APP.version;
  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
define('ember-analyzer/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('ember-analyzer/initializers/data-adapter', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('ember-analyzer/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
define('ember-analyzer/initializers/export-application-global', ['exports', 'ember-analyzer/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.initialize = initialize;
  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports.default = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('ember-analyzer/initializers/injectStore', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('ember-analyzer/initializers/store', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('ember-analyzer/initializers/transforms', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("ember-analyzer/instance-initializers/ember-data", ["exports", "ember-data/instance-initializers/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
define('ember-analyzer/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
define('ember-analyzer/router', ['exports', 'ember-analyzer/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });

  Router.map(function () {});

  exports.default = Router;
});
define('ember-analyzer/routes/index', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend({});
});
define('ember-analyzer/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _ajax.default;
    }
  });
});
define("ember-analyzer/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "xtC2Ci3y", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-analyzer/templates/application.hbs" } });
});
define("ember-analyzer/templates/components/audio-visualizer", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "2G7nXZlY", "block": "{\"symbols\":[\"f\",\"index\"],\"statements\":[[6,\"div\"],[9,\"id\",\"top-controls\"],[7],[0,\"\\n  \"],[6,\"button\"],[10,\"class\",[26,[[25,\"if\",[[19,0,[\"pointers\",\"playing\"]],\"red\",\"green\"],null]]]],[3,\"action\",[[19,0,[]],\"togglePlay\"]],[7],[1,[25,\"if\",[[19,0,[\"pointers\",\"playing\"]],\"stop\",\"play\"],null],false],[8],[0,\"\\n  \"],[6,\"button\"],[9,\"class\",\"blue\"],[3,\"action\",[[19,0,[]],\"pause\"]],[7],[0,\"pause\"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[6,\"div\"],[9,\"id\",\"bottom-controls\"],[7],[0,\"\\n\"],[4,\"each\",[[19,0,[\"fx\"]]],null,{\"statements\":[[0,\"    \"],[1,[25,\"track-control\",null,[[\"fx\",\"idx\",\"sliderChanged\"],[[19,1,[]],[19,2,[]],\"sliderChanged\"]]],false],[0,\"\\n\"]],\"parameters\":[1,2]},null],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-analyzer/templates/components/audio-visualizer.hbs" } });
});
define("ember-analyzer/templates/components/track-control", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "DZnHsjmN", "block": "{\"symbols\":[\"f\",\"jdx\"],\"statements\":[[6,\"button\"],[9,\"class\",\"fx\"],[7],[0,\"track \"],[1,[25,\"sum\",[[19,0,[\"idx\"]],1],null],false],[8],[0,\"\\n\"],[1,[25,\"range-slider\",null,[[\"start\",\"on-slide\"],[50,\"sliderChanged\"]]],false],[0,\"\\n\"],[4,\"each\",[[19,0,[\"fx\"]]],null,{\"statements\":[[0,\"  \"],[6,\"button\"],[10,\"class\",[26,[\"fx \",[25,\"if\",[[19,1,[\"bypass\"]],\"\",\"red\"],null]]]],[3,\"action\",[[19,0,[]],\"activatePedal\",[19,1,[]],[19,2,[]]]],[7],[1,[19,1,[\"name\"]],false],[8],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-analyzer/templates/components/track-control.hbs" } });
});
define("ember-analyzer/templates/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "PbSqm5Wd", "block": "{\"symbols\":[],\"statements\":[[1,[18,\"audio-visualizer\"],false],[0,\"\\n\"],[1,[18,\"outlet\"],false],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-analyzer/templates/index.hbs" } });
});


define('ember-analyzer/config/environment', ['ember'], function(Ember) {
  var prefix = 'ember-analyzer';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

if (!runningTests) {
  require("ember-analyzer/app")["default"].create({"name":"ember-analyzer","version":"0.0.0+695f7a00"});
}
//# sourceMappingURL=ember-analyzer.map
