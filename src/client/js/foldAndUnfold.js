const championRecords = document.querySelectorAll('.championRecord__championPlayed');

function foldToggle(){
    const tableId = this.id.replace('championPlayed', 'encounteredChampionsTable');

    if(document.getElementById(tableId).style.display === 'block'){
        document.getElementById(tableId).style.display = 'none';
        this.getElementsByClassName('championPlayed__fold')[0].innerHTML = '<i class="fas fa-caret-down"></i>';
    }else{
        document.getElementById(tableId).style.display = 'block';
        this.getElementsByClassName('championPlayed__fold')[0].innerHTML = '<i class="fas fa-caret-up"></i>';
    }
}

championRecords.forEach(championRecord => championRecord.addEventListener('click', foldToggle));