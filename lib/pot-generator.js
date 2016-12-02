/* jshint node: true */
'use strict';

const YAML = require('yamljs');

class POTGenerator {

  constructor(yaml) {
    this.yaml        = yaml;
    this.data        = [];
    this.mapNameToId = {};
  }

  entryFor(key, val, paths) {
    const msgkey = paths.concat(key).join('.');
    const msgstr = val;

    if (this.mapNameToId[msgstr]) {
      this.mapNameToId[msgstr].push(msgkey);
    } else {
      this.mapNameToId[msgstr] = [msgkey];
    }
  }

  createMsgIds(ids) {
    return ids.map((id)=> {
      return `#. source ${id}`
    }).join("\n");
  }

  createData() {
    const data = [];
    for (let key in this.mapNameToId) {

      let msgids = this.mapNameToId[key];
      let msgstr = key;
      data.push([
          this.createMsgIds(msgids),
          // `msgctxt "${msgstr}"`,
          `msgid "${msgstr}"`,
          `msgstr "${msgstr}"`,
          ''
      ].join("\n"));
    }
    return data;
  }

  keysForObject(obj, paths=[]) {
    for (let key in obj) {
      let val = obj[key];
      if (typeof(val) === 'string') {
        this.entryFor(key, val, paths);
      } else if (typeof(val) === 'object') {
        this.keysForObject(val, paths.concat(key));
      } else {
        throw new Error('Not a string or object');
      }
    }

  }

  run() {
    this.keysForObject(this.yaml);
  }

  export() {
    return this.createData().join("\n");
  }
}

module.exports = POTGenerator;

