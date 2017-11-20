console.log('Terminal size: ' + process.stdout.columns + 'x' + process.stdout.rows);

const DMX = require('dmx');
var dmx = new DMX();
dmx.addUniverse('dmx', 'enttec-usb-dmx-pro', '/dev/cu.usbserial-EN223883');
let universe = dmx.universes['dmx'].universe;

const blessed = require('blessed');
const contrib = require('blessed-contrib')

const settings = require('../lib/settings');

const screen = blessed.screen({
    autoPadding: false,
    dockBorders: true
});
const grid = new contrib.grid({ rows: process.stdout.rows, cols: 12, screen: screen });

let currentView = 0;
let statusTimeout;

const views = require('../views')({ universe, screen });
const viewHeight = process.stdout.rows - 4;

let navigationItems = {};
views.forEach((view) => {
    navigationItems[view.name] = () => { currentView = view.id; }
});

const navigation = grid.set(0, 0, 3, 12, blessed.listbar, Object.assign(settings.navigation, { items: navigationItems }));
const status = grid.set(viewHeight + 2, 0, 3, 12, blessed.text, settings.status);
const input = grid.set(viewHeight, 0, 3, 12, blessed.textbox, settings.input);

navigation.select(0);
navigation.on('click', () => {
    renderView();
});

input.focus();

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

renderView();

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
        universe = universe.fill(0);
        this.setStatus(`Reset all channels to 0`);
    }

    static setChannel(ch, value) {
        if (value < 0) value = 0;
        if (value > 255) value = 255;

        ch.split(',').forEach((c) => {
            if (c < 0 || c > 512) return;
            universe[c - 1] = +value;
        })

        this.setStatus(`Set channel ${ch} to ${value}`);
    }

    static send_universe() {
        dmx.universes['dmx'].send_universe.bind(dmx.universes['dmx']);
    }

    static setStatus(str) {
        if (statusTimeout) clearTimeout(statusTimeout);
        status.setContent('Status: ' + (str || 'idle.'));

        if (str) statusTimeout = setTimeout(this.setStatus, 10000);
        screen.render();
    }
}



