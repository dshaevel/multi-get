# multi-get - v1.0.0 - David Shaevel
### 04/11/2018

---

## Description
Build an application that downloads part of a file from a web server, in chunks.

This is a simplified version of a “download booster”, which speeds up downloads by requesting files in multiple pieces simultaneously (saturating the network), then reassembling the pieces.

## Installation and Usage
```
$ npm install

## View usage information
$ ./multiget.js -h

  Usage: multiget [options] <url>

  A command for downloading a file in chunks.

  By default, multiget will request the first 4 MiB of a file in 1 MiB chunks, and write the result to disk.

  Options:

    -V, --version        output the version number
    -c, --chunks <#>     number of chunks to use instead of default 4
    -d, --debug          enable debug mode
    -o, --output <file>  write output to <file> instead of default
    -p, --parallel       download chunks in parallel instead of sequentially
    -s, --size <#>       size of chunks to use, in MiB, instead of default 1
    -h, --help           output usage information

  Examples:

    DEFAULT
      Download first 4 chunks in 1 MiB chunks in serial:
      $ ./multiget.js http://91vfv5w.bwtest-aws.pravala.com/384MB.jar

    -c, --chunks
      Download first 10 chunks in 1 MiB chunks in serial:
      $ ./multiget.js -c 10 http://91vfv5w.bwtest-aws.pravala.com/384MB.jar

    -s, --size
      Download first 10 chunks in 5 MiB chunks in serial:
      $ ./multiget.js -c 10 -s 5 http://91vfv5w.bwtest-aws.pravala.com/384MB.jar

    -p, --parallel
      Download first 10 chunks in 5 MiB chunks in parallel:
      $ ./multiget.js -c 10 -s 5 -p http://91vfv5w.bwtest-aws.pravala.com/384MB.jar

    -o, --output
      Download first 10 chunks in 5 MiB chunks in parallel and write output to 'download.jar':
      $ ./multiget.js -c 10 -s 5 -p -o download.jar http://91vfv5w.bwtest-aws.pravala.com/384MB.jar

```

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