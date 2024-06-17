importScripts('https://www.gstatic.com/firebasejs/8.2.4/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.4/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyAZJDByM6bEBPy7udEo0DZ9IJUzP1jpj6k",
  projectId: "infinity-neurobusiness",
  messagingSenderId: "918885947826",
  appId: "1:918885947826:web:0bb0c6b9251f425e9f6cab",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const NotificationOptions = {
    data: payload.data,
    body: payload.notification.body
  }

  self.registration.showNotification(
    payload.notification.title,
    NotificationOptions
  )
});
