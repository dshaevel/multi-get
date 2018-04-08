# multi-get

## Description
Build an application that downloads part of a file from a web server, in chunks.

This is a simplified version of a “download booster”, which speeds up downloads by requesting files in multiple pieces simultaneously (saturating the network), then reassembling the pieces.

## Requirements
* Source URL should be specified with a required command-line option
* File is downloaded in 4 chunks (4 requests made to the server)
* Only the first 4 MiB of the file should be downloaded from the server
* Output file may be specified with a command-line option (but may have a default if not set)
* No corruption in file - correct order, correct size, correct bytes (you don’t need to verify correctness, but it should not introduce errors)
* File is retrieved with GET requests

## Optional features
* File is downloaded in parallel rather than serial
* Support files smaller than 4 MiB (less chunks/adjust chunk size)
* Configurable number of chunks/chunk size/total download size

## Out of scope
* HTTPS
* Server doesn’t support range request, or serves it incorrectly
* Other HTTP methods (PUT/POST/DELETE)
* Re-use existing connections with HTTP keep-alive

## Additional notes
* You may use any system or open-source libraries you need to perform this task
* You can assume the test file will be bigger than the test size (> 4 MiB)
* Document your assumptions if this document is unclear and they affect your design