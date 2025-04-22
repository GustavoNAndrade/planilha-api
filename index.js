const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Carrega as credenciais do ambiente (Render) ou do arquivo local
let credentials;

if (process.env.GOOGLE_CREDENTIALS) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (err) {
    console.error('❌ Erro ao interpretar GOOGLE_CREDENTIALS:', err.message);
    process.exit(1);
  }
} else {
  try {
    credentials = require('./credenciais.json');
  } catch (err) {
    console.error('❌ Arquivo credenciais.json não encontrado.');
    process.exit(1);
  }
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

app.get('/dados-planilha', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '16O0CEuYVZbDeqDIiyxWN91P0vUcAquTaR7snAOY53Ug';
    const range = 'ACOPLADO!A1:R1000'; // Lê a aba inteira

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const data = response.data.values;
    const header = data[0];
    const rows = data.slice(1);

    // Índices das colunas desejadas
    const colunasDesejadas = [
      'UNIDADE RESUMIDA',
      'TURMA',
      'Componente curricular',
      'Professores 2025',
      'Aulas 2025'
    ];

    const indices = colunasDesejadas.map(col => header.indexOf(col));

    // Reconstruindo o novo array com apenas as colunas desejadas
    const dadosFiltrados = rows.map(row =>
      indices.map(i => row[i] || '')
    );

    // Enviar com cabeçalho incluído
    res.json([colunasDesejadas, ...dadosFiltrados]);
  } catch (error) {
    console.error('❌ Erro ao acessar planilha:', error.message);
    res.status(500).json({
      erro: 'Erro ao acessar a planilha',
      detalhes: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});