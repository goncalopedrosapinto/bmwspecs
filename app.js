document.addEventListener('DOMContentLoaded', () => {
    let dadosGlobais = [];
    
    // Elementos do DOM
    const elAno = document.getElementById('select-ano');
    const elMes = document.getElementById('select-mes');
    const elSerie = document.getElementById('select-serie');
    const elVersao = document.getElementById('select-versao');
    const catalogo = document.getElementById('catalogo');

    fetch('dados.json')
        .then(r => r.json())
        .then(dados => {
            dadosGlobais = dados;
            popularSelect(elAno, [...new Set(dados.map(d => d.ano))].sort());
        });

    // --- Lógica de Cascata ---

    elAno.addEventListener('change', () => {
        const filtrados = dadosGlobais.filter(d => d.ano === elAno.value);
        ativarESequenciar(elMes, [...new Set(filtrados.map(d => d.mes))], "Mês");
        limparPosteriores(elMes);
        renderizar();
    });

    elMes.addEventListener('change', () => {
        const filtrados = dadosGlobais.filter(d => d.ano === elAno.value && d.mes === elMes.value);
        ativarESequenciar(elSerie, [...new Set(filtrados.map(d => d.serie))], "Série");
        limparPosteriores(elSerie);
        renderizar();
    });

    elSerie.addEventListener('change', () => {
        const filtrados = dadosGlobais.filter(d => 
            d.ano === elAno.value && d.mes === elMes.value && d.serie === elSerie.value
        );
        ativarESequenciar(elVersao, [...new Set(filtrados.map(d => d.versao))], "Versão");
        renderizar();
    });

    elVersao.addEventListener('change', renderizar);

    // --- Funções Auxiliares ---

    function popularSelect(elemento, lista, labelPadrao = "Todos") {
        elemento.innerHTML = `<option value="">${labelPadrao}</option>`;
        lista.forEach(item => {
            if(item) elemento.innerHTML += `<option value="${item}">${item}</option>`;
        });
    }

    function ativarESequenciar(elemento, lista, nome) {
        elemento.disabled = false;
        popularSelect(elemento, lista, `Todos (${nome})`);
    }

    function limparPosteriores(elemento) {
        const selects = [elAno, elMes, elSerie, elVersao];
        const index = selects.indexOf(elemento);
        for (let i = index + 1; i < selects.length; i++) {
            selects[i].innerHTML = `<option value="">Aguardando...</option>`;
            selects[i].disabled = true;
        }
    }

    window.resetarFiltros = function() {
        elAno.value = "";
        limparPosteriores(elAno);
        renderizar();
    };

    function renderizar() {
        const fAno = elAno.value;
        const fMes = elMes.value;
        const fSerie = elSerie.value;
        const fVersao = elVersao.value;

        const resultado = dadosGlobais.filter(carro => {
            return (!fAno || carro.ano === fAno) &&
                   (!fMes || carro.mes === fMes) &&
                   (!fSerie || carro.serie === fSerie) &&
                   (!fVersao || carro.versao === fVersao);
        });

        catalogo.innerHTML = resultado.map(carro => `
            <div class="cartao">
                <div>
                    <span class="tag">${carro.chassis}</span>
                    <span class="tag tag-motor">${carro.motor}</span>
                </div>
                <h3>${carro.serie} ${carro.versao}</h3>
                <div class="detalhes">
                    <p>Combustível: <span>${carro.combustivel}</span></p>
                    <p>Tração: <span>${carro.tracao}</span></p>
                    <p>Potência: <span>${carro.potencia || 'N/D'}</span></p>
                    <p>0-100 km/h: <span>${carro.aceleracao_0_100 || 'N/D'}</span></p>
                    <p>Data Ref: <span>${carro.mes}/${carro.ano}</span></p>
                </div>
            </div>
        `).join('');

        if (resultado.length === 0) {
            catalogo.innerHTML = '<p>Selecione os critérios para visualizar as viaturas.</p>';
        }
    }
});
