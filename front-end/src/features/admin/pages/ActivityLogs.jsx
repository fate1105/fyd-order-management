import { useState, useEffect } from "react";
import { activityLogAPI } from "../../../shared/utils/api";
import "../styles/activity-logs.css";
import ActivityLogFilters from "../components/ActivityLogFilters";
import ActivityLogTimeline from "../components/ActivityLogTimeline";
import ActivityLogDetail from "../components/ActivityLogDetail";
import { useTranslation } from "react-i18next";

export default function ActivityLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: null,
    action: [],
    entityType: null,
    startDate: null,
    endDate: null,
  });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalPages: 0,
    totalItems: 0,
  });

  useEffect(() => {
    loadLogs();
  }, [filters, pagination.page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action.length > 0 && { action: filters.action.join(",") }),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.startDate && { startDate: `${filters.startDate}T00:00:00` }),
        ...(filters.endDate && { endDate: `${filters.endDate}T23:59:59` }),
      };

      const data = await activityLogAPI.getAll(params);

      setLogs(data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.totalPages || 0,
        totalItems: data.totalElements || 0,
      }));
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
  };

  const handleCloseDetail = () => {
    setSelectedLog(null);
  };

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <h1>{t("activity.title")}</h1>
        <p>{t("activity.subtitle")}</p>
      </div>

      <ActivityLogFilters filters={filters} onChange={handleFilterChange} />

      {loading ? (
        <div className="loading-state">{t("common.loading")}</div>
      ) : (
        <>
          <ActivityLogTimeline logs={logs} onLogClick={handleLogClick} />

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page === 0}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                {t("activity.btn_prev")}
              </button>
              <span>
                {t("activity.col_page", { current: pagination.page + 1, total: pagination.totalPages })}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages - 1}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                {t("activity.btn_next")}
              </button>
            </div>
          )}
        </>
      )}

      {selectedLog && (
        <ActivityLogDetail log={selectedLog} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
