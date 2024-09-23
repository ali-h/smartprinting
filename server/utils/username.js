// For now, we only check if the username is at least 3 characters
// TODO: Add more checks for username validity (Roll No verification, etc.)
export function isUsernameValid(username) {
  // username must be at least 3 characters
  if (username.length < 3) {
    return false;
  }

  return true;
}
