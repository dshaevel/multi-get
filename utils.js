const chunkSize = 1048576; // 1 MiB = 1,048,576 bytes

function firstByteInRange(chunkNum) {
    return (chunkNum - 1) * chunkSize;
}

function lastByteInRange(chunkNum) {
    return (chunkNum * chunkSize) - 1;
}

function setRangeHeader(chunkNum) {
    return 'bytes=' + firstByteInRange(chunkNum) + '-' + lastByteInRange(chunkNum);
}

module.exports = {
    setRangeHeader: setRangeHeader
};