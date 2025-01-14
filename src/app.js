// Obtener elementos del DOM
const productoLista = document.getElementById("producto-lista");
const carritoCount = document.getElementById("carrito-count");
const cargarMasBtn = document.getElementById("cargar-mas");
const filtroCategoria = document.getElementById("filtro-categoria");
const ordenarPrecio = document.getElementById("ordenar-precio");
const finalizarCompraBtn = document.getElementById('finalizar-compra'); // Botón para finalizar la compra

let productos = [];
let categorias = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let paginaActual = 1;
let categoriaSeleccionada = 0; // Inicialmente mostramos todas las categorías
let ordenSeleccionado = 'asc'; // Orden predeterminado

// Obtener el modal y el botón de cierre
const modal = document.getElementById("modal-info");
const closeModal = document.getElementById("close-modal");

// Función para cargar las categorías
function cargarCategorias() {
  fetch('http://localhost:5000/categorias')
    .then(response => response.json())
    .then(data => {
      categorias = data; // Guardamos las categorías
      // Poblamos el select con las categorías
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nombre;
        filtroCategoria.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error al cargar categorías:', error);
    });
}

// Función para cargar productos desde el JSON Server
function cargarProductos() {
  let url = `http://localhost:5000/productos?_page=${paginaActual}&_limit=8`;

  // Filtrado por categoría, si es necesario
  if (categoriaSeleccionada > 0) {
    url += `&categoria=Categoria ${categoriaSeleccionada}`;
  }

  // Solicitar los productos con la URL construida
  fetch(url)
    .then(response => response.json())
    .then(data => {
      productos = [...productos, ...data]; // Agregar productos a la lista de productos
      filtrarYOrdenarProductos(); // Filtrar y ordenar los productos por la categoría seleccionada y el orden
    })
    .catch(error => {
      console.error('Error al cargar productos:', error);
    });
}

// Función para filtrar productos por categoría y ordenarlos por precio
function filtrarYOrdenarProductos() {
  let productosFiltrados = productos;

  // Filtrar por categoría seleccionada
  if (categoriaSeleccionada > 0) {
    productosFiltrados = productosFiltrados.filter(producto => producto.categoria === `Categoria ${categoriaSeleccionada}`);
  }

  // Ordenar los productos por precio, ascendente o descendente
  productosFiltrados.sort((a, b) => {
    if (ordenSeleccionado === 'asc') {
      return a.precio - b.precio; // Orden ascendente
    } else {
      return b.precio - a.precio; // Orden descendente
    }
  });

  renderizarProductos(productosFiltrados); // Renderizar los productos filtrados y ordenados
}

// Función para renderizar productos en la página principal
function renderizarProductos(productosFiltrados) {
  productoLista.innerHTML = '';  // Limpiar la lista antes de renderizar
  if (productosFiltrados.length > 0) {
    productosFiltrados.forEach(producto => {
      const div = document.createElement('div');
      div.classList.add('producto');
      div.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}" />
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio}</p>
        <button class="agregar-carrito" data-producto-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">Agregar al carrito</button>
        <button class="ver-mas" data-producto-id="${producto.id}">Más Información</button>
      `;
      productoLista.appendChild(div);
    });

    // Añadir eventos a los botones "Agregar al carrito"
    const botones = document.querySelectorAll('.agregar-carrito');
    botones.forEach(boton => {
      boton.addEventListener('click', (e) => {
        const productoId = e.target.getAttribute('data-producto-id');
        const nombre = e.target.getAttribute('data-nombre');
        const precio = e.target.getAttribute('data-precio');
        agregarAlCarrito(productoId, nombre, precio);
      });
    });

    // Añadir eventos a los botones "Más Información"
    const botonesMasInfo = document.querySelectorAll('.ver-mas');
    botonesMasInfo.forEach(boton => {
      boton.addEventListener('click', (e) => {
        const productoId = e.target.getAttribute('data-producto-id');
        mostrarMasInformacion(productoId);
      });
    });
  } else {
    productoLista.innerHTML = "<p>No hay productos disponibles en esta categoría.</p>";
  }
}

// Función para mostrar más información en el modal
function mostrarMasInformacion(productoId) {
  const producto = productos.find(p => p.id == productoId);

  // Rellenar el modal con la información del producto
  document.getElementById("producto-nombre").textContent = producto.nombre;
  document.getElementById("producto-imagen").src = producto.imagen;
  document.getElementById("producto-imagen").alt = producto.nombre;
  document.getElementById("producto-descripcion").textContent = producto.descripcion;
  document.getElementById("producto-precio").textContent = producto.precio;

  // Mostrar el modal
  modal.style.display = "block";
}

// Función para cerrar el modal
closeModal.addEventListener('click', () => {
  modal.style.display = "none"; // Ocultar el modal
});

// Cerrar el modal si el usuario hace clic fuera del contenido del modal
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// Función para cargar más productos al hacer clic en "Cargar más"
cargarMasBtn.addEventListener('click', () => {
  paginaActual++;
  cargarProductos();
});

// Función para agregar productos al carrito
function agregarAlCarrito(productoId, nombre, precio) {
  const producto = {
    id: productoId,
    nombre: nombre,
    precio: parseFloat(precio),
    cantidad: 1
  };

  const productoExistente = carrito.find(item => item.id === productoId);
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push(producto);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));  // Guardar el carrito en localStorage
  actualizarContadorCarrito();  // Actualizar el contador de productos en el carrito
}

// Función para actualizar el contador de productos en el carrito
function actualizarContadorCarrito() {
  const totalProductos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  carritoCount.textContent = totalProductos;  // Actualizar el contador en el HTML
}

// Filtrar productos por categoría seleccionada
filtroCategoria.addEventListener('change', (e) => {
  categoriaSeleccionada = parseInt(e.target.value); // Obtener el valor de la categoría seleccionada
  productos = []; // Limpiar la lista de productos actual
  paginaActual = 1; // Resetear la página
  cargarProductos(); // Cargar los productos con el filtro seleccionado
});

// Ordenar productos por precio
ordenarPrecio.addEventListener('change', (e) => {
  ordenSeleccionado = e.target.value; // Obtener el valor de la opción seleccionada (ascendente o descendente)
  filtrarYOrdenarProductos(); // Filtrar y ordenar productos según la opción seleccionada
});
// Función para mostrar más información en el modal
function mostrarMasInformacion(productoId) {
  const producto = productos.find(p => p.id == productoId); // Buscar el producto

  // Verificar si el producto existe
  if (producto) {
    // Rellenar el modal con la información del producto
    document.getElementById("producto-nombre").textContent = producto.nombre;
    document.getElementById("producto-imagen").src = producto.imagen;
    document.getElementById("producto-imagen").alt = producto.nombre;
    document.getElementById("producto-descripcion").textContent = producto.descripcion;
    document.getElementById("producto-precio").textContent = producto.precio;

    // Mostrar el modal
    modal.style.display = "block";
  }
}

// Función para cerrar el modal
closeModal.addEventListener('click', () => {
  modal.style.display = "none"; // Ocultar el modal
});

// Cerrar el modal si el usuario hace clic fuera del contenido del modal
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});


// Inicializar la aplicación
cargarCategorias(); // Cargar categorías
cargarProductos(); // Cargar productos
actualizarContadorCarrito();  // Actualizar el contador al cargar la página
