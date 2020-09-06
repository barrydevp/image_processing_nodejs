const run = require('./src')

setImmediate(async () => {
    try {
        await run()
    } catch (e) {

        console.log(e)
    }
})