const express = require('express')
const app = express()
const path = require('path')
const port = 8080

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  res.render('pages/home', {
    meta: {
        title: 'personal',
        description: 'Metada description.'
    }
  })
})

app.get('/about', (req, res) => {
    res.render('pages/about')
})

app.get('/detail:id', (req, res) => {
    res.render('pages/detail')
})

app.get('/collections', (req, res) => {
    res.render('pages/collections')
})

app.listen(port)



