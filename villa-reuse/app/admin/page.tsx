'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  listingsCount: number;
  status: 'active' | 'suspended' | 'restricted';
  reputation: number;
}

interface Listing {
  id: string;
  name: string;
  owner: string;
  status: 'available' | 'reserved' | 'completed' | 'flagged';
  createdDate: string;
  reports: number;
}

interface Report {
  id: string;
  type: 'listing' | 'user' | 'message';
  targetId: string;
  targetName: string;
  reportedBy: string;
  reason: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'reports'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 'user-001',
        name: 'Christine Johnson',
        email: 'christine@example.com',
        joinDate: '2024-01-15',
        listingsCount: 3,
        status: 'active',
        reputation: 4.8,
      },
      {
        id: 'user-002',
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        joinDate: '2024-01-20',
        listingsCount: 5,
        status: 'active',
        reputation: 4.5,
      },
      {
        id: 'user-003',
        name: 'John Doe',
        email: 'john@example.com',
        joinDate: '2023-12-01',
        listingsCount: 2,
        status: 'restricted',
        reputation: 2.1,
      },
    ];

    const mockListings: Listing[] = [
      {
        id: '1',
        name: 'Office Chair',
        owner: 'Christine Johnson',
        status: 'available',
        createdDate: '2024-01-15',
        reports: 0,
      },
      {
        id: '2',
        name: 'Wooden Table',
        owner: 'Sarah Smith',
        status: 'reserved',
        createdDate: '2024-01-10',
        reports: 0,
      },
      {
        id: '3',
        name: 'Used Electronics',
        owner: 'John Doe',
        status: 'flagged',
        createdDate: '2024-01-05',
        reports: 2,
      },
    ];

    const mockReports: Report[] = [
      {
        id: 'report-001',
        type: 'listing',
        targetId: '3',
        targetName: 'Used Electronics',
        reportedBy: 'User-456',
        reason: 'Item description contains contact information',
        date: '2024-01-20',
        status: 'pending',
      },
      {
        id: 'report-002',
        type: 'user',
        targetId: 'user-003',
        targetName: 'John Doe',
        reportedBy: 'User-789',
        reason: 'Multiple complaints about communication',
        date: '2024-01-18',
        status: 'reviewed',
      },
      {
        id: 'report-003',
        type: 'listing',
        targetId: '1',
        targetName: 'Office Chair',
        reportedBy: 'User-123',
        reason: 'Inappropriate image in listing',
        date: '2024-01-15',
        status: 'resolved',
      },
    ];

    setUsers(mockUsers);
    setListings(mockListings);
    setReports(mockReports);
    setIsLoaded(true);
  }, []);

  const handleSuspendUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: 'suspended' } : user
      )
    );
  };

  const handleRestrictUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, status: 'restricted' } : user
      )
    );
  };

  const handleRemoveUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleRemoveListing = (listingId: string) => {
    setListings((prev) => prev.filter((listing) => listing.id !== listingId));
  };

  const handleResolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: 'resolved' } : report
      )
    );
  };

  const handleRejectReport = (reportId: string) => {
    setReports((prev) => prev.filter((report) => report.id !== reportId));
  };

  const getTotalStats = () => ({
    totalUsers: users.length,
    totalListings: listings.length,
    totalReports: reports.length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    suspendedUsers: users.filter((u) => u.status === 'suspended').length,
    flaggedListings: listings.filter((l) => l.status === 'flagged').length,
  });

  const stats = getTotalStats();

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">
          <span className="admin-logo-icon">↻</span>
          <span>villa<span>reuse</span></span>
        </Link>

        <p className="admin-menu-label">ADMIN PANEL</p>

        <nav className="admin-menu">
          <button
            className={`admin-menu-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>▦</span> Dashboard
          </button>
          <button
            className={`admin-menu-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span> Users ({users.length})
          </button>
          <button
            className={`admin-menu-link ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <span>▤</span> Listings ({listings.length})
          </button>
          <button
            className={`admin-menu-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span>⚠</span> Reports ({reports.filter((r) => r.status === 'pending').length})
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <Link href="/dashboard" className="admin-menu-link">
            <span>↩</span> Back to App
          </Link>
        </div>
      </aside>

      <section className="admin-main">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="admin-content">
            <header className="admin-header">
              <div>
                <h1>Admin Dashboard</h1>
                <p>Community moderation and management</p>
              </div>
            </header>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Total Users</span>
                  <span className="admin-stat-icon">👥</span>
                </div>
                <strong>{stats.totalUsers}</strong>
                <p>{stats.suspendedUsers} suspended</p>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Total Listings</span>
                  <span className="admin-stat-icon">▤</span>
                </div>
                <strong>{stats.totalListings}</strong>
                <p>{stats.flaggedListings} flagged</p>
              </div>

              <div className="admin-stat-card warning">
                <div className="admin-stat-top">
                  <span>Pending Reports</span>
                  <span className="admin-stat-icon">⚠</span>
                </div>
                <strong>{stats.pendingReports}</strong>
                <p>of {stats.totalReports} total</p>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-top">
                  <span>Community Health</span>
                  <span className="admin-stat-icon">❤</span>
                </div>
                <strong>
                  {Math.round(
                    ((stats.totalUsers - stats.suspendedUsers) / stats.totalUsers) * 100
                  )}%
                </strong>
                <p>Active users</p>
              </div>
            </div>

            <div className="admin-columns">
              <section className="admin-panel recent-activity">
                <div className="admin-panel-header">
                  <div>
                    <h2>Recent Activity</h2>
                    <p>Latest community updates</p>
                  </div>
                </div>
                <div className="admin-activities">
                  <div className="admin-activity">
                    <div className="admin-activity-icon">📝</div>
                    <div className="admin-activity-info">
                      <strong>New Listing</strong>
                      <p>Sarah Smith posted "Coffee Table"</p>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <div className="admin-activity">
                    <div className="admin-activity-icon">⚠</div>
                    <div className="admin-activity-info">
                      <strong>Report Submitted</strong>
                      <p>Listing flagged for inappropriate content</p>
                      <span>1 hour ago</span>
                    </div>
                  </div>
                  <div className="admin-activity">
                    <div className="admin-activity-icon">✓</div>
                    <div className="admin-activity-info">
                      <strong>Transaction Completed</strong>
                      <p>Christine Johnson completed exchange</p>
                      <span>30 minutes ago</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="admin-panel quick-actions">
                <div className="admin-panel-header">
                  <div>
                    <h2>Quick Actions</h2>
                    <p>Common admin tasks</p>
                  </div>
                </div>
                <div className="admin-actions-list">
                  <button className="admin-action-btn" onClick={() => setActiveTab('reports')}>
                    <span>⚠</span>
                    <div>
                      <strong>Review Reports</strong>
                      <p>{stats.pendingReports} pending</p>
                    </div>
                    <span className="arrow">→</span>
                  </button>
                  <button className="admin-action-btn" onClick={() => setActiveTab('listings')}>
                    <span>🚫</span>
                    <div>
                      <strong>Remove Listings</strong>
                      <p>{stats.flaggedListings} flagged</p>
                    </div>
                    <span className="arrow">→</span>
                  </button>
                  <button className="admin-action-btn" onClick={() => setActiveTab('users')}>
                    <span>👤</span>
                    <div>
                      <strong>Manage Users</strong>
                      <p>{stats.suspendedUsers} suspended</p>
                    </div>
                    <span className="arrow">→</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-content">
            <header className="admin-header">
              <div>
                <h1>User Management</h1>
                <p>Manage users and their accounts</p>
              </div>
            </header>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Listings</th>
                    <th>Status</th>
                    <th>Reputation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={`status-${user.status}`}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.joinDate}</td>
                      <td>{user.listingsCount}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="reputation-bar">
                          <div
                            className="reputation-fill"
                            style={{ width: `${user.reputation * 20}%` }}
                          ></div>
                        </div>
                        {user.reputation.toFixed(1)}
                      </td>
                      <td>
                        <div className="admin-actions">
                          {user.status !== 'suspended' && (
                            <button
                              className="admin-action-small danger"
                              onClick={() => handleSuspendUser(user.id)}
                              title="Suspend user"
                            >
                              Suspend
                            </button>
                          )}
                          {user.status !== 'restricted' && (
                            <button
                              className="admin-action-small warning"
                              onClick={() => handleRestrictUser(user.id)}
                              title="Restrict user"
                            >
                              Restrict
                            </button>
                          )}
                          <button
                            className="admin-action-small danger"
                            onClick={() => handleRemoveUser(user.id)}
                            title="Remove user"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="admin-content">
            <header className="admin-header">
              <div>
                <h1>Listings Management</h1>
                <p>Review and manage community listings</p>
              </div>
            </header>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Owner</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Reports</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className={`status-${listing.status}`}>
                      <td>
                        <strong>{listing.name}</strong>
                      </td>
                      <td>{listing.owner}</td>
                      <td>{listing.createdDate}</td>
                      <td>
                        <span className={`status-badge ${listing.status}`}>
                          {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {listing.reports > 0 ? (
                          <span className="report-count">{listing.reports} reports</span>
                        ) : (
                          <span className="report-count clear">No reports</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-action-small info"
                            title="View details"
                          >
                            View
                          </button>
                          <button
                            className="admin-action-small danger"
                            onClick={() => handleRemoveListing(listing.id)}
                            title="Remove listing"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="admin-content">
            <header className="admin-header">
              <div>
                <h1>Reports Management</h1>
                <p>Review and resolve community reports</p>
              </div>
            </header>

            <div className="admin-reports-list">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`admin-report-card status-${report.status}`}
                >
                  <div className="report-header">
                    <div className="report-info">
                      <span className="report-type-badge">{report.type}</span>
                      <strong>{report.targetName}</strong>
                      <span className="report-status">{report.status}</span>
                    </div>
                    <div className="report-date">{report.date}</div>
                  </div>

                  <div className="report-body">
                    <div className="report-details">
                      <div className="report-row">
                        <span className="label">Reported by:</span>
                        <span className="value">{report.reportedBy}</span>
                      </div>
                      <div className="report-row">
                        <span className="label">Reason:</span>
                        <span className="value">{report.reason}</span>
                      </div>
                    </div>
                  </div>

                  <div className="report-actions">
                    {report.status === 'pending' && (
                      <>
                        <button
                          className="admin-action-report success"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          ✓ Resolve
                        </button>
                        <button
                          className="admin-action-report danger"
                          onClick={() => handleRejectReport(report.id)}
                        >
                          ✕ Dismiss
                        </button>
                      </>
                    )}
                    {report.status === 'reviewed' && (
                      <button
                        className="admin-action-report success"
                        onClick={() => handleResolveReport(report.id)}
                      >
                        ✓ Mark Resolved
                      </button>
                    )}
                    {report.status === 'resolved' && (
                      <span className="report-resolved">✓ Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
