// Obtener elementos del DOM
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');

// Agregar el evento al formulario
loginForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Evitar que el formulario se recargue

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Validar contra JSON Server
  fetch('http://localhost:5000/usuarios')
    .then(response => response.json())
    .then(usuarios => {
      const usuario = usuarios.find(u => u.username === username && u.password === password);
      
      if (usuario) {
        // Guardar el usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(usuario));
        window.location.replace("../public/carrito.html");
    } else {
        // Mostrar mensaje de error
        errorMessage.style.display = 'block'; // Mostrar mensaje de error
      }
    })
    .catch(error => {
      console.error('Error al autenticar:', error);
      errorMessage.textContent = 'Error al intentar iniciar sesión.';
      errorMessage.style.display = 'block';
    });
});
