import Controller from '@ember/controller';
import { computed } from '@ember/object';
import extractServerError from 'rarwe/utils/extract-server-error';

export default Controller.extend({
    showErrors: computed('_showErrors', {
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
            } catch(response) {
                let errorMessage = extractServerError(response.errors);
                this.baseErrors.pushObject(errorMessage);
            }
        }
    }
});