const YAML = require('yamljs');

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

module.exports = POTGenerator;

