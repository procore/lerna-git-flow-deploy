const VERSION = require('../package').version

const { changelog, publish, ghPr, ghRelease } = require('./')

const argv = require('yargs')
  .version(VERSION)
  .help('help')
  .showHelpOnFail(true, 'use --help for available options')
  .command(
    'changelog',
    'output the full changelog',
    yargs => {},
    argv => changelog(argv)
  )
  .command(
    'publish [type]',
    'publish a release',
    yargs => {},
    argv => publish(argv)
  )
  .command(
    'gh-pr',
    'create a github pull request',
    yargs => {},
    argv => ghPr(argv)
  )
  .command(
    'gh-release',
    'create a github tagged release',
    yargs => {},
    argv => ghRelease(argv)
  ).argv
