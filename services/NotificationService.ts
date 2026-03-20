// Notification stubs — expo-notifications removed.
// All functions are no-ops so the rest of the app compiles
// without any native notification dependency.

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function setupNotificationChannel(): Promise<void> {}

export async function configureNotificationHandler(): Promise<void> {}

export async function sendGoalNotification(
  _homeTeam: string,
  _awayTeam: string,
  _homeScore: number,
  _awayScore: number,
  _scorer?: string
): Promise<void> {}

export async function sendMatchAlertNotification(
  _homeTeam: string,
  _awayTeam: string,
  _league: string,
  _startTime: string
): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}
