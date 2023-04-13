// Dependiencies
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion } = require('mongodb')
const session = require('cookie-session')
const albumArt = require('album-art')
require('dotenv').config()
const uri = process.env.MONGO_DB_CONNECTION_STRING

const app = express()
app.use(cookieParser())

// app.use(session({ secret: "It's a secret" }))
app.use(session({
    secret: "It's a secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }))
app.use('/static', express.static('public'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Connection for MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1, keepAlive: true, connectTimeoutMS: 30000 })

/**
 * Function for getting album Art
 * @param {*} artist 
 * @param {*} albumCover 
 * @returns Url of album cover picture
 */

function getAlbumePic(artist, albumCover) {
    return new Promise((resolve, reject) => {
        albumArt(artist, {album: albumCover, size: 'medium'}, (err, data) => {
            if(err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

//Client connection and DB CRUD operations
client.connect(err => {
    if(err) {
        console.log(err)
    } else {
        console.log("Connected to database")
    }

    const db= client.db("mubla")
    const exampleCollection = db.collection("user_info");
  // perform actions on the collection object
    // Get Request to db for page rendering
    app.get('/', (req, res) => {
        function byLikes(a, b) {
            return parseInt(b.likes.length) - parseInt(a.likes.length)
        }

        exampleCollection.find().toArray().then(results => {
            let sortedResults = results.sort(byLikes)
            res.render('index', {albums: sortedResults})
        })
    })

    
    // Post request for adding req obejt to DB.
    app.post('/card', async (req, res) => {
        await getAlbumePic(req.body.artist, req.body.album_cover_title)
            .then((pics)=>
                exampleCollection.insertOne({
                    "username": req.body.user,
                    "artist": req.body.artist,
                    "album": req.body.album_cover_title,
                    "cover": pics,
                    "likes": [],
                    "dislikes": []
            }))
            .then(result => {
                res.redirect('/')
            })
            .catch(error => console.log(error))
    })

    // Update Request for adding likes to a album
    app.put('/card', (req, res) => {
        exampleCollection.findOneAndUpdate(
            {album: req.body.album},
            {
                $push: {
                    likes: req.body.likes
                }
            },
            {
                upsert: true
            }
        ).then(result => {
            console.log(result)
            res.redirect('/')
        }).catch(error => console.log(error))
    })

    // Update request for adding dislikes to a album
    app.put('/cards', (req, res) => {
        exampleCollection.findOneAndUpdate(
            {album: req.body.album},
            {
                $push: {
                    dislikes: req.body.dislikes
                }
            },
            {
                upsert: true
            }
        ).then(result => {
            console.log(result)
            res.redirect('/')
        }).catch(error => console.log(error))
    })

    // Delete request for removing a album from DB.
    app.delete('/card', (req, res) => {
        exampleCollection.deleteOne(
            {album: req.body.album}
        )
        .then(result => {
            console.log("deleted")
            res.redirect('/')
        })
        .catch(error => console.log(error))
    })

   
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Running on 3000")
})