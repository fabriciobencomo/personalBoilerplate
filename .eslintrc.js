const { getEcmaVersion } = require("terser-webpack-plugin");

module.exports = {
    root: true,
    extensds: ['standard'],
    globals: {
        'IS_DEVELOPMENT': 'readonly',
    },
    parseOptions: {
        getEcmaVersion: 2020
    }
}