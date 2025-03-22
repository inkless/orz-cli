export const SUPPORTED_ISSUE_TYPES = [
  'Story',
  'Bug',
  'Task',
  'Sub-task',
] as const;

export const PARENT_EPIC_CHOICES = [
  {
    name: 'Phase 1: Pre-Migration - App Foundations Workstream',
    value: 'MOBILEPLAT-113',
  },
  {
    name: 'Phase 2: Pre-Migration - App Foundations Workstream',
    value: 'MOBILEPLAT-114',
  },
  {
    name: 'CI/CD Workstream',
    value: 'MOBILEPLAT-4',
  },
  {
    name: 'AI Pilot',
    value: 'MOBILEPLAT-419',
  },
  {
    name: 'Design System Phase 1',
    value: 'MOBILEPLAT-155',
  },
] as const;

export const PARENT_STORY_CHOICES = [
  {
    name: 'Dev X / Miscs',
    value: 'MOBILEPLAT-152',
  },
] as const;
