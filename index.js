const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;



app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m8tsl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();

        const database = client.db("Autopro_car_service");
        const technologyCollection = database.collection("technology")
        const carCollection = database.collection("collection")
        const reviewCollection = database.collection("reviews")
        const usersCollection = database.collection("users")

        app.get('/technology', async (req, res) => {
            const cursor = technologyCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get('/collection', async (req, res) => {
            const cursor = carCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/addCar', async (req, res) => {
            const place = req.body;
            const result = await carCollection.insertOne(place);
            res.send(result);
        });

        app.post('/addReview', async (req, res) => {
            const place = req.body;
            const result = await reviewCollection.insertOne(place);
            res.send(result);
        });

        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        //   GET single service
        app.get('/carDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query)
            const result = await carCollection.findOne(query);
            res.json(result);
            console.log(result)
        })
        // save user details in db
        app.post('/saveUserInfo', async (req, res) => {
            const place = req.body;
            const result = await usersCollection.insertOne(place);
            res.send(result);
        });

    }
    finally {
        //    await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Connected the server")
})

app.listen(port, () => {
    console.log("Server is running at port ", port)
})

