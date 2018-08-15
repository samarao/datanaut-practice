import DS from 'ember-data';
import { buildValidations } from 'ember-cp-validations';
import emailFieldValidation from 'rarwe/validations/email-field';
import passwordFieldValidation from 'rarwe/validations/password-field';

const { attr } = DS;

const Validations = buildValidations({
    email: emailFieldValidation,
    password: passwordFieldValidation
});

export default DS.Model.extend(Validations, {
    email: attr('string'),
    password: attr('string'),
});
