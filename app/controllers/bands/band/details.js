import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
    isEditing: false,

    showErrors: computed('_showErrors', {
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
