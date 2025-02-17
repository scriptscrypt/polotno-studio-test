import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Navbar,
  Alignment,
  AnchorButton,
  NavbarDivider,
} from '@blueprintjs/core';
import FaGithub from '@meronex/icons/fa/FaGithub';
import FaDiscord from '@meronex/icons/fa/FaDiscord';
import FaTwitter from '@meronex/icons/fa/FaTwitter';
import BiCodeBlock from '@meronex/icons/bi/BiCodeBlock';
import BisDiamond from '@meronex/icons/bi/BisDiamond';
import { useAuth0 } from '@auth0/auth0-react';
import styled from 'polotno/utils/styled';

import { useProject } from '../project';
import { forEveryChild } from 'polotno/model/group-model';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { UserMenu } from './user-menu';
import { SubscriptionModal } from './subscription-modal';

const NavbarContainer = styled('div')`
  white-space: nowrap;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

const PlayButton = observer(({ store }) => {
  let hasAnimations = false;
  forEveryChild({ children: store.pages }, (child) => {
    const hasAnim = child.animations?.find((el) => el.enabled);
    if (hasAnim) {
      hasAnimations = true;
    }
  });
  if (!hasAnimations) {
    return null;
  }
  return (
    <Button
      icon={store.isPlaying ? 'pause' : 'play'}
      onClick={() => {
        if (store.isPlaying) {
          store.stop();
        } else {
          store.play();
        }
      }}
      style={{
        marginRight: '10px',
      }}
    >
      Preview
    </Button>
  );
});

export default observer(({ store }) => {
  const project = useProject();

  const {
    loginWithPopup,
    isLoading,
    getAccessTokenSilently,
    isAuthenticated,
    logout,
  } = useAuth0();

  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <NavbarContainer className="bp5-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FileMenu store={store} project={project} />
          <Button
            text="My designs"
            intent="primary"
            style={{ marginLeft: '20px' }}
            onClick={() => {
              project.puterModalVisible = true;
              // store.openSidePanel('my-designs');
            }}
          />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {/* {project.id !== 'local' && (
            <>
              <div
                style={{
                  paddingRight: '10px',
                  maxWidth: '200px',
                }}
              >
                <EditableText
                  value={project.name}
                  placeholder="Design name"
                  onChange={(name) => {
                    project.name = name;
                    project.requestSave();
                  }}
                />
              </div>
              <Tooltip2
                content={
                  project.private
                    ? 'The design is private'
                    : 'The design is public'
                }
              >
                <Button
                  icon={project.private ? 'eye-off' : 'eye-on'}
                  onClick={() => {
                    project.private = !project.private;
                    project.requestSave();
                  }}
                />
              </Tooltip2>
              <NavbarDivider />
            </>
          )} */}

          <Button
            intent="primary"
            icon={<BisDiamond className="bp5-icon" />}
            style={{ backgroundColor: 'rgba(219, 30, 186, 1)' }}
            onClick={async () => {
              if (!isAuthenticated) {
                const res = await loginWithPopup();
              }
              setModalVisible(true);
            }}
          >
            Chip in!
          </Button>
          <SubscriptionModal
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
            }}
            store={store}
          />
          <AnchorButton
            href="https://polotno.com"
            target="_blank"
            minimal
            icon={
              <BiCodeBlock className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          >
            API
          </AnchorButton>

          <AnchorButton
            minimal
            href="https://discord.gg/W2VeKgsr9J"
            target="_blank"
            icon={
              <FaDiscord className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          >
            Join Chat
          </AnchorButton>
          <AnchorButton
            minimal
            href="https://github.com/lavrton/polotno-studio"
            target="_blank"
            icon={
              <FaGithub className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton>
          <AnchorButton
            minimal
            href="https://twitter.com/lavrton"
            target="_blank"
            icon={
              <FaTwitter className="bp5-icon" style={{ fontSize: '20px' }} />
            }
          ></AnchorButton>
          <NavbarDivider />
          <PlayButton store={store} />
          <DownloadButton store={store} />
          <UserMenu store={store} project={project} />
          {/* <NavbarHeading>Polotno Studio</NavbarHeading> */}
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
