const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const restaurantSchema = mongoose.Schema({
    name: String,
    location: String,
    about: String,
    image: String,
    url: String,
    category: String,
    favorite: Boolean
});

restaurantSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        location: this.location,
        about: this.about,
        image: this.image,
        url: this.url,
        category: this.category,
        favorite: this.favorite
    }
};

const recipeSchema = mongoose.Schema({
    title: String,
    image: String,
    about: String,
    ingredients: [String],
    instructions: String
});

recipeSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        image: this.image,
        about: this.about,
        ingredients: this.ingredients,
        instructions: this.instructions
    }
};

const chainSchema = mongoose.Schema({
    name: String,
    location: String,
    about: String,
    image: String,
    url: String,
    alternatives: [String]
});

chainSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        location: this.location,
        about: this.about,
        image: this.image,
        url: this.url,
        alternatives: this.alternatives
    }
};

const storeSchema = mongoose.Schema({
    name: String,
    location: String,
    about: String,
    image: String,
    alternatives: [String]
});

storeSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        location: this.location,
        about: this.about,
        image: this.image,
        alternatives: this.alternatives
    }
};

const reviewSchema = mongoose.Schema({
    title: String,
    restaurant: String,
    image: String,
    text: String,
    rating: Number
});

reviewSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        restaurant: this.restaurant,
        image: this.image,
        text: this.text,
        rating: this.rating
    }
};

reviewSchema.pre('find', function(next) {
    this.populate('restaurant');
    next();
});

reviewSchema.pre('findOne', function(next) {
    this.populate('restaurant');
    next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);
const Chain = mongoose.model('Chain', chainSchema);
const Store = mongoose.model('Store', storeSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = { Restaurant, Recipe, Chain, Store, Review };
