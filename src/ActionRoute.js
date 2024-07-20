import router from "./Routes.js";
import ArticleModel from './Model.js'

const time = (req, res, next)=>{
    console.log(Date.now());
    next();
}
router.get('/articles/all',time,async(req,res)=>{
    const data = await ArticleModel.find();
    if(!data){
        return res.json({error:data})
    }
    return res.json(data);
})

export default router;