import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router'

console.log("Mounting application...");

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
      console.error("Root element not found");
  } else {
      createRoot(rootElement).render(
        <StrictMode>
          <AppRouter />
        </StrictMode>,
      )
      console.log("Application mounted.");
  }
} catch (e) {
  console.error("Error mounting application:", e);
}
