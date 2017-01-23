class AppCtrl {
    showResult = false;
    showWarning = false;
    showFilterWarning = false;
    isSearching = false;
    selectedCategoryKey = '';
    selectedCategory = {};
    selectedIndex = {};
    warningHeader = '';
    warningMessage = '';
    searchButtonText = 'Search';
    datatableId = 'qsa-result-table';
    filters = [];
    suggestions = [];
    searchResultStyle = {
        display: 'none'
    };

    constructor(CategoryService, DataTablesProvider, $window) {
        this.CategoryService = CategoryService;
        this.DataTablesProvider = DataTablesProvider;
        this.window = $window;
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

        // Tick the selected index and pop up its filters
        if (this.selectedIndex && this.selectedIndex === this.selectedCategory.indexes[indexKey]) {
            this.filters = [];
            this.selectedIndex = {};
        } else { // Untick the clicked index and hide its filters
            this.selectedIndex = this.selectedCategory.indexes[indexKey];
            this.filters = this.getFilters(this.selectedIndex.searchable);
        }
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
                    this.showResult = true;
                    let columns = this.DataTablesProvider.setColumns(this.selectedIndex.primary);

                    let renderSuccess = this.DataTablesProvider.renderTable(this.selectedIndex.primary, columns, data.records,
                        (drawCount) => {
                            this.isSearching = false;
                            this.searchResultStyle.display = 'block';
                            this.searchButtonText = 'Refine';
                            drawCount > 1 ? this.scrollToTop(400) : this.scrollToTop();
                        });

                    if (!renderSuccess) {
                        this.displayWarning('Cannot Display Results', 'Please contact QSA');
                    }
                } else {
                    this.displayWarning('Please Try Later', 'This index is currently not available');
                }

                if (data.success && data.success === 'PART') {
                    this.displayWarning('Partial Results', 'Part of the data is not available');
                }
            });
        }, (err) => {
            this.displayWarning('Please Try Later', 'This index is currently not available');

            console.log(`Failed to get index fields from ${this.selectedIndex.indexName}`);
            console.log(err);
        });
    }

    scrollToTop(positionY) {
        if (positionY === undefined) positionY = 285;

        this.window.scrollTo(0, positionY);
    }

    reset() {
        this.selectedCategoryKey = '';
        this.selectedIndex = {};
        this.filters = [];
        this.showResult = false;
        this.showFilterWarning = false;
        this.searchResultStyle.display = 'none';
        this.searchButtonText = 'Search';
        this.DataTablesProvider.destroy();
        this.scrollToTop();
    }
}

AppCtrl.$inject = ['CategoryService', 'DataTablesProvider', '$window'];

export default AppCtrl;