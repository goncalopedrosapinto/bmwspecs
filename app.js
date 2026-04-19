document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Vai buscar o ficheiro JSON externo
    fetch('dados.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error('Falha ao carregar a base de dados.');
            return resposta.json();
        })
        .then(dadosViaturas => {
            renderizarCatalogo(dadosViaturas);
        })
        .catch(erro => {
            document.getElementById('catalogo').innerHTML = `<p class="erro-msg">Erro: ${erro.message}. Garante que estás a correr o site num servidor.</p>`;
        });

    // 2. Função principal para agrupar e desenhar
    function renderizarCatalogo(viaturas) {
        // Agrupa os carros pelo campo "chassis"
        const carrosAgrupados = viaturas.reduce((grupos, carro) => {
            const chave = carro.chassis;
            if (!grupos[chave]) { grupos[chave] = []; }
            grupos[chave].push(carro);
            return grupos;
        }, {});

        const catalogo = document.getElementById('catalogo');
        catalogo.innerHTML = ''; // Limpa o estado inicial
        
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
