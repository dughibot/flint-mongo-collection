'use strict';

// node
const util = require('util');

// flint
const Flint = require('flint');
const MongoDb = require('flint-mongo-db');

// mongo
const mongodb = require('mongodb');
const Collection = mongodb.Collection;
const mongoCollectionFunctions = require('./mongoCollectionFunctions');

const MongoCollection = {
  name: 'MongoCollection',

  configure(config) {
    config = config || {};

    const db = MongoDb.asDependency({
      name: 'db',
      config: config.dbOptions
    });

    comp.initialize.uses(db.collection);

    this.setState({
      collectionName: config.collectionName,
      collectionOptions: config.collectionOptions
    });
  },

  initialize(cb) {
    const _this = this;

    this.db.collection(null, null, this.collectionName, this.collectionOptions,
      function(err, collection) {
        if (err) return cb(err);

        _this.setState({
          _collection: collection
        });

        cb();
      }
    );
  }
};

mongoCollectionFunctions.forEach((fnName) => {

  // If the function exists on the Db prototype
  // and it is a function, we add it to the MongoDb Component
  const fn = Collection.prototype[fnName];
  if (fn && util.isFunction(fn)) {
    MongoCollection[fnName] = function(ctx, options /*, ...args*/) {
      let args = [];
      if (arguments.length > 2) {
        args = Array.prototype.slice.call(arguments, 2);
      }
      const collection = this._collection;
      collection[fnName].apply(collection, args);
    }
  }
});

var comp = Flint.Component.define(MongoCollection);

module.exports = comp;
