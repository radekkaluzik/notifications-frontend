/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { NotificationBadge } from '@patternfly/react-core/dist/dynamic/components/NotificationBadge';
import { ToolbarItem } from '@patternfly/react-core/dist/dynamic/components/Toolbar';
import { Tooltip } from '@patternfly/react-core/dist/dynamic/components/Tooltip';
import BellIcon from '@patternfly/react-icons/dist/dynamic/icons/bell-icon';
import { DrawerSingleton } from './DrawerSingleton';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

interface DrawerBellProps {
  isNotificationDrawerExpanded: boolean;
}

const DrawerBell: React.ComponentType<DrawerBellProps> = ({
  isNotificationDrawerExpanded,
}) => {
  const {
    drawerActions: { toggleDrawerContent },
  } = useChrome();
  return (
    <ToolbarItem className="pf-v6-u-mx-0">
      <Tooltip
        aria="none"
        aria-live="polite"
        content={'Notifications'}
        flipBehavior={['bottom']}
        className="tooltip-inner-settings-cy"
      >
        <NotificationBadge
          className="chr-c-notification-badge"
          variant={
            DrawerSingleton.Instance.hasUnreadNotifications()
              ? 'unread'
              : 'read'
          }
          onClick={() => {
            toggleDrawerContent({
              scope: 'notifications',
              module: './DrawerPanel',
            });
          }}
          aria-label="Notifications"
          isExpanded={isNotificationDrawerExpanded}
        >
          <BellIcon />
        </NotificationBadge>
      </Tooltip>
    </ToolbarItem>
  );
};

export default DrawerBell;
