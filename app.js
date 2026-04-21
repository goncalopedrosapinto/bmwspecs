document.addEventListener('DOMContentLoaded', () => {
    let dadosGlobais = [];
    let chassisSelecionado = null;
    let versaoSelecionada = null;

    // Elementos
    const containerChassis = document.getElementById('container-chassis');
    const containerVersao = document.getElementById('container-versao');
    const seccaoVersao = document.getElementById('seccao-versao');
    const displayResultado = document.getElementById('resultado');

    // 1. Carregar Dados
    fetch('dados.json')
        .then(res => res.json())
        .then(dados => {
            dadosGlobais = dados;
            renderizarChassis();
        });

    // 2. Renderizar botões de Chassis
    function renderizarChassis() {
        const chassisUnicos = [...new Set(dadosGlobais.map(d => d.chassis))].sort();
        containerChassis.innerHTML = chassisUnicos.map(c => `
            <button class="btn-selecao" onclick="selecionarChassis('${c}')" id="btn-ch-${c}">${c}</button>
        `).join('');
    }

    // 3. Ao clicar num Chassis
    window.selecionarChassis = (chassis) => {
        chassisSelecionado = chassis;
        versaoSelecionada = null; // Reset motorização ao mudar chassis
        
        // UI: Marcar ativo
        document.querySelectorAll('#container-chassis .btn-selecao').forEach(b => b.classList.remove('ativo'));
        document.getElementById(`btn-ch-${chassis}`).classList.add('ativo');

        // Mostrar motorizações desse chassis
        const versoesDisponiveis = [...new Set(
            dadosGlobais.filter(d => d.chassis === chassis).map(d => d.versao)
        )].sort();

        seccaoVersao.classList.remove('hidden');
        containerVersao.innerHTML = versoesDisponiveis.map(v => `
            <button class="btn-selecao" onclick="selecionarVersao('${v}')" id="btn-ver-${v}">${v}</button>
        `).join('');
        
        renderizarCards();
    };

    // 4. Ao clicar numa Versão
    window.selecionarVersao = (versao) => {
        versaoSelecionada = versao;

        // UI: Marcar ativo
        document.querySelectorAll('#container-versao .btn-selecao').forEach(b => b.classList.remove('ativo'));
        document.getElementById(`btn-ver-${versao}`).classList.add('ativo');

        renderizarCards();
    };

    // 5. Mostrar Resultados
    function renderizarCards() {
        let filtrados = dadosGlobais.filter(d => d.chassis === chassisSelecionado);
        
        if (versaoSelecionada) {
            filtrados = filtrados.filter(d => d.versao === versaoSelecionada);
        }

        displayResultado.innerHTML = filtrados.map(c => `
            <div class="card">
                <h3>${c.serie} ${c.versao}</h3>
                <div class="detalhe"><span>Chassis:</span> <strong>${c.chassis}</strong></div>
                <div class="detalhe"><span>Motor:</span> <strong>${c.motor}</strong></div>
                <div class="detalhe"><span>Combustível:</span> <strong>${c.combustivel}</strong></div>
                <div class="detalhe"><span>Tração:</span> <strong>${c.tracao}</strong></div>
            </div>
        `).join('');
    }
});
