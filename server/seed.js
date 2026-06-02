const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedData = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database for seeding...');

    // 2. Clear Existing Data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Database cleared.');

    // 3. Create Users
    console.log('Creating users...');
    
    // Admin user
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin',
    });

    // Member 1
    const member1 = await User.create({
      name: 'Alice Johnson',
      email: 'member@test.com',
      password: 'password123',
      role: 'Member',
    });

    // Member 2
    const member2 = await User.create({
      name: 'Bob Smith',
      email: 'member2@test.com',
      password: 'password123',
      role: 'Member',
    });

    console.log(`Seeded Users:
- Admin: admin@test.com
- Member 1: member@test.com
- Member 2: member2@test.com`);

    // 4. Create Project
    console.log('Creating project...');
    const project = await Project.create({
      name: 'Website Redesign',
      description: 'Rebuild corporate website with modern React and Tailwind styling, improving accessibility and dashboard reporting speeds.',
      createdBy: admin._id,
      members: [member1._id, member2._id],
    });

    console.log(`Seeded Project: ${project.name}`);

    // 5. Create Tasks
    console.log('Creating tasks...');
    const now = new Date();

    // Task 1: Pending (In Progress)
    const task1 = await Task.create({
      title: 'Design Homepage Mockup',
      description: 'Create high-fidelity landing page designs in Figma and obtain marketing team approval.',
      projectId: project._id,
      assignedTo: member1._id,
      status: 'In Progress',
      priority: 'High',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      createdBy: admin._id,
    });

    // Task 2: Pending (Todo)
    const task2 = await Task.create({
      title: 'Setup Database Schema',
      description: 'Define mongoose schemas for all models and set up relations.',
      projectId: project._id,
      assignedTo: member2._id,
      status: 'Todo',
      priority: 'Medium',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      createdBy: admin._id,
    });

    // Task 3: Completed
    const task3 = await Task.create({
      title: 'Write API Documentation',
      description: 'Draft API route specifications, headers, payloads, and response codes.',
      projectId: project._id,
      assignedTo: member1._id,
      status: 'Completed',
      priority: 'Low',
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      createdBy: admin._id,
    });

    // Task 4: Overdue (dueDate is past, status is not Completed)
    const task4 = await Task.create({
      title: 'Fix Authentication Bugs',
      description: 'Resolve CORS issues with cookies and invalid JWT signature handling during logout redirects.',
      projectId: project._id,
      assignedTo: member1._id,
      status: 'Todo',
      priority: 'High',
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdBy: admin._id,
    });

    console.log('Seeded 4 sample tasks.');
    console.log('Database seeding successfully completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
