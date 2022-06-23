const like = document.querySelectorAll('.like')
const dislike = document.querySelectorAll('.dislike')
// const deleteButton = document.querySelectorAll('.deleteButton')

function putLikes(name) {
    console.log('workd')
    const likes = {
        album: name,
        likes: "1"
    }
    console.log(likes)

    fetch('/card', {
        method: 'put',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(likes)
    }).then(response => {
        console.log(response)
        window.location.reload(true)
    })
}

function putDisLikes(name) {
    console.log('Also worked')

    const dislikes = {
        album: name,
        dislikes: "1"
    }

    fetch('/cards', {
        method: 'put',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(dislikes)
    }).then(response => {
        console.log(response)
        window.location.reload(true)
    })
}

function deleteButton(name) {
    const postToDelete = {
        album: name
    }
    fetch('/card', {
        method: 'delete',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(postToDelete)
    }).then(response => {
        console.log(response)
        window.location.reload(false)
    })
}