import Route from '@ember/routing/route';
import { capitalize as capitalizeWords } from 'rarwe/helpers/capitalize';
//import RSVP from "rsvp";

export default Route.extend({
    model: function() {
        return this.modelFor('bands.band');
    },

    resetController(controller) {
        controller.setProperties({
            isAddingSong: false,
            newSongTitle: ''
        });
    },
    actions: {
        didTransition() {
            let band = this.modelFor('bands.band');
            let name = capitalizeWords(band.name);
            document.title = `${name} songs - Rock & Roll`;
        }
    }
});