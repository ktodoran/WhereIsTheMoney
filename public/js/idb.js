let db;

const request = indexedDB.open('tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore('new_input', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_input'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_input');

    budgetObjectStore.add(record);
};

function uploadTransactions() {
    const transaction = db.transaction(['new_input'], 'readwrite');
    
    const inputStore = transaction.objectStore('new_input');

    const getAll = inputStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_input'], 'readwrite');
                    
                    const budgetObjectStore = transaction.objectStore('new_input');

                    budgetObjectStore.clear();

                    alert('Your item has been saved to your Tracker!');
                })
                .catch(err => {
                    console.log(err);
                })
        }
    };
};

window.addEventListener('online', uploadTransactions);