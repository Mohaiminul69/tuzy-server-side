const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhrrv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Database Connected");
    const database = client.db("tourismWeb");
    const locationCollection = database.collection("locations");
    const packageCollection = database.collection("packages");
    const imageCollection = database.collection("gallary");
    const orderCollection = database.collection("orders");

    // GET API LOCATIONS
    app.get("/locations", async (req, res) => {
      const result = await locationCollection.find({}).toArray();
      res.send(result);
    });

    // GET API PACKAGES
    app.get("/packages", async (req, res) => {
      const result = await packageCollection.find({}).toArray();
      res.send(result);
    });

    // GET API IMAGES
    app.get("/images", async (req, res) => {
      const result = await imageCollection.find({}).toArray();
      res.send(result);
    });

    // GET API FOR SINGLE DATA BY ID
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      let location = await locationCollection.findOne(query);
      if (!location) {
        location = await packageCollection.findOne(query);
      }
      res.send(location);
    });

    // GET ORDERS BY ID
    app.get("/orderDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      let location = await orderCollection.findOne(query);
      res.send(location);
    });

    // GET ORDERS BY USER EMAIL
    app.get("/myOrders/:email", async (req, res) => {
      const mail = req.params.email;
      const query = { email: mail };
      const orders = await orderCollection.find(query).toArray();
      res.send(orders);
    });

    // Add Bookings API
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await orderCollection.insertOne(booking);
      res.send(result);
    });

    // CANCELING ORDER
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // GETTING ALL ORDERS FOR MANAGE
    app.get("/manage", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    // APPROVE BOOKING
    app.put("/approveBooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateStatus = req.body;
      const result = await orderCollection.updateOne(query, {
        $set: {
          status: updateStatus.status,
        },
      });
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
