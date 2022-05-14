//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin-sourav07:admin@cluster0.kx649.mongodb.net/todo_listDB");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = {
  name : String
};

const Item = mongoose.model("item", itemSchema);

const item1 = new Item ({
  name : "Workout",
});

const item2 = new Item ({
  name : "Drinking water",
});

const item3 = new Item ({
  name : "web development",
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name : String,
  item : [itemSchema],
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find(function(err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItem, function(err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully saved default items!");
        }
        res.redirect("/");
      });
    }
    else {
        res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName}, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list.
        const list = new List ({
          name : customListName,
          item : defaultItem,
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        //show an existing list.
        res.render("list", {listTitle: foundList.name, newListItems: foundList.item});
      }
    }
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const items = new Item({
    name : itemName
  });

  if (listName === "Today") {
    items.save();
    res.redirect("/");
  }
  else {
    List.findOne({name : listName}, function(err, foundList) {
      foundList.item.push(items);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Successfully Deleted!");
      }
      res.redirect("/");
    });
  }
  else {
    List.findOneAndUpdate({name : listName}, {$pull : {item : {_id : checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port === NULL || port === "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
