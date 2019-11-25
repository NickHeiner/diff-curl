#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs');
const url = require('url');
const _ = require('lodash');
const {promisify} = require('util');
const readFile = promisify(fs.readFile.bind(fs));
const jestDiff = require('jest-diff');

const parseCurl = fileContents => {
  const [urlStr, ...flags] = fileContents.split(/\s/).slice(1);
  const parsedUrl = _(url.parse(urlStr, true))
    .omit('href', 'path', 'search')
    .omitBy(val => val === null || typeof val === 'function')
    .value();

  const parsedFlags = _.omit(yargs.parse(flags), '_', '$0');

  return {
    url: parsedUrl,
    flags: parsedFlags
  };
};

yargs.command('$0 fileA fileB', 'Compare two CURL requests', () => {}, async argv => {
  const [parsedA, parsedB] = (await Promise.all([readFile(argv.fileA, 'utf8'), readFile(argv.fileB, 'utf8')]))
    .map(parseCurl);

  // This console statement is intentional.
  // eslint-disable-next-line no-console
  console.log(jestDiff(parsedA, parsedB));
}).argv;
