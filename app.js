require('dotenv').config()

const logger = require('morgan')
const express = require('express')
const errorHandler = require('express-error-handler')
const bodyParser = require('body-parser') 
const methodOverride = require('method-override')

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
  if(doc.type == 'product'){
    return `/detail/${doc.slug}`
  }

  if(doc.type == 'collections'){
    return '/collections'
  }

  if(doc.type == 'about'){
    return `/about`
  }
  return '/'
}

app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  }

  res.locals.Link = handleLinkResolver

  res.locals.PrismicDOM = PrismicDOM
  res.locals.Numbers = index=>{
    return index == 0 ? 'One' : index==1 ? 'Two' : index == 2 ? 'Three': index == 3 ? 'Four' : ''
  }

  next()
})

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(methodOverride())
app.use(errorHandler())
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async client => {
  const preloader = await client.getSingle('preloader')
  const navigation = await client.getSingle('navigation')
    // Consulta separada para 'meta'
    const metaResponse = await client.getByType('meta');

  return {
    meta: metaResponse.results[0],
    navigation,
    preloader,
  }
}

app.get('/', async (req, res) => {
  const client = initApi(req);
  // Consulta separada para 'home'
  const home = await client.getSingle('home');

  // Consulta separada para 'collection'
  const {results: collections} = await client.getByType('collection',{
    fetchLinks: 'product.image'
  });

  const defaults = await handleRequest(client)

  res.render('pages/home', {
    home,
    collections,
    ...defaults
  });
})

app.get('/about', async (req, res) => {
    const client = initApi(req);
    // Consulta separada para 'about'
    const aboutResponse = await client.getByType('about');

    const defaults = await handleRequest(client)

    res.render('pages/about', {
      ...defaults,
      about: aboutResponse.results[0],
    });
});

app.get('/detail/:uid', async (req, res) => {
  const client = initApi(req);
  // Consulta separada para 'product' con su UID 
  const product = await client.getByUID('product', req.params.uid, {
    fetchLinks: 'collection.title'
  });

  const defaults = await handleRequest(client)

  res.render('pages/detail', {
    ...defaults,
    product,

  });
})

app.get('/collections', async (req, res) => {
  const client = initApi(req);
  // Consulta separada para 'collection'
  const {results: collections} = await client.getByType('collection',{
    fetchLinks: 'product.image'
  });

   const defaults = await handleRequest(client)
    // Consulta separada para 'home'
  const home = await client.getSingle('home');

  res.render('pages/collections', {
    ...defaults,
    collections,
    home,
  });
})

app.listen(port)



