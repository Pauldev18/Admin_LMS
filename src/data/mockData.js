// Mock data for the LMS admin interface
export const mockCourses = [
  {
    id: 'course-1',
    title: 'Complete React Development Course',
    instructor: 'John Smith',
    category: 'Web Development',
    level: 'Intermediate',
    price: 99.99,
    discountPrice: 79.99,
    rating: 4.8,
    numReviews: 234,
    numStudents: 1250,
    status: 'Published',
    createdAt: '2024-01-15',
    thumbnail: 'https://images.pexels.com/photos/11035393/pexels-photo-11035393.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'course-2',
    title: 'Advanced JavaScript Concepts',
    instructor: 'Sarah Johnson',
    category: 'Programming',
    level: 'Advanced',
    price: 149.99,
    discountPrice: null,
    rating: 4.9,
    numReviews: 567,
    numStudents: 890,
    status: 'Published',
    createdAt: '2024-02-10',
    thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    instructor: 'Mike Chen',
    category: 'Design',
    level: 'Beginner',
    price: 69.99,
    discountPrice: 49.99,
    rating: 4.6,
    numReviews: 123,
    numStudents: 456,
    status: 'Draft',
    createdAt: '2024-03-05',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'course-4',
    title: 'Node.js Backend Development',
    instructor: 'John Smith',
    category: 'Backend Development',
    level: 'Intermediate',
    price: 129.99,
    discountPrice: null,
    rating: 4.7,
    numReviews: 189,
    numStudents: 678,
    status: 'Under Review',
    createdAt: '2024-02-20',
    thumbnail: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: 'course-5',
    title: 'Mobile App Design',
    instructor: 'Mike Chen',
    category: 'Mobile Design',
    level: 'Beginner',
    price: 89.99,
    discountPrice: 69.99,
    rating: 4.5,
    numReviews: 95,
    numStudents: 234,
    status: 'Archived',
    createdAt: '2024-01-10',
    thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Alice Cooper',
    email: 'alice@example.com',
    role: 'Student',
    enrolledCourses: 3,
    joinDate: '2024-01-10',
    status: 'Active',
    lastLogin: '2024-03-15'
  },
  {
    id: 'user-2',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Student',
    enrolledCourses: 1,
    joinDate: '2024-02-15',
    status: 'Active',
    lastLogin: '2024-03-14'
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'Student',
    enrolledCourses: 5,
    joinDate: '2023-12-01',
    status: 'Inactive',
    lastLogin: '2024-02-20'
  }
];

export const mockInstructors = [
  {
    id: 'instructor-1',
    name: 'John Smith',
    email: 'john@example.com',
    title: 'Senior Full Stack Developer',
    courses: 4,
    students: 2500,
    rating: 4.8,
    revenue: 15000,
    joinDate: '2023-08-15',
    status: 'Active'
  },
  {
    id: 'instructor-2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    title: 'JavaScript Expert',
    courses: 2,
    students: 1200,
    rating: 4.9,
    revenue: 8500,
    joinDate: '2023-10-20',
    status: 'Active'
  },
  {
    id: 'instructor-3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    title: 'UI/UX Designer',
    courses: 1,
    students: 456,
    rating: 4.6,
    revenue: 3200,
    joinDate: '2024-01-05',
    status: 'Pending'
  }
];

// Updated categories with parent-child relationships
export const mockCategories = [
  // Parent categories
  { 
    id: 1, 
    name: 'Development', 
    parentId: null, 
    courseCount: 85, 
    description: 'Programming and software development courses',
    status: 'Active',
    level: 0
  },
  { 
    id: 2, 
    name: 'Design', 
    parentId: null, 
    courseCount: 42, 
    description: 'Creative design and visual arts courses',
    status: 'Active',
    level: 0
  },
  { 
    id: 3, 
    name: 'Business', 
    parentId: null, 
    courseCount: 28, 
    description: 'Business and entrepreneurship courses',
    status: 'Active',
    level: 0
  },
  { 
    id: 4, 
    name: 'Data Science', 
    parentId: null, 
    courseCount: 19, 
    description: 'Data analysis and machine learning courses',
    status: 'Active',
    level: 0
  },
  
  // Child categories under Development
  { 
    id: 5, 
    name: 'Web Development', 
    parentId: 1, 
    courseCount: 45, 
    description: 'Frontend and backend web development',
    status: 'Active',
    level: 1
  },
  { 
    id: 6, 
    name: 'Mobile Development', 
    parentId: 1, 
    courseCount: 25, 
    description: 'iOS and Android app development',
    status: 'Active',
    level: 1
  },
  { 
    id: 7, 
    name: 'Game Development', 
    parentId: 1, 
    courseCount: 15, 
    description: 'Video game programming and design',
    status: 'Active',
    level: 1
  },
  
  // Child categories under Web Development
  { 
    id: 8, 
    name: 'Frontend Development', 
    parentId: 5, 
    courseCount: 28, 
    description: 'React, Vue, Angular and frontend technologies',
    status: 'Active',
    level: 2
  },
  { 
    id: 9, 
    name: 'Backend Development', 
    parentId: 5, 
    courseCount: 17, 
    description: 'Node.js, Python, PHP server-side development',
    status: 'Active',
    level: 2
  },
  
  // Child categories under Design
  { 
    id: 10, 
    name: 'UI/UX Design', 
    parentId: 2, 
    courseCount: 22, 
    description: 'User interface and user experience design',
    status: 'Active',
    level: 1
  },
  { 
    id: 11, 
    name: 'Graphic Design', 
    parentId: 2, 
    courseCount: 20, 
    description: 'Visual design and branding',
    status: 'Active',
    level: 1
  },
  
  // Child categories under UI/UX Design
  { 
    id: 12, 
    name: 'Mobile Design', 
    parentId: 10, 
    courseCount: 12, 
    description: 'Mobile app interface design',
    status: 'Active',
    level: 2
  },
  { 
    id: 13, 
    name: 'Web Design', 
    parentId: 10, 
    courseCount: 10, 
    description: 'Website interface design',
    status: 'Active',
    level: 2
  },
  
  // Child categories under Business
  { 
    id: 14, 
    name: 'Marketing', 
    parentId: 3, 
    courseCount: 18, 
    description: 'Digital marketing and advertising',
    status: 'Active',
    level: 1
  },
  { 
    id: 15, 
    name: 'Management', 
    parentId: 3, 
    courseCount: 10, 
    description: 'Project and team management',
    status: 'Inactive',
    level: 1
  }
];

export const mockReviews = [
  {
    id: 1,
    courseName: 'Complete React Development Course',
    studentName: 'Alice Cooper',
    rating: 5,
    comment: 'Excellent course! Very comprehensive and well-structured.',
    date: '2024-03-10',
    status: 'Approved'
  },
  {
    id: 2,
    courseName: 'Advanced JavaScript Concepts',
    studentName: 'Bob Wilson',
    rating: 4,
    comment: 'Good content but could use more examples.',
    date: '2024-03-08',
    status: 'Pending'
  },
  {
    id: 3,
    courseName: 'UI/UX Design Fundamentals',
    studentName: 'Carol Davis',
    rating: 2,
    comment: 'Too basic for my needs.',
    date: '2024-03-05',
    status: 'Flagged'
  }
];

export const dashboardStats = {
  totalCourses: 124,
  totalUsers: 2847,
  totalInstructors: 45,
  totalRevenue: 156750,
  courseGrowth: 12.5,
  userGrowth: 8.3,
  instructorGrowth: 15.2,
  revenueGrowth: 22.1
};

// Helper functions for categories
export const getCategoryHierarchy = () => {
  const categories = [...mockCategories];
  const categoryMap = {};
  const rootCategories = [];

  // Create a map for quick lookup
  categories.forEach(cat => {
    categoryMap[cat.id] = { ...cat, children: [] };
  });

  // Build the hierarchy
  categories.forEach(cat => {
    if (cat.parentId === null) {
      rootCategories.push(categoryMap[cat.id]);
    } else {
      if (categoryMap[cat.parentId]) {
        categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
      }
    }
  });

  return rootCategories;
};

export const getCategoryPath = (categoryId) => {
  const findPath = (categories, targetId, path = []) => {
    for (const category of categories) {
      const currentPath = [...path, category];
      if (category.id === targetId) {
        return currentPath;
      }
      if (category.children && category.children.length > 0) {
        const result = findPath(category.children, targetId, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  return findPath(getCategoryHierarchy(), categoryId);
};

export const getFlatCategories = () => {
  return mockCategories.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });
};