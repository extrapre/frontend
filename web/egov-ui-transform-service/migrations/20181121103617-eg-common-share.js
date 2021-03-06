'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// with table options
exports.up = function (db, callback) {
  db.createTable('eg_common_share', {
    columns: {
      id: { type: 'string', primaryKey: true, notNull:true },
      tenantId: 'string',  // shorthand notation,
      userId:"string",
      shareSource:{type:"string",defaultValue:"WEB"},
      shareMedia:{type:"string",defaultValue:"SMS"},
      shareContent:"jsonb",
      shareTemplate:"string"
    },
    ifNotExists: true
  }, callback);
}

exports.down = function(db) {
  return db.dropTable('eg_common_share');
};

exports._meta = {
  "version": 1
};
