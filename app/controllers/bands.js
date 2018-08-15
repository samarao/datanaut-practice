import Controller from '@ember/controller';
import { empty } from '@ember/object/computed';

export default Controller.extend({
    isAddingBand: false,
    newBandName: '',

    isAddButtonDisabled: empty('newBandName'),

    actions: {
        addBand() {
            this.set('isAddingBand', true);
        },

        cancelAddBand() {
            this.set('isAddingBand', false);
        },

        //async as prefix for function declaration
        async saveBand(event) {
            //create a new band
            event.preventDefault();
            let newBand = this.store.createRecord('band', { name: this.newBandName });
            //async function call
            //sends a POST request to /bands
            //waits for promise resolution
            await newBand.save();

            this.setProperties({
                newBandName: '',
                isAddingBand: false
            });
            this.transitionToRoute('bands.band.songs', newBand.id);
        }
    }
});
