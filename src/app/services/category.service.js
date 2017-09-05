import angular from 'angular';

const SQL_URL = 'https://data.qld.gov.au/api/action/datastore_search_sql?sql=';

/*
 * A service that handles datastore API request
 */
class CategoryService {
    categories = undefined;

    constructor($http, $q, $sce) {
        this.http = $http;
        this.q = $q;
        this.sce = $sce;
    }

    getCategories(callback) {
        if (!callback)
            throw 'A callback is required but not passed.';

        if (!angular.isFunction(callback))
            throw 'callback is not a function.';

        if (this.categories) {
            callback(this.categories);
            return;
        }

        this.http.get('./categories.json').then((res) => {
            callback(res.data);
        }, (err) => {
            console.error('Cannot load categories.json');
            console.log(err);
        });
    }

    // Map capatalised field names with actual field names
    mapFieldKeys(filters, fields) {
        return filters.reduce((map, filter) => {
            for (let field of fields) {
                if (filter.field.toUpperCase() === field.toUpperCase()) {
                    return {...map,
                        [filter.field]: field
                    }
                }
            }

            return map;
        }, {});
    }

    formatQuery(resourceId, fields, filters) {
        if (!resourceId || resourceId === '') {
            console.log('resourceId is missing');
            return '';
        }

        let tempQuery = '';

        if (fields && angular.isArray(fields)) {
            tempQuery = fields.reduce((query, field) => {
                if (query === 'SELECT')
                    return `${query} "${field}" AS "${field.toUpperCase()}"`;
                else
                    return `${query}, "${field}" AS "${field.toUpperCase()}"`;
            }, `SELECT '${resourceId}' AS "RESOURCE ID"`);

            tempQuery += ` FROM "${resourceId}"`;
        } else {
            tempQuery = `SELECT * FROM "${resourceId}"`;
        }

        let fieldMap = this.mapFieldKeys(filters, fields);

        let query = filters.reduce((query, filter) => {
            if (filter.value && fieldMap[filter.field]) {
                if (query === tempQuery)
                    query += `WHERE LOWER("${fieldMap[filter.field]}") LIKE LOWER('%25${encodeURIComponent(filter.value)}%25') `;
                else
                    query += `AND LOWER("${fieldMap[filter.field]}") LIKE LOWER('%25${encodeURIComponent(filter.value)}%25') `;
            }

            return query;
        }, tempQuery);

        return tempQuery === query ? tempQuery : query;
    }

    formatQueries(resources, fields, filters) {
        let queries = resources.reduce((queries, resource) => {
            let query = this.formatQuery(resource.resourceId, fields, filters);

            return [...queries, query];
        }, []);

        return queries;
    }

    formatAutocompleteQuery(resourceId, filters, targetField) {
        let tempQuery = `SELECT DISTINCT "${targetField}" FROM "${resourceId}" WHERE `;

        let query = filters.reduce((query, filter) => {
            if (filter.value) {
                if (tempQuery === query)
                    query += `LOWER("${filter.field}") LIKE LOWER('%25${encodeURIComponent(filter.value)}%25') `;
                else
                    query += `AND LOWER("${filter.field}") LIKE LOWER('%25${encodeURIComponent(filter.value)}%25') `;
            }
            return query;
        }, tempQuery);

        let finalQuery = tempQuery === query ? `SELECT DISTINCT "${targetField}" FROM "${resourceId}" ` : query;

        finalQuery += `ORDER BY "${targetField}" ASC`;

        return finalQuery;
    }

    formatAutocompleteQueries(resources, filters, targetField) {
        let queries = resources.reduce((queries, resource) => {
            let query = this.formatAutocompleteQuery(resource.resourceId, filters, targetField);

            return [...queries, query];
        }, []);

        return queries;
    }

    // Get 1 row in the resource to use the fields array
    getResourceFields(resourceId, successCallback, errorCallback) {
        let query = `SELECT * FROM "${resourceId}" LIMIT 1`;
        var url = this.sce.trustAsResourceUrl(`${SQL_URL}${query}`);
        this.http.jsonp(url)
            .then((res) => {
                let fields = [];

                if (res.data && res.data.success) {
                    fields = res.data.result.fields.map((field) => {
                        return field.id;
                    });
                }

                if (fields.length > 1) {
                    fields = fields.sort();
                }

                if (successCallback) successCallback(fields);
                else throw 'successCallback is required but not passed'
            }, (err) => {
                if (errorCallback) errorCallback(err);
                else console.log(err);
            });
    }

    getSearchResults(queries, callback) {
        let response = {};
        let successResults = [];
        let failedResults = [];

        if (!callback)
            throw 'A callback is required by not passed';

        if (!angular.isFunction(callback))
            throw 'callback is not a function';

        if (!queries) {
            response.success = 'NONE';
            callback(response);
        }

        // Separate successful and failed results
        let pushResult = (result) => {
            result.data.success ? successResults.push(result) : failedResults.push(result);
        }

        // Make an API call for each resource
        let requests = queries.map((query) => {
            return this.http.get(`${SQL_URL}${query}`).then(pushResult).catch(pushResult);
        });

        // Handle all promises altogether
        this.q.all(requests).then(() => {
            if (successResults.length === 0) {
                response.success = 'NONE';
            }

            if (successResults.length > 0 && failedResults.length > 0) {
                response.success = 'PART';
            }

            if (successResults.length > 0 && failedResults.length === 0) {
                response.success = 'ALL';
            }

            if (successResults.length > 0) {
                // Combine all search results together
                response.records = successResults.reduce((records, result) => {
                    return [...records, ...result.data.result.records];
                }, []);
            }

            callback(response);
        });
    }
}

CategoryService.$inject = ['$http', '$q', '$sce'];

export default angular.module('services.category', [])
    .service('CategoryService', CategoryService)
    .name;