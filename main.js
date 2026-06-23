const API_URL = 'https://6a2899564e1e783349a5b055.mockapi.io/api/v1/products';
const materials = [];

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  return quantidadeRetirada > 0 && quantidadeRetirada <= estoqueAtual;
}

async function loadMaterials() {
  const response = await fetch(API_URL);
  const data = await response.json();

  materials.length = 0;
  materials.push(...data);

  const list = document.getElementById('lista-materiais');
  list.innerHTML = '';

  materials.forEach(material => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${material.name}</td>
      <td>${material.quantity}</td>
      <td>
        <button class="btn-baixar" data-id="${material.id}" data-qty="${material.quantity}">Baixar</button>
        <button class="btn-excluir" data-id="${material.id}">Excluir</button>
      </td>
    `;
    list.appendChild(tr);
  });

  list.querySelectorAll('.btn-baixar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const amount = Number(document.getElementById('input-retirada').value);
      const currentStock = Number(btn.dataset.qty);

      if (!validarRetirada(currentStock, amount)) {
        alert('Quantidade inválida.');
        return;
      }

      await fetch(`${API_URL}/${btn.dataset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: currentStock - amount }),
      });

      loadMaterials();
    });
  });

  list.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
      loadMaterials();
    });
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

if (typeof fetch !== 'undefined') {
  document.getElementById('btn-cadastrar').addEventListener('click', registerMaterial);
  loadMaterials();
}
