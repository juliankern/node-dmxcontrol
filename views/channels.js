const blessed = require('blessed')


module.exports = ({ universe, screen }) => {
    let tables = [];

    return {
        id: 1,
        commands: [
            {
                test(command) { return ['s', 'set'].includes(command.toLowerCase()) },
                callback(command) {
                    let args = command.split(' ');
                    args.shift();

                    args.forEach((a) => {
                        let splitchar = ':';
                        if (a.includes('@')) splitchar = '@';

                        this.setChannel(...a.split(splitchar).map(e => e.trim()));
                    });

                    this.send_universe();
                    // screen.render();
                }
            },
            {
                test(command) { return ['r', 'reset'].includes(command.toLowerCase()) },
                callback(command) {
                    this.resetUniverse();
                    this.send_universe();
                    // screen.render();
                }
            }
        ],
        render: renderTable,
        update: renderTable,
        hide
    }

    function hide() {
        tables.forEach(t => t.destroy());
    }

    function renderTable({ screen, grid, viewHeight }) {
        hide();
        let ch = 0;
        tables = [];
        for(let i = 0; ch < universe.length; i++) {
            let table = blessed.listtable({
                top: 3,
                left: i * 12,
                width: 11,
                height: viewHeight - 3,
                border: {
                    type: 'line'
                },
                style: {
                    selected: {
                        fg: 'white',
                        bg: 'red'
                    },
                    item: {
                        fg: 'white',
                        bg: 'red'
                    },
                    border: {
                        fg: 'white'
                    },
                    cell: {
                        fg: 'white',
                        padding: {
                            top: 0,
                            bottom: 0
                        }
                    },
                    header: {
                        fg: 'white',
                        bold: true,
                        padding: 0
                    }
                },
                noCellBorders: true,
                pad: 0
                // border: {type: "line", fg: "cyan"},
            });
            table.down(3);

            let rows = [];
            while (rows.length < viewHeight - 4 && ch < universe.length) {
                rows.push([ ('' + (ch + 1)).padStart(4), ' ' + (universe[ch].toFixed(0).padStart(3, ' ')) ]);

                ch++;
            }

            table.setData([
                ['Ch', ' Value']
            ].concat(rows));

            screen.append(table);
            tables.push(table);
        }

        screen.render();
    }
}
