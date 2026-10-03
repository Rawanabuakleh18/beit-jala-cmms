import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import './index.css';
import { setBaseUrl } from '@workspace/api-client-react';
import { apiOrigin } from './lib/api';

// Generated hooks (machines/login/users) and apiRequest (plans/requests)
// must always talk to the same server and enforce the same access scope.
setBaseUrl(apiOrigin || null);

createRoot(document.getElementById('root')!).render(<App />);
