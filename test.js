console.log("test start ///");

// init project
const express = require('express'); // the library we will use to handle requests. import it here
const app = express(); // instantiate express
app.use(require("cors")()) // allow Cross-domain requests 
app.use(require('body-parser').json()) // When someone sends something to the server, we can recieve it in JSON format

// base route. Responds to GET requests to the root route ('/')
app.get("/", (req, res) => {
  res.send("Home sweet home 🏚") // always responds with the string "TODO"
});

// base route. Responds to POST requests to the root route
app.post("/", (req, res) => {
  res.send("Sending it through the post 📬") // always responds with the string "TODO"
});

// Responds to PUT requests to the root route
app.put("/", (req, res) => {
  res.send("Don't you dare put me up to this.") // always responds with the string "TODO"
});

// listen for requests on port 4567
const port = 4567;
var listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://yichenjia:taZz0GrzG0HjosYc@fiction-landscape.tpago.mongodb.net/<sample_geospatial>?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     console.log(collection);
//     client.close();
// });

const { MongoClient } = require("mongodb");

// Connection URI
const uri = "mongodb+srv://yichenjia:taZz0GrzG0HjosYc@fiction-landscape.tpago.mongodb.net/<sample_geospatial>?retryWrites=true&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Establish and verify connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to server");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);