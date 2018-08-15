import Route from '@ember/routing/route';

export default Route.extend({
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
