export interface ClearingEvent {
  id: string;
  name: string;
  forest: string;
  county: string;
  lat: number;
  lng: number;
  hectaresLost: number;
  dateDetected: string;
  ndviBaseline: number; // 2022 NDVI
  ndviRecent: number;   // 2024 NDVI
  confidenceScore: number; // 0-100
  altitude: number; // meters
  annualRainfallMm: number;
  officerName: string;
  officerPhone: string;
  boundary: [number, number][]; // polygon as [lat,lng] pairs
  blueprintId?: string;
  status: 'detected' | 'blueprint_generated' | 'alert_sent' | 'remediated';
}

export interface SpeciesRow {
  species: string;
  localName: string;
  spacing: number;  // meters between trees
  rowSpacing: number; // meters between rows
  percentageShare: number; // % of total planting
  color: string;
}

export interface BlueprintLayout {
  siteId: string;
  rowAngleDegrees: number;
  totalTrees: number;
  species: SpeciesRow[];
  rows: BlueprintRow[];
  generatedAt: string;
}

export interface BlueprintRow {
  rowIndex: number;
  speciesKey: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  treePositions: { x: number; y: number }[];
}

export interface CarbonProjection {
  siteId: string;
  hectares: number;
  year5: number;
  year10: number;
  year20: number;
}

export interface SMSAlert {
  siteId: string;
  officerName: string;
  officerPhone: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
}
