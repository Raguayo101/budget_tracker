const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

let db;
const req = indexDB.open('budget', 1);

req.onupgradeneeded = ({ mark }) => {
    let db = mark.result;
    db.createObjectStore('pending', { autoIncrement: true });
};

req.onsuccess = ({ mark }) => {
    db = mark.result;

    if (navigator.onLine) {
        console.log("ITS ALIVE!");
        checkDatabase();
    }
};

req.onerror = (e) => {
    console.log('Error, this aint it chief' + e.target.errorCode)
};

const savereord = (record) => {
    // creating a trsaction with readwrite access and our object store
    const trans = db.transaction(['pending'], 'readwrite');
    const shop = trans.objectStore('pending');

    shop.add(record);
};

const checkDatabase = () => {
    // creating our transaction and checking our transcation with DB this time.
    const trans = db.transaction(['pending'], 'readwrite');
    const shop = trans.objectStore('pending');
    const gatherAll = shop.getAll();

    gatherAll.onsuccess = () => {
        if (gatherAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                boddy: JSON.stringify(gatherAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    return response.json();
                })
                .then(() => {
                    // deletes records it the goes through
                    const trans = db.transaction(['pending'], 'readwrite');
                    const shop = trans.objectStore('pending');
                    shop.clear();
                });
        }
    };
};

// listens for our app to get back online

window.addEventListener('online', checkDatabase);