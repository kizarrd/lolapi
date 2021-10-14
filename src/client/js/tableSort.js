const getCellValue = (tableRow, columnIndex) => {
    const daInnerText = tableRow.children[columnIndex].innerText;
    const th_asc = tableRow.parentNode.parentNode.querySelector('thead').querySelector('tr').children[columnIndex].asc;
    if(daInnerText=='x'){
        return th_asc ? -1 : Infinity;
    }
    if(columnIndex >= 6){
        return parseInt(daInnerText);
    }else{
        return daInnerText;
    }
    // return tableRow.children[columnIndex].innerText || tableRow.children[columnIndex].textContent;
}
const comparer = (idx, asc) => (r1, r2) => ((el1, el2) => 
        el1 !== '' && el2 !== '' && !isNaN(el1) && !isNaN(el2) ? el1 - el2 : el1.toString().localeCompare(el2)
    )(getCellValue(asc ? r2 : r1, idx), getCellValue(asc ? r1 : r2, idx));
   
document.querySelectorAll('table').forEach(table => {
    table.querySelector('thead')
    Array.from(table.querySelector('tbody').querySelectorAll('tr'))
        .sort(comparer(2, true))
        .forEach(tr => table.querySelector('tbody').appendChild(tr));
    var playedAgainst_th = table.querySelector('thead').querySelector('tr').childNodes[2];
    playedAgainst_th.asc = true;
    playedAgainst_th.querySelector('button').style.fontWeight = 'bold';
    playedAgainst_th.querySelector('button').getElementsByClassName('indicator')[0].innerHTML = '<i class="fas fa-caret-down"></i>'
})    

document.querySelectorAll('table').forEach(table => {
    table.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        Array.from(table.querySelector('tbody').querySelectorAll('tr'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), th.asc = !th.asc))
            .forEach(tr => table.querySelector('tbody').appendChild(tr));
        
        var childs =  Array.from(th.parentNode.children);
        for(var i=1; i<childs.length; i++){
            childs[i].querySelector('button').style.fontWeight = '400';
            childs[i].querySelector('button').getElementsByClassName('indicator')[0].innerHTML = '';
        }

        th.querySelector('button').style.fontWeight = 'bold';
        th.querySelector('button').getElementsByClassName('indicator')[0].innerHTML = th.asc ? '<i class="fas fa-caret-down"></i>' : '<i class="fas fa-caret-up"></i>';        
    })));
});