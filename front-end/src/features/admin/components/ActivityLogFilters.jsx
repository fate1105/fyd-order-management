import { useState, useEffect } from "react";
import { staffAPI } from "../../../shared/utils/api";
import { useTranslation } from "react-i18next";

export default function ActivityLogFilters({ filters, onChange }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await staffAPI.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const handleActionToggle = (action) => {
    const newActions = localFilters.action.includes(action)
      ? localFilters.action.filter((a) => a !== action)
      : [...localFilters.action, action];
    setLocalFilters({ ...localFilters, action: newActions });
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      userId: null,
      action: [],
      entityType: null,
      startDate: null,
      endDate: null,
    };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
  };

  return (
    <div className="activity-log-filters">
      <div className="filter-row">
        <div className="filter-group">
          <label>{t("activity.label_user")}</label>
          <select
            value={localFilters.userId || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                userId: e.target.value || null,
              })
            }
          >
            <option value="">{t("activity.tab_all")}</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName || user.username}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t("activity.label_entity")}</label>
          <select
            value={localFilters.entityType || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                entityType: e.target.value || null,
              })
            }
          >
            <option value="">{t("activity.tab_all")}</option>
            <option value="Product">{t("common.products")}</option>
            <option value="Order">{t("common.orders")}</option>
            <option value="Customer">{t("common.customers")}</option>
            <option value="Staff">{t("common.staff")}</option>
          </select>
        </div>

        <div className="filter-group">
          <label>{t("activity.label_from")}</label>
          <input
            type="date"
            value={localFilters.startDate || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, startDate: e.target.value })
            }
          />
        </div>

        <div className="filter-group">
          <label>{t("activity.label_to")}</label>
          <input
            type="date"
            value={localFilters.endDate || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, endDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>{t("activity.label_action")}</label>
          <div className="action-checkboxes">
            {["CREATE", "UPDATE", "DELETE"].map((action) => (
              <label key={action} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localFilters.action.includes(action)}
                  onChange={() => handleActionToggle(action)}
                />
                <span>{t(`activity.action_${action.toLowerCase()}`)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-apply" onClick={handleApply}>
            {t("activity.btn_apply")}
          </button>
          <button className="btn-clear" onClick={handleClear}>
            {t("activity.btn_clear")}
          </button>
        </div>
      </div>
    </div>
  );
}
