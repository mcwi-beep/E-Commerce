require("dotenv").config();
const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { log } = require('console');

const allowedOrigins = [
    'https://e-commerce-mern-frontend-vert.vercel.app',
    'https://e-commerce-admin-gamma-nine.vercel.app',

  ];
  
  app.use(cors({
    origin:  allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

// console.log(process.env.DATABASE_URL)

// Database Connection with MongoDB
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error.message);
  });

// API Creation
app.get("/", (req, res)=>{
   res.send("Express App is Running")
})

// Schema creating for user model

const Users = mongoose.model('Users', {
    name:{
        type: String,
    },
    email:{
        type: String,
        unique: true
    },
    password:{
        type: String
    },
    cartData: {
        type: Object
    },
    date:{
        type: Date,
        default: Date.now()
    }
})
// Creating Endpoints for registrating
app.post('/signup', async (req, res)=>{

 let check = await Users.findOne({email: req.body.email});
 if(check){
    return res.status(400).json({success: false, errors: "existing user found with the same user email address"})
 }
 let cart = {};
 for (let i=0; i< 300; i++){
    cart[i] = 0;
 }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  })

  await user.save()

  const data = {
    user:{
        id: user.id
    }
  }

  const token = jwt.sign(data, 'secret_ecom');
  res.json({success: true, token})

})

// Creating Endpoint for user login

app.post('/login', async (req, res)=>{
    let user = await Users.findOne({email: req.body.email})
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(data, 'secret_ecom')
            res.json({success: true, token})
        }else{
            res.json({succes: false, errors: "Wrong Password"})
        }
        
    }else{
        res.json({success: false, errors: "Wrong Email Id"})
    }

})



// Schema for Creating Products Model

const Product = mongoose.model("Product", {
    id:{
        type: Number,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true
    },
    new_price:{
        type: Number,
        required: true
    },
    old_price:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        default: Date.now,
    },
    availabe:{
        type: Boolean,
        default: true
    }
})

app.post('/addproduct', async(req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }else{
       id = 1;
}

const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price
   });
   console.log(product)
   await product.save()
   console.log('Saved')
   res.json({
    success: true,
    name: req.body.name
   })
})

// Creating API For deleting Products

app.post('/removeproduct', async(req, res)=>{
    await Product.findOneAndDelete({id: req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name: req.body.name
    })

})

// Creating API Endpoint for new collections
app.get('/newcollections', async(req, res)=>{
    let products = await Product.find({});
    let newCollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched!");
    res.send(newCollection)
})

// Creating API Endpoint for popular in women section
app.get('/popularinwomen', async(req, res)=>{
    let products = await Product.find({category: "women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched!");
    res.send(popular_in_women);
})

// creating middleware to fetch user
 const fetchUser = async(req, res, next) =>{
  
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors: "Please authenticate using valid token"})
    }else{
       try{
          const data = jwt.verify(token, 'secret_ecom');
          req.user = data.user;
          next();

       } catch(error){
          res.status(401).send({errors: "Verification failed"})
       }
    }
 }

// creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser, async(req, res)=>{
    console.log('added', req.body.itemId);
    let userData = await Users.findOne({_id: req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findByIdAndUpdate({_id: req.user.id},{cartData: userData.cartData});
    res.send('Added')
    // console.log(userData);
})

// creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async(req, res)=>{
    console.log('removed', req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId])
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id}, {cartData: userData})
    res.send('Removed')
})

// creating endpoint to get cartdata
app.post('/getcart', fetchUser, async(req, res)=>{
    
    let userData = await Users.findOne({_id: req.user.id});
    res.json(userData.cartData);
    console.log(userData.cartData);
})

app.listen(port,(error)=>{
    if(!error){
        console.log("Server running on port " + port)
    }else{
        console.log('Error: '+ error)
    }
})

// Creating API for getting all products
app.get('/allproducts', async(req, res)=>{
    let products = await Product.find({});
    console.log('All Products Fetched');
    res.send(products);
});

// Image Storage Engine

// const storage = multer.diskStorage({
//     destination: './upload/images',
//     filename: (req, file, cb)=>{
//        return cb(null, `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`)
//     }
// });

// const upload = multer({storage: storage})

// // Creating upload endpoint for images
// app.use('/images', express.static('upload/images'));

// app.post("/upload",upload.single('product'), (req,res)=>{
//     res.json({
//         success:1,
//         image_url:`http://localhost:${port}/images/${req.file.filename}`
//     })
// });

const storage = multer.diskStorage({
 
    filename: function (req, file, cb) {
      cb(null, `${file.fieldname}_${Date.now()}_${path.extname(file.originalname)}`);
    },
  });
  
  const upload = multer({ storage: storage });
  
  // Creating an endpoint for serving images
//   app.use('/images', express.static('/tmp/upload'));
  
  app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
      success: 1,
      image_url: `https://e-commerce-api-xi.vercel.app/images/${req.file.filename}`,
    });
  });
  
// Export the Express app
module.exports = app;
