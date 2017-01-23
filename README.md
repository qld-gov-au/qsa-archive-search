# QSA Archive Search

A single page application that helps search data in Queensland archive CSV files

* This app is developed using AngularJS 1.6 & ES6 syntax
* A local server is required to run this project properly
* Warning: Make sure you're using the latest version of Node.js and NPM

## Dependencies

What you need to run this app:

* `node` and `npm`
* A local server that supports Server-Side Includes 
* The app uses jQuery plugin DataTables
* jQuery and DataTables must be included prior to the bundle js file

## Getting started

```bash
# clone the repo
$ git clone https://github.com/qld-gov-au/qsa-archive-search.git

# change directory to the app
$ cd qsa-archive-search

# install the dependencies with npm
$ npm install

# run development build
$ npm run build

# run production build
$ npm run prod
```
go to index page in your browser, e.g. http://localhost/qsa-archive-search/dist/

## Directory Structure

### src

Contains all source code for this project

### app

All JavaScript code and templates

### pubic

`index.html` and images

### style

CSS stylesheet for this project only

## Developing

### Build files

To build this project for production

```bash
# build bundle file
$ npm run prod
```
## Testing

* To be updated