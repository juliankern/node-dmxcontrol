const blessed = require('blessed')

let scenes = [
    { id: 1, name: 'test', fade: 0, channels: { 1: 255, 10: 255, 20: 255 } },
];

module.exports = ({ universe, screen }) => {
    let table;

    return {
        id: 2,
        commands: [
            {
                test(command) { return ['save'].includes(command.toLowerCase()) },
                callback(command) {
                    let args = command.split(' ');
                    let scene = { id: 1, name: '', fade: 0, channels: {} };
                    args.shift();
                    args.forEach((a) => {
                        let keyValue = a.split(':');
                        scene[keyValue[0]] = keyValue[1];
                    });

                    scene.channels = universe.filter(ch => ch > 0);

                    scenes.push(scene);

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
                    fg: 'cyan'
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

        let rows = [];
        scenes.sort((a, b) => a.id - b.id);
        scenes.forEach((scene) => {
            rows.push([ '' + scene.id, scene.name, '' + scene.fade, '' + Object.keys(scene.channels).length ]);
        });

        table.setData([
            ['ID', 'Name', 'Fade', 'Channels']
        ].concat(rows));

        screen.render();
    }
}
