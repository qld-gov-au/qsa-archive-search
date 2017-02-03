import CategoryService from './category.service';

const serviceName = 'CategoryService';

describe('CategoryService', () => {
    let categoryService;
    let httpBackend;

    beforeEach(() => {
        angular.mock.module(CategoryService);

        angular.mock.inject((_CategoryService_, $httpBackend) => {
            categoryService = _CategoryService_;
            httpBackend = $httpBackend;
        });
    });

    it('should contain a function called getCategories', () => {
        expect(categoryService.getCategories).toBeDefined();
        expect(typeof categoryService.getCategories).toBe('function');
    });

    it('should contain a function called mapFieldKeys', () => {
        expect(categoryService.mapFieldKeys).toBeDefined();
        expect(typeof categoryService.mapFieldKeys).toBe('function');
    });

    it('should contain a function called formatQuery', () => {
        expect(categoryService.formatQuery).toBeDefined();
        expect(typeof categoryService.formatQuery).toBe('function');
    });

    it('should contain a function called formatQueries', () => {
        expect(categoryService.formatQueries).toBeDefined();
        expect(typeof categoryService.formatQueries).toBe('function');
    });

    it('should contain a function called formatAutocompleteQuery', () => {
        expect(categoryService.formatAutocompleteQuery).toBeDefined();
        expect(typeof categoryService.formatAutocompleteQuery).toBe('function');
    });

    it('should contain a function called formatAutocompleteQueries', () => {
        expect(categoryService.formatAutocompleteQueries).toBeDefined();
        expect(typeof categoryService.formatAutocompleteQueries).toBe('function');
    });

    it('should contain a function called getResourceFields', () => {
        expect(categoryService.getResourceFields).toBeDefined();
        expect(typeof categoryService.getResourceFields).toBe('function');
    });

    it('should contain a function called getSearchResults', () => {
        expect(categoryService.getSearchResults).toBeDefined();
        expect(typeof categoryService.getSearchResults).toBe('function');
    });

    describe('CategoryService.getCategories', () => {
        it('should throw an exception if no callback is passed', () => {
            expect(categoryService.getCategories).toThrow();
        });

        it('should throw an exception if callback is not a function', () => {
            const foo = () => {
                categoryService.getCategories('hello');
            }
            const bar = () => {
                categoryService.getCategories(53);
            }
            const baz = () => {
                categoryService.getCategories({
                    test: 'test'
                });

            }

            expect(foo).toThrow('callback is not a function.');
            expect(bar).toThrow('callback is not a function.');
            expect(baz).toThrow('callback is not a function.');
        });

        it('should not throw an exception if callback is function', () => {
            const foo = () => {
                categoryService.getCategories(() => {
                    return true;
                });
            }

            expect(foo).not.toThrow();
        });

        it('should return categories if defined', () => {
            categoryService.categories = {
                test: 'test'
            };

            categoryService.getCategories((categories) => {
                expect(categories).toEqual({
                    test: 'test'
                });
            });
        });

        it('should make API call to fetch categories.json when categries undefined', () => {
            httpBackend.when('GET', './categories.json').respond({
                foo: 'bar'
            });

            httpBackend.expectGET('./categories.json');

            categoryService.getCategories((categories) => {});

            httpBackend.flush();
        });

        it('should fetch categories.json when categries undefined', () => {
            httpBackend.when('GET', './categories.json').respond({
                foo: 'bar'
            });

            categoryService.getCategories((categories) => {
                expect(categories).toEqual({
                    foo: 'bar'
                });
            });

            httpBackend.flush();
        });
    });

    describe('CategoryService.mapFieldKeys', () => {
        it('should return filter names with actual field names', () => {
            const filters = [{
                field: 'FOO',
                value: ''
            }, {
                field: 'BAR',
                value: ''
            }, {
                field: 'BAZ',
                value: ''
            }];

            const fields = ['Foo', 'Hay', 'Boo', 'Bar', 'Lay', 'Baz'];
            const expected = {
                FOO: 'Foo',
                BAR: 'Bar',
                BAZ: 'Baz'
            };

            const output = categoryService.mapFieldKeys(filters, fields);

            expect(output).toEqual(expected);
        });
    });

    describe('CategoryService.formatQuery', () => {
        const filters = [{
            field: 'FOO',
            value: ''
        }, {
            field: 'BAR',
            value: ''
        }, {
            field: 'BAZ',
            value: ''
        }];

        const fields = ['Foo', 'Hay', 'Boo', 'Bar', 'Lay', 'Baz'];

        const resourceId = '306fcd00-26ea-44fa-914f-1476732f6b98';

        it('should return an empty string if resourceId is not valid', () => {
            expect(categoryService.formatQuery('', fields, filters)).toEqual('');
            expect(categoryService.formatQuery(undefined, fields, filters)).toEqual('');
        });

        it('should return a default query if fields is an empty string', () => {
            const defaultQuery = `SELECT * FROM "${resourceId}"`;
            const noFields = '';

            expect(categoryService.formatQuery(resourceId, noFields, filters)).toContain(defaultQuery);
        })
    });
});