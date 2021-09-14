//Variable to Hold db Connection
let db;

//Create Connection to IndexedDB called 'budgetbase' and set at v1
const request = indexedDB.open('budgetbase', 1);
    request.onupgradeneeded = (e) => {
        const db = e.target.result;
            db.createObjectStore('new_input', {autoIncrement: true});
        };

//Successful Request
    request.onsuccess = (e) => {
        db = e.target.result;
    //Check if Tracker is Online, if it is send local data to API
        if(navigator.onLine) {
            updateBudget();
        }
    };
//Unsuccessful Request
    request.onerror = (e) => {
        console.log(e.target.errorCode);
    };


//Save record with Offline Connection
recordEntry = (record) =>  {
    const newEntry = db.newEntry(['new_entry'], 'readwrite');
    const entryObjectStore = newEntry.objectStore('new_entry');
        entryObjectStore.add(record);
}

//Update Tracker once Connection has been restored
 updateBudget = () =>  {
    console.log("Updating Your Budget!")
    const newEntry = db.newEntry(['new_entry'], 'readwrite');
    const insertStore = newEntry.objectStore('new_entry');
    const grabAll = insertStore.grabAll();

//When Successful run the following:

    grabAll.onsuccess = () => {
        console.log('Grabbing All Offline Inputs');

        if(grabAll.result.length > 0) {
            fetch('./api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(grabAll.result),
                headers:  {
                    Accept: 'application/json, text/plain, */*',
                            'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                console.log(serverResponse);

            newEntry = db.newEntry(['new_input'], 'readwrite');
            entryObjectStore = newEntry.objectStore('new_input');

            entryObjectStore.clear();

            alert('Your entries have been updated! New Budget Available!');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
}

//Listener for Online Connecion

window.addEventListener('online', updateBudget);