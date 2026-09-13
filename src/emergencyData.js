export const reportStorageKey = 'masinloc-connect-active-report-v2';
export const legacyReportStorageKey = 'masinloc-connect-active-report-v1';

export function minimizeDeliveredReport(report) {
  if (!report) return null;
  return {
    client_report_id: report.client_report_id,
    report_secret: report.report_secret,
    target_agency: report.target_agency,
    report_mode: report.report_mode,
    incident_type: report.incident_type,
    sync_state: report.sync_state,
    status: report.status,
    reference: report.reference || null,
    received_at: report.received_at || null,
    acknowledged_at: report.acknowledged_at || null,
    assigned_unit: report.assigned_unit || null,
    resolved_at: report.resolved_at || null,
    location_summary: report.location_summary || report.barangay || report.landmark || (report.latitude ? 'GPS shared' : 'Not available'),
    updated_local_at: report.updated_local_at || new Date().toISOString(),
  };
}

export function recoverInterruptedReport(report) {
  if (!report || report.sync_state !== 'sending') return report;
  return {
    ...report,
    sync_state: 'queued',
    status: 'saved_offline',
    last_error: 'Delivery was interrupted before confirmation. Retry sending to confirm receipt.',
    updated_local_at: new Date().toISOString(),
  };
}

export function prepareReportForStorage(report) {
  if (!report) return null;
  const recovered = recoverInterruptedReport(report);
  return recovered.sync_state === 'delivered' ? minimizeDeliveredReport(recovered) : recovered;
}

export const reportStatusCopy = {
  saved_offline: ['Saved offline · not yet received', 'Stored on this device. PNP/MDRRMO has not received it yet.'],
  sending: ['Sending', 'A connection is available. Sending your report now.'],
  received: ['Received by emergency system', 'The server accepted your report. Human acknowledgement may still be pending.'],
  acknowledged: ['Acknowledged', 'An authorized responder has acknowledged this report.'],
  assigned: ['Responder assigned', 'The incident has been assigned to a unit or responder.'],
  dispatched: ['Dispatched', 'A response unit has been dispatched.'],
  en_route: ['Responder en route', 'The assigned response unit is on the way.'],
  on_scene: ['Responder on scene', 'The response team marked the incident as on scene.'],
  resolved: ['Resolved', 'The response team marked this incident resolved.'],
  closed: ['Closed', 'This incident record has been closed.'],
};
export const incidentTypes = {
  pnp: [['crime','Crime / ongoing incident'],['threat','Threat / immediate danger'],['suspicious_activity','Suspicious activity'],['missing_person','Missing person'],['accident','Road / vehicle accident'],['traffic','Traffic / public safety'],['other','Other police concern']],
  mdrrmo: [['flood','Flood / rising water'],['fire','Fire'],['rescue','Rescue / trapped person'],['medical','Medical emergency / ambulance'],['storm_hazard','Storm / fallen tree / hazard'],['evacuation','Evacuation assistance'],['accident','Accident / rescue needed'],['other','Other emergency / disaster concern']],
};
