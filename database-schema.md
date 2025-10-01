# Extended Database Schema for Construction Tracker

## Mermaid ERD

```mermaid
erDiagram
    %% Existing tables (extended)
    Plot {
        string id PK
        string mapId FK
        string name
        enum status
        int progress
        string description
        datetime startDate
        datetime endDate
        string contractor
        string notes
        float latitude
        float longitude
        json coordinates
        datetime createdAt
        datetime updatedAt
        %% New columns
        string streetAddress
        string homebuilderName FK
        string constructionTypeId FK
        string unitTypeId FK
        int numberOfBeds
        int numberOfStoreys
        float squareFootage
        decimal minimumSalePrice
    }

    Map {
        string id PK
        string name
        string slug
        string imagePath
        int naturalWidth
        int naturalHeight
        datetime createdAt
        datetime updatedAt
    }

    %% New master data tables
    Homebuilder {
        string id PK
        string name
        string contactEmail
        string contactPhone
        string address
        string website
        datetime createdAt
        datetime updatedAt
    }

    ConstructionType {
        string id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    ConstructionStage {
        string id PK
        string constructionTypeId FK
        string name
        string description
        int sortOrder
        string color
        datetime createdAt
        datetime updatedAt
    }

    UnitType {
        string id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }

    %% Sales and progress tracking tables
    SalesUpdate {
        string id PK
        string plotId FK
        datetime programmedDeliveryDate
        datetime actualDeliveryDate
        string notes
        string createdBy
        datetime createdAt
        datetime updatedAt
    }

    PlannedDeliveryDate {
        string id PK
        string salesUpdateId FK
        datetime plannedDate
        string reason
        datetime createdAt
    }

    ConstructionProgress {
        string id PK
        string plotId FK
        string constructionStageId FK
        int completionPercentage
        datetime recordedAt
        string notes
        string recordedBy
        datetime createdAt
        datetime updatedAt
    }

    %% Relationships
    Map ||--o{ Plot : "has many"
    Plot }o--|| Homebuilder : "built by"
    Plot }o--|| ConstructionType : "uses"
    Plot }o--|| UnitType : "is type"
    Plot ||--o{ SalesUpdate : "has many"
    Plot ||--o{ ConstructionProgress : "has many"
    
    ConstructionType ||--o{ ConstructionStage : "has many"
    ConstructionStage ||--o{ ConstructionProgress : "tracked in"
    
    SalesUpdate ||--o{ PlannedDeliveryDate : "has many planned dates"
```

## Key Design Decisions

### 1. **Homebuilder Table**
- Separate table for homebuilders with contact information
- Allows for proper normalization and future expansion

### 2. **Construction Types & Stages**
- `ConstructionType` (Timber Frame, Blockwork) links to multiple stages
- `ConstructionStage` includes sort order and color for UI display
- Based on your image: stages like "Piling complete", "Oversite complete", etc.

### 3. **Sales Updates & Delivery Tracking**
- `SalesUpdate` contains one programmed and one actual date
- `PlannedDeliveryDate` allows multiple planned dates per sales update
- Tracks reasons for date changes

### 4. **Construction Progress Tracking**
- `ConstructionProgress` captures percentage completion over time
- Links to specific construction stages
- Includes timestamp and responsible person tracking

### 5. **Unit Types**
- Flexible unit type system for different property types
- Supports beds, storeys, square footage, and pricing

### 6. **Data Integrity**
- Foreign key relationships maintain data consistency
- Unique constraints where appropriate
- Audit fields (createdAt, updatedAt, createdBy) throughout

## Initial Data for Construction Types & Stages

### Timber Frame Construction
1. Piling complete (White/Grey)
2. Oversite complete (Yellow)
3. Timber frame complete (Light Green)
4. Roof tiling complete (Orange)
5. Brickwork complete (Dark Yellow)
6. Build complete (Blue)

### Blockwork Construction
1. Piling complete (White/Grey)
2. Oversite complete (Yellow)
3. Brickwork complete (Light Yellow)
4. Roof tiling complete (Orange)
5. Build complete (Blue)