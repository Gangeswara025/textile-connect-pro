# B2B Textile Platform - Simple Use Case Diagram

```mermaid
graph TD
    %% Actors
    Admin[Admin]
    Buyer[Buyer]
    
    %% Main Use Cases
    Admin --> AdminDashboard[Admin Dashboard]
    Admin --> ManageBuyers[Manage Buyers]
    Admin --> ManageOrders[Manage Orders]
    Admin --> CreateQuotes[Create Quotations]
    Admin --> ManageInvoices[Manage Invoices]
    
    Buyer --> BuyerDashboard[Buyer Dashboard]
    Buyer --> BrowseProducts[Browse Products]
    Buyer --> PlaceOrders[Place Orders]
    Buyer --> ViewOrders[View My Orders]
    Buyer --> ViewQuotes[View Quotations]
    Buyer --> ProcessPayments[Process Payments]
    Buyer --> ViewInvoices[View Invoices]
    
    %% Shared Processes
    Login[Login/Logout]
    Register[Registration]
    EmailVerify[Email Verification]
    
    %% Connections
    Register --> EmailVerify
    EmailVerify --> Login
    Login --> AdminDashboard
    Login --> BuyerDashboard
    
    PlaceOrders --> ManageOrders
    ManageOrders --> CreateQuotes
    CreateQuotes --> ViewQuotes
    ViewQuotes --> ProcessPayments
    ProcessPayments --> ManageInvoices
    ManageInvoices --> ViewInvoices
    
    %% Styling
    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef usecase fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    
    class Admin,Buyer actor
    class AdminDashboard,ManageBuyers,ManageOrders,CreateQuotes,ManageInvoices,BuyerDashboard,BrowseProducts,PlaceOrders,ViewOrders,ViewQuotes,ProcessPayments,ViewInvoices,Login,Register,EmailVerify usecase
```

## Key Workflows

### **Registration Flow**
Register → EmailVerify → Login

### **Order Flow**
PlaceOrders → ManageOrders → CreateQuotes → ViewQuotes → ProcessPayments → ManageInvoices → ViewInvoices

### **Main Functions**
- **Admin**: Dashboard, Buyer Management, Order Processing, Quotations, Invoices
- **Buyer**: Dashboard, Product Browsing, Order Placement, Payment, Invoice Management
