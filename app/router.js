//should all be fine

import EmberRouter from '@ember/routing/router';
//import configuration from module via relative import
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('bands', function() {
    this.route('band', { path: ':id' }, function() {
      this.route('songs');
      this.route('details');
    });
  });
  this.route('sign-up');
  this.route('login');
  this.route('logout');
});

export default Router;
