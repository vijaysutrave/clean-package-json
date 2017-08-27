#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const program = require('commander');
const constants = require('./constants');
const colors = require("colors")
const emoji = require('node-emoji');
const Table = require('cli-table2');
const depcheck = require('depcheck');
const shelljs = require('shelljs');
const rootPath = path.resolve();

let packageJSON;
const table = new Table({head:['Package','Base Size (in kb)', 'Direct Children']});
const universalVersioning = []
let numbering = 0;

try {
  packageJSON = require(rootPath + '/package.json')
} catch (e) {
  console.log(colors.red('Error finding package JSON in your project folder, make sure it is in the root and it is valid'))
  process.exit()
}

program
.usage('clean-package-json [options]')
.option('-lock, --lock [num]', 'Lock versions for production')
.option('-yarn, --yarn [num]', 'Use Yarn for installation')
.on('--help', () => {
  console.log(colors.green(`Run in your project root folder containing package.json`));
})
.parse(process.argv);

/**
 * prettity the package JSON with 2 space format
 */
const prettify = () => {
  packageJSON = JSON.stringify(packageJSON, null, 2)
  console.log(colors.green(emoji.get('thumbsup') + '  Removed duplicate dependencies'))
  console.log(colors.green(emoji.get('thumbsup') + '  Prettify package.json'))
}

/**
 * When the lock argument is passed, removes wildcards from version numbers
 */
const lockVersions = () => {
  for(var pkg in packageJSON.dependencies) {
    if(packageJSON.dependencies[pkg].match(/\*/)){
      universalVersioning.push(pkg)
      numbering++;
    };
    packageJSON.dependencies[pkg] = packageJSON.dependencies[pkg].replace('^', '')
  }
  console.log(colors.green(emoji.get('thumbsup') + '  Locked versions of packages'))
}


/**
 * Sorts the package JSON alphabetically
 */
const sortAlphabetically = () => {
  packageJSON.dependencies = Object.keys(packageJSON.dependencies).sort((a, b) => {
    return a < b ? -1 : 1
  }).reduce((dependencies, value) => {
     dependencies[value] = packageJSON.dependencies[value]
     return dependencies
  }, {})
  console.log(colors.green(emoji.get('thumbsup') + '  Sorted dependencies alphabetically'))
}

/**
 * Writes to the FS
 */
const updateFile = () => {
   fs.writeFileSync(rootPath + '/package.json', packageJSON);
   console.log(colors.green(emoji.get('thumbsup') + '  Updated Package JSON file'))
}

/**
 * Recursively returns the size of the folder
 */
const getDirSize = (dir) => {
  let total = 0;
  try {
    stat = fs.lstatSync(dir)
    if (stat.isFile()) {
      total += stat.size
    } else if (stat.isDirectory()) {
      files = fs.readdirSync(dir)
      files.forEach((file) => {
        if(file)
        total += getDirSize(path.join(dir, file))
      })
    }
  } catch(e) {
    console.log(e)
  }
  return total;
}

/**
 * Prints to the console
 */
const printTips = () => {
  if(numbering) {
    console.log()
    console.log(colors.green('Tips to improve install times:'))
    console.log('******************************************')
    console.log()
    if(universalVersioning.length) {
      console.log(colors.green('The following packages have not recommended \'*\' wildcard in their version'));
      console.log();
      universalVersioning.forEach((pkg, idx) => {
        console.log(idx+1 + '. '+ pkg);
      })
    }
    console.log();
    console.log(colors.green('The following packages in dependencies can be moved to devDependencies:'))
    console.log();
    if(table.length) {
      console.log(table.toString())
    }
  } else {
    console.log();
    console.log();
    console.log(emoji.get('100') + '  Your package JSON looks good');
  }
}

/**
 * Get a list of packages that could be moved to most
 * commonly downloaded devDependencies
 */
const checkDependencies = () => {
  try {
    for(var pkg in packageJSON.dependencies) {
      constants.devDependencies.forEach((devDep, i) => {
        if(pkg.match(devDep)) {
          numbering++;
          const packageRoot = rootPath+'/node_modules/'+pkg;
          const childRen = require(packageRoot+'/package.json').dependencies
          const size = parseInt(getDirSize(packageRoot)/1024, 10)
          table.push([pkg, size, Object.keys(childRen).length]);
        }
      })
    }
  } catch (e) {
    console.log('Errored while fetching devDependencies');
  }
}

const cleanUp = (options) => {
  console.log();
  console.log('Installing dependencies first..');
  shelljs.exec(options.yarn ? 'yarn install' : 'npm install')
  console.log();
  console.log();
  options.lock && lockVersions()
  sortAlphabetically()
  checkDependencies()
  prettify()
  updateFile()
  printTips()
  console.log();
}


cleanUp({
  lock: program.lock,
  yarn: program.yarn
})
