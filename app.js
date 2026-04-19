document.addEventListener('DOMContentLoaded', () => {
    
    let dadosGlobais = []; 

    // 1. CARREGAR DADOS
    fetch('dados.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error('Falha ao carregar a base de dados.');
            return resposta.json();
        })
        .then(dados => {
            dadosGlobais = dados; 
            renderizarCatalogo(dadosGlobais); 
        })
        .catch(erro => {
            document.getElementById('catalogo').innerHTML = `<p class="erro-msg">Erro: ${erro.message}</p>`;
        });

    // 2. MOTOR DE PESQUISA
    const caixaPesquisa = document.getElementById('caixa-pesquisa');
    
    caixaPesquisa.addEventListener('input', (evento) => {
        const termoBusca = evento.target.value.toLowerCase().trim();
        
        const dadosFiltrados = dadosGlobais.filter(carro => {
            const textoCarro = `${carro.serie} ${carro.chassis} ${carro.versao} ${carro.motor} ${carro.combustivel}`.toLowerCase();
            return textoCarro.includes(termoBusca);
        });

        renderizarCatalogo(dadosFiltrados);
    });

    // 3. MOTOR DE RENDERIZAÇÃO DA GRELHA PRINCIPAL
    function renderizarCatalogo(viaturas) {
        const catalogo = document.getElementById('catalogo');
        catalogo.innerHTML = ''; 
        
        if (viaturas.length === 0) {
            catalogo.innerHTML = '<p class="aviso-vazio">Nenhuma viatura corresponde aos critérios de pesquisa.</p>';
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
            
            let htmlSecao = `
                <div class="grupo-chassis">
                    <h2>${nomeSerie} (${chassis})</h2>
                    <div class="grid">
            `;

            carros.forEach(carro => {
                htmlSecao += `
                    <div class="cartao">
                        <h3><span class="tag-motor">${carro.versao}</span></h3>
                        <p><strong>Motor:</strong> ${carro.motor}</p>
                        <p><strong>Combustível:</strong> ${carro.combustivel}</p>
                        <p><strong>Potência:</strong> ${carro.potencia}</p>
                        <p><strong>Tração:</strong> ${carro.tracao}</p>
                        <button class="btn-ver-mais" onclick="abrirModal('${carro.id}')">Ver Especificações Completas</button>
                    </div>
                `;
            });

            htmlSecao += `</div></div>`;
            catalogo.innerHTML += htmlSecao;
        }
    }

    // 4. LÓGICA DA JANELA MODAL (DETALHES)
    const modal = document.getElementById('modal');
    const btnFechar = document.getElementById('btn-fechar-modal');

    // Função exposta globalmente para abrir a janela
    window.abrirModal = function(idCarro) {
        const carro = dadosGlobais.find(c => c.id === idCarro);
        if (!carro) return;

        document.getElementById('modal-titulo').innerText = `${carro.serie} ${carro.versao} (${carro.chassis})`;
        
        const listaDetalhes = document.getElementById('modal-lista-detalhes');
        listaDetalhes.innerHTML = ''; 

        for (const [chave, valor] of Object.entries(carro)) {
            // Esconde campos de sistema da visualização do utilizador
            if (chave === 'id' || chave === 'serie' || chave === 'chassis' || chave === 'versao') continue;

            // Transforma "peso_tara_kg" em "Peso Tara Kg"
            const chaveFormatada = chave.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

            listaDetalhes.innerHTML += `
                <tr>
                    <th>${chaveFormatada}</th>
                    <td><strong>${valor || 'N/D'}</strong></td>
                </tr>
            `;
        }

        modal.style.display = 'flex';
    };

    // Fechar modal no botão X
    btnFechar.addEventListener('click', () => modal.style.display = 'none');
    
    // Fechar modal clicando fora da caixa branca
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) modal.style.display = 'none';
    });
});
