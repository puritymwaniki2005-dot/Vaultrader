import { configure } from 'mobx';
import ReactDOM from 'react-dom/client';
import { AuthWrapper } from './app/AuthWrapper';
import {
    applyBrandFontFromConfig,
    applyDocumentTitle,
    applyFaviconFromLogo,
    applyPrimaryColorFromConfig,
} from './utils/document-branding';
import { applyReact19DomPolyfills } from './utils/react19-dom-polyfills';
import { performVersionCheck } from './utils/version-check';
import './styles/index.scss';
import './styles/mkorean-theme.scss';

applyReact19DomPolyfills();
configure({ isolateGlobalState: true });
performVersionCheck();
applyDocumentTitle();
applyFaviconFromLogo();
applyBrandFontFromConfig();
applyPrimaryColorFromConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(<AuthWrapper />);
