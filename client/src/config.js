export const serverURL = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'http://localhost:5000/' : 'https://cryptic-temple-99770.herokuapp.com/';