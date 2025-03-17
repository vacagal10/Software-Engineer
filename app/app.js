// Import express.js
const express = require("express");

// Create express app
var app = express();

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    // Set up an array of data
    var test_data = ['one', 'two', 'three', 'four'];
    // Send the array through to the template as a variable called data
    res.render("index", {'title':'My index page', 'heading':'My heading', 'data':test_data});
});

// Example route for testing variables and Loops
app.get("/example1", (req, res)=> {
    res.render("example1", {
        title:"Example 1",
        heading: "Welcome to Example 1",
        description: "This is a simple example of passing variables into a Pug template",
        items: ["Apple", "Banana", "Cherry"]
    });
});
// Example 2 route for testing variables 
app.get("/example2", (req, res) => {
    // Try changing user to null or an object to see the difference.
    res.render("example2", {
      title: "Conditional Example",
      user: null // Change to null to test the "else" condition.
    });
  });
// Example 3 route for testing variables
app.get("/students", (req, res) => {
    res.render("students", {
      title: "Students List",
      heading: "List of Students",
      students: [
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Smith" },
        { id: 3, name: "Alice Johnson" }
      ]
    });
  });
  //Static Page route
  app.get("/static", (req, res) => {
    res.render("staticPage");
  });
  
//This is task 1,  Provide JSON output listing all students
app.get("/all-students", function(req, res){
    var sql = 'select * from Students';
    db.query(sql).then(results => {
        console.log(results);
        res.json(results);
    });
});

// Task 2 display a formatted list of students
app.get("/all-students-formatted", function(req, res) {
    var sql = 'select * from Students';
    db.query(sql).then(results => {
    	    // Send the results rows to the all-students template
    	    // The rows will be in a variable called data
        res.render('all-students', {data: results});
    });
});

//Task 2 Display a formatted list of Programmes with each linked by ID to the single programme page(for PUG):
app.get("/programmes", function(req, res){
    var sql = "SELECT * FROM Programmes";
    db.query(sql).then(results => {
        res.render("programmes", {
            title: "Programmes List",
            programmes: results
        });
    });
});
//New Task 2 (Single Programme Page) for Pug template:
app.get("/programme/:id", function(req, res){
    var programmeId = req.params.id;
    var sql = 'SELECT * FROM Programmes WHERE id = ?';
    db.query(sql, [programmeId]).then(results => {
        res.render("programme", {
            programme: results[0]
        });
    });
});
// Task 3 single student page
/*
app.get("/single-student/:id", function(req, res){
    var stId = req.params.id;
    var stSql = "SELECT s.name as student, ps.name as programme, \
    ps.id as pcode from Students s \
    JOIN Student_Programme sp on sp.id = s.id\
     JOIN Programmes ps on ps.id = sp.programme \
     WHERE s.id = ?";
     var modSql = "SELECT * FROM Programme_Modules pm \
     JOIN Modules m on m.code = pm.module \
     WHERE programme = ?";
    db.query(stSql, [stId]).then(results =>{
        console.log(results);
        var pCode = results[0].pcode;
        output = '';
        output += '<div><b>Student: </b>' + results[0].student + '</div>';
        output += '<div><b>Programme: </b>' + results[0].programme + '</div>';
        
        //Now we call the database for the modules
        db.query(modSql, [pCode]).then (results => {
            output += '<table border="1px">';
            for (var row of results) {
                output += '<tr>';
                output += '<td>' + row.module + '</td>';
                output += '<td>' + row.name + '</td>';
                output += '</tr>';
               }
               output+= '</table>';
               res.send(output);
            
        });

    }); 
});
*/
//New Task 3(Single Student Page) for Pug template:
app.get("/single-student/:id", function(req, res){
    var stId = req.params.id;
    var stSql = "SELECT s.name as student, ps.name as programme, ps.id as pcode FROM Students s JOIN Student_Programme sp on s.id = sp.id JOIN Programmes ps on ps.id = sp.programme WHERE s.id = ?";
    var modSql = "SELECT * FROM Programme_Modules pm JOIN Modules m on m.code = pm.module WHERE pm.programme = ?";
    db.query(stSql, [stId]).then(results => {
        var pCode = results[0].pcode;
        db.query(modSql, [pCode]).then(modResults => {
            res.render("single-student", {
                student: results[0].student,
                programme: results[0].programme,
                modules: modResults
            });
        });
    });
});

//New Task 6 Single Module Page (with Programme and Students)
app.get("/module/:id", function(req, res) {
    var moduleId = req.params.id;
    var moduleSql = "SELECT * FROM Modules WHERE code = ?";
    var progSql = "SELECT p.* FROM Programmes p JOIN Programme_Modules pm ON p.id = pm.programme WHERE pm.module = ?";
    var studentsSql = "SELECT s.* FROM Students s JOIN Student_Programme sp ON s.id = sp.id WHERE sp.programme = ?";

    db.query(moduleSql, [moduleId]).then(moduleResults => {
        var mod = moduleResults[0];
        db.query(progSql, [moduleId]).then(progResults => {
            var prog = progResults[0];
            db.query(studentsSql, [prog.id]).then(studentResults => {
                res.render("module", {
                    module: mod,
                    programme: prog,
                    students: studentResults
                });
            });
        });
    });
});


// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

// Create a route for /goodbye
// Responds to a 'GET' request
app.get("/goodbye", function(req, res) {
    res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>, where name is any value provided by user
// At the end of the URL
// Responds to a 'GET' request
app.get("/hello/:name", function(req, res) {
    // req.params contains any parameters in the request
    // We can examine it in the console for debugging purposes
    console.log(req.params);
    //  Retrieve the 'name' parameter and use it in a dynamically generated page
    res.send("Hello " + req.params.name);
});

//Listing page (Recipes list)
app.get("/recipes/", function (req, res){
    var sql = "SELECT recipe_id, title, image FROM recipe";
    db.query(sql).then(results => {
        res.render("recipes-list", {recipes: results});
    });
});
app
//single recipe? details of the recipe
app.get("/recipes/:id", function (req, res){
    var recipeId = req.params.id;
    var sql = "SELECT recipe.*, user.FirstName AS user_firstname\
        FROM recipe  \
        JOIN user  ON recipe.user_id = user.user_id \
        WHERE recipe.recipe_id = ?";
    db.query(sql, [recipeId]).then(results => {
        res.render("recipe", {
            recipe: results[0]
        }); 
    });
});
app.get("/categories/", function(req, res){
    var sql = "SELECT category_id, category_name FROM category";
    db.query(sql).then(results => {
        res.render("categories", {categories: results});
    });
});

// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});