require('../lib/global');
console.log('Terminal size: ' + process.stdout.columns + 'x' + process.stdout.rows);

const blessed = require('blessed');
const contrib = require('blessed-contrib');

const screen = blessed.screen({ autoPadding: false, dockBorders: true });
const grid = new contrib.grid({ rows: process.stdout.rows, cols: 12, screen: screen });
const viewHeight = process.stdout.rows - 4;

const settings = require('../lib/settings');
const views = require('../views')({ screen });

let navigationItems = {};
views.forEach((view) => {
    navigationItems[view.name] = () => { currentView = view.id; }
});

const navigation = grid.set(0, 0, 3, 12, blessed.listbar, Object.assign(settings.navigation, { items: navigationItems }));
const status = grid.set(viewHeight + 2, 0, 3, 12, blessed.text, settings.status);
const input = grid.set(viewHeight, 0, 3, 12, blessed.textbox, settings.input);

let currentView = 0;
let statusTimeout;

navigation.select(0);
input.focus();
renderView();

input.key(['escape', 'C-c'], (ch, key) => {
    return process.exit(0);
});

input.on('submit', (content) => {
    let args = content.split(' ');

    input.clearValue();
    input.focus();

    views.forEach((view) => {
        view.commands.forEach((c) => {
            if(c.test(args[0])) {
                c.callback.call(ViewHelper, content);
            }
        });
    });

    if(typeof +args[0] === 'number' && !isNaN(+args[0])) {
        currentView = +args[0] - 1;
        navigation.select(currentView);
        ViewHelper.setStatus(`Switched to view ${views[currentView].name}`);
    }

    renderView();
});

function renderView() {
    let screenNumber = currentView + 1;

    views.forEach((view) => {
        if(view.id === screenNumber) {
            view.render({ screen, grid, viewHeight });
        } else {
            view.hide();
        }
    });

    screen.render();
}

function getCurrentView() {
    let screenNumber = currentView + 1;

    let view = views.filter((view) => {
        return view.id === screenNumber
    });

    return view;
}

class ViewHelper {
    static resetUniverse() {
        global.dmxcon.universedata = global.dmxcon.universedata.fill(0);
        this.setStatus(`Reset all channels to 0`);
    }

    static setChannel(ch, value) {
        let channels = {};

        if (value < 0) value = 0;
        if (value > 255) value = 255;

        ch.split(',').forEach((c) => {
            if (c < 0 || c > 512) return;
            channels[c - 1] = +value;
        });

        global.dmxcon.universe.update(channels);

        this.setStatus(`Set channel ${ch} to ${value}`);
    }

    static send_universe() {
        global.dmxcon.dmx.universes['dmx'].send_universe.bind(global.dmxcon.dmx.universes['dmx']);
    }

    static setStatus(str) {
        if (statusTimeout) clearTimeout(statusTimeout);
        status.setContent('Status: ' + (str || 'idle.'));

        if (str) statusTimeout = setTimeout(this.setStatus, 10000);
        screen.render();
    }
}



