'use strict';

define('ember-analyzer/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('components/audio-visualizer.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/audio-visualizer.js should pass ESLint\n\n18:11 - \'bufferList\' is defined but never used. (no-unused-vars)');
  });

  QUnit.test('components/track-control.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/track-control.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/fx.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/fx.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/sum.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'helpers/sum.js should pass ESLint\n\n10:16 - \'Ember\' is not defined. (no-undef)');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/index.js should pass ESLint\n\n');
  });

  QUnit.test('services/audio-ctx.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/audio-ctx.js should pass ESLint\n\n42:9 - \'self\' is assigned a value but never used. (no-unused-vars)\n44:16 - \'Promise\' is not defined. (no-undef)\n44:34 - \'reject\' is defined but never used. (no-unused-vars)\n45:30 - \'BufferLoader\' is not defined. (no-undef)\n154:18 - \'Tuna\' is not defined. (no-undef)\n165:48 - \'i\' is defined but never used. (no-unused-vars)');
  });

  QUnit.test('services/visualizer.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'services/visualizer.js should pass ESLint\n\n23:21 - \'THREE\' is not defined. (no-undef)\n26:22 - \'THREE\' is not defined. (no-undef)\n30:21 - \'THREE\' is not defined. (no-undef)\n34:24 - \'THREE\' is not defined. (no-undef)\n121:22 - \'THREE\' is not defined. (no-undef)\n122:22 - \'THREE\' is not defined. (no-undef)\n123:18 - \'THREE\' is not defined. (no-undef)\n154:26 - \'Uint8Array\' is not defined. (no-undef)');
  });
});
define('ember-analyzer/tests/helpers/destroy-app', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = destroyApp;
  function destroyApp(application) {
    Ember.run(application, 'destroy');
  }
});
define('ember-analyzer/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember-analyzer/tests/helpers/start-app', 'ember-analyzer/tests/helpers/destroy-app'], function (exports, _qunit, _startApp, _destroyApp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _startApp.default)();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return resolve(afterEach).then(function () {
          return (0, _destroyApp.default)(_this.application);
        });
      }
    });
  };

  var resolve = Ember.RSVP.resolve;
});
define('ember-analyzer/tests/helpers/resolver', ['exports', 'ember-analyzer/resolver', 'ember-analyzer/config/environment'], function (exports, _resolver, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  var resolver = _resolver.default.create();

  resolver.namespace = {
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix
  };

  exports.default = resolver;
});
define('ember-analyzer/tests/helpers/start-app', ['exports', 'ember-analyzer/app', 'ember-analyzer/config/environment'], function (exports, _app, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = startApp;
  function startApp(attrs) {
    var attributes = Ember.merge({}, _environment.default.APP);
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

    return Ember.run(function () {
      var application = _app.default.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
      return application;
    });
  }
});
define('ember-analyzer/tests/integration/components/audio-vizualizer-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForComponent)('audio-vizualizer', 'Integration | Component | audio vizualizer', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template({
      "id": "657r0OL4",
      "block": "{\"symbols\":[],\"statements\":[[1,[18,\"audio-vizualizer\"],false]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template({
      "id": "NxXl4Xhb",
      "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"audio-vizualizer\",null,null,{\"statements\":[[0,\"      template block text\\n\"]],\"parameters\":[]},null],[0,\"  \"]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('ember-analyzer/tests/integration/components/track-control-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleForComponent)('track-control', 'Integration | Component | track control', {
    integration: true
  });

  (0, _emberQunit.test)('it renders', function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    this.render(Ember.HTMLBars.template({
      "id": "54YpeC/2",
      "block": "{\"symbols\":[],\"statements\":[[1,[18,\"track-control\"],false]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), '');

    // Template block usage:
    this.render(Ember.HTMLBars.template({
      "id": "Flmtxr/N",
      "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[4,\"track-control\",null,null,{\"statements\":[[0,\"      template block text\\n\"]],\"parameters\":[]},null],[0,\"  \"]],\"hasEval\":false}",
      "meta": {}
    }));

    assert.equal(this.$().text().trim(), 'template block text');
  });
});
define('ember-analyzer/tests/test-helper', ['ember-analyzer/tests/helpers/resolver', 'ember-qunit', 'ember-cli-qunit'], function (_resolver, _emberQunit, _emberCliQunit) {
  'use strict';

  (0, _emberQunit.setResolver)(_resolver.default);
  (0, _emberCliQunit.start)();
});
define('ember-analyzer/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('helpers/destroy-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/module-for-acceptance.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/start-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/audio-vizualizer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/audio-vizualizer-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/track-control-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/track-control-test.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/index-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/index-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/audio-ctx-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/audio-ctx-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/services/visualizer-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/services/visualizer-test.js should pass ESLint\n\n');
  });
});
define('ember-analyzer/tests/unit/routes/index-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('route:index', 'Unit | Route | index', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('ember-analyzer/tests/unit/services/audio-ctx-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('service:audio-ctx', 'Unit | Service | audio ctx', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });
});
define('ember-analyzer/tests/unit/services/visualizer-test', ['ember-qunit'], function (_emberQunit) {
  'use strict';

  (0, _emberQunit.moduleFor)('service:visualizer', 'Unit | Service | visualizer', {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var service = this.subject();
    assert.ok(service);
  });
});
require('ember-analyzer/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
