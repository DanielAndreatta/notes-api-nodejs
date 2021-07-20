const {average} = require('../utils/for_testing')

describe.skip('averrage', () => {
 
    test('le pasamos un valor y da la media', () => {
        expect(average([1])).toBe(1)
    })


    test('le pasamos valores y da la media', () => {
        expect(average([1,2,3,4,5,6])).toBe(3.5)
    })
    

    test('le pasamos un array vacio y da cero', () => {
        expect(average([])).toBe(0)
    })
    
})
