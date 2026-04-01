
import React, { useState, useEffect } from 'react';

// --- RBAC Configuration ---
const ROLES = {
  'ADMIN': {
    canCreateVSC: true,
    canEditVSC: true,
    canRenewVSC: true,
    canCancelVSC: true,
    canViewSensitiveLogs: true,
    canApproveClaims: true,
    canViewAllContracts: true,
  },
  'F_I_PRODUCT_MANAGER': {
    canCreateVSC: true,
    canEditVSC: true,
    canRenewVSC: true,
    canCancelVSC: false,
    canViewSensitiveLogs: false,
    canApproveClaims: false,
    canViewAllContracts: true,
  },
  'CUSTOMER_SERVICE_REP': {
    canCreateVSC: false,
    canEditVSC: true,
    canRenewVSC: true,
    canCancelVSC: true,
    canViewSensitiveLogs: false,
    canApproveClaims: false,
    canViewAllContracts: true,
  },
  'DEALERSHIP_PORTAL_USER': {
    canCreateVSC: true,
    canEditVSC: true,
    canRenewVSC: true,
    canCancelVSC: false,
    canViewSensitiveLogs: false,
    canApproveClaims: false,
    canViewAllContracts: false, // Only their dealership's contracts
  },
  'VEHICLE_OWNER': {
    canCreateVSC: false,
    canEditVSC: false,
    canRenewVSC: true,
    canCancelVSC: true,
    canViewSensitiveLogs: false,
    canApproveClaims: false,
    canViewAllContracts: false, // Only their own contracts
  },
};

// --- Sample Data ---
const SAMPLE_CONTRACTS = [
  {
    id: 'VSC001',
    planName: 'Premium Protection Plan',
    vehicle: 'Toyota Camry 2020',
    vin: '1HGCM3B19LA000123',
    customer: 'Alice Johnson',
    customerId: 'CUST001',
    dealer: 'Luxury Motors',
    dealerId: 'DEAL001',
    status: 'Approved',
    startDate: '2023-01-15',
    endDate: '2028-01-14',
    mileageLimit: '100,000 miles',
    premium: '$2,500',
    deductible: '$100',
    workflowStage: 'Active',
    slaDue: '2024-01-14',
    auditLog: [
      { id: 'AL001', timestamp: '2023-01-10T10:00:00Z', actor: 'John Doe (F&I)', action: 'Contract Initiated', details: 'New VSC for Toyota Camry', type: 'system' },
      { id: 'AL002', timestamp: '2023-01-11T11:30:00Z', actor: 'System', action: 'Underwriting Approved', details: 'Automated underwriting successful', type: 'system' },
      { id: 'AL003', timestamp: '2023-01-15T09:00:00Z', actor: 'Alice Johnson (Customer)', action: 'Contract Signed', details: 'Digital signature received', type: 'user' },
      { id: 'AL004', timestamp: '2023-05-20T14:15:00Z', actor: 'System', action: 'Claim filed', details: 'Claim #CLM789 filed for engine repair', type: 'user' },
    ],
    milestones: [
      { name: 'Initiated', date: '2023-01-10', completed: true },
      { name: 'Underwritten', date: '2023-01-11', completed: true },
      { name: 'Approved', date: '2023-01-15', completed: true },
      { name: 'Active', date: null, completed: false },
      { name: 'Renewed/Cancelled', date: null, completed: false },
    ],
    relatedDocuments: [
      { name: 'Contract Agreement.pdf', url: '/docs/VSC001_Agreement.pdf', type: 'pdf' },
      { name: 'Vehicle Inspection Report.pdf', url: '/docs/VSC001_Inspection.pdf', type: 'pdf' },
    ],
  },
  {
    id: 'VSC002',
    planName: 'Standard Coverage',
    vehicle: 'Honda Civic 2022',
    vin: '2HGES5G44NH000456',
    customer: 'Bob Smith',
    customerId: 'CUST002',
    dealer: 'City Auto',
    dealerId: 'DEAL002',
    status: 'In Progress',
    startDate: '2023-03-01',
    endDate: '2028-02-28',
    mileageLimit: '75,000 miles',
    premium: '$1,800',
    deductible: '$200',
    workflowStage: 'Underwriting Review',
    slaDue: '2023-11-20',
    auditLog: [
      { id: 'AL005', timestamp: '2023-02-25T10:00:00Z', actor: 'Jane Doe (Dealer)', action: 'Contract Initiated', details: 'New VSC for Honda Civic', type: 'user' },
      { id: 'AL006', timestamp: '2023-02-26T14:00:00Z', actor: 'System', action: 'Fraud Detection Scan', details: 'AI fraud scan completed, no issues found', type: 'system' },
      { id: 'AL007', timestamp: '2023-02-27T09:00:00Z', actor: 'F&I Product Manager', action: 'Manual Review Required', details: 'Adjusted mileage limits for special case', type: 'user' },
      { id: 'AL008', timestamp: '2023-06-01T10:00:00Z', actor: 'System', action: 'Claim filed', details: 'Claim #CLM901 filed for transmission issue', type: 'user' },
    ],
    milestones: [
      { name: 'Initiated', date: '2023-02-25', completed: true },
      { name: 'Underwritten', date: null, completed: false },
      { name: 'Approved', date: null, completed: false },
      { name: 'Active', date: null, completed: false },
      { name: 'Renewed/Cancelled', date: null, completed: false },
    ],
    relatedDocuments: [
      { name: 'Contract Quote.pdf', url: '/docs/VSC002_Quote.pdf', type: 'pdf' },
    ],
  },
  {
    id: 'VSC003',
    planName: 'Basic Powertrain',
    vehicle: 'Ford F-150 2018',
    vin: '1FTFW1E8XKE000789',
    customer: 'Charlie Brown',
    customerId: 'CUST003',
    dealer: 'Rural Trucks',
    dealerId: 'DEAL003',
    status: 'Pending',
    startDate: '2023-04-10',
    endDate: '2028-04-09',
    mileageLimit: '120,000 miles',
    premium: '$1,200',
    deductible: '$250',
    workflowStage: 'Customer Signature Awaiting',
    slaDue: '2023-10-01',
    auditLog: [
      { id: 'AL009', timestamp: '2023-04-05T11:00:00Z', actor: 'Dealer Portal User', action: 'Contract Drafted', details: 'VSC for Ford F-150 created', type: 'user' },
      { id: 'AL010', timestamp: '2023-04-06T15:00:00Z', actor: 'System', action: 'E-signature Request Sent', details: 'Email sent to Charlie Brown for signature', type: 'system' },
    ],
    milestones: [
      { name: 'Initiated', date: '2023-04-05', completed: true },
      { name: 'Underwritten', date: '2023-04-05', completed: true },
      { name: 'Approved', date: null, completed: false },
      { name: 'Active', date: null, completed: false },
      { name: 'Renewed/Cancelled', date: null, completed: false },
    ],
    relatedDocuments: [],
  },
  {
    id: 'VSC004',
    planName: 'Ultimate Care',
    vehicle: 'Mercedes-Benz C-Class 2021',
    vin: 'WDDW05JB1MB123456',
    customer: 'Diana Prince',
    customerId: 'CUST004',
    dealer: 'Prestige Autos',
    dealerId: 'DEAL001', // Same dealer as VSC001
    status: 'Rejected',
    startDate: '2023-06-01',
    endDate: '2024-03-31', // Expiring soon
    mileageLimit: '50,000 miles',
    premium: '$3,800',
    deductible: '$50',
    workflowStage: 'Declined by Underwriting',
    slaDue: '2023-09-15',
    auditLog: [
      { id: 'AL011', timestamp: '2023-05-20T09:00:00Z', actor: 'Dealer Portal User', action: 'Contract Initiated', details: 'VSC for Mercedes-Benz C-Class', type: 'user' },
      { id: 'AL012', timestamp: '2023-05-22T16:00:00Z', actor: 'Underwriting Team', action: 'Contract Rejected', details: 'Vehicle age/mileage outside policy parameters', type: 'system' },
    ],
    milestones: [
      { name: 'Initiated', date: '2023-05-20', completed: true },
      { name: 'Underwritten', date: '2023-05-22', completed: true },
      { name: 'Approved', date: null, completed: false },
      { name: 'Active', date: null, completed: false },
      { name: 'Renewed/Cancelled', date: null, completed: false },
    ],
    relatedDocuments: [],
  },
  {
    id: 'VSC005',
    planName: 'EV Power Protect',
    vehicle: 'Tesla Model 3 2023',
    vin: '5YJ3E1EA5PF123789',
    customer: 'Ethan Hunt',
    customerId: 'CUST005',
    dealer: 'Luxury Motors',
    dealerId: 'DEAL001',
    status: 'Exception',
    startDate: '2023-07-20',
    endDate: '2028-07-19',
    mileageLimit: '75,000 miles',
    premium: '$3,000',
    deductible: '$150',
    workflowStage: 'Manual Review by Legal',
    slaDue: '2023-12-01',
    auditLog: [
      { id: 'AL013', timestamp: '2023-07-15T10:00:00Z', actor: 'System Architect', action: 'Contract Initiated', details: 'New VSC for Tesla Model 3', type: 'user' },
      { id: 'AL014', timestamp: '2023-07-16T11:00:00Z', actor: 'System', action: 'Policy Rule Exception', details: 'New EV model triggered special legal review', type: 'system' },
    ],
    milestones: [
      { name: 'Initiated', date: '2023-07-15', completed: true },
      { name: 'Underwritten', date: null, completed: false },
      { name: 'Approved', date: null, completed: false },
      { name: 'Active', date: null, completed: false },
      { name: 'Renewed/Cancelled', date: null, completed: false },
    ],
    relatedDocuments: [
      { name: 'EV Policy Addendum.pdf', url: '/docs/VSC005_EVAddendum.pdf', type: 'pdf' },
    ],
  },
  {
    id: 'VSC006',
    planName: 'Luxury Extended',
    vehicle: 'BMW X5 2019',
    vin: 'WBAXX5G04KF012345',
    customer: 'Fiona Glenanne',
    customerId: 'CUST006',
    dealer: 'Elite Autos',
    dealerId: 'DEAL002',
    status: 'Approved',
    startDate: '2023-09-01',
    endDate: '2029-08-31',
    mileageLimit: '70,000 miles',
    premium: '$4,200',
    deductible: '$75',
    workflowStage: 'Active',
    slaDue: '2024-02-15',
    auditLog: [
      { id: 'AL015', timestamp: '2023-08-25T09:00:00Z', actor: 'Dealer Portal User', action: 'Contract Initiated', details: 'New VSC for BMW X5', type: 'user' },
      { id: 'AL016', timestamp: '2023-08-28T10:30:00Z', actor: 'System', action: 'Underwriting Approved', details: 'Automated underwriting for luxury vehicle', type: 'system' },
      { id: 'AL017', timestamp: '2023-09-01T11:00:00Z', actor: 'Fiona Glenanne (Customer)', action: 'Contract Signed', details: 'Digital signature completed', type: 'user' },
      { id: 'AL018', timestamp: '2023-10-10T15:00:00Z', actor: 'System', action: 'Claim filed', details: 'Claim #CLM101 filed for suspension repair', type: 'user' },
    ],
    milestones: [
      { name: 'Initiated', date: '2023-08-25', completed: true },
      { name: 'Underwritten', date: '2023-08-28', completed: true },
      { name: 'Approved', date: '2023-09-01', completed: true },
      { name: 'Active', date: null, completed: false },
      { name: 'Renewed/Cancelled', date: null, completed: false },
    ],
    relatedDocuments: [],
  },
];

// Helper for icon placeholders
const Icon = ({ name }) => {
  const icons = {
    search: '🔍', dashboard: '🏠', contract: '📄', user: '👤', info: 'ℹ️',
    check: '✅', clock: '⏱️', warning: '⚠️', times: '❌', bolt: '⚡',
    edit: '✏️', plus: '➕', refresh: '🔄', download: '⬇️',
    calendar: '📅', dollar: '💲', exclamation: '❗',
  };
  return <span style={{ marginRight: 'var(--spacing-xs)' }}>{icons[name] || ''}</span>;
};

// Reusable Components
const Breadcrumbs = ({ items, onNavigate }) => (
  <div className="breadcrumbs">
    {items?.map?.((item, index) => (
      <React.Fragment key={item.path}>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.path, item.params); }}>{item.label}</a>
        {index < items.length - 1 && <span>/</span>}
      </React.Fragment>
    ))}
  </div>
);

const Card = ({ children, onClick, className = '' }) => (
  <div className={`card ${onClick ? 'clickable' : ''} ${className}`} onClick={onClick}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const statusClass = status?.toLowerCase?.()?.replace?.(' ', '-');
  return <span className={`status-badge status-${statusClass}`}>{status}</span>;
};

const Button = ({ children, onClick, variant = 'primary', disabled, icon, className = '' }) => (
  <button
    className={`button button-${variant} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon && <Icon name={icon} />}
    {children}
  </Button>
);

const ChartComponent = ({ type, title }) => (
  <div className="chart-container" style={{ marginBottom: 'var(--spacing-md)' }}>
    {title} ({type} Chart) - Placeholder
  </div>
);

const MilestoneTracker = ({ milestones, currentStage }) => (
  <div className="milestone-tracker-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
    <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Workflow Progress</h3>
    <div className="milestone-steps">
      <div className="milestone-line"></div>
      {milestones?.map?.((milestone, index) => {
        const isCompleted = milestone.completed;
        const isActive = milestone.name === currentStage && !isCompleted;
        return (
          <div
            key={milestone.name}
            className={`milestone-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
          >
            <div className="milestone-circle">{isCompleted ? '✓' : index + 1}</div>
            <div className="milestone-step-label">{milestone.name}</div>
          </div>
        );
      })}
    </div>
    {currentStage && (
      <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
        Current Stage: <span style={{ fontWeight: '600', color: 'var(--color-brand-primary)' }}>{currentStage}</span>
      </p>
    )}
  </div>
);

const AuditFeed = ({ auditLog, userRole }) => {
  const canViewSensitive = ROLES[userRole]?.canViewSensitiveLogs;
  const filteredLog = canViewSensitive ? auditLog : auditLog?.filter?.(item => item.type !== 'system');

  return (
    <div className="audit-feed-card">
      <h3 style={{ fontSize: 'var(--font-size-xl)' }}>News/Audit Feed</h3>
      {filteredLog?.length === 0 && (
        <div className="empty-state" style={{ minHeight: '100px', padding: 'var(--spacing-md)' }}>
          <p>No audit events to display.</p>
        </div>
      )}
      {filteredLog?.map?.((item) => (
        <div key={item.id} className="audit-item">
          <div className="audit-icon">
            <Icon name={item.action.includes('Approved') ? 'check' : item.action.includes('Rejected') ? 'times' : item.type === 'system' ? 'bolt' : 'user'} />
          </div>
          <div className="audit-content">
            <div className="audit-message">
              <strong>{item.actor}</strong> {item.action} - {item.details}
            </div>
            <div className="audit-meta">
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Screens ---
const DashboardScreen = ({ onNavigate, userRole }) => {
  const userCanCreateVSC = ROLES[userRole]?.canCreateVSC;
  const userCanViewAllContracts = ROLES[userRole]?.canViewAllContracts;

  const contractsToDisplay = userCanViewAllContracts
    ? SAMPLE_CONTRACTS
    : SAMPLE_CONTRACTS.filter(c => c.dealerId === 'DEAL001' || c.customerId === 'CUST001'); // Example for specific roles

  const totalContracts = contractsToDisplay?.length;
  const approvedContracts = contractsToDisplay?.filter?.(c => c.status === 'Approved')?.length;
  const pendingContracts = contractsToDisplay?.filter?.(c => c.status === 'Pending')?.length;
  const inProgressContracts = contractsToDisplay?.filter?.(c => c.status === 'In Progress')?.length;

  // --- New KPI Calculations ---
  const today = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(today.getDate() + 90);

  const contractsExpiringSoon = contractsToDisplay?.filter?.(c => {
    if (!c.endDate) return false;
    const endDate = new Date(c.endDate);
    // Only count if end date is in the future and within 90 days from now
    return endDate > today && endDate <= ninetyDaysFromNow;
  })?.length || 0;

  const allAuditLogs = SAMPLE_CONTRACTS.flatMap(c => c.auditLog || []);
  const totalClaimsFiled = allAuditLogs?.filter?.(log => log.action === 'Claim filed')?.length || 0;

  const validPremiums = contractsToDisplay
    ?.map?.(c => parseFloat(c.premium?.replace?.('$', '')?.replace?.(',', '') || '0'))
    ?.filter?.(p => !isNaN(p));
  const averagePremium = validPremiums.length > 0
    ? (validPremiums.reduce((sum, p) => sum + p, 0) / validPremiums.length).toFixed(2)
    : 'N/A';
  // --- End New KPI Calculations ---

  return (
    <div style={{ padding: 'var(--spacing-lg) 0' }}>
      <div className="dashboard-section-header">
        <h2 style={{ fontSize: 'var(--font-size-2xl)' }}>Vehicle Service Contracts Overview</h2>
        {userCanCreateVSC && (
          <Button onClick={() => onNavigate('CREATE_VSC')} icon="plus">Create New VSC</Button>
        )}
      </div>

      <div className="dashboard-grid">
        <Card className="kpi-card realtime-pulse">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Total Contracts</h3>
            <Icon name="contract" />
          </div>
          <p className="kpi-card-value">{totalContracts}</p>
        </Card>
        <Card className="kpi-card realtime-pulse">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Approved Contracts</h3>
            <Icon name="check" />
          </div>
          <p className="kpi-card-value">
            {approvedContracts}
            <span className="trend-indicator">+5%</span>
          </p>
        </Card>
        <Card className="kpi-card realtime-pulse">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Pending Approvals</h3>
            <Icon name="clock" />
          </div>
          <p className="kpi-card-value">
            {pendingContracts}
            <span className="trend-indicator negative">-2%</span>
          </p>
        </Card>
        <Card className="kpi-card realtime-pulse">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Contracts In Progress</h3>
            <Icon name="refresh" />
          </div>
          <p className="kpi-card-value">
            {inProgressContracts}
            <span className="trend-indicator">+1%</span>
          </p>
        </Card>

        {/* New KPI Cards */}
        <Card className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Expiring Soon (90D)</h3>
            <Icon name="calendar" />
          </div>
          <p className="kpi-card-value">{contractsExpiringSoon}</p>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Total Claims Filed</h3>
            <Icon name="exclamation" />
          </div>
          <p className="kpi-card-value">{totalClaimsFiled}</p>
        </Card>
        <Card className="kpi-card">
          <div className="kpi-card-header">
            <h3 className="kpi-card-title">Average Premium</h3>
            <Icon name="dollar" />
          </div>
          <p className="kpi-card-value">${averagePremium}</p>
        </Card>

      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Card>
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginTop: 0, marginBottom: 'var(--spacing-md)' }}>Contract Status Distribution</h3>
          <ChartComponent type="Donut" title="Contract Status" />
        </Card>
        <Card>
          <h3 style={{ fontSize: 'var(--font-size-xl)', marginTop: 0, marginBottom: 'var(--spacing-md)' }}>Claims Adjudication Trends</h3>
          <ChartComponent type="Line" title="Claims Trends" />
        </Card>
      </div>

      <div className="dashboard-section-header" style={{ marginTop: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)' }}>My Contracts</h2>
        <Button onClick={() => alert('Exporting contracts to Excel...')} icon="download" variant="secondary">Export All</Button>
      </div>

      {contractsToDisplay?.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📄</span>
          <h3>No Contracts Found</h3>
          <p>It looks like you don't have any VSC contracts yet. Start by creating one!</p>
          {userCanCreateVSC && (
            <Button onClick={() => onNavigate('CREATE_VSC')} icon="plus">Create New VSC</Button>
          )}
        </div>
      ) : (
        <Card>
          {contractsToDisplay?.map?.((contract) => (
            <div
              key={contract.id}
              className="list-item"
              onClick={() => onNavigate('VSC_DETAIL', { id: contract.id })}
            >
              <div className="list-item-details">
                <div className="list-item-title">{contract.planName} for {contract.vehicle}</div>
                <div className="list-item-meta">
                  <span>Customer: {contract.customer}</span>
                  <span style={{ marginLeft: 'var(--spacing-md)' }}>Dealer: {contract.dealer}</span>
                </div>
              </div>
              <div className="list-item-status">
                <StatusBadge status={contract.status} />
              </div>
            </div>
          ))}
        </Card>
      )}

      <div className="dashboard-section-header" style={{ marginTop: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)' }}>Recent System Activities</h2>
        <Button onClick={() => alert('Refreshing activities...')} icon="refresh" variant="secondary">Refresh</Button>
      </div>
      <AuditFeed auditLog={SAMPLE_CONTRACTS.flatMap(c => c.auditLog)} userRole={userRole} />
    </div>
  );
};

const VSCDetailScreen = ({ contractId, onNavigate, userRole }) => {
  const contract = SAMPLE_CONTRACTS.find(c => c.id === contractId);

  const canEdit = ROLES[userRole]?.canEditVSC;
  const canRenew = ROLES[userRole]?.canRenewVSC;
  const canCancel = ROLES[userRole]?.canCancelVSC;

  if (!contract) {
    return (
      <div className="empty-state" style={{ margin: 'var(--spacing-2xl)' }}>
        <span className="empty-state-icon">❌</span>
        <h3>Contract Not Found</h3>
        <p>The vehicle service contract with ID "{contractId}" could not be found.</p>
        <Button onClick={() => onNavigate('DASHBOARD')}>Back to Dashboard</Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', path: 'DASHBOARD' },
    { label: `VSC ${contract.id}`, path: 'VSC_DETAIL', params: { id: contract.id } },
  ];

  return (
    <div style={{ padding: 'var(--spacing-lg) 0' }}>
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

      <div className="detail-page-header">
        <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>{contract.planName} - {contract.vehicle}</h1>
        <div className="detail-page-actions">
          {canEdit && <Button onClick={() => onNavigate('EDIT_VSC', { id: contract.id })} icon="edit">Edit Contract</Button>}
          {canRenew && <Button onClick={() => alert(`Renewing VSC ${contract.id}`)} variant="secondary">Renew Contract</Button>}
          {canCancel && <Button onClick={() => alert(`Cancelling VSC ${contract.id}`)} variant="secondary">Cancel Contract</Button>}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main-column">
          <div className="detail-summary-section">
            <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Contract Summary</h3>
            <div className="detail-summary-item">
              <label>Contract ID:</label>
              <span>{contract.id}</span>
            </div>
            <div className="detail-summary-item">
              <label>Customer:</label>
              <span>{contract.customer}</span>
            </div>
            <div className="detail-summary-item">
              <label>Dealer:</label>
              <span>{contract.dealer}</span>
            </div>
            <div className="detail-summary-item">
              <label>Vehicle:</label>
              <span>{contract.vehicle} ({contract.vin})</span>
            </div>
            <div className="detail-summary-item">
              <label>Status:</label>
              <span><StatusBadge status={contract.status} /></span>
            </div>
            <div className="detail-summary-item">
              <label>Workflow Stage:</label>
              <span>{contract.workflowStage}</span>
            </div>
            <div className="detail-summary-item">
              <label>SLA Due Date:</label>
              <span>{contract.slaDue} <Icon name="warning" /></span>
            </div>
            <div className="detail-summary-item">
              <label>Plan Details:</label>
              <span>{contract.planName}, {contract.mileageLimit}</span>
            </div>
            <div className="detail-summary-item">
              <label>Coverage Period:</label>
              <span>{contract.startDate} to {contract.endDate}</span>
            </div>
            <div className="detail-summary-item">
              <label>Premium:</label>
              <span>{contract.premium}</span>
            </div>
            <div className="detail-summary-item">
              <label>Deductible:</label>
              <span>{contract.deductible}</span>
            </div>
          </div>

          <div className="detail-summary-section">
            <h3 style={{ fontSize: 'var(--font-size-xl)' }}>Related Documents</h3>
            {contract.relatedDocuments?.length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>No related documents.</p>
            ) : (
              contract.relatedDocuments?.map?.((doc, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                  <Icon name="download" />
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'var(--spacing-xs)', color: 'var(--color-brand-primary)', textDecoration: 'none', fontSize: 'var(--font-size-base)' }}>
                    {doc.name}
                  </a>
                </div>
              ))
            )}
          </div>

        </div>

        <div className="detail-side-column">
          <MilestoneTracker milestones={contract.milestones} currentStage={contract.workflowStage} />
          <AuditFeed auditLog={contract.auditLog} userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

const VSCFormScreen = ({ contractId, onNavigate }) => {
  const isEdit = !!contractId;
  const contract = isEdit ? SAMPLE_CONTRACTS.find(c => c.id === contractId) : {};

  const [formData, setFormData] = useState(() => ({
    planName: contract?.planName || '',
    vehicle: contract?.vehicle || '',
    vin: contract?.vin || '',
    customer: contract?.customer || '',
    dealer: contract?.dealer || '',
    status: contract?.status || 'Pending',
    startDate: contract?.startDate || '',
    endDate: contract?.endDate || '',
    mileageLimit: contract?.mileageLimit || '',
    premium: contract?.premium?.replace?.('$', '')?.replace?.(',', '') || '', // Clean for number input
    deductible: contract?.deductible?.replace?.('$', '') || '', // Clean for number input
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      alert(`Updating VSC ${contractId} with: ${JSON.stringify(formData, null, 2)}`);
    } else {
      alert(`Creating new VSC with: ${JSON.stringify(formData, null, 2)}`);
    }
    onNavigate('DASHBOARD');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: 'DASHBOARD' },
    isEdit
      ? { label: `VSC ${contractId}`, path: 'VSC_DETAIL', params: { id: contractId } }
      : null,
    { label: isEdit ? 'Edit Contract' : 'Create Contract', path: isEdit ? 'EDIT_VSC' : 'CREATE_VSC', params: isEdit ? { id: contractId } : {} },
  ].filter(Boolean);

  return (
    <div style={{ padding: 'var(--spacing-lg) 0' }}>
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />

      <h1 style={{ fontSize: 'var(--font-size-3xl)', margin: 'var(--spacing-lg) auto', maxWidth: '800px' }}>
        {isEdit ? `Edit Contract: ${contractId}` : 'Create New Vehicle Service Contract'}
      </h1>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label htmlFor="planName">Plan Name <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="planName"
            name="planName"
            value={formData.planName}
            onChange={handleInputChange}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="vehicle">Vehicle <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="vehicle"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="vin">VIN <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            required
            maxLength="17"
          />
        </div>
        <div className="form-group">
          <label htmlFor="customer">Customer Name <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="customer"
            name="customer"
            value={formData.customer}
            onChange={handleInputChange}
            required
            placeholder="Auto-populated from CRM"
          />
        </div>
        <div className="form-group">
          <label htmlFor="dealer">Dealership <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            id="dealer"
            name="dealer"
            value={formData.dealer}
            onChange={handleInputChange}
            required
            placeholder="Auto-populated based on user"
          />
        </div>
        <div className="form-group">
          <label htmlFor="startDate">Start Date <span style={{ color: 'red' }}>*</span></label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date <span style={{ color: 'red' }}>*</span></label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mileageLimit">Mileage Limit</label>
          <input
            type="text"
            id="mileageLimit"
            name="mileageLimit"
            value={formData.mileageLimit}
            onChange={handleInputChange}
            placeholder="e.g., 100,000 miles"
          />
        </div>
        <div className="form-group">
          <label htmlFor="premium">Premium ($) <span style={{ color: 'red' }}>*</span></label>
          <input
            type="number"
            id="premium"
            name="premium"
            value={formData.premium}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="deductible">Deductible ($) <span style={{ color: 'red' }}>*</span></label>
          <input
            type="number"
            id="deductible"
            name="deductible"
            value={formData.deductible}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="fileUpload">Upload Supporting Documents</label>
          <input
            type="file"
            id="fileUpload"
            name="fileUpload"
            multiple
            style={{ padding: 'var(--spacing-xs)', border: 'none', boxShadow: 'none' }}
          />
        </div>

        <div className="form-actions">
          <Button type="button" onClick={() => onNavigate(isEdit ? 'VSC_DETAIL' : 'DASHBOARD', isEdit ? { id: contractId } : {})} variant="secondary">Cancel</Button>
          <Button type="submit" variant="primary">{isEdit ? 'Save Changes' : 'Create Contract'}</Button>
        </div>
      </form>
    </div>
  );
};


// --- Main Application ---
function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [userRole, setUserRole] = useState('F_I_PRODUCT_MANAGER'); // Default role for testing

  const handleNavigate = (screen, params = {}) => {
    setView({ screen, params });
  };

  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen onNavigate={handleNavigate} userRole={userRole} />;
      case 'VSC_DETAIL':
        return <VSCDetailScreen contractId={view.params.id} onNavigate={handleNavigate} userRole={userRole} />;
      case 'CREATE_VSC':
        return <VSCFormScreen onNavigate={handleNavigate} />;
      case 'EDIT_VSC':
        return <VSCFormScreen contractId={view.params.id} onNavigate={handleNavigate} />;
      default:
        return <DashboardScreen onNavigate={handleNavigate} userRole={userRole} />;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="logo" onClick={() => handleNavigate('DASHBOARD')}>VSC App</div>
          <div className="role-selector">
            <label htmlFor="role-select">Role:</label>
            <select id="role-select" value={userRole} onChange={(e) => setUserRole(e.target.value)}>
              {Object.keys(ROLES).map(role => (
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="global-search">
          <Icon name="search" className="search-icon" />
          <input type="text" placeholder="Global search..." />
        </div>
        <div className="user-profile">
          <img src="https://via.placeholder.com/32" alt="User Avatar" />
          <span>{userRole.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}</span>
        </div>
      </header>
      <main className="main-content">
        {renderScreen()}
      </main>
    </div>
  );
}

export default App;