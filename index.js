const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

app.get('/dados-planilha', async (req, res) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = 'SEU_ID_AQUI'; // substitua pelo ID da planilha
  const range = 'Notas!A1:C100';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    res.json(response.data.values);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});