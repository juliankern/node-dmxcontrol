const contrib = require('blessed-contrib')


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
        for(let i = 0; i < 12 && ch < universe.length; i++) {
            let table = grid.set(2, i, viewHeight - 1, 1, contrib.table, {
                fg: 'white',
                selectedFg: 'white',
                selectedBg: 'blue',
                // border: {type: "line", fg: "cyan"},
                columnSpacing: 5, //in chars,
                columnWidth: [4, 6] /*in chars*/
            });

            let rows = [];
            while (rows.length < viewHeight - 5 && ch < universe.length) {
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

        screen.render();
    }
}
