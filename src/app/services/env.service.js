import angular from 'angular';

class EnvService {
    smartServiceUrlPrefix = 'http://www.smartservice.qld.gov.au';
    productFile = './products.csv';
    redirectUrl = 'https://www.qld.gov.au/dsiti/qsa/search';
    logWhenMissingData = false;
}

EnvService.$inject = [];

export default angular.module('services.env', [])
    .service('EnvService', EnvService)
    .name;
