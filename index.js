/* jshint node: true */
'use strict';

const fs     = require('fs');
const glob   = require('glob');
const mkdirp = require('mkdirp');
const YAML   = require('yamljs');

const POTGenerator  = require('./lib/pot-generator');
const YAMLGenerator = require('./lib/yaml-generator');

const pofileLocaleRegExp = /\/(\w*-\w*)\.po/;

const i18nDirs = [
  'translations',
  'i18n-data',
  'i18n-data/po',
  'i18n-data/pot'
  ];

module.exports = {
  name: 'ember-cli-generate-translations',
  includedCommands: function() {
    return {
      i18nYAMLCommand: {
        name: 'generate-i18n-yaml',
        description: 'Generate the translations/ YAML files from PO translations',
        run: function(commandOptions, rawArgs) {
          console.log('Generating translations/ yaml files from i19n-data/po/ po files');
          const files = glob.sync("i18n-data/po/*.po");
          files.forEach(
            (fileName)=> {
              const locale = fileName.match(pofileLocaleRegExp)[1];

              console.log(` - Generating translation from ${fileName} for ${locale}`);

              const pofile = fs.readFileSync(fileName, 'utf-8');

              const yamlGenerator = new YAMLGenerator(pofile);
              yamlGenerator.run();

              const outPath = `translations/${locale}.yaml`;

              console.log(` - Writing ${locale} to ${outPath}`);
              fs.writeFileSync(
                outPath,
                yamlGenerator.export(),
                'utf8');
            }
          );
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

          const outPath = `i18n-data/pot/app.pot`;

          console.log(` - Writing POT file to to ${outPath}`);
          fs.writeFileSync(
            outPath,
            potGenerator.export(),
            'utf8');
        }
      },
      i18nInitDirs: {
        name: 'generate-i18n-dirs',
        description: 'Generate the translations, i18n-data dirs if they do not exist',
        run: function(commandOptions, rawArgs) {
          console.log('Generating i18n-data dirs');
          i18nDirs.forEach((dir)=> {
            if (fs.existsSync(dir)) {
              console.log(` - ${dir} exists`);
            } else {
              console.log(` - creating ${dir}`);
              mkdirp.sync(dir);
            }
          });
        }
      }
    }
  }
};
