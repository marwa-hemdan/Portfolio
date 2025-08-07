
const firebaseConfig = {
    apiKey: "AIzaSyAWcNOwrXfC5jAjqx1oqI60KAvFzctN80M",
    authDomain: "portfolio-621a6.firebaseapp.com",
    projectId: "portfolio-621a6",
    storageBucket: "portfolio-621a6.firebasestorage.app",
    messagingSenderId: "512000689939",
    appId: "1:512000689939:web:29a9c141131df847ccfce6",
    measurementId: "G-8VZM1DYD1L"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore
const db = firebase.firestore();

// Form submission handler
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = "Saving data...";
    statusMessage.style.color = "blue";

    try {
        // Add a new document with a generated ID
        await db.collection("contacts").add({
            name: name,
            email: email,
            subject: subject,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        statusMessage.textContent = "Data saved successfully!";
        statusMessage.style.color = "green";

        // Clear the form
        document.getElementById('contactForm').reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        statusMessage.textContent = "Error saving data: " + error.message;
        statusMessage.style.color = "red";
    }
});


///////////FETCHING DATA
function updateUI() {
    switch (currentState) {
        case appStates.LOADING:
            loadingElement.classList.remove('hidden');
            errorElement.classList.add('hidden');
            dataContainer.classList.add('hidden');
            break;
        case appStates.SUCCESS:
            loadingElement.classList.add('hidden');
            errorElement.classList.add('hidden');
            dataContainer.classList.remove('hidden');
            break;
        case appStates.ERROR:
            loadingElement.classList.add('hidden');
            errorElement.classList.remove('hidden');
            dataContainer.classList.add('hidden');
            break;
    }
}

// Function to format timestamp
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
}

// Fetch data from Firestore
async function fetchData() {
    try {
        currentState = appStates.LOADING;
        updateUI();

        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        await new Promise(resolve => setTimeout(resolve, 1000));

        const querySnapshot = await db.collection("contacts")
            .orderBy("timestamp", "desc")
            .get();

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4">No data found</td></tr>';
        } else {
            tableBody.innerHTML = '';
            querySnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                            <td>${data.name || '-'}</td>
                            <td>${data.email || '-'}</td>
                            <td>${data.message || '-'}</td>
                            <td>${formatDate(data.timestamp)}</td>
                        `;
                tableBody.appendChild(row);
            });
        }
        currentState = appStates.SUCCESS;
    } catch (error) {
        console.error("Error fetching data:", error);
        errorElement.textContent = `Error loading data: ${error.message}`;
        currentState = appStates.ERROR;
    } finally {
        updateUI();
    }
}

window.addEventListener('load', () => {
    // Verify all required DOM elements exist
    if (!loadingElement || !errorElement || !dataContainer || !tableBody) {
        document.body.innerHTML = '<p class="error-message">Critical error: Missing required page elements</p>';
        return;
    }

    fetchData();
});