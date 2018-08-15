import Base from 'ember-simple-auth/authenticators/base';
import { inject as service } from '@ember/service';

export default Base.extend({
  ajax: service(),

  async restore(data) {
    return data;
  },

  async authenticate(username, password) {
    let response = await this.ajax.post('/token', {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      data: JSON.stringify({
        username,
        password
      })
    })
    let { user_email: userEmail, token } = response;
    return { userEmail, token };
  },

  //invalidate(data) {
  //}
});
