import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import DrawerPanel from '../../src/components/NotificationsDrawer/DrawerPanel';
import { Page } from '@patternfly/react-core';
import { ScalprumProvider } from '@scalprum/react-core';
import { DrawerSingleton } from '../../src/components/NotificationsDrawer/DrawerSingleton';
import { NotificationData } from '../../src/types/Drawer';

const notificationDrawerData: NotificationData[] = [
  {
    id: '1',
    title: 'Notification 1',
    read: false,
    created: new Date().toString(),
    description: 'This is a test notification',
    source: 'rhel',
    bundle: 'openshift',
  },
  {
    id: '2',
    title: 'Notification 2',
    read: false,
    created: new Date().toString(),
    description: 'This is a test notification',
    source: 'rhel',
    bundle: 'console',
  },
  {
    id: '3',
    title: 'Notification 3',
    read: false,
    created: new Date().toString(),
    description: 'This is a test notification',
    source: 'rhel',
    bundle: 'console',
  },
];

const notificationPerms = [
  {
    resourceDefinitions: [],
    permission: 'notifications:*:*',
  },
  {
    resourceDefinitions: [],
    permission: 'notifications:notifications:read',
  },
];

const DrawerLayout = ({ markAll = false }: { markAll?: boolean }) => {
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { initialize, addNotification } = DrawerSingleton.Instance;
  const toggleDrawer = () => setIsExpanded((prev) => !prev);
  const notificationProps = {
    panelRef: drawerPanelRef,
    toggleDrawer: toggleDrawer,
  };

  return (
    <ScalprumProvider
        config={{ foo: { name: 'foo' } }}
        api={{ chrome: { 
          addWsEventListener: () => () => {}, 
          auth: {
            getUser: () => Promise.resolve({ identity: { user: { is_org_admin: true } 
          } 
          }),
        }} }}
      >
      <BrowserRouter>
        <button id="drawer-toggle" onClick={() => setIsExpanded((prev) => !prev)}>
          Toggle drawer
        </button>
        <button
          id="populate-notifications"
          onClick={async () => {
              await initialize(true, notificationPerms);
              notificationDrawerData.map((item) => addNotification({ ...item, read: markAll }))
            }
          }
        >
          Populate notifications
        </button>
        <Page
          isNotificationDrawerExpanded={isExpanded}
          notificationDrawer={<DrawerPanel {...notificationProps} />}
        ></Page>
      </BrowserRouter>
    </ScalprumProvider>
  );
};

describe('Notification Drawer', () => {
  beforeEach(() => {
    cy.viewport(1200, 800);
    cy.intercept('GET', ' /api/rbac/v1/access/?application=notifications&limit=1000', {
      data: notificationPerms,
    });
    cy.intercept('GET', '/api/notifications/v1/notifications/drawer?limit=50&startDate=*', {
      data: [],
    });
  });

  it('should toggle drawer', () => {
    cy.mount(
      <DrawerLayout />
    );
    cy.get('#drawer-toggle').click();
    cy.contains('No notifications found').should('be.visible');
    cy.get('#drawer-toggle').click();
    cy.contains('No notifications found').should('not.exist');
  });

  it('should populate notifications', () => {
    cy.mount(
      <DrawerLayout />
    );
    cy.get('#populate-notifications').click();
    cy.get('#drawer-toggle').click();
    notificationDrawerData.forEach((notification) => {
      cy.contains(notification.title).should('be.visible');
    });
  });

  it('should mark a single notification as read', () => {
    cy.intercept('PUT', '/api/notifications/v1/notifications/drawer/read', {
      statusCode: 200,
    });
    cy.mount(
      <DrawerLayout />
    );
    cy.get('#populate-notifications').click();
    cy.get('#drawer-toggle').click();
    cy.get('.pf-m-read').should('have.length', 0);
    cy.get('[aria-label="Notification actions dropdown"]').first().click();
    cy.get('[role="menuitem"]').contains('Mark as read').first().click();
    cy.get('.pf-m-read').should('have.length', 1);
  });

  it('should mark a single notification as unread', () => {
    cy.intercept('PUT', '/api/notifications/v1/notifications/drawer/read', {
      statusCode: 200,
    });
    cy.mount(
      <DrawerLayout markAll />
    );
    cy.get('#populate-notifications').click();
    cy.get('#drawer-toggle').click();
    cy.get('.pf-m-read').should('have.length', 3);
    cy.get('[aria-label="Notification actions dropdown"]').first().click();
    cy.get('[role="menuitem"]').contains('Mark as unread').first().click();
  });

  it('should mark all notifications as read', () => {
    cy.intercept('PUT', '/api/notifications/v1/notifications/drawer/read', {
      statusCode: 200,
    });
    cy.mount(
      <DrawerLayout />
    );
    cy.get('#populate-notifications').click();
    cy.get('#drawer-toggle').click();
    cy.get('.pf-m-read').should('have.length', 0);
    // select all notifications
    cy.get('.pf-v5-c-menu-toggle__controls').click();
    cy.get('[data-ouia-component-id="BulkSelectList-select-all"]').click();
    // mark selected as read
    cy.get('#notifications-actions-toggle').click();
    cy.contains('Mark selected as read').click();
    cy.get('.pf-m-read').should('have.length', 3);
  });

  it('should mark all notifications as unread', () => {
    cy.intercept('PUT', '/api/notifications/v1/notifications/drawer/read', {
      statusCode: 200,
    });
    cy.mount(
      <DrawerLayout markAll />
    );
    cy.get('#populate-notifications').click();
    cy.get('#drawer-toggle').click();
    cy.get('.pf-m-read').should('have.length', 3);
    // select all notifications
    cy.get('.pf-v5-c-menu-toggle__controls').click();
    cy.get('[data-ouia-component-id="BulkSelectList-select-all"]').click();
    // mark selected as unread
    cy.get('#notifications-actions-toggle').click();
    cy.contains('Mark selected as unread').click();
    cy.get('.pf-m-read').should('have.length', 0);
  });

  it('should select console filter', () => {
    cy.intercept('GET', '/api/notifications/v1/notifications/facets/bundles', {
      statusCode: 200,
      body: [
        {
          name: 'console',
          displayName: 'Console',
        },
        {
          name: 'openshift',
          displayName: 'OpenShift',
        },
      ],
    });
    cy.mount(
      <DrawerLayout />
    );
    cy.get('#populate-notifications').click();
    cy.get('#drawer-toggle').click();
    cy.get('.pf-v5-c-notification-drawer__list-item').should('have.length', 3);
    cy.get('#notifications-filter-toggle').click();
    cy.contains('Console').click();
    cy.get('.pf-v5-c-notification-drawer__list-item').should('have.length', 2);
    cy.contains('Reset filter').click();
    cy.get('.pf-v5-c-notification-drawer__list-item').should('have.length', 3);
  });
});
