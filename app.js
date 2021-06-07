const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine", "ejs")
//connect to mongo
mongoose.connect("mongodb://localhost:27017/todoListDB")

const itemsSchema = new mongoose.Schema({
  name: String,
})
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const Item = mongoose.model("Item", itemsSchema)
const List = mongoose.model("List", listSchema)
const defaulItem = new Item({
  name:"today"
});


app.get("/", function(req, res){
  Item.find(function(err, foundItem){
      res.render("index", {title:"Today", ho: foundItem})
  })
})

app.post("/", function(req, res){
  const route = req.body.button;
  const itemName = req.body.item
  const item = new Item({
    name: itemName
  });
  console.log(route);
  if(route == "Today"){
    const item = new Item({
      name: req.body.item
    })
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name: route}, function(err, found){
      found.items.push(item);
      found.save()
      res.redirect("/" + route)
    })
  }
})


app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName
  console.log(req.body)

  List.findOne({name:customListName}, function(err, foundItem){
    if(!err){
      if(!foundItem){
        const list = new List({
          name:customListName,
          items: []
        })
        list.save()
        res.redirect("/" + customListName)
      }else{
        console.log(foundItem)
        //
        res.render("index", {title:customListName, ho: foundItem.items})
      }
    }

  })
})



app.post("/delete", function(req, res){
  const routeName = req.body.listName;
  const checkId = req.body.check
  if(routeName=="Today"){
      Item.deleteOne({_id: req.body.check}, function(){
        res.redirect("/")})
  }else{
    List.findOneAndUpdate({name: routeName}, {$pull: {items: {_id: req.body.check}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + routeName);
      }
    });
  }

})

app.listen(5000, function(){
  console.log("localhost:5000")
})
