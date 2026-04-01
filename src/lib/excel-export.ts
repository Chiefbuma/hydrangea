function triggerDownload(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function addHeaderRow(worksheet: any, values: string[]) {
  const headerRow = worksheet.addRow(values);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell: any) => {
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
}

function setColumnWidths(worksheet: any, widths: number[]) {
  worksheet.columns = widths.map((width) => ({ width }));
}

async function createWorkbook() {
  const ExcelJS = await import('exceljs/dist/exceljs.min.js');
  return new ExcelJS.Workbook();
}

/**
 * Export fleet performance summary to Excel
 */
export async function exportSummaryToExcel(
  data: any[],
  periodLabel: string
) {
  const fileName = `Fleet_Performance_Summary_${new Date().toISOString().split('T')[0]}.xlsx`;
  const workbook = await createWorkbook();
  const summarySheet = workbook.addWorksheet('Summary');
  const infoSheet = workbook.addWorksheet('Info');

  addHeaderRow(summarySheet, ['Vehicle', 'Total Till', 'Cash Deposited', 'Net Banked', 'Deficit']);
  data.forEach((item) => {
    summarySheet.addRow([
      item.reg_no,
      item.total_till,
      item.total_cash_deposited,
      item.total_net_banked,
      item.total_deficit,
    ]);
  });
  setColumnWidths(summarySheet, [15, 18, 18, 15, 12]);

  infoSheet.addRow(['Fleet Performance Analysis']);
  infoSheet.addRow(['Period', periodLabel]);
  infoSheet.addRow(['Generated', new Date().toLocaleString()]);
  infoSheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer as ArrayBuffer, fileName);
}

/**
 * Export detailed transactions to Excel
 */
export async function exportDetailedToExcel(
  data: any[],
  periodLabel: string
) {
  const fileName = `Transaction_Details_${new Date().toISOString().split('T')[0]}.xlsx`;
  const workbook = await createWorkbook();
  const transactionsSheet = workbook.addWorksheet('Transactions');
  const infoSheet = workbook.addWorksheet('Info');

  addHeaderRow(transactionsSheet, [
    'Date',
    'Vehicle',
    'Driver',
    'Total Till',
    'Target',
    'Fuel',
    'Operation',
    'Cash Deposited',
    'Amount Paid to Till',
    'Offload',
    'Operations Cost',
    'Net Banked',
    'Deficit',
    'Performance',
  ]);

  data.forEach((row) => {
    transactionsSheet.addRow([
      new Date(row.date).toLocaleDateString(),
      row.ambulance?.reg_no || '-',
      row.driver?.name || '-',
      row.total_till,
      row.target,
      row.fuel,
      row.operation,
      row.cash_deposited_by_staff,
      row.amount_paid_to_the_till,
      row.offload,
      row.operations_cost,
      row.net_banked,
      row.deficit,
      `${(row.performance * 100).toFixed(0)}%`,
    ]);
  });
  setColumnWidths(transactionsSheet, [12, 12, 15, 12, 12, 10, 12, 15, 16, 10, 15, 12, 10, 12]);

  infoSheet.addRow(['Transaction Details']);
  infoSheet.addRow(['Period', periodLabel]);
  infoSheet.addRow(['Total Records', data.length]);
  infoSheet.addRow(['Generated', new Date().toLocaleString()]);
  infoSheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer as ArrayBuffer, fileName);
}
