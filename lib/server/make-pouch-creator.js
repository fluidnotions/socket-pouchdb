'use strict';
// avoid extra deps
var PouchDB = require('pouchdb-browser');//require('pouchdb');
var Promise = require('bluebird');

function createLocalPouch(args) {

  if (typeof args[0] === 'string') {
    args = [{name: args[0]}];
  }

  // TODO: there is probably a smarter way to be safe about filepaths
  args[0].name = args[0].name.replace('.', '').replace('/', '');
  return Promise.resolve({
    pouch: new PouchDB(args[0])
  });
}

function createHttpPouch(options) {
  var remoteUrl = options.remoteUrl;
  // chop off last '/'
  if (remoteUrl[remoteUrl.length - 1] === '/') {
    remoteUrl = remoteUrl.substring(0, remoteUrl.length -1);
  }
  return function (args) {
    if (typeof args[0] === 'string') {
      args = [{name: args[0]}];
    }
    return Promise.resolve({
      pouch: new PouchDB(remoteUrl + '/' + args[0].name)
    });
  };
}


function makePouchCreator(options, server) {
  //see commit
  //https://github.com/jbjorge/socket-pouch/blob/179cba60c1ff5ab47c38b03e1db9d8e10006a4e3/lib/server/make-pouch-creator.js
  if(!options.useCustomPouchInstance){
    // throw new Error("Missing PouchDB instance.")
    console.error(("Missing PouchDB instance."))
  }
  if (options.remoteUrl) {
    return createHttpPouch(options);
  }
  if (!options.pouchCreator) {
    return createLocalPouch;
  }
  return function (args) {
    var name = typeof args[0] === 'string' ? args[0] : args[0].name;
    var res = options.pouchCreator(name, server);
    if (res instanceof PouchDB) {
      return {pouch: res};
    } else {
// it always should be a PouchDB instance
      return res;
   }
  };
}

module.exports = makePouchCreator;
