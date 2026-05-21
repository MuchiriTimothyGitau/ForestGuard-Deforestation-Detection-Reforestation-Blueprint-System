import type { ClearingEvent, BlueprintLayout, CarbonProjection } from '@/types/types';

// Pre-seeded deforestation detection data for Kenya forests
// Based on actual Mau Forest Complex coordinates

export const clearingEvents: ClearingEvent[] = [
  {
    id: 'mau-001',
    name: 'South Mau Block 4',
    forest: 'Mau Forest Complex',
    county: 'Nakuru',
    lat: -0.3821,
    lng: 35.5847,
    hectaresLost: 147.3,
    dateDetected: '2024-03-12',
    ndviBaseline: 0.72,
    ndviRecent: 0.19,
    confidenceScore: 94,
    altitude: 2340,
    annualRainfallMm: 1320,
    officerName: 'James Kipkoech',
    officerPhone: '+254712345678',
    boundary: [
      [-0.3760, 35.5790], [-0.3760, 35.5910],
      [-0.3880, 35.5920], [-0.3890, 35.5800],
      [-0.3760, 35.5790]
    ],
    blueprintId: 'bp-mau-001',
    status: 'blueprint_generated',
  },
  {
    id: 'mau-002',
    name: 'East Mau Escarpment',
    forest: 'Mau Forest Complex',
    county: 'Kericho',
    lat: -0.4150,
    lng: 35.6230,
    hectaresLost: 89.6,
    dateDetected: '2024-04-28',
    ndviBaseline: 0.68,
    ndviRecent: 0.24,
    confidenceScore: 87,
    altitude: 2180,
    annualRainfallMm: 1150,
    officerName: 'Mary Chepkirui',
    officerPhone: '+254723456789',
    boundary: [
      [-0.4090, 35.6170], [-0.4090, 35.6290],
      [-0.4210, 35.6300], [-0.4220, 35.6180],
      [-0.4090, 35.6170]
    ],
    status: 'detected',
  },
  {
    id: 'aberdare-001',
    name: 'Aberdare North Sector',
    forest: 'Aberdare National Park',
    county: 'Nyeri',
    lat: -0.2580,
    lng: 36.6340,
    hectaresLost: 62.1,
    dateDetected: '2024-05-09',
    ndviBaseline: 0.81,
    ndviRecent: 0.31,
    confidenceScore: 91,
    altitude: 2720,
    annualRainfallMm: 1680,
    officerName: 'Peter Wanjiku',
    officerPhone: '+254734567890',
    boundary: [
      [-0.2520, 36.6280], [-0.2520, 36.6400],
      [-0.2640, 36.6410], [-0.2650, 36.6290],
      [-0.2520, 36.6280]
    ],
    status: 'alert_sent',
  },
  {
    id: 'mt-kenya-001',
    name: 'Mt Kenya Western Buffer',
    forest: 'Mount Kenya Forest Reserve',
    county: 'Meru',
    lat: 0.0520,
    lng: 37.3410,
    hectaresLost: 38.4,
    dateDetected: '2024-06-01',
    ndviBaseline: 0.76,
    ndviRecent: 0.28,
    confidenceScore: 85,
    altitude: 1980,
    annualRainfallMm: 950,
    officerName: 'Alice Mutembei',
    officerPhone: '+254745678901',
    boundary: [
      [0.0580, 37.3350], [0.0580, 37.3470],
      [0.0460, 37.3480], [0.0450, 37.3360],
      [0.0580, 37.3350]
    ],
    status: 'detected',
  },
  {
    id: 'kakamega-001',
    name: 'Kakamega NE Corridor',
    forest: 'Kakamega Forest Reserve',
    county: 'Kakamega',
    lat: 0.2960,
    lng: 34.8620,
    hectaresLost: 24.7,
    dateDetected: '2024-06-14',
    ndviBaseline: 0.65,
    ndviRecent: 0.22,
    confidenceScore: 79,
    altitude: 1580,
    annualRainfallMm: 2040,
    officerName: 'Francis Simiyu',
    officerPhone: '+254756789012',
    boundary: [
      [0.3020, 34.8560], [0.3020, 34.8680],
      [0.2900, 34.8690], [0.2890, 34.8570],
      [0.3020, 34.8560]
    ],
    status: 'detected',
  },
];

// Pre-generated blueprint for mau-001 (the main demo site)
export const blueprints: Record<string, BlueprintLayout> = {
  'bp-mau-001': {
    siteId: 'mau-001',
    rowAngleDegrees: 18,
    totalTrees: 2946,
    generatedAt: '2024-03-14T09:22:00Z',
    species: [
      {
        species: 'Olea europaea subsp. africana',
        localName: 'African Olive',
        spacing: 3,
        rowSpacing: 4,
        percentageShare: 35,
        color: '#2d5016',
      },
      {
        species: 'Podocarpus latifolius',
        localName: 'Broad-leaf Podocarpus',
        spacing: 4,
        rowSpacing: 5,
        percentageShare: 30,
        color: '#3d6b20',
      },
      {
        species: 'Juniperus procera',
        localName: 'East African Cedar',
        spacing: 4,
        rowSpacing: 5,
        percentageShare: 25,
        color: '#4a7c25',
      },
      {
        species: 'Prunus africana',
        localName: 'African Cherry',
        spacing: 3,
        rowSpacing: 4,
        percentageShare: 10,
        color: '#5a8a2e',
      },
    ],
    rows: generateBlueprintRows(),
  },
};

function generateBlueprintRows(): BlueprintLayout['rows'] {
  const rows = [];
  const speciesKeys = [
    'Olea europaea subsp. africana',
    'Podocarpus latifolius',
    'Juniperus procera',
    'Prunus africana',
  ];
  const rowCount = 32;
  const canvasWidth = 580;
  const canvasHeight = 420;
  const rowSpacing = canvasHeight / (rowCount + 1);

  for (let i = 0; i < rowCount; i++) {
    const y = rowSpacing * (i + 1);
    const speciesKey = speciesKeys[i % speciesKeys.length];
    const treeSpacing = speciesKey === 'Podocarpus latifolius' || speciesKey === 'Juniperus procera' ? 20 : 15;
    const treeCount = Math.floor(canvasWidth / treeSpacing);
    const treePositions = [];
    for (let j = 0; j < treeCount; j++) {
      treePositions.push({ x: treeSpacing * (j + 0.5), y });
    }
    rows.push({
      rowIndex: i,
      speciesKey,
      startX: 0,
      startY: y,
      endX: canvasWidth,
      endY: y,
      treePositions,
    });
  }
  return rows;
}

// Carbon projections using IPCC Tier 2 biomass expansion factors
// BEF for tropical moist forests: 1.74
// Root-to-shoot ratio: 0.27
// Wood density factor applied per species
export function calculateCarbonProjection(hectares: number, siteId: string): CarbonProjection {
  // IPCC Tier 2: mean annual increment ~6.2 tC/ha/yr for East African highland forests
  // At year N: C_above = MAI * BEF * (1 + R) * CF * 44/12
  const MAI = 6.2; // tonnes C/ha/year aboveground increment
  const BEF = 1.74; // biomass expansion factor
  const RSR = 0.27; // root-to-shoot ratio
  const CF = 0.47;  // carbon fraction of biomass
  const CO2_factor = 44 / 12; // convert C to CO2e

  const annualCO2PerHa = MAI * BEF * (1 + RSR) * CF * CO2_factor;

  // Growth curve with establishment lag (sigmoid-like)
  const year5 = Math.round(hectares * annualCO2PerHa * 5 * 0.45);
  const year10 = Math.round(hectares * annualCO2PerHa * 10 * 0.72);
  const year20 = Math.round(hectares * annualCO2PerHa * 20 * 0.91);

  return { siteId, hectares, year5, year10, year20 };
}

// Aggregate carbon report
export function getAggregateReport() {
  const totalHectares = clearingEvents.reduce((sum, e) => sum + e.hectaresLost, 0);
  const blueprintCount = clearingEvents.filter(e => e.blueprintId).length;
  const alertCount = clearingEvents.filter(e => e.status === 'alert_sent').length;

  const totalProjections = clearingEvents.reduce(
    (acc, e) => {
      const p = calculateCarbonProjection(e.hectaresLost, e.id);
      return {
        year5: acc.year5 + p.year5,
        year10: acc.year10 + p.year10,
        year20: acc.year20 + p.year20,
      };
    },
    { year5: 0, year10: 0, year20: 0 }
  );

  return {
    totalHectares: Math.round(totalHectares * 10) / 10,
    sitesDetected: clearingEvents.length,
    blueprintsGenerated: blueprintCount,
    alertsSent: alertCount,
    projectedCarbonYear5: totalProjections.year5,
    projectedCarbonYear10: totalProjections.year10,
    projectedCarbonYear20: totalProjections.year20,
  };
}
