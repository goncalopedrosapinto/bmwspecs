document.addEventListener('DOMContentLoaded', () => {
    
    // Variável para guardar os dados na memória do navegador
    let dadosGlobais = []; 

    fetch('dados.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error('Falha ao carregar a base de dados.');
            return resposta.json();
        })
        .then(dados => {
            dadosGlobais = dados; // Guarda os dados descarregados
            renderizarCatalogo(dadosGlobais); // Desenha a página inicial com todos os carros
        })
        .catch(erro => {
            document.getElementById('catalogo').innerHTML = `<p class="erro-msg">Erro: ${erro.message}</p>`;
        });

    // MOTOR DE PESQUISA
    const caixaPesquisa = document.getElementById('caixa-pesquisa');
    
    caixaPesquisa.addEventListener('input', (evento) => {
        // Captura o que foi escrito e converte para minúsculas
        const termoBusca = evento.target.value.toLowerCase().trim();
        
        // Filtra a matriz global
        const dadosFiltrados = dadosGlobais.filter(carro => {
            // Cria uma string combinada de todas as propriedades relevantes do carro para pesquisa
            const textoCarro = `${carro.serie} ${carro.chassis} ${carro.versao} ${carro.motor} ${carro.combustivel}`.toLowerCase();
            
            // Retorna verdadeiro se o termo de busca existir dentro da string combinada
            return textoCarro.includes(termoBusca);
        });

        // Redesenha o catálogo apenas com os carros filtrados
        renderizarCatalogo(dadosFiltrados);
    });

    // MOTOR DE RENDERIZAÇÃO
    function renderizarCatalogo(viaturas) {
        const catalogo = document.getElementById('catalogo');
        catalogo.innerHTML = ''; // Limpa o estado atual
        
        // Tratamento de exceção: Pesquisa sem resultados
        if (viaturas.length === 0) {
            catalogo.innerHTML = '<p class="aviso-vazio">Nenhuma viatura corresponde aos critérios de pesquisa.</p>';
            return;
        }

        // Agrupa os carros pelo campo "chassis"
        const carrosAgrupados = viaturas.reduce((grupos, carro) => {
            const chave = carro.chassis;
            if (!grupos[chave]) { grupos[chave] = []; }
            grupos[chave].push(carro);
            return grupos;
        }, {});

        // Constrói o HTML dinâmico
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
                    </div>
                `;
            });

            htmlSecao += `</div></div>`;
            catalogo.innerHTML += htmlSecao;
        }
    }
});
