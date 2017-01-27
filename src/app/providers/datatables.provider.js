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

    formatExtraInfo(index, node, data) {
        let excludedFields = [...index.primary, '_ID', '_FULL_TEXT', 'DESCRIPTION', 'INDEX NAME', 'RESOURCE ID'];

        let rowClass = angular.element(node).hasClass('even') ? 'even' : 'odd';

        let extraInfo = `<tr class="${rowClass} detailedInfoRow open">
                            <td>&nbsp;</td>
                            <td colspan="${index.primary.length}">`;
        //--As a part of order online button--
        let urlLink = "../request-form/index.html?checkbox=1&search=1";

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
            // --As a part of order online button--
            if (key == '_ID') {
                let formatedKeyId = key.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
                urlLink += `&${formatedKeyId}=${data[key]}`;
            }
            // -- End OnlineButn--
        });
        // --As a part of order online button--
        urlLink += `&resource_id=${data['RESOURCE ID']}`;

        if (index.itemTitleField.trim() !== '')
            urlLink += `&itemTitle=${encodeURIComponent(index.itemTitleField)}`;

        // Display an Order Online button
        extraInfo += `</ul><form class="form form-button">
                            <a href=${urlLink}><button class="qsa-button">Order Online</button></a>
                           </form></td></tr>`;

        return extraInfo;
    }

    renderTable(index, columns, data, drawCallback) {

        if (!(this.tableId && typeof this.tableId === 'string' && this.tableId.length > 0)) {
            console.error('Datatable Id is not defined');
            return false;
        }

        if (angular.element(`#${this.tableId}`)[0] && angular.element(`#${this.tableId}`)[0].tagName !== 'TABLE') {
            console.error(`Element #${this.tableId} is not a TABLE`);
            return false;
        }

        let isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;

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
                angular.element(row.node()).after(this.formatExtraInfo(index, row.node(), row.data()));
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