var mysql = require("mysql");
var inquirer = require("inquirer");
require('dotenv').config();

var conn = mysql.createConnection({
    host: process.env.DB_host,
    user: process.env.DB_user,
    password: process.env.DB_password,
    database: process.env.DB_database
});

conn.connect(function(err){
    if(err) throw err
    startApp()
})

function startApp(){
    console.log("Welcome to Bamazon Admin Portal");
    inquirer.prompt([
        {
        name: "action",
        type: "rawlist",
        message: "Which admin function would you like to perform?",
        choices: ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product"]
        }
    ]).then(function(answer){
        if(answer.action == "View Products for Sale"){
            viewProducts();
        }
        else if(answer.action === "View Low Inventory"){
            viewLowInventory();
        }
        else if(answer.action === "Add to Inventory"){
            addInventory();
        }
        else if(answer.action === "Add New Product"){
            addProduct();
        }
    })
}

function viewProducts(){
    conn.query("select id, product, price, stock from products", function(err, res){
        for (i=0; i<res.length; i++){
            console.log("ID "+res[i].id+": "+res[i].product+" - Price: $"+res[i].price+" In Stock: "+res[i].stock)
        }
        continueOn();
    });
}
function viewLowInventory(){
    conn.query("select id, product from products where stock < 5", function(err, res){
        for (i=0; i<res.length; i++){
            console.log("ID "+res[i].id+": "+res[i].product);
        }
        continueOn();
    });
}
function addInventory(query){
    conn.query("select id, product, price, stock from products", function(err, res){
        for (i=0; i<res.length; i++){
            console.log("ID "+res[i].id+": "+res[i].product+" - Price: $"+res[i].price+" In Stock: "+res[i].stock)
        }
        inquirer.prompt([
            {
                name: "product",
                type: "input",
                message: "For which product would you like to increase inventory? (Please provide the inventory ID number"
            },
            {
                name: "quantity",
                type: "input",
                message: "How much would you like to increase inventory?"
            }
        ]).then(function(answer){
            var query = "update products set stock = stock+" + answer.quantity + " where id = " + answer.product;
            conn.query(query, function(err, res){
                console.log("Your inventory has been updated!")
                continueOn();
            });
        });
    });
}    
function addProduct(){
    inquirer.prompt([
        {
            name: "product",
            type: "input",
            message: "What new product would you like to add?"
        },
        {
            name: "department",
            type: "input",
            message: "What department is this product in?"
        },
        {
            name: "price",
            type: "input",
            message: "What will you charge for this new product?"
        },
        {
            name: "stock",
            type: "input",
            message: "What is your initial inventory?"
        }
    ]).then(function(answer){
        var query = "insert into products (product,department,price,stock) values ('"+answer.product+"','"+answer.department+"','"+answer.price+"','"+answer.stock+"')"
        conn.query(query,function(err,res){
            console.log("You have expanded your product inventory!");
            continueOn();
        });
    });
}
function continueOn(){
    inquirer.prompt([
        {
            name: "continue",
            type: "confirm",
            message: "Would you like to continue as admin?"
        }
    ])
    .then(function(answer){
        if(answer.continue === true){
            startApp()
        }
        else{
            conn.end();
            process.exit();
        }
    });
}