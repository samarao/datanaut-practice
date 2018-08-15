import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { A } from '@ember/array';

module('Unit | Model | Band', function(hooks) {
  setupTest(hooks);

  test('#isGreatBand', function(assert) {
    //difference for nonsingleton test:
    let store = this.owner.lookup('service:store');
    let pearlJam = run(() => {
      let songs = [
        store.createRecord('song', { title: 'Daughter', rating: 5 }),
        store.createRecord('song', { title: 'Rearviewmirror', rating: 4 }),
        store.createRecord('song', { title: 'Who You Are', rating: 2 }),
      ];
      return store.createRecord('band', { songs: A(songs) });
    });
    assert.ok(pearlJam.get('isGreatBand'), 'A band with 2 or more good songs is a great band');

    let stiltskin = run(() => {
      let songs = [
        store.createRecord('song', { title: 'Inside', rating: 5 }),
      ];
      return store.createRecord('band', { songs: A(songs) });
    });
    assert.notOk(stiltskin.get('isGreatBand'), 'A band with less than 2 good songs is not a great band');
  });
});
