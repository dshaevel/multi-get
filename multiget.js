#!/usr/bin/env node

const pkginfo = require('pkginfo')(module, 'version');
const program = require('commander');
const validUrl = require('valid-url');

program
    .version(this.version)
    .usage('[options] <url>')
    .option('-o, --output <file>', 'write output to <file> instead of default')
    // .option('-p, --parallel', 'download chunks in parallel instead of sequentially')
    .parse(process.argv);

if (program.args.length === 0 || program.args.length > 1) {
    program.outputHelp();
    process.exit(1);
} 
if (!validUrl.isWebUri(program.args[0])) {
    console.error('[ERROR] Incomplete url: %s', program.args[0]);
    process.exit(1);
}
if (validUrl.isHttpsUri(program.args[0])) {
    console.error('[ERROR] https is not supported. Please use http.');
    process.exit(1);
}