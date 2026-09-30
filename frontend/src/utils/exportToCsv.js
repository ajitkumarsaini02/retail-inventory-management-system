/**
 * Export table data to CSV file with proper formatting and quotes escaping
 * @param {string} filename - Desired download file name (e.g. 'products_inventory.csv')
 * @param {Array<string>} headers - Header column titles
 * @param {Array<Array<any>>} rows - Array of row data matching headers
 */
export const exportToCsv = (filename, headers, rows) => {
  if (!rows || !rows.length) {
    alert('No records available to export.');
    return;
  }

  const escapeCell = (cell) => {
    if (cell === null || cell === undefined) return '""';
    const cellStr = String(cell).replace(/"/g, '""');
    return `"${cellStr}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((row) => row.map(escapeCell).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default exportToCsv;
