console.log('Terminal size: ' + process.stdout.columns + 'x' + process.stdout.rows);

const DMX = require('dmx');
var dmx = new DMX();
dmx.addUniverse('dmx', 'enttec-usb-dmx-pro', '/dev/cu.usbserial-EN223883');

const blessed = require('blessed');
const contrib = require('blessed-contrib')

let currentScreen = 0;
let screens = [
    blessed.screen({
        autoPadding: false,
        dockBorders: true
    })
];

let grids = [
    new contrib.grid({ rows: process.stdout.rows, cols: 12, screen: screens[0] })
];

const tableHeight = process.stdout.rows - 4;
const tableSettings = { 
    fg: 'white', 
    selectedFg: 'white', 
    selectedBg: 'blue', 
    // border: {type: "line", fg: "cyan"}, 
    columnSpacing: 5, //in chars, 
    columnWidth: [4, 6] /*in chars*/ 
};

let tables = [];
let currentTable = 0;
let currentIndex = 0;

let statusTimeout;

let universe = dmx.universes['dmx'].universe;
let send_universe = dmx.universes['dmx'].send_universe.bind(dmx.universes['dmx']);

const navigation = getGrid().set(0, 0, 3, 12, blessed.listbar, {
    items: {
        'Channels': () => { currentScreen = 0; },
        'Scenes': () => { currentScreen = 1; },
        'Groups': () => { currentScreen = 2; },
        'Show': () => { currentScreen = 3; },
        'Export': () => { currentScreen = 4; },
    },
    mouse: true,
    style: {
        selected: {
            bg: 'white',
            fg: 'black'
        }
    }
});

navigation.select(0);

var status = getGrid().set(tableHeight + 2, 0, 3, 12, blessed.text, { 
    content: 'Status: idle.',
    padding: {
    },
    style: {
        border: { fg: 'black' }
    }
});

var input = getGrid().set(tableHeight, 0, 3, 12, blessed.textbox, {
    keys: 'i',
    interactive: true,
    border: false,
    input: true,
    inputOnFocus: true
});

input.focus();

input.key(['escape', 'C-c'], (ch, key) => {
    return process.exit(0);
});

input.on('submit', (content) => {
    let args = content.split(' ');

    input.clearValue();
    input.focus();

    if (['s', 'set'].includes(args[0].toLowerCase())) {
        setChannel(...content.split('set')[1].split('@').map(e => e.trim()));
        send_universe();
    } 
    else if(['r', 'reset'].includes(args[0].toLowerCase())) {
        resetUniverse();
        send_universe();
    } 
    else if(typeof +args[0] === 'number') {
        currentScreen = +args[0] - 1;
        navigation.select(currentScreen);
    }

    renderScreen()
});

renderScreen();

// getScreen().on('resize', renderTable);

function renderScreen() {
    let screenNumber = currentScreen + 1;

    if (screenNumber === 1) {
        renderTable();
    } else {
        tables.forEach(t => t.hide());
    }

    getScreen().render();
}

function getScreen() {
    return screens[0];
}

function getGrid() {
    return grids[0];
}

function resetUniverse() {
    universe = universe.fill(0);
    renderTable();
    setStatus(`Reset all channels to 0`);
}

function setChannel(ch, value) {
    if (value < 0) value = 0;
    if (value > 255) value = 255;

    ch.split(',').forEach((c) => {
        if (c < 0 || c > 512) return;
        universe[c - 1] = +value;
    })

    setStatus(`Set channel ${ch} to ${value}`);
    renderTable();
}

function setStatus(str) {
    if (statusTimeout) clearTimeout(statusTimeout);
    status.setContent('Status: ' + (str || 'idle.'));

    if (str) statusTimeout = setTimeout(setStatus, 10000);
    getScreen().render();
}

function renderTable() {
    let ch = 0;
    for(let i = 0; i < 12 && ch < universe.length; i++) {
        var table = getGrid().set(2, i, tableHeight - 1, 1, contrib.table, tableSettings);
        
        let rows = [];
        while (rows.length < tableHeight - 5 && ch < universe.length) {
            rows.push([ ('' + (ch + 1)).padStart(4), ' ' + (universe[ch].toFixed(0).padStart(3, ' ')) ]);

            ch++;
        }

        table.setData({ 
            headers: ['Ch', ' Value'], 
            data: rows
        });

        table.rows.select(false);

        tables.push(table);
    }

    getScreen().render();
}