const mongoose = require('mongoose');
const unique = require('mongoose-unique-validator');
const validate = require('mongoose-validator');

//initialize Schema
const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    price:{
        type: Number,
        required: true,
    },
    stock:{
        type: Number,
        required: true,
    },
    img:{
        type: String,
        default:"placeholder.jpg"
    },
    timeCreated:{
        type: Date,
        default: ()=>Date.now(),
    }
});

//Utilizing validator to prevent duplicate product names
productSchema.plugin(unique, { message: 'Nama produk sudah ada dalam Database.' });

const Product = module.exports = mongoose.model('product', productSchema);