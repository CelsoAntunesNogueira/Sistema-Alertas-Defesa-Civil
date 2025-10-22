# 🚨 Sistema de Alertas da Defesa Civil

## 📍 Visão Geral do Projeto
O **Sistema de Alertas da Defesa Civil** é uma aplicação web interativa projetada para **monitoramento e registro em tempo real** de ocorrências como alagamentos, deslizamentos e vendavais.

A aplicação utiliza o poder da biblioteca **[Leaflet](https://leafletjs.com/)** para visualizar as ocorrências em um mapa interativo, permitindo que a Defesa Civil (ou usuários autorizados) registrem novos eventos com detalhes geográficos e classifiquem a severidade.

Os dados são armazenados **localmente no navegador** e podem ser exportados em **relatórios PDF**, tornando a gestão rápida e acessível.

---

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia | Uso |
|------------|-------------|-----|
| **Linguagem Base** | HTML5, CSS3, JavaScript (ES6+) | Estrutura, estilização e lógica de interatividade. |
| **Mapeamento** | [Leaflet](https://leafletjs.com/) | Renderização do mapa, marcadores e popups interativos. |
| **Geocodificação** | [Nominatim (OpenStreetMap API)](https://nominatim.openstreetmap.org/) | Conversão de endereços em coordenadas geográficas. |
| **Persistência de Dados** | localStorage (API Web) | Armazenamento persistente das ocorrências no navegador. |
| **Exportação de Dados** | [jsPDF](https://github.com/parallax/jsPDF) | Geração de relatórios PDF com os alertas cadastrados. |
| **Layout Responsivo** | CSS Nativo (`@media queries`) | Adaptação da interface para desktops, tablets e smartphones. |

---

## ✨ Funcionalidades Principais

### 🗺️ Mapa Interativo
- Exibição de todas as ocorrências em um mapa **Leaflet**, centralizado na cidade de **Maricá (RJ)**.  

### 📝 Registro de Ocorrências
Formulário completo para cadastrar novos alertas com:
- Tipo de ocorrência (ex: Alagamento, Deslizamento)
- Nível de severidade (Baixa, Média, Alta)
- Endereço e descrição detalhada
- Busca automática de coordenadas (Geocoding)
- Upload e pré-visualização de fotos (armazenadas em Base64)

### 📊 Gestão de Dados
- Lista detalhada das ocorrências  
- Filtros dinâmicos por tipo, severidade e período (Hoje, Última Semana, etc.)  
- Estatísticas atualizadas em tempo real (Total de Alertas, Alta Severidade, etc.)

### 📄 Relatórios
- Exportação de todas as ocorrências para **PDF** via jsPDF  

### 🧹 Limpeza de Dados
- Função com **modal de confirmação** para remover todos os registros armazenados

---

## ⚙️ Como Executar o Projeto

Este projeto é **totalmente client-side** — não requer servidor backend.

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-alertas-defesa-civil.git

# Entre na pasta do projeto
cd sistema-alertas-defesa-civil
