const oneMiB = 1048576; // 1 MiB = 1,048,576 bytes

function firstByteInRange(chunkNum, numOfMiB) {
    return (chunkNum - 1) * (oneMiB * numOfMiB);
}

function lastByteInRange(chunkNum, numOfMiB) {
    return (chunkNum * (oneMiB * numOfMiB)) - 1;
}

/**
 * Gets the byte range for use in the HTTP Range header for the given chunk number 
 * and the given chunk size.
 * 
 * Examples:
 * 
 * getRangeHeader(1, 1) ==> "bytes=0-1048575"
 * getRangeHeader(2, 1) ==> "bytes=1048576-2097151"
 * 
 * getRangeHeader(1, 2) ==> "bytes=0-2097151"
 * getRangeHeader(2, 2) ==> "bytes=2097152-4194303"
 * 
 * @param chunkNum The chunk number, which should be a number > 0.
 * @param numOfMiB The chunk size, specified in number of MiB.
 * 
 * @returns The byte range for use in the HTTP Range header.
 */
function getRangeHeader(chunkNum, numOfMiB) {
    return 'bytes=' + firstByteInRange(chunkNum, numOfMiB) + '-' + lastByteInRange(chunkNum, numOfMiB);
}

module.exports = {
    getRangeHeader: getRangeHeader
};