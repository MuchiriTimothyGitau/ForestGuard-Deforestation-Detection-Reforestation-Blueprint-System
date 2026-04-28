# Requirements Document

## 1. Application Overview

**Application Name**: ForestGuard / Deforestation Detection & Reforestation Blueprint System

**Description**: A web application for detecting deforestation in Kenya forests and generating reforestation blueprints. The system analyzes satellite imagery to identify cleared areas, generates CAD-style reforestation layouts with native species recommendations, calculates carbon sequestration projections, and alerts forestry officers via SMS.

## 2. Users and Usage Scenarios

**Target Users**:
- Environmental researchers and analysts
- County forestry officers
- Conservation organizations
- Government environmental agencies

**Core Usage Scenarios**:
- Monitor forest clearing events across Kenya forest zones
- Analyze deforestation extent through satellite image comparison
- Generate scientifically-based reforestation plans for cleared sites
- Project carbon credit potential from reforestation efforts
- Coordinate rapid response with local forestry officers

## 3. Page Structure and Functional Description

### Page Hierarchy

```
ForestGuard Application
├── Dashboard (Map View)
├── Site Detail
├── Blueprint Viewer
└── Carbon Report
```

### 3.1 Dashboard

**Purpose**: Display Kenya forest zones on an interactive map with deforestation detection markers.

**Core Functions**:
- Display map of Kenya forest zones using Leaflet.js
- Show red markers at locations where forest clearing has been detected
- Each marker displays:
  - Hectares of forest lost
  - Date when clearing was detected
- Click marker to navigate to Site Detail page
- Use OpenStreetMap or Mapbox free tier for map tiles

### 3.2 Site Detail

**Purpose**: Provide detailed analysis of a specific deforestation site with before/after satellite imagery comparison.

**Core Functions**:
- Display before/after satellite image comparison:
  - 2022 baseline image (Sentinel-2)
  - 2024 recent image (Sentinel-2)
  - Drag slider to transition between images
- Show detected clearing boundary as polygon overlay on images
- Display site information:
  - GPS coordinates
  - Total hectares cleared
  - Detection confidence score
- Provide \"Generate Blueprint\" button to create reforestation plan

**Workflow**:
- Satellite comparison: System holds two Sentinel-2 images (2022 baseline vs recent), computes NDVI (Normalized Difference Vegetation Index), flags clearing where NDVI dropped sharply
- Boundary detection: CNN model runs on NDVI difference map, draws polygon around cleared area, records GPS coordinates, hectares, and confidence score

### 3.3 Blueprint Viewer

**Purpose**: Display generated reforestation blueprint with CAD-style layout and carbon projections.

**Core Functions**:
- Render reforestation layout as SVG CAD drawing showing:
  - Tree planting rows
  - Species labels (Kenya native species)
  - Spacing measurements between rows and trees
  - Contour lines indicating terrain
- Display carbon projection chart showing projected CO₂ sequestration:
  - 5-year projection
  - 10-year projection
  - 20-year projection
  - Values displayed in tonnes CO₂
- Provide download buttons:
  - Download as PDF
  - Download as DXF (CAD format)
- Provide \"Alert Officer\" button to send SMS notification

**Blueprint Generation Process**:
- Polygon boundary sent to Claude (Anthropic API: https://www.anthropic.com/api) with:
  - GPS location
  - Altitude data
  - Rainfall data from Open-Meteo API (https://open-meteo.com)
  - Kenya native species database
- Claude returns JSON layout containing:
  - Species recommendations
  - Row spacing specifications
  - Row angle relative to slope
- Frontend renders JSON as SVG CAD drawing

**Carbon Calculation**:
- Apply IPCC Tier 2 biomass expansion factors
- Calculate tonnes CO₂ sequestration at year 5, 10, and 20
- Display results as chart using Recharts
- Store carbon projections with blueprint record

**Officer Alert**:
- Use Africa's Talking API (https://africastalking.com) to send SMS
- SMS content includes:
  - GPS coordinates of cleared site
  - Area cleared in hectares
  - Link to blueprint
- Recipient: County forestry officer assigned to the region

### 3.4 Carbon Report

**Purpose**: Provide aggregate statistics across all detected deforestation sites and generated blueprints.

**Core Functions**:
- Display running totals:
  - Total hectares of deforestation detected across all sites
  - Total number of reforestation blueprints generated
  - Total projected carbon credits (tonnes CO₂) if all sites are replanted
- Show aggregated carbon projections across all blueprints
- Display summary statistics for monitoring program impact

## 4. Business Rules and Logic

### Deforestation Detection Logic
- System compares NDVI values between 2022 baseline and recent satellite images
- Clearing is flagged when NDVI drops sharply (threshold-based detection)
- CNN model processes NDVI difference map to identify clearing boundaries
- Each detection records: GPS coordinates, hectares cleared, confidence score, detection date

### Blueprint Generation Logic
- Blueprint generation triggered by user clicking \"Generate Blueprint\" button on Site Detail page
- System sends clearing polygon boundary and environmental data to Claude API
- Environmental data includes:
  - GPS location (latitude, longitude)
  - Altitude (meters above sea level)
  - Rainfall data from Open-Meteo API
  - Kenya native species database entries
- Claude API returns JSON layout specifying:
  - Recommended native tree species for the site
  - Row spacing (meters between rows)
  - Tree spacing within rows
  - Row orientation angle relative to terrain slope
- Frontend converts JSON layout to SVG CAD drawing with visual elements:
  - Tree symbols positioned according to layout
  - Species labels
  - Measurement annotations
  - Contour lines

### Carbon Projection Logic
- Apply IPCC Tier 2 biomass expansion factors to calculate carbon sequestration
- Calculate projected CO₂ sequestration at three time horizons:
  - Year 5
  - Year 10
  - Year 20
- Carbon projections based on:
  - Total hectares to be replanted
  - Species composition from blueprint
  - Growth rates of selected species
- Store carbon projections with each blueprint record
- Aggregate carbon projections across all blueprints for Carbon Report page

### SMS Alert Logic
- SMS sent when user clicks \"Alert Officer\" button on Blueprint Viewer page
- System identifies county forestry officer assigned to the GPS location
- SMS message format:
  - GPS coordinates of cleared site
  - Area cleared (hectares)
  - Link to blueprint viewer page
- SMS delivery via Africa's Talking API

### Prototype Data Approach
- Use pre-loaded/seeded data (no live satellite feeds)
- Seed database with one real clearing event from Mau Forest
- Hardcoded NDVI result for demonstration
- Full workflow demonstration: Map markers → Site Detail → NDVI slider → Generate Blueprint → SVG renders → Carbon chart → SMS alert

## 5. Exceptions and Boundary Cases

| Scenario | Handling |
|----------|----------|
| Blueprint generation fails (Claude API error) | Display error message, allow user to retry generation |
| SMS delivery fails (Africa's Talking API error) | Display error message, log failed attempt, allow user to retry alert |
| Open-Meteo API unavailable | Use default rainfall data for region, display warning that data may be approximate |
| User attempts to generate blueprint for site that already has blueprint | Display existing blueprint, provide option to regenerate |
| Carbon projection calculation encounters invalid data | Display error message, prevent blueprint save until data corrected |
| Map fails to load tiles | Display error message, provide reload option |
| NDVI slider interaction fails | Display static before/after images side-by-side as fallback |

## 6. Acceptance Criteria

1. User opens Dashboard and sees map of Kenya with red markers indicating detected deforestation sites
2. User clicks a red marker and navigates to Site Detail page showing before/after satellite images
3. User drags NDVI slider to compare 2022 baseline image with 2024 recent image, observing forest clearing
4. User clicks \"Generate Blueprint\" button and system generates reforestation layout
5. User views Blueprint Viewer page showing SVG CAD drawing with tree rows, species labels, spacing measurements, and contour lines
6. User views carbon projection chart displaying 5-year, 10-year, and 20-year CO₂ sequestration projections
7. User clicks \"Alert Officer\" button and SMS is sent to county forestry officer with site details and blueprint link
8. User navigates to Carbon Report page and views aggregate statistics across all sites

## 7. Out of Scope for Current Release

- Live satellite feed integration (using pre-loaded/seeded data only)
- Automated periodic satellite image analysis
- Multi-user authentication and role-based access control
- Historical trend analysis across multiple time periods
- Integration with additional satellite data sources beyond Sentinel-2
- Mobile application version
- Offline mode functionality
- Export formats beyond PDF and DXF
- Integration with carbon credit trading platforms
- Automated SMS scheduling or recurring alerts
- Multi-language support beyond English
- Advanced filtering and search on Dashboard map
- Batch blueprint generation for multiple sites
- Custom species database editing interface
- Integration with government forestry databases
- Real-time collaboration features
- Audit trail and change history tracking