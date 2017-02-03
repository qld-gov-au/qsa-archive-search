import angular from 'angular';

import CategoryService from '../services/category.service';
import sentenceCase from '../filters/sentence.case.filter';

/*
 * A text input that binds with API call to fetch suggestions automatically
 * when having 3 characters or more
 */
let qsaFilterInput = (CategoryService) => {

    let setAutocomplete = (elem, suggestions) => {
        angular.element(elem.children()[1]).autocomplete({
            source: suggestions,
            minLength: 3
        });
    }

    return {
        restrict: 'E',
        require: '?ngModel',
        template: require('../templates/filter.input.html'),
        scope: {
            qsaTargetField: '=',
            qsaFilters: '=',
            qsaSource: '=',
            qsaIndex: '=',
            ngModel: '='
        },
        link: (scope, elem, attrs, ngModel) => {
            setAutocomplete(elem, []);
            scope.$watch(() => {
                return ngModel.$modelValue;
            }, (newValue) => {
                if (!newValue || newValue.length < 3) return;

                const resourceId = scope.qsaIndex.resources[0].resourceId;

                let filters = angular.copy(scope.qsaFilters);

                CategoryService.getResourceFields(resourceId, (fields) => {

                    let map = CategoryService.mapFieldKeys(scope.qsaFilters, fields);

                    const targetField = map[scope.qsaTargetField];

                    for (let filter of filters) {
                        filter.field = map[filter.field];
                    }

                    const queries = CategoryService.formatAutocompleteQueries(scope.qsaIndex.resources, filters, targetField);

                    CategoryService.getSearchResults(queries, (data) => {
                        let suggestions = data.records.map((record) => {
                            return record[targetField];
                        });

                        setAutocomplete(elem, suggestions);
                    });
                }, (err) => {
                    console.error('Autocomplete is not available');
                    console.log(err);
                });
            });

            scope.$watch(() => {
                return elem.children()[1].value;
            }, (newValue) => {
                ngModel.$setViewValue(newValue);
            });
        }
    }
}

qsaFilterInput.$inject = ['CategoryService'];

export default angular.module('directives.qsaFilterInput', [CategoryService, sentenceCase])
    .directive('qsaFilterInput', qsaFilterInput)
    .name;