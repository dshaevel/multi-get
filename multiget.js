#!/usr/bin/env node

const pkginfo = require('pkginfo')(module, 'version');
const program = require('commander');
const validUrl = require('valid-url');
const chunker = require('./chunker');

program
    .version(this.version)
    .usage('[options] <url>')
    .option('-c, --chunks <#>', 'number of chunks to use instead of default 4')
    .option('-o, --output <file>', 'write output to <file> instead of default')
    .option('-p, --parallel', 'download chunks in parallel instead of sequentially')
    .option('-s, --size <#>', 'size of chunks to use, in MiB, instead of default 1')
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
if (program.chunks && isNaN(parseInt(program.chunks))) {
    const chunkOption = program.options.find((opt) => {
        return opt.short === '-c';
    });
    console.error('[ERROR] option ' + chunkOption.flags + ' must be a number.');
    process.exit(1);
}
if (program.size && isNaN(parseInt(program.size))) {
    const sizeOption = program.options.find((opt) => {
        return opt.short === '-s';
    });
    console.error('[ERROR] option ' + sizeOption.flags + ' must be a number.');
    process.exit(1);
}

chunker.prepareRequestHeaders(program).then(chunker.makeRequests);