import DS from 'ember-data';
//import { belongsTo } from 'ember-data/relationships';

const { Model, attr, belongsTo } = DS;

export default Model.extend({
    title: attr('string'),
    rating: attr('number'),
    band: belongsTo(),
});