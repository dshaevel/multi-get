#!/usr/bin/env node

var pkginfo = require('pkginfo')(module, 'version');
var program = require('commander');

program
    .version(this.version)
    .usage('[options] <url>')
    .option('-o, --output <file>', 'write output to <file> instead of default')
    .option('-p, --parallel', 'download chunks in parallel instead of sequentially')
    .parse(process.argv);

if (program.args.length === 0) {
    program.outputHelp();
    process.exit(1);
} 
