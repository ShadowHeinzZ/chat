const firebaseConfig = {
    apiKey: "AIzaSyByjFLGqYHRdSvZdwpquOtoSAxuBlm6YXM",
    authDomain: "chat-f3032.firebaseapp.com",
    projectId: "chat-f3032",
    storageBucket: "chat-f3032.appspot.com",
    messagingSenderId: "634074156385",
    appId: "1:634074156385:web:2ba55568ec1c6828a04920"
};

firebase.initializeApp(firebaseConfig);

// Get elements
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const errorMessage = document.getElementById("error-message");
const messageContainer = document.getElementById("message-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.querySelector("#chat-container form button[type='submit']");
const logoutButton = document.getElementById("logout-button");

// Listen for auth state changes
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        loadMessages();
    } else {
        // User is signed out
        loginContainer.classList.remove("hidden");
        chatContainer.classList.add("hidden");
    }
});

// Listen for login form submission
const loginForm = document.querySelector("#login-container form");
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value.trim();

    // Authenticate user with Firebase
    firebase.auth().signInWithEmailAndPassword(`${username}@example.com`, password)
        .then(() => {
            console.log("User logged in");
        })
        .catch((error) => {
            console.error(error.message);
            errorMessage.textContent = error.message;
        });
});

// Listen for logout button click
logoutButton.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        // Sign-out successful
    }).catch((error) => {
        // An error happened
    });
});

// Listen for new message in Firebase
firebase.database().ref('messages').on('child_added', function (snapshot) {
    const message = snapshot.val();
    displayMessage(message);
});

// Load messages from Firebase
function loadMessages() {
    firebase.database().ref('messages').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            const message = childSnapshot.val();
            displayMessage(message);
        });
    });
}

// Function to display message in chat room
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<div class="message-header">
      <span class="message-sender">${message.sender}</span>
      <span class="message-time">${new Date(message.time).toLocaleTimeString()}</span>
    </div>
    <div class="message-body">${message.text}</div>`;
    messageContainer.appendChild(messageElement);
}


// Listen for send button click
sendButton.addEventListener('click', () => {
    const messageText = messageInput.value.trim();

    // Check if message is provided
    if (!messageText) {
        alert('Please provide a message');
        return;
    }

    // Create message object and add to Firebase
    const message = {
        text: messageText,
        sender: firebase.auth().currentUser.displayName,
        time: firebase.database.ServerValue.TIMESTAMP
    };
    firebase.database().ref('messages').push(message);

    // Clear message input field
    messageInput.value = '';
});

// Listen for enter key press in message input
messageInput.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        sendButton.click();
    }
});