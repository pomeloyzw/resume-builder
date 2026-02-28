# Premium Resume Builder

A modern, dynamic, and fully client-side Resume Builder designed to help users create elegant, professional resumes with ease. Built with Next.js, this application features a split-screen design with a fully customizable data entry form on the left and a stunning, live-updating PDF preview on the right. 

## ✨ Key Features

- **Live PDF Preview**: See your resume update in real-time as you type, with accurate page breaks and formatting.
- **Multiple Templates**: Choose between a traditional single-column Classic design or a sleek, two-column Modern layout.
- **Dynamic Section Management**:
  - Add completely custom sections (e.g., "Projects", "Awards").
  - Drag and drop entire sections to reorder your resume's macro structure.
  - Drag and drop individual items within an experience or education block to fix chronological order.
  - Visually hide sections directly from the PDF without deleting their data in the builder.
- **Rich Array Inputs**: Clean, tag-based UI components (pills) for entering Skills, Languages, and Hobbies without worrying about comma separation formatting errors.
- **100% Client-Side Persistence**: 
  - All form data, section reordering, and template choices are automatically saved securely to your browser's Local Storage using Zustand. You never lose your progress!
- **High-Quality Export**: Leveraging the browser's native print engine for perfect pixel-to-pixel PDF generation with fully selectable text.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first, responsive design.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for robust, boilerplate-free state logic and local storage persistence.
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/) for complex nested sortable lists (both macro-sections and micro-items).
- **Icons**: [Lucide React](https://lucide.dev/)
- **PDF Generation**: [react-to-print](https://www.npmjs.com/package/react-to-print)

## 🚀 Local Environment Setup

To run the Premium Resume Builder locally on your machine, follow these steps:

### Prerequisites
Make sure you have Node.js (v18 or higher) and npm installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd resume-builder
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```
   *Note: If you encounter peer dependency warnings related to React 19, you can append `--legacy-peer-deps`.*

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to `http://localhost:3000` in your web browser. 

### Building for Production
To create an optimized production build:
```bash
npm run build
npm run start
```

## 📝 License
This project is open source and available under the MIT License.
