const API_URL = 'https://6a2899564e1e783349a5b055.mockapi.io/api/v1/products';
const materials = [];

function validarRetirada(estoqueAtual, quantidadeRetirada) {
  return quantidadeRetirada > 0 && quantidadeRetirada <= estoqueAtual;
}

function renderMaterials(list) {
  const tbody = document.getElementById('lista-materiais');
  tbody.innerHTML = '';

  document.getElementById('total-itens').textContent = materials.length;

  if (list.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="3" class="empty">Nenhum material encontrado.</td>';
    tbody.appendChild(tr);
    return;
  }

  list.forEach(material => {
    const tr = document.createElement('tr');
    if (material.quantity < 10) tr.classList.add('estoque-critico');
    tr.innerHTML = `
      <td>${material.name}</td>
      <td>${material.quantity}</td>
      <td class="actions">
        <input type="number" class="row-retirada" placeholder="Qtd" min="1" />
        <button class="btn-baixar" data-id="${material.id}" data-qty="${material.quantity}">Retirar</button>
        <button class="btn-abastecer" data-id="${material.id}" data-qty="${material.quantity}">Abastecer</button>
        <button class="btn-excluir" data-id="${material.id}" title="Excluir"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-baixar').forEach(btn => {
    btn.addEventListener('click', async () => {
      const amount = Number(btn.closest('tr').querySelector('.row-retirada').value);
      const currentStock = Number(btn.dataset.qty);

      if (!validarRetirada(currentStock, amount)) {
        alert('Quantidade inválida.');
        return;
      }

      try {
        await fetch(`${API_URL}/${btn.dataset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: currentStock - amount }),
        });
        loadMaterials();
      } catch (err) {
        alert('Erro ao retirar do estoque.');
      }
    });
  });

  tbody.querySelectorAll('.btn-abastecer').forEach(btn => {
    btn.addEventListener('click', async () => {
      const amount = Number(btn.closest('tr').querySelector('.row-retirada').value);
      const currentStock = Number(btn.dataset.qty);

      if (amount <= 0) {
        alert('Quantidade inválida.');
        return;
      }

      try {
        await fetch(`${API_URL}/${btn.dataset.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: currentStock + amount }),
        });
        loadMaterials();
      } catch (err) {
        alert('Erro ao abastecer estoque.');
      }
    });
  });

  tbody.querySelectorAll('.btn-excluir').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Excluir este material?')) return;
      try {
        await fetch(`${API_URL}/${btn.dataset.id}`, { method: 'DELETE' });
        loadMaterials();
      } catch (err) {
        alert('Erro ao excluir material.');
      }
    });
  });
}

async function loadMaterials() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    materials.length = 0;
    materials.push(...data);

    const search = document.getElementById('input-busca').value.toLowerCase();
    const filtered = search
      ? materials.filter(m => m.name.toLowerCase().includes(search))
      : materials;

    renderMaterials(filtered);
  } catch (err) {
    alert('Erro ao carregar materiais.');
  }
}

async function registerMaterial() {
  const name = document.getElementById('input-nome').value.trim();
  const quantity = Number(document.getElementById('input-quantidade').value);

  if (!name || !quantity) return;

  if (materials.some(m => m.name === name)) {
    alert('Material já cadastrado.');
    return;
  }

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, quantity }),
    });

    document.getElementById('input-nome').value = '';
    document.getElementById('input-quantidade').value = '';

    loadMaterials();
  } catch (err) {
    alert('Erro ao cadastrar material.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-cadastrar').addEventListener('click', registerMaterial);
  document.getElementById('input-busca').addEventListener('input', loadMaterials);
  loadMaterials();
});
