const async = require('async');
const http = require('http');
const { URL } = require('url');
const utils = require('./utils');

const testUrl = 'http://91vfv5w.bwtest-aws.pravala.com/384MB.jar';

function prepareHeaders(program) {
    const urlStr = testUrl;
    // const urlStr = program.args[0];
    const url = new URL(urlStr);
    const pathname = url.pathname.substr(url.pathname.lastIndexOf('/') + 1);
    const filename = program.output ? program.output :
        pathname === '' ? 'index.html' : pathname;
    const numberOfChunks = program.chunks ? program.chunks : 4;

    process.stdout.write('Downloading first ' + numberOfChunks + ' chunks of \'' + urlStr + '\' to \'' + filename + '\'');
    const optionsArray = [];
    for (let x = 1; x <= numberOfChunks; x++) {
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET',
            headers: {}
        };
        options.headers['Range'] = utils.setRangeHeader(x);
        optionsArray.push(options);
    }
    return Promise.resolve([optionsArray, program]);
}

function makeRequests(params) {
    const optionsArray = params[0];
    const program = params[1];

    if (program.parallel) {
        process.stdout.write(' in parallel\n');
        async.each(optionsArray, download, done);
    } else {
        process.stdout.write(' in serial\n');
        async.eachSeries(optionsArray, download, done);
    }
}

function download(opt, callback) {
    const req = http.request(opt, (res) => {
        // console.log('HEADERS: ' + JSON.stringify(res.headers, null, 2));

        if (res.statusCode >= 400) {
            console.error('[ERROR] Unexpected response from server: %s %s', res.statusCode, res.statusMessage);
            process.exit(1);
        }
        res.on('data', (chunkData) => {
        });
        res.on('end', () => {
            process.stdout.write('.');
            callback();
        });
    });
    
    req.on('error', (err) => {
        console.error('[ERROR] problem with request: %s', err.message);
        process.exit(1);
    });
    
    req.end();
}

function done() {
    console.log('done');
}

module.exports = {
    makeRequests: makeRequests,
    prepareHeaders: prepareHeaders
};