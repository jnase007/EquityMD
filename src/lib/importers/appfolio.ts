import Papa from 'papaparse';

interface AppFolioProperty {
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  units?: number;
  squareFeet?: number;
  listPrice?: number;
  capRate?: number;
  yearBuilt?: number;
  propertyId?: string;
  url?: string;
}

export async function importFromAppFolio(csvData: string) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const properties = results.data.map((row: any) => ({
            title: row.name,
            property_type: mapPropertyType(row.type),
            location: `${row.city}, ${row.state}`,
            address: {
              street: row.address,
              city: row.city,
              state: row.state
            },
            description: generateDescription(row),
            minimum_investment: calculateMinInvestment(row.listPrice),
            target_irr: calculateTargetIRR(row.capRate),
            investment_term: 5, // Default to 5 years if not specified
            total_equity: row.listPrice,
            source_url: row.url,
            source_id: row.propertyId,
            investment_highlights: generateHighlights(row)
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
    'apartment': 'Multi-Family',
    'commercial': 'Office',
    'retail': 'Retail',
    'industrial': 'Industrial',
    'medical office': 'Medical',
    'mixed use': 'Mixed-Use',
    'student housing': 'Student Housing'
  };

  return typeMap[type.toLowerCase()] || type;
}

function generateDescription(property: AppFolioProperty): string {
  const details = [];

  if (property.units) {
    details.push(`${property.units}-unit`);
  }
  if (property.squareFeet) {
    details.push(`${property.squareFeet.toLocaleString()} square foot`);
  }
  if (property.yearBuilt) {
    details.push(`built in ${property.yearBuilt}`);
  }

  const description = `${details.join(', ')} ${property.type.toLowerCase()} property located in ${property.city}, ${property.state}.`;

  if (property.capRate) {
    return `${description} Currently generating a ${property.capRate}% cap rate with potential for increased returns through strategic improvements and professional management.`;
  }

  return description;
}

function calculateMinInvestment(listPrice: number): number {
  // Default to 5% of list price with a minimum of $50,000
  const calculated = Math.round(listPrice * 0.05);
  return Math.max(calculated, 50000);
}

function calculateTargetIRR(capRate: number): number {
  // Estimate IRR based on cap rate plus typical value-add premium
  return capRate ? Math.round((capRate + 5) * 10) / 10 : 15;
}

function generateHighlights(property: AppFolioProperty): string[] {
  const highlights = [];

  if (property.yearBuilt && property.yearBuilt > 2000) {
    highlights.push('Modern construction');
  }

  if (property.capRate) {
    highlights.push(`${property.capRate}% current cap rate`);
  }

  if (property.units) {
    highlights.push(`${property.units} total units`);
  }

  if (property.squareFeet) {
    highlights.push(`${property.squareFeet.toLocaleString()} SF of leasable space`);
  }

  highlights.push('Value-add opportunity');
  highlights.push('Strong market fundamentals');

  return highlights;
}