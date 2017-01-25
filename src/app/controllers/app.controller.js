class AppCtrl {
    showWarning = false;
    showFilterWarning = false;
    isSearching = false;
    selectedCategoryKey = '';
    selectedCategory = {};
    selectedIndexKey = '';
    selectedIndex = {};
    resultCategoryName = '';
    resultIndexName = '';
    warningHeader = '';
    warningMessage = '';
    datatableId = 'qsa-result-table';
    filters = [];
    suggestions = [];
    searchResultStyle = {
        display: 'none'
    };

    constructor(CategoryService, DataTablesProvider) {
        this.CategoryService = CategoryService;
        this.DataTablesProvider = DataTablesProvider;
        this.categories = CategoryService.getCategories();

        this.DataTablesProvider.setTableId(this.datatableId);
    }

    changeCategory() {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedCategory = this.categories[this.selectedCategoryKey];
        this.filters = [];
        this.selectedIndex = {};
    }

    changeIndex(indexKey) {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedIndex = this.selectedCategory.indexes[indexKey];
        this.filters = this.getFilters(this.selectedIndex.searchable);
    }

    getIndexIdentifier(categoryKey, indexKey) {
        return `${categoryKey}_${indexKey}`;
    }

    // Create filter objects based on definition in categories.js
    getFilters(searchable) {
        return searchable.map((searchableField) => {
            return {
                field: searchableField,
                value: ''
            }
        });
    }

    validateFilters() {
        for (let filter of this.filters) {
            if (filter.value && filter.value !== '') {
                return true;
            }
        }

        return false;
    }

    displayWarning(header, message) {
        this.warningHeader = header;
        this.warningMessage = message;
        this.showWarning = true;
        this.isSearching = false;
    }

    searchResults() {
        this.isSearching = true;
        this.showWarning = false;
        this.searchResultStyle.display = 'block';

        if (!this.validateFilters()) {
            this.showFilterWarning = true;
            this.isSearching = false;
            return;
        } else {
            this.showFilterWarning = false;
        }

        const resourceId = this.selectedIndex.resources[0].resourceId;

        this.CategoryService.getResourceFields(resourceId, (fields) => {
            const queries = this.CategoryService.formatQueries(this.selectedIndex.resources, fields, this.filters);

            this.CategoryService.getSearchResults(queries, (data) => {
                if (data.success && data.success !== 'NONE') {
                    this.DataTablesProvider.destroy();

                    let columns = this.DataTablesProvider.setColumns(this.selectedIndex.primary);

                    let renderSuccess = this.DataTablesProvider.renderTable(this.selectedIndex.primary, resourceId, columns, data.records,
                        () => {
                            this.isSearching = false;
                            this.resultCategoryName = this.selectedCategory.categoryName;
                            this.resultIndexName = this.selectedIndex.indexName;
                            this.scrollToResult();
                        });

                    if (!renderSuccess) {
                        this.searchResultStyle.display = 'none';
                        this.displayWarning('Cannot Display Results', 'Please contact QSA');
                    }
                } else {
                    this.searchResultStyle.display = 'none';
                    this.displayWarning('Please Try Later', 'This index is currently not available');
                }

                if (data.success && data.success === 'PART') {
                    this.displayWarning('Partial Results', 'Part of the data is not available');
                }
            });
        }, (err) => {
            this.searchResultStyle.display = 'none';
            this.displayWarning('Please Try Later', 'This index is currently not available');

            console.log(`Failed to get index fields from ${this.selectedIndex.indexName}`);
            console.log(err);
        });
    }

    scrollToResult() {
        angular.element('body').scrollTo('#result-block');
    }
}

AppCtrl.$inject = ['CategoryService', 'DataTablesProvider'];

export default AppCtrl;