const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    orderId : {typeL:mongoose.Schema.Types.ObjectId,ref:'Order'}
})