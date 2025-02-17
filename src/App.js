import React from 'react';
import { observer } from 'mobx-react-lite';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, DEFAULT_SECTIONS } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { Tooltip } from 'polotno/canvas/tooltip';
import { setTranslations } from 'polotno/config';
import { useAuth0 } from '@auth0/auth0-react';

import { loadFile } from './file';
import { QrSection } from './sections/qr-section';
// import { ThenounprojectSection } from './thenounproject-section';
import { QuotesSection } from './sections/quotes-section';
import { IconsSection } from './sections/icons-section';
import { ShapesSection } from './sections/shapes-section';
import { StableDiffusionSection } from './sections/stable-diffusion-section';
import { MyDesignsSection } from './sections/my-designs-section';
import { useProject } from './project';

import { ImageRemoveBackground } from './background-remover';

import fr from './translations/fr';
import en from './translations/en';
import id from './translations/id';
import ru from './translations/ru';
import ptBr from './translations/pt-br';

import Topbar from './topbar/topbar';
import { PuterModal } from './puter-modal';

// DEFAULT_SECTIONS.splice(3, 0, IllustrationsSection);
// replace elements section with just shapes
DEFAULT_SECTIONS.splice(3, 1, ShapesSection);
// DEFAULT_SECTIONS.splice(2, 0, StableDiffusionSection);
// add icons
DEFAULT_SECTIONS.splice(3, 0, IconsSection);
// add two more sections
DEFAULT_SECTIONS.push(QuotesSection, QrSection);
DEFAULT_SECTIONS.unshift(MyDesignsSection);

DEFAULT_SECTIONS.push(StableDiffusionSection);

const useHeight = () => {
  const [height, setHeight] = React.useState(window.innerHeight);
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(window.innerHeight);
    });
  }, []);
  return height;
};

const App = observer(({ store }) => {
  const project = useProject();
  const height = useHeight();

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr);
    } else if (project.language.startsWith('id')) {
      setTranslations(id);
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru);
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr);
    } else {
      setTranslations(en);
    }
  }, [project.language]);

  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

  const load = () => {
    let url = new URL(window.location.href);
    // url example https://studio.polotno.com/design/5f9f1b0b
    const reg = new RegExp('design/([a-zA-Z0-9_-]+)').exec(url.pathname);
    const designId = (reg && reg[1]) || 'local';
    project.loadById(designId);
  };

  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then((token) => {
          project.authToken = token;
          load();
        })
        .catch((err) => {
          project.authToken = null;
          load();
          console.log(err);
        });
    } else {
      project.authToken = null;
      load();
    }
  }, [isAuthenticated, project, getAccessTokenSilently, isLoading]);

  const handleDrop = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: height + 'px',
        display: 'flex',
        flexDirection: 'column',
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{ height: 'calc(100% - 50px)' }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={DEFAULT_SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar
              store={store}
              components={{
                ImageRemoveBackground,
              }}
            />
            <Workspace store={store} components={{ Tooltip }} />
            <ZoomButtons store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      <PuterModal
        isOpen={project.puterModalVisible}
        onClose={() => {
          project.puterModalVisible = false;
        }}
      />
    </div>
  );
});

export default App;
