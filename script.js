let airportData = { aeroportos_completos: [] };

// Função para remover acentos e caracteres especiais, garantindo que a busca funcione
function normalizeString(str) {
    // Normaliza para o formato NFD (Canonical Decomposition) e remove diacríticos (acentos)
    if (str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return '';
}

// Função assíncrona para carregar o arquivo JSON
async function loadAirportData() {
    try {
        const response = await fetch('aeroportos.json');
        if (!response.ok) {
            // Lança um erro se a resposta não for bem-sucedida (ex: arquivo não encontrado)
            throw new Error(`Erro ao carregar o JSON: ${response.statusText}`);
        }
        const data = await response.json();
        airportData = data;
        console.log('Dados de aeroportos carregados com sucesso.');
    } catch (error) {
        console.error('Falha ao carregar os dados:', error);
        document.getElementById('resultsContainer').innerHTML = '<p style="color: red;">Erro ao carregar os dados dos aeroportos. Verifique o console e o nome do arquivo JSON.</p>';
    }
}

// Carrega os dados assim que o script é executado
loadAirportData();

// Adiciona o evento de Enter ao campo de busca
document.getElementById('searchInput').addEventListener('keyup', function (event) {
    // Código 13 é o Enter. Key 'Enter' é a forma moderna.
    if (event.key === 'Enter' || event.keyCode === 13) {
        searchAirports();
    }
});

function searchAirports() {
    const searchInput = document.getElementById('searchInput').value;
    const searchBy = document.querySelector('input[name="searchBy"]:checked').value;
    const resultsContainer = document.getElementById('resultsContainer');

    if (!searchInput) {
        resultsContainer.innerHTML = '<p style="color: red;">Por favor, digite um termo para a busca.</p>';
        return;
    }

    if (airportData.aeroportos_completos.length === 0) {
        resultsContainer.innerHTML = '<p style="color: orange;">Aguardando o carregamento dos dados dos aeroportos. Tente novamente em breve.</p>';
        return;
    }

    // 1. Normaliza e coloca em caixa alta o termo de busca do usuário
    const normalizedSearchInput = normalizeString(searchInput).toUpperCase();

    const filteredAirports = airportData.aeroportos_completos.filter(airport => {
        let valueToSearch = airport[searchBy] || '';

        // 2. Normaliza e coloca em caixa alta o valor do JSON para comparação
        const normalizedAirportValue = normalizeString(valueToSearch).toUpperCase();

        // 3. Compara os valores normalizados (ignorando acentos e case)
        return normalizedAirportValue.includes(normalizedSearchInput);
    });

    if (filteredAirports.length === 0) {
        resultsContainer.innerHTML = `<p>Nenhum aeroporto encontrado para a busca em **${searchBy.toUpperCase()}** com o termo **"${searchInput}"**.</p>`;
    } else {
        renderResults(filteredAirports);
    }
}

function renderResults(airports) {
    let tableHTML = `
        <table id="resultsTable">
            <thead>
                <tr>
                    <th>ICAO</th>
                    <th>Aeroporto</th>
                    <th>Cidade/UF</th>
                    <th>Frequências</th>
                </tr>
            </thead>
            <tbody>
    `;

    airports.forEach(airport => {
        // Gera o HTML detalhado das frequências
        const freqHTML = `
            <div class="frequencias-detail">
                ${airport.frequencias.torre && airport.frequencias.torre.length > 0 ? `<strong>Torre:</strong> ${airport.frequencias.torre.join(', ')}<br>` : ''}
                ${airport.frequencias.solo && airport.frequencias.solo.length > 0 ? `<strong>Solo:</strong> ${airport.frequencias.solo.join(', ')}<br>` : ''}
                ${airport.frequencias.atis && airport.frequencias.atis.length > 0 ? `<strong>ATIS:</strong> ${airport.frequencias.atis.join(', ')}<br>` : ''}
                ${airport.frequencias.trafego && airport.frequencias.trafego.length > 0 ? `<strong>Tráfego:</strong> ${airport.frequencias.trafego.join(', ')}<br>` : ''}
                ${airport.frequencias.operacoes && airport.frequencias.operacoes.length > 0 ? `<strong>Operações:</strong> ${airport.frequencias.operacoes.join(', ')}<br>` : ''}
                ${airport.frequencias.radio && airport.frequencias.radio.length > 0 ? `<strong>Rádio/AFIS:</strong> ${airport.frequencias.radio.join(', ')}<br>` : ''}
            </div>
        `;

        tableHTML += `
            <tr>
                <td>${airport.icao}</td>
                <td>${airport.nome_aeroporto}</td>
                <td>${airport.cidade} (${airport.uf})</td>
                <td>${freqHTML}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    document.getElementById('resultsContainer').innerHTML = tableHTML;
}