const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Carrega as credenciais conforme o ambiente (local ou nuvem)
let credentials;

if (process.env.GOOGLE_CREDENTIALS) {
  try {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } catch (err) {
    console.error('❌ Erro ao fazer parse do GOOGLE_CREDENTIALS:', err.message);
    process.exit(1);
  }
} else {
  try {
    credentials = require('./credenciais.json');
  } catch (err) {
    console.error('❌ credenciais.json não encontrado ou inválido. Defina a variável de ambiente GOOGLE_CREDENTIALS ou inclua o arquivo.');
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
    const range = 'ACOPLADO!A1:R2041'; // Ajustado conforme sua planilha

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    res.json(response.data.values);
  } catch (error) {
    console.error('❌ Erro ao acessar a planilha:', error.message);
    res.status(500).json({
      erro: 'Erro ao acessar a planilha',
      detalhes: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
