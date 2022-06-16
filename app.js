const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require('mongodb')
const app = express()

app.use(express.static('public'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const uri = "mongodb+srv://floodadosious:668LYFyU0PC7j4S1@cluster0.nhkayvk.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

client.connect(err => {
    if(err) {
        console.log(err)
    } else {
        console.log("Connected to database")
    }

    const db= client.db("mubla")
    const exampleCollection = db.collection("user_info");
  // perform actions on the collection object
    // client.close();
    app.get('/', (req, res) => {
        exampleCollection.find().toArray().then(results => {
            res.send(results)
        })
    })

   
})

app.listen(3000, () => {
    console.log("Running on 3000")
})