var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
  res.render('helloworld', { title: 'Hello, World!' });
});

router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* GET scene 1 */
router.get('/scene_1', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 1 } },{},function(e,docs){
        res.render('scene_1', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_2', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 2 } },{},function(e,docs){
        res.render('scene_2', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_3', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 3 } },{},function(e,docs){
        res.render('scene_3', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_4', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 4 } },{},function(e,docs){
        res.render('scene_4', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_5', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 5 } },{},function(e,docs){
        res.render('scene_5', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_6', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 6 } },{},function(e,docs){
        res.render('scene_6', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_7', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 7 } },{},function(e,docs){
        res.render('scene_7', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_8', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 8 } },{},function(e,docs){
        res.render('scene_8', {
            "db_paths" : docs,
        });
    });
});

router.get('/scene_9', function(req, res) {
    var db = req.db;
    var collection = db.get('paths');
    collection.find({ scene: { $eq: 9 } },{},function(e,docs){
        res.render('scene_9', {
            "db_paths" : docs,
        });
    });
});

/*POST to Record Traces to DB */
router.post('/newtrace', function(req, res) {
    // Set our internal DB variable
    var db = req.db;    
    // console.log("post scene_1",req.body);
    // res.send("try to post new trace");
    var collection = db.get('paths');

    var myData = JSON.parse(req.body.myData);
    //console.log("myData", myData);
    // Submit to the DB
    collection.insert( myData,function (err, doc) {
        if (err) {
            // If it failed, return error
            console.log(err);
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            // res.send("post success");
            console.log("post trace success");
        }
    });
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    console.log("add user",req.body);
    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userEmail = req.body.useremail;

    // Set our collection
    var collection = db.get('usercollection');

    // Submit to the DB
    collection.insert({
        "username" : userName,
        "email" : userEmail
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            // res.redirect("userlist");
            res.send("success");
        }
    });

});

module.exports = router;
