/**
 * HR Document Templates Data Definitions
 * 
 * This file contains TypeScript interfaces and constant definitions for
 * the HR Document Templates Panel feature.
 */

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Represents a placeholder field within a template prompt
 */
export interface PlaceholderField {
  name: string;
  description: string;
  required: boolean;
  example?: string;
}

/**
 * Represents a category of HR documents
 */
export interface DocumentCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
}

/**
 * Represents an HR document template with its prompt and placeholders
 */
export interface HRTemplate {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  prompt: string;
  placeholders: PlaceholderField[];
  requiredSections: string[];
}

// ============================================================================
// Document Categories
// ============================================================================

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'onboarding', label: 'Onboarding & Joining', icon: '📋', description: 'New hire documentation' },
  { id: 'employment', label: 'Employment', icon: '💼', description: 'Employment status changes' },
  { id: 'leave', label: 'Leave Management', icon: '🏖️', description: 'Leave and WFH requests' },
  { id: 'disciplinary', label: 'Disciplinary', icon: '⚠️', description: 'Warnings and notices' },
  { id: 'separation', label: 'Separation', icon: '👋', description: 'Exit documentation' },
  { id: 'assets', label: 'Asset Management', icon: '💻', description: 'Equipment and assets' },
];


// ============================================================================
// HR Document Templates
// ============================================================================

export const HR_TEMPLATES: HRTemplate[] = [
  // -------------------------------------------------------------------------
  // Onboarding & Joining Templates (4 templates)
  // -------------------------------------------------------------------------
  {
    id: 'offer_letter',
    categoryId: 'onboarding',
    name: 'Offer Letter',
    description: 'Formal job offer with compensation details',
    prompt: `Create a professional Offer Letter for:

[Employee_Name] - Full name of the candidate
[Position] - Job title being offered
[Department] - Department/team
[Start_Date] - Proposed joining date
[Salary] - Annual/monthly compensation
[Benefits] - Key benefits to highlight
[Reporting_To] - Manager name and title
[Company_Name] - Your company name
[Response_Deadline] - Date by which candidate should respond

[Optional: Equity_Bonus] - Stock options or signing bonus if applicable`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the candidate', required: true },
      { name: 'Position', description: 'Job title being offered', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Start_Date', description: 'Proposed joining date', required: true },
      { name: 'Salary', description: 'Annual or monthly compensation', required: true },
      { name: 'Benefits', description: 'Key benefits to highlight', required: true },
      { name: 'Reporting_To', description: 'Manager name and title', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Response_Deadline', description: 'Date by which candidate should respond', required: true },
      { name: 'Equity_Bonus', description: 'Stock options or signing bonus', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'position_details', 'compensation', 'benefits', 'contingencies', 'signature'],
  },
  {
    id: 'appointment_letter',
    categoryId: 'onboarding',
    name: 'Appointment Letter',
    description: 'Official employment confirmation after offer acceptance',
    prompt: `Create a professional Appointment Letter for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Start_Date] - Date of joining
[Salary] - Confirmed compensation
[Probation_Period] - Duration of probation period
[Working_Hours] - Standard working hours
[Reporting_To] - Manager name and title
[Company_Name] - Your company name
[Work_Location] - Office location/address

[Optional: Notice_Period] - Required notice period for resignation`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Start_Date', description: 'Date of joining', required: true },
      { name: 'Salary', description: 'Confirmed compensation', required: true },
      { name: 'Probation_Period', description: 'Duration of probation period', required: true },
      { name: 'Working_Hours', description: 'Standard working hours', required: true },
      { name: 'Reporting_To', description: 'Manager name and title', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Work_Location', description: 'Office location/address', required: true },
      { name: 'Notice_Period', description: 'Required notice period for resignation', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'appointment_details', 'terms_conditions', 'compensation', 'signature'],
  },
  {
    id: 'joining_letter',
    categoryId: 'onboarding',
    name: 'Joining Letter',
    description: 'Employee acknowledgment of joining and terms acceptance',
    prompt: `Create a professional Joining Letter for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Join_Date] - Actual date of joining
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager

[Optional: Employee_ID] - Assigned employee ID if available`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Join_Date', description: 'Actual date of joining', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Employee_ID', description: 'Assigned employee ID', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'acknowledgment', 'terms_acceptance', 'signature'],
  },
  {
    id: 'nda',
    categoryId: 'onboarding',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Confidentiality agreement for protecting company information',
    prompt: `Create a professional Non-Disclosure Agreement (NDA) for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Company_Name] - Your company name
[Effective_Date] - Date NDA becomes effective
[Confidential_Information_Types] - Types of confidential information covered
[Duration] - How long confidentiality obligations last

[Optional: Jurisdiction] - Legal jurisdiction for disputes`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Effective_Date', description: 'Date NDA becomes effective', required: true },
      { name: 'Confidential_Information_Types', description: 'Types of confidential information covered', required: true },
      { name: 'Duration', description: 'How long confidentiality obligations last', required: true },
      { name: 'Jurisdiction', description: 'Legal jurisdiction for disputes', required: false },
    ],
    requiredSections: ['date', 'parties', 'definitions', 'obligations', 'exclusions', 'term', 'remedies', 'signature'],
  },

  // -------------------------------------------------------------------------
  // Employment Templates (4 templates)
  // -------------------------------------------------------------------------
  {
    id: 'probation_confirmation',
    categoryId: 'employment',
    name: 'Probation Confirmation',
    description: 'Confirmation of successful probation completion',
    prompt: `Create a professional Probation Confirmation Letter for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Probation_Start_Date] - When probation started
[Confirmation_Date] - Date of confirmation as permanent employee
[Company_Name] - Your company name
[Manager_Name] - Reporting manager name

[Optional: Performance_Highlights] - Key achievements during probation`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Probation_Start_Date', description: 'When probation started', required: true },
      { name: 'Confirmation_Date', description: 'Date of confirmation as permanent employee', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Manager_Name', description: 'Reporting manager name', required: true },
      { name: 'Performance_Highlights', description: 'Key achievements during probation', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'confirmation_details', 'benefits_update', 'signature'],
  },
  {
    id: 'salary_increment',
    categoryId: 'employment',
    name: 'Salary Increment Letter',
    description: 'Notification of salary increase and revised compensation',
    prompt: `Create a professional Salary Increment Letter for:

[Employee_Name] - Full name of the employee
[Position] - Current job title
[Department] - Department/team
[Current_Salary] - Current compensation
[New_Salary] - Revised compensation
[Increment_Percentage] - Percentage increase
[Effective_Date] - When new salary takes effect
[Company_Name] - Your company name
[Reason] - Reason for increment (performance, annual review, etc.)

[Optional: Bonus] - Any additional bonus being awarded`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Current job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Current_Salary', description: 'Current compensation', required: true },
      { name: 'New_Salary', description: 'Revised compensation', required: true },
      { name: 'Increment_Percentage', description: 'Percentage increase', required: true },
      { name: 'Effective_Date', description: 'When new salary takes effect', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Reason', description: 'Reason for increment', required: true },
      { name: 'Bonus', description: 'Any additional bonus being awarded', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'appreciation', 'salary_details', 'effective_date', 'signature'],
  },
  {
    id: 'promotion_letter',
    categoryId: 'employment',
    name: 'Promotion Letter',
    description: 'Notification of job promotion with new role details',
    prompt: `Create a professional Promotion Letter for:

[Employee_Name] - Full name of the employee
[Current_Position] - Current job title
[New_Position] - New job title after promotion
[Department] - Department/team
[New_Salary] - Revised compensation
[Effective_Date] - When promotion takes effect
[New_Responsibilities] - Key responsibilities in new role
[Company_Name] - Your company name
[Reporting_To] - New reporting manager if changed

[Optional: Additional_Benefits] - New benefits with promotion`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Current_Position', description: 'Current job title', required: true },
      { name: 'New_Position', description: 'New job title after promotion', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'New_Salary', description: 'Revised compensation', required: true },
      { name: 'Effective_Date', description: 'When promotion takes effect', required: true },
      { name: 'New_Responsibilities', description: 'Key responsibilities in new role', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Reporting_To', description: 'New reporting manager', required: true },
      { name: 'Additional_Benefits', description: 'New benefits with promotion', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'congratulations', 'promotion_details', 'responsibilities', 'compensation', 'signature'],
  },
  {
    id: 'role_change',
    categoryId: 'employment',
    name: 'Role Change Letter',
    description: 'Notification of internal transfer or role modification',
    prompt: `Create a professional Role Change Letter for:

[Employee_Name] - Full name of the employee
[Current_Position] - Current job title
[New_Position] - New job title
[Current_Department] - Current department
[New_Department] - New department
[Effective_Date] - When change takes effect
[Reason] - Reason for role change
[New_Responsibilities] - Key responsibilities in new role
[Company_Name] - Your company name
[New_Reporting_To] - New reporting manager

[Optional: Salary_Change] - Any compensation adjustment`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Current_Position', description: 'Current job title', required: true },
      { name: 'New_Position', description: 'New job title', required: true },
      { name: 'Current_Department', description: 'Current department', required: true },
      { name: 'New_Department', description: 'New department', required: true },
      { name: 'Effective_Date', description: 'When change takes effect', required: true },
      { name: 'Reason', description: 'Reason for role change', required: true },
      { name: 'New_Responsibilities', description: 'Key responsibilities in new role', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'New_Reporting_To', description: 'New reporting manager', required: true },
      { name: 'Salary_Change', description: 'Any compensation adjustment', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'change_details', 'responsibilities', 'reporting_structure', 'signature'],
  },

  // -------------------------------------------------------------------------
  // Leave Management Templates (3 templates)
  // -------------------------------------------------------------------------
  {
    id: 'leave_application',
    categoryId: 'leave',
    name: 'Leave Application',
    description: 'Formal request for leave of absence',
    prompt: `Create a professional Leave Application for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Leave_Type] - Type of leave (annual, sick, personal, etc.)
[Start_Date] - Leave start date
[End_Date] - Leave end date
[Total_Days] - Total number of leave days
[Reason] - Reason for leave
[Company_Name] - Your company name
[Manager_Name] - Reporting manager name

[Optional: Handover_Details] - Work handover arrangements`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Leave_Type', description: 'Type of leave', required: true },
      { name: 'Start_Date', description: 'Leave start date', required: true },
      { name: 'End_Date', description: 'Leave end date', required: true },
      { name: 'Total_Days', description: 'Total number of leave days', required: true },
      { name: 'Reason', description: 'Reason for leave', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Manager_Name', description: 'Reporting manager name', required: true },
      { name: 'Handover_Details', description: 'Work handover arrangements', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'leave_details', 'reason', 'handover', 'signature'],
  },
  {
    id: 'leave_approval',
    categoryId: 'leave',
    name: 'Leave Approval Letter',
    description: 'Official approval of employee leave request',
    prompt: `Create a professional Leave Approval Letter for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Leave_Type] - Type of leave approved
[Start_Date] - Approved leave start date
[End_Date] - Approved leave end date
[Total_Days] - Total approved leave days
[Return_Date] - Expected return to work date
[Company_Name] - Your company name
[Approver_Name] - Name of approving manager

[Optional: Conditions] - Any conditions or notes for the leave`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Leave_Type', description: 'Type of leave approved', required: true },
      { name: 'Start_Date', description: 'Approved leave start date', required: true },
      { name: 'End_Date', description: 'Approved leave end date', required: true },
      { name: 'Total_Days', description: 'Total approved leave days', required: true },
      { name: 'Return_Date', description: 'Expected return to work date', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Approver_Name', description: 'Name of approving manager', required: true },
      { name: 'Conditions', description: 'Any conditions or notes for the leave', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'approval_details', 'leave_period', 'return_date', 'signature'],
  },
  {
    id: 'work_from_home',
    categoryId: 'leave',
    name: 'Work From Home Request',
    description: 'Request for remote work arrangement',
    prompt: `Create a professional Work From Home Request for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[WFH_Start_Date] - WFH start date
[WFH_End_Date] - WFH end date (or "ongoing" for permanent)
[Reason] - Reason for WFH request
[Work_Setup] - Description of home work setup
[Availability_Hours] - Working hours during WFH
[Company_Name] - Your company name
[Manager_Name] - Reporting manager name

[Optional: Communication_Plan] - How you'll stay connected with team`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'WFH_Start_Date', description: 'WFH start date', required: true },
      { name: 'WFH_End_Date', description: 'WFH end date or ongoing', required: true },
      { name: 'Reason', description: 'Reason for WFH request', required: true },
      { name: 'Work_Setup', description: 'Description of home work setup', required: true },
      { name: 'Availability_Hours', description: 'Working hours during WFH', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Manager_Name', description: 'Reporting manager name', required: true },
      { name: 'Communication_Plan', description: 'How you will stay connected with team', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'request_details', 'work_arrangement', 'availability', 'signature'],
  },

  // -------------------------------------------------------------------------
  // Disciplinary Templates (2 templates)
  // -------------------------------------------------------------------------
  {
    id: 'warning_letter',
    categoryId: 'disciplinary',
    name: 'Warning Letter',
    description: 'Formal warning for policy violation or performance issues',
    prompt: `Create a professional Warning Letter for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Warning_Type] - Type of warning (verbal, written, final)
[Incident_Date] - Date of incident or issue
[Incident_Description] - Detailed description of the issue
[Policy_Violated] - Company policy or rule violated
[Expected_Improvement] - What improvement is expected
[Improvement_Deadline] - Deadline for improvement
[Consequences] - Consequences if not improved
[Company_Name] - Your company name
[Issuing_Manager] - Name of manager issuing warning

[Optional: Previous_Warnings] - Reference to any previous warnings`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Warning_Type', description: 'Type of warning', required: true },
      { name: 'Incident_Date', description: 'Date of incident or issue', required: true },
      { name: 'Incident_Description', description: 'Detailed description of the issue', required: true },
      { name: 'Policy_Violated', description: 'Company policy or rule violated', required: true },
      { name: 'Expected_Improvement', description: 'What improvement is expected', required: true },
      { name: 'Improvement_Deadline', description: 'Deadline for improvement', required: true },
      { name: 'Consequences', description: 'Consequences if not improved', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Issuing_Manager', description: 'Name of manager issuing warning', required: true },
      { name: 'Previous_Warnings', description: 'Reference to any previous warnings', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'incident_details', 'policy_reference', 'expectations', 'consequences', 'acknowledgment', 'signature'],
  },
  {
    id: 'show_cause_notice',
    categoryId: 'disciplinary',
    name: 'Show Cause Notice',
    description: 'Formal notice requiring explanation for misconduct',
    prompt: `Create a professional Show Cause Notice for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Incident_Date] - Date of incident
[Incident_Description] - Detailed description of the alleged misconduct
[Policy_Violated] - Company policy or rule allegedly violated
[Response_Deadline] - Deadline for employee response
[Response_Method] - How employee should respond (written/meeting)
[Company_Name] - Your company name
[Issuing_Authority] - Name and title of issuing authority

[Optional: Evidence] - Reference to any evidence or witnesses`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Incident_Date', description: 'Date of incident', required: true },
      { name: 'Incident_Description', description: 'Detailed description of the alleged misconduct', required: true },
      { name: 'Policy_Violated', description: 'Company policy or rule allegedly violated', required: true },
      { name: 'Response_Deadline', description: 'Deadline for employee response', required: true },
      { name: 'Response_Method', description: 'How employee should respond', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Issuing_Authority', description: 'Name and title of issuing authority', required: true },
      { name: 'Evidence', description: 'Reference to any evidence or witnesses', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'allegations', 'policy_reference', 'response_requirements', 'deadline', 'signature'],
  },

  // -------------------------------------------------------------------------
  // Separation Templates (7 templates)
  // -------------------------------------------------------------------------
  {
    id: 'resignation_letter',
    categoryId: 'separation',
    name: 'Resignation Letter',
    description: 'Employee resignation notification',
    prompt: `Create a professional Resignation Letter for:

[Employee_Name] - Full name of the employee
[Position] - Current job title
[Department] - Department/team
[Last_Working_Day] - Proposed last working day
[Notice_Period] - Notice period being served
[Reason] - Reason for resignation (optional to include)
[Company_Name] - Your company name
[Manager_Name] - Reporting manager name

[Optional: Handover_Commitment] - Commitment to complete handover`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Current job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Last_Working_Day', description: 'Proposed last working day', required: true },
      { name: 'Notice_Period', description: 'Notice period being served', required: true },
      { name: 'Reason', description: 'Reason for resignation', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Manager_Name', description: 'Reporting manager name', required: true },
      { name: 'Handover_Commitment', description: 'Commitment to complete handover', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'resignation_statement', 'last_day', 'gratitude', 'handover', 'signature'],
  },
  {
    id: 'resignation_acceptance',
    categoryId: 'separation',
    name: 'Resignation Acceptance',
    description: 'Official acceptance of employee resignation',
    prompt: `Create a professional Resignation Acceptance Letter for:

[Employee_Name] - Full name of the employee
[Position] - Current job title
[Department] - Department/team
[Resignation_Date] - Date resignation was submitted
[Last_Working_Day] - Confirmed last working day
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager

[Optional: Exit_Interview] - Exit interview details if scheduled
[Optional: Handover_Requirements] - Specific handover requirements`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Current job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Resignation_Date', description: 'Date resignation was submitted', required: true },
      { name: 'Last_Working_Day', description: 'Confirmed last working day', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Exit_Interview', description: 'Exit interview details', required: false },
      { name: 'Handover_Requirements', description: 'Specific handover requirements', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'acceptance', 'last_day_confirmation', 'exit_process', 'well_wishes', 'signature'],
  },
  {
    id: 'termination_letter',
    categoryId: 'separation',
    name: 'Termination Letter',
    description: 'Official employment termination notice',
    prompt: `Create a professional Termination Letter for:

[Employee_Name] - Full name of the employee
[Position] - Current job title
[Department] - Department/team
[Termination_Date] - Effective date of termination
[Termination_Reason] - Reason for termination
[Final_Settlement_Date] - When final settlement will be processed
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager
[Return_Items] - Company property to be returned

[Optional: Severance] - Severance package details if applicable
[Optional: Benefits_End_Date] - When benefits coverage ends`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Current job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Termination_Date', description: 'Effective date of termination', required: true },
      { name: 'Termination_Reason', description: 'Reason for termination', required: true },
      { name: 'Final_Settlement_Date', description: 'When final settlement will be processed', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Return_Items', description: 'Company property to be returned', required: true },
      { name: 'Severance', description: 'Severance package details', required: false },
      { name: 'Benefits_End_Date', description: 'When benefits coverage ends', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'termination_notice', 'reason', 'final_settlement', 'return_items', 'signature'],
  },
  {
    id: 'experience_letter',
    categoryId: 'separation',
    name: 'Experience Letter',
    description: 'Certificate of employment and experience',
    prompt: `Create a professional Experience Letter for:

[Employee_Name] - Full name of the employee
[Position] - Last held job title
[Department] - Department/team
[Join_Date] - Date of joining
[Last_Working_Day] - Last working day
[Key_Responsibilities] - Main responsibilities held
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager
[Company_Address] - Company address for letterhead

[Optional: Achievements] - Notable achievements during tenure`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Last held job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Join_Date', description: 'Date of joining', required: true },
      { name: 'Last_Working_Day', description: 'Last working day', required: true },
      { name: 'Key_Responsibilities', description: 'Main responsibilities held', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Company_Address', description: 'Company address for letterhead', required: true },
      { name: 'Achievements', description: 'Notable achievements during tenure', required: false },
    ],
    requiredSections: ['date', 'to_whom', 'subject', 'employment_details', 'responsibilities', 'conduct', 'well_wishes', 'signature'],
  },
  {
    id: 'relieving_letter',
    categoryId: 'separation',
    name: 'Relieving Letter',
    description: 'Official release from employment duties',
    prompt: `Create a professional Relieving Letter for:

[Employee_Name] - Full name of the employee
[Position] - Last held job title
[Department] - Department/team
[Join_Date] - Date of joining
[Last_Working_Day] - Last working day
[Resignation_Date] - Date resignation was submitted
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager

[Optional: Clearance_Status] - Status of clearance process`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Last held job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Join_Date', description: 'Date of joining', required: true },
      { name: 'Last_Working_Day', description: 'Last working day', required: true },
      { name: 'Resignation_Date', description: 'Date resignation was submitted', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Clearance_Status', description: 'Status of clearance process', required: false },
    ],
    requiredSections: ['date', 'to_whom', 'subject', 'relieving_statement', 'employment_period', 'clearance', 'well_wishes', 'signature'],
  },
  {
    id: 'full_final_settlement',
    categoryId: 'separation',
    name: 'Full and Final Settlement',
    description: 'Final payment and dues settlement statement',
    prompt: `Create a professional Full and Final Settlement Letter for:

[Employee_Name] - Full name of the employee
[Position] - Last held job title
[Department] - Department/team
[Last_Working_Day] - Last working day
[Salary_Due] - Pending salary amount
[Leave_Encashment] - Leave encashment amount
[Bonus_Due] - Any pending bonus
[Deductions] - Any deductions (advances, loans, etc.)
[Net_Settlement] - Final settlement amount
[Payment_Date] - When payment will be made
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager

[Optional: Gratuity] - Gratuity amount if applicable`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Last held job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Last_Working_Day', description: 'Last working day', required: true },
      { name: 'Salary_Due', description: 'Pending salary amount', required: true },
      { name: 'Leave_Encashment', description: 'Leave encashment amount', required: true },
      { name: 'Bonus_Due', description: 'Any pending bonus', required: true },
      { name: 'Deductions', description: 'Any deductions', required: true },
      { name: 'Net_Settlement', description: 'Final settlement amount', required: true },
      { name: 'Payment_Date', description: 'When payment will be made', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Gratuity', description: 'Gratuity amount if applicable', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'settlement_details', 'earnings', 'deductions', 'net_amount', 'acknowledgment', 'signature'],
  },
  {
    id: 'no_dues_certificate',
    categoryId: 'separation',
    name: 'No Dues Certificate',
    description: 'Clearance certificate confirming no pending dues',
    prompt: `Create a professional No Dues Certificate for:

[Employee_Name] - Full name of the employee
[Position] - Last held job title
[Department] - Department/team
[Employee_ID] - Employee ID
[Join_Date] - Date of joining
[Last_Working_Day] - Last working day
[Company_Name] - Your company name
[HR_Manager_Name] - Name of HR manager
[Clearance_Date] - Date of clearance

[Optional: Departments_Cleared] - List of departments that have cleared`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Last held job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Employee_ID', description: 'Employee ID', required: true },
      { name: 'Join_Date', description: 'Date of joining', required: true },
      { name: 'Last_Working_Day', description: 'Last working day', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'HR_Manager_Name', description: 'Name of HR manager', required: true },
      { name: 'Clearance_Date', description: 'Date of clearance', required: true },
      { name: 'Departments_Cleared', description: 'List of departments that have cleared', required: false },
    ],
    requiredSections: ['date', 'to_whom', 'subject', 'clearance_statement', 'employee_details', 'no_dues_confirmation', 'signature'],
  },

  // -------------------------------------------------------------------------
  // Asset Management Templates (2 templates)
  // -------------------------------------------------------------------------
  {
    id: 'asset_allocation',
    categoryId: 'assets',
    name: 'Asset Allocation Letter',
    description: 'Documentation of company assets assigned to employee',
    prompt: `Create a professional Asset Allocation Letter for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Asset_Type] - Type of asset (laptop, phone, etc.)
[Asset_Description] - Detailed description of asset
[Asset_ID] - Asset tag or serial number
[Allocation_Date] - Date of allocation
[Condition] - Condition of asset at allocation
[Company_Name] - Your company name
[IT_Manager_Name] - Name of IT/Admin manager

[Optional: Accessories] - Any accessories included
[Optional: Return_Policy] - Asset return policy reference`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Asset_Type', description: 'Type of asset', required: true },
      { name: 'Asset_Description', description: 'Detailed description of asset', required: true },
      { name: 'Asset_ID', description: 'Asset tag or serial number', required: true },
      { name: 'Allocation_Date', description: 'Date of allocation', required: true },
      { name: 'Condition', description: 'Condition of asset at allocation', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'IT_Manager_Name', description: 'Name of IT/Admin manager', required: true },
      { name: 'Accessories', description: 'Any accessories included', required: false },
      { name: 'Return_Policy', description: 'Asset return policy reference', required: false },
    ],
    requiredSections: ['date', 'addressee', 'subject', 'asset_details', 'condition', 'responsibilities', 'acknowledgment', 'signature'],
  },
  {
    id: 'asset_handover',
    categoryId: 'assets',
    name: 'Asset Handover Form',
    description: 'Documentation of company assets returned by employee',
    prompt: `Create a professional Asset Handover Form for:

[Employee_Name] - Full name of the employee
[Position] - Job title
[Department] - Department/team
[Asset_Type] - Type of asset being returned
[Asset_Description] - Detailed description of asset
[Asset_ID] - Asset tag or serial number
[Handover_Date] - Date of handover
[Condition_At_Return] - Condition of asset at return
[Original_Allocation_Date] - When asset was originally allocated
[Company_Name] - Your company name
[Receiving_Manager] - Name of person receiving the asset

[Optional: Damage_Notes] - Notes on any damage or issues
[Optional: Accessories_Returned] - List of accessories returned`,
    placeholders: [
      { name: 'Employee_Name', description: 'Full name of the employee', required: true },
      { name: 'Position', description: 'Job title', required: true },
      { name: 'Department', description: 'Department or team', required: true },
      { name: 'Asset_Type', description: 'Type of asset being returned', required: true },
      { name: 'Asset_Description', description: 'Detailed description of asset', required: true },
      { name: 'Asset_ID', description: 'Asset tag or serial number', required: true },
      { name: 'Handover_Date', description: 'Date of handover', required: true },
      { name: 'Condition_At_Return', description: 'Condition of asset at return', required: true },
      { name: 'Original_Allocation_Date', description: 'When asset was originally allocated', required: true },
      { name: 'Company_Name', description: 'Your company name', required: true },
      { name: 'Receiving_Manager', description: 'Name of person receiving the asset', required: true },
      { name: 'Damage_Notes', description: 'Notes on any damage or issues', required: false },
      { name: 'Accessories_Returned', description: 'List of accessories returned', required: false },
    ],
    requiredSections: ['date', 'employee_details', 'asset_details', 'condition_assessment', 'handover_confirmation', 'signatures'],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all templates for a specific category
 */
export function getTemplatesByCategory(categoryId: string): HRTemplate[] {
  return HR_TEMPLATES.filter(template => template.categoryId === categoryId);
}

/**
 * Get a template by its ID
 */
export function getTemplateById(templateId: string): HRTemplate | undefined {
  return HR_TEMPLATES.find(template => template.id === templateId);
}

/**
 * Get a category by its ID
 */
export function getCategoryById(categoryId: string): DocumentCategory | undefined {
  return DOCUMENT_CATEGORIES.find(category => category.id === categoryId);
}
