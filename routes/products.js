// product routes

const { request, response } = require('express');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const stringCapitalizeName = require('string-capitalize-name');
const Product = require('../models/Product')

//image storage
const storage = multer.diskStorage({
    destination:function(request, file, callback){
        callback(null, './public/uploads');
    },

    //add back extension
    filename:function(request, file, callback){
        callback(null, Date.now() + file.originalname);
    },
});

//multer param for file extension
const whitelist = [
    'image/png',
    'image/jpeg',
    'image/jpg'
]

//multer upload param
const upload = multer({
    storage:storage,
    limits:{
        fieldSize: 512*512*3,
        fileSize: 102400, //upload limit 100KB per image
    },
    fileFilter: (request, file, cb) => {
        if(!whitelist.includes(file.mimetype)) {
            return cb('Only jpg, jpeg, and png format accepted');
        }
        cb(null, true);
    }
});

router.get('/new', (request, response)=>{
    response.render('new')
});

// Read One
router.get('/:id', (request, response) => {
    Product.findById(request.params.id)
      .then((result) => {
        response.json(result);
      })
      .catch((err) => {
        response.status(404).json({ success: false, msg: `No such Product.` });
      });
 });

// Read All
router.get('/', (request, response) => {
    Product.find({})
      .then((result) => {
        response.json(result);
      })
      .catch((err) => {
        response.status(500).json({ success: false, msg: `Something went wrong. ${err}` });
      });
});

// Create
router.post('/', upload.single('image'), (request,response)=>{
    
    let newProduct = new Product({
        name: sanitizeName(request.body.name),
        price: request.body.price,
        stock: request.body.stock,
        img: request.file.filename   
    });

    newProduct.save()
        .then((result) => {
            response.json({
                success: true,
                msg: `Date created!`
            })
        })
        .catch((err)=>{
            if(err.errors){
                response.status(500).json({ success: false, msg: `${err}` });
            }
        })
});

//route for handling product edit view
router.get('/edit/:id', upload.single('image'), async (request, response)=>{
    let product = await Product.findById(request.params.id);
    response.render('edit', { product: product });
});

//route for handling product edit

//Update
router.put('/:id', upload.single('image'), (request, response)=>{

    let updatedProduct = {
        name: sanitizeName(request.body.name),
        price : request.body.price,
        stock : request.body.stock,
        img : request.file.filename
    };

    Product.findOneAndUpdate({ _id: request.params.id }, updatedProduct, { runValidators: true, context: 'query' })
        .then((oldResult) => {
            Product.findOne({ _id: request.params.id })
            .then((newResult) => {
                response.json({
                    success: true,
                    msg: `Data updated!`,
                })
            })
            .catch((err)=>(response.status(500).json)({success:false, msg: `${err}`}))
        })
        .catch((err)=>(response.status(500).json)({success:false, msg: `${err}`}))
});

//route for handling delete
router.delete('/:id', (request, response)=>{
    User.findByIdAndRemove(request.params.id)
        .then((result)=>{
            response.json({
                success: true,
                msg: `Data deleted!`,
            })
        })
        .catch((err)=>(response.status(500).json)({success:false, msg: `${err}`}))
});

module.exports = router;

//Automatic capitalization for product name
sanitizeName = (name) => {
    return stringCapitalizeName(name);
}