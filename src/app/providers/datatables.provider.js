import angular from 'angular';

/*
 * A provider used with jQuery plugin DataTablesProvider
 * Must include jQuery and DataTables to work
 */
class DataTablesProvider {
    datatable = undefined;
    tableId = '';

    setTableId(id) {
        if (!(id && typeof id === 'string' && id.length > 0)) {
            throw 'Invalid datatable id';
        }

        this.tableId = id;
    }

    setColumns(primaryFields) {
        let firstColumn = {
            className: 'details-control',
            orderable: false,
            data: null,
            defaultContent: ''
        };

        let columns = primaryFields.reduce((allColumns, title) => {
            // Format column header with sentence case
            let columnHeader = title.charAt(0).toUpperCase() + title.substr(1).toLowerCase();

            let column = {
                title: columnHeader,
                data: title,
                orderable: title !== 'DIGITAL IMAGE',
                render: (data, type, row, meta) => {
                    if (data === undefined) {
                        if (meta.row === 0)
                            console.error(`Column ${title} has no data`);

                        return '';
                    }

                    if (data && title === 'DIGITAL IMAGE')
                        return `<a href="${data}" target="_blank">See image</a>`;

                    return data;
                }
            };

            return [...allColumns, column];
        }, [firstColumn]);

        return columns;
    }

    formatExtraInfo(index, node, data) {
        let excludedFields = [...index.primary, '_ID', '_FULL_TEXT', 'DESCRIPTION', 'INDEX NAME', 'RESOURCE ID'];

        let rowClass = angular.element(node).hasClass('even') ? 'even' : 'odd';

        let extraInfo = `<tr class="${rowClass} detailedInfoRow open">
                            <td>&nbsp;</td>
                            <td colspan="${index.primary.length}">`;

        //--As a part of order online button--
        const redirectUrl = 'https://test.smartservice.qld.gov.au/services/test/prodi/products';
        let firstExtraInfo = '';
        let secondExtraInfo = '';
        let extraInfoItems = [];
        let attribute1;
        let attribute2;
        let attribute3;
        let urlLink = "../qsa/request-form/index.html?checkbox=1&search=1";

        if (!data['INDEX NAME']) data['INDEX NAME'] = 'No index name provided';
        if (!data['DESCRIPTION']) data['DESCRIPTION'] = 'No description provided';

        // Display description
        //extraInfo += `<div>
        //                <p>${data['INDEX NAME']}</p>
        //                <p>${data['DESCRIPTION']}</p>
        //              </div><ul class="extra-info">`;
        extraInfo += `<ul class="extra-info">`;

        // Display all fields other than excluded fields
        Object.keys(data).sort().forEach((key) => {
            let formattedKey = key.charAt(0).toUpperCase() + key.substr(1).toLowerCase();
            let value = '';
            if (key === 'SOURCE') {
                value = `<a href="${data[key]}" target="_blank">${data[key]}</a>`;
            } else {
                value = data[key];
            }
            if (excludedFields.indexOf(key) < 0) {
                extraInfoItems.push(`<li><b>${formattedKey}</b><ul><li>${value}</li></ul></li>`);
            } else {
                if (index.primary[0] && (key === index.primary[0]) && value) {
                    firstExtraInfo = `<li><b>${formattedKey}</b><ul><li>${value}</li></ul></li>`;
                }
                if (index.primary[1] && (key === index.primary[1]) && value) {
                    secondExtraInfo = `<li><b>${formattedKey}</b><ul><li>${value}</li></ul></li>`;
                }
            }
            // --As a part of order online button--
            if (key === '_ID') {
                let formattedKeyId = key.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                urlLink += `&${formattedKeyId}=${data[key]}`;
            }
            // -- End OnlineButton--
        });
        extraInfo += firstExtraInfo + secondExtraInfo + extraInfoItems.join('');
        // --As a part of order online button--
        urlLink += `&resource_id=${data['RESOURCE ID']}`;

        attribute1 = data['GIVEN NAME/S'];
        attribute2 = data['ITEM ID'];
        attribute3 = data['SOURCE'];

        if (index.itemTitleField.trim() !== '')
            urlLink += `&itemTitle=${encodeURIComponent(index.itemTitleField)}`;

        // Display an Order Online button
        extraInfo += `</ul><form class="form form-button order-form" action="https://test.smartservice.qld.gov.au/services/prodi/addProduct" method="post">
      <fieldset>
        Quantity: <input type="text" name="quantity" value="1" id="quantity" size="2" ng-change="vm.changeOrderType()" ng-model="vm.quantity" />
      </fieldset>
      <fieldset ng-show="vm.price !== ''">
        Price: <span ng-bind="vm.price"></span>
      </fieldset>

      <input type="hidden" name="attribute1" value="${attribute1}" />
      <input type="hidden" name="attribute2" value="${attribute2}" />
      <input type="hidden" name="attribute3" value="${attribute3}" />
      <input type="hidden" class="productId" name="productId" ng-value="vm.productId" />
      <input type="hidden" name="redirectUrl" value="${redirectUrl}" />
      <input type="hidden" name="cartId" value="` + SSQ.cart.id + `" />
      <input type="submit" value="Add To Cart" id="add-to-cart" ng-disabled="vm.validateAddToCart()" ng-click="vm.addToCart($event)" />
<!--                            <a href=${urlLink}><button class="qsa-button">Order Online</button></a> -->
                           </form></td></tr>`;

        return extraInfo;
    }

    renderTable(index, columns, data, drawCallback, postRender) {
        if (!(this.tableId && typeof this.tableId === 'string' && this.tableId.length > 0)) {
            console.error('Datatable Id is not defined');
            return false;
        }

        if (angular.element(`#${this.tableId}`)[0] && angular.element(`#${this.tableId}`)[0].tagName !== 'TABLE') {
            console.error(`Element #${this.tableId} is not a TABLE`);
            return false;
        }

        this.datatable = angular.element(`#${this.tableId}`).DataTable({
            destroy: true,
            data: data,
            bSortClasses: false,
            bInfo: true,
            scrollX: true,
            dom: '<"top"<l>if>rt<"bottom"p><"clear">',
            createdRow: (row) => {
                angular.element(row).addClass('summary');
            },
            columns: columns,
            language: {
                emptyTable: `<p>No results were found.</p>
                             <p>You can try alternative spellings, read more about <a href="/recreation/arts/heritage/archives/starting/research/">researching archives</a>, 
                             download and browse the <a href="${index.noResultLink}">full index</a>,
                             or try searching our entire <a href="http://www.archivessearch.qld.gov.au/Search/BasicSearch.aspx">catalogue</a>.</p>`,
                search: 'Refine search:'
            },
            order: [
                [2, 'asc'],
                [1, 'asc']
            ],
            drawCallback: (settings) => {
                if (drawCallback) drawCallback(settings.iDraw);
            }
        });

        angular.element(`#${this.tableId} tbody`).unbind('click');

        // Display/Hide extra information when click the row
        angular.element(`#${this.tableId} tbody`).on('click', 'td', (event) => {
            let tr = angular.element(event.target).closest('tr');
            let row = this.datatable.row(tr);

            if (angular.element(tr).hasClass('detailedInfoRow'))
                return;

            angular.forEach(angular.element(`#${this.tableId} tbody tr`), function(trTmp, key){
                if (angular.element(trTmp).hasClass('detailedInfoRow')) {
                    angular.element(trTmp).remove();
                } else {
                    angular.element(trTmp).removeClass('shown');
                }
            });

            if (angular.element(tr).next().hasClass('detailedInfoRow')) {
                angular.element(tr).next().remove();
                tr.removeClass('shown');
            } else {
                let extraInfo = this.formatExtraInfo(index, row.node(), row.data());
                angular.element(tr).injector().invoke(function($compile) {
                    let scope = angular.element(tr).scope();
                    angular.element(row.node()).after($compile(extraInfo)(scope));
                    scope.$digest();
                    if (postRender) postRender();
                    tr.addClass('shown');
                });
            }
        });

        // Hide extra information on table redrawn
        angular.element(`#${this.tableId}`).on('draw.dt', () => {
            let rows = angular.element('tr.shown');
            rows.map((row) => {
                angular.element(rows[row]).removeClass('shown');
            });
        });

        return true;
    }

    destroy() {
        if (this.datatable) {
            this.datatable.destroy();
            angular.element(`#${this.tableId}`).empty();
        }
    }

    $get() {
        return this;
    }
}

DataTablesProvider.$inject = [];

export default angular.module('providers.datatables', [])
    .provider('DataTablesProvider', DataTablesProvider)
    .name;
