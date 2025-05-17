import { db } from "./index";
import { users, forms, formAnalytics, formSubmissions } from "../shared/schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  try {
    console.log("Starting database seeding...");
    
    // Check if any users exist
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });
    
    if (existingUsers.length > 0) {
      console.log("Users already exist, skipping user seed.");
      return;
    }
    
    // Create sample users
    const passwordHash = await bcrypt.hash("password123", 10);
    
    // Create admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@formcraft.com",
      passwordHash: passwordHash,
      firstName: "Admin",
      lastName: "User",
      isVerified: true,
      planType: "pro",
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("Created admin user:", adminUser.email);
    
    // Create a regular user
    const [regularUser] = await db.insert(users).values({
      username: "demo",
      email: "demo@formcraft.com",
      passwordHash: passwordHash,
      firstName: "Demo",
      lastName: "User",
      isVerified: true,
      planType: "free",
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log("Created regular user:", regularUser.email);
    
    // Create sample forms for admin
    const sampleForms = [
      {
        userId: adminUser.id,
        title: "Customer Feedback Form",
        description: "Collect feedback from your customers about your product or service.",
        slug: "customer-feedback",
        isPublished: true,
        fields: [
          {
            id: uuidv4(),
            type: "text",
            label: "Name",
            placeholder: "Your name",
            required: true
          },
          {
            id: uuidv4(),
            type: "email",
            label: "Email",
            placeholder: "Your email",
            required: true
          },
          {
            id: uuidv4(),
            type: "select",
            label: "How would you rate our service?",
            options: [
              { label: "Excellent", value: "excellent" },
              { label: "Good", value: "good" },
              { label: "Average", value: "average" },
              { label: "Poor", value: "poor" }
            ],
            required: true
          },
          {
            id: uuidv4(),
            type: "textarea",
            label: "Additional comments",
            placeholder: "Please share your thoughts",
            required: false
          }
        ],
        settings: {
          theme: "light",
          submitButtonText: "Submit Feedback",
          successMessage: "Thank you for your feedback!"
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: adminUser.id,
        title: "Event Registration",
        description: "Register for our upcoming event.",
        slug: "event-registration",
        isPublished: true,
        fields: [
          {
            id: uuidv4(),
            type: "text",
            label: "Full Name",
            placeholder: "Your full name",
            required: true
          },
          {
            id: uuidv4(),
            type: "email",
            label: "Email",
            placeholder: "Your email address",
            required: true
          },
          {
            id: uuidv4(),
            type: "tel",
            label: "Phone Number",
            placeholder: "Your phone number",
            required: true
          },
          {
            id: uuidv4(),
            type: "select",
            label: "Session",
            options: [
              { label: "Morning", value: "morning" },
              { label: "Afternoon", value: "afternoon" },
              { label: "Evening", value: "evening" }
            ],
            required: true
          },
          {
            id: uuidv4(),
            type: "checkbox",
            label: "I agree to the terms and conditions",
            required: true
          }
        ],
        settings: {
          theme: "light",
          submitButtonText: "Register Now",
          successMessage: "Registration successful! We'll see you at the event."
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    for (const formData of sampleForms) {
      const [form] = await db.insert(forms).values(formData).returning();
      
      // Create analytics entry for each form
      await db.insert(formAnalytics).values({
        formId: form.id,
        views: Math.floor(Math.random() * 100) + 20,
        submissions: Math.floor(Math.random() * 30) + 5,
        conversionRate: (Math.random() * 30) + 10,
        averageCompletionTime: Math.floor(Math.random() * 120) + 60,
        updatedAt: new Date()
      });
      
      console.log(`Created form: ${form.title}`);
      
      // Create some sample submissions
      const submissionsCount = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < submissionsCount; i++) {
        await db.insert(formSubmissions).values({
          formId: form.id,
          data: {
            submissionData: "Sample submission data " + (i + 1)
          },
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
          ipAddress: "127.0.0.1",
          userAgent: "Seed Script"
        });
      }
      
      console.log(`Created ${submissionsCount} submissions for ${form.title}`);
    }
    
    // Create a form for regular user
    const regularUserForm = {
      userId: regularUser.id,
      title: "Contact Request",
      description: "A simple contact form.",
      slug: "contact-request",
      isPublished: true,
      fields: [
        {
          id: uuidv4(),
          type: "text",
          label: "Name",
          placeholder: "Your name",
          required: true
        },
        {
          id: uuidv4(),
          type: "email",
          label: "Email",
          placeholder: "Your email",
          required: true
        },
        {
          id: uuidv4(),
          type: "textarea",
          label: "Message",
          placeholder: "Your message",
          required: true
        }
      ],
      settings: {
        theme: "light",
        submitButtonText: "Send Message",
        successMessage: "Your message has been sent!"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [regularForm] = await db.insert(forms).values(regularUserForm).returning();
    
    // Create analytics entry for the regular user's form
    await db.insert(formAnalytics).values({
      formId: regularForm.id,
      views: Math.floor(Math.random() * 20) + 5,
      submissions: Math.floor(Math.random() * 10) + 2,
      conversionRate: (Math.random() * 20) + 5,
      averageCompletionTime: Math.floor(Math.random() * 60) + 30,
      updatedAt: new Date()
    });
    
    console.log(`Created form for regular user: ${regularForm.title}`);
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();