var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var fs = require('fs');
const cors = require("cors");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/paths', function(req, res){
	var MongoClient = mongodb.MongoClient;

	// var url = 'mongodb://localhost:27017/trace';
	var uri = "mongodb+srv://yichenjia:taZz0GrzG0HjosYc@fiction-landscape.tpago.mongodb.net/trace?retryWrites=true&w=majority";

	const client = new MongoClient(uri, { useNewUrlParser: true });
	client.connect(err => {
	  const collection = client.db("trace").collection("paths");
	  // perform actions on the collection object
	  console.log("collection");
	  res.render('paths',{"paths":collection});
	  client.close();
	});

	// MongoClient.connect(url, function(error, db){
	// 	if (error){
	// 		console.log("error1",error);
	// 	} else {
	// 		var collection = db.collection("paths");
	// 		collection.find({}).toArray(function(error, result){
	// 			if (error){
	// 				console.log("error2", error);
	// 			} else if (result.length){
	// 				res.render('paths',{
	// 					"paths":result
	// 				});
	// 			} else {
	// 				res.send("No Document Found");
	// 			}

	// 			db.close();
	// 		});
	// 	}
	// });
});

router.get('/test', function(req, res){
	fs.readFile('../../scene_1.html', function(err, data) {
	    res.writeHead(200, {'Content-Type': 'text/html'});
	    res.write(data);
	    return res.end();
  	});
})

var path = require('path');

var app = express();
app.use(cors());

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(8080, function () {
  console.log('Example app listening on port 3000!')
});

module.exports = router;
