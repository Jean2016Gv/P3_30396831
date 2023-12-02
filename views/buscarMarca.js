const marcaFilterForm = document.getElementById('marca-filter-form');
const productsContainer = document.getElementById('products');
const products = [
  {
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },
  {
    name: 'BLACK+DECKER Dustbuster AdvancedClean Aspiradora de mano inalámbrica para mascotas',
    marca: 'Black + Decker'
  },
  {
    name: 'Shark CH701 Cyclone PET - Aspiradora de mano con pelo PetExtract',
    marca: 'Shark'
  },{
    name: 'iRobot Roomba - Robot aspiradora con conectividad Wi-Fi',
    marca: '¡Robot'
  },
  {
    name: 'Barrido robot con protección inteligente de sensor',
    marca: 'Shark'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },{
    name: 'Aspiradora de mano inalámbrica de Litio Black + Decker CHV1410L',
    marca: 'Black + Decker'
  },
  {
    name: 'Bisell Aeroslim - Aspiradora de mano inalámbrica de iones de litio',
    marca: 'Bissell'
  },
];

marcaFilterForm.addEventListener("click", filterByMarca);

function filterByMarca() {
  const selectedMarcas = Array.from(marcaFilterForm.querySelectorAll('input[name=marca]:checked')).map(checkbox => checkbox.value);

  productsContainer.innerHTML = '';

  products.forEach(product => {
    if(selectedMarcas.includes(product.marca) || selectedMarcas.length === 0) {
      renderProduct(product);
    }
  });
}
