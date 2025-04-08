import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title
document.title = "HomeHelp - Connect with Verified Service Providers";

// Add meta description
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Connect with reliable plumbers, electricians, and landscapers in your area. Book services with confidence using our trusted platform.';
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
