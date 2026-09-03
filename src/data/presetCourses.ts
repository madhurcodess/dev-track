import type { Course } from '../types';

export const PRESET_COURSES: Course[] = [
  {
    id: 'course-java-full',
    title: 'Java Full Course for Beginners (From Zero to Hero)',
    author: 'Bro Code / Tech Academy',
    description: 'Master Object-Oriented Programming, Core Java syntax, Methods, Classes, Collections, and Exception Handling.',
    playlistId: 'PLZPZq0r_RZOMhSXeAWSl55lVO0x8K_u',
    videos: [
      {
        id: 'java-1',
        youtubeId: 'xk4_1vDrzzo',
        title: '01. Java Full Course - Introduction & First Java Program',
        duration: '12:45',
        completed: true,
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=320&auto=format&fit=crop&q=80',
      },
      {
        id: 'java-2',
        youtubeId: '8cm1x4bC610',
        title: '02. Variables, Primitive Data Types & Strings in Java',
        duration: '18:20',
        completed: true,
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=320&auto=format&fit=crop&q=80',
      },
      {
        id: 'java-3',
        youtubeId: 'A74TOX803D0',
        title: '03. User Input (Scanner Class) & Math Operators',
        duration: '15:10',
        completed: false,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=320&auto=format&fit=crop&q=80',
      },
      {
        id: 'java-4',
        youtubeId: 'P_3b4bI2n9E',
        title: '04. If Statements, Logical Operators & Switches',
        duration: '22:05',
        completed: false,
      },
      {
        id: 'java-5',
        youtubeId: 'N630b9n8qQY',
        title: '05. While Loops, For Loops & Nested Loops',
        duration: '20:15',
        completed: false,
      },
      {
        id: 'java-6',
        youtubeId: 'bSrm9RXwBaI',
        title: '06. Arrays & 2D Arrays in Depth',
        duration: '19:40',
        completed: false,
      },
      {
        id: 'java-7',
        youtubeId: '7085a53kK1w',
        title: '07. Methods & Variable Scope in Java',
        duration: '16:30',
        completed: false,
      },
      {
        id: 'java-8',
        youtubeId: 'BGTxAGW0W3s',
        title: '08. Object-Oriented Programming: Classes & Objects',
        duration: '25:40',
        completed: false,
      },
      {
        id: 'java-9',
        youtubeId: 'U_A9FhN92E8',
        title: '09. Constructors, this Keyword & Method Overloading',
        duration: '21:15',
        completed: false,
      },
      {
        id: 'java-10',
        youtubeId: '9Jp4f1-63Jk',
        title: '10. Inheritance, Polymorphism & Abstract Classes',
        duration: '28:50',
        completed: false,
      },
      {
        id: 'java-11',
        youtubeId: 'X48VuDVv0do',
        title: '11. Exception Handling (try-catch-finally) & Custom Exceptions',
        duration: '23:10',
        completed: false,
      },
      {
        id: 'java-12',
        youtubeId: '13m0yMcrnps',
        title: '12. Java Collections Framework: ArrayList & HashMap',
        duration: '31:25',
        completed: false,
      }
    ]
  },
  {
    id: 'course-react-fullstack',
    title: 'Modern Full-Stack Web Development Bootcamp',
    author: 'Code With Antonio',
    description: 'Learn modern React 19, TypeScript, Tailwind CSS, REST APIs, and responsive design architecture.',
    playlistId: 'PL4cUxeGkcC9gZD-TeehJE_bPUOR35-u',
    videos: [
      {
        id: 'react-1',
        youtubeId: 'w7ejDZ8SWv8',
        title: '01. React 19 Crash Course - Components, JSX & Props',
        duration: '35:20',
        completed: true,
      },
      {
        id: 'react-2',
        youtubeId: 'O6P86uwfdR0',
        title: '02. State Management with useState and useEffect Hooks',
        duration: '42:15',
        completed: false,
      },
      {
        id: 'react-3',
        youtubeId: 'LDB4uaJ87e0',
        title: '03. Tailwind CSS & Responsive Layout Mastery',
        duration: '28:40',
        completed: false,
      },
      {
        id: 'react-4',
        youtubeId: '4pO-HcG2igk',
        title: '04. Building Custom Hooks & API Integration',
        duration: '31:50',
        completed: false,
      },
      {
        id: 'react-5',
        youtubeId: 'j8s01ThR7qc',
        title: '05. Full Stack Project: Production Deployment & Optimization',
        duration: '48:10',
        completed: false,
      }
    ]
  },
  {
    id: 'course-dsa-java',
    title: 'Data Structures & Algorithms Masterclass (Java)',
    author: 'Kunal Kushwaha',
    description: 'Comprehensive DSA training covering Complexity Analysis, Arrays, Linked Lists, Trees, Graphs, and Dynamic Programming.',
    playlistId: 'PL9gnSGHSqcnr_Um34A2HAq24i8qTN0u',
    videos: [
      {
        id: 'dsa-1',
        youtubeId: 'rZ41y93P2Qo',
        title: '01. Space and Time Complexity Analysis (Big-O Notation)',
        duration: '45:10',
        completed: false,
      },
      {
        id: 'dsa-2',
        youtubeId: 'fNzpcB7ODxQ',
        title: '02. Binary Search in Java - Patterns and Edge Cases',
        duration: '52:30',
        completed: false,
      },
      {
        id: 'dsa-3',
        youtubeId: '58YbpGq3y4g',
        title: '03. Recursion & Divide-and-Conquer Fundamentals',
        duration: '40:15',
        completed: false,
      },
      {
        id: 'dsa-4',
        youtubeId: '58YbpGq3y4h',
        title: '04. Singly & Doubly Linked Lists Implementation',
        duration: '38:50',
        completed: false,
      },
      {
        id: 'dsa-5',
        youtubeId: '58YbpGq3y4i',
        title: '05. Trees & Binary Search Tree Traversal Algorithms',
        duration: '55:00',
        completed: false,
      }
    ]
  }
];

export const INITIAL_NOTE_TEMPLATE = `# 📝 Course Notes & Key Learnings

### 🎯 Session Objectives
- [ ] Understand the core concepts explained in this lecture
- [ ] Implement hands-on code examples
- [ ] Document tricky syntax and edge cases

---

### ⏱️ Timestamped Key Moments
Click any timestamp below to jump directly to that point in the lecture:
- [01:15] Overview of the architecture & fundamentals
- [04:30] Practical demonstration & code walkthrough
- [10:45] Common pitfalls and debugging tips

---

### 💻 Code Snippet (Java)
\`\`\`java
public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, DevTrack Learning Platform!");
        
        // Example: Quick iteration
        int[] scores = { 95, 88, 92, 100 };
        for (int score : scores) {
            if (score >= 90) {
                System.out.println("High distinction: " + score);
            }
        }
    }
}
\`\`\`

### 📌 Summary & Follow-up Actions
- Key takeaway: Consistent practice reinforces retention.
- Next step: Attempt the coding exercise before the next module.
`;
