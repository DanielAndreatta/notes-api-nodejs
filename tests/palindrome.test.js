const  { palindrome } = require('../utils/for_testing')

test.skip( 'palindrome con string "midudev"', () => {
    const result = palindrome('midudev')
    expect(result).toBe('vedudim')
})


test.skip( 'palindrome con string vacio', () => {
    const result = palindrome('')
    expect(result).toBe('')
})

test.skip( 'palindrome con undefined', () => {
    const result = palindrome()
    expect(result).toBeUndefined()
})
