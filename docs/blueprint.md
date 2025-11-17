# **App Name**: EstateHub

## Core Features:

- Role-Based Authentication: Secure user authentication using email/password with AppAuth, assigning roles (Admin, Apartment, Contractor, Security) upon signup by Admin.
- Entity Module Access: Display of relevant entity module (Apartment, Contractor, Security, Admin) with content filtered based on the user's assigned role.
- Admin Entity Enrollment: Admin interface to enroll entities (Resident, Utility, Security, other Admins), assigning roles that are stored in the Firestore database.
- QR Code Generation: Generation of QR codes for each Apartment and Contractor for identity verification by Security and Admin.
- Payment Tracking: Enable apartment and contractor modules to display payment history, payment due. Also enables security modules to see payment made only to the security user (user level privacy implemented) from Admin.
- Transaction Logging: Securely record all transaction details (time, ID, method) with the admin role, available only to security and admin users. The method is to be verified with Admin role.
- Security Pass Evaluation: An edge function is used to evaluate incoming scans based on the details encoded into the QR code of the payment user and returning the verdict (PASS/FAIL) with the Security module.
- Admin Settings: Admin controls a settings page for rate management (Rates for Apartment (size in sqft) can be fixed or based on square feet area (1day Pass = Rs 0.3/sqft, 7-day pass =Rs 0.5/sqft, 1month pass = Rs 1/sqft)), payment history overview, and management of work shifts for security personnel. This would function as a tool.
- Security Attendance Relay: Capture incoming and outgoing security using attendance details with relayed scanning (scanning QR codes and capturing time) logged from both the outgoing and incoming staff.

## Style Guidelines:

- Primary color: A calm blue (#5DADE2) to convey trust and security, reflecting the core function of the app.
- Background color: Light gray (#F0F4F7) provides a neutral backdrop, ensuring content is easily readable.
- Accent color: A muted green (#A3E4D7) to highlight key actions and elements, promoting a sense of ease and efficiency.
- Headline font: 'Space Grotesk' sans-serif for a contemporary and structured look.
- Body font: 'Inter' sans-serif ensuring readability and a modern feel for all user interfaces.
- Use consistent, clear icons that represent each module and action within the app.
- Employ a modular layout to allow for flexibility and future scalability of different modules.
- Subtle transitions and loading animations to provide a smooth and responsive user experience.