class AppCtrl {
    categories = {};
    showWarning = false;
    showFilterWarning = false;
    showClearResearchButton = false;
    showPartialResultWarning = false;
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

    constructor(CategoryService, DataTablesProvider, $timeout) {
        this.CategoryService = CategoryService;
        this.DataTablesProvider = DataTablesProvider;

        this.CategoryService.getCategories((categories) => {
            this.categories = categories;
        });

        this.DataTablesProvider.setTableId(this.datatableId);

        /* The SWE framework set the height of .article to 630px.
         * This waits for half second to set the height back to auto.
         * Otherwise, the index list can't be seen.
         */
        $timeout(() => {
            angular.element('.article')[0].style.height = 'auto';
        }, 500);
    }

    changeCategory() {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedCategory = this.categories[this.selectedCategoryKey];
        this.filters = [];
        this.selectedIndex = {};
        this.selectedIndexKey = '';
    }

    changeIndex(indexKey) {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedIndex = this.selectedCategory.indexes[indexKey];
        this.filters = this.getFilters(this.selectedIndex.searchable);
        this.scrollTo('search-by');
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
        this.scrollTo('app-header');
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

                    let renderSuccess = this.DataTablesProvider.renderTable(this.selectedIndex, columns, data.records,
                        () => {
                            this.isSearching = false;
                            this.showClearResearchButton = true;
                            this.resultCategoryName = this.selectedCategory.categoryName;
                            this.resultIndexName = this.selectedIndex.indexName;
                            this.scrollTo('result-block');
                        });

                    if (!renderSuccess) {
                        this.searchResultStyle.display = 'none';
                        this.displayWarning('Cannot Display Results', 'Please contact QSA');
                    }
                } else {
                    this.searchResultStyle.display = 'none';
                    this.displayWarning('There seems to be a problem', 'The index search is not currently available.');
                    this.scrollTo('top-warning-msg');
                }

                if (data.success && data.success === 'PART') {
                    this.showPartialResultWarning = true;
                    this.isSearching = false;
                }
            });
        }, (err) => {
            this.searchResultStyle.display = 'none';
            this.displayWarning('There seems to be a problem', `The index search is not currently available.`);
            this.scrollTo('top-warning-msg');

            console.error(`Failed to get index fields from ${this.selectedIndex.indexName}`);
            console.log(err);
        });
    }

    scrollTo(elementId) {
        angular.element('body').scrollTo(`#${elementId}`);
    }

    clearSearch() {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.showClearResearchButton = false;
        this.isSearching = false;
        this.selectedCategoryKey = '';
        this.selectedCategory = {};
        this.selectedIndexKey = '';
        this.selectedIndex = {};
        this.resultCategoryName = '';
        this.resultIndexName = '';
        this.filters = [];
        this.suggestions = [];
        this.searchResultStyle.display = 'none';
        this.scrollTo('index-categories');
    }
}

AppCtrl.$inject = ['CategoryService', 'DataTablesProvider', '$timeout'];

export default AppCtrl;