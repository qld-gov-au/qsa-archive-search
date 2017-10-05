/*
 *  Bootstrapping Angular App
 */
import 'babel-polyfill'; // For IE support, this should not be removed
import angular from 'angular';

// Controllers
import AppCtrl from './controllers/app.controller';

// Services
import CategoryService from './services/category.service';
import ProductService from './services/product.service';

// Directives
import filterInput from './directives/filter.input.directive';
import noFocus from './directives/nofocus.directive';

// Providers
import DataTablesProvider from './providers/datatables.provider';

// Filters
import sentenceCase from './filters/sentence.case.filter';

// Stylesheets
import '../style/app.css';

let appMain = () => {
    return {
        template: require('./templates/app.main.html'),
        transclude: true,
        controller: 'AppCtrl',
        controllerAs: 'vm'
    }
};

let appAside = () => {
    return {
        template: require('./templates/app.aside.html'),
        transclude: true,
        controller: 'AppCtrl',
        controllerAs: 'vm'
    }
};

const MODULE_NAME = 'app';
const DEPENDENCIES = [ProductService, CategoryService, filterInput, noFocus, DataTablesProvider, sentenceCase];

angular.module(MODULE_NAME, DEPENDENCIES)
    .directive('qsaSearchApp', appMain)
    .directive('qsaSearchAside', appAside)
    .controller('AppCtrl', AppCtrl);

export default MODULE_NAME;
