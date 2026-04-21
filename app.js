document.addEventListener('DOMContentLoaded', () => {
    let dadosGlobais = [];
    let chassisAtivo = null;
    let versaoAtiva = null;

    // Elementos DOM
    const contChassis = document.getElementById('container-chassis');
    const contVersao = document.getElementById('container-versao');
    const secVersao = document.getElementById('seccao-versao');
    const divResultado = document.getElementById('resultado');
    const modal = document.getElementById('modal-detalhes');

    // 1. Carregar a Base de Dados
    fetch('dados.json')
        .then(res => res.json())
        .then(dados => {
            dadosGlobais = dados;
            renderizarFiltroChassis();
        })
        .catch(err => console.error("Erro ao carregar JSON:", err));

    // 2. Gerar Botões de Chassis
    function renderizarFiltroChassis() {
        const listaChassis = [...new Set(dadosGlobais.map(d => d.chassis))].sort();
        contChassis.innerHTML = listaChassis.map(c => `
            <button class="btn-selecao" onclick="cliqueChassis('${c}')" id="btn-ch-${c}">${c}</button>
        `).join('');
    }

    // 3. Lógica ao selecionar Chassis
    window.cliqueChassis = (chassis) => {
        chassisAtivo = chassis;
        versaoAtiva = null; // Resetar versão selecionada
        
        // Estética dos botões
        document.querySelectorAll('#container-chassis .btn-selecao').forEach(b => b.classList.remove('ativo'));
        document.getElementById(`btn-ch-${chassis}`).classList.add('ativo');

        // Filtrar versões disponíveis para este chassis
        const versoes = [...new Set(
            dadosGlobais.filter(d => d.chassis === chassis).map(d => d.versao)
        )].sort();

        secVersao.classList.remove('hidden');
        contVersao.innerHTML = versoes.map(v => `
            <button class="btn-selecao" onclick="cliqueVersao('${v}')" id="btn-ver-${v}">${v}</button>
        `).join('');

        renderizarCards();
    };

    // 4. Lógica ao selecionar Versão
    window.cliqueVersao = (versao) => {
        versaoAtiva = versao;
        document.querySelectorAll('#container-versao .btn-selecao').forEach(b => b.classList.remove('ativo'));
        document.getElementById(`btn-ver-${versao}`).classList.add('ativo');
        renderizarCards();
    };

    // 5. Renderizar os Cartões
    function renderizarCards() {
        let filtrados = dadosGlobais.filter(d => d.chassis === chassisAtivo);
        if (versaoAtiva) {
            filtrados = filtrados.filter(d => d.versao === versaoAtiva);
        }

        divResultado.innerHTML = filtrados.map(c => `
            <div class="card">
                <h3>${c.serie} ${c.versao}</h3>
                <div class="detalhe-rapido"><span>Chassis:</span> <strong>${c.chassis}</strong></div>
                <div class="detalhe-rapido"><span>Motor:</span> <strong>${c.motor}</strong></div>
                <div class="detalhe-rapido"><span>Combustível:</span> <strong>${c.combustivel}</strong></div>
                <button class="btn-ver-mais" onclick="abrirDetalhes('${c.id}')">VER MAIS</button>
            </div>
        `).join('');
    }

    // 6. Modal "Ver Mais" - Mapeia todas as colunas automaticamente
    window.abrirDetalhes = (id) => {
        const item = dadosGlobais.find(v => v.id === id);
        if (!item) return;

        document.getElementById('modal-titulo').innerText = `${item.serie} ${item.versao}`;
        const corpo = document.getElementById('modal-corpo');

        let tabelaHtml = `<table class="tabela-detalhes">`;
        
        // Loop por todas as propriedades do objeto no JSON
        Object.entries(item).forEach(([coluna, valor]) => {
            // Ignorar apenas o ID interno para não poluir
            if (coluna === 'id') return;

            // Formata o nome da coluna: remove underscores e coloca em maiúsculas
            const labelFormatada = coluna.replace(/_/g, ' ');
            
            tabelaHtml += `
                <tr>
                    <td class="label-coluna">${labelFormatada}</td>
                    <td class="valor-coluna">${valor || '---'}</td>
                </tr>
            `;
        });

        tabelaHtml += `</table>`;
        corpo.innerHTML = tabelaHtml;
        modal.style.display = 'flex';
    };

    window.fecharModal = () => {
        modal.style.display = 'none';
    };

    // Fechar modal ao clicar fora dele
    window.onclick = (event) => {
        if (event.target == modal) fecharModal();
    };
});
