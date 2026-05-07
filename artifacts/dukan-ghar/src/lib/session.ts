export function getSessionId(): string {
  let sessionId = localStorage.getItem("dg_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("dg_session_id", sessionId);
  }
  return sessionId;
}
