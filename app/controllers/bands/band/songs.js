import Controller from '@ember/controller';
import { empty, sort } from '@ember/object/computed';
import { computed } from '@ember/object';
import { capitalize } from '../../../helpers/capitalize';

export default Controller.extend({
    isAddingSong: false,
    newSongTitle: '',

    searchTerm: '',

    queryParams: {
        sortBy: 'sort',
        searchTerm: 's',
      },

    newSongPlaceholder: computed('model.name', function() {
        let bandName = this.model.name;
        return `New ${capitalize(bandName)} song`;
    }),

    matchingSongs: computed('model.songs.@each.title', 'searchTerm', function() {
        let searchTerm = this.searchTerm.toLowerCase();
        return this.model.get('songs').filter((song) => {
            return song.title.toLowerCase().includes(searchTerm);
        });
    }),

    sortBy: 'ratingDesc',

    sortProperties: computed('sortBy', function() {
        let options = {
            ratingDesc: ['rating:desc', 'title:asc'],
            ratingAsc: ['rating:asc', 'title:asc'],
            titleDesc: ['title:desc'],
            titleAsc: ['title:asc']
        };
        return options[this.sortBy];
    }),

    sortedSongs: sort('matchingSongs', 'sortProperties'),

    isAddButtonDisabled: empty('newSongTitle'),

    actions: {
        addSong() {
            this.set('isAddingSong', true);
        },

        updateSortBy(sortBy) {
            this.set('sortBy', sortBy);
      },

        cancelAddSong() {
            this.set('isAddingSong', false);
        },

        async saveSong(event) {
            //create a new song
            event.preventDefault();
            let newSong = this.get('store').createRecord('song', {
                title: this.get('newSongTitle'),
                band: this.model
            });

            await newSong.save();
            this.set('newSongTitle', '');
        },

        //defining action in calling context
        updateRating(song, rating) {
            //sets rating to zero if current star is clicked
            song.set('rating', song.rating === rating ? 0 : rating);
            return song.save();
        },
    }
});