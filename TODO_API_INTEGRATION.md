# API Integration TODO

## Pages to Update
- [x] Dashboard (main) - `/dashboard` - Already integrated
- [x] Customers - `/customers` - Already integrated
- [x] Products - `/products` - Already integrated
- [x] Invoices - `/invoices` - Already integrated
- [x] Payments - `/payments` - Already integrated
- [x] Documents - `/documents` - Integrated with useDocuments hook
- [x] Analytics - `/analytics` - Integrated with API hooks

## Hooks Used
- useCustomers() + useCustomerStats()
- useProducts()
- useInvoices() + useInvoiceStats()
- usePayments()
- useDocuments() + useUploadDocument()

## Summary
All dashboard pages have been integrated with the API. The following pages now fetch real data:
- Dashboard: useInvoices, useInvoiceStats, useCustomers, usePayments
- Customers: useCustomers, useCustomerStats
- Products: useProducts
- Invoices: useInvoices, useInvoiceStats
- Payments: usePayments
- Documents: useDocuments, useUploadDocument
- Analytics: useInvoiceStats, useInvoices, useCustomers, usePayments
