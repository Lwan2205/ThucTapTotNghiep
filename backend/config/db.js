const mongoose = require("mongoose")
require('dotenv').config()

const connect = () => {
    mongoose.connect(`mongodb+srv://longquan22052004:${process.env.MONGO_DB}@cluster0.stf6j.mongodb.net/jwelry`)
        .then(() => {
            console.log("Connect to database successfully")
        })
        .catch((err) => {
            console.log("Cannot connect to database ", err.message)

        })
}
module.exports = connect;