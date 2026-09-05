export const reportStorageKey = 'masinloc-connect-active-report-v1';
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
