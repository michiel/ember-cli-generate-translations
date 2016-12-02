/* jshint node: true */
'use strict';

const fs   = require('fs');
const YAML = require('yamljs');

const POTGenerator = require('./lib/pot-generator');

const content = fs.readFileSync('/home/michiel/Downloads/xds-th.po', 'utf-8');
const sourceRE = /^#. source /;

const getMsgId = (msg) => {
  return msg.replace(/msgid /, '').replace(/"/g, '').toString();
}

const getMsgStr = (msg) => {
  return msg.replace(/msgstr /, '').replace(/"/g, '').toString();
}

class YAMLGenerator {
  constructor(pofile) {
    this.pofile = pofile;
    this.rows   = pofile.split(/\n/);
    this.json   = {};
    this.index  = 0;
  }

  valueForJson(path, valId, valStr) {
    let steps = path.split(/\./);
    let obj = this.json;
    while (steps.length !== 1) {
      let step = steps.shift();
      if (!!!obj[step]) {
        obj[step] = {};
      }
      obj = obj[step];
    }
    if (valStr === "") {
      obj[steps[0]] = 'missing-nls';
    } else {
      obj[steps[0]] = valStr;
    }
  }

  getSourcesAt() {
    let sources = [];
    let matching = true;
    while (matching) {
      let row = this.rows[this.index];
      if (row.match(sourceRE)) {
        sources.push(row.replace(sourceRE, ''));
        this.index++;
      } else {
        matching = false;
      }
    }
    return sources;
  }

  run() {
    while (this.index < this.rows.length) {
      let row = this.rows[this.index];
      if (row.match(/^$/)) {
        this.index++;
      } else if (row.match(sourceRE)) {
        let sources = this.getSourcesAt();
        // console.log('This is ', rows[index], ' with ', sources);
        let nextRow = this.rows[this.index+1];
        sources.forEach((src)=> {
          this.valueForJson(src, getMsgId(row), getMsgStr(nextRow));
        });
        this.index++;
        this.index++;
      } else {
        // console.log('Skipping row ', row);
        this.index++;
      }
    }
  }

  export() {
    return YAML.stringify(this.json, 20);
  }




}

module.exports = {
  name: 'ember-cli-generate-translations',
  includedCommands: function() {
    return {
      i18nYAMLCommand: {
        name: 'generate-i18n-yaml',
        description: 'Generate the translations/ YAML files from PO translations',
        run: function(commandOptions, rawArgs) {
          console.log('Generating translations/ yaml files from i18n-data/po/ po files');
          const pofile = fs.readFileSync('i18n-data/po/xds-th.po', 'utf-8');
          const yamlGenerator = new YAMLGenerator(pofile);
          yamlGenerator.run();
          console.log('GENERATED', yamlGenerator.export());
        }
      },
      i18nPOTCommand: {
        name: 'generate-i18n-pot',
        description: 'Generate the i18n-data/app.pot file from the primary language',
        run: function(commandOptions, rawArgs) {
          console.log('Generating app.pot from translations/en-us.yaml');
          const yamlData = YAML.load('translations/en-us.yaml');
          const potGenerator = new POTGenerator(yamlData);
          potGenerator.run();
          console.log('GENERATED', potGenerator.export());
        }
      },
      i18nInitDirs: {
        name: 'generate-i18n-dirs',
        description: 'Generate the translations, i18n-data dirs if they do not exist',
        run: function(commandOptions, rawArgs) {
          console.log('world!');
        }
      }
    }
  }
};
