import "dotenv/config";
import fs from "fs";
import admin from "firebase-admin";
import express from "express";

import { MongoClient } from "mongodb";
const app = express();
app.use(express.json());
app.use(express.static('./dist'));

const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({ credential: admin.credential.cert(credentials) });

const client = new MongoClient(process.env.DATABASE_URL);
await client.connect();
const db = client.db("react-blog-db");


app.use(async (req, res, next) => {
  const {authToken} = req.headers;
  if (authToken) {
    try {
      req.user = await admin.auth().verifyIdToken(authToken);
    } catch (error) {
      return res.status(404).json(error.message);
    }
  }
  req.user = req.user || {}
  next();
});

app.get("/api/articles/:name", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article ) {
    const upvoteIds = article.upvoteIds || [];
    article.canUpvote = uid && !upvoteIds.includes(uid);
    res.json(article);
  }else{
    return res.status(404);
  }
});

app.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
});

app.put("/api/articles/:name/upvotes", async (req, res) => {
  const { name } = req.params;
  const { uid } = req.user;
  const article = await db.collection("articles").findOne({ name });
  if (article) {
    const upvoteIds = article.upvoteIds || [];
    const canUpvote = uid && !upvoteIds.includes(uid);
    if (canUpvote) {
      await db
        .collection("articles")
        .updateOne({ name }, { $inc: { upvotes: 1 }, $push: { upvoteIds: uid } });
    }
    const updatedArticle = await db.collection("articles").findOne({ name });
    res.json(updatedArticle);
    
  }else{
    return res.statusCode(404);
  }
});

app.post("/api/articles/:name/comments", async (req, res) => {
  const { name } = req.params;
  const { text } = req.body;
  const { email } = req.user;

  await db
    .collection("articles")
    .updateOne({ name }, { $push: { comments: { email, text } } });
  const article = await db.collection("articles").findOne({ name });
  if (!article) {
    return res.send(`The ${name} does not exists!!`);
  }
  res.json(article);
});
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
