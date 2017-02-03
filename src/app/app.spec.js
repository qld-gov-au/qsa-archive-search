import app from './app';

describe('app', () => {

    describe('AppCtrl', () => {
        let ctrl;

        beforeEach(() => {
            angular.mock.module(app);

            angular.mock.inject(($controller) => {
                ctrl = $controller('AppCtrl', {});
            });
        });

        it('should contain a datatable id', () => {
            expect(ctrl.datatableId).toBe('qsa-result-table');
        });

        it('should contain a definition of search result style and set display to none', () => {
            expect(ctrl.searchResultStyle).toBeDefined();
            expect(ctrl.searchResultStyle.display).toBeDefined();
            expect(ctrl.searchResultStyle.display).toBe('none');
        });

        // Test functions are all declared
        it('should contain a function changeCategory', () => {
            expect(ctrl.changeCategory).toBeDefined();
            expect(typeof ctrl.changeCategory).toBe('function');
        });

        it('should contain a function changeIndex', () => {
            expect(ctrl.changeIndex).toBeDefined();
            expect(typeof ctrl.changeIndex).toBe('function');
        });

        it('should contain a function getIndexIdentifier', () => {
            expect(ctrl.getIndexIdentifier).toBeDefined();
            expect(typeof ctrl.getIndexIdentifier).toBe('function');
        });

        it('should contain a function getFilters', () => {
            expect(ctrl.getFilters).toBeDefined();
            expect(typeof ctrl.getFilters).toBe('function');
        });

        it('should contain a function validateFilters', () => {
            expect(ctrl.validateFilters).toBeDefined();
            expect(typeof ctrl.validateFilters).toBe('function');
        });

        it('should contain a function displayWarning', () => {
            expect(ctrl.displayWarning).toBeDefined();
            expect(typeof ctrl.displayWarning).toBe('function');
        });

        it('should contain a function searchResults', () => {
            expect(ctrl.searchResults).toBeDefined();
            expect(typeof ctrl.searchResults).toBe('function');
        });

        it('should contain a function scrollTo', () => {
            expect(ctrl.scrollTo).toBeDefined();
            expect(typeof ctrl.scrollTo).toBe('function');
        });

        if('should contain a function clearSearch', () => {
            expect(ctrl.clearSearch).toBeDefined();
            expect(typeof ctrl.clearSearch).toBe('function');
        })
        // END Test functions are all declared

        it('function getIndexIdentifier should take 2 string parameters and return a string value', () => {
            let foo = 'foo';
            let bar = 'bar';
            let output = ctrl.getIndexIdentifier(foo, bar);

            expect(typeof output).toBe('string');
        });

        it('function getIndexIdentifier should concatenate 2 string parameters with an underscore', () => {
            let foo = 'foo';
            let bar = 'bar';
            let output = ctrl.getIndexIdentifier(foo, bar);

            expect(output).toBe('foo_bar');
        });

        it('function getFilters should take an array of strings and return an array of objects', () => {
            let foo = ['apple', 'banana', 'watermelon'];
            let output = ctrl.getFilters(foo);
            let expected = [{
                field: 'apple',
                value: ''
            }, {
                field: 'banana',
                value: ''
            }, {
                field: 'watermelon',
                value: ''
            }];

            expect(Array.isArray(output)).toEqual(true);
            expect(Object.prototype.toString.call(output[0])).toBe('[object Object]');
            expect(output).toEqual(expected);
        });

        it('function validateFilters should return false when no filter has a value', () => {
            ctrl.filters = [{
                field: 'apple',
                value: ''
            }, {
                field: 'banana',
                value: ''
            }, {
                field: 'watermelon',
                value: ''
            }];

            expect(ctrl.validateFilters()).toBe(false);
        });

        it('function validateFilters should return true when any of the filters has a value', () => {
            ctrl.filters = [{
                field: 'apple',
                value: 'foo'
            }, {
                field: 'banana',
                value: 'bar'
            }, {
                field: 'watermelon',
                value: ''
            }];

            expect(ctrl.validateFilters()).toBe(true);
        });
    });
});