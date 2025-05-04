import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDx6Kpb1w92ixukoKialDNDnKTWPUuRN5M",
    authDomain: "b2enviosfirst.firebaseapp.com",
    projectId: "b2enviosfirst",
    storageBucket: "b2enviosfirst.firebasestorage.app",
    messagingSenderId: "299713069311",
    appId: "1:299713069311:web:a6e02cfa246acd47494cca",
    measurementId: "G-7CCTEJQ46E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Evita la recarga de la página al enviar el formulario

    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Usuario ha iniciado sesión correctamente
            const user = userCredential.user;
            console.log('Usuario autenticado:', user);
            errorMessage.textContent = ''; // Limpia cualquier mensaje de error previo
            // Redirige al usuario a la página principal o panel de control
            window.location.href = '/dashboard.html'; // Reemplaza '/dashboard.html' con tu ruta deseada
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessageFirebase = error.message;
            console.error('Error al iniciar sesión:', errorCode, errorMessageFirebase);
            errorMessage.textContent = 'Error al iniciar sesión: Credenciales incorrectas.'; // Muestra un mensaje de error genérico al usuario
            // Puedes personalizar los mensajes de error según el 'errorCode' si lo deseas
        });
});