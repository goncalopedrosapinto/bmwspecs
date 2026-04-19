let baseDados = [];

// Carregamento da Base de Dados
fetch('dados.json')
  .then(response => response.json())
  .then(data => {
    baseDados = data;
    renderizarCatalogo(baseDados);
  });

// Motor de Pesquisa
document.getElementById('input-pesquisa').addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase();
  const resultados = baseDados.filter(v => 
    JSON.stringify(v).toLowerCase().includes(termo)
  );
  renderizarCatalogo(resultados);
});

function renderizarCatalogo(lista) {
  const container = document.getElementById('catalogo-grid');
  container.innerHTML = '';
  
  lista.forEach(carro => {
    const card = document.createElement('div');
    card.className = 'cartao';
    card.onclick = () => mostrarPaginaDetalhes(carro.id);
    
    // Tenta encontrar campos de resumo para o cartão
    const motor = carro.specs["Descrição do motor, "] || carro.specs["Descrição do motor"] || "N/D";
    const potencia = carro.specs["Potência combinada comunicada, cv"] || carro.specs["Potência (potência nominal), cv"] || "N/D";

    card.innerHTML = `
      <span class="tag ${carro.tipo}">${carro.tipo}</span>
      <div style="font-size: 0.8rem; color: #9ca3af; font-weight: bold;">${carro.chassis}</div>
      <h2 style="margin: 0.4rem 0; font-size: 1.2rem;">${carro.versao}</h2>
      <div style="font-size: 0.85rem;">Motor: <strong>${motor}</strong></div>
      <div style="font-size: 0.85rem;">Potência: <strong>${potencia}</strong></div>
    `;
    container.appendChild(card);
  });
}

function mostrarPaginaDetalhes(id) {
  const v = baseDados.find(item => item.id === id);
  if (!v) return;

  document.getElementById('vista-lista').style.display = 'none';
  document.getElementById('vista-detalhes').style.display = 'block';
  window.scrollTo(0, 0);

  document.getElementById('detalhe-nome').innerText = v.versao;
  document.getElementById('detalhe-subtitulo').innerText = `${v.serie} | Chassis: ${v.chassis} | Tipo: ${v.tipo}`;
  
  const corpoTabela = document.getElementById('detalhe-tabela-corpo');
  corpoTabela.innerHTML = '';

  // Lógica de "Extração Total": mostra TODOS os campos que existem no objeto specs
  for (const [propriedade, valor] of Object.entries(v.specs)) {
    // Ignora linhas que seriam cabeçalhos vazios no Excel
    if (valor === " " || valor === "" || valor === "nan") continue;

    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td class="label-tecnica">${propriedade}</td>
      <td class="valor-tecnico">${valor}</td>
    `;
    corpoTabela.appendChild(linha);
  }
}

function fecharDetalhes() {
  document.getElementById('vista-detalhes').style.display = 'none';
  document.getElementById('vista-lista').style.display = 'block';
}
