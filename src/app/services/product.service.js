import angular from 'angular';

/*
 * A service that handles datastore API request
 */
class ProductService {

    products = undefined;

    constructor($http, $q) {
        this.http = $http;
        this.q = $q;
    }

    getProducts(callback) {
        if (!callback)
            throw 'A callback is required but not passed.';

        if (!angular.isFunction(callback))
            throw 'callback is not a function.';

        if (this.products) {
            callback(this.products);
            return;
        }

        this.http.get('./products.csv').then((res) => {

            // debugger;
            const data = res.data;
            const allTextLines = data.split(/\r\n|\n/);
            const headers = allTextLines[0].split(',');
            let lines = {fields: [], records: []};

            for (let i = 0; i < allTextLines.length; i++) {
                let data = allTextLines[i].split(',');
                if (data.length === headers.length) {
                    let o = {};
                    if (i === 0) {
                        for (let j = 0; j < headers.length; j++) {
                            lines.fields.push({type: 'unknown', id: data[j]});
                        }
                    } else {
                        for (let j = 0; j < headers.length; j++) {
                            o[lines.fields[j].id] = data[j];
                        }
                        lines.records.push(o);
                    }
                }
            }
            this.products = lines;
            callback(this.products);
        }, (err) => {
            console.error('Cannot load products.csv');
            console.log(err);
        });
    }
}

ProductService.$inject = ['$http', '$q'];

export default angular.module('services.product', [])
    .service('ProductService', ProductService)
    .name;
