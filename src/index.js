const getCellValue = (tableRow, columnIndex) => tableRow.children[columnIndex].innerText || tableRow.children[columnIndex].textContent;

const comparer = (idx, asc) => (r1, r2) => ((el1, el2) => 
    el1 !== '' && el2 !== '' && !isNaN(el1) && !isNaN(el2) ? el1 - el2 : el1.toString().localeCompare(el2)
    )(getCellValue(asc ? r1 : r2, idx), getCellValue(asc ? r2 : r1, idx));

// const tbody = document.querySelector('tbody');

// document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
//     const table = th.closest('table');
//     Array.from(document.querySelector('tbody').querySelectorAll('tr:nth-child(n)'))
//         .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
//         .forEach(tr => tbody.appendChild(tr) );
// })));


// Array.from(document.querySelectorAll('tbody'))
//     .forEach(tbody => {
//         tbody.querySelectorAll('tr')
//     });

// Array.from(document.querySelectorAll('table'))
//     .forEach(table => {
//        table.q 
//     });


document.querySelectorAll('table').forEach(table => {
    table.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        Array.from(table.querySelector('tbody').querySelectorAll('tr'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.querySelector('tbody').appendChild(tr));
    })));
});