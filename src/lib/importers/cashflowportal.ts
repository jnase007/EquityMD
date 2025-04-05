import Papa from 'papaparse';

interface CashflowPortalProperty {
  propertyName: string;
  propertyType: string;
  location: string;
  minimumInvestment: number;
  targetIRR: number;
  holdPeriod: number;
  totalEquity: number;
  description?: string;
  propertyUrl?: string;
  propertyId?: string;
}

export async function importFromCashflowPortal(csvData: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const properties = results.data.map((row: any) => ({
            title: row.propertyName,
            property_type: mapPropertyType(row.propertyType),
            location: row.location,
            minimum_investment: parseFloat(row.minimumInvestment),
            target_irr: parseFloat(row.targetIRR),
            investment_term: parseInt(row.holdPeriod),
            total_equity: parseFloat(row.totalEquity),
            description: row.description,
            source_url: row.propertyUrl,
            source_id: row.propertyId
          }));

          resolve(properties);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error)
    });
  });
}

function mapPropertyType(type: string): string {
  const typeMap: { [key: string]: string } = {
    'multifamily': 'Multi-Family',
    'office': 'Office',
    'retail': 'Retail',
    'industrial': 'Industrial',
    'medical': 'Medical',
    'student': 'Student Housing',
    'mixed': 'Mixed-Use'
  };

  return typeMap[type.toLowerCase()] || type;
}