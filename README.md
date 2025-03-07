# Store Rating Application

## Project Overview
This is a web application designed to allow users to rate and review stores, with different user roles and functionality.

## User Accounts For Reference ---

### Admin Credentials
- **Email**: admin@storerating.com
- **Password**: Admin@123

### Store Owners
1. Rajesh Kumar - Grocery Store Owner
   - Email: rajesh@grocerystore.com
   - Password: StoreOwner@12345
   - Address: Shop No. 123, Main Market Road, Andheri East, Mumbai, Maharashtra 400069
   - Role: Store Owner

2. Vikram Mehta - Online Reviewer
   - Email: vikram.mehta@example.com
   - Passowrd -Review@2024
   - Address: House No. 7, Seaview Colony, Juhu, Mumbai, Maharashtra 400049
   - Role: Store Owner

### Normal Users
1.  Priya Patel - Fashion Boutique Owner
   - Email: priya@fashionboutique.com
   - Password: Boutique@456
   - Address: Shop No. 45, Fashion Street, Bandra West, Mumbai, Maharashtra 400050
   - Role: Normal User

2. Amit Sharma - Regular Customer
   - Email: amit.sharma@example.com
   - Password: UserAmit@2024
   - Address: Flat 302, Sunshine Apartments, Malad West, Mumbai, Maharashtra 400064
   - Role: Normal User

3. Sneha Desai - Regular Shopper
   - Email: sneha.desai@example.com
   - Password: ShopperS@2024
   - Address: 15B, Green Valley Heights, Powai, Mumbai, Maharashtra 400076
   - Role: Normal User

####
NOTE-Please try running over local machines.Deployment For backend is not upto the Mark.

## User Roles
- **Admin**: Full system access
- **Store Owner**: Can manage their store, view reviews
- **Normal User**: Can create reviews, rate stores
- **Shop Owner**: Similar to Store Owner role

- A single login system should be implemented for all users. Based on their roles, users will
have access to different functionalities upon logging in.
Normal users should be able to sign up on the platform through a registration page.

## Password Guidelines
- Minimum 8 characters
- Maximum 16 characters
- At least 1 uppercase letter
- At least 1 special character

## Getting Started
1. Clone the repository
2. Install dependencies
3. Set up database
4. Run database migrations
5. Start the application
6. Log in using the admin or specific user credentials

## Security Notes
- Passwords are hashed and stored securely
- Use HTTPS for all communications
- Implement proper authentication and authorization

## Recommended Next Steps
- Implement two-factor authentication
- Add password reset functionality
- Create more granular user permissions

## Contribution
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

