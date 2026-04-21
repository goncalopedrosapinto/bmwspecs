document.addEventListener('DOMContentLoaded', () => {
    let baseDados = [];
    let catSel = '', chassisSel = '', motorSel = '';

    const bChassis = document.getElementById('bloco-chassis');
    const bVersoes = document.getElementById('bloco-versoes');
    const displayResultado = document.getElementById('resultado');

    fetch('dados.json')
        .then(r => r.json())
        .then(d => { baseDados = d; });

    window.filtrarCat = (cat) => {
        catSel = cat;
        chassisSel = ''; motorSel = '';
        
        resetAtivos('grupo-categorias', `cat-${cat}`);
        bChassis.classList.remove('hidden');
        bVersoes.classList.add('hidden');
        displayResultado.innerHTML = '';

        const lista = [...new Set(baseDados.filter(x => x.categoria === cat).map(x => x.Chassis))].sort();
        document.getElementById('grupo-chassis').innerHTML = lista.map(c => 
            `<button class="btn-selecao" onclick="filtrarChassis('${c}')" id="ch-${c}">${c}</button>`
        ).join('');
    };

    window.filtrarChassis = (chassis) => {
        chassisSel = chassis;
        motorSel = '';

        resetAtivos('grupo-chassis', `ch-${chassis}`);
        bVersoes.classList.remove('hidden');

        const motores = baseDados.filter(x => x.categoria === catSel && x.Chassis === chassis);
        document.getElementById('grupo-versoes').innerHTML = motores.map(m => 
            `<button class="btn-selecao" onclick="verCarro('${m.id}')" id="mot-${m.id}">${m.Modelo_Motorizacao}</button>`
        ).join('');
        
        renderCards();
    };

    window.verCarro = (id) => {
        motorSel = id;
        resetAtivos('grupo-versoes', `mot-${id}`);
        renderCards();
    };

    function renderCards() {
        let filtrados = baseDados.filter(x => x.categoria === catSel && x.Chassis === chassisSel);
        if(motorSel) filtrados = filtrados.filter(x => x.id === motorSel);

        displayResultado.innerHTML = filtrados.map(v => `
            <div class="card">
                <h2>${v.Modelo_Motorizacao}</h2>
                <div class="info-linha"><span class="info-label">Chassis</span><span class="info-valor">${v.Chassis}</span></div>
                <div class="info-linha"><span class="info-label">Potência</span><span class="info-valor">${v.Potencia_CV || v.Potencia_Combinada_CV} CV</span></div>
                <div class="info-linha"><span class="info-label">0-100 km/h</span><span class="info-valor">${v.Aceleracao_0_100}s</span></div>
                <button class="btn-ver-mais" onclick="abrirModal('${v.id}')">Especificações Completas</button>
            </div>
        `).join('');
    }

    window.abrirModal = (id) => {
        const v = baseDados.find(x => x.id === id);
        document.getElementById('modal-titulo').innerText = v.Modelo_Motorizacao;
        
        let html = `<table class="tabela-specs">`;
        Object.entries(v).forEach(([key, val]) => {
            if(['id', 'categoria'].includes(key)) return;
            html += `<tr><td class="spec-key">${key.replace(/_/g, ' ')}</td><td class="spec-val">${val || '---'}</td></tr>`;
        });
        html += `</table>`;
        
        document.getElementById('modal-corpo').innerHTML = html;
        document.getElementById('modal').style.display = 'flex';
    };

    window.fecharModal = () => { document.getElementById('modal').style.display = 'none'; };

    function resetAtivos(pai, ativo) {
        document.querySelectorAll(`#${pai} .btn-selecao`).forEach(b => b.classList.remove('ativo'));
        document.getElementById(ativo).classList.add('ativo');
    }
});
