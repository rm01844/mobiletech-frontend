Author

Raqeeb Mohamad
Built using Strapi & Node.js

---

##  `flow-project/README.md`
#  MobileTech Frontend

This repository hosts the **frontend** of the MobileTech project —  
a responsive, TailwindCSS-powered site that connects to the Strapi backend for dynamic content.

---

##  Features
- HTML, CSS, and JavaScript-based frontend
- **TailwindCSS** styling + **Flowbite UI** components
- Fetches product and service data from **Strapi backend**
- Responsive and mobile-friendly layout
- Ready for **Render Static Site** hosting

---

##  Tech Stack
- **HTML / JS / TailwindCSS**
- **Flowbite UI**
- **Render Static Hosting**
- **Strapi REST API integration**

---

##  Project Structure
```
flow-project/
├── index.html # Main landing page
├── products.html # Example product listing page
├── css/ # Tailwind & Flowbite CSS
├── js/ # API integration scripts
│ └── products.js
├── images/ # Assets and media
└── package.json # Static server configuration
```


---

##  Local Development

###  Clone the repository
```bash
git clone https://github.com/yourusername/flow-project.git
```
```
cd flow-project
```

### Install Dependencies 

```
npm install
```

### Run locally

```
npm start
```

### Deployment (Render)

Push this project to GitHub.

### Go to Render
 → New + → Static Site

Fill in:
```
Setting	            Value
Branch	            main
Build Command	    (leave empty, unless Tailwind needs build)
Publish Directory	/
```

If you need Tailwind to build, use:
```
npx tailwindcss -i ./input.css -o ./output.css --minify
```
