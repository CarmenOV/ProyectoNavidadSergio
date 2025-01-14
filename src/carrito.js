// Obtener elementos del DOM en carrito.html
const carritoItems = document.getElementById("carrito-items");
const finalizarCompraBtn = document.getElementById("finalizar-compra");
const totalCarrito = document.getElementById("total-carrito");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Función para renderizar el carrito de compras
function renderizarCarrito() {
  carritoItems.innerHTML = '';  // Limpiar la lista del carrito
  let total = 0;

  carrito.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.nombre} - $${item.precio} x ${item.cantidad}
      <button class="aumentar" data-id="${item.id}">+</button>
      <button class="disminuir" data-id="${item.id}">-</button>
      <button class="eliminar" data-id="${item.id}">Eliminar</button>
    `;
    carritoItems.appendChild(li);
    total += item.precio * item.cantidad;
  });

  // Mostrar el total de la compra
  totalCarrito.textContent = total.toFixed(2);
  
  // Asignar eventos a los botones de aumentar, disminuir y eliminar
  asignarEventosBotones();
}

// Función para asignar eventos a los botones de aumentar, disminuir y eliminar
function asignarEventosBotones() {
  // Botones de aumentar cantidad
  const aumentarBtns = document.querySelectorAll('.aumentar');
  aumentarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productoId = btn.getAttribute('data-id');
      aumentarCantidad(productoId);
    });
  });

  // Botones de disminuir cantidad
  const disminuirBtns = document.querySelectorAll('.disminuir');
  disminuirBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productoId = btn.getAttribute('data-id');
      disminuirCantidad(productoId);
    });
  });

  // Botones de eliminar producto
  const eliminarBtns = document.querySelectorAll('.eliminar');
  eliminarBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productoId = btn.getAttribute('data-id');
      eliminarProducto(productoId);
    });
  });
}

// Función para aumentar la cantidad de un producto en el carrito
function aumentarCantidad(productoId) {
  const producto = carrito.find(item => item.id === productoId);
  if (producto) {
    producto.cantidad++;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
  }
}

// Función para disminuir la cantidad de un producto en el carrito
function disminuirCantidad(productoId) {
  const producto = carrito.find(item => item.id === productoId);
  if (producto && producto.cantidad > 1) {
    producto.cantidad--;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
  } else if (producto) {
    eliminarProducto(productoId);
  }
}

// Función para eliminar un producto del carrito
function eliminarProducto(productoId) {
  carrito = carrito.filter(item => item.id !== productoId);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

// Función para finalizar la compra
finalizarCompraBtn.addEventListener('click', () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  
  if (!usuario) {
    alert("Debes iniciar sesión para realizar la compra.");
    window.location.href = "../public/login.html"; // Redirigir al login si no hay usuario.
    return;
  }

  if (carrito.length > 0) {
    alert("¡Compra realizada con éxito!");
    carrito = [];
    localStorage.setItem("carrito", JSON.stringify(carrito));
    renderizarCarrito();
  } else {
    alert("Tu carrito está vacío.");
  }
});

// Inicializar la vista del carrito
renderizarCarrito();
