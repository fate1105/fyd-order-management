import { formatRelativeTime } from "../../../shared/utils/timeUtils";
import { getAssetUrl } from "../../../shared/utils/api";
import { useTranslation } from "react-i18next";

const actionIcons = {
  CREATE: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  UPDATE: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  DELETE: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
};

const actionColors = {
  CREATE: "action-create",
  UPDATE: "action-update",
  DELETE: "action-delete",
};

export default function ActivityLogTimeline({ logs, onLogClick }) {
  const { t } = useTranslation();
  if (!logs || logs.length === 0) {
    return (
      <div className="empty-state">
        <p>{t("activity.empty_state")}</p>
      </div>
    );
  }

  return (
    <div className="activity-timeline">
      {logs.map((log) => (
        <div
          key={log.id}
          className="timeline-item"
          onClick={() => onLogClick(log)}
        >
          <div className={`timeline-icon ${actionColors[log.action]}`}>
            {actionIcons[log.action]}
          </div>

          <div className="timeline-content">
            <div className="timeline-header">
              <div className="user-info">
                {log.user?.avatarUrl && (
                  <img
                    src={getAssetUrl(log.user.avatarUrl)}
                    alt={log.user.fullName}
                    className="user-avatar"
                  />
                )}
                <span className="user-name">{log.user?.fullName || t("activity.user_system")}</span>
              </div>
              <span className="timestamp">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>

            <div className="timeline-description">
              <span className={`action-badge ${actionColors[log.action]}`}>
                {t(`activity.action_${log.action.toLowerCase()}`)}
              </span>
              <span className="entity-type">{log.entityType}</span>
              {log.entityId && (
                <span className="entity-id">#{log.entityId}</span>
              )}
            </div>

            {log.entityName && (
              <div className="timeline-details">{log.entityName}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
