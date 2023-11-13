import {
  ClearFilters,
  Filters,
  SetFilters,
} from '@redhat-cloud-services/insights-common-typescript';

export enum NotificationFilterColumn {
  NAME = 'name',
  APPLICATION = 'application',
  ACTION = 'action',
}

export type NotificationFilters = Filters<typeof NotificationFilterColumn>;
export type SetNotificationFilters = SetFilters<
  typeof NotificationFilterColumn
>;
export type ClearNotificationFilters = ClearFilters<
  typeof NotificationFilterColumn
>;
