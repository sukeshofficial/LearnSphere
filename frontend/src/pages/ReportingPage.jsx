import React, { useState, useEffect, useMemo } from "react";
import OverviewCards from "../components/OverviewCards";
import ReportingTable from "../components/ReportingTable";
import ColumnSelector from "../components/ColumnSelector";
import * as reportingApi from "../services/reportingApi";
import "../styles/reporting.css";
import "../styles/cards.css";
import "../styles/table.css";

const ReportingPage = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState("TOTAL");
    const [visibleColumns, setVisibleColumns] = useState([
        "sno", "course_name", "participant_name", "enrolled_date", "completion", "status"
    ]);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await reportingApi.getCourseProgressReport();
            setReportData(response.data || []);
            setError(null);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("Failed to load reporting data.");
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        return {
            total: reportData.length,
            notStarted: reportData.filter(d => d.status === "NOT_STARTED").length,
            inProgress: reportData.filter(d => d.status === "IN_PROGRESS").length,
            completed: reportData.filter(d => d.status === "COMPLETED").length
        };
    }, [reportData]);

    const filteredData = useMemo(() => {
        if (activeFilter === "TOTAL") return reportData;
        return reportData.filter(d => d.status === activeFilter);
    }, [reportData, activeFilter]);

    const handleToggleColumn = (colId) => {
        setVisibleColumns(prev =>
            prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]
        );
    };

    return (
        <div className="reporting-container">
            <div className="reporting-header">
                <h1>Learning Dashboard</h1>
            </div>

            <OverviewCards
                stats={stats}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            <div className="dashboard-layout">
                <ColumnSelector
                    visibleColumns={visibleColumns}
                    onToggle={handleToggleColumn}
                />

                <div className="table-wrapper">
                    {loading ? (
                        <div className="loading-state">Updating analytics...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : (
                        <ReportingTable
                            data={filteredData}
                            visibleColumns={visibleColumns}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportingPage;
