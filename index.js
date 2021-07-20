require('dotenv').config()
require('./mongo')

const express = require("express")
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const app = express()
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')



app.use(cors())
app.use(express.json())
app.use('/images',express.static('images'))


Sentry.init({
    dsn: "https://936ac25051824c6f9168cf4e960c56d0@o921329.ingest.sentry.io/5867692",
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
  
  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());


app.get('/', (request, response) => {
    response.send('<h1>Hello Word</h1>')
})



// con promesas
// app.get('/api/notes', (request, response) => {
//     Note.find({}).then( notes =>{
//         response.json(notes)
//     })
// })

// con async y await
app.get('/api/notes', async (request, response) => {
    const notes = await Note.find({})
    response.json(notes)
})

app.get('/api/notes/:id', (request, response, next) => {
    
    const {id} = request.params
    
    Note.findById(id).then( note => {
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    }).catch(err => {
        next(err)
    })
})


app.put('/api/notes/:id', (request, response, next) => {
    
    const {id} = request.params
    const note = request.body

    const newNoteInfo = {
        content: note.content,
        important: note.important
    }

    Note.findByIdAndUpdate(id, newNoteInfo, {new: true})
        .then( result => {
            response.json(result)
        })
        .catch (err => next(err))
})

app.delete('/api/notes/:id', async (request, response, next) => {
    
    const {id} = request.params
    
    try {
        await Note.findByIdAndDelete(id)
        response.status(204).end()
    } catch (error) {
        next(error)
    }
    
    
})


app.post('/api/notes', async (request, response, next) => {
    const note = request.body;

    if (!note || !note.content) {
        return response.status(400).json({
            error: 'note.content is missing'
        })
    }

    const newNote = new Note({
        content: note.content,
        important: typeof note.important !== 'undefined' ? note.important : false,
        //important: note.important || false
        date: new Date()
    })

    // con promesas
    // newNote.save().then( savedNote => {
    //     response.json(savedNote)
    // }).catch (err => next(err))
    // con async await
    try {
        const savedNote = await newNote.save()
        response.json(savedNote)
    } catch (error) {
        next(error)
    }

})



app.use(notFound)
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
app.use(handleErrors)



const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});


module.exports = {app, server}