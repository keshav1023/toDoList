import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const dbURL = "mongodb+srv://lmessi10:lmessi10@cluster0.dvkiufo.mongodb.net/ToDoList?retryWrites=true&w=majority";
app.use(express.json())

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(dbURL, connectionParams).then(()=>{
    console.info("Connected to DB")
}).catch((e)=>{
    console.log("Error:",e);
})

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1= new Item({
  name : "Welcome to the todolist !!"
});

const item2= new Item({
  name : "Hit + button to add a new item"
});

const item3= new Item({
  name : " <---- Hit this to delete an item"
});


const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List= mongoose.model("List",listSchema);

app.get("/", async function (req, res) {

  let arr = await Item.find({});
  let foundItems = [];
  arr.forEach(itemObj => {
    foundItems.push(itemObj.name);
  });

  if(foundItems.length===0){
    Item.insertMany(defaultItems);
    console.log("Successfuly added default items to the DB.")
    res.redirect("/");
  } else{
      res.render("index.ejs", {listTitle: "Today", newListItems: arr});
  }


});

app.post("/",async (req, res) => {
  const itemName=req.body.newItem;
  const listName=  req.body.list;
  const itemX= new Item({
    name : itemName
  });

if(listName == "Today"){
  itemX.save();
  res.redirect("/");
} else{
  const foundList= await List.findOne({name: listName});
  foundList.items.push(itemX);
  foundList.save();
  res.redirect("/" + listName);
}



});

app.post("/delete", async function(req,res){
  const checkedItemId=req.body.checkbox;
const listName = req.body.listName;

if(listName=="Today"){
  await Item.findByIdAndRemove(checkedItemId);
      console.log("Successfuly entry deleted.");
      res.redirect("/");
} else{ 
  const foundList= await List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}});
  console.log("Successfuly entry deleted.");
   res.redirect("/" + listName );
} 
  
});



// app.get("/work", (req, res) => {
//   res.render("index.ejs", {
//     listTitle: "Work List",
//     newListItems: workItems,
//   });
// });

app.get("/:customListName",async function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  //console.log(customListName);

  const foundList = await List.findOne({name: customListName});
   if(!foundList){
    console.log("Does not Exists");
    const list = new List ({
      name : customListName,
      items: defaultItems
    });
    list.save();
    console.log("Successfuly " + customListName + " entry created.");
    res.redirect("/"+listName);
  } 
  else{
    console.log(customListName + " entry already Exist");

    res.render("index.ejs" ,{listTitle: foundList.name, newListItems: foundList.items});
  }
});





app.post("/work", (req, res) => {
  res.render("index.ejs");
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
