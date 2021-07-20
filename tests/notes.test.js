const moongose = require('mongoose')
const {server} = require('../index')
const Note = require('../models/Note')

const {api, initialNotes, getAllContentFromNotes} = require('./helpers')

beforeEach( async () => {

    await Note.deleteMany({})

    // manualmente
    // const note1 = new Note(initialNotes[0])
    // await note1.save()
    // const note2 = new Note(initialNotes[1])
    // await note2.save()
   
    // paralelo, los guarda rapido, pero no asegura el orden
    // const notesObject = initialNotes.map( note => new Note(note))
    // const promises = notesObject.map( note => note.save())
    // await Promise.all(promises)

    // secuencial, guarda ordenadamente
    for (const note of initialNotes){
        const notesObject = new Note(note)
        await notesObject.save()
    }
})

describe('todos los test a GET', () => {
    
    test('las notas se devuelven en json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('queremos ver dos notas', async () => {
        const response = await api.get('/api/notes')
        expect(response.body).toHaveLength(initialNotes.length)
    })

    // test('la primer nota es acerca de midudev', async () => {
    //     const response = await api.get('/api/notes')
    //     expect(response.body[0].content).toBe('Aprendiendo FullStack JS con midudev')
    // })

    test('alguna nota contiene la frase "Aprendiendo FullStack JS con midudev"', async () => {
        const {contents} = await getAllContentFromNotes()
        
        expect(contents).toContain('Aprendiendo FullStack JS con midudev')
    })
})

describe('todos los test POST', () => {

    test('añadir una nueva nota valida con el POST', async () => {
        const newNote = {
            content: 'nueva nota de prueba POST',
            importat: true,
        }
    
        await api
            .post('/api/notes')
            .send(newNote)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
        const {contents, response} = await getAllContentFromNotes()
    
        expect(response.body).toHaveLength(initialNotes.length+1)
    
        expect(contents).toContain(newNote.content)
    })
    
    
    test('no se puede añadir una nota sin contenido', async () => {
        const newNote = {
            importat: true
        }
    
        await api
            .post('/api/notes')
            .send(newNote)
            .expect(400)
    
        const response = await api.get('/api/notes')
    
        expect(response.body).toHaveLength(initialNotes.length)
    })
})


describe('todos los test DELETE', () => {

    test('una nota debe borrarse', async () => {
        const {response: firstResponse} = await getAllContentFromNotes()
        const {body:notes} = firstResponse
        const noteToDelete = notes[0]
    
        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204)
        
        
        const {contents, response: secondResponse} = await getAllContentFromNotes()
        
        expect(secondResponse.body).toHaveLength(initialNotes.length-1)
    
        expect(contents).not.toContain(noteToDelete.content)
    })
    
    
    test('una nota no debe borrarse porque la id no existe', async () => {
        await api
            .delete(`/api/notes/123135`)
            .expect(400)
        
        
        const {response} = await getAllContentFromNotes()
        
        expect(response.body).toHaveLength(initialNotes.length)
    })
})



afterAll( () => {
    moongose.connection.close();
    server.close();
})
