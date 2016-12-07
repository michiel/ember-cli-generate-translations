/* jshint node: true */
'use strict';

const fs      = require('fs');
const process = require('process');
const glob    = require('glob');
const mkdirp  = require('mkdirp');
const YAML    = require('yamljs');

const POTGenerator  = require('./lib/pot-generator');
const YAMLGenerator = require('./lib/yaml-generator');

const pofileLocaleRegExp = /\/(\w*-\w*)\.po/;

const i18nDirs = [
  'i18n-data',
  'i18n-data/po',
  'i18n-data/pot'
  ];


const getConfig = ()=> {
  const cwd = process.cwd();
  const config = require(`${cwd}/config/ember-intl`)();
  return {
    baseLocale : config['baseLocale'],
    locales    : config['locales'],
    targetDir  : config['inputPath']
  };
}

const getI18nDirs = ()=> {
  return i18nDirs.concat(getConfig().targetDir);
}

const dirsExist = ()=> {
  return getI18nDirs().every(fs.existsSync);
}

const collectErrors = ()=> {
  let errors = [];
  if (!dirsExist()) {
    errors.push('Missing directories, please run ember generate-i18n-dirs');
  }
  return errors;
}

const reportErrors = (errors)=> {
  console.error('Errors found :');
  errors.forEach((error)=> {
    console.error(` - ${error}`);
  });
}

const allOK = ()=> {
  const errors = collectErrors();
  if (errors.length !== 0) {
    reportErrors(errors);
    return false;
  } else {
    return true;
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
          console.log('Generating translations/ yaml files from i19n-data/po/ po files');
          if (!allOK()) {
            return;
          }
          const files = glob.sync("i18n-data/po/*.po");
          const config = getConfig();
          files.forEach(
            (fileName)=> {
              const locale = fileName.match(pofileLocaleRegExp)[1];

              console.log(` - Generating translation from ${fileName} for ${locale}`);

              const pofile = fs.readFileSync(fileName, 'utf-8');

              const yamlGenerator = new YAMLGenerator(pofile);
              yamlGenerator.run();

              const outPath = `${config.targetDir}/${locale}.yaml`;

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
          if (!allOK()) {
            return;
          }
          const config = getConfig();
          const yamlData = YAML.load(`${config.targetDir}/${config.baseLocale}.yaml`);
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
          getConfig();

          getI18nDirs().forEach((dir)=> {
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
