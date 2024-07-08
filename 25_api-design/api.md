# API Definition

## Entity Definitions

### Charge

- id: uuid
- customerId: uuid
- amount: integer
- currency: string (or currency-code enum)
- status: enum ["succeeded", "pending", "failed"]

### ChargeCreation

- customerId: uuid
- amount: integer
- currency: string (or currency-code enum)
- status: enum ["succeeded", "pending", "failed"]

### ChargeUpdate

- customerId: uuid
- amount: integer
- currency: string (or currency-code enum)
- status: enum ["succeeded", "pending", "failed"]

### Customer

- id: uuid
- name: string
- address: string
- email: string
- card: Card

### CustomerCreation

- name: string
- address: string
- email: string
- card: Card

### CustomerUpdate

- name: string
- address: string
- email: string
- card: Card

### Card

## Endpoint Definitions

### Charges

- createCharge :: ChargeCreation -> Charge
- getCharge :: ChargeId -> Charge
- updateCharge :: ChargeId -> ChargeUpdate -> Charge
- listCharges :: (Offset, Limit) -> [Charge]
- captureCharge :: ChargeId -> Charge

### Customers

- createCustomer :: CustomerCreation -> Customer
- getCustomer :: CustomerID -> Customer
- updateCustomer :: CustomerId -> CustomerUpdate -> Customer
- deleteCustomer :: CustomerId -> Customer
- listCustomers :: (Offset, Limit) -> [Customer]

## Good API Reference Resources

- <https://docs.stripe.com/api>
- <https://developer.twitter.com/en/docs/twitter-api/pagination>
- <https://developers.google.com/youtube/v3/docs>
