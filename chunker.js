const async = require('async');
const fs = require('fs');
const request = require('request');
const { URL } = require('url');
const utils = require('./utils');

// Stores the chunk data in the index corresponding to the order in which the 
// chunk was requested.
//
// chunkDataArray[0] stores first chunk requested
// chunkDataArray[1] stores second chunk requested
// ...and so on
const chunkDataArray = [];

let debugEnabled = false;
let filename = '';

// Execution start time
let start;
// Execution end time
let end;

/**
 * Prepares the HTTP requests for the given program options and arguments.
 * 
 * @param program The program options and arguments, which may contain the following:
 * 
 * - program.args[0] :: URL of file to download
 * - program.output :: Output filename to use
 * - program.chunks :: Number of chunks to download
 * - program.size :: Size of chunks
 * - program.parallel :: Download chunks in parallel
 * - program.debug :: Enable debug mode
 */
function prepareRequests(program) {
    const urlStr = program.args[0];
    const url = new URL(urlStr);
    const pathname = url.pathname.substr(url.pathname.lastIndexOf('/') + 1);
    filename = program.output ? program.output :
        pathname === '' ? 'index.html' : pathname;
    const numberOfChunks = program.chunks ? parseInt(program.chunks) : 4;
    const sizeOfChunks = program.size ? parseInt(program.size) : 1;
    const downloadTypeText = program.parallel ? ' in parallel\n' : ' in serial\n'
    debugEnabled = program.debug;

    process.stdout.write('Downloading first ' + numberOfChunks + ' chunks in ' + sizeOfChunks + ' MiB chunks of \'' + urlStr + '\' to \'' + filename + '\'' + downloadTypeText);

    // Each element in the requestOptionsArray represents the HTTP request options
    // that will be used to request each chunk by specifying the appropriate value
    // for the HTTP Range header according to the number of chunks being requested
    // and the size of each chunk
    const requestOptionsArray = Array.from(new Array(numberOfChunks), (x, index) => {
        return {
            url: url,
            headers: {
                Range: utils.getRangeHeader(index + 1, sizeOfChunks)
            } 
        };
    });
    if (debugEnabled) {
        process.stdout.write('REQUEST OPTIONS:' + JSON.stringify(requestOptionsArray, null, 2) + '\n');
    }

    return Promise.resolve([requestOptionsArray, program]);
}

/**
 * Calls the function that requests and stores chunks in either parallel or
 * serial according to the given program options.
 * 
 * @param params An array containing the following two parameters:
 * 
 * - params[0] :: The array of HTTP request options for all of the chunks to request
 * - params[1] :: The program options and arguments
 */
function makeRequests(params) {
    const requestOptionsArray = params[0];
    const program = params[1];
    start = new Date().getTime();

    if (program.parallel) {
        async.eachOf(requestOptionsArray, requestAndStoreChunk, writeChunksToFile);
    } else {
        async.eachOfSeries(requestOptionsArray, requestAndStoreChunk, writeChunksToFile);
    }
}

/**
 * Makes the HTTP request for a chunk using the given request options and stores
 * the chunk data into the chunkDataArray using the given index.
 * 
 * @param requestOptions The HTTP request options.
 * @param index The index that corresponds to the order in which the function 
 * was called. See http://caolan.github.io/async/docs.html#eachOf
 * @param done A callback function that is called when the chunk has finished 
 * being requested and stored.
 */
function requestAndStoreChunk(requestOptions, index, done) {
    // Data from the requested chunk
    const chunkData = [];

    request(requestOptions, () => {
        process.stdout.write('.');

        // Store the chunk data to the chunkDataArray in the index corresponding to
        // the order in which the chunk was requested
        chunkDataArray[index] = Buffer.concat(chunkData);

        done();
    })
    .on('response', (res) => {
        if (debugEnabled) {
            console.log('RESPONSE HEADERS: ' + JSON.stringify(res.headers, null, 2));
        }

        // Important!! Set the encoding of the response to binary
        res.setEncoding('binary');

        if (res.statusCode >= 400) {
            console.error('[ERROR] Unexpected response from server: %s %s', res.statusCode, res.statusMessage);
            process.exit(1);
        }
    })
    .on('data', (data) => {
        // Push the binary data from the requested chunk into chunkData
        chunkData.push(Buffer.from(data, 'binary'));
    })
    .on('error', (err) => {
        console.error('[ERROR] problem with request: %s', err.message);
        process.exit(1);
    });
}

/**
 * Writes the chunk data stored in the chunkDataArray to a file.
 */
function writeChunksToFile() {
    const chunkDataBuffer = Buffer.concat(chunkDataArray);
    fs.writeFile(filename, chunkDataBuffer, function(err) {
        if (err) {
            console.error('[ERROR] An error occurred saving the file: %s', err.message);
            process.exit(1);
        }
        end = new Date().getTime();
        const executionTime = (end - start) / 1000;
        console.log('done in %s seconds', executionTime);
    });
}

module.exports = {
    makeRequests: makeRequests,
    prepareRequests: prepareRequests
};