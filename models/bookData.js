const mongoose = require("mongoose");
const data = mongoose.Schema({
  title: String,
  author: String,
  pages: String,
  genre: String,
  cover: String,
  publisher: String,
});

const book= mongoose.model("bookData",data);
module.exports=book;