#!/usr/bin/env node

const pkginfo = require('pkginfo')(module, 'version');
const program = require('commander');
const validUrl = require('valid-url');
const chunker = require('./chunker');

program
    .version(this.version)
    .description(
        'A command for downloading a file in chunks.\n\n' +
        '  By default, multiget will request the first 4 MiB of a file in 1 MiB chunks, and write the result to disk.'
    )
    .usage('[options] <url>')
    .option('-c, --chunks <#>', 'number of chunks to use instead of default 4')
    .option('-d, --debug', 'enable debug mode')
    .option('-o, --output <file>', 'write output to <file> instead of default')
    .option('-p, --parallel', 'download chunks in parallel instead of sequentially')
    .option('-s, --size <#>', 'size of chunks to use, in MiB, instead of default 1');

program.on('--help', () => {
    console.log();
    console.log('  Examples:');
    console.log();
    console.log('    DEFAULT');
    console.log('      Download first 4 chunks in 1 MiB chunks in serial:');
    console.log('      $ ./multiget.js http://91vfv5w.bwtest-aws.pravala.com/384MB.jar');
    console.log();
    console.log('    -c, --chunks');
    console.log('      Download first 10 chunks in 1 MiB chunks in serial:');
    console.log('      $ ./multiget.js -c 10 http://91vfv5w.bwtest-aws.pravala.com/384MB.jar');
    console.log();
    console.log('    -s, --size');
    console.log('      Download first 10 chunks in 5 MiB chunks in serial:');
    console.log('      $ ./multiget.js -c 10 -s 5 http://91vfv5w.bwtest-aws.pravala.com/384MB.jar');
    console.log();
    console.log('    -p, --parallel');
    console.log('      Download first 10 chunks in 5 MiB chunks in parallel:');
    console.log('      $ ./multiget.js -c 10 -s 5 -p http://91vfv5w.bwtest-aws.pravala.com/384MB.jar');
    console.log();
    console.log('    -o, --output');
    console.log('      Download first 10 chunks in 5 MiB chunks in parallel and write output to \'download.jar\':');
    console.log('      $ ./multiget.js -c 10 -s 5 -p -o download.jar http://91vfv5w.bwtest-aws.pravala.com/384MB.jar');
    console.log();
});
program.parse(process.argv);

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

chunker.prepareRequests(program).then(chunker.makeRequests);