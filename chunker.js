const async = require('async');
const fs = require('fs');
const http = require('http');
const { URL } = require('url');
const utils = require('./utils');

const testUrl = 'http://91vfv5w.bwtest-aws.pravala.com/384MB.jar';
const chunkDataArray = [];
let filename = '';
let start;
let end;

function prepareHeaders(program) {
    // const urlStr = testUrl;
    const urlStr = program.args[0];
    const url = new URL(urlStr);
    const pathname = url.pathname.substr(url.pathname.lastIndexOf('/') + 1);
    filename = program.output ? program.output :
        pathname === '' ? 'index.html' : pathname;
    const numberOfChunks = program.chunks ? parseInt(program.chunks) : 4;
    const sizeOfChunks = program.size ? parseInt(program.size) : 1;

    process.stdout.write('Downloading first ' + numberOfChunks + ' chunks in ' + sizeOfChunks + ' MiB chunks of \'' + urlStr + '\' to \'' + filename + '\'');

    const optionsArray = Array.from(new Array(numberOfChunks), (x, index) => {
        return {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: 'GET',
            headers: {
                Range: utils.setRangeHeader(index + 1, sizeOfChunks)
            } 
        };
    });

    return Promise.resolve([optionsArray, program]);
}

function makeRequests(params) {
    const optionsArray = params[0];
    const program = params[1];
    start = new Date().getTime();

    if (program.parallel) {
        process.stdout.write(' in parallel\n');
        async.eachOf(optionsArray, download, saveFile);
    } else {
        process.stdout.write(' in serial\n');
        async.eachOfSeries(optionsArray, download, saveFile);
    }
}

function download(opt, index, callback) {
    const req = http.request(opt, (res) => {
        // console.log('HEADERS: ' + JSON.stringify(res.headers, null, 2));
        res.setEncoding('binary');
        const chunkData = [];

        if (res.statusCode >= 400) {
            console.error('[ERROR] Unexpected response from server: %s %s', res.statusCode, res.statusMessage);
            process.exit(1);
        }
        res.on('data', (data) => {
            chunkData.push(Buffer.from(data, 'binary'));
        });
        res.on('end', () => {
            process.stdout.write('.');
            chunkDataArray[index] = Buffer.concat(chunkData);
            callback();
        });
    });
    
    req.on('error', (err) => {
        console.error('[ERROR] problem with request: %s', err.message);
        process.exit(1);
    });
    
    req.end();
}

function saveFile() {
    const combinedBuffer = Buffer.concat(chunkDataArray);
    fs.writeFile(filename, combinedBuffer, function(err) {
        if (err) {
            console.error('[ERROR] An error occurred saving the file: %s', err.message);
            process.exit(1);
        }
        end = new Date().getTime();
        const executionTime = (end -start) / 1000;
        console.log('done in %s seconds', executionTime);
    });
}

module.exports = {
    makeRequests: makeRequests,
    prepareHeaders: prepareHeaders
};