# Clean up your package.json
Reduce install times on production, clean up package json

- Removes duplicate dependencies from code
- Removes wildcard from version numbers, locks versions
- Sorts the dependencies in alphabetical order
- Suggests moving packages to devDependencies
- Prettifies your package.json

![Reduce install times on production, clean up package json](http://vijaysutrave.com/clean-package-json-full.png)

### Install

`npm install -g clean-package-json`


### Options

`--lock`  Remove the `^` wildcard from version 

`--yarn`  Use yarn instead of npm to install dependencies


### Todo
- Show unused packages
- Tests


### License
MIT © [vijaysutrave](https://github.com/vijaysutrave)
