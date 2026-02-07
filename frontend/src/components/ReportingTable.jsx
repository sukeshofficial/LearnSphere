import React, { useMemo } from "react";

const formatTime = (seconds) => {
    if (!seconds) return "0s";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + "h " : ""}${mins > 0 ? mins + "m " : ""}${secs}s`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
};

const ReportingTable = ({ data, visibleColumns }) => {
    const columns = [
        { id: "sno", label: "S.No" },
        { id: "course_name", label: "Course Name" },
        { id: "participant_name", label: "Participant Name" },
        { id: "enrolled_date", label: "Enrolled Date" },
        { id: "start_date", label: "Start Date" },
        { id: "time_spent", label: "Time Spent" },
        { id: "completion", label: "Completion %" },
        { id: "completed_date", label: "Completed Date" },
        { id: "status", label: "Status" }
    ];

    const activeColumns = useMemo(() =>
        columns.filter(col => visibleColumns.includes(col.id)),
        [visibleColumns]
    );

    return (
        <div className="table-container">
            <table className="reporting-table">
                <thead>
                    <tr>
                        {activeColumns.map(col => (
                            <th key={col.id}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={activeColumns.length} className="no-data">
                                No progress records found for this filter.
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr key={`${row.course_name}-${row.participant_name}`}>
                                {visibleColumns.includes("sno") && <td>{index + 1}</td>}
                                {visibleColumns.includes("course_name") && <td>{row.course_name}</td>}
                                {visibleColumns.includes("participant_name") && <td>{row.participant_name}</td>}
                                {visibleColumns.includes("enrolled_date") && <td>{formatDate(row.enrolled_date)}</td>}
                                {visibleColumns.includes("start_date") && <td>{formatDate(row.start_date)}</td>}
                                {visibleColumns.includes("time_spent") && <td>{formatTime(row.time_spent_seconds)}</td>}
                                {visibleColumns.includes("completion") && (
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar-fill" style={{ width: `${row.completion_percentage}%` }}></div>
                                            </div>
                                            <span>{row.completion_percentage}%</span>
                                        </div>
                                    </td>
                                )}
                                {visibleColumns.includes("completed_date") && <td>{formatDate(row.completed_date)}</td>}
                                {visibleColumns.includes("status") && (
                                    <td>
                                        <span className={`status-badge status-${row.status.toLowerCase().replace('_', '-')}`}>
                                            {row.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReportingTable;