require('dotenv').config();
const mongoose = require('mongoose')
const Schema = mongoose.Schema

let Schemas = {
    UserSchema : {
        username : { type : String, required : true},
        password : { type : String, required : true},
        nickname : { type : String, required : true},
        dateRegistered : { type : Date, required : true, default: () => new Date()},
        wishlist : [
            {
                type : Schema.Types.ObjectId, required : true, ref: 'Wish'
            }
        ]
    },
    WishSchema : {
        _id: {type:  Schema.ObjectId, required : true, auto : true},
        content : { type : String, required : true},
        image : { type : String, default : () => ""},
        signature : { type : String, required : true},
        dateCreated : { type : Date, required : true, default : () => new Date()},
        writer : { type : Schema.Types.ObjectId, required : true, ref : 'User'}
    }
}
let Models = {
    User : mongoose.model('User',Schemas.UserSchema),
    Wish : mongoose.model('Wish',Schemas.WishSchema)
}
module.exports = {
    Models : Models,
    connect : (cb = ()=>{})=>{
        mongoose.connect(process.env.MONGO_URI ,{ useNewUrlParser: true, useUnifiedTopology: true }).then((data)=>{
            console.log("Connect to MongoDB successfully !!!")
            cb(data)
        }).catch(err => {
            console.log("Connect to MongoDB failed !!!")
            console.error(err)
        })
    },
    newId : () => mongoose.Types.ObjectId()
}