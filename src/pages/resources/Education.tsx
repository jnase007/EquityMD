import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { BookOpen, Play, FileText, Award } from 'lucide-react';

export function Education() {
  const courses = [
    {
      title: "Real Estate Investment Fundamentals",
      description: "Learn the basics of real estate investing, from market analysis to deal evaluation.",
      duration: "4 hours",
      modules: 8,
      level: "Beginner"
    },
    {
      title: "Advanced Deal Analysis",
      description: "Master the art of analyzing complex real estate investments and syndications.",
      duration: "6 hours",
      modules: 10,
      level: "Advanced"
    },
    {
      title: "Real Estate Syndication Mastery",
      description: "Everything you need to know about real estate syndication from start to finish.",
      duration: "8 hours",
      modules: 12,
      level: "Intermediate"
    }
  ];

  const resources = [
    {
      title: "Investment Guides",
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      items: [
        "Due Diligence Checklist",
        "Investment Terms Glossary",
        "Deal Analysis Templates",
        "Risk Assessment Guide"
      ]
    },
    {
      title: "Video Library",
      icon: <Play className="h-8 w-8 text-blue-600" />,
      items: [
        "Market Analysis Tutorials",
        "Financial Modeling Basics",
        "Deal Structure Examples",
        "Expert Interviews"
      ]
    },
    {
      title: "Certification Programs",
      icon: <Award className="h-8 w-8 text-blue-600" />,
      items: [
        "Real Estate Analysis",
        "Syndication Specialist",
        "Market Research Pro",
        "Due Diligence Expert"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl font-bold mb-6">
            Educational Resources
          </h1>
          <p className="text-xl text-blue-100">
            Comprehensive learning materials to help you succeed in real estate investing
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-16">
        {/* Featured Courses */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Featured Courses</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span className="ml-2 text-sm text-blue-600 font-medium">
                    {course.level}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>
                <div className="flex justify-between text-sm text-gray-500 mb-6">
                  <span>{course.duration}</span>
                  <span>{course.modules} modules</span>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Resources */}
        <div>
          <h2 className="text-2xl font-bold mb-8">Learning Resources</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  {resource.icon}
                  <h3 className="text-xl font-bold ml-3">{resource.title}</h3>
                </div>
                <ul className="space-y-3">
                  {resource.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mr-3" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}