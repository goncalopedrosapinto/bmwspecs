let dadosGlobais = [];

// Carregamento Inicial
fetch('dados.json')
  .then(res => res.json())
  .then(dados => {
    dadosGlobais = dados;
    renderizarLista(dadosGlobais);
  });

// Pesquisa
document.getElementById('pesquisa').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase();
  const filtrados = dadosGlobais.filter(c => {
    return JSON.stringify(c).toLowerCase().includes(termo);
  });
  renderizarLista(filtrados);
});

function renderizarLista(carros) {
  const lista = document.getElementById('catalogo');
  lista.innerHTML = '';
  
  carros.forEach(carro => {
    const div = document.createElement('div');
    div.className = 'cartao';
    div.onclick = () => verDetalhes(carro.id);
    div.innerHTML = `
      <span class="tag ${carro.combustivel}">${carro.combustivel}</span>
      <div style="font-size: 0.8rem; color: #6b7280">${carro.chassis}</div>
      <h3 style="margin: 0.5rem 0">${carro.versao}</h3>
      <div style="font-size: 0.9rem">Série: ${carro.serie}</div>
    `;
    lista.appendChild(div);
  });
}

function verDetalhes(id) {
  const carro = dadosGlobais.find(c => c.id === id);
  if (!carro) return;

  // Esconder lista, mostrar detalhes
  document.getElementById('vista-lista').style.display = 'none';
  const vistaD = document.getElementById('vista-detalhes');
  vistaD.style.display = 'block';
  window.scrollTo(0, 0);

  document.getElementById('detalhe-titulo').innerText = `${carro.serie} ${carro.versao} (${carro.chassis})`;
  
  const tabela = document.getElementById('corpo-tabela');
  tabela.innerHTML = '';

  // O "CORAÇÃO": Mostra todas as linhas que o Python extraiu do Excel
  for (const [label, valor] of Object.entries(carro.detalhes_completos)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="spec-label">${label}</td>
      <td class="spec-value">${valor}</td>
    `;
    tabela.appendChild(tr);
  }
}

function voltarParaLista() {
  document.getElementById('vista-detalhes').style.display = 'none';
  document.getElementById('vista-lista').style.display = 'block';
}
