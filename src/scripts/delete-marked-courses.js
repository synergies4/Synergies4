#!/usr/bin/env node

/**
 * Script to help identify and delete courses marked for removal
 * Run this script to see all courses and delete specific ones
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Course titles that appear to be marked with red X in the screenshot
const COURSES_TO_DELETE = [
  'Ethical AI Management',
  'Beyond the Script: Becoming an AI-Enhanced Customer Experience',
  'Scrum Start\'s with AI',
  'Advanced Agile Leadership', 
  'Agile Project Management',
  'AI-Powered Scrum Master',
  'AI Product Owner Mastery',
  'AI-Powered Executive Leadership',
  'Mental Fitness for Leaders'
];

async function fetchCourses() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/courses`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function deleteCourse(courseId, sessionToken) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete course');
    }

    return true;
  } catch (error) {
    console.error(`Error deleting course ${courseId}:`, error);
    return false;
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🔍 Fetching courses to identify ones marked for deletion...\n');
  
  const courses = await fetchCourses();
  
  if (courses.length === 0) {
    console.log('❌ No courses found or error fetching courses');
    rl.close();
    return;
  }

  console.log(`📚 Found ${courses.length} courses total\n`);
  
  // Find courses that match the ones marked for deletion
  const coursesToDelete = courses.filter(course => 
    COURSES_TO_DELETE.some(title => 
      course.title.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(course.title.toLowerCase())
    )
  );

  if (coursesToDelete.length === 0) {
    console.log('✅ No courses found matching the marked titles');
    
    // Show all courses for manual selection
    console.log('\n📋 All available courses:');
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (ID: ${course.id})`);
      console.log(`   Category: ${course.category} | Level: ${course.level}`);
      console.log(`   Price: $${course.price || 0} | Status: ${course.status || 'Unknown'}\n`);
    });
    
    const answer = await askQuestion('Would you like to manually delete specific courses? (y/n): ');
    if (answer.toLowerCase() === 'y') {
      const courseNumbers = await askQuestion('Enter course numbers to delete (comma-separated): ');
      const indices = courseNumbers.split(',').map(n => parseInt(n.trim()) - 1);
      
      for (const index of indices) {
        if (index >= 0 && index < courses.length) {
          const course = courses[index];
          console.log(`🗑️  Would delete: ${course.title}`);
          // You would need to provide session token for actual deletion
        }
      }
    }
  } else {
    console.log('🎯 Found courses matching the marked titles:');
    coursesToDelete.forEach((course, index) => {
      console.log(`${index + 1}. ❌ ${course.title} (ID: ${course.id})`);
      console.log(`   Category: ${course.category} | Level: ${course.level}`);
      console.log(`   Price: $${course.price || 0}\n`);
    });

    const answer = await askQuestion(`❓ Delete these ${coursesToDelete.length} courses? (y/n): `);
    
    if (answer.toLowerCase() === 'y') {
      console.log('\n⚠️  To delete courses, you need to:');
      console.log('1. Log into your admin panel');
      console.log('2. Go to the courses management page');
      console.log('3. Use the delete button (🗑️) for each course');
      console.log('\nOr provide a session token to this script for automated deletion.');
      
      const sessionToken = await askQuestion('Enter session token (or press Enter to skip): ');
      
      if (sessionToken.trim()) {
        console.log('\n🗑️  Deleting courses...');
        for (const course of coursesToDelete) {
          console.log(`Deleting: ${course.title}...`);
          const success = await deleteCourse(course.id, sessionToken.trim());
          if (success) {
            console.log(`✅ Deleted: ${course.title}`);
          } else {
            console.log(`❌ Failed to delete: ${course.title}`);
          }
        }
      }
    }
  }

  rl.close();
}

main().catch(console.error);