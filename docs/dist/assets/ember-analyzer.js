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
define('ember-analyzer/components/audio-visualizer', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Component.extend({
    /**
     * load tracks and setup visualizer
     */
    init: function init() {
      var _this = this;

      this._super.apply(this, arguments);

      // fetch the buffers
      this.get('audioCtx').fetchBuffers(['./samples/guitar_1.mp3', './samples/guitar_2.mp3', './samples/vocal.mp3'])

      // setup the visualizer
      .then(function (bufferList) {
        // hack to set initial gains
        _this.set('audioCtx.gains.0.gain.value', 0.25); // rhythm guitar
        _this.set('audioCtx.gains.1.gain.value', 0.3); // rhythm guitar
        _this.set('audioCtx.gains.2.gain.value', 2); // vocal

        // create the visualizer and append it to the body
        _this.set('visualizer', Ember.inject.service('visualizer'));
        document.body.appendChild(_this.get('visualizer.el'));
      });
    },


    actions: {
      /**
       * fast forwards the tracks
       */
      fastForward: function fastForward() {
        this.get('audioCtx').adjustTime(10);
      },


      /**
       * plays all the tracks from the beginning
       */
      togglePlay: function togglePlay() {
        if (!this.get('audioCtx.playing')) {
          this.get('audioCtx').play();
        } else {
          this.get('audioCtx').stop();
        }
      },


      /**
       * pause playback if it's playing
       */
      pause: function pause() {
        this.get('audioCtx').pause();
      },


      /**
       * rewinds the tracks
       */
      rewind: function rewind() {
        this.get('audioCtx').adjustTime(-10);
      },


      /**
       * update gain node for track when slider changes
       * @param {number} value
       * @param {number} idx
       * @todo move this to the audioCtx - this is really ugly
       */
      sliderChanged: function sliderChanged(value, idx) {
        this.get('audioCtx.gains')[idx].gain.value = value / 50;
      }
    },

    /**
     * audio service
     */
    audioCtx: Ember.inject.service('audio-ctx'),

    /**
     * visualizer service
     */
    visualizer: Ember.inject.service('visualizer')
  });
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

    /**
     * get the initial gain value for a track
     * @returns number
     */
    gainValue: Ember.computed(function () {
      return this.get('audioCtx.gains')[this.get('idx')].gain.value * 50;
    }),

    actions: {
      /**
       * turns off bypass for a pedal
       * @param {object} pedal - the tuna pedal object
       * @param {number} idx - index of the pedal in the chain
       */
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
  /**
   * helper for getting sum of two numbers
   */
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
define('ember-analyzer/services/audio-ctx', ['exports', 'ember-analyzer/helpers/fx'], function (exports, _fx) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var SMOOTHING = 0.8;

  var PAUSED_AT = 0;
  var STARTED_AT = 0;

  exports.default = Ember.Service.extend({
    init: function init() {
      this._super.apply(this, arguments);

      // cross-browser audio context
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.set('ctx', new AudioContext());
    },


    /**
     * adjusts playback offset by given diff in seconds
     * @param {number} diff - number of seconds to rewind
     */
    adjustTime: function adjustTime(diff) {
      this.pause();

      // move pointer back
      PAUSED_AT += diff;

      // make sure it's not before the start
      if (PAUSED_AT < 0) PAUSED_AT = 0;

      this.play();
    },


    /**
     * fetches buffers by filename
     * @private
     * @param {string[]} files - an array of filenames
     * @returns {Promise}
     */
    fetchBuffers: function fetchBuffers(files) {
      var _this = this;

      var self = this;

      return new Promise(function (resolve, reject) {
        var bufferLoader = new BufferLoader(_this.get('ctx'), files, function (bufferList) {
          return resolve(bufferList);
        });
        bufferLoader.load();
      }).then(function (bufferList) {
        // build the audio path
        var _buildAudioPath = buildAudioPath(bufferList.length, _this.get('ctx')),
            fx = _buildAudioPath.fx,
            analyserNode = _buildAudioPath.analyserNode,
            merger = _buildAudioPath.merger,
            gains = _buildAudioPath.gains;

        // save the things


        _this.setProperties({
          analyserNode: analyserNode,
          bufferList: bufferList,
          fx: fx,
          gains: gains,
          merger: merger
        });

        return bufferList;
      });
    },


    /**
     * get the duration of the tracks
     * @returns {number}
     */
    getDuration: function getDuration() {
      return this.get('bufferList')[0].duration;
    },


    /**
     * get current position of playback in seconds
     * @returns {number}
     */
    getPosition: function getPosition() {
      if (this.get('playing')) return this.get('ctx').currentTime - STARTED_AT;else return PAUSED_AT;
    },


    /**
     * pauses tracks
     */
    pause: function pause() {
      // block errantly setting pausedAt
      if (!this.get('playing')) return;

      // stop them!
      this.tracks.forEach(function (track) {
        return track.stop(0);
      });

      // track time
      PAUSED_AT = this.get('ctx').currentTime - STARTED_AT;

      // set playToggleLabel
      this.set('playing', false);
    },


    /**
     * play tracks and init start/paused flags
     */
    play: function play() {
      var _this2 = this;

      var offset = PAUSED_AT;

      // create the tracks
      this.tracks = createTracks(this.bufferList, this.get('ctx'));

      // connect the tracks to the merger
      this.tracks.forEach(function (track, idx) {
        return track.connect(_this2.fx[idx][0].input);
      });

      // start em up
      this.tracks.forEach(function (track) {
        return track.start(0, offset);
      });

      // track time
      STARTED_AT = this.get('ctx').currentTime - offset;
      PAUSED_AT = 0;

      // set playing flag
      this.set('playing', true);
    },


    /**
     * playing flag
     */
    playing: false,

    /**
     * stop the tracks and clears paused/started flags
     */
    stop: function stop() {
      // stop them!
      this.tracks.forEach(function (track) {
        return track.stop(0);
      });

      // track time
      STARTED_AT = 0;
      PAUSED_AT = 0;

      // set playToggleLabel
      this.set('playing', false);
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
      return gain;
    });

    // create fx
    var fx = Array(numChannels).fill().map(function () {
      return Object.keys(_fx.default).map(function (name) {
        return new tuna[name](_fx.default[name]);
      });
    });

    // main gain
    var mainGain = audioCtx.createGain();
    mainGain.gain.value = 1;

    // build the path
    fx.forEach(function (chain, idx) {
      // connect pedals together
      chain.forEach(function (pedal, jdx) {
        if (jdx > 0) chain[jdx - 1].connect(pedal.input);
      });

      // connect to proper gain
      chain[chain.length - 1].connect(gains[idx]);

      // connect gain to merger
      gains[idx].connect(merger);
    });

    // connect merger -> mainGain -> analyserNode
    merger.connect(mainGain);
    mainGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    return { fx: fx, gains: gains, merger: merger, analyserNode: analyserNode };
  }

  /**
   * creates an individual audio track
   * @private
   * @param {Buffer} buffer
   * @param {AudioContext} audioCtx
   * @returns {AudioBufferSourceNode}
   */
  function createTrack(buffer, audioCtx) {
    var source = audioCtx.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  /**
   * creates tracks to be played from a list of audio buffers
   * @private
   * @param {Buffer[]} bufferList - a list of buffers
   * @param {AudioContext} audioCtx
   * @returns {AudioBufferSourceNode}[]} - an array of source nodes
   */
  function createTracks(bufferList, audioCtx) {
    return bufferList.map(function (buffer) {
      return createTrack(buffer, audioCtx);
    });
  }
});
define('ember-analyzer/services/visualizer', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  /**
   * constants for visualizer options
   * @todo make these dynamic options that can be passed to init
   */
  var COLOR = 0xcc0000;
  var OFFSET = -5;
  var INITIAL_HEIGHT = 0.5;
  var NUM_CUBES = 48;
  var SCALE = 50;
  var ROTATION_RATE = 0.02;
  var TOTAL_WIDTH = 10;
  var TRACKING_COLOR = 0xdd00ee;
  var WIDTH = TOTAL_WIDTH / NUM_CUBES;

  exports.default = Ember.Service.extend({
    init: function init() {
      // get the audio context
      var audioCtx = this.get('audioCtx');

      // crete the scene
      var scene = new THREE.Scene();

      // create the camera
      var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;

      // add some lighting
      var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
      scene.add(light);

      // create renderer
      var renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth - 10, window.innerHeight - 10);

      // add cubes for frequency visualization
      var cubes = addCubes(audioCtx.get('analyserNode'), scene);

      // add cube for tracking position in song
      var trackingCube = createCube(OFFSET, WIDTH / 2, TRACKING_COLOR);
      trackingCube.position.y = -0.5;
      scene.add(trackingCube);

      // animate update of cubes
      var animate = function animate() {
        // get the animation frame
        requestAnimationFrame(animate);

        var position = audioCtx.getPosition();
        var duration = audioCtx.getDuration();

        // update analyser cubes
        updateCubes(audioCtx.get('analyserNode'), cubes);

        // update the tracking cube
        updateTrackingCube(trackingCube, duration, position);

        // draw the scene
        renderer.render(scene, camera);
      };
      animate();

      // return the dom element for appending
      this.set('el', renderer.domElement);
    },


    audioCtx: Ember.inject.service('audio-ctx')
  });


  /**
   * updates tracking cube
   * @private
   * @param {THREE.Mesh} trackingCube
   * @param {number} duration
   * @param {number} position
   */
  function updateTrackingCube(trackingCube, duration, position) {
    trackingCube.rotation.y += ROTATION_RATE * 2;
    trackingCube.rotation.x += ROTATION_RATE;

    // fail fast if not playing
    if (position > duration || position < 0) return;

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
   * updates the properties of a cube
   * @private
   * @param {THREE.Mesh} cube - cube mesh to update
   * @param {number} value - value to use for update
   * @param {boolean} clockwise - direction for rotation
   */
  function updateCube(cube, value, clockwise) {
    cube.scale.y = value / 255 * SCALE + INITIAL_HEIGHT;
    // cube.material.color.setHex(cube.material.color + 1)

    if (clockwise) cube.rotation.y += ROTATION_RATE;else cube.rotation.y -= ROTATION_RATE;
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
  exports.default = Ember.HTMLBars.template({ "id": "GcoCxjcR", "block": "{\"symbols\":[\"f\",\"index\"],\"statements\":[[6,\"div\"],[9,\"id\",\"top-controls\"],[7],[0,\"\\n  \"],[6,\"button\"],[3,\"action\",[[19,0,[]],\"rewind\"]],[7],[0,\"<<\"],[8],[0,\"\\n  \"],[6,\"button\"],[10,\"class\",[26,[[25,\"if\",[[19,0,[\"audioCtx\",\"playing\"]],\"red\",\"green\"],null]]]],[3,\"action\",[[19,0,[]],\"togglePlay\"]],[7],[1,[25,\"if\",[[19,0,[\"audioCtx\",\"playing\"]],\"stop\",\"play\"],null],false],[8],[0,\"\\n  \"],[6,\"button\"],[9,\"class\",\"blue\"],[3,\"action\",[[19,0,[]],\"pause\"]],[7],[0,\"pause\"],[8],[0,\"\\n  \"],[6,\"button\"],[3,\"action\",[[19,0,[]],\"fastForward\"]],[7],[0,\">>\"],[8],[0,\"\\n\"],[8],[0,\"\\n\\n\"],[6,\"div\"],[9,\"id\",\"bottom-controls\"],[7],[0,\"\\n\"],[4,\"each\",[[19,0,[\"audioCtx\",\"fx\"]]],null,{\"statements\":[[0,\"    \"],[1,[25,\"track-control\",null,[[\"fx\",\"audioCtx\",\"idx\",\"sliderChanged\"],[[19,1,[]],[19,0,[\"audioCtx\"]],[19,2,[]],\"sliderChanged\"]]],false],[0,\"\\n\"]],\"parameters\":[1,2]},null],[8],[0,\"\\n\\n\"],[6,\"h1\"],[9,\"id\",\"advice\"],[7],[0,\"just play...\"],[8],[0,\"\\n\"]],\"hasEval\":false}", "meta": { "moduleName": "ember-analyzer/templates/components/audio-visualizer.hbs" } });
});
define("ember-analyzer/templates/components/track-control", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "nZyoY5t7", "block": "{\"symbols\":[\"f\",\"jdx\"],\"statements\":[[6,\"button\"],[9,\"class\",\"fx\"],[7],[0,\"track \"],[1,[25,\"sum\",[[19,0,[\"idx\"]],1],null],false],[8],[0,\"\\n\"],[1,[25,\"range-slider\",null,[[\"start\",\"on-slide\"],[[19,0,[\"gainValue\"]],\"sliderChanged\"]]],false],[0,\"\\n\"],[4,\"each\",[[19,0,[\"fx\"]]],null,{\"statements\":[[0,\"  \"],[6,\"button\"],[10,\"class\",[26,[\"fx \",[25,\"if\",[[19,1,[\"bypass\"]],\"\",\"red\"],null]]]],[3,\"action\",[[19,0,[]],\"activatePedal\",[19,1,[]],[19,2,[]]]],[7],[1,[19,1,[\"name\"]],false],[8],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"hasEval\":false}", "meta": { "moduleName": "ember-analyzer/templates/components/track-control.hbs" } });
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
  require("ember-analyzer/app")["default"].create({"name":"ember-analyzer","version":"0.0.0+65543d36"});
}
//# sourceMappingURL=ember-analyzer.map
