import { computed } from '@ember/object';
import DS from 'ember-data';
import { buildValidations, validator } from 'ember-cp-validations';

const Validations = buildValidations({
    description: [
        validator('length', {
            min: 12,
            message: "The description needs to be at least 12 characters"
        }),
        validator('year-of-formation')
    ]
})

const { Model, attr, hasMany } = DS;

export default Model.extend(Validations, {
    name: attr('string'),
    description: attr('string'),
    songs: hasMany(),

    isGreatBand: computed('songs.@each.rating', function() {
        let goodSongs = this.get('songs').filter((song) => song.rating >= 4);
        return goodSongs.length >= 2;
    })
});