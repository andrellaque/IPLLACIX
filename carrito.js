/* ===========================================
   CARRITO — GLOBAL (LÓGICA UNIFICADA)
=========================================== */

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

/* 1. FUNCIONES PRINCIPALES */
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

/* 2. EVENTOS DE BOTONES "COMPRAR" */
document.querySelectorAll(".btn-comprar").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".producto-card");
        const nombre = card.querySelector("h3").textContent;
        
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
        
        if (cartPanel) {
            cartOverlay.style.display = "block";
            cartPanel.classList.add("open");
        }
    });
});

/* 3. ABRIR / CERRAR CARRITO LATERAL */
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

/* 4. ACCIONES DEL CARRITO */
window.eliminarProducto = function(i) {
    carrito.splice(i, 1);
    guardarCarrito();
};

if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire({ title: 'Vacío', text: 'El carrito ya está vacío', icon: 'info', confirmButtonColor: '#007bff' });
            return;
        }
        Swal.fire({
            title: '¿Estás seguro?', text: "Se eliminarán todos los productos.", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, vaciarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                carrito = [];
                guardarCarrito();
                Swal.fire({ title: '¡Vaciado!', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    });
}

/* 5. LÓGICA PÁGINA CARRITO.HTML */
if (document.getElementById("carrito-items")) {
    const listaPagina = document.getElementById("carrito-items"); 
    const subtotalPagina = document.getElementById("subtotal");

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
                        <div class="item-info"><h3>${item.nombre}</h3></div>
                        <div class="cantidad-box">
                            <button onclick="cambiarCantidad(${i}, -1)" class="btn-cantidad">−</button>
                            <span class="cantidad-numero">${item.cantidad}</span>
                            <button onclick="cambiarCantidad(${i}, 1)" class="btn-cantidad">+</button>
                        </div>
                        <div class="precio-item">S/ ${(item.precio * item.cantidad).toFixed(2)}</div>
                        <span class="btn-eliminar" onclick="eliminarProducto(${i})">×</span>
                    </div>`;
            });
            subtotalPagina.textContent = "S/ " + total.toFixed(2);
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

// Inicializar
actualizarHeader();
actualizarCarritoLateral();

/* 6. BUSCADOR */
const inputBuscador = document.querySelector(".header-search input");

if (inputBuscador) {
    inputBuscador.addEventListener("input", (e) => {
        // Si estamos en catálogo, usamos los filtros combinados
        if (typeof aplicarFiltros === "function") {
             aplicarFiltros();
        } else {
             // Búsqueda simple para index.html
             const textoBusqueda = e.target.value.toLowerCase();
             const tarjetas = document.querySelectorAll(".producto-card");
             tarjetas.forEach(card => {
                const titulo = card.querySelector("h3").textContent.toLowerCase();
                if (titulo.includes(textoBusqueda)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
             });
        }
    });
}

/* 7. FINALIZAR COMPRA (WHATSAPP) */
const btnFinalizar = document.querySelector(".btn-carrito.azul.oscuro") || document.querySelector(".btn-finalizar");

if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        if (carrito.length === 0) {
            Swal.fire({ title: 'Carrito vacío', icon: 'warning', confirmButtonColor: '#007bff' });
            return;
        }
        const numeroTelefono = "51942147402"; 
        let mensaje = "Hola IPLLACIX, deseo realizar el siguiente pedido:%0A%0A";
        let total = 0;

        carrito.forEach(producto => {
            const subtotal = producto.precio * producto.cantidad;
            total += subtotal;
            mensaje += `- ${producto.cantidad} x ${producto.nombre} (S/ ${subtotal.toFixed(2)})%0A`;
        });

        mensaje += `%0A-----------------------------------%0A`;
        mensaje += `*TOTAL A PAGAR: S/ ${total.toFixed(2)}*%0A%0A`;
        mensaje += `Quedo atento para coordinar el pago y el envío. Gracias.`;

        const url = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
        
        Swal.fire({
            title: '¿Procesar pedido?', text: "Te enviaremos a WhatsApp.", icon: 'question',
            showCancelButton: true, confirmButtonColor: '#25D366', confirmButtonText: 'Sí, enviar'
        }).then((result) => {
            if (result.isConfirmed) window.open(url, '_blank');
        });
    });
}

/* 8. FILTROS (MARCA + PRECIO) */
const todosLosCheckboxes = document.querySelectorAll(".filtro-opcion input[type='checkbox']");

if (todosLosCheckboxes.length > 0) {
    todosLosCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", aplicarFiltros);
    });
}

function aplicarFiltros() {
    const marcasSeleccionadas = Array.from(document.querySelectorAll("input[data-type='marca']:checked"))
                                     .map(cb => cb.value.toLowerCase());

    const preciosSeleccionados = Array.from(document.querySelectorAll("input[data-type='precio']:checked"))
                                      .map(cb => ({
                                          min: parseFloat(cb.getAttribute("data-min")),
                                          max: parseFloat(cb.getAttribute("data-max"))
                                      }));
    
    const textoBusqueda = inputBuscador ? inputBuscador.value.toLowerCase() : "";
    const tarjetas = document.querySelectorAll(".producto-card");

    tarjetas.forEach(card => {
        const titulo = card.querySelector("h3").textContent.toLowerCase();
        const precioTexto = card.querySelector(".producto-precio").textContent;
        let precioLimpio = precioTexto.replace("S/.", "").replace("S/", "").replace(",", "").trim();
        const precioNumerico = parseFloat(precioLimpio);

        const pasaMarca = marcasSeleccionadas.length === 0 || marcasSeleccionadas.some(m => titulo.includes(m));
        
        const pasaPrecio = preciosSeleccionados.length === 0 || preciosSeleccionados.some(r => {
            return precioNumerico >= r.min && precioNumerico <= r.max;
        });

        const pasaBusqueda = textoBusqueda === "" || titulo.includes(textoBusqueda);

        if (pasaMarca && pasaPrecio && pasaBusqueda) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

/* 9. VALIDACIÓN CONTACTO */
const formContacto = document.getElementById("formContacto");
if (formContacto) {
    const inputNombre = document.getElementById("nombre");
    const inputTelefono = document.getElementById("telefono");
    
    inputNombre.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    });

    inputTelefono.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
    });

    formContacto.addEventListener("submit", (e) => {
        e.preventDefault();
        Swal.fire({ title: '¡Enviado!', text: 'Recibimos tus datos.', icon: 'success', confirmButtonColor: '#007bff' });
        formContacto.reset();
    });
}

/* ===========================================
   CARRUSEL MANUAL (FLECHAS) - AGREGADO
=========================================== */
document.addEventListener("DOMContentLoaded", function() {
    const carouselContainer = document.getElementById('carousel-container');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');

    if (!carouselContainer || !prevBtn || !nextBtn) return; // Salir si no se encuentran los elementos

    let slides = Array.from(carouselContainer.children); // Convertir HTMLCollection a Array
    let currentSlideIndex = 0;
    let autoSlideInterval; // Para guardar el ID del intervalo automático

    // Función para mostrar un slide específico
    function showSlide(index) {
        // Detener la animación CSS temporalmente para el cambio manual
        slides.forEach(slide => {
            slide.style.animation = 'none'; // Desactiva la animación
            slide.style.opacity = '0';
            slide.style.pointerEvents = 'none';
        });

        currentSlideIndex = (index + slides.length) % slides.length; // Asegura que el índice esté dentro de los límites
        
        slides[currentSlideIndex].style.animation = 'none'; // Por si acaso
        slides[currentSlideIndex].style.opacity = '1';
        slides[currentSlideIndex].style.pointerEvents = 'auto'; // Permitir clic
        
        // Reiniciar la animación CSS después de un breve momento
        // para que la animación automática pueda continuar desde este slide
        setTimeout(() => {
            slides.forEach((slide, i) => {
                slide.style.animation = ''; // Restaura la animación CSS original
                // Asegura que los slides ocultos vuelvan a tener pointer-events: none por la animación
            });
            // Opcional: Reiniciar el intervalo automático inmediatamente si se quiere
            // resetAutoSlide();
        }, 50); // Un pequeño retraso para asegurar que el DOM se actualice antes de restaurar la animación
    }

    // Lógica para el paso automático de slides (igual que tu CSS, pero controlado por JS)
    function autoSlide() {
        autoSlideInterval = setInterval(() => {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            showSlide(currentSlideIndex);
        }, 4000); // 4 segundos, igual que tu CSS animation-delay
    }

    // Reiniciar el contador automático
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        autoSlide();
    }

    // Eventos para los botones de flecha
    prevBtn.addEventListener('click', () => {
        showSlide(currentSlideIndex - 1);
        resetAutoSlide(); // Reinicia el contador automático al hacer clic manual
    });

    nextBtn.addEventListener('click', () => {
        showSlide(currentSlideIndex + 1);
        resetAutoSlide(); // Reinicia el contador automático al hacer clic manual
    });

    // Inicializar el carrusel (asegurarse de que el primer slide esté visible al cargar)
    showSlide(0); 
    autoSlide(); // Iniciar la rotación automática
});