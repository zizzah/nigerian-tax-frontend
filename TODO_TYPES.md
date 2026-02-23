# TypeScript Fixes TODO

## Files to Fix:
- [ ] 1. products/page.tsx - Replace `any` with `Product` type
- [ ] 2. payments/page.tsx - Replace `any` with `Payment` type  
- [ ] 3. invoices/page.tsx - Replace `any` with `Invoice` type
- [ ] 4. documents/page.tsx - Replace `any` with `Document` type
- [ ] 5. customers/page.tsx - Replace `any` with `Customer` type
- [ ] 6. analytics/page.tsx - Replace `any` with proper types

## Types Available:
- Product, ProductSummary
- Payment, PaymentMethod
- Invoice, InvoiceItem, InvoiceStatus
- Document, DocumentType, ProcessingStatus
- Customer, CustomerSummary

## Implementation Steps:
1. Import proper types from @/lib/types
2. Replace `(variable: any)` with proper typing
3. Replace `map((item: any) =>` with proper types
