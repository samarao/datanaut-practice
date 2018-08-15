"use strict";



;define('rarwe/adapters/application', ['exports', 'ember-data', 'ember-simple-auth/mixins/data-adapter-mixin'], function (exports, _emberData, _dataAdapterMixin) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = _emberData.default.JSONAPIAdapter.extend(_dataAdapterMixin.default, {
        authorize(xhr) {
            let { token } = this.get('session.data.authenticated');
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
    });
});
;define('rarwe/app', ['exports', 'rarwe/resolver', 'ember-load-initializers', 'rarwe/config/environment'], function (exports, _resolver, _emberLoadInitializers, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);

  exports.default = App;
});
;define('rarwe/authenticators/credentials', ['exports', 'ember-simple-auth/authenticators/base'], function (exports, _base) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _base.default.extend({
    ajax: Ember.inject.service(),

    async restore(data) {
      return data;
    },

    async authenticate(username, password) {
      let response = await this.ajax.post('/token', {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json'
        },
        data: JSON.stringify({
          username,
          password
        })
      });
      let { user_email: userEmail, token } = response;
      return { userEmail, token };
    }

  } //invalidate(data) {
  //}
  );
});
;define('rarwe/components/star-rating', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Component.extend({
        classNames: ['rating-panel'],

        rating: 0,
        maxRating: 5,
        onClick() {},

        stars: Ember.computed('rating', 'maxRating', function () {
            let stars = [];
            //collecting number of full stars
            for (let i = 1; i <= this.maxRating; i++) {
                stars.push({ rating: i, isFull: this.rating >= i });
            }
            return stars;
        }),

        actions: {
            setRating(newRating) {
                return this.onClick(newRating);
            }
        }
    });
});
;define('rarwe/controllers/application', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Controller.extend({
        session: Ember.inject.service()
    });
});
;define('rarwe/controllers/bands', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Controller.extend({
        isAddingBand: false,
        newBandName: '',

        isAddButtonDisabled: Ember.computed.empty('newBandName'),

        actions: {
            addBand() {
                this.set('isAddingBand', true);
            },

            cancelAddBand() {
                this.set('isAddingBand', false);
            },

            //async as prefix for function declaration
            async saveBand(event) {
                //create a new band
                event.preventDefault();
                let newBand = this.store.createRecord('band', { name: this.newBandName });
                //async function call
                //sends a POST request to /bands
                //waits for promise resolution
                await newBand.save();

                this.setProperties({
                    newBandName: '',
                    isAddingBand: false
                });
                this.transitionToRoute('bands.band.songs', newBand.id);
            }
        }
    });
});
;define('rarwe/controllers/bands/band/details', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Controller.extend({
        isEditing: false,

        showErrors: Ember.computed('_showErrors', {
            get() {
                return this._showErrors || { description: false };
            },
            set(key, value) {
                this.set('_showErrors', value);
                return this._showErrors;
            }
        }),

        actions: {
            edit() {
                this.set('isEditing', true);
            },

            async save() {
                let band = this.model;

                this.set('showErrors.description', true);

                if (band.validations.isValid) {
                    await band.save();
                    this.set('isEditing', false);
                }
            }
        }
    });
});
;define('rarwe/controllers/bands/band/songs', ['exports', 'rarwe/helpers/capitalize'], function (exports, _capitalize) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Controller.extend({
        isAddingSong: false,
        newSongTitle: '',

        searchTerm: '',

        queryParams: {
            sortBy: 'sort',
            searchTerm: 's'
        },

        newSongPlaceholder: Ember.computed('model.name', function () {
            let bandName = this.model.name;
            return `New ${(0, _capitalize.capitalize)(bandName)} song`;
        }),

        matchingSongs: Ember.computed('model.songs.@each.title', 'searchTerm', function () {
            let searchTerm = this.searchTerm.toLowerCase();
            return this.model.get('songs').filter(song => {
                return song.title.toLowerCase().includes(searchTerm);
            });
        }),

        sortBy: 'ratingDesc',

        sortProperties: Ember.computed('sortBy', function () {
            let options = {
                ratingDesc: ['rating:desc', 'title:asc'],
                ratingAsc: ['rating:asc', 'title:asc'],
                titleDesc: ['title:desc'],
                titleAsc: ['title:asc']
            };
            return options[this.sortBy];
        }),

        sortedSongs: Ember.computed.sort('matchingSongs', 'sortProperties'),

        isAddButtonDisabled: Ember.computed.empty('newSongTitle'),

        actions: {
            addSong() {
                this.set('isAddingSong', true);
            },

            updateSortBy(sortBy) {
                this.set('sortBy', sortBy);
            },

            cancelAddSong() {
                this.set('isAddingSong', false);
            },

            async saveSong(event) {
                //create a new song
                event.preventDefault();
                let newSong = this.get('store').createRecord('song', {
                    title: this.get('newSongTitle'),
                    band: this.model
                });

                await newSong.save();
                this.set('newSongTitle', '');
            },

            //defining action in calling context
            updateRating(song, rating) {
                //sets rating to zero if current star is clicked
                song.set('rating', song.rating === rating ? 0 : rating);
                return song.save();
            }
        }
    });
});
;define('rarwe/controllers/login', ['exports', 'ember-cp-validations', 'rarwe/validations/email-field', 'rarwe/validations/password-field', 'rarwe/utils/extract-server-error'], function (exports, _emberCpValidations, _emailField, _passwordField, _extractServerError) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    //import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
    const Validations = (0, _emberCpValidations.buildValidations)({
        email: _emailField.default,
        password: _passwordField.default
    });

    exports.default = Ember.Controller.extend(Validations, /*UnauthenticatedRouteMixin,*/{
        session: Ember.inject.service(),

        showErrors: Ember.computed('_showErrors', {
            get() {
                return this._showErrors || { email: false, password: false };
            },
            set(key, value) {
                this.set('_showErrors', value);
                return this._showErrors;
            }
        }),

        actions: {
            async signIn(event) {
                event.preventDefault();
                try {
                    let { email, password } = this;

                    await this.get('session').authenticate('authenticator:credentials', email, password);
                    await this.transitionToRoute('bands');
                } catch (response) {
                    let errorMessage = (0, _extractServerError.default)(response.errors);
                    this.baseErrors.pushObject(errorMessage);
                }
            }
        }
    });
});
;define('rarwe/controllers/sign-up', ['exports', 'rarwe/utils/extract-server-error'], function (exports, _extractServerError) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Controller.extend({
        showErrors: Ember.computed('_showErrors', {
            get() {
                return this._showErrors || { email: false, password: false };
            },
            set(key, value) {
                this.set('_showErrors', value);
                return this._showErrors;
            }
        }),
        actions: {
            async signUp(event) {
                event.preventDefault();
                try {
                    await this.model.save();
                    await this.transitionToRoute('login');
                } catch (response) {
                    let errorMessage = (0, _extractServerError.default)(response.errors);
                    this.baseErrors.pushObject(errorMessage);
                }
            }
        }
    });
});
;define('rarwe/helpers/app-version', ['exports', 'rarwe/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _environment, _regexp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.appVersion = appVersion;
  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version;
    // e.g. 1.0.0-alpha.1+4jds75hf

    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility
    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;

    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      }
      // Fallback to just version
      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  exports.default = Ember.Helper.helper(appVersion);
});
;define('rarwe/helpers/capitalize', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.capitalize = capitalize;
  function capitalize(input) {
    let words = input.toString().split(/\s+/).map(word => {
      return Ember.String.capitalize(word.charAt(0)) + word.slice(1);
    });

    return words.join(' ');
  }

  exports.default = Ember.Helper.helper(capitalize);
});
;define('rarwe/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _pluralize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _pluralize.default;
});
;define('rarwe/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _singularize) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _singularize.default;
});
;define('rarwe/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'rarwe/config/environment'], function (exports, _initializerFactory, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  let name, version;
  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  exports.default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
});
;define('rarwe/initializers/container-debug-adapter', ['exports', 'ember-resolver/resolvers/classic/container-debug-adapter'], function (exports, _containerDebugAdapter) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
;define('rarwe/initializers/ember-cli-mirage', ['exports', 'rarwe/config/environment', 'rarwe/mirage/config', 'ember-cli-mirage/get-rfc232-test-context', 'ember-cli-mirage/start-mirage'], function (exports, _environment, _config, _getRfc232TestContext, _startMirage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.startMirage = startMirage;
  exports.default = {
    name: 'ember-cli-mirage',
    initialize(application) {
      if (_config.default) {
        application.register('mirage:base-config', _config.default, { instantiate: false });
      }
      if (_config.testConfig) {
        application.register('mirage:test-config', _config.testConfig, { instantiate: false });
      }

      _environment.default['ember-cli-mirage'] = _environment.default['ember-cli-mirage'] || {};
      if (_shouldUseMirage(_environment.default.environment, _environment.default['ember-cli-mirage'])) {
        startMirage(_environment.default);
      }
    }
  };
  function startMirage(env = _environment.default) {
    return (0, _startMirage.default)(null, { env, baseConfig: _config.default, testConfig: _config.testConfig });
  }

  function _shouldUseMirage(env, addonConfig) {
    if (typeof FastBoot !== 'undefined') {
      return false;
    }
    if ((0, _getRfc232TestContext.default)()) {
      return false;
    }
    let userDeclaredEnabled = typeof addonConfig.enabled !== 'undefined';
    let defaultEnabled = _defaultEnabled(env, addonConfig);

    return userDeclaredEnabled ? addonConfig.enabled : defaultEnabled;
  }

  /*
    Returns a boolean specifying the default behavior for whether
    to initialize Mirage.
  */
  function _defaultEnabled(env, addonConfig) {
    let usingInDev = env === 'development' && !addonConfig.usingProxy;
    let usingInTest = env === 'test';

    return usingInDev || usingInTest;
  }
});
;define('rarwe/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _setupContainer) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-data',
    initialize: _setupContainer.default
  };
});
;define('rarwe/initializers/ember-simple-auth', ['exports', 'rarwe/config/environment', 'ember-simple-auth/configuration', 'ember-simple-auth/initializers/setup-session', 'ember-simple-auth/initializers/setup-session-service', 'ember-simple-auth/initializers/setup-session-restoration'], function (exports, _environment, _configuration, _setupSession, _setupSessionService, _setupSessionRestoration) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-simple-auth',

    initialize(registry) {
      const config = _environment.default['ember-simple-auth'] || {};
      config.rootURL = _environment.default.rootURL || _environment.default.baseURL;
      _configuration.default.load(config);

      (0, _setupSession.default)(registry);
      (0, _setupSessionService.default)(registry);
      (0, _setupSessionRestoration.default)(registry);
    }
  };
});
;define('rarwe/initializers/export-application-global', ['exports', 'rarwe/config/environment'], function (exports, _environment) {
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
          willDestroy: function () {
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
;define('rarwe/instance-initializers/ember-cli-mirage-autostart', ['exports', 'ember-cli-mirage/instance-initializers/ember-cli-mirage-autostart'], function (exports, _emberCliMirageAutostart) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _emberCliMirageAutostart.default;
    }
  });
});
;define("rarwe/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _initializeStoreService) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: "ember-data",
    initialize: _initializeStoreService.default
  };
});
;define('rarwe/instance-initializers/ember-simple-auth', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    name: 'ember-simple-auth',

    initialize() {}
  };
});
;define('rarwe/mirage/config', ['exports', 'ember-cli-mirage/response'], function (exports, _response) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    this.get('/bands', function (schema, request) {
      if (!request.requestHeaders['Authorization']) {
        return new _response.default(401);
      }
      return schema.bands.all();
    });

    this.get('/bands/:id');
    this.get('/bands/:id/songs', function (schema, request) {
      let id = request.params.id;
      return schema.songs.where({ bandId: id });
    });
    //mock out post request
    this.post('/bands');
    this.post('/users');

    this.post('/token', function (schema, request) {
      let { username: email, password } = JSON.parse(request.requestBody);
      let users = schema.users.where({ email: email });
      if (users.length === 1 && users.models[0].password === password) {
        return {
          token: 'a.signed.jwt',
          user_email: email
        };
      }
    });

    // These comments are here to help you get started. Feel free to delete them.

    /*
      Config (with defaults).
       Note: these only affect routes defined *after* them!
    */

    // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
    // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
    // this.timing = 400;      // delay for each request, automatically set to 0 during testing

    /*
      Shorthand cheatsheet:
       this.get('/posts');
      this.post('/posts');
      this.get('/posts/:id');
      this.put('/posts/:id'); // or this.patch
      this.del('/posts/:id');
       http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
    */
  };
});
;define("rarwe/mirage/scenarios/default", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () /* server */{

    /*
      Seed your development database using your factories.
      This data will not be loaded in your tests.
    */

    // server.createList('post', 10);
  };
});
;define('rarwe/mirage/serializers/application', ['exports', 'ember-cli-mirage'], function (exports, _emberCliMirage) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberCliMirage.JSONAPISerializer.extend({});
});
;define('rarwe/mirage/serializers/band', ['exports', 'rarwe/mirage/serializers/application'], function (exports, _application) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = _application.default.extend({
        links(band) {
            return {
                songs: {
                    related: `/bands/${band.id}/songs`
                }
            };
        }
    });
});
;define('rarwe/models/band', ['exports', 'ember-data', 'ember-cp-validations'], function (exports, _emberData, _emberCpValidations) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    const Validations = (0, _emberCpValidations.buildValidations)({
        description: [(0, _emberCpValidations.validator)('length', {
            min: 12,
            message: "The description needs to be at least 12 characters"
        }), (0, _emberCpValidations.validator)('year-of-formation')]
    });

    const { Model, attr, hasMany } = _emberData.default;

    exports.default = Model.extend(Validations, {
        name: attr('string'),
        description: attr('string'),
        songs: hasMany(),

        isGreatBand: Ember.computed('songs.@each.rating', function () {
            let goodSongs = this.get('songs').filter(song => song.rating >= 4);
            return goodSongs.length >= 2;
        })
    });
});
;define('rarwe/models/song', ['exports', 'ember-data'], function (exports, _emberData) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    //import { belongsTo } from 'ember-data/relationships';

    const { Model, attr, belongsTo } = _emberData.default;

    exports.default = Model.extend({
        title: attr('string'),
        rating: attr('number'),
        band: belongsTo()
    });
});
;define('rarwe/models/user', ['exports', 'ember-data', 'ember-cp-validations', 'rarwe/validations/email-field', 'rarwe/validations/password-field'], function (exports, _emberData, _emberCpValidations, _emailField, _passwordField) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    const { attr } = _emberData.default;

    const Validations = (0, _emberCpValidations.buildValidations)({
        email: _emailField.default,
        password: _passwordField.default
    });

    exports.default = _emberData.default.Model.extend(Validations, {
        email: attr('string'),
        password: attr('string')
    });
});
;define('rarwe/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _emberResolver.default;
});
;define('rarwe/router', ['exports', 'rarwe/config/environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  //should all be fine

  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL
  });
  //import configuration from module via relative import


  Router.map(function () {
    this.route('bands', function () {
      this.route('band', { path: ':id' }, function () {
        this.route('songs');
        this.route('details');
      });
    });
    this.route('sign-up');
    this.route('login');
    this.route('logout');
  });

  exports.default = Router;
});
;define('rarwe/routes/application', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const { Route } = Ember;

  // Ensure the application route exists for ember-simple-auth's `setup-session-restoration` initializer
  exports.default = Route.extend();
});
;define('rarwe/routes/bands', ['exports', 'ember-simple-auth/mixins/authenticated-route-mixin'], function (exports, _authenticatedRouteMixin) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend(_authenticatedRouteMixin.default, {
        model() {
            return this.store.findAll('band');
        },

        actions: {
            didTransition() {
                document.title = 'Bands - Rock & Roll';
            }
        }
    });
});
;define('rarwe/routes/bands/band', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        model(params) {
            return this.store.findRecord('band', params.id);
        }
    });
});
;define('rarwe/routes/bands/band/details', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        model() {
            return this.modelFor('bands.band');
        },

        actions: {
            //
            willTransition(transition) {
                //verify controller was in edit mode
                //confirm exiting the page
                if (this.controller.isEditing) {
                    let leave = window.confirm('Are you sure?');
                    if (!leave) {
                        //aborts current transition & stays on current page
                        transition.abort();
                    }
                }
            }
        }
    });
});
;define('rarwe/routes/bands/band/index', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        redirect(band) {
            if (band.description) {
                this.transitionTo('bands.band.details');
            } else {
                this.transitionTo('bands.band.songs');
            }
        }
    });
});
;define('rarwe/routes/bands/band/songs', ['exports', 'rarwe/helpers/capitalize'], function (exports, _capitalize) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        model: function () {
            return this.modelFor('bands.band');
        },

        resetController(controller) {
            controller.setProperties({
                isAddingSong: false,
                newSongTitle: ''
            });
        },
        actions: {
            didTransition() {
                let band = this.modelFor('bands.band');
                let name = (0, _capitalize.capitalize)(band.name);
                document.title = `${name} songs - Rock & Roll`;
            }
        }
    });
});
;define('rarwe/routes/index', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        //redirection --> takes a route name, aborts current transition, attempts new transition
        beforeModel() {
            this.transitionTo('bands');
        }
    });
});
;define('rarwe/routes/login', ['exports', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _unauthenticatedRouteMixin) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.Route.extend(_unauthenticatedRouteMixin.default, {});
});
;define('rarwe/routes/logout', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend({
        session: Ember.inject.service(),

        beforeModel() {
            this.session.invalidate();
            this.transitionTo('login');
        }
    });
});
;define('rarwe/routes/sign-up', ['exports', 'ember-simple-auth/mixins/unauthenticated-route-mixin'], function (exports, _unauthenticatedRouteMixin) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = Ember.Route.extend(_unauthenticatedRouteMixin.default, {
        model() {
            return this.store.createRecord('user');
        }
    });
});
;define('rarwe/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _ajax) {
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
;define('rarwe/services/cookies', ['exports', 'ember-cookies/services/cookies'], function (exports, _cookies) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _cookies.default;
});
;define('rarwe/services/session', ['exports', 'ember-simple-auth/services/session'], function (exports, _session) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _session.default;
});
;define('rarwe/session-stores/application', ['exports', 'ember-simple-auth/session-stores/adaptive'], function (exports, _adaptive) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = _adaptive.default.extend();
});
;define("rarwe/templates/application", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "v2j6hQGd", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-container\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-page-header\"],[9],[0,\"\\n        \"],[2,\" add link to index route \"],[0,\"\\n\"],[4,\"link-to\",[\"index\"],null,{\"statements\":[[0,\"            \"],[7,\"h1\"],[11,\"class\",\"rr-app-title\"],[9],[0,\"Rock & Roll\"],[7,\"small\"],[11,\"class\",\"rr-subtitle\"],[9],[0,\" with Ember.js\"],[10],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[23,[\"session\",\"isAuthenticated\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"rr-user-panel\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"data-test-rr\",\"user-email\"],[9],[1,[23,[\"session\",\"data\",\"authenticated\",\"userEmail\"]],false],[10],[0,\"\\n            \"],[10],[0,\"\\n            |\\n            \"],[7,\"span\"],[9],[4,\"link-to\",[\"logout\"],[[\"data-test-rr\"],[\"logout\"]],{\"statements\":[[0,\"Logout\"]],\"parameters\":[]},null],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-main-content\"],[9],[0,\"\\n       \"],[1,[21,\"outlet\"],false],[0,\"\\n    \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/application.hbs" } });
});
;define("rarwe/templates/bands", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "iksTedhB", "block": "{\"symbols\":[\"band\"],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-sidebar\"],[9],[0,\"\\n    \"],[7,\"ul\"],[11,\"class\",\"rr-list\"],[9],[0,\"\\n\"],[4,\"each\",[[23,[\"model\"]]],null,{\"statements\":[[0,\"            \"],[7,\"li\"],[11,\"class\",\"rr-list-item\"],[11,\"data-test-rr\",\"band-list-item\"],[9],[0,\"\\n\"],[4,\"link-to\",[\"bands.band\",[22,1,[\"id\"]]],[[\"class\",\"data-test-rr\"],[\"rr-band-link\",\"band-link\"]],{\"statements\":[[0,\"                    \"],[1,[27,\"capitalize\",[[22,1,[\"name\"]]],null],false],[0,\"\\n                    \"],[7,\"span\"],[11,\"class\",\"rr-pointer\"],[9],[0,\"\\n                        \"],[7,\"i\"],[11,\"class\",\"fa fa-angle-right\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n                    \"],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[10],[0,\"\\n\"]],\"parameters\":[1]},null],[0,\"    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-new-label\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"isAddingBand\"]]],null,{\"statements\":[[0,\"            \"],[7,\"form\"],[11,\"class\",\"rr-inline-form\"],[12,\"onsubmit\",[27,\"action\",[[22,0,[]],\"saveBand\"],null]],[9],[0,\"\\n                \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"value\",\"placeholder\",\"data-test-rr\"],[\"text\",\"rr-input\",[23,[\"newBandName\"]],\"New band\",\"new-band-input\"]]],false],[0,\"\\n                \"],[7,\"button\"],[11,\"class\",\"rr-action-button\"],[12,\"disabled\",[21,\"isAddButtonDisabled\"]],[11,\"data-test-rr\",\"new-band-button\"],[11,\"type\",\"submit\"],[9],[0,\"Add\"],[10],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"rr-cancel-icon\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"cancelAddBand\"],null]],[9],[7,\"i\"],[11,\"class\",\"fa fa-times\"],[11,\"aria-hidden\",\"true\"],[9],[10],[10],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            \"],[7,\"label\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"addBand\"],null]],[11,\"data-test-rr\",\"new-band-label\"],[9],[0,\"\\n                \"],[7,\"i\"],[11,\"class\",\"fa fa-plus\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"m11\"],[9],[0,\"Add new band\"],[10],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"rr-main-panel\"],[9],[0,\"\\n    \"],[1,[21,\"outlet\"],false],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands.hbs" } });
});
;define("rarwe/templates/bands/band", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "k+iVQGKi", "block": "{\"symbols\":[],\"statements\":[[7,\"nav\"],[11,\"class\",\"rr-navbar\"],[11,\"role\",\"navigation\"],[9],[0,\"\\n    \"],[7,\"ul\"],[11,\"class\",\"rr-nav\"],[9],[0,\"\\n        \"],[7,\"li\"],[11,\"class\",\"rr-navbar-item\"],[11,\"data-test-rr\",\"details-nav-item\"],[9],[4,\"link-to\",[\"bands.band.details\"],null,{\"statements\":[[0,\"Details\"]],\"parameters\":[]},null],[10],[0,\"\\n        \"],[7,\"li\"],[11,\"class\",\"rr-navbar-item\"],[11,\"data-test-rr\",\"songs-nav-item\"],[9],[4,\"link-to\",[\"bands.band.songs\"],null,{\"statements\":[[0,\"Songs\"]],\"parameters\":[]},null],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10],[0,\"\\n\\n\"],[1,[21,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands/band.hbs" } });
});
;define("rarwe/templates/bands/band/details", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "kul6AGlD", "block": "{\"symbols\":[],\"statements\":[[7,\"section\"],[11,\"class\",\"rr-panel b--solid br1 bw1\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-inline-form fr\"],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-inline-form-group\"],[9],[0,\"\\n            \"],[7,\"span\"],[11,\"class\",\"rr-cancel-icon-let\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"isEditing\"]]],null],false],null]],[9],[0,\"\\n                \"],[7,\"i\"],[11,\"class\",\"fa fa-times\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"button\"],[11,\"class\",\"rr-action-button m11\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],[27,\"if\",[[23,[\"isEditing\"]],\"save\",\"edit\"],null]],null]],[11,\"type\",\"button\"],[9],[0,\"\\n                \"],[1,[27,\"if\",[[23,[\"isEditing\"]],\"Save\",\"Edit\"],null],false],[0,\"\\n            \"],[10],[0,\"\\n        \"],[10],[0,\"\\n    \"],[10],[0,\"\\n    \"],[7,\"h3\"],[9],[0,\"Description\"],[10],[0,\"\\n\"],[4,\"if\",[[23,[\"isEditing\"]]],null,{\"statements\":[[4,\"if\",[[23,[\"showErrors\",\"description\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"rr-form-field-error\"],[11,\"data-test-rr\",\"description-error\"],[9],[1,[27,\"get\",[[27,\"get\",[[27,\"get\",[[27,\"get\",[[23,[\"model\"]],\"validations\"],null],\"attrs\"],null],\"description\"],null],\"message\"],null],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[1,[27,\"textarea\",null,[[\"class\",\"value\"],[\"rr-textarea\",[23,[\"model\",\"description\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        \"],[7,\"p\"],[11,\"class\",\"1h-copy\"],[9],[1,[23,[\"model\",\"description\"]],false],[10],[0,\"\\n\"]],\"parameters\":[]}],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands/band/details.hbs" } });
});
;define("rarwe/templates/bands/band/error", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "uq2JARlQ", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-error-pane\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-error-message\"],[9],[0,\"\\n        Something went wrong while fetching data for the band.\\n    \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands/band/error.hbs" } });
});
;define("rarwe/templates/bands/band/loading", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "giXcG7Lw", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-loading-pane\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-loading-message\"],[9],[0,\"\\n        Fetching band data\\n    \"],[10],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-spinner\"],[9],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands/band/loading.hbs" } });
});
;define("rarwe/templates/bands/band/songs", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "4eXEnD0p", "block": "{\"symbols\":[\"song\"],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-controls-panel\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-sort-panel\"],[9],[0,\"\\n\"],[4,\"link-to\",[[27,\"query-params\",null,[[\"sort\"],[\"ratingDesc\"]]]],[[\"class\",\"data-test-rr\"],[\"rr-sort-button\",\"sort-by-rating-desc\"]],{\"statements\":[[0,\"            Rating\\n            \"],[7,\"i\"],[11,\"class\",\"fa fa-angle-down\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"link-to\",[[27,\"query-params\",null,[[\"sort\"],[\"ratingAsc\"]]]],[[\"class\",\"data-test-rr\"],[\"rr-sort-button\",\"sort-by-rating-asc\"]],{\"statements\":[[0,\"            Rating\\n            \"],[7,\"i\"],[11,\"class\",\"fa fa-angle-up\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"link-to\",[[27,\"query-params\",null,[[\"sort\"],[\"titleDesc\"]]]],[[\"class\",\"data-test-rr\"],[\"rr-sort-button\",\"sort-by-title-desc\"]],{\"statements\":[[0,\"            Title\\n            \"],[7,\"i\"],[11,\"class\",\"fa fa-angle-down\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"link-to\",[[27,\"query-params\",null,[[\"sort\"],[\"titleAsc\"]]]],[[\"class\",\"data-test-rr\"],[\"rr-sort-button\",\"sort-by-title-asc\"]],{\"statements\":[[0,\"            Title\\n            \"],[7,\"i\"],[11,\"class\",\"fa fa-angle-up\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-search-panel\"],[9],[0,\"\\n        \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"value\",\"data-test-rr\"],[\"text\",\"rr-input\",[23,[\"searchTerm\"]],\"search-box\"]]],false],[0,\"\\n        \"],[7,\"button\"],[11,\"class\",\"rr-search-button\"],[11,\"type\",\"button\"],[9],[7,\"i\"],[11,\"class\",\"fa fa-search\"],[11,\"aria-hidden\",\"true\"],[9],[10],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10],[0,\"\\n\"],[7,\"ul\"],[11,\"class\",\"rr-list\"],[9],[0,\"\\n\"],[4,\"each\",[[23,[\"sortedSongs\"]]],null,{\"statements\":[[0,\"        \"],[7,\"li\"],[11,\"class\",\"rr-list-item\"],[11,\"data-test-rr\",\"song-list-item\"],[9],[0,\"\\n            \"],[1,[27,\"capitalize\",[[22,1,[\"title\"]]],null],false],[0,\"\\n            \"],[1,[27,\"star-rating\",null,[[\"class\",\"rating\",\"onClick\"],[\"fr\",[22,1,[\"rating\"]],[27,\"action\",[[22,0,[]],\"updateRating\",[22,1,[]]],null]]]],false],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[1]},{\"statements\":[[0,\"        \"],[7,\"li\"],[11,\"class\",\"rr-empty-message\"],[9],[0,\"\\n            No \"],[1,[27,\"capitalize\",[[23,[\"model\",\"name\"]]],null],false],[0,\" songs yet, why don't you \"],[7,\"a\"],[11,\"href\",\"#\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"addSong\"],null]],[9],[0,\"create one?\"],[10],[0,\"\\n        \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[10],[0,\"\\n\"],[7,\"div\"],[11,\"class\",\"rr-new-label\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"isAddingSong\"]]],null,{\"statements\":[[0,\"            \"],[7,\"form\"],[11,\"class\",\"rr-inline-form\"],[12,\"onsubmit\",[27,\"action\",[[22,0,[]],\"saveSong\"],null]],[11,\"data-test-rr\",\"new-song-form\"],[9],[0,\"\\n                \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"value\",\"placeholder\",\"data-test-rr\"],[\"text\",\"rr-input\",[23,[\"newSongTitle\"]],[23,[\"newSongPlaceholder\"]],\"new-song-input\"]]],false],[0,\"\\n                \"],[7,\"div\"],[11,\"class\",\"rr-inline-form-group ml-auto\"],[9],[0,\"\\n                    \"],[7,\"button\"],[11,\"class\",\"rr-action-button\"],[12,\"disabled\",[21,\"isAddButtonDisabled\"]],[11,\"data-test-rr\",\"new-song-button\"],[11,\"type\",\"submit\"],[9],[0,\"Add\"],[10],[0,\"\\n                    \"],[7,\"span\"],[11,\"class\",\"rr-cancel-icon\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"cancelAddSong\"],null]],[9],[7,\"i\"],[11,\"class\",\"fa fa-times\"],[11,\"aria-hidden\",\"true\"],[9],[10],[10],[0,\"\\n                \"],[10],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            \"],[7,\"label\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"addSong\"],null]],[11,\"data-test-rr\",\"new-song-label\"],[9],[0,\"\\n                \"],[7,\"i\"],[11,\"class\",\"fa fa-plus\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"m11\"],[9],[0,\"Add new song\"],[10],[0,\"\\n            \"],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands/band/songs.hbs" } });
});
;define("rarwe/templates/bands/index", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "jhc54qzi", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-empty-message\"],[11,\"data-test-rr\",\"bands-empty-message\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-empty-message\"],[11,\"data-test-rr\",\"bands-empty-message\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"model\",\"length\"]]],null,{\"statements\":[[0,\"        Select a band.\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"        Let's start by creating a band.\\n\"]],\"parameters\":[]}],[0,\"    \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/bands/index.hbs" } });
});
;define("rarwe/templates/components/star-rating", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "aftuvlyP", "block": "{\"symbols\":[\"star\",\"&default\"],\"statements\":[[4,\"if\",[[24,2]],null,{\"statements\":[[0,\"    \"],[14,2,[[23,[\"stars\"]]]],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"each\",[[23,[\"stars\"]]],null,{\"statements\":[[0,\"        \"],[7,\"span\"],[11,\"class\",\"rating-star\"],[12,\"onclick\",[27,\"action\",[[22,0,[]],\"setRating\",[22,1,[\"rating\"]]],null]],[12,\"data-test-rr\",[27,\"concat\",[\"star-rating-\",[22,1,[\"rating\"]]],null]],[9],[0,\"\\n\"],[4,\"if\",[[22,1,[\"isFull\"]]],null,{\"statements\":[[0,\"                \"],[7,\"i\"],[11,\"class\",\"fa fa-star\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"                \"],[7,\"i\"],[11,\"class\",\"fa fa-star-o\"],[11,\"aria-hidden\",\"true\"],[9],[10],[0,\"\\n\"]],\"parameters\":[]}],[0,\"        \"],[10],[0,\"\\n\"]],\"parameters\":[1]},null]],\"parameters\":[]}]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/components/star-rating.hbs" } });
});
;define("rarwe/templates/loading", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "wZjcr8yM", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-loading-pane\"],[9],[0,\"\\n    \"],[7,\"div\"],[11,\"class\",\"rr-loading-message\"],[9],[0,\"\\n        Loading data\\n        \"],[7,\"div\"],[11,\"class\",\"rr-spinner\"],[9],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/loading.hbs" } });
});
;define("rarwe/templates/login", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "5zbnrjc5", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-form-container\"],[9],[0,\"\\n    \"],[7,\"h3\"],[11,\"data-test-rr\",\"form-header\"],[9],[0,\"Log in to R&R\"],[10],[0,\"\\n    \"],[7,\"form\"],[12,\"onsubmit\",[27,\"action\",[[22,0,[]],\"signIn\"],null]],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-inline-form-row\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"showErrors\",\"email\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"rr-form-field-error\"],[11,\"data-test-rr\",\"email-error\"],[9],[1,[27,\"get\",[[27,\"get\",[[27,\"get\",[[27,\"get\",[[22,0,[]],\"validations\"],null],\"attrs\"],null],\"email\"],null],\"message\"],null],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[7,\"label\"],[11,\"for\",\"email\"],[9],[0,\"Email\"],[10],[0,\"\\n            \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"id\",\"value\",\"focus-out\"],[\"email\",\"rr-input ml-auto\",\"email\",[22,0,[\"email\"]],[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"showErrors\",\"email\"]]],null],true],null]]]],false],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-inline-form-row\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"showErrors\",\"password\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"rr-form-field-error\"],[11,\"data-test-rr\",\"password-error\"],[9],[1,[27,\"get\",[[27,\"get\",[[27,\"get\",[[27,\"get\",[[22,0,[]],\"validations\"],null],\"attrs\"],null],\"password\"],null],\"message\"],null],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[7,\"label\"],[11,\"for\",\"password\"],[9],[0,\"Password\"],[10],[0,\"\\n            \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"id\",\"value\",\"focus-out\"],[\"password\",\"rr-input ml-auto\",\"password\",[22,0,[\"password\"]],[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"showErrors\",\"password\"]]],null],true],null]]]],false],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-form-footer\"],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"rr-button-panel\"],[9],[0,\"\\n                \"],[7,\"button\"],[11,\"class\",\"rr-action-button\"],[12,\"disabled\",[27,\"get\",[[27,\"get\",[[22,0,[]],\"validations\"],null],\"isInvalid\"],null]],[11,\"data-test-rr\",\"login-button\"],[11,\"type\",\"submit\"],[9],[0,\"Sign in\"],[10],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"rr-cta\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"mr1\"],[9],[0,\"Don't have an account yet?\"],[10],[0,\"\\n                    \"],[4,\"link-to\",[\"sign-up\"],[[\"class\"],[\"underline\"]],{\"statements\":[[0,\"Sign up now\"]],\"parameters\":[]},null],[0,\"\\n            \"],[10],[0,\"\\n        \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/login.hbs" } });
});
;define("rarwe/templates/logout", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "XvPfRpGY", "block": "{\"symbols\":[],\"statements\":[[1,[21,\"outlet\"],false]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/logout.hbs" } });
});
;define("rarwe/templates/sign-up", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = Ember.HTMLBars.template({ "id": "Uq9pYcZf", "block": "{\"symbols\":[],\"statements\":[[7,\"div\"],[11,\"class\",\"rr-form-container\"],[9],[0,\"\\n    \"],[7,\"h3\"],[9],[0,\"Sign up for R&R\"],[10],[0,\"\\n    \"],[7,\"form\"],[12,\"onsubmit\",[27,\"action\",[[22,0,[]],\"signUp\"],null]],[9],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-inline-form-row\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"showErrors\",\"email\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"rr-form-field-error\"],[11,\"data-test-rr\",\"email-error\"],[9],[1,[27,\"get\",[[27,\"get\",[[27,\"get\",[[27,\"get\",[[23,[\"model\"]],\"validations\"],null],\"attrs\"],null],\"email\"],null],\"message\"],null],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[7,\"label\"],[11,\"for\",\"email\"],[9],[0,\"Email\"],[10],[0,\"\\n            \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"id\",\"value\",\"focus-out\"],[\"email\",\"rr-input ml-auto\",\"email\",[23,[\"model\",\"email\"]],[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"showErrors\",\"email\"]]],null],true],null]]]],false],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-inline-form-row\"],[9],[0,\"\\n\"],[4,\"if\",[[23,[\"showErrors\",\"password\"]]],null,{\"statements\":[[0,\"            \"],[7,\"div\"],[11,\"class\",\"rr-form-field-error\"],[11,\"data-test-rr\",\"password-error\"],[9],[1,[27,\"get\",[[27,\"get\",[[27,\"get\",[[27,\"get\",[[23,[\"model\"]],\"validations\"],null],\"attrs\"],null],\"password\"],null],\"message\"],null],false],[10],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"            \"],[7,\"label\"],[11,\"for\",\"password\"],[9],[0,\"Password\"],[10],[0,\"\\n            \"],[1,[27,\"input\",null,[[\"type\",\"class\",\"id\",\"value\",\"focus-out\"],[\"password\",\"rr-input ml-auto\",\"password\",[23,[\"model\",\"password\"]],[27,\"action\",[[22,0,[]],[27,\"mut\",[[23,[\"showErrors\",\"password\"]]],null],true],null]]]],false],[0,\"\\n        \"],[10],[0,\"\\n        \"],[7,\"div\"],[11,\"class\",\"rr-form-footer\"],[9],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"rr-button-panel\"],[9],[0,\"\\n                \"],[7,\"button\"],[11,\"class\",\"rr-action-button\"],[12,\"disabled\",[27,\"get\",[[27,\"get\",[[23,[\"model\"]],\"validations\"],null],\"isInvalid\"],null]],[11,\"data-test-rr\",\"sign-up-button\"],[11,\"type\",\"submit\"],[9],[0,\"Sign up\"],[10],[0,\"\\n            \"],[10],[0,\"\\n            \"],[7,\"div\"],[11,\"class\",\"rr-cta\"],[9],[0,\"\\n                \"],[7,\"span\"],[11,\"class\",\"mr1\"],[9],[0,\"Already have an account?\"],[10],[0,\"\\n                    \"],[4,\"link-to\",[\"login\"],[[\"class\"],[\"underline\"]],{\"statements\":[[0,\"Log in\"]],\"parameters\":[]},null],[0,\"\\n            \"],[10],[0,\"\\n        \"],[10],[0,\"\\n    \"],[10],[0,\"\\n\"],[10]],\"hasEval\":false}", "meta": { "moduleName": "rarwe/templates/sign-up.hbs" } });
});
;define('rarwe/tests/mirage/mirage.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | mirage');

  QUnit.test('mirage/config.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/config.js should pass ESLint\n\n');
  });

  QUnit.test('mirage/scenarios/default.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/scenarios/default.js should pass ESLint\n\n');
  });

  QUnit.test('mirage/serializers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/serializers/application.js should pass ESLint\n\n');
  });

  QUnit.test('mirage/serializers/band.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'mirage/serializers/band.js should pass ESLint\n\n');
  });
});
;define('rarwe/utils/extract-server-error', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = extractServerError;


    const generalErrorMessage = "Something went wrong, sorry.";

    function extractServerError(errors) {
        if (!errors) {
            return generalErrorMessage;
        }

        let [errorObject] = errors;
        let { title, detail, source } = errorObject;
        if (!source) {
            return generalErrorMessage;
        }

        let { pointer } = source;
        let attributePath = pointer.split('/');
        let errorAttribute = attributePath[attributePath.length - 1];
        return errorAttribute === 'base' ? detail : `${Ember.String.capitalize(errorAttribute)} ${title}`;
    }
});
;define('rarwe/utils/wait', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = wait;
    function wait(delay) {
        return new Ember.RSVP.Promise(function (resolve) {
            setTimeout(function () {
                resolve();
            }, delay);
        });
    }
});
;define('rarwe/validations/email-field', ['exports', 'ember-cp-validations'], function (exports, _emberCpValidations) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = [(0, _emberCpValidations.validator)('presence', {
        presence: true,
        ignoreBlank: true,
        message: "Email can't be empty"
    }), (0, _emberCpValidations.validator)('format', {
        type: 'email',
        message: 'Email should be a valid email'
    })];
});
;define('rarwe/validations/password-field', ['exports', 'ember-cp-validations'], function (exports, _emberCpValidations) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.default = [(0, _emberCpValidations.validator)('presence', {
        presence: true,
        ignoreBlank: true,
        message: "Password can't be empty"
    }), (0, _emberCpValidations.validator)('length', {
        min: 8,
        message: 'Password should be at least 8 characters'
    })];
});
;define('rarwe/validators/alias', ['exports', 'ember-cp-validations/validators/alias'], function (exports, _alias) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _alias.default;
    }
  });
});
;define('rarwe/validators/belongs-to', ['exports', 'ember-cp-validations/validators/belongs-to'], function (exports, _belongsTo) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _belongsTo.default;
    }
  });
});
;define('rarwe/validators/collection', ['exports', 'ember-cp-validations/validators/collection'], function (exports, _collection) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _collection.default;
    }
  });
});
;define('rarwe/validators/confirmation', ['exports', 'ember-cp-validations/validators/confirmation'], function (exports, _confirmation) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _confirmation.default;
    }
  });
});
;define('rarwe/validators/date', ['exports', 'ember-cp-validations/validators/date'], function (exports, _date) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _date.default;
    }
  });
});
;define('rarwe/validators/dependent', ['exports', 'ember-cp-validations/validators/dependent'], function (exports, _dependent) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dependent.default;
    }
  });
});
;define('rarwe/validators/ds-error', ['exports', 'ember-cp-validations/validators/ds-error'], function (exports, _dsError) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _dsError.default;
    }
  });
});
;define('rarwe/validators/exclusion', ['exports', 'ember-cp-validations/validators/exclusion'], function (exports, _exclusion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _exclusion.default;
    }
  });
});
;define('rarwe/validators/format', ['exports', 'ember-cp-validations/validators/format'], function (exports, _format) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _format.default;
    }
  });
});
;define('rarwe/validators/has-many', ['exports', 'ember-cp-validations/validators/has-many'], function (exports, _hasMany) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _hasMany.default;
    }
  });
});
;define('rarwe/validators/inclusion', ['exports', 'ember-cp-validations/validators/inclusion'], function (exports, _inclusion) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _inclusion.default;
    }
  });
});
;define('rarwe/validators/inline', ['exports', 'ember-cp-validations/validators/inline'], function (exports, _inline) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _inline.default;
    }
  });
});
;define('rarwe/validators/length', ['exports', 'ember-cp-validations/validators/length'], function (exports, _length) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _length.default;
    }
  });
});
;define('rarwe/validators/messages', ['exports', 'ember-cp-validations/validators/messages'], function (exports, _messages) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _messages.default;
    }
  });
});
;define('rarwe/validators/number', ['exports', 'ember-cp-validations/validators/number'], function (exports, _number) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _number.default;
    }
  });
});
;define('rarwe/validators/presence', ['exports', 'ember-cp-validations/validators/presence'], function (exports, _presence) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function () {
      return _presence.default;
    }
  });
});
;define("rarwe/validators/year-of-formation", ["exports", "ember-cp-validations/validators/base"], function (exports, _base) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });


  const Description = _base.default.extend({
    validate(value) {
      let words = value.split(/\s+/);
      let currentYear = new Date().getFullYear();
      let yearOfFormation = words.find(word => {
        if (word.match(/\b\d{4}\b/)) {
          let year = parseInt(word, 10);
          return year > 1900 && year <= currentYear;
        }
      });
      return yearOfFormation ? true : "The year of formation must be included in the description";
    }
  });

  Description.reopenClass({
    /**
     * Define attribute specific dependent keys for your validator
     *
     * [
     * 	`model.array.@each.${attribute}` --> Dependent is created on the model's context
     * 	`${attribute}.isValid` --> Dependent is created on the `model.validations.attrs` context
     * ]
     *
     * @param {String}  attribute   The attribute being evaluated
     * @param {Unknown} options     Options passed into your validator
     * @return {Array}
     */
    getDependentsFor() /* attribute, options */{
      return [];
    }
  });

  exports.default = Description;
});
;

;define('rarwe/config/environment', [], function() {
  var prefix = 'rarwe';
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

;
          if (!runningTests) {
            require("rarwe/app")["default"].create({"name":"rarwe","version":"0.0.0+55c6f848"});
          }
        
//# sourceMappingURL=rarwe.map
