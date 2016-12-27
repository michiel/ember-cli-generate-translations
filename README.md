# ember-cli-generate-translations

[![Ember Observer Score](https://emberobserver.com/badges/ember-cli-generate-translations.svg)](https://emberobserver.com/addons/ember-cli-generate-translations)
[![Travis CI Score](https://travis-ci.org/michiel/ember-cli-generate-translations.svg?branch=master)](https://travis-ci.org/michiel/ember-cli-generate-translations)

This ember-addon generates a POT file for translation from the master YAML file
and imports the translated PO files into YAML language files.

It currently works with ember-intl and expects there to be a configuration for that at _config/ember-intl.js_

## Tasks

It adds three tasks

### _generate-i18n-dirs_

    ember generate-i18n-dirs

This task generates the _i18n-data/_ directory and its _po_ and _pot_ subdirectories.

### _generate-i18n-pot_

    ember generate-i18n-pot

This task takes the master YAML file and converts it to a POT file in _i18n-data/pot/app.pot_.

### _generate-i18n-yaml_

    ember generate-i18n-dirs

This task takes the PO files in _i18n-data/po/_ and converts each of the into the corresponding YAML file. So _i18n-data/po/nl-nl.po_ is transformed to _translations/nl-nl.yaml_.

### Filesystem layout

In the translations directory, here en-us.yaml is the master file and is specified in _config/ember-intl.js_ as _baseLocale : 'en-us'_.

    translations/
    ├── en-us.yaml
    ├── nl-nl.yaml
    ├── en-gb.yaml
    └── es-es.yaml


    i18n-data/
    ├── po
    │   ├── nl-nl.po
    │   ├── en-gb.po
    │   └── es-es.po
    └── pot
        └── app.pot

## Installation

    ember install ember-cli-generate-translations
