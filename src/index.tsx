import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './providers/ThemeProvider';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <main aria-label="个人主页">
          <h1 className="visually-hidden">刷新的个人主页</h1>
          <App />
        </main>
      </ThemeProvider>
    </React.StrictMode>,
  );
}
