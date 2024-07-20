import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema({
  name: { required: true, type: String },
  title: { required: true, type: String },
  content: { required: true, type: String },
  upvotes: { required: true, type: Number },
  comments: { required: true, type: Array },
});

const ArticleModel = mongoose.model("articles", ArticleSchema);
export default ArticleModel;
