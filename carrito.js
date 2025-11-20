/* ===========================================
   CARRITO — GLOBAL (LÓGICA UNIFICADA)
=========================================== */

// Usamos siempre la clave "carrito" para evitar confusiones
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ELEMENTOS DEL DOM
const cartCount = document.querySelector(".cart-count");
const cartAmount = document.querySelector(".cart-amount");
const cartOverlay = document.getElementById("cart-overlay");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartIconBtn = document.querySelector(".cart-icon-container");
const btnVaciar = document.getElementById("vaciar-carrito");

/* ===========================================
   1. FUNCIONES PRINCIPALES
=========================================== */

// Guardar en memoria y actualizar vista
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarHeader();
    actualizarCarritoLateral();
}

// Actualizar numeritos del Header
function actualizarHeader() {
    let cantidad = carrito.reduce((s, p) => s + p.cantidad, 0);
    let total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);

    if (cartCount) cartCount.textContent = cantidad;
    if (cartAmount) cartAmount.textContent = "S/ " + total.toFixed(2);
}

// Renderizar el Carrito Lateral
function actualizarCarritoLateral() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((item, i) => {
        subtotal += item.precio * item.cantidad;

        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>${item.cantidad} × <span>S/ ${item.precio.toFixed(2)}</span></p>
                </div>
                <span class="remove-item" onclick="eliminarProducto(${i})">×</span>
            </div>
        `;
    });

    if (cartTotal) cartTotal.textContent = "S/ " + subtotal.toFixed(2);
}

/* ===========================================
   2. EVENTOS DE BOTONES "COMPRAR"
=========================================== */
document.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".producto-card");
        const nombre = card.querySelector("h3").textContent; // Ajustado para buscar h3 genérico
        // Limpieza de precio para obtener solo el número
        const precioTexto = card.querySelector(".precio-oferta") ? card.querySelector(".precio-oferta").textContent : card.querySelector(".producto-precio").textContent;
        const precio = parseFloat(precioTexto.replace("S/.", "").replace("S/", "").trim());
        const imagen = card.querySelector("img").src;

        const existe = carrito.find(p => p.nombre === nombre);

        if (existe) {
            existe.cantidad++;
        } else {
            carrito.push({ nombre, precio, imagen, cantidad: 1 });
        }

        guardarCarrito();
        
        // Abrir el carrito automáticamente al comprar
        if (cartPanel) {
            cartOverlay.style.display = "block";
            cartPanel.classList.add("open");
        }
    });
});

/* ===========================================
   3. ABRIR / CERRAR CARRITO LATERAL
=========================================== */
if (cartIconBtn) {
    cartIconBtn.addEventListener("click", () => {
        cartOverlay.style.display = "block";
        cartPanel.classList.add("open");
        actualizarCarritoLateral();
    });
}

if (closeCart) {
    closeCart.addEventListener("click", () => {
        cartOverlay.style.display = "none";
        cartPanel.classList.remove("open");
    });
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
        if (closeCart) closeCart.click();
    });
}

/* ===========================================
   4. ACCIONES DEL CARRITO (ELIMINAR / VACIAR)
=========================================== */

// Eliminar un producto específico
window.eliminarProducto = function(i) {
    carrito.splice(i, 1);
    guardarCarrito();
};

// Vaciar todo el carrito (Botón rojo del lateral)
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (carrito.length === 0) return;
        if (confirm("¿Estás seguro de vaciar el carrito?")) {
            carrito = [];
            guardarCarrito();
        }
    });
}

/* ===========================================
   5. LÓGICA ESPECÍFICA DE LA PÁGINA CARRITO.HTML
=========================================== */
if (document.getElementById("carrito-items")) {
    // Detectamos si estamos en la página grande del carrito por el ID de la lista
    const listaPagina = document.getElementById("carrito-items"); 
    const subtotalPagina = document.getElementById("subtotal");

    // Solo si estamos en carrito.html y la lista tiene la clase 'carrito-lista' (para diferenciar del lateral)
    if (listaPagina.classList.contains("carrito-lista")) {
        
        function renderPageCart() {
            listaPagina.innerHTML = "";
            let total = 0;

            if (carrito.length === 0) {
                listaPagina.innerHTML = "<p style='text-align:center; padding:20px;'>Tu carrito está vacío.</p>";
                subtotalPagina.textContent = "S/ 0.00";
                return;
            }

            carrito.forEach((item, i) => {
                total += item.precio * item.cantidad;
                listaPagina.innerHTML += `
                    <div class="item-carrito">
                        <img src="${item.imagen}">
                        <div class="item-info">
                            <h3>${item.nombre}</h3>
                        </div>
                        <div class="cantidad-box">
                            <button onclick="cambiarCantidad(${i}, -1)" class="btn-cantidad">−</button>
                            <span class="cantidad-numero">${item.cantidad}</span>
                            <button onclick="cambiarCantidad(${i}, 1)" class="btn-cantidad">+</button>
                        </div>
                        <div class="precio-item">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
                        <span class="btn-eliminar" onclick="eliminarProducto(${i})">×</span>
                    </div>
                `;
            });
            subtotalPagina.textContent = "S/ " + total.toFixed(2);
        }

        // Sobreescribimos funciones globales para que actualicen también esta página
        window.cambiarCantidad = (i, val) => {
            carrito[i].cantidad += val;
            if (carrito[i].cantidad < 1) carrito[i].cantidad = 1;
            guardarCarrito();
            renderPageCart();
        };

        // Hook para que al cargar la página se renderice
        renderPageCart();
    }
}

// Inicializar al cargar
actualizarHeader();
actualizarCarritoLateral();