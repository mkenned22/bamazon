var mysql = require("mysql");
var inquirer = require("inquirer");
require('dotenv').config();

var conn = mysql.createConnection({
    host: process.env.DB_host,
    user: process.env.DB_user,
    password: process.env.DB_password,
    database: process.env.DB_database
})

conn.connect(function(err){
    if(err) throw err;
    startApp();
});


function startApp(){
    console.log("Welcome to Bamazon!");
    console.log("Here are the items we currently have in stock:");
    conn.query("select * from products", function(err, res){
        for (i=0; i<res.length; i++){
            console.log("ID "+res[i].id+": "+res[i].product+" - $"+res[i].price)
        }
        inquirer.prompt([
        {
            name: "product",
            type: "input",
            message: "Would you like to buy today? (Please enter the ID number)"
        },
        {
            name: "quantity",
            type: "input",
            message: "How many?"
        }
        ])
        .then(function(answers){
            //validate that the quantity exists for that product
            var currStock = parseInt(res[answers.product-1].stock)
            var quant = parseInt(answers.quantity)
            if(currStock < quant){
                console.log("I'm sorry, we currently do not have the inventory to support this request.");
                continueOn()
            }
            else{
                makePurchase(answers.product,(currStock-quant))
            }
        })
    })
    
}

function makePurchase(id,newStock){

    conn.query(
        "update products set ? where ?",
        [
            {
                stock: newStock
            },
            {
                id: id
            } 
        ],
        function(err){
            if(err) throw err;
            console.log("Thank you for your business!");
            continueOn()
        }
    );
}

function continueOn(){
    inquirer.prompt([
        {
            name: "continue",
            type: "confirm",
            message: "Would you like to make another purchase?"
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
