import { useTranslation } from "react-i18next";

export default function DiffViewer({ oldData, newData }) {
  const { t } = useTranslation();
  if (!oldData || !newData) {
    return <div className="diff-viewer-empty">{t("activity.no_data_compare")}</div>;
  }

  const changes = findChanges(oldData, newData);

  if (changes.length === 0) {
    return <div className="diff-viewer-empty">{t("activity.no_changes")}</div>;
  }

  return (
    <div className="diff-viewer">
      <table className="diff-table">
        <thead>
          <tr>
            <th>{t("activity.col_field")}</th>
            <th>{t("activity.col_old_value")}</th>
            <th>{t("activity.col_new_value")}</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((change, index) => (
            <tr key={index} className="diff-row">
              <td className="field-name">{change.field}</td>
              <td className="old-value">{formatValue(change.oldValue)}</td>
              <td className="new-value">{formatValue(change.newValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function findChanges(oldData, newData) {
  const changes = [];
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  allKeys.forEach((key) => {
    const oldValue = oldData[key];
    const newValue = newData[key];

    // Skip if values are the same
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return;
    }

    // Skip internal fields
    if (["createdAt", "updatedAt", "id"].includes(key)) {
      return;
    }

    changes.push({
      field: key,
      oldValue: oldValue,
      newValue: newValue,
    });
  });

  return changes;
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return <span className="null-value">null</span>;
  }

  if (typeof value === "boolean") {
    return <span className="boolean-value">{value.toString()}</span>;
  }

  if (typeof value === "number") {
    return <span className="number-value">{value}</span>;
  }

  if (typeof value === "object") {
    return <pre className="object-value">{JSON.stringify(value, null, 2)}</pre>;
  }

  if (typeof value === "string" && value.length > 100) {
    return (
      <span className="long-string" title={value}>
        {value.substring(0, 100)}...
      </span>
    );
  }

  return <span className="string-value">{value}</span>;
}
