// Inicializar dados
let alertas = [];
let map;
let markers = [];

// Carregar dados do LocalStorage
function loadFromStorage() {
    const saved = localStorage.getItem('defesaCivilAlertas');
    if (saved) {
        alertas = JSON.parse(saved);
        // Garante que os marcadores sejam carregados no mapa
        updateMarkersOnMap(alertas);
        updateAlertList();
        updateStats();
    }
}

// Salvar dados no LocalStorage
function saveToStorage() {
    localStorage.setItem('defesaCivilAlertas', JSON.stringify(alertas));
}

// Limpa todos os marcadores e os adiciona novamente (essencial para filtros)
function updateMarkersOnMap(alertasParaExibir) {
    // 1. Remover todos os marcadores existentes
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // 2. Adicionar os marcadores filtrados/exibidos
    alertasParaExibir.forEach(alerta => addMarker(alerta));
}

// Inicializar mapa
function initMap() {
    // Coordenadas centrais de São Paulo: -23.550520, -46.633308
    map = L.map('map').setView([-22.9189, -42.8189], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    map.on('click', function (e) {
        document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
        document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
    });
}

// Buscar coordenadas pelo endereço (Geocoding)
document.getElementById('buscarEndereco').addEventListener('click', async function () {
    const endereco = document.getElementById('endereco').value;

    if (!endereco) {
        alert('Digite um endereço primeiro! 🏠');
        return;
    }

    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '🔍 Buscando... <span class="loading"></span>';

    try {
        // CORREÇÃO #1: Adição do protocolo 'https://' e uso de template string (`...`)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`);

        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.status}`);
        }

        const data = await response.json();

        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            document.getElementById('latitude').value = lat.toFixed(6);
            document.getElementById('longitude').value = lon.toFixed(6);

            map.setView([lat, lon], 15);

            alert('✅ Coordenadas encontradas com sucesso!');
        } else {
            alert('❌ Endereço não encontrado. Tente ser mais específico (Ex: Rua X, Cidade, Estado)');
        }
    } catch (error) {
        alert('❌ Erro ao buscar coordenadas. Verifique sua conexão.');
        console.error('Erro de Geocodificação:', error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🔍 Buscar Coordenadas';
    }
});

// Preview da foto
document.getElementById('foto').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('photoPreview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
});

function getMarkerColor(severidade) {
    switch (severidade) {
        case 'baixa': return '#28a745';
        case 'media': return '#ffc107';
        case 'alta': return '#dc3545';
        default: return '#667eea';
    }
}

function addMarker(alerta) {
    // CORREÇÃO #2: Uso de template string (`...`) para o HTML
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${getMarkerColor(alerta.severidade)}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5]
    });

    // CORREÇÃO #3: Uso de template string (`...`) para o popupContent
    const popupContent = `
        <strong>${alerta.tipo}</strong><br>
        <em>Severidade: ${alerta.severidade.toUpperCase()}</em><br>
        Endereço: ${alerta.endereco}<br>
        Descrição: ${alerta.descricao}<br>
        ${alerta.foto ? `<img src="${alerta.foto}" style="max-width: 150px; margin-top: 5px; border-radius: 5px;">` : ''}
        <small>Registrado em: ${alerta.dataHora}</small>
    `;

    const marker = L.marker([alerta.latitude, alerta.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);

    markers.push(marker);
}

function applyFilters() {
    const tipoFiltro = document.getElementById('filterTipo').value;
    const severidadeFiltro = document.getElementById('filterSeveridade').value;
    const periodoFiltro = document.getElementById('filterPeriodo').value;

    let alertasFiltrados = [...alertas];

    // Filtro por tipo
    if (tipoFiltro) {
        alertasFiltrados = alertasFiltrados.filter(a => a.tipo === tipoFiltro);
    }

    // Filtro por severidade
    if (severidadeFiltro) {
        alertasFiltrados = alertasFiltrados.filter(a => a.severidade === severidadeFiltro);
    }

    // Filtro por período
    if (periodoFiltro !== 'todos') {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        alertasFiltrados = alertasFiltrados.filter(a => {
            if (!a.timestamp) return false;
            const dataAlerta = new Date(a.timestamp);

            switch (periodoFiltro) {
                case 'hoje':
                    return dataAlerta >= hoje;
                case 'semana':
                    const semanaAtras = new Date(hoje);
                    semanaAtras.setDate(hoje.getDate() - 7);
                    return dataAlerta >= semanaAtras;
                case 'mes':
                    const mesAtras = new Date(hoje);
                    mesAtras.setMonth(hoje.getMonth() - 1);
                    return dataAlerta >= mesAtras;
                default:
                    return true;
            }
        });
    }

    // Atualiza a lista e os marcadores no mapa com base nos filtros
    updateAlertList(alertasFiltrados);
    updateMarkersOnMap(alertasFiltrados);
}

// Event listeners para filtros
document.getElementById('filterTipo').addEventListener('change', applyFilters);
document.getElementById('filterSeveridade').addEventListener('change', applyFilters);
document.getElementById('filterPeriodo').addEventListener('change', applyFilters);

function updateAlertList(alertasParaExibir = alertas) {
    const alertList = document.getElementById('alertList');

    if (alertasParaExibir.length === 0) {
        alertList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhuma ocorrência encontrada.</p>';
        return;
    }

    // Inverte a lista para mostrar o mais novo primeiro
    const alertasOrdenados = [...alertasParaExibir].reverse();

    alertList.innerHTML = alertasOrdenados.map(alerta => `
        <div class="alert-item">
            <div class="alert-type">${alerta.tipo}</div>
            <span class="alert-severity severity-${alerta.severidade}">
                ${alerta.severidade.toUpperCase()}
            </span>
            <div class="alert-desc"><strong>Local:</strong> ${alerta.endereco}</div>
            <div class="alert-desc">${alerta.descricao}</div>
            ${alerta.foto ? `<img src="${alerta.foto}" class="alert-photo" alt="Foto da ocorrência">` : ''}
            <div class="alert-time">📅 ${alerta.dataHora}</div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalAlertas').textContent = alertas.length;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alertasHoje = alertas.filter(a => new Date(a.timestamp) >= hoje).length;
    document.getElementById('alertasHoje').textContent = alertasHoje;

    const alertasAlta = alertas.filter(a => a.severidade === 'alta').length;
    document.getElementById('alertasAlta').textContent = alertasAlta;
}

document.getElementById('alertForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fotoInput = document.getElementById('foto');
    const fotoFile = fotoInput.files[0];

    const processarAlerta = (fotoBase64 = null) => {
        const alerta = {
            id: Date.now(),
            tipo: document.getElementById('tipoOcorrencia').value,
            severidade: document.getElementById('severidade').value,
            endereco: document.getElementById('endereco').value,
            latitude: parseFloat(document.getElementById('latitude').value),
            longitude: parseFloat(document.getElementById('longitude').value),
            descricao: document.getElementById('descricao').value,
            foto: fotoBase64,
            dataHora: new Date().toLocaleString('pt-BR'),
            timestamp: new Date().getTime()
        };

        alertas.push(alerta);

        // Reaplicar filtros para que o novo marcador só apareça se as condições forem atendidas
        applyFilters();

        map.setView([alerta.latitude, alerta.longitude], 15);

        saveToStorage();

        this.reset();
        document.getElementById('photoPreview').style.display = 'none';
        document.getElementById('photoPreview').src = '';

        alert('✅ Ocorrência registrada com sucesso!');
    };

    if (fotoFile) {
        if (fotoFile.size > 2 * 1024 * 1024) { // Limite de 2MB para LocalStorage
            alert('❌ A foto é muito grande. Por favor, selecione uma menor (máx 2MB).');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            processarAlerta(e.target.result);
        };
        reader.readAsDataURL(fotoFile);
    } else {
        processarAlerta();
    }
});

// Modal de confirmação
const modal = document.getElementById('confirmModal');
const clearBtn = document.getElementById('clearData');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');

clearBtn.addEventListener('click', function () {
    modal.style.display = 'block';
});

cancelBtn.addEventListener('click', function () {
    modal.style.display = 'none';
});

confirmBtn.addEventListener('click', function () {
    alertas = [];
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    updateAlertList();
    updateStats();
    saveToStorage();
    modal.style.display = 'none';
    alert('✅ Todos os dados foram removidos!');
});

window.addEventListener('click', function (e) {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Exportar PDF
document.getElementById('exportPDF').addEventListener('click', function () {
    if (alertas.length === 0) {
        alert('Não há ocorrências para exportar!');
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('❌ A biblioteca jsPDF não está carregada. Verifique o script tag no seu HTML.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('RELATÓRIO DE OCORRÊNCIAS', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Sistema de Alertas da Defesa Civil', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('ESTATÍSTICAS GERAIS', margin, yPosition);
    yPosition += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Total de Ocorrências: ${alertas.length}`, margin, yPosition);
    yPosition += 5;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alertasHoje = alertas.filter(a => new Date(a.timestamp) >= hoje).length;
    doc.text(`Ocorrências Hoje: ${alertasHoje}`, margin, yPosition);
    yPosition += 5;

    const alertasPorSeveridade = {
        alta: alertas.filter(a => a.severidade === 'alta').length,
        media: alertas.filter(a => a.severidade === 'media').length,
        baixa: alertas.filter(a => a.severidade === 'baixa').length
    };
    doc.text(`Severidade Alta: ${alertasPorSeveridade.alta} | Média: ${alertasPorSeveridade.media} | Baixa: ${alertasPorSeveridade.baixa}`, margin, yPosition);
    yPosition += 10;

    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('OCORRÊNCIAS REGISTRADAS', margin, yPosition);
    yPosition += 10;

    // Exporta os alertas em ordem cronológica inversa (mais novo primeiro)
    const alertasParaPDF = [...alertas].reverse();

    alertasParaPDF.forEach((alerta, index) => {
        // Quebra de página
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`${alertasParaPDF.length - index}. ${alerta.tipo}`, margin, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);

        // Define a cor do texto para Severidade
        doc.setTextColor(
            alerta.severidade === 'alta' ? 220 : alerta.severidade === 'media' ? 255 : 40,
            alerta.severidade === 'alta' ? 53 : alerta.severidade === 'media' ? 193 : 167,
            alerta.severidade === 'alta' ? 69 : alerta.severidade === 'media' ? 7 : 69
        );
        doc.text(`Severidade: ${alerta.severidade.toUpperCase()}`, margin + 5, yPosition);
        doc.setTextColor(0, 0, 0); // Volta ao preto
        yPosition += 5;

        doc.text(`Local: ${alerta.endereco}`, margin + 5, yPosition);
        yPosition += 5;

        doc.text(`Coordenadas: ${alerta.latitude}, ${alerta.longitude}`, margin + 5, yPosition);
        yPosition += 5;

        const descLines = doc.splitTextToSize(`Descrição: ${alerta.descricao}`, pageWidth - margin * 2 - 5);
        doc.text(descLines, margin + 5, yPosition);
        yPosition += descLines.length * 5;

        doc.text(`Data/Hora: ${alerta.dataHora}`, margin + 5, yPosition);
        yPosition += 8;

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
    });

    // Adiciona números de página
    const totalPages = doc.internal.pages.length;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    const dataAtual = new Date().toISOString().split('T')[0];
    doc.save(`relatorio-defesa-civil-${dataAtual}.pdf`);

    alert('✅ Relatório PDF gerado com sucesso!');
});

window.onload = function () {
    initMap();
    loadFromStorage();
};