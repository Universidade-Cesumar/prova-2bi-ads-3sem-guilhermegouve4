const API_URL = 'https://6a2899564e1e783349a5b055.mockapi.io/api/v1/products';
const materials = [];

async function loadMaterials() {
  const response = await fetch(API_URL);
  const data = await response.json();

  materials.length = 0;
  materials.push(...data);

  const list = document.getElementById('lista-materiais');
  list.innerHTML = '';

  materials.forEach(material => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${material.name}</td><td>${material.quantity}</td>`;
    list.appendChild(tr);
  });
}

async function registerMaterial() {
  const name = document.getElementById('input-nome').value.trim();
  const quantity = Number(document.getElementById('input-quantidade').value);

  if (!name || !quantity) return;

  const exists = materials.some(m => m.name === name);
  if (exists) {
    alert('Material já cadastrado.');
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, quantity }),
  });

  document.getElementById('input-nome').value = '';
  document.getElementById('input-quantidade').value = '';

  loadMaterials();
}

document.getElementById('btn-cadastrar').addEventListener('click', registerMaterial);

loadMaterials();
