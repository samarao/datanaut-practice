import Route from '@ember/routing/route';
//import { isEmpty } from '@ember/utils';

export default Route.extend({
    model(params) {
        return this.store.findRecord('band', params.id);
    },
});
