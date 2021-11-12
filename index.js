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
        const ordersCollection = database.collection("orders")

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
            const result = await carCollection.findOne(query);
            res.json(result);
            // console.log(result)
        })

        // save user details in db
        app.post('/saveUserInfo', async (req, res) => {
            const place = req.body;
            const result = await ordersCollection.insertOne(place);
            res.send(result);
        });

        // admin 
             app.get('/users/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json(isAdmin)
            // console.log(isAdmin)
        })

           app.put('/users', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            // console.log(result)
            // res.json(result);
        });

        
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result); 
        });

          app.put('/users/admin', async(req, res) => {
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            // console.log(result)
            res.json(result);
        });

          app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query)
            res.json(result);
            // console.log(result)
        })
          app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await carCollection.deleteOne(query)
            res.json(result);
            // console.log(result)
        })

        app.get('/orders', async(req, res) => {
            const email = req.query.email;
            const query = {email: email}
            // console.log(query)
            const cursor = ordersCollection.find(query);
            const result = await cursor.toArray();
            res.json(result);
        });

       // get all orders

        app.get('/manageOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        });

        // update status
        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.updateOne(query, {
                $set: {
                    status: 'Shipped'
                }
            })
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

