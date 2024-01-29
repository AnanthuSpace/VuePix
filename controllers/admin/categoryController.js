const Category = require('../../models/categorySchema')


const renderCategory = async(req,res)=>{
    await Category.find({})
    .then(data=>res.render("admin/category", {cat : data}))
    .catch(error=>console.log(error.message))
}


const addCategory = async (req, res) => {
    try {
        const { name, description }=req.body;
        console.log(req.body.name);
        const categoryExists = await Category.findOne({ name });

        if (!categoryExists) {
            const newCategory=new Category({
                 name:name,
               description:description
            });

            await newCategory.save();
            console.log("Category done:", newCategory);
            res.redirect("/admin/category");
        } else {
            res.redirect("/admin/category");
            console.log("Category Already exists");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


const listCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: false } });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};

const unListCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isListed: true } });
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};




module.exports ={
    renderCategory,
    addCategory,
    listCategory,
    unListCategory
}