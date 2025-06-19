# Database Schema Update Summary

## Current Issues Identified:
1. Frontend sends pickup/delivery options and details that database doesn't support
2. API doesn't handle new pickup/delivery option fields
3. Database schema missing required columns for new functionality
4. Field name mismatches between frontend, API, and database

## Changes Made:

### 1. Database Schema Updates (run the SQL script):
- Added pickup_option, delivery_option columns with constraints
- Added pickup_address, pickup_date, delivery_address, delivery_date, delivery_time columns
- Added service_type, service_type_id, weight columns
- Added customer_name, customer_phone, customer_email columns
- Added midtrans_transaction_id, order_number columns
- Added pickup_time_text for time slot storage
- Added proper indices for performance
- Added auto-generated order numbers
- Added column comments for documentation

### 2. API Route Updates (completed):
- Updated to accept all new fields from frontend
- Added proper validation for pickup/delivery requirements
- Updated fee calculation to be dynamic based on options
- Updated order data structure to match new database schema
- Added proper outlet and session information

### 3. Frontend Updates (completed):
- Added default delivery date (3 days from now)
- Form already properly structured to send all required data

## Database Migration Script Location:
`scripts/update-orders-schema.sql`

## Next Steps:
1. Run the SQL script in Supabase SQL Editor
2. Test the order creation flow
3. Verify data is properly stored in all new columns
4. Update any existing orders if needed

## Field Mapping Summary:

### Frontend → API → Database:
- serviceType → service_type → service_type
- serviceTypeId → service_type_id → service_type_id
- pickupOption → pickup_option → pickup_option
- pickupAddress → pickup_address → pickup_address
- pickupDate → pickup_date → pickup_date
- pickupTime → pickup_time_text → pickup_time_text
- deliveryOption → delivery_option → delivery_option
- deliveryAddress → delivery_address → delivery_address
- deliveryDate → delivery_date → delivery_date
- deliveryTime → delivery_time → delivery_time
- contactName → customer_name → customer_name
- contactPhone → customer_phone → customer_phone
- transactionId → midtrans_transaction_id → midtrans_transaction_id

## Validation Rules:
- If pickup_option = 'pickup': pickup_address, pickup_date, pickup_time required
- If delivery_option = 'delivery': delivery_address, delivery_date, delivery_time required
- Contact name and phone always required
- Service type and service type ID always required
- Weight required only for 'kiloan' service type
- Items required only for 'satuan' service type
