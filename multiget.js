#!/usr/bin/env node

var pkginfo = require('pkginfo')(module, 'version');
var program = require('commander');

program
    .version(this.version)
    .parse(process.argv);
