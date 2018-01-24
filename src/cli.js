const findUp = require('find-up')

const { deploy } = require('./')

const VERSION = require('../package').version

const argv = require('yargs')
  .version(VERSION)
  .help('help')
  .default('type', 'next')
  .example('$0', 'publish next candidate release ')
  .example('$0 stable ', 'publish stable release')
  .showHelpOnFail(true, 'use --help for available options').argv

findUp('lerna.json').then(lernaPath =>
  deploy({
    type: argv.type,
    lernaPath,
  })
).catch(console.error)
