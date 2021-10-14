function sortTable(e) {
    var n, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(e.currentTarget.tableId);
    n = e.currentTarget.n;
    console.log(table.id);
    console.log('n: ', n);
    switching = true;
    dir = "asc"; // meaning ascending sorting direction
    while(switching){
        switching = false;
        rows = table.rows;
        for(i=1; i<(rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[n];
            y = rows[i+1].getElementsByTagName("td")[n];
            console.log("x: ", x);
            console.log("x.innerHTML: ", x.innerHTML);
            if(dir == "asc") {
                console.log("dir == asc")
                if(n>1){
                    console.log("n > 1");
                    // numbers fields: sort by number
                    console.log("parseInt: ", parseInt(x.innerHTML, 10));
                    if(parseInt(x.innerHTML, 10) > parseInt(y.innerHTML, 10)){
                        shouldSwitch = true;
                        break;
                    }
                }else{
                    // Champion field: sort by string (n = 1)
                    if(x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()){
                        shouldSwitch = true;
                        break;
                    }
                }
            }else if(dir == "desc") {
                if(n>1){
                    // numbers fields: sort by number
                    if(parseInt(x.innerHTML, 10) < parseInt(y.innerHTML, 10)){
                        shouldSwitch = true;
                        break;
                    }
                }else{
                    // Champion field: sort by string (n = 1)
                    if(x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()){
                        shouldSwitch = true;
                        break;
                    }
                }
            }

            console.log("should switch: ", shouldSwitch);

        }
        if(shouldSwitch){
            console.log("should switch");
            console.log(rows[i].parentNode);
            rows[i].parentNode.insertBefore(rows[i+1], rows[i]);
            switching = true;
            switchcount++;
        }else{
            if(switchcount==0 && dir == "asc"){
                dir == "desc";
                switching = true;
            }
        }
    }
}

const tables = document.querySelectorAll('table');

// tables.forEach(table => {

// });

tables.forEach(table => {
    tableHeaders = table.querySelectorAll('th')
    for(var j = 1; j < tableHeaders.length; j++){
        tableHeaders[j].tableId = table.id
        tableHeaders[j].n = j;
        tableHeaders[j].addEventListener('click', sortTable);
    }
});