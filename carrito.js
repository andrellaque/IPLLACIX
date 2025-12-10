/* Carrito — Global (Lógica Unificada) */

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Elementos DOM
const cartCount = document.querySelector(".cart-count");
const cartAmount = document.querySelector(".cart-amount");
const cartOverlay = document.getElementById("cart-overlay");
const cartPanel = document.getElementById("cart-panel");
const closeCart = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartIconBtn = document.querySelector(".cart-icon-container");
const btnVaciar = document.getElementById("vaciar-carrito");

/* 1. Funciones Principales */
function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarHeader();
    actualizarCarritoLateral();
}

function actualizarHeader() {
    let cantidad = carrito.reduce((s, p) => s + p.cantidad, 0);
    let total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    if (cartCount) cartCount.textContent = cantidad;
    if (cartAmount) cartAmount.textContent = "S/ " + total.toFixed(2);
}

function actualizarCarritoLateral() {
    if (!cartItemsContainer) return;

    // Si estamos en la página "carrito.html", no sobrescribimos la lista principal
    if (cartItemsContainer.classList.contains("carrito-lista")) return;

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
                <button class="remove-item-texto" onclick="eliminarProducto(${i})">Eliminar</button>
            </div>
        `;
    });
    if (cartTotal) cartTotal.textContent = "S/ " + subtotal.toFixed(2);
}

/* Helper: Limpiar precios */
function limpiarPrecio(texto) {
    let limpio = texto.replace("S/.", "").replace("S/", "");
    limpio = limpio.replace(",", "").trim();
    return parseFloat(limpio);
}

/* 2. Comprar */
document.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".producto-card");
        const nombre = card.querySelector("h3").textContent;

        const precioElem = card.querySelector(".precio-oferta") ? card.querySelector(".precio-oferta") : card.querySelector(".producto-precio");
        const precio = limpiarPrecio(precioElem.textContent);

        const imagen = card.querySelector("img").src;

        const existe = carrito.find(p => p.nombre === nombre);
        if (existe) existe.cantidad++;
        else carrito.push({ nombre, precio, imagen, cantidad: 1 });

        guardarCarrito();
        if (cartPanel) {
            cartOverlay.style.display = "block";
            cartPanel.classList.add("open");
        }
    });
});

/* 3. Abrir/Cerrar Carrito Lateral */
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

/* 4. Acciones (Eliminar/Vaciar) */
window.eliminarProducto = function(i) {
    carrito.splice(i, 1);
    guardarCarrito();

    if (document.getElementById("carrito-items") && typeof renderPageCart !== 'undefined') {
        renderPageCart();
    } else {
        actualizarCarritoLateral();
    }
};

if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire({ title: 'Vacío', icon: 'info', confirmButtonColor: '#007bff' });
            return;
        }
        Swal.fire({
            title: '¿Vaciar?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', confirmButtonText: 'Sí'
        }).then((result) => {
            if (result.isConfirmed) {
                carrito = [];
                guardarCarrito();

                const listaGrande = document.getElementById("carrito-items");
                const totalGrande = document.getElementById("subtotal");
                if (listaGrande && listaGrande.classList.contains("carrito-lista")) {
                    listaGrande.innerHTML = "<p style='text-align:center; padding:20px;'>Tu carrito está vacío.</p>";
                    if (totalGrande) totalGrande.textContent = "S/ 0.00";
                }
                Swal.fire({ title: '¡Vaciado!', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
}

/* 5. Página Carrito */
if (document.getElementById("carrito-items")) {
    const listaPagina = document.getElementById("carrito-items");
    const subtotalPagina = document.getElementById("subtotal");

    if (listaPagina.classList.contains("carrito-lista")) {
        window.renderPageCart = function() {
            listaPagina.innerHTML = "";
            let total = 0;
            if (carrito.length === 0) {
                listaPagina.innerHTML = "<p style='text-align:center; padding:20px;'>Tu carrito está vacío.</p>";
                if (subtotalPagina) subtotalPagina.textContent = "S/ 0.00";
                return;
            }
            carrito.forEach((item, i) => {
                total += item.precio * item.cantidad;
                listaPagina.innerHTML += `
                    <div class="item-carrito">
                        <img src="${item.imagen}">
                        <div class="item-info"><h3>${item.nombre}</h3></div>
                        <div class="cantidad-box">
                            <button onclick="cambiarCantidad(${i}, -1)" class="btn-cantidad">−</button>
                            <span class="cantidad-numero">${item.cantidad}</span>
                            <button onclick="cambiarCantidad(${i}, 1)" class="btn-cantidad">+</button>
                        </div>
                        <div class="precio-item">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
                        <button class="btn-eliminar-texto" onclick="eliminarProducto(${i})">Eliminar</button>
                    </div>`;
            });
            if (subtotalPagina) subtotalPagina.textContent = "S/ " + total.toFixed(2);
        }

        window.cambiarCantidad = (i, val) => {
            carrito[i].cantidad += val;
            if (carrito[i].cantidad < 1) carrito[i].cantidad = 1;
            guardarCarrito();
            renderPageCart();
        };

        renderPageCart();
    }
}

// Inicializar cabecera
actualizarHeader();
actualizarCarritoLateral();

/* 6. Buscador */
const productosNombres = [
    "Samsung Galaxy S23", "Samsung A54", "iPhone 15", "Apple iPhone 15 Pro",
    "Apple iPhone 17 Pro", "Xiaomi Redmi Note 12", "Xiaomi POCO X7 Pro",
    "Motorola Edge 40", "Motorola Razr 60 Ultra"
];

const inputBuscador = document.querySelector(".header-search input");
const contenedorSearch = document.querySelector(".header-search");
const boxSugerencias = document.createElement("div");
boxSugerencias.className = "suggestions-box";
if (contenedorSearch) contenedorSearch.appendChild(boxSugerencias);

if (inputBuscador) {
    inputBuscador.addEventListener("input", (e) => {
        const texto = e.target.value.toLowerCase().trim();
        boxSugerencias.innerHTML = "";

        if (document.querySelector(".filtros-sidebar") && typeof aplicarFiltros === "function") aplicarFiltros();

        if (texto.length === 0) { boxSugerencias.style.display = "none"; return; }

        const coincidencias = productosNombres.filter(n => n.toLowerCase().includes(texto));

        if (coincidencias.length > 0) {
            boxSugerencias.style.display = "block";
            coincidencias.forEach(nombre => {
                const item = document.createElement("div");
                item.className = "suggestion-item";
                const regex = new RegExp(`(${texto})`, "gi");
                const nombreResaltado = nombre.replace(regex, "<strong>$1</strong>");
                item.innerHTML = `${nombreResaltado}`;

                item.addEventListener("click", () => {
                    inputBuscador.value = nombre;
                    boxSugerencias.style.display = "none";
                    window.location.href = `catalogo.html?busqueda=${encodeURIComponent(nombre)}`;
                });
                boxSugerencias.appendChild(item);
            });
        } else {
            boxSugerencias.style.display = "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (!contenedorSearch.contains(e.target)) boxSugerencias.style.display = "none";
    });

    inputBuscador.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const txt = inputBuscador.value;
            if (txt) window.location.href = `catalogo.html?busqueda=${encodeURIComponent(txt)}`;
        }
    });
}

/* 7. WhatsApp */
const btnFinalizar = document.querySelector(".btn-carrito.azul.oscuro") || document.querySelector(".btn-finalizar");
if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire({ title: 'Carrito vacío', icon: 'warning', confirmButtonColor: '#007bff' });
            return;
        }
        const tel = "51942147402";
        let msg = "Hola IPLLACIX, pedido:%0A%0A";
        let total = 0;
        carrito.forEach(p => {
            let sub = p.precio * p.cantidad;
            total += sub;
            msg += `- ${p.cantidad} x ${p.nombre} (S/ ${sub.toFixed(2)})%0A`;
        });
        msg += `%0A*TOTAL: S/ ${total.toFixed(2)}*`;
        const url = `https://wa.me/${tel}?text=${msg}`;

        Swal.fire({
            title: '¿Enviar pedido?', icon: 'question', showCancelButton: true,
            confirmButtonColor: '#25D366', confirmButtonText: 'Sí, enviar'
        }).then((result) => {
            if (result.isConfirmed) window.open(url, '_blank');
        });
    });
}

/* 8. Filtros */
const checkboxes = document.querySelectorAll(".filtro-opcion input[type='checkbox']");
if (checkboxes.length > 0) {
    checkboxes.forEach(cb => cb.addEventListener("change", aplicarFiltros));
}

function aplicarFiltros() {
    const marcas = Array.from(document.querySelectorAll("input[data-type='marca']:checked")).map(cb => cb.value.toLowerCase());
    const precios = Array.from(document.querySelectorAll("input[data-type='precio']:checked")).map(cb => ({
        min: parseFloat(cb.getAttribute("data-min")), max: parseFloat(cb.getAttribute("data-max"))
    }));
    const texto = inputBuscador ? inputBuscador.value.toLowerCase().trim() : "";
    const tarjetas = document.querySelectorAll(".producto-card");

    tarjetas.forEach(card => {
        const titulo = card.querySelector("h3").textContent.toLowerCase();
        const precioElem = card.querySelector(".precio-oferta") ? card.querySelector(".precio-oferta") : card.querySelector(".producto-precio");
        if (!precioElem) return;

        const precioNum = limpiarPrecio(precioElem.textContent);

        const pasaMarca = marcas.length === 0 || marcas.some(m => titulo.includes(m));
        const pasaPrecio = precios.length === 0 || precios.some(r => precioNum >= r.min && precioNum <= r.max);
        const pasaBusqueda = texto === "" || titulo.includes(texto);

        if (pasaMarca && pasaPrecio && pasaBusqueda) card.style.display = "";
        else card.style.display = "none";
    });
}

/* 9. Contacto */
const formC = document.getElementById("formContacto");
if (formC) {
    document.getElementById("nombre").addEventListener("input", (e) => e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, ""));
    document.getElementById("telefono").addEventListener("input", (e) => e.target.value = e.target.value.replace(/[^0-9]/g, ""));
    formC.addEventListener("submit", (e) => {
        e.preventDefault();
        Swal.fire('Enviado', '', 'success');
        formC.reset();
    });
}

/* 10. Inicialización y Carrusel */
document.addEventListener("DOMContentLoaded", () => {
    // Detectar filtros URL
    const params = new URLSearchParams(window.location.search);
    const marca = params.get("marca") ? params.get("marca").toLowerCase() : null;
    const busqueda = params.get("busqueda");

    if (marca) {
        const cb = document.querySelector(`input[data-type='marca'][value='${marca}']`);
        if (cb) cb.checked = true;
    }
    if (busqueda && inputBuscador) inputBuscador.value = busqueda;

    if (marca || busqueda) {
        setTimeout(() => {
            if (document.querySelector(".filtros-sidebar") && typeof aplicarFiltros === "function") aplicarFiltros();
        }, 100);
    }
    
    // Iniciar Carrusel si existe
    initCarousel();
});

function initCarousel() {
    const slides = document.querySelectorAll('.carousel .slide');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.opacity = '0';
        });

        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add('active');
        slides[currentSlide].style.opacity = '1';
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSlide(currentSlide + 1);
            resetTimer();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showSlide(currentSlide - 1);
            resetTimer();
        });
    }

    function startTimer() {
        slideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function resetTimer() {
        clearInterval(slideInterval);
        startTimer();
    }

    slides.forEach(s => s.style.animation = 'none');
    showSlide(0);
    startTimer();
}