/* App Container */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--app-bg, #ffffff);
}

/* Loading Screen */
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--app-bg, #ffffff);
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Network Banner */
.network-banner {
  background-color: var(--warning-bg, #fff3cd);
  color: var(--warning-text, #856404);
  text-align: center;
  padding: 0.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Header */
.app-header {
  padding: 1rem;
  background: var(--header-bg, #f8f9fa);
  border-bottom: 1px solid var(--border-color, #dee2e6);
}

.app-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted, #6c757d);
}

/* Main Content */
.app-content {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Footer */
.app-footer {
  padding: 1rem;
  text-align: center;
  background: var(--footer-bg, #f8f9fa);
  border-top: 1px solid var(--border-color, #dee2e6);
  font-size: 0.875rem;
  color: var(--text-muted, #6c757d);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Screen */
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background: var(--error-bg, #fff5f5);
}

.error-screen button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--primary-color, #3498db);
  color: white;
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 0.5rem;
  }

  .app-content {
    padding: 0.5rem;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .app {
    --app-bg: #ffffff;
    --text-color: #000000;
    --border-color: #000000;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .app {
    --app-bg: #1a1a1a;
    --header-bg: #2d2d2d;
    --footer-bg: #2d2d2d;
    --text-color: #ffffff;
    --text-muted: #a0a0a0;
    --border-color: #404040;
  }
}
