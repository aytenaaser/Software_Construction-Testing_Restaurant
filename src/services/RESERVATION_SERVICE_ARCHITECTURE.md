# Reservation Service - Architecture & Design Patterns

## Overview
This document explains the architecture, design patterns, and SOLID principles applied to the Reservation Service implementation.

---

## 📋 SOLID Principles Implementation

### 1. **Single Responsibility Principle (SRP)**

Each class has a single, well-defined responsibility:

- **ReservationService**: Only handles reservation business logic
- **ReservationController**: Only handles HTTP routing and request/response mapping
- **Validators**: Each validator handles one specific validation concern
- **DTOs**: Only validate and transform data

```
ReservationService → Business Logic
ReservationController → HTTP Handling
BusinessHoursValidator → Time validation
FutureDateValidator → Date validation
PartySizeValidator → Party size validation
```

### 2. **Open/Closed Principle (OCP)**

The service is **open for extension, closed for modification**:

#### Strategy Pattern for Validators
```typescript
interface ReservationValidationStrategy {
    validate(reservation): Promise<ValidationResult>;
}

// Easy to add new validators without modifying existing code
class NewValidator implements ReservationValidationStrategy {
    // Implementation
}

// Composition without modification
this.validator = new CompositeReservationValidator([
    new BusinessHoursValidator(),
    new FutureDateValidator(),
    new PartySizeValidator(),
    // NEW: new NewValidator() - add here, no modification needed
]);
```

### 3. **Liskov Substitution Principle (LSP)**

All validators implement the same interface and are interchangeable:

```typescript
// Any validator can replace another without breaking code
const validators: ReservationValidationStrategy[] = [
    new BusinessHoursValidator(),
    new FutureDateValidator(),
    new PartySizeValidator(),
];

// Works with any implementation of ReservationValidationStrategy
validators.forEach(v => v.validate(reservation));
```

### 4. **Interface Segregation Principle (ISP)**

Small, focused interfaces instead of large, monolithic ones:

```typescript
// Segregated interface - only what's needed
interface ReservationValidationStrategy {
    validate(reservation): Promise<ValidationResult>;
}

// Not:
// interface ReservationInterface {
//     validate, create, update, delete, ...
// }
```

### 5. **Dependency Inversion Principle (DIP)**

Depends on abstractions, not concrete implementations:

```typescript
// ❌ Bad: Depends on concrete class
constructor(validator: BusinessHoursValidator) {}

// ✅ Good: Depends on abstraction
constructor(validator: ReservationValidationStrategy) {}

// Injected at construction time
this.validator = new CompositeReservationValidator([...])
```

---

## 🎯 Separation of Concerns

### Layer Architecture

```
┌─────────────────────────────────────────┐
│      HTTP Layer (Controller)             │
│  - Handle requests/responses             │
│  - Input validation (DTO)                │
│  - Apply security guards                 │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│    Business Logic Layer (Service)        │
│  - Reservation operations                │
│  - Validation orchestration              │
│  - Business rules enforcement            │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│    Validation Layer (Validators)         │
│  - Business hour rules                   │
│  - Date constraints                      │
│  - Party size limits                     │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│  Data Access Layer (Repository/Model)    │
│  - Database operations                   │
│  - Query execution                       │
└─────────────────────────────────────────┘
```

### Responsibility Distribution

| Layer | Responsibility |
|-------|-----------------|
| **Controller** | HTTP handling, routing, parameter extraction |
| **DTO** | Input/output data validation & transformation |
| **Service** | Business logic, validation orchestration |
| **Validators** | Specific business rule validation |
| **Schema/Model** | Database structure & indexing |

---

## 🔄 Programming Paradigms

### Imperative Style (Procedural)

Used for: **Complex operations with side effects**

```typescript
// Step-by-step, explicit control flow
async create(dto: CreateReservationDto) {
    // Step 1: Validate
    const validationResult = await this.validator.validate(dto);
    if (!validationResult.valid) throw error;
    
    // Step 2: Check duplicates
    const existing = await this.reservationModel.findOne(...);
    if (existing) throw ConflictException;
    
    // Step 3: Create
    const reservation = new this.reservationModel(dto);
    
    // Step 4: Save
    const saved = await reservation.save();
    
    // Step 5: Return
    return this.mapToResponseDto(saved);
}
```

**Characteristics:**
- Clear, sequential operations
- Explicit error handling
- Easy to debug
- Follows natural "what to do" logic

### Declarative Style (Functional)

Used for: **Data retrieval and transformation**

```typescript
// Describe what we want, not how to do it
async findByDateRange(startDate, endDate): Promise<ReservationResponseDto[]> {
    return this.reservationModel
        .find({
            reservationDate: {
                $gte: startDate,
                $lte: endDate,
            },
        })
        .sort({ reservationDate: 1 })
        .lean()
        .exec()
        .then(reservations =>
            reservations.map(res => this.mapToResponseDto(res))
        );
}
```

**Characteristics:**
- Chain of operations
- Composition of functions
- Immutable data transformations
- Expresses intent clearly

---

## 🏗️ Design Patterns Used

### 1. **Strategy Pattern**
```
┌─────────────────────┐
│  ReservationService │
└──────────┬──────────┘
           │ uses
           ▼
┌─────────────────────────────────────────────┐
│   ReservationValidationStrategy             │
│   ┌─────────────────────────────────────┐   │
│   │  BusinessHoursValidator             │   │
│   │  FutureDateValidator                │   │
│   │  PartySizeValidator                 │   │
│   │  CompositeReservationValidator      │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Benefits:**
- Easy to add new validators
- Runtime strategy selection
- Testable in isolation

### 2. **Composite Pattern**
```typescript
class CompositeReservationValidator implements ReservationValidationStrategy {
    constructor(private validators: ReservationValidationStrategy[]) {}
    
    async validate(reservation) {
        // Treats collection of validators as single validator
        const results = await Promise.all(
            this.validators.map(v => v.validate(reservation))
        );
        return { valid: allValid, errors: allErrors };
    }
}
```

**Benefits:**
- Combine validators flexibly
- Uniform interface
- Easy to extend

### 3. **DTO Pattern (Data Transfer Object)**
```
Controller ──Input DTO──► Service
                         │
                         └──Output DTO──► Controller ──HTTP Response──► Client
```

**Benefits:**
- Decouples API from internal models
- Consistent API contracts
- Validation at API boundary

### 4. **Mapper Pattern**
```typescript
private mapToResponseDto(reservation: any): ReservationResponseDto {
    return {
        id: reservation._id?.toString(),
        customerName: reservation.customerName,
        // ... transform internal format to API format
    };
}
```

**Benefits:**
- Encapsulates transformation logic
- Reusable mapping
- Type safety

---

## 📊 Code Quality Metrics

### Modularity
- **5 separate modules**: Service, Controller, Validators, DTOs, Schema
- **Clear boundaries**: Each module has single responsibility
- **Low coupling**: Modules communicate through interfaces
- **High cohesion**: Related functionality grouped together

### Reusability
- **Validators are reusable** across different services
- **DTOs follow naming conventions** for easy discovery
- **Mapper function is private** but could be extracted to utility
- **Service methods are composable** and chainable

### Testability
```typescript
// Easy to test because:

// 1. Strategy pattern allows mock validators
const mockValidator = { validate: () => ({ valid: true, errors: [] }) };

// 2. DTOs can be tested independently
const dto = new CreateReservationDto();

// 3. Service methods are isolated
service.findByDateRange(start, end); // Pure function-like behavior

// 4. No hard dependencies
constructor(private reservationModel: Model<ReservationDocument>) {}
```

### Maintainability
- **Clear naming**: Classes, methods, variables are self-documenting
- **Small methods**: Each method does one thing
- **Comments explain why**: Not what (code shows that)
- **Consistent patterns**: Same approach throughout

---

## 🚀 Usage Examples

### Creating a Reservation
```typescript
// Imperative: Step-by-step process
const dto: CreateReservationDto = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    reservationDate: new Date('2024-12-25'),
    reservationTime: '19:00',
    partySize: 4,
    tableId: 'table123',
    userId: 'user456',
};

const reservation = await service.create(dto);
```

### Finding Reservations by Date
```typescript
// Declarative: Composition of queries
const reservations = await service.findByDateRange(
    new Date('2024-12-01'),
    new Date('2024-12-31')
);
```

### Checking Availability
```typescript
// Declarative: Query and transform
const availability = await service.getAvailability(
    new Date('2024-12-25'),
    '19:00',
    4
);
```

---

## 🔐 Validation Flow

```
API Request
    │
    ├─► DTO Validation (class-validator)
    │   └─► Type checking & format validation
    │
    └─► Service Validation (Business Rules)
        ├─► BusinessHoursValidator
        │   └─► 10:00 - 22:00 check
        │
        ├─► FutureDateValidator
        │   └─► 2+ hours advance check
        │
        └─► PartySizeValidator
            └─► 1-20 range check
```

---

## 📈 Extensibility

### Adding a New Validator

```typescript
// 1. Implement interface
export class WeekendPremiumValidator implements ReservationValidationStrategy {
    async validate(reservation: any) {
        const dayOfWeek = reservation.reservationDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Weekend pricing logic
        }
        return { valid, errors };
    }
}

// 2. Add to composite
this.validator = new CompositeReservationValidator([
    new BusinessHoursValidator(),
    new FutureDateValidator(),
    new PartySizeValidator(),
    new WeekendPremiumValidator(), // NEW
]);
```

### No modification to existing code needed! ✨

---

## 🎓 Learning Path

To understand this architecture:

1. Start with **DTOs** - understand data flow
2. Learn **Validators** - understand validation strategies
3. Study **Service** - understand business logic composition
4. Review **Controller** - understand HTTP layer
5. Examine **Module** - understand dependency injection

---

## 📚 References

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [NestJS Documentation](https://docs.nestjs.com)
- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)

