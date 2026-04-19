document.addEventListener('DOMContentLoaded', () => {
    
    let dadosGlobais = []; 
    
    // Estado dos filtros
    let filtrosAtivos = {
        combustivel: [],
        tracao: []
    };

    fetch('dados.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error('Falha ao carregar a base de dados.');
            return resposta.json();
        })
        .then(dados => {
            dadosGlobais = dados; 
            processarFiltrosEPesquisa(); // Desenha a grelha inicial
        })
        .catch(erro => {
            document.getElementById('catalogo').innerHTML = `<p class="erro-msg">Erro: ${erro.message}</p>`;
        });

    // 1. EVENTOS DOS BOTÕES DE FILTRO
    document.querySelectorAll('.btn-filtro').forEach(botao => {
        botao.addEventListener('click', (evento) => {
            const btn = evento.target;
            const categoria = btn.dataset.categoria;
            const valor = btn.dataset.valor;

            // Alterna o aspeto visual do botão
            btn.classList.toggle('ativo');

            // Adiciona ou remove o valor da lista de filtros ativos
            if (filtrosAtivos[categoria].includes(valor)) {
                filtrosAtivos[categoria] = filtrosAtivos[categoria].filter(v => v !== valor);
            } else {
                filtrosAtivos[categoria].push(valor);
            }

            processarFiltrosEPesquisa();
        });
    });

    // 2. EVENTO DA BARRA DE PESQUISA DE TEXTO
    const caixaPesquisa = document.getElementById('caixa-pesquisa');
    caixaPesquisa.addEventListener('input', () => {
        processarFiltrosEPesquisa();
    });

    // 3. O "CÉREBRO": JUNTA TEXTO E BOTÕES
    function processarFiltrosEPesquisa() {
        const termoBusca = caixaPesquisa.value.toLowerCase().trim();
        
        const dadosFiltrados = dadosGlobais.filter(carro => {
            
            // Regra 1: Passa no teste de texto livre?
            const todosOsValores = Object.values(carro).join(' ').toLowerCase();
            const passaTexto = todosOsValores.includes(termoBusca);

            // Regra 2: Passa no teste dos botões de combustível?
            const tipoC = (carro.combustivel || '').toLowerCase();
            const passaCombustivel = filtrosAtivos.combustivel.length === 0 || filtrosAtivos.combustivel.some(f => tipoC.includes(f));

            // Regra 3: Passa no teste dos botões de tração?
            const tipoT = (carro.tracao || '').toLowerCase();
            const passaTracao = filtrosAtivos.tracao.length === 0 || filtrosAtivos.tracao.some(f => tipoT.includes(f));

            // Só mostra o carro se passar em TODAS as regras
            return passaTexto && passaCombustivel && passaTracao;
        });

        renderizarCatalogo(dadosFiltrados);
    }

    // 4. FUNÇÕES VISUAIS E DE RENDERIZAÇÃO
    function obterClasseCombustivel(tipo) {
        const t = (tipo || '').toLowerCase();
        if (t.includes('gasolina')) return 'tag-gasolina';
        if (t.includes('diesel')) return 'tag-diesel';
        if (t.includes('phev') || t.includes('plug-in')) return 'tag-phev';
        if (t.includes('elétrico') || t.includes('bev')) return 'tag-bev';
        return '';
    }

    function renderizarCatalogo(viaturas) {
        const catalogo = document.getElementById('catalogo');
        catalogo.innerHTML = ''; 
        
        if (viaturas.length === 0) {
            catalogo.innerHTML = '<p class="aviso-vazio">Nenhuma viatura corresponde aos filtros aplicados.</p>';
            return;
        }

        const carrosAgrupados = viaturas.reduce((grupos, carro) => {
            const chave = carro.chassis;
            if (!grupos[chave]) { grupos[chave] = []; }
            grupos[chave].push(carro);
            return grupos;
        }, {});

        for (const [chassis, carros] of Object.entries(carrosAgrupados)) {
            const nomeSerie = carros[0].serie; 
            let htmlSecao = `<div class="grupo-chassis"><h2>${nomeSerie} (${chassis})</h2><div class="grid">`;

            carros.forEach(carro => {
                const classeCor = obterClasseCombustivel(carro.combustivel);
                const tipoC = (carro.combustivel || '').toLowerCase();
                
                let infoHtml = `
                    <p><strong>Motor:</strong> ${carro.motor || 'N/D'}</p>
                    <p><strong>Potência:</strong> ${carro.potencia || 'N/D'}</p>
                    <p><strong>0-100 km/h:</strong> ${carro.aceleracao_0_100 || 'N/D'}</p>
                    <p><strong>Tração:</strong> ${carro.tracao || 'N/D'}</p>
                    <p><strong>Consumo:</strong> ${carro.consumo || 'N/D'}</p>
                `;

                if (tipoC.includes('phev') || tipoC.includes('plug-in')) {
                    infoHtml += `
                        <p><strong>Autonomia Elétrica:</strong> ${carro.autonomia_eletrica || 'N/D'}</p>
                        <p><strong>Bateria:</strong> ${carro.capacidade_bateria || 'N/D'}</p>
                    `;
                } else if (tipoC.includes('elétrico') || tipoC.includes('bev')) {
                    infoHtml += `
                        <p><strong>Autonomia:</strong> ${carro.autonomia_total || 'N/D'}</p>
                        <p><strong>Bateria:</strong> ${carro.capacidade_bateria || 'N/D'}</p>
                    `;
                }

                htmlSecao += `
                    <div class="cartao">
                        <span class="tag-combustivel ${classeCor}">${(carro.combustivel || 'N/D').toUpperCase()}</span>
                        <h3><span class="tag-motor">${carro.versao}</span></h3>
                        ${infoHtml}
                        <button class="btn-ver-mais" onclick="abrirModal('${carro.id}')">Ver Especificações Completas</button>
                    </div>
                `;
            });

            htmlSecao += `</div></div>`;
            catalogo.innerHTML += htmlSecao;
        }
    }

    // 5. MODAL DETALHES
    const modal = document.getElementById('modal');
    const btnFechar = document.getElementById('btn-fechar-modal');

    window.abrirModal = function(idCarro) {
        const carro = dadosGlobais.find(c => c.id === idCarro);
        if (!carro) return;

        document.getElementById('modal-titulo').innerText = `${carro.serie} ${carro.versao} (${carro.chassis})`;
        
        const listaDetalhes = document.getElementById('modal-lista-detalhes');
        listaDetalhes.innerHTML = ''; 

        for (const [chave, valor] of Object.entries(carro)) {
            if (['id', 'serie', 'chassis', 'versao'].includes(chave)) continue;
            const chaveFormatada = chave.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            listaDetalhes.innerHTML += `<tr><th>${chaveFormatada}</th><td><strong>${valor || 'N/D'}</strong></td></tr>`;
        }
        modal.style.display = 'flex';
    };

    btnFechar.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) modal.style.display = 'none';
    });
});
