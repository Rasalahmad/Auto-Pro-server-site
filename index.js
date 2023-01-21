const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const SSLCommerzPayment = require("sslcommerz");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8tsl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("Autopro_car_service");
    const technologyCollection = database.collection("technology");
    const carCollection = database.collection("collection");
    const reviewCollection = database.collection("reviews");
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");

    app.get("/technology", async (req, res) => {
      const cursor = technologyCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/collection", async (req, res) => {
      const cursor = carCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addCar", async (req, res) => {
      const place = req.body;
      const result = await carCollection.insertOne(place);
      res.send(result);
    });

    app.post("/addReview", async (req, res) => {
      const place = req.body;
      const result = await reviewCollection.insertOne(place);
      res.send(result);
    });

    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    //   GET single service
    app.get("/carDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.findOne(query);
      res.json(result);
      // console.log(result)
    });

    // save user details in db
    app.post("/saveUserInfo", async (req, res) => {
      const place = req.body;
      const result = await ordersCollection.insertOne(place);
      res.send(result);
    });

    // admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json(isAdmin);
      // console.log(isAdmin)
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });
    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carCollection.deleteOne(query);
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    // get all orders

    app.get("/manageOrders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // update status
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.updateOne(query, {
        $set: {
          status: "Shipped",
        },
      });
      res.send(result);
    });

    //sslcommerz init
    app.post("/init", (req, res) => {
      console.log(req.body);
      const data = {
        total_amount: req.body.service.price,
        currency: "BDT",
        product_img: req.body.service?.img,
        tran_id: "REF123",
        success_url: "http://localhost:5000/success",
        fail_url: "http://localhost:5000/fail",
        cancel_url: "http://localhost:5000/cancel",
        ipn_url: "http://localhost:5000/ipn",
        shipping_method: "Courier",
        product_name: req.body.service.name,
        product_category: "Electronic",
        product_profile: "general",
        cus_name: req.body?.name,
        cus_email: req.body.email,
        cus_add1: req.body?.city,
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: req.body?.phone,
        cus_fax: req.body?.phone,
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
        multi_card_name: "mastercard",
        value_a: "ref001_A",
        value_b: "ref002_B",
        value_c: "ref003_C",
        value_d: "ref004_D",
      };
      const sslcommer = new SSLCommerzPayment(
        process.env.STORE_ID,
        process.env.STORE_PASS,
        false
      ); //true for live default false for sandbox
      sslcommer.init(data).then((data) => {
        //process the response that got from sslcommerz
        //https://developer.sslcommerz.com/doc/v4/#returned-parameters
        if (data.GatewayPageURL) {
          res.status(200).json(data.GatewayPageURL);
        }
        res.status(400).json("Payment seasson failed");
      });
    });

    app.post("/success", async (req, res) => {
      res.status(200).redirect("http://localhost:3000/success");
    });

    app.post("/fail", async (req, res) => {
      res.status(200).redirect("http://localhost:3000/");
    });

    app.post("/cancel", async (req, res) => {
      res.status(200).redirect("http://localhost:3000/");
    });
  } finally {
    //    await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Connected the server");
});

app.listen(port, () => {
  console.log("Server is running at port ", port);
});
