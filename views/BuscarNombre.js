//Buscar nombre del producto

const buscador = document.getElementById('buscador');
const productos = document.getElementsByClassName('producto');

buscador.addEventListener('input', function() {
    const filtro = buscador.value.toLowerCase();

    for (let i = 0; i < productos.length; i++) {
        const titulo = productos[i].getElementsByClassName('producto-titulo')[0].innerText.toLowerCase();

        if (titulo.includes(filtro)) {
            productos[i].style.display = 'block';
        } else {
            productos[i].style.display = 'none';
        }
    }
});

//Buscar categoria
