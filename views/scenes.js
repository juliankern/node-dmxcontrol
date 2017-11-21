const blessed = require('blessed')
const storage = global.dmxcon.storage;

let scenes = storage.get('scnenes:sceneList') || [];

module.exports = ({ screen }) => {
    let table;

    return {
        id: 2,
        commands: [
            {
                test(command) { return ['save'].includes(command.toLowerCase()) },
                callback(command) {
                    let args = command.split(' ');
                    scenes.sort((a, b) => a.id - b.id);
                    let nextId = scenes.slice(-1).pop() ? scenes.slice(-1).pop().id + 1 : 1;
                    let scene = { id: nextId, name: '', fade: 0, channels: {} };

                    args.shift();
                    args.forEach((a, i) => {
                        if (!a.includes(':')) {
                            scene.name = a;
                        } else {
                            let keyValue = a.split(':');
                            scene[keyValue[0]] = keyValue[1];
                        }
                    });

                    global.dmxcon.universedata.forEach((v, ch) => {
                        if (v > 0) {
                            scene.channels[ch + 1] = v;
                        }
                    })

                    scenes.push(scene);
                    storage.set('scnenes:sceneList', scenes);

                    this.setStatus(`Saved current set of channels as scene "${scene.name}" (ID: ${scene.id})`);
                }
            },
            {
                test(command) { return ['scene', 'load'].includes(command.toLowerCase()) },
                callback(command) {
                    let args = command.split(' ');
                    args.shift();

                    let scene = scenes.find(s => (+s.id === +args[0] || '' + s.name === '' + args[0]));

                    if (scene) {
                        this.resetUniverse();
                        Object.keys(scene.channels).forEach((ch) => {
                            this.setChannel(ch, scene.channels[ch]);
                        });
                        this.setStatus(`Loaded scene "${scene.name}" (ID: ${scene.id})`);
                        this.send_universe();
                    }
                }
            },
            {
                test(command) { return ['delete', 'rm'].includes(command.toLowerCase()) },
                callback(command) {
                    let args = command.split(' ');
                    args.shift();

                    let i = scenes.findIndex(s => (+s.id === +args[0] || '' + s.name === '' + args[0]));
                    let scene = scenes[i];

                    if (scene) {
                        this.setStatus(`Deleted scene "${scene.name}" (ID: ${scene.id})`);
                        delete scenes[i];
                    }
                }
            }
        ],
        render: renderTable,
        update: renderTable,
        hide
    }

    function hide() {
        if(table) table.destroy();
    }

    function renderTable({ screen, grid, viewHeight }) {
        hide();
        table = grid.set(2, 0, viewHeight - 1, 3, blessed.table, {
            style: {
                border: {
                    fg: 'white'
                },
                cell: {
                    fg: 'white'
                },
                header: {
                    fg: 'white',
                    bold: true,
                }
            },
            noCellBorders: true,
            pad: 0
            // border: {type: "line", fg: "cyan"},
        });

        if (scenes.length > 0) {
            let rows = [];
            scenes.sort((a, b) => a.id - b.id);
            scenes.forEach((scene) => {
                rows.push([ '' + scene.id, scene.name, '' + scene.fade, '' + Object.keys(scene.channels).length ]);
            });
            table.setData([
                ['ID', 'Name', 'Fade', 'Channels']
            ].concat(rows));
        } else {
            table.setData([ ['No scenes saved yet.'] ]);
        }


        screen.render();
    }
}
