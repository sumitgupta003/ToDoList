const bodyParser = require('body-parser');
const { name } = require('ejs');
const { response } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash');

const date = require(__dirname+"/date.js")

const app = express();


app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/todolistDb")

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name : "Default Item 1"
});

const item2 = new Item({
    name: "Default Item 2"
});

const item3 = new Item({
    name: "Default Item 3"
})

const defaultArr = [item1, item2, item3]


const listSchema = new mongoose.Schema({
    name:String,
    item : [itemSchema]
});

const List = mongoose.model("List",listSchema);-


app.get("/", (req, res) => {

     let day = date();

     Item.find({},(err,print)=>{

        if(print.length === 0){
            Item.insertMany(defaultArr,(err)=>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log("Saved items");
                }
            })
            res.redirect("/")
        }
        else{
            res.render("list", { cur_day: "Today", listdata: print });
        }
    })
    

    

});

app.post("/", (req, res) => {

    const itemcustom = req.body.list;

    const cus_item = new Item({
        name:req.body.newItem
    });

    if(itemcustom === "Today"){
        cus_item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:itemcustom},(err,foundList)=>{
            foundList.item.push(cus_item);
            foundList.save();
            res.redirect("/"+itemcustom);
        })
    }
   
});

app.post("/delete",(req,res)=>{
    const del = req.body.checkbox;
    const listName = req.body.listName

    if(listName=== "Today"){
        Item.findByIdAndRemove(del,(err)=>{
            if(err){
                console.log(err);
            }
            else{
                //console.log("Successfuuly deleted")
                res.redirect("/");
            }
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{item:{_id:del}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
    
})

app.get("/:custom",(req,res)=>{
    const custom = _.capitalize(req.params.custom);

    List.findOne({name:custom},(err,foundList)=>{
        if(!foundList){
            const list1 = new List({
                name:custom,
                item: defaultArr
            })
            list1.save();
            res.redirect("/"+custom);
        }
        else{
            res.render("list", { cur_day: foundList.name, listdata:foundList.item });
        }
    })

    

    
    
})

app.get("/about",(req, res)=>{
    res.render("about")
})


app.listen(3000, () => {
    console.log("Server is running on port 3000");
})