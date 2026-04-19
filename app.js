let baseDados = [];

// Carregamento da Base de Dados
fetch('dados.json')
  .then(response => {
    if (!response.ok) throw new Error("Erro na rede ou ficheiro não encontrado");
    return response.json();
  })
  .then(data => {
    baseDados = data;
    renderizarCatalogo(baseDados);
  })
  .catch(error => {
    // Se falhar (ex: abrir sem servidor), mostra o erro diretamente no ecrã em vez de um ecrã branco
    document.getElementById('catalogo-grid').innerHTML = `
      <div style="color: #dc2626; font-weight: bold; padding: 2rem; border: 1px solid #dc2626; border-radius: 8px;">
        ERRO FATAL: O navegador bloqueou a leitura do ficheiro dados.json.<br><br>
        Causa provável: Estás a abrir o index.html com duplo clique no teu computador.<br>
        Solução: Faz upload dos 3 ficheiros para o teu repositório no GitHub e testa através do link do GitHub Pages.
      </div>
    `;
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
    
    // CORREÇÃO APLICADA: Usa os nomes gerados pelo Python (combustivel e detalhes_completos)
    const detalhes = carro.detalhes_completos || {};
    
    // Tenta encontrar campos de resumo (adaptado à linguagem exata dos teus Excel)
    const motor = detalhes["Descrição do motor, "] || detalhes["Descrição do motor"] || "N/D";
    const potencia = detalhes["Potência combinada comunicada, cv"] || detalhes["Potência (potência nominal pre/actualizada), cv"] || detalhes["Potência (potência nominal), cv"] || detalhes["Potência do sistema motor (acumulado), cv"] || "N/D";

    card.innerHTML = `
      <span class="tag ${carro.combustivel}">${carro.combustivel}</span>
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
  document.getElementById('detalhe-subtitulo').innerText = `${v.serie} | Chassis: ${v.chassis} | Tipo: ${v.combustivel}`;
  
  const corpoTabela = document.getElementById('detalhe-tabela-corpo');
  corpoTabela.innerHTML = '';

  const detalhes = v.detalhes_completos || {};

  // Extração Total: desenha todas as linhas extraídas do Excel
  for (const [propriedade, valor] of Object.entries(detalhes)) {
    // Ignora linhas vazias ou com "nan" (Not a Number) para manter a tabela limpa
    if (valor === " " || valor === "" || valor === "nan" || valor === "N/A") continue;

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
