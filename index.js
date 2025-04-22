app.get('/dados-planilha', async (req, res) => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '16O0CEuYVZbDeqDIiyxWN91P0vUcAquTaR7snAOY53Ug';
    const range = 'ACOPLADO!A1:R1000';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const data = response.data.values;
    const header = data[0];
    const rows = data.slice(1);

    // Pega os índices das colunas desejadas
    const colunasDesejadas = [
      'UNIDADE RESUMIDA',
      'TURMA',
      'Componente curricular',
      'Professores 2025',
      'Aulas 2025'
    ];
    const indices = colunasDesejadas.map(col => header.indexOf(col));

    const dadosFormatados = rows.map(row => {
      return {
        unidade: row[indices[0]] || '',
        turma: row[indices[1]] || '',
        componente: row[indices[2]] || '',
        professor: row[indices[3]] || '',
        aulas: row[indices[4]] || ''
      };
    });

    res.json(dadosFormatados);
  } catch (error) {
    console.error('Erro ao acessar planilha:', error.message);
    res.status(500).json({ erro: error.message });
  }
});
