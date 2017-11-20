module.exports = {
    navigation: {
        mouse: true,
        style: {
            selected: {
                bg: 'white',
                fg: 'black'
            }
        }
    },
    status: {
        content: 'Status: idle.',
        padding: {
        },
        style: {
            border: { fg: 'black' }
        }
    },
    input: {
        keys: 'i',
        interactive: true,
        border: false,
        input: true,
        inputOnFocus: true
    }
}