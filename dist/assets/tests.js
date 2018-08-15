'use strict';

define('rarwe/tests/acceptance/bands-test', ['qunit', '@ember/test-helpers', 'rarwe/tests/helpers/custom-helpers', 'ember-qunit', 'ember-cli-mirage/test-support/setup-mirage'], function (_qunit, _testHelpers, _customHelpers, _emberQunit, _setupMirage) {
  'use strict';

  //import needed test helpers
  //trigger visit, click, and filling in of a text input
  (0, _qunit.module)('Acceptance | Bands', function (hooks) {
    (0, _emberQunit.setupApplicationTest)(hooks);
    (0, _setupMirage.default)(hooks);

    (0, _qunit.test)('List bands', async function (assert) {
      //how we access mirage
      this.server.create('band', { name: 'Radiohead' });
      this.server.create('band', { name: 'Long Distance Calling' });
      //test redirection
      await (0, _customHelpers.loginAs)('dave@tcv.com');
      await (0, _testHelpers.visit)('/');

      assert.dom('[data-test-rr=band-link]').exists({ count: 2 }, 'All band links are rendered');

      assert.dom('[data-test-rr=band-list-item]:first-child').hasText("Radiohead", 'The first band link contains the band name');

      assert.dom('[data-test-rr=band-list-item]:last-child').hasText("Long Distance Calling", 'The other band link contains the band name');
    });

    (0, _qunit.test)('Create a band', async function (assert) {
      this.server.create('band', { name: 'Royal Blood' });

      await (0, _customHelpers.loginAs)('dave@tcv.com');
      await (0, _testHelpers.visit)('/');
      await (0, _customHelpers.createBand)('Caspian');

      assert.dom('[data-test-rr=band-list-item]').exists({ count: 2 }, 'A new band link is rendered');

      assert.dom('[data-test-rr=band-list-item]:last-child').hasText('Caspian', 'The new band link is rendered as the last item');

      assert.dom('[data-test-rr=songs-nav-item] > .active').hasText('Songs', 'The Songs tab is active');
    });

    (0, _qunit.test)('Sort songs in various ways', async function (assert) {
      let band = this.server.create('band', { name: 'Them Crooked Vultures' });
      this.server.create('song', { title: 'Elephants', rating: 5, band });
      this.server.create('song', { title: 'New Fang', rating: 4, band });
      this.server.create('song', { title: 'Mind Eraser, No Chaser', rating: 4, band });
      this.server.create('song', { title: 'Spinning In Daffodils', rating: 5, band });

      await (0, _customHelpers.loginAs)('dave@tcv.com');
      await (0, _testHelpers.visit)('/');
      await (0, _testHelpers.click)('[data-test-rr=band-link]');
      assert.equal((0, _testHelpers.currentURL)(), '/bands/1/songs');

      assert.dom('[data-test-rr=song-list-item]:first-child').hasText('Elephants', 'The first song is the highest ranked, first one in the alphabet');

      assert.dom('[data-test-rr=song-list-item]:last-child').hasText('New Fang', 'The last song is the lowest ranked, last one in the alphabet');

      await (0, _testHelpers.click)('[data-test-rr=sort-by-title-desc]');
      assert.equal((0, _testHelpers.currentURL)(), '/bands/1/songs?sort=titleDesc');

      assert.dom('[data-test-rr=song-list-item]:first-child').hasText('Spinning In Daffodils', 'The first song is the one that comes last in the alphabet');

      assert.dom('[data-test-rr=song-list-item]:last-child').hasText('Elephants', 'The last song is the one that comes first in the alphabet');

      await (0, _testHelpers.click)('[data-test-rr=sort-by-rating-asc]');
      assert.equal((0, _testHelpers.currentURL)(), '/bands/1/songs?sort=ratingAsc');

      assert.dom('[data-test-rr=song-list-item]:first-child').hasText('Mind Eraser, No Chaser', 'The first song is the lowest ranked, first one in the alphabet');

      assert.dom('[data-test-rr=song-list-item]:last-child').hasText('Spinning In Daffodils', 'The last song is the highest ranked, last one in the alphabet');

      await (0, _testHelpers.click)('[data-test-rr=sort-by-title-asc]');
      assert.equal((0, _testHelpers.currentURL)(), '/bands/1/songs?sort=titleAsc');

      assert.dom('[data-test-rr=song-list-item]:first-child').hasText('Elephants', 'The first song is first in the alphabet');

      assert.dom('[data-test-rr=song-list-item]:last-child').hasText('Spinning In Daffodils', 'The last song is last in the alphabet');
    });

    (0, _qunit.test)('Search songs', async function (assert) {
      let band = this.server.create('band', { name: 'Them Crooked Vultures' });
      this.server.create('song', { title: 'Elephants', rating: 5, band });
      this.server.create('song', { title: 'New Fang', rating: 4, band });
      this.server.create('song', { title: 'Mind Eraser, No Chaser', rating: 4, band });
      this.server.create('song', { title: 'Spinning In Daffodils', rating: 5, band });
      this.server.create('song', { title: 'No One Loves Me & Neither Do I', rating: 5, band });

      await (0, _customHelpers.loginAs)('dave@tcv.com');
      await (0, _testHelpers.visit)('/');
      await (0, _testHelpers.click)('[data-test-rr=band-link]');
      await (0, _testHelpers.fillIn)('[data-test-rr=search-box', 'no');

      assert.dom('[data-test-rr=song-list-item]').exists({ count: 2 }, 'The songs matching the search term are displayed');

      await (0, _testHelpers.click)('[data-test-rr=sort-by-title-desc');

      assert.dom('[data-test-rr=song-list-item]:first-child').hasText('No One Loves Me & Neither Do I', 'A matching song that comes later in the alphabet appears on top');

      assert.dom('[data-test-rr=song-list-item]:last-child').hasText('Mind Eraser, No Chaser', 'A matching song that comes sooner in the alphabet appears at the bottom');
    });

    (0, _qunit.test)('Visit landing page without signing in', async function (assert) {
      await (0, _testHelpers.visit)('/');

      assert.dom('[data-test-rr=form-header]').hasText('Log in to R&R');
      assert.dom('[data-test-rr=user-email]').doesNotExist();
    });
  }); //testing framework
});
define('rarwe/tests/acceptance/login-test', ['qunit', '@ember/test-helpers', 'ember-qunit', 'ember-cli-mirage/test-support/setup-mirage'], function (_qunit, _testHelpers, _emberQunit, _setupMirage) {
  'use strict';

  (0, _qunit.module)('Acceptance | Login', function (hooks) {
    (0, _emberQunit.setupApplicationTest)(hooks);
    (0, _setupMirage.default)(hooks);

    (0, _qunit.test)('Log in with valid credentials', async function (assert) {
      let email = 'dave@tcv.com';
      let password = 'ThemCr00ked!';
      this.server.create('user', { email, password });

      await (0, _testHelpers.visit)('/login');
      await (0, _testHelpers.fillIn)('#email', email);
      await (0, _testHelpers.fillIn)('#password', password);
      await (0, _testHelpers.click)('[data-test-rr=login-button]');

      assert.dom('[data-test-rr=bands-empty-message]').hasText("Let's start by creating a band.", "A descriptive empty message is shown");

      assert.dom('[data-test-rr=user-email]').hasText('dave@tcv.com', "The logged in user's email is shown");

      await (0, _testHelpers.click)('[data-test-rr=logout]');

      assert.dom('[data-test-rr=form-header]').hasText('Log in to R&R');
      assert.dom('[data-test-rr=user-email]').doesNotExist();
    });

    (0, _qunit.test)('Login client-side errors', async function (assert) {
      await (0, _testHelpers.visit)('/login');

      await (0, _testHelpers.fillIn)('#email', 'dave#tcv.com');
      await (0, _testHelpers.triggerEvent)('#email', 'blur');
      assert.dom('[data-test-rr=email-error]').hasText('Email should be a valid email', 'Email error is displayed');

      await (0, _testHelpers.fillIn)('#password', 'crooked');
      await (0, _testHelpers.triggerEvent)('#password', 'blur');
      assert.dom('[data-test-rr=password-error]').hasText('Password should be at least 8 characters', 'Password error is displayed');

      await (0, _testHelpers.fillIn)('#email', 'dave@tcv.com');
      assert.dom('[data-test-rr=email-error]').hasText('', 'Email error is no longer displayed');

      await (0, _testHelpers.fillIn)('#password', 'ThemCr00ked!');
      assert.dom('[data-test-rr=password-error]').hasText('', 'Password error is no longer displayed');
    });
  });
});
define('rarwe/tests/acceptance/sign-up-test', ['qunit', '@ember/test-helpers', 'ember-qunit', 'ember-cli-mirage/test-support/setup-mirage'], function (_qunit, _testHelpers, _emberQunit, _setupMirage) {
  'use strict';

  (0, _qunit.module)('Acceptance | Sign up', function (hooks) {
    (0, _emberQunit.setupApplicationTest)(hooks);
    (0, _setupMirage.default)(hooks);

    (0, _qunit.test)('Successful sign up', async function (assert) {
      await (0, _testHelpers.visit)('/sign-up');
      await (0, _testHelpers.fillIn)('#email', 'dave@tcv.com');
      await (0, _testHelpers.fillIn)('#password', 'ThemCr00ked!');
      await (0, _testHelpers.click)('[data-test-rr=sign-up-button]');

      assert.dom('[data-test-rr=form-header]').hasText('Log in to R&R', "User is redirected to log in");
    });

    (0, _qunit.test)('Sign up client-side errors', async function (assert) {
      await (0, _testHelpers.visit)('/sign-up');

      await (0, _testHelpers.fillIn)('#email', 'dave#tcv.com');
      await (0, _testHelpers.triggerEvent)('#email', 'blur');
      assert.dom('[data-test-rr=email-error]').hasText('Email should be a valid email', 'Email error is displayed');

      await (0, _testHelpers.fillIn)('#password', 'crooked');
      await (0, _testHelpers.triggerEvent)('#password', 'blur');
      assert.dom('[data-test-rr=password-error]').hasText('Password should be at least 8 characters', 'Password error is displayed');

      await (0, _testHelpers.fillIn)('#email', 'dave@tcv.com');
      assert.dom('[data-test-rr=email-error]').hasText('', 'Email error is no longer displayed');

      await (0, _testHelpers.fillIn)('#password', 'ThemCr00ked!');
      assert.dom('[data-test-rr=password-error]').hasText('', 'Password error is no longer displayed');
    });
  });
});
define('rarwe/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('adapters/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'adapters/application.js should pass ESLint\n\n');
  });

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('authenticators/credentials.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'authenticators/credentials.js should pass ESLint\n\n');
  });

  QUnit.test('components/star-rating.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/star-rating.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/application.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/application.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/bands.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/bands.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/bands/band/details.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/bands/band/details.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/bands/band/songs.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/bands/band/songs.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/login.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/login.js should pass ESLint\n\n');
  });

  QUnit.test('controllers/sign-up.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'controllers/sign-up.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/capitalize.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/capitalize.js should pass ESLint\n\n');
  });

  QUnit.test('models/band.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/band.js should pass ESLint\n\n');
  });

  QUnit.test('models/song.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/song.js should pass ESLint\n\n');
  });

  QUnit.test('models/user.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'models/user.js should pass ESLint\n\n');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/bands.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/bands.js should pass ESLint\n\n');
  });

  QUnit.test('routes/bands/band.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/bands/band.js should pass ESLint\n\n');
  });

  QUnit.test('routes/bands/band/details.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/bands/band/details.js should pass ESLint\n\n');
  });

  QUnit.test('routes/bands/band/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/bands/band/index.js should pass ESLint\n\n');
  });

  QUnit.test('routes/bands/band/songs.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/bands/band/songs.js should pass ESLint\n\n');
  });

  QUnit.test('routes/index.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/index.js should pass ESLint\n\n');
  });

  QUnit.test('routes/login.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/login.js should pass ESLint\n\n');
  });

  QUnit.test('routes/logout.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/logout.js should pass ESLint\n\n');
  });

  QUnit.test('routes/sign-up.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/sign-up.js should pass ESLint\n\n');
  });

  QUnit.test('utils/extract-server-error.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'utils/extract-server-error.js should pass ESLint\n\n');
  });

  QUnit.test('utils/wait.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'utils/wait.js should pass ESLint\n\n');
  });

  QUnit.test('validations/email-field.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'validations/email-field.js should pass ESLint\n\n');
  });

  QUnit.test('validations/password-field.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'validations/password-field.js should pass ESLint\n\n');
  });

  QUnit.test('validators/year-of-formation.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'validators/year-of-formation.js should pass ESLint\n\n');
  });
});
define('rarwe/tests/helpers/custom-helpers', ['exports', '@ember/test-helpers', 'ember-simple-auth/test-support'], function (exports, _testHelpers, _testSupport) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.createBand = createBand;
    exports.loginAs = loginAs;
    async function createBand(name) {
        await (0, _testHelpers.click)('[data-test-rr=new-band-label]');
        await (0, _testHelpers.fillIn)('[data-test-rr=new-band-input]', name);
        return (0, _testHelpers.click)('[data-test-rr=new-band-button]');
    }

    async function loginAs(email) {
        return (0, _testSupport.authenticateSession)({ token: 'a.signed.jwt', userEmail: email });
    }
});
define('rarwe/tests/helpers/ember-simple-auth', ['exports', 'ember-simple-auth/authenticators/test'], function (exports, _test) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.authenticateSession = authenticateSession;
  exports.currentSession = currentSession;
  exports.invalidateSession = invalidateSession;


  const TEST_CONTAINER_KEY = 'authenticator:test';

  function ensureAuthenticator(app, container) {
    const authenticator = container.lookup(TEST_CONTAINER_KEY);
    if (!authenticator) {
      app.register(TEST_CONTAINER_KEY, _test.default);
    }
  }

  function authenticateSession(app, sessionData) {
    const { __container__: container } = app;
    const session = container.lookup('service:session');
    ensureAuthenticator(app, container);
    session.authenticate(TEST_CONTAINER_KEY, sessionData);
    return app.testHelpers.wait();
  }

  function currentSession(app) {
    return app.__container__.lookup('service:session');
  }

  function invalidateSession(app) {
    const session = app.__container__.lookup('service:session');
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
    return app.testHelpers.wait();
  }
});
define('rarwe/tests/integration/components/star-rating-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Component | star-rating', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    (0, _qunit.test)('Renders the full and empty stars correctly', async function (assert) {
      this.set('rating', 4);
      this.set('maxRating', 5);

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "cZAAUXyg",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"star-rating\",null,[[\"rating\",\"maxRating\"],[[23,[\"rating\"]],[23,[\"maxRating\"]]]]],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.dom('.fa-star').exists({ count: 4 }, 'The right amount of full stars is rendered');
      assert.dom('.fa-star-o').exists({ count: 1 }, 'The right amount of empty stars is rendered');

      this.set('maxRating', 10);

      assert.dom('.fa-star').exists({ count: 4 }, 'The right amount of full stars is rendered after changing maxRating');
      assert.dom('.fa-star-o').exists({ count: 6 }, 'The right amount of empty stars is rendered after changing maxRating');

      this.set('rating', 2);

      assert.dom('.fa-star').exists({ count: 2 }, 'The right amount of full stars is rendered after changing rating');
      assert.dom('.fa-star-o').exists({ count: 8 }, 'The right amount of empty stars is rendered after changing rating');
    });

    (0, _qunit.test)('The setRating action', async function (assert) {
      this.set('song', Ember.Object.create({ rating: 3 }));
      this.set('actions', {
        updateRating(song, rating) {
          song.set('rating', rating);
        }
      });

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "kvGoyrLP",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"star-rating\",null,[[\"rating\",\"onClick\"],[[23,[\"rating\"]],[27,\"action\",[[22,0,[]],\"updateRating\",[23,[\"song\"]]],null]]]],false]],\"hasEval\":false}",
        "meta": {}
      }));
      await (0, _testHelpers.click)('[data-test-rr=star-rating-5]');
      assert.equal(this.get('song.rating'), 5, "The clicked star's rating is correctly sent");
    });
  });
});
define('rarwe/tests/integration/helpers/capitalize-test', ['qunit', 'ember-qunit', '@ember/test-helpers'], function (_qunit, _emberQunit, _testHelpers) {
  'use strict';

  (0, _qunit.module)('Integration | Helper | capitalize', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it renders', async function (assert) {
      this.set('inputValue', '1234');

      await (0, _testHelpers.render)(Ember.HTMLBars.template({
        "id": "JTP2SijC",
        "block": "{\"symbols\":[],\"statements\":[[1,[27,\"capitalize\",[[23,[\"inputValue\"]]],null],false]],\"hasEval\":false}",
        "meta": {}
      }));

      assert.equal(this.element.textContent.trim(), '1234');
    });
  });
});
define('rarwe/tests/test-helper', ['rarwe/app', 'rarwe/config/environment', '@ember/test-helpers', 'ember-qunit'], function (_app, _environment, _testHelpers, _emberQunit) {
  'use strict';

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));

  (0, _emberQunit.start)();
});
define('rarwe/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('acceptance/bands-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/bands-test.js should pass ESLint\n\n');
  });

  QUnit.test('acceptance/login-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/login-test.js should pass ESLint\n\n');
  });

  QUnit.test('acceptance/sign-up-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'acceptance/sign-up-test.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/custom-helpers.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/custom-helpers.js should pass ESLint\n\n');
  });

  QUnit.test('integration/components/star-rating-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/components/star-rating-test.js should pass ESLint\n\n');
  });

  QUnit.test('integration/helpers/capitalize-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'integration/helpers/capitalize-test.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/bands/band/songs-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/bands/band/songs-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/controllers/login-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/controllers/login-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/models/band-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/models/band-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/bands-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/bands-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/routes/bands/band-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/bands/band-test.js should pass ESLint\n\n');
  });

  QUnit.test('unit/validators/year-of-formation-test.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/validators/year-of-formation-test.js should pass ESLint\n\n');
  });
});
define('rarwe/tests/unit/controllers/bands/band/songs-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  //singleton test

  (0, _qunit.module)('Unit | Controller | bands/band/songs', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('isAddButtonDisabled', function (assert) {
      //fetch single controller instance
      let controller = this.owner.lookup('controller:bands/band/songs');

      controller.set('newSongTitle', 'Belenos');
      assert.notOk(controller.get('isAddButtonDisabled'), 'The button is not disabled when there is a title');
      controller.set('newSongTitle', '');
      assert.ok(controller.get('isAddButtonDisabled'), 'The button is disabled when the title is empty');
    });
  });
});
define('rarwe/tests/unit/controllers/login-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Controller | login', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:login');
      assert.ok(controller);
    });
  });
});
define('rarwe/tests/unit/models/band-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Model | Band', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('#isGreatBand', function (assert) {
      //difference for nonsingleton test:
      let store = this.owner.lookup('service:store');
      let pearlJam = Ember.run(() => {
        let songs = [store.createRecord('song', { title: 'Daughter', rating: 5 }), store.createRecord('song', { title: 'Rearviewmirror', rating: 4 }), store.createRecord('song', { title: 'Who You Are', rating: 2 })];
        return store.createRecord('band', { songs: Ember.A(songs) });
      });
      assert.ok(pearlJam.get('isGreatBand'), 'A band with 2 or more good songs is a great band');

      let stiltskin = Ember.run(() => {
        let songs = [store.createRecord('song', { title: 'Inside', rating: 5 })];
        return store.createRecord('band', { songs: Ember.A(songs) });
      });
      assert.notOk(stiltskin.get('isGreatBand'), 'A band with less than 2 good songs is not a great band');
    });
  });
});
define('rarwe/tests/unit/routes/bands-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | bands', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:bands');
      assert.ok(route);
    });
  });
});
define('rarwe/tests/unit/routes/bands/band-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Route | bands/band', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:bands/band');
      assert.ok(route);
    });
  });
});
define('rarwe/tests/unit/validators/year-of-formation-test', ['qunit', 'ember-qunit'], function (_qunit, _emberQunit) {
  'use strict';

  (0, _qunit.module)('Unit | Validator | year-of-formation', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);

    // Replace this with your real tests.
    (0, _qunit.test)('it exists', function (assert) {
      const validator = this.owner.lookup('validator:year-of-formation');
      assert.ok(validator);
    });
  });
});
define('rarwe/config/environment', [], function() {
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

require('rarwe/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
