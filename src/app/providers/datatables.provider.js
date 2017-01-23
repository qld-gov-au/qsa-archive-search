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
            }

            return [...allColumns, column];
        }, [firstColumn]);

        return columns;
    }

    formatExtraInfo(primaryFields, node, data) {
        let excludedFields = [...primaryFields, '_ID', '_FULL_TEXT', 'DESCRIPTION', 'INDEX NAME'];

        let rowClass = angular.element(node).hasClass('even') ? 'even' : 'odd';

        let extraInfo = `<tr class="${rowClass} detailedInfoRow open">
                            <td>&nbsp;</td>
                            <td colspan="${primaryFields.length}">`;

        if (!data['INDEX NAME']) data['INDEX NAME'] = 'No index name provided';
        if (!data['DESCRIPTION']) data['DESCRIPTION'] = 'No description provided';

        // Display description
        extraInfo += `<div>
                        <p>${data['INDEX NAME']}</p>
                        <p>${data['DESCRIPTION']}</p>
                      </div><ul>`;

        // Display all fields other than excluded fields
        Object.keys(data).sort().forEach((key) => {
            if (excludedFields.indexOf(key) < 0) {
                let formatedKey = key.charAt(0).toUpperCase() + key.substr(1).toLowerCase();

                extraInfo += `<li><b>${formatedKey}</b><ul><li>${data[key]}</li></ul></li>`;
            }
        });

        // Display an Order Online button
        extraInfo += `</ul><form class="form form-button">
                            <button class="qsa-button">Order Online</button>
                           </form></td></tr>`;

        return extraInfo;
    }

    renderTable(primaryFields, columns, data, drawCallback) {
        if (!(this.tableId && typeof this.tableId === 'string' && this.tableId.length > 0)) {
            console.error('Datatable Id is not defined');
            return false;
        }

        if (angular.element(`#${this.tableId}`)[0].tagName !== 'TABLE') {
            console.error(`Element #${this.tableId} is not a TABLE`);
            return false;
        }

        this.datatable = angular.element(`#${this.tableId}`).DataTable({
            destroy: true,
            data: data,
            bSortClasses: false,
            bInfo: true,
            dom: '<"top"<l>if>rt<"bottom"p><"clear">',
            createdRow: (row) => {
                angular.element(row).addClass('summary');
            },
            columns: columns,
            order: [
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

            if (angular.element(tr).next().hasClass('detailedInfoRow')) {
                angular.element(tr).next().remove();
                tr.removeClass('shown');
            } else {
                angular.element(row.node()).after(this.formatExtraInfo(primaryFields, row.node(), row.data()));
                tr.addClass('shown');
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