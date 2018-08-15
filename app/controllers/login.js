import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
//import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import { buildValidations } from 'ember-cp-validations';
import emailFieldValidation from 'rarwe/validations/email-field';
import passwordFieldValidation from 'rarwe/validations/password-field';
import extractServerError from 'rarwe/utils/extract-server-error';

const Validations = buildValidations({
    email: emailFieldValidation,
    password: passwordFieldValidation
});

export default Controller.extend(Validations, /*UnauthenticatedRouteMixin,*/ {
    session: service(),

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
        async signIn(event) {
            event.preventDefault();
            try {
                let { email, password } = this;

                await this.get('session').authenticate('authenticator:credentials', email, password);
                await this.transitionToRoute('bands');
            } catch(response) {
                let errorMessage = extractServerError(response.errors);
                this.baseErrors.pushObject(errorMessage);
            }
        }
    }
});
