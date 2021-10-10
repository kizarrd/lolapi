const championRecords = document.querySelectorAll('.championRecord__championPlayed');

function foldToggle(){
    console.log(this);
    console.log('clicked');
    console.log(this.id);
    console.log(typeof(this.id));
    const tableId = this.id.replace('championPlayed', 'encounteredChampionsTable');

    if(document.getElementById(tableId).style.display === 'block'){
        document.getElementById(tableId).style.display = 'none';
    }else{
        document.getElementById(tableId).style.display = 'block';
    }
}

championRecords.forEach(championRecord => championRecord.addEventListener('click', foldToggle));