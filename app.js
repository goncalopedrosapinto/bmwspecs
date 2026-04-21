document.addEventListener('DOMContentLoaded', () => {
    let dados = [];
    let selCat = null;
    let selChassis = null;
    let selMotor = null;

    const divChassis = document.getElementById('seccao-chassis');
    const divMotor = document.getElementById('seccao-motorizacao');
    const containerResultados = document.getElementById('resultado-lista');

    // Carregar dados do ficheiro JSON
    fetch('dados.json')
        .then(r => r.json())
        .then(d => {
            dados = d;
        });

    window.selecionarCategoria = (cat) => {
        selCat = cat;
        selChassis = null;
        selMotor = null;
        
        // UI
        atualizarAtivo('btn-group-categoria', `cat-${cat}`);
        divChassis.classList.remove('hidden');
        divMotor.classList.add('hidden');
        containerResultados.innerHTML = "";

        // Popular Chassis
        const chassisDisponiveis = [...new Set(dados.filter(x => x.categoria === cat).map(x => x.chassis))].sort();
        const html = chassisDisponiveis.map(c => `<button class="btn-opt" onclick="selecionarChassis('${c}')" id="ch-${c}">${c}</button>`).join('');
        document.getElementById('btn-group-chassis').innerHTML = html;
    };

    window.selecionarChassis = (chassis) => {
        selChassis = chassis;
        selMotor = null;

        atualizarAtivo('btn-group-chassis', `ch-${chassis}`);
        divMotor.classList.remove('hidden');

        // Popular Motorizações
        const motores = dados.filter(x => x.categoria === selCat && x.chassis === chassis);
        const html = motores.map(m => `<button class="btn-opt" onclick="selecionarMotor('${m.id}')" id="mot-${m.id}">${m.modelo_motorizacao}</button>`).join('');
        document.getElementById('btn-group-motorizacao').innerHTML = html;
        
        renderizarCards();
    };

    window.selecionarMotor = (id) => {
        selMotor = id;
        atualizarAtivo('btn-group-motorizacao', `mot-${id}`);
        renderizarCards();
    };

    function renderizarCards() {
        let filtrados = dados.filter(x => x.categoria === selCat && x.chassis === selChassis);
        if (selMotor) {
            filtrados = filtrados.filter(x => x.id === selMotor);
        }

        containerResultados.innerHTML = filtrados.map(v => `
            <div class="card-viatura">
                <h3>${v.modelo_motorizacao}</h3>
                <div class="resumo-item"><span class="resumo-label">Chassis</span><span class="resumo-valor">${v.chassis}</span></div>
                <div class="resumo-item"><span class="resumo-label">0-100 km/h</span><span class="resumo-valor">${v.0_100_km_h || 'N/D'}</span></div>
                <div class="resumo-item"><span class="resumo-label">Tração</span><span class="resumo-valor">${v.tracao || 'N/D'}</span></div>
                <button class="btn-detalhes" onclick="abrirDetalhes('${v.id}')">Ver Mais Especificações</button>
            </div>
        `).join('');
    }

    window.abrirDetalhes = (id) => {
        const v = dados.find(x => x.id === id);
        const corpo = document.getElementById('modal-corpo');
        
        let html = `<table class="tabela-full">`;
        Object.entries(v).forEach(([chave, valor]) => {
            if (chave === 'id') return;
            const label = chave.replace(/_/g, ' ');
            html += `<tr><td class="col-key">${label}</td><td class="col-val">${valor || '---'}</td></tr>`;
        });
        html += `</table>`;
        
        corpo.innerHTML = html;
        document.getElementById('modal-container').style.display = 'flex';
    };

    window.fecharModal = () => {
        document.getElementById('modal-container').style.display = 'none';
    };

    function atualizarAtivo(groupId, activeId) {
        document.querySelectorAll(`#${groupId} .btn-opt`).forEach(b => b.classList.remove('ativo'));
        document.getElementById(activeId).classList.add('ativo');
    }
});
