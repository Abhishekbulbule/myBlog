import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import Routes from './ActionRoute.js'

const app = express();
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;

db.on("error",(e)=>{
    console.log(e);
});
db.once('connected',()=>{
    console.log('Database connection successfull')
})

app.use('/api', Routes);
app.get('/users',(req,res)=>{
    return res.send('hello')
})
app.listen(8080, ()=>{
    console.log("Api running at port 8080");
})