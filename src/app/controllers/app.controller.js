if ( ! RegExp.quote) {
    RegExp.quote = function(str) {
        return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
    };
}

class AppCtrl {
    categories = {};
    products = {};
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
    productId = '';
    quantity = '1';
    price = '';
    productFound = false;
    warningHeader = '';
    warningMessage = '';
    datatableId = 'qsa-result-table';
    filtersPrevious = [];
    filters = [];
    suggestions = [];
    searchResultStyle = {
        display: 'none'
    };

    constructor(EnvService, ProductService, CategoryService, DataTablesProvider, $timeout) {
        this.EnvService = EnvService;
        this.ProductService = ProductService;
        this.CategoryService = CategoryService;
        this.DataTablesProvider = DataTablesProvider;

        this.ProductService.getProducts((products) => {
            this.products = products;
        });

        this.CategoryService.getCategories((categories) => {
            Object.keys(categories).forEach((categoryKey) => {
                Object.keys(categories[categoryKey].indexes).forEach((indexKey) => {
                    const resourceId = categories[categoryKey].indexes[indexKey].resources[0].resourceId;
                    this.CategoryService.getResourceFieldValues(resourceId, (result) => {
                        categories[categoryKey].indexes[indexKey].description = result.records[0].Description;
                    });
                });
            });
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

    rememberFilters() {
        if (this.filters.length > 0) this.filtersPrevious = this.filters;
    }

    changeCategory() {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedCategory = this.categories[this.selectedCategoryKey];
        this.rememberFilters();
        this.filters = [];
        this.selectedIndex = {};
        this.selectedIndexKey = '';
    }

    changeIndex(indexKey) {
        this.showWarning = false;
        this.showFilterWarning = false;
        this.selectedIndex = this.selectedCategory.indexes[indexKey];
        this.rememberFilters();
        this.filters = this.getFilters(this.selectedIndex.searchable);
        this.scrollTo('search-by');
    }

    toFloat(value) {
        return parseFloat(value.replace(/\$/g, ''));
    }

    formatCurrency(value) {
        return '$' + value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }

    changeOrderType() {
        this.productFound = false;
        for (let i = 0; i < this.products.records.length; i++) {
            let re = new RegExp('^' + RegExp.quote(this.selectedIndex.indexName), 'g');
            if (this.products.records[i].Title.match(re) !== null) {
                /*
                console.log(
                    'matched',
                    this.products.records[i],
                    `DeliveryEmail: ${this.products.records[i].DeliveryEmail}`,
                    `DeliveryPost: ${this.products.records[i].DeliveryPost}`
                );
                */
                this.productFound = this.products.records[i];
                break;
            }
        }
        if (this.productFound) {
            // console.log('Found Product', this.productFound);
            this.productId = this.productFound.ProductID;
            this.price = this.formatCurrency((this.toFloat(this.productFound.CostExGST) + this.toFloat(this.productFound.CostExGST)) * this.quantity);
            // this.price = this.formatCurrency(parseFloat(this.productFound.TOTAL.replace(/\$/g, '')) * this.quantity);
            // this.productFound.CostExGST
            // this.productFound.GST
            // this.productFound.TOTAL
        } else {
            this.productId = '';
            this.price = '';
        }
    }

    validateProduct() {
        for (let i = 0; i < this.products.records.length; i++) {
            let re = new RegExp('^' + RegExp.quote(this.selectedIndex.indexName), 'g');
            if (this.products.records[i].Title.match(re) !== null) {
                return true;
            }
        }
        return false;
    }
    validateAddToCart() {
        return (this.price.length === 0);
    }
    addToCart($event) {
        if ( ! this.productFound) {
            $event.preventDefault();
        }
    }

    getIndexIdentifier(categoryKey, indexKey) {
        return `${categoryKey}_${indexKey}`;
    }

    getCategoryDescription(categoryKey, indexKey) {
        return this.categories[categoryKey].indexes[indexKey].description;
    }

    // Create filter objects based on definition in categories.js
    getFilters(searchable) {
        return searchable.map((searchableField) => {
            let value = '';
            for (let filter of this.filtersPrevious) {
                if (filter.field.trim() === searchableField.trim()) {
                    value = filter.value.trim();
                    break;
                }
            }
            return {
                field: searchableField,
                value: value
            };
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

                    let renderSuccess = this.DataTablesProvider.renderTable(
                        this.EnvService,
                        this.selectedIndex,
                        columns,
                        data.records,
                        () => {
                            this.isSearching = false;
                            this.showClearResearchButton = true;
                            this.resultCategoryName = this.selectedCategory.categoryName;
                            this.resultIndexName = this.selectedIndex.indexName;
                            this.scrollTo('result-block');
                        },
                        () => {
                            if ( ! this.validateProduct()) {
                                // Disable to show the order form if no product data is found in CSV file
                                angular.element('.order-form').hide();
                            }
                        }
                    );

                    if (renderSuccess) {
                        // Show the base price if the product is found in CSV file
                        this.changeOrderType();
                    } else {
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
        this.productId = '';
        this.quantity = '1';
        this.price = '';
        this.productFound = false;
        this.resultIndexName = '';
        this.filtersPrevious = [];
        this.filters = [];
        this.suggestions = [];
        this.searchResultStyle.display = 'none';
        this.scrollTo('index-categories');
    }
}

AppCtrl.$inject = ['EnvService', 'ProductService', 'CategoryService', 'DataTablesProvider', '$timeout', '$sce'];

export default AppCtrl;
