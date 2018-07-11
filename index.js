#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const doT = require('dot');
const minimist = require('minimist');
const camelCase = require('camelcase');
const capitalize = require('capitalize');
const reserved = require('reserved-words');

const templatesDir = path.join(__dirname, 'templates');
const config = getConfigFromArgs(process.argv.slice(2));

if (!validateConfig(config)) {
  displayHelp();
  return;
}

formatConfig(config);

for (let temp of config.templates) {
  loadTemplate(config, temp.name)
  .then(template => {
    const source = interpolateTemplate(config, template);
    const fileName = config.name + '.' + temp.name.split('.')[1];
    const path = temp.path;
    return saveSource(path, fileName, source);
  })
  .then(outputFileName => {
    console.log('Created file: ' + outputFileName);
  })
  .catch(error => {
    console.log(error);
  });
}

function getConfigFromArgs(argv) {

  const parsedArgs = minimist(argv, {
    boolean: 'presentation',
    alias: {h: 'help', presentation: 'p'}
  });

  return {
    name: parsedArgs._[0]
  }
}

function validateConfig(config) {
  if (!config.name) {
    console.log('No component name provided!');
    return false;
  }
  if (reserved.check(config.name, 'es2015')) {
    console.log('You have entered a reserved ES6 keyword as a component name!');
    return false;
  }

  return true;
}

function formatConfig(config) {
  const path = config.name.substring(0, config.name.lastIndexOf('/'));
  const name= config.name.substring(config.name.lastIndexOf('/') + 1, config.name.length);
  config.name = capitalize(camelCase(name));
  config.id = camelCase(config.name);
  config.path = path;
  config.templates = [
    {name: 'dva.js', path: `models/${path}/`},
    {name: 'routes.js', path: `routes/${path}/${name}/`},
    {name: 'routes.less', path: `routes/${path}/${name}/`},
    {name: 'services.js', path: `services/${path}/`},
  ];
}

function loadTemplate(config, templatename) {
  return new Promise((resolve, reject) => {
    const templateFileName = getTemplateFileName(templatename);
    fs.readFile(path.join(templatesDir, templateFileName), 'utf8', function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}

function getTemplateFileName(templatename) {
  return templatename;
}

function interpolateTemplate(config, templateSource) {
  doT.templateSettings.strip = false;
  const template = doT.template(templateSource);
  return template(config);
}

function saveSource(path, fileName, source) {
  if (fs.existsSync(path + fileName)) {
    return false;
  }

  mkdirp(path, fileName);

  return new Promise((resolve, reject) => {
    fs.writeFile(path + fileName, source, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(path + fileName);
      }
    })
  });
}

function mkdirp(filepath, fileName) {

    const dirname = path.dirname(filepath);
    if (!fs.existsSync(dirname)) {
        mkdirp(dirname);
    }

    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
    }
}

function displayHelp() {
  console.log('Usage: generate-dva [name]');
}
