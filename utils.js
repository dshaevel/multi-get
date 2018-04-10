const oneMiB = 1048576; // 1 MiB = 1,048,576 bytes

function firstByteInRange(chunkNum, numOfMiB) {
    return (chunkNum - 1) * (oneMiB * numOfMiB);
}

function lastByteInRange(chunkNum, numOfMiB) {
    return (chunkNum * (oneMiB * numOfMiB)) - 1;
}

function setRangeHeader(chunkNum, numOfMiB) {
    return 'bytes=' + firstByteInRange(chunkNum, numOfMiB) + '-' + lastByteInRange(chunkNum, numOfMiB);
}

module.exports = {
    setRangeHeader: setRangeHeader
};