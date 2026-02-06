import { useState, useEffect } from "react";
import { activityLogAPI, getAssetUrl } from "../../../shared/utils/api";
import DiffViewer from "./DiffViewer";
import { formatDate } from "../../../shared/utils/api";
import { useTranslation } from "react-i18next";

export default function ActivityLogDetail({ log, onClose }) {
  const { t } = useTranslation();
  const [detailedLog, setDetailedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const parseJSON = (str) => {
    if (!str) return null;
    if (typeof str === "object") return str;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };

  useEffect(() => {
    loadDetailedLog();
  }, [log.id]);

  const loadDetailedLog = async () => {
    setLoading(true);
    try {
      const data = await activityLogAPI.getById(log.id);
      setDetailedLog(data);
    } catch (error) {
      console.error("Failed to load log details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop" onClick={handleBackdropClick}>
        <div className="activity-log-detail-modal">
          <div className="loading-state">{t("common.loading")}</div>
        </div>
      </div>
    );
  }

  if (!detailedLog) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="activity-log-detail-modal">
        <div className="modal-header">
          <h2>{t("activity.modal_title")}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>{t("activity.section_info")}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>{t("activity.label_actor")}</label>
                <div className="user-info">
                  {detailedLog.user?.avatarUrl && (
                    <img
                      src={getAssetUrl(detailedLog.user.avatarUrl)}
                      alt={detailedLog.user.fullName}
                      className="user-avatar"
                    />
                  )}
                  <span>{detailedLog.user?.fullName || t("activity.user_system")}</span>
                </div>
              </div>

              <div className="detail-item">
                <label>{t("activity.label_time")}</label>
                <span>{formatDate(detailedLog.createdAt)}</span>
              </div>

              <div className="detail-item">
                <label>{t("activity.label_action")}</label>
                <span className={`action-badge action-${detailedLog.action.toLowerCase()}`}>
                  {t(`activity.action_${detailedLog.action.toLowerCase()}`)}
                </span>
              </div>

              <div className="detail-item">
                <label>{t("activity.label_entity")}</label>
                <span>{detailedLog.entityType}</span>
              </div>

              {detailedLog.entityId && (
                <div className="detail-item">
                  <label>{t("activity.label_entity_id")}</label>
                  <span>#{detailedLog.entityId}</span>
                </div>
              )}

              <div className="detail-item">
                <label>{t("activity.label_ip")}</label>
                <span>{detailedLog.ipAddress || "N/A"}</span>
              </div>

              <div className="detail-item full-width">
                <label>{t("activity.label_ua")}</label>
                <span className="user-agent">{detailedLog.userAgent || "N/A"}</span>
              </div>
            </div>
          </div>

          {detailedLog.action === "UPDATE" && detailedLog.oldData && detailedLog.newData && (
            <div className="detail-section">
              <h3>{t("activity.section_changes")}</h3>
              <DiffViewer
                oldData={parseJSON(detailedLog.oldData)}
                newData={parseJSON(detailedLog.newData)}
              />
            </div>
          )}

          {detailedLog.action === "CREATE" && detailedLog.newData && (
            <div className="detail-section">
              <h3>{t("activity.section_new")}</h3>
              <pre className="data-display">
                {JSON.stringify(parseJSON(detailedLog.newData), null, 2)}
              </pre>
            </div>
          )}

          {detailedLog.action === "DELETE" && detailedLog.oldData && (
            <div className="detail-section">
              <h3>{t("activity.section_deleted")}</h3>
              <pre className="data-display">
                {JSON.stringify(parseJSON(detailedLog.oldData), null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            {t("activity.btn_close")}
          </button>
        </div>
      </div>
    </div>
  );
}
