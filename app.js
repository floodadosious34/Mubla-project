const {uri} = require("./dburi.js")
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion } = require('mongodb')
const session = require('express-session')
const albumArt = require('album-art')

const app = express()
app.use(cookieParser())

app.use(session({ secret: "It's a secret" }))
app.use('/static', express.static('public'))
app.set('view engine', 'pug')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

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
        function byLikes(a, b) {
            return parseInt(b.likes.length) - parseInt(a.likes.length)
        }

        exampleCollection.find().toArray().then(results => {
            let sortedResults = results.sort(byLikes)
            res.render('index', {albums: sortedResults})
        })
    })

    

    app.post('/card', async (req, res) => {
        // console.log(req.body.artist)

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
                // console.log(result)
                res.redirect('/')
            })
            .catch(error => console.log(error))
    })


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

app.listen(3000, () => {
    console.log("Running on 3000")
})