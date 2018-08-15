import Route from '@ember/routing/route';

export default Route.extend({
    //redirection --> takes a route name, aborts current transition, attempts new transition
    beforeModel() {
        this.transitionTo('bands');
    }
});
