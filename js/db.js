let db;

function openDB(){
    let request = window.indexedDB.open('notes_db', 1);
    console.log("yes");
    request.onerror = function(e){
        console.log(e.target.result); 
    }
    request.onsuccess = function(e){
        console.log("yes");
    }
}