# FormCraft - Form Builder SaaS

FormCraft is a full-stack SaaS form builder with customizable fields, analytics, tiered pricing plans, and Stripe integration.

## Features

- 📝 Create custom forms with drag-and-drop functionality
- 📊 Form analytics and submission tracking
- 💸 Tiered pricing with Free and Pro plans
- 💳 Stripe payment integration
- 📧 Email notifications for form submissions
- 🔒 User authentication and profile management
- 🎨 Customizable form themes
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React, TailwindCSS, ShadcnUI, React Query
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Authentication**: JWT-based auth
- **Payments**: Stripe integration
- **Email**: SMTP/SendGrid support

## Local Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd formcraft
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   Copy the example environment file and update with your credentials:

   ```bash
   cp .env.example .env
   ```

   You'll need to configure your PostgreSQL database and set up your SMTP and Stripe credentials.

4. **Database Setup**

   - For PostgreSQL: Provide your connection string in the DATABASE_URL env variable.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**

   Open your browser and navigate to `http://localhost:5000`

## Plans and Pricing

### Free Plan
- 3 custom forms
- Basic analytics
- 100 form submissions/month

### Pro Plan ($15/month)
- Unlimited forms
- Advanced analytics
- Unlimited submissions
- Email notifications
- Form expiration settings
- Priority support
- Custom themes
- API access

## API Access (Pro Plan)

The API documentation is available at `/api/docs` when running the application locally. This feature is available only for Pro plan users.

## Deployment

This application can be deployed to any Node.js hosting platform such as:

- Replit
- Vercel
- Heroku
- DigitalOcean
- AWS

## License

[MIT License](LICENSE)

## Support

For support, email support@formcraft.example.com or open an issue in the GitHub repository.