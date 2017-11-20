module.exports = {
    navigation: {
        mouse: true,
        style: {
            fg: 'white',
            selected: {
                bg: 'white',
                fg: 'black'
            },
            border: {
                fg: 'white'
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
        inputOnFocus: true,
        style: {
            fg: 'white',
            border: {
                fg: 'white'
            }
        }
    }
}