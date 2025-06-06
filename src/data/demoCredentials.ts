
export const demoCredentials = {
  staff: {
    email: 'staff@example.com',
    password: 'staff123',
    id: '2',
    name: 'Staff User',
    role: 'staff',
    registration_number: 'STAFF001'
  },
  student: {
    email: 'student@example.com',
    password: 'student123',
    id: '3',
    name: 'Student User',
    role: 'student',
    registration_number: 'STU001'
  },
  // Real admin user
  realAdmin: {
    email: 'achu73220@gmail.com',
    password: '12345678',
    id: '4',
    name: 'Real Admin User',
    role: 'admin',
    registration_number: 'ADMIN002'
  },
  // Super admin user
  superAdmin: {
    email: 'blue67388@gmail.com',
    password: 'superadmin@123',
    id: '5',
    name: 'Super Admin User',
    role: 'super_admin',
    registration_number: 'SADMIN001'
  }
};

// Function to get UUID format for demo credentials
// This helps with compatibility when using demo data with real Supabase schema
export const getFormattedDemoCredentials = () => {
  return {
    staff: {
      ...demoCredentials.staff,
      id: '00000000-0000-0000-0000-000000000002'
    },
    student: {
      ...demoCredentials.student,
      id: '00000000-0000-0000-0000-000000000003'
    },
    realAdmin: {
      ...demoCredentials.realAdmin,
      id: '00000000-0000-0000-0000-000000000004'
    },
    superAdmin: {
      ...demoCredentials.superAdmin,
      id: '00000000-0000-0000-0000-000000000005'
    }
  };
};
