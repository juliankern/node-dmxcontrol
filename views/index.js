const Require = require('load-directory');


module.exports = (data) => {
    let views = Require.all(__dirname, {
        map: Require.Strategies.Filename.lowerCase,
        resolve: (func) => func(data)
    });

    return Object.keys(views)
        .sort((a, b) => views[a].id - views[b].id)
        .map(name => Object.assign(views[name], { name: name.charAt(0).toUpperCase() + name.slice(1) }));
}