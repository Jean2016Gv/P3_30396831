
document.addEventListener("DOMContentLoaded", () => {
    const coloresSelect = document.getElementById('colores');
    const productos = document.querySelectorAll('.producto');
    const desactivarColorBtn = document.getElementById('desactivarColor');
  
    coloresSelect.addEventListener('change', filtrarPorColor);
    desactivarColorBtn.addEventListener('click', desactivarFiltro);

  
    function filtrarPorColor() {
      const colorSeleccionado = coloresSelect.value;
  
      productos.forEach(producto => {
        const colorProducto = obtenerColorDelProducto(producto);
        
        if (colorSeleccionado === 'todos' || colorSeleccionado === colorProducto) {
          producto.style.display = 'block';
        } else {
          producto.style.display = 'none';
        }
      });
    }
  
    function obtenerColorDelProducto(producto) {
      const titulo = producto.querySelector('.producto-titulo').textContent.toLowerCase();
      if (titulo.includes('azul')) {
        return 'azul';
      } else if (titulo.includes('negro')) {
        return 'negro';
      } else if (titulo.includes('rosado')) {
        return 'rosado';
      } else if (titulo.includes('blanco')) {
        return 'blanco';
      } else if (titulo.includes('amarillo')) {
        return 'amarillo';
    } else if (titulo.includes('morado')) {
        return 'morado';
      } else if (titulo.includes('rojo')) {
        return 'rojo';
      } else {
        return 'otros';
      }
    }
  });

