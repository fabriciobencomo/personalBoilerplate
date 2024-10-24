require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path')
const port = 8080

const prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')
const { availableParallelism } = require('os')

const initApi = req => {
  const client = prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req: req
  })

  return client
}

const handleLinkResolver = doc => {
  // if (doc.type === 'blog_post') {
  //   const date = new Date(doc.first_publication_date)
  //   return `/${date.getFullYear()}/${doc.uid}`
  // }
  return '/'
}

app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  }

  res.locals.PrismicDOM = PrismicDOM

  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  res.render('pages/home', {
    meta: {
        title: 'personal',
        description: 'Metada description.'
    }
  })
})

app.get('/about', async (req, res) => {
    const client = initApi(req);
    // Consulta separada para 'about'
    const aboutResponse = await client.getByType('about');
    console.log('About response:', aboutResponse.results[0].data.body);

    // Consulta separada para 'meta'
    const metaResponse = await client.getByType('meta');
    console.log('Meta response:', metaResponse.results[0]);

    res.render('pages/about', {
      meta: metaResponse.results[0],
      about: aboutResponse.results[0],
    });
});

app.get('/detail:id', (req, res) => {
    res.render('pages/detail')
})

app.get('/collections', (req, res) => {
    res.render('pages/collections')
})

app.listen(port)



