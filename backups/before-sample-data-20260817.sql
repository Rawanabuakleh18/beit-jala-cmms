--
-- PostgreSQL database dump
--

\restrict fqpOngo6UHITdAEDAJGqIGlcsDbHARb46w7n32B2jcPIAprep9Hh8rDXvnififq

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_permission_id_permissions_id_fk;
ALTER TABLE IF EXISTS ONLY public.spare_part_movements DROP CONSTRAINT IF EXISTS spare_part_movements_spare_part_id_spare_parts_id_fk;
ALTER TABLE IF EXISTS ONLY public.spare_part_movements DROP CONSTRAINT IF EXISTS spare_part_movements_recorded_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_eligible_signer_assignment_id_eligible_signer_assign;
ALTER TABLE IF EXISTS ONLY public.signature_field_permissions DROP CONSTRAINT IF EXISTS signature_field_permissions_granted_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.signature_field_permissions DROP CONSTRAINT IF EXISTS signature_field_permissions_eligible_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_records DROP CONSTRAINT IF EXISTS pm_records_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_record_checklist_points DROP CONSTRAINT IF EXISTS pm_record_checklist_points_source_checklist_point_id_pm_checkli;
ALTER TABLE IF EXISTS ONLY public.pm_record_checklist_points DROP CONSTRAINT IF EXISTS pm_record_checklist_points_record_id_pm_records_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_inspections DROP CONSTRAINT IF EXISTS pm_inspections_record_id_pm_records_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_inspections DROP CONSTRAINT IF EXISTS pm_inspections_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_inspections DROP CONSTRAINT IF EXISTS pm_inspections_completed_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_inspection_results DROP CONSTRAINT IF EXISTS pm_inspection_results_inspection_id_pm_inspections_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_inspection_results DROP CONSTRAINT IF EXISTS pm_inspection_results_checklist_point_id_pm_checklist_points_id;
ALTER TABLE IF EXISTS ONLY public.pm_headers DROP CONSTRAINT IF EXISTS pm_headers_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.pm_checklist_points DROP CONSTRAINT IF EXISTS pm_checklist_points_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_role_id_roles_id_fk;
ALTER TABLE IF EXISTS ONLY public.monthly_pm_plan_rows DROP CONSTRAINT IF EXISTS monthly_pm_plan_rows_plan_id_monthly_pm_plans_id_fk;
ALTER TABLE IF EXISTS ONLY public.monthly_pm_plan_rows DROP CONSTRAINT IF EXISTS monthly_pm_plan_rows_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.monthly_pm_plan_rows DROP CONSTRAINT IF EXISTS monthly_pm_plan_rows_annual_plan_row_id_annual_pm_plan_rows_id_;
ALTER TABLE IF EXISTS ONLY public.monthly_maintenance_evaluation_reports DROP CONSTRAINT IF EXISTS monthly_maintenance_evaluation_reports_created_by_user_id_users;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_requested_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_qa_reviewed_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_engineering_reviewed_by_user_id_users_id_f;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_assigned_technician_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_archived_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.maintenance_request_status_history DROP CONSTRAINT IF EXISTS maintenance_request_status_history_request_id_maintenance_reque;
ALTER TABLE IF EXISTS ONLY public.maintenance_request_status_history DROP CONSTRAINT IF EXISTS maintenance_request_status_history_changed_by_user_id_users_id_;
ALTER TABLE IF EXISTS ONLY public.machines DROP CONSTRAINT IF EXISTS machines_department_id_departments_id_fk;
ALTER TABLE IF EXISTS ONLY public.external_maintenance_requests DROP CONSTRAINT IF EXISTS external_maintenance_requests_maintenance_request_id_maintenanc;
ALTER TABLE IF EXISTS ONLY public.external_maintenance_receipts DROP CONSTRAINT IF EXISTS external_maintenance_receipts_external_maintenance_request_id_e;
ALTER TABLE IF EXISTS ONLY public.equipment_information_records DROP CONSTRAINT IF EXISTS equipment_information_records_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.eligible_signer_assignments DROP CONSTRAINT IF EXISTS eligible_signer_assignments_granted_by_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.eligible_signer_assignments DROP CONSTRAINT IF EXISTS eligible_signer_assignments_eligible_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_staff DROP CONSTRAINT IF EXISTS corrective_maintenance_staff_cm_event_id_corrective_maintenance;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_records DROP CONSTRAINT IF EXISTS corrective_maintenance_records_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_handover DROP CONSTRAINT IF EXISTS corrective_maintenance_handover_cm_event_id_corrective_maintena;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_events DROP CONSTRAINT IF EXISTS corrective_maintenance_events_request_id_maintenance_requests_i;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_events DROP CONSTRAINT IF EXISTS corrective_maintenance_events_record_id_corrective_maintenance_;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_events DROP CONSTRAINT IF EXISTS corrective_maintenance_events_machine_id_machines_id_fk;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_events DROP CONSTRAINT IF EXISTS corrective_maintenance_events_completed_by_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.closed_corrective_maintenance_manual_entries DROP CONSTRAINT IF EXISTS closed_corrective_maintenance_manual_entries_deleted_by_user_id;
ALTER TABLE IF EXISTS ONLY public.closed_corrective_maintenance_manual_entries DROP CONSTRAINT IF EXISTS closed_corrective_maintenance_manual_entries_created_by_user_id;
ALTER TABLE IF EXISTS ONLY public.closed_corrective_maintenance_log_exclusions DROP CONSTRAINT IF EXISTS closed_corrective_maintenance_log_exclusions_maintenance_reques;
ALTER TABLE IF EXISTS ONLY public.closed_corrective_maintenance_log_exclusions DROP CONSTRAINT IF EXISTS closed_corrective_maintenance_log_exclusions_excluded_by_user_i;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_users_id_fk;
ALTER TABLE IF EXISTS ONLY public.annual_pm_plan_rows DROP CONSTRAINT IF EXISTS annual_pm_plan_rows_plan_id_annual_pm_plans_id_fk;
ALTER TABLE IF EXISTS ONLY public.annual_pm_plan_rows DROP CONSTRAINT IF EXISTS annual_pm_plan_rows_machine_id_machines_id_fk;
DROP INDEX IF EXISTS public.spare_parts_part_code_idx;
DROP INDEX IF EXISTS public.pm_record_checklist_point_source_idx;
DROP INDEX IF EXISTS public.monthly_pm_plans_year_month_idx;
DROP INDEX IF EXISTS public.monthly_maintenance_evaluation_year_month_idx;
DROP INDEX IF EXISTS public.cm_events_request_number_idx;
DROP INDEX IF EXISTS public.cm_events_record_row_idx;
DROP INDEX IF EXISTS public."IDX_session_expire";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_permissions DROP CONSTRAINT IF EXISTS user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.spare_parts DROP CONSTRAINT IF EXISTS spare_parts_pkey;
ALTER TABLE IF EXISTS ONLY public.spare_part_movements DROP CONSTRAINT IF EXISTS spare_part_movements_pkey;
ALTER TABLE IF EXISTS ONLY public.signatures DROP CONSTRAINT IF EXISTS signatures_pkey;
ALTER TABLE IF EXISTS ONLY public.signature_field_permissions DROP CONSTRAINT IF EXISTS signature_field_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_name_unique;
ALTER TABLE IF EXISTS ONLY public.pm_records DROP CONSTRAINT IF EXISTS pm_records_pkey;
ALTER TABLE IF EXISTS ONLY public.pm_record_checklist_points DROP CONSTRAINT IF EXISTS pm_record_checklist_points_pkey;
ALTER TABLE IF EXISTS ONLY public.pm_inspections DROP CONSTRAINT IF EXISTS pm_inspections_pkey;
ALTER TABLE IF EXISTS ONLY public.pm_inspection_results DROP CONSTRAINT IF EXISTS pm_inspection_results_pkey;
ALTER TABLE IF EXISTS ONLY public.pm_headers DROP CONSTRAINT IF EXISTS pm_headers_pkey;
ALTER TABLE IF EXISTS ONLY public.pm_headers DROP CONSTRAINT IF EXISTS pm_headers_machine_id_unique;
ALTER TABLE IF EXISTS ONLY public.pm_checklist_points DROP CONSTRAINT IF EXISTS pm_checklist_points_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.permissions DROP CONSTRAINT IF EXISTS permissions_name_unique;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.monthly_pm_plans DROP CONSTRAINT IF EXISTS monthly_pm_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.monthly_pm_plan_rows DROP CONSTRAINT IF EXISTS monthly_pm_plan_rows_pkey;
ALTER TABLE IF EXISTS ONLY public.monthly_maintenance_evaluation_reports DROP CONSTRAINT IF EXISTS monthly_maintenance_evaluation_reports_pkey;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_request_report_number_unique;
ALTER TABLE IF EXISTS ONLY public.maintenance_requests DROP CONSTRAINT IF EXISTS maintenance_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.maintenance_request_status_history DROP CONSTRAINT IF EXISTS maintenance_request_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.machines DROP CONSTRAINT IF EXISTS machines_pkey;
ALTER TABLE IF EXISTS ONLY public.machines DROP CONSTRAINT IF EXISTS machines_machine_number_unique;
ALTER TABLE IF EXISTS ONLY public.form_headers DROP CONSTRAINT IF EXISTS form_headers_pkey;
ALTER TABLE IF EXISTS ONLY public.external_maintenance_requests DROP CONSTRAINT IF EXISTS external_maintenance_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.external_maintenance_requests DROP CONSTRAINT IF EXISTS external_maintenance_requests_maintenance_request_id_unique;
ALTER TABLE IF EXISTS ONLY public.external_maintenance_requests DROP CONSTRAINT IF EXISTS external_maintenance_requests_external_request_number_unique;
ALTER TABLE IF EXISTS ONLY public.external_maintenance_receipts DROP CONSTRAINT IF EXISTS external_maintenance_receipts_pkey;
ALTER TABLE IF EXISTS ONLY public.equipment_information_records DROP CONSTRAINT IF EXISTS equipment_information_records_pkey;
ALTER TABLE IF EXISTS ONLY public.equipment_information_records DROP CONSTRAINT IF EXISTS equipment_information_records_machine_id_unique;
ALTER TABLE IF EXISTS ONLY public.eligible_signer_assignments DROP CONSTRAINT IF EXISTS eligible_signer_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_unique;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_staff DROP CONSTRAINT IF EXISTS corrective_maintenance_staff_pkey;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_records DROP CONSTRAINT IF EXISTS corrective_maintenance_records_pkey;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_handover DROP CONSTRAINT IF EXISTS corrective_maintenance_handover_pkey;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_events DROP CONSTRAINT IF EXISTS corrective_maintenance_events_request_id_unique;
ALTER TABLE IF EXISTS ONLY public.corrective_maintenance_events DROP CONSTRAINT IF EXISTS corrective_maintenance_events_pkey;
ALTER TABLE IF EXISTS ONLY public.closed_corrective_maintenance_manual_entries DROP CONSTRAINT IF EXISTS closed_corrective_maintenance_manual_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.closed_corrective_maintenance_log_exclusions DROP CONSTRAINT IF EXISTS closed_corrective_maintenance_log_exclusions_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.annual_pm_plans DROP CONSTRAINT IF EXISTS annual_pm_plans_year_unique;
ALTER TABLE IF EXISTS ONLY public.annual_pm_plans DROP CONSTRAINT IF EXISTS annual_pm_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.annual_pm_plan_rows DROP CONSTRAINT IF EXISTS annual_pm_plan_rows_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.spare_parts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.spare_part_movements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.signatures ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.signature_field_permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pm_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pm_record_checklist_points ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pm_inspections ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pm_inspection_results ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pm_headers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pm_checklist_points ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.monthly_pm_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.monthly_pm_plan_rows ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.monthly_maintenance_evaluation_reports ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.maintenance_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.maintenance_request_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.machines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.form_headers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.external_maintenance_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.external_maintenance_receipts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.equipment_information_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.eligible_signer_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.corrective_maintenance_staff ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.corrective_maintenance_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.corrective_maintenance_handover ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.corrective_maintenance_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.closed_corrective_maintenance_manual_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.closed_corrective_maintenance_log_exclusions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.annual_pm_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.annual_pm_plan_rows ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.user_permissions_id_seq;
DROP TABLE IF EXISTS public.user_permissions;
DROP SEQUENCE IF EXISTS public.spare_parts_id_seq;
DROP TABLE IF EXISTS public.spare_parts;
DROP SEQUENCE IF EXISTS public.spare_part_movements_id_seq;
DROP TABLE IF EXISTS public.spare_part_movements;
DROP SEQUENCE IF EXISTS public.signatures_id_seq;
DROP TABLE IF EXISTS public.signatures;
DROP SEQUENCE IF EXISTS public.signature_field_permissions_id_seq;
DROP TABLE IF EXISTS public.signature_field_permissions;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP SEQUENCE IF EXISTS public.pm_records_id_seq;
DROP TABLE IF EXISTS public.pm_records;
DROP SEQUENCE IF EXISTS public.pm_record_checklist_points_id_seq;
DROP TABLE IF EXISTS public.pm_record_checklist_points;
DROP SEQUENCE IF EXISTS public.pm_inspections_id_seq;
DROP TABLE IF EXISTS public.pm_inspections;
DROP SEQUENCE IF EXISTS public.pm_inspection_results_id_seq;
DROP TABLE IF EXISTS public.pm_inspection_results;
DROP SEQUENCE IF EXISTS public.pm_headers_id_seq;
DROP TABLE IF EXISTS public.pm_headers;
DROP SEQUENCE IF EXISTS public.pm_checklist_points_id_seq;
DROP TABLE IF EXISTS public.pm_checklist_points;
DROP SEQUENCE IF EXISTS public.permissions_id_seq;
DROP TABLE IF EXISTS public.permissions;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.monthly_pm_plans_id_seq;
DROP TABLE IF EXISTS public.monthly_pm_plans;
DROP SEQUENCE IF EXISTS public.monthly_pm_plan_rows_id_seq;
DROP TABLE IF EXISTS public.monthly_pm_plan_rows;
DROP SEQUENCE IF EXISTS public.monthly_maintenance_evaluation_reports_id_seq;
DROP TABLE IF EXISTS public.monthly_maintenance_evaluation_reports;
DROP SEQUENCE IF EXISTS public.maintenance_requests_id_seq;
DROP TABLE IF EXISTS public.maintenance_requests;
DROP SEQUENCE IF EXISTS public.maintenance_request_status_history_id_seq;
DROP TABLE IF EXISTS public.maintenance_request_status_history;
DROP SEQUENCE IF EXISTS public.machines_id_seq;
DROP TABLE IF EXISTS public.machines;
DROP SEQUENCE IF EXISTS public.form_headers_id_seq;
DROP TABLE IF EXISTS public.form_headers;
DROP SEQUENCE IF EXISTS public.external_maintenance_requests_id_seq;
DROP TABLE IF EXISTS public.external_maintenance_requests;
DROP SEQUENCE IF EXISTS public.external_maintenance_receipts_id_seq;
DROP TABLE IF EXISTS public.external_maintenance_receipts;
DROP SEQUENCE IF EXISTS public.equipment_information_records_id_seq;
DROP TABLE IF EXISTS public.equipment_information_records;
DROP SEQUENCE IF EXISTS public.eligible_signer_assignments_id_seq;
DROP TABLE IF EXISTS public.eligible_signer_assignments;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.corrective_maintenance_staff_id_seq;
DROP TABLE IF EXISTS public.corrective_maintenance_staff;
DROP SEQUENCE IF EXISTS public.corrective_maintenance_records_id_seq;
DROP TABLE IF EXISTS public.corrective_maintenance_records;
DROP SEQUENCE IF EXISTS public.corrective_maintenance_handover_id_seq;
DROP TABLE IF EXISTS public.corrective_maintenance_handover;
DROP SEQUENCE IF EXISTS public.corrective_maintenance_events_id_seq;
DROP TABLE IF EXISTS public.corrective_maintenance_events;
DROP SEQUENCE IF EXISTS public.closed_corrective_maintenance_manual_entries_id_seq;
DROP TABLE IF EXISTS public.closed_corrective_maintenance_manual_entries;
DROP SEQUENCE IF EXISTS public.closed_corrective_maintenance_log_exclusions_id_seq;
DROP TABLE IF EXISTS public.closed_corrective_maintenance_log_exclusions;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.annual_pm_plans_id_seq;
DROP TABLE IF EXISTS public.annual_pm_plans;
DROP SEQUENCE IF EXISTS public.annual_pm_plan_rows_id_seq;
DROP TABLE IF EXISTS public.annual_pm_plan_rows;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: annual_pm_plan_rows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annual_pm_plan_rows (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    machine_id integer NOT NULL,
    department text,
    machine_name text NOT NULL,
    machine_location text,
    machine_code text,
    frequency_months integer,
    duration text,
    start_date text,
    finish_date text,
    scheduled_months text DEFAULT '[]'::text NOT NULL,
    is_override boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.annual_pm_plan_rows OWNER TO postgres;

--
-- Name: annual_pm_plan_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.annual_pm_plan_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.annual_pm_plan_rows_id_seq OWNER TO postgres;

--
-- Name: annual_pm_plan_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.annual_pm_plan_rows_id_seq OWNED BY public.annual_pm_plan_rows.id;


--
-- Name: annual_pm_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.annual_pm_plans (
    id integer NOT NULL,
    year integer NOT NULL,
    prepared_by_name text,
    prepared_by_date text,
    approved_engineering_name text,
    approved_engineering_date text,
    approved_production_name text,
    approved_production_date text,
    approved_qc_name text,
    approved_qc_date text,
    approved_rd_name text,
    approved_rd_date text,
    approved_qa_name text,
    approved_qa_date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.annual_pm_plans OWNER TO postgres;

--
-- Name: annual_pm_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.annual_pm_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.annual_pm_plans_id_seq OWNER TO postgres;

--
-- Name: annual_pm_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.annual_pm_plans_id_seq OWNED BY public.annual_pm_plans.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    entity_type text,
    entity_id integer,
    details jsonb,
    old_value jsonb,
    new_value jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: closed_corrective_maintenance_log_exclusions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.closed_corrective_maintenance_log_exclusions (
    id integer NOT NULL,
    maintenance_request_id integer CONSTRAINT closed_corrective_maintenance_l_maintenance_request_id_not_null NOT NULL,
    excluded_at timestamp without time zone DEFAULT now() CONSTRAINT closed_corrective_maintenance_log_exclusio_excluded_at_not_null NOT NULL,
    excluded_by_user_id integer
);


ALTER TABLE public.closed_corrective_maintenance_log_exclusions OWNER TO postgres;

--
-- Name: closed_corrective_maintenance_log_exclusions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.closed_corrective_maintenance_log_exclusions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.closed_corrective_maintenance_log_exclusions_id_seq OWNER TO postgres;

--
-- Name: closed_corrective_maintenance_log_exclusions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.closed_corrective_maintenance_log_exclusions_id_seq OWNED BY public.closed_corrective_maintenance_log_exclusions.id;


--
-- Name: closed_corrective_maintenance_manual_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.closed_corrective_maintenance_manual_entries (
    id integer NOT NULL,
    machine_name text CONSTRAINT closed_corrective_maintenance_manual_entr_machine_name_not_null NOT NULL,
    machine_number text CONSTRAINT closed_corrective_maintenance_manual_en_machine_number_not_null NOT NULL,
    request_date text CONSTRAINT closed_corrective_maintenance_manual_entr_request_date_not_null NOT NULL,
    request_report_number text CONSTRAINT closed_corrective_maintenance_ma_request_report_number_not_null NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    closed_date text CONSTRAINT closed_corrective_maintenance_manual_entri_closed_date_not_null NOT NULL,
    remarks text,
    created_by_user_id integer,
    deleted_at timestamp without time zone,
    deleted_by_user_id integer,
    created_at timestamp without time zone DEFAULT now() CONSTRAINT closed_corrective_maintenance_manual_entrie_created_at_not_null NOT NULL,
    updated_at timestamp without time zone DEFAULT now() CONSTRAINT closed_corrective_maintenance_manual_entrie_updated_at_not_null NOT NULL
);


ALTER TABLE public.closed_corrective_maintenance_manual_entries OWNER TO postgres;

--
-- Name: closed_corrective_maintenance_manual_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.closed_corrective_maintenance_manual_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.closed_corrective_maintenance_manual_entries_id_seq OWNER TO postgres;

--
-- Name: closed_corrective_maintenance_manual_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.closed_corrective_maintenance_manual_entries_id_seq OWNED BY public.closed_corrective_maintenance_manual_entries.id;


--
-- Name: corrective_maintenance_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corrective_maintenance_events (
    id integer NOT NULL,
    record_id integer NOT NULL,
    request_id integer,
    machine_id integer NOT NULL,
    request_report_number text,
    row_number integer NOT NULL,
    preliminary_check_results text,
    expected_work_time_from text,
    expected_work_time_to text,
    technician_name text,
    maintenance_technician_signature text,
    concerned_section_supervisor_signature text,
    actions_taken text,
    remarks_recommendations text,
    performing_staff text DEFAULT '[]'::text NOT NULL,
    receiver_name text,
    receiver_signature text,
    handover_date text,
    engineering_signature text,
    completed_by_user_id integer,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    repair_time_slots text DEFAULT '[]'::text NOT NULL,
    request_date text,
    maintenance_type text,
    spare_parts_used text,
    engineering_date text
);


ALTER TABLE public.corrective_maintenance_events OWNER TO postgres;

--
-- Name: corrective_maintenance_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corrective_maintenance_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corrective_maintenance_events_id_seq OWNER TO postgres;

--
-- Name: corrective_maintenance_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corrective_maintenance_events_id_seq OWNED BY public.corrective_maintenance_events.id;


--
-- Name: corrective_maintenance_handover; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corrective_maintenance_handover (
    id integer NOT NULL,
    cm_event_id integer NOT NULL,
    receiver_name text,
    handover_date text,
    engineering_final_confirmation text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.corrective_maintenance_handover OWNER TO postgres;

--
-- Name: corrective_maintenance_handover_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corrective_maintenance_handover_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corrective_maintenance_handover_id_seq OWNER TO postgres;

--
-- Name: corrective_maintenance_handover_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corrective_maintenance_handover_id_seq OWNED BY public.corrective_maintenance_handover.id;


--
-- Name: corrective_maintenance_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corrective_maintenance_records (
    id integer NOT NULL,
    machine_id integer NOT NULL,
    sequence_number integer NOT NULL,
    document_number text DEFAULT 'LOG-00-0102-3'::text NOT NULL,
    execution_date text,
    page_count text DEFAULT 'Page 1 of 1'::text NOT NULL,
    machine_name text NOT NULL,
    machine_number text NOT NULL,
    machine_location text,
    startup_date text,
    max_rows integer DEFAULT 3 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    previous_record_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.corrective_maintenance_records OWNER TO postgres;

--
-- Name: corrective_maintenance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corrective_maintenance_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corrective_maintenance_records_id_seq OWNER TO postgres;

--
-- Name: corrective_maintenance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corrective_maintenance_records_id_seq OWNED BY public.corrective_maintenance_records.id;


--
-- Name: corrective_maintenance_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.corrective_maintenance_staff (
    id integer NOT NULL,
    cm_event_id integer NOT NULL,
    staff_order integer NOT NULL,
    staff_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.corrective_maintenance_staff OWNER TO postgres;

--
-- Name: corrective_maintenance_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.corrective_maintenance_staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.corrective_maintenance_staff_id_seq OWNER TO postgres;

--
-- Name: corrective_maintenance_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.corrective_maintenance_staff_id_seq OWNED BY public.corrective_maintenance_staff.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: eligible_signer_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.eligible_signer_assignments (
    id integer NOT NULL,
    document_type text NOT NULL,
    document_id integer NOT NULL,
    field_name text NOT NULL,
    eligible_user_id integer NOT NULL,
    granted_by integer,
    granted_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone
);


ALTER TABLE public.eligible_signer_assignments OWNER TO postgres;

--
-- Name: eligible_signer_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.eligible_signer_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.eligible_signer_assignments_id_seq OWNER TO postgres;

--
-- Name: eligible_signer_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.eligible_signer_assignments_id_seq OWNED BY public.eligible_signer_assignments.id;


--
-- Name: equipment_information_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipment_information_records (
    id integer NOT NULL,
    machine_id integer NOT NULL,
    name_of_equipment text,
    model_number text,
    serial_number text,
    identification_number text,
    date_purchased text,
    purchased_from_name text,
    purchased_from_address text,
    manufacturing_company_name text,
    manufacturing_company_address text,
    dimension_width_cm numeric(10,2),
    dimension_height_cm numeric(10,2),
    dimension_depth_cm numeric(10,2),
    weight_kg numeric(10,2),
    utilities_power_supply text,
    utilities_air text,
    utilities_water text,
    utilities_other text,
    others text,
    safety_issues text,
    prepared_by_name text,
    prepared_by_date text,
    approved_by_name text,
    approved_by_date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    others_details text,
    safety_issues_details text,
    dimensions_note text
);


ALTER TABLE public.equipment_information_records OWNER TO postgres;

--
-- Name: equipment_information_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipment_information_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.equipment_information_records_id_seq OWNER TO postgres;

--
-- Name: equipment_information_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipment_information_records_id_seq OWNED BY public.equipment_information_records.id;


--
-- Name: external_maintenance_receipts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_receipts (
    id integer NOT NULL,
    external_maintenance_request_id integer CONSTRAINT external_maintenance_receip_external_maintenance_reque_not_null NOT NULL,
    maintenance_type text DEFAULT 'صيانة خارجية'::text NOT NULL,
    requesting_department text,
    receipt_date text,
    performing_entity text,
    work_acceptance_report text,
    work_failure_cause text,
    examiner_name text,
    examiner_signature text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.external_maintenance_receipts OWNER TO postgres;

--
-- Name: external_maintenance_receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_maintenance_receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_maintenance_receipts_id_seq OWNER TO postgres;

--
-- Name: external_maintenance_receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_maintenance_receipts_id_seq OWNED BY public.external_maintenance_receipts.id;


--
-- Name: external_maintenance_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_maintenance_requests (
    id integer NOT NULL,
    maintenance_request_id integer NOT NULL,
    external_request_number text NOT NULL,
    request_date text NOT NULL,
    department_section text,
    required_maintenance text,
    preliminary_findings text,
    technician_suggestions text,
    maintenance_technician_signature text,
    maintenance_technician_date text,
    department_manager_signature text,
    department_manager_date text,
    general_manager_signature text,
    general_manager_date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.external_maintenance_requests OWNER TO postgres;

--
-- Name: external_maintenance_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.external_maintenance_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_maintenance_requests_id_seq OWNER TO postgres;

--
-- Name: external_maintenance_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.external_maintenance_requests_id_seq OWNED BY public.external_maintenance_requests.id;


--
-- Name: form_headers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.form_headers (
    id integer NOT NULL,
    document_type text NOT NULL,
    document_id integer NOT NULL,
    company_name text DEFAULT 'Beit Jala Pharmaceutical Co.'::text NOT NULL,
    document_name text NOT NULL,
    document_number text NOT NULL,
    effective_or_execution_date text,
    page_number integer DEFAULT 1 NOT NULL,
    total_pages integer DEFAULT 1 NOT NULL,
    machine_name text,
    machine_number text,
    machine_location text,
    startup_date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.form_headers OWNER TO postgres;

--
-- Name: form_headers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.form_headers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.form_headers_id_seq OWNER TO postgres;

--
-- Name: form_headers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.form_headers_id_seq OWNED BY public.form_headers.id;


--
-- Name: machines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.machines (
    id integer NOT NULL,
    machine_number text NOT NULL,
    machine_name text NOT NULL,
    department_id integer,
    location text,
    status text DEFAULT 'active'::text NOT NULL,
    pm_frequency_months integer,
    pm_start_date text,
    deleted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.machines OWNER TO postgres;

--
-- Name: machines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.machines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.machines_id_seq OWNER TO postgres;

--
-- Name: machines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.machines_id_seq OWNED BY public.machines.id;


--
-- Name: maintenance_request_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_request_status_history (
    id integer NOT NULL,
    request_id integer NOT NULL,
    from_status text,
    to_status text NOT NULL,
    changed_by_user_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.maintenance_request_status_history OWNER TO postgres;

--
-- Name: maintenance_request_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_request_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_request_status_history_id_seq OWNER TO postgres;

--
-- Name: maintenance_request_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_request_status_history_id_seq OWNED BY public.maintenance_request_status_history.id;


--
-- Name: maintenance_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_requests (
    id integer NOT NULL,
    request_report_number text NOT NULL,
    machine_id integer NOT NULL,
    requested_by_user_id integer NOT NULL,
    department_id integer,
    department_section text,
    priority text DEFAULT 'normal'::text NOT NULL,
    machine_name text NOT NULL,
    machine_number text NOT NULL,
    request_date text NOT NULL,
    failure_description text NOT NULL,
    reporting_person_name text,
    reporting_person_signature text,
    department_supervisor_name text,
    department_supervisor_signature text,
    qa_decision text,
    qa_supervisor_signature text,
    qa_review_date text,
    status text DEFAULT 'Pending QA Approval'::text NOT NULL,
    qa_reviewed_by_user_id integer,
    qa_reviewed_at timestamp without time zone,
    qa_review_notes text,
    engineering_decision text,
    assigned_technician_user_id integer,
    engineering_supervisor_signature text,
    engineering_reviewed_by_user_id integer,
    engineering_reviewed_at timestamp without time zone,
    engineering_review_notes text,
    expected_work_time_from text,
    expected_work_time_to text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    closed_at timestamp without time zone,
    archived_at timestamp without time zone,
    archived_by_user_id integer
);


ALTER TABLE public.maintenance_requests OWNER TO postgres;

--
-- Name: maintenance_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenance_requests_id_seq OWNER TO postgres;

--
-- Name: maintenance_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_requests_id_seq OWNED BY public.maintenance_requests.id;


--
-- Name: monthly_maintenance_evaluation_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monthly_maintenance_evaluation_reports (
    id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    delayed_activities text,
    delay_reason text,
    follow_up_included text,
    total_pm_activities integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluation_rep_total_pm_activities_not_null NOT NULL,
    completed_pm_on_time integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluation_re_completed_pm_on_time_not_null NOT NULL,
    production_impact text,
    spare_part_shortage text,
    external_maintenance_details text,
    total_external_activities integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluati_total_external_activities_not_null NOT NULL,
    completed_external_activities integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluat_completed_external_activit_not_null NOT NULL,
    employee_delay_impact text,
    working_days integer DEFAULT 0 NOT NULL,
    lost_work_days integer DEFAULT 0 NOT NULL,
    prepared_by text,
    engineering_manager_signature text,
    created_by_user_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    corrective_maintenance_details text,
    total_corrective_requests integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluati_total_corrective_requests_not_null NOT NULL,
    unclosed_corrective_requests integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluat_unclosed_corrective_reques_not_null NOT NULL,
    completed_corrective_requests integer DEFAULT 0 CONSTRAINT monthly_maintenance_evaluat_completed_corrective_reque_not_null NOT NULL,
    prepared_date text,
    engineering_manager_date text,
    manual_corrective_adjustments text DEFAULT '[]'::text CONSTRAINT monthly_maintenance_evaluat_manual_corrective_adjustme_not_null NOT NULL,
    manual_preventive_adjustments text DEFAULT '[]'::text CONSTRAINT monthly_maintenance_evaluat_manual_preventive_adjustme_not_null NOT NULL,
    total_corrective_requests_is_override boolean DEFAULT false CONSTRAINT monthly_maintenance_evaluat_total_corrective_requests__not_null NOT NULL,
    unclosed_corrective_requests_is_override boolean DEFAULT false CONSTRAINT monthly_maintenance_evalua_unclosed_corrective_reques_not_null1 NOT NULL,
    completed_corrective_requests_is_override boolean DEFAULT false CONSTRAINT monthly_maintenance_evalua_completed_corrective_reque_not_null1 NOT NULL,
    total_external_activities_is_override boolean DEFAULT false CONSTRAINT monthly_maintenance_evaluat_total_external_activities__not_null NOT NULL,
    total_pm_activities_is_override boolean DEFAULT false CONSTRAINT monthly_maintenance_evaluat_total_pm_activities_is_ove_not_null NOT NULL,
    completed_pm_on_time_is_override boolean DEFAULT false CONSTRAINT monthly_maintenance_evaluat_completed_pm_on_time_is_ov_not_null NOT NULL
);


ALTER TABLE public.monthly_maintenance_evaluation_reports OWNER TO postgres;

--
-- Name: monthly_maintenance_evaluation_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monthly_maintenance_evaluation_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monthly_maintenance_evaluation_reports_id_seq OWNER TO postgres;

--
-- Name: monthly_maintenance_evaluation_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monthly_maintenance_evaluation_reports_id_seq OWNED BY public.monthly_maintenance_evaluation_reports.id;


--
-- Name: monthly_pm_plan_rows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monthly_pm_plan_rows (
    id integer NOT NULL,
    plan_id integer NOT NULL,
    annual_plan_row_id integer,
    machine_id integer NOT NULL,
    row_number integer NOT NULL,
    department_name text,
    section_name text,
    machine_name text NOT NULL,
    identification_number text,
    planned_date_from text,
    planned_date_to text,
    actual_date text,
    amendments text,
    status text DEFAULT 'due'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    actual_date_is_override boolean DEFAULT false NOT NULL,
    is_manually_removed boolean DEFAULT false NOT NULL,
    planned_date_is_override boolean DEFAULT false NOT NULL
);


ALTER TABLE public.monthly_pm_plan_rows OWNER TO postgres;

--
-- Name: monthly_pm_plan_rows_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monthly_pm_plan_rows_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monthly_pm_plan_rows_id_seq OWNER TO postgres;

--
-- Name: monthly_pm_plan_rows_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monthly_pm_plan_rows_id_seq OWNED BY public.monthly_pm_plan_rows.id;


--
-- Name: monthly_pm_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monthly_pm_plans (
    id integer NOT NULL,
    year integer NOT NULL,
    month integer NOT NULL,
    prepared_by_name text,
    prepared_by_date text,
    maintenance_supervisor_name text,
    maintenance_supervisor_date text,
    department_manager_name text,
    department_manager_date text,
    approved_by_name text,
    approved_by_date text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.monthly_pm_plans OWNER TO postgres;

--
-- Name: monthly_pm_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.monthly_pm_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.monthly_pm_plans_id_seq OWNER TO postgres;

--
-- Name: monthly_pm_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.monthly_pm_plans_id_seq OWNED BY public.monthly_pm_plans.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    role_id integer,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    related_type text,
    related_id integer,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: pm_checklist_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_checklist_points (
    id integer NOT NULL,
    machine_id integer NOT NULL,
    point_text text NOT NULL,
    result_type text DEFAULT 'yes_no'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    deactivated_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pm_checklist_points OWNER TO postgres;

--
-- Name: pm_checklist_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_checklist_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_checklist_points_id_seq OWNER TO postgres;

--
-- Name: pm_checklist_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_checklist_points_id_seq OWNED BY public.pm_checklist_points.id;


--
-- Name: pm_headers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_headers (
    id integer NOT NULL,
    machine_id integer NOT NULL,
    procedure_form_number text DEFAULT 'LOG-00-0102'::text NOT NULL,
    effective_date text,
    department text,
    columns_per_record integer DEFAULT 5 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inspection_columns_per_print_page integer DEFAULT 2 NOT NULL
);


ALTER TABLE public.pm_headers OWNER TO postgres;

--
-- Name: pm_headers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_headers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_headers_id_seq OWNER TO postgres;

--
-- Name: pm_headers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_headers_id_seq OWNED BY public.pm_headers.id;


--
-- Name: pm_inspection_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_inspection_results (
    id integer NOT NULL,
    inspection_id integer NOT NULL,
    checklist_point_id integer NOT NULL,
    value text
);


ALTER TABLE public.pm_inspection_results OWNER TO postgres;

--
-- Name: pm_inspection_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_inspection_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_inspection_results_id_seq OWNER TO postgres;

--
-- Name: pm_inspection_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_inspection_results_id_seq OWNED BY public.pm_inspection_results.id;


--
-- Name: pm_inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_inspections (
    id integer NOT NULL,
    record_id integer NOT NULL,
    machine_id integer NOT NULL,
    column_number integer NOT NULL,
    inspection_date text NOT NULL,
    inspection_time text NOT NULL,
    action_taken text,
    examiner_name text,
    examiner_signature text,
    machine_receiver_name text,
    machine_receiver_signature text,
    completed_by_user_id integer,
    completed_at timestamp without time zone DEFAULT now() NOT NULL,
    execution_month_year text
);


ALTER TABLE public.pm_inspections OWNER TO postgres;

--
-- Name: pm_inspections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_inspections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_inspections_id_seq OWNER TO postgres;

--
-- Name: pm_inspections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_inspections_id_seq OWNED BY public.pm_inspections.id;


--
-- Name: pm_record_checklist_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_record_checklist_points (
    id integer NOT NULL,
    record_id integer NOT NULL,
    source_checklist_point_id integer NOT NULL,
    point_text text NOT NULL,
    result_type text NOT NULL,
    sort_order integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pm_record_checklist_points OWNER TO postgres;

--
-- Name: pm_record_checklist_points_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_record_checklist_points_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_record_checklist_points_id_seq OWNER TO postgres;

--
-- Name: pm_record_checklist_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_record_checklist_points_id_seq OWNED BY public.pm_record_checklist_points.id;


--
-- Name: pm_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pm_records (
    id integer NOT NULL,
    machine_id integer NOT NULL,
    sequence_number integer NOT NULL,
    previous_record_id integer,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.pm_records OWNER TO postgres;

--
-- Name: pm_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pm_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_records_id_seq OWNER TO postgres;

--
-- Name: pm_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pm_records_id_seq OWNED BY public.pm_records.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: signature_field_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signature_field_permissions (
    id integer NOT NULL,
    document_type text NOT NULL,
    field_name text NOT NULL,
    eligible_user_id integer NOT NULL,
    granted_by integer,
    granted_at timestamp without time zone DEFAULT now() NOT NULL,
    revoked_at timestamp without time zone
);


ALTER TABLE public.signature_field_permissions OWNER TO postgres;

--
-- Name: signature_field_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.signature_field_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signature_field_permissions_id_seq OWNER TO postgres;

--
-- Name: signature_field_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.signature_field_permissions_id_seq OWNED BY public.signature_field_permissions.id;


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signatures (
    id integer NOT NULL,
    document_type text NOT NULL,
    document_id integer NOT NULL,
    field_name text NOT NULL,
    signature_type text NOT NULL,
    user_id integer NOT NULL,
    user_name text NOT NULL,
    eligible_signer_assignment_id integer,
    signed_at timestamp without time zone DEFAULT now() NOT NULL,
    signature_data text
);


ALTER TABLE public.signatures OWNER TO postgres;

--
-- Name: signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.signatures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.signatures_id_seq OWNER TO postgres;

--
-- Name: signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.signatures_id_seq OWNED BY public.signatures.id;


--
-- Name: spare_part_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spare_part_movements (
    id integer NOT NULL,
    spare_part_id integer NOT NULL,
    movement_type text NOT NULL,
    quantity integer NOT NULL,
    quantity_before integer NOT NULL,
    quantity_after integer NOT NULL,
    movement_date text NOT NULL,
    reason text,
    reference_type text DEFAULT 'MANUAL'::text NOT NULL,
    reference_id integer,
    recorded_by_user_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.spare_part_movements OWNER TO postgres;

--
-- Name: spare_part_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spare_part_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spare_part_movements_id_seq OWNER TO postgres;

--
-- Name: spare_part_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spare_part_movements_id_seq OWNED BY public.spare_part_movements.id;


--
-- Name: spare_parts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.spare_parts (
    id integer NOT NULL,
    part_name text NOT NULL,
    part_code text NOT NULL,
    description text,
    category text,
    unit text DEFAULT 'piece'::text NOT NULL,
    minimum_quantity integer DEFAULT 0 NOT NULL,
    current_quantity integer DEFAULT 0 NOT NULL,
    location text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.spare_parts OWNER TO postgres;

--
-- Name: spare_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.spare_parts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spare_parts_id_seq OWNER TO postgres;

--
-- Name: spare_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.spare_parts_id_seq OWNED BY public.spare_parts.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_permissions_id_seq OWNER TO postgres;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_permissions_id_seq OWNED BY public.user_permissions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    full_name text,
    email text,
    role_id integer NOT NULL,
    department_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    signature_data text,
    employee_number text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: annual_pm_plan_rows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plan_rows ALTER COLUMN id SET DEFAULT nextval('public.annual_pm_plan_rows_id_seq'::regclass);


--
-- Name: annual_pm_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plans ALTER COLUMN id SET DEFAULT nextval('public.annual_pm_plans_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: closed_corrective_maintenance_log_exclusions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_log_exclusions ALTER COLUMN id SET DEFAULT nextval('public.closed_corrective_maintenance_log_exclusions_id_seq'::regclass);


--
-- Name: closed_corrective_maintenance_manual_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_manual_entries ALTER COLUMN id SET DEFAULT nextval('public.closed_corrective_maintenance_manual_entries_id_seq'::regclass);


--
-- Name: corrective_maintenance_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events ALTER COLUMN id SET DEFAULT nextval('public.corrective_maintenance_events_id_seq'::regclass);


--
-- Name: corrective_maintenance_handover id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_handover ALTER COLUMN id SET DEFAULT nextval('public.corrective_maintenance_handover_id_seq'::regclass);


--
-- Name: corrective_maintenance_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_records ALTER COLUMN id SET DEFAULT nextval('public.corrective_maintenance_records_id_seq'::regclass);


--
-- Name: corrective_maintenance_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_staff ALTER COLUMN id SET DEFAULT nextval('public.corrective_maintenance_staff_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: eligible_signer_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eligible_signer_assignments ALTER COLUMN id SET DEFAULT nextval('public.eligible_signer_assignments_id_seq'::regclass);


--
-- Name: equipment_information_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_information_records ALTER COLUMN id SET DEFAULT nextval('public.equipment_information_records_id_seq'::regclass);


--
-- Name: external_maintenance_receipts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_receipts ALTER COLUMN id SET DEFAULT nextval('public.external_maintenance_receipts_id_seq'::regclass);


--
-- Name: external_maintenance_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_requests ALTER COLUMN id SET DEFAULT nextval('public.external_maintenance_requests_id_seq'::regclass);


--
-- Name: form_headers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_headers ALTER COLUMN id SET DEFAULT nextval('public.form_headers_id_seq'::regclass);


--
-- Name: machines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines ALTER COLUMN id SET DEFAULT nextval('public.machines_id_seq'::regclass);


--
-- Name: maintenance_request_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_history ALTER COLUMN id SET DEFAULT nextval('public.maintenance_request_status_history_id_seq'::regclass);


--
-- Name: maintenance_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests ALTER COLUMN id SET DEFAULT nextval('public.maintenance_requests_id_seq'::regclass);


--
-- Name: monthly_maintenance_evaluation_reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_maintenance_evaluation_reports ALTER COLUMN id SET DEFAULT nextval('public.monthly_maintenance_evaluation_reports_id_seq'::regclass);


--
-- Name: monthly_pm_plan_rows id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plan_rows ALTER COLUMN id SET DEFAULT nextval('public.monthly_pm_plan_rows_id_seq'::regclass);


--
-- Name: monthly_pm_plans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plans ALTER COLUMN id SET DEFAULT nextval('public.monthly_pm_plans_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: pm_checklist_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_checklist_points ALTER COLUMN id SET DEFAULT nextval('public.pm_checklist_points_id_seq'::regclass);


--
-- Name: pm_headers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_headers ALTER COLUMN id SET DEFAULT nextval('public.pm_headers_id_seq'::regclass);


--
-- Name: pm_inspection_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspection_results ALTER COLUMN id SET DEFAULT nextval('public.pm_inspection_results_id_seq'::regclass);


--
-- Name: pm_inspections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspections ALTER COLUMN id SET DEFAULT nextval('public.pm_inspections_id_seq'::regclass);


--
-- Name: pm_record_checklist_points id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_record_checklist_points ALTER COLUMN id SET DEFAULT nextval('public.pm_record_checklist_points_id_seq'::regclass);


--
-- Name: pm_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_records ALTER COLUMN id SET DEFAULT nextval('public.pm_records_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: signature_field_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signature_field_permissions ALTER COLUMN id SET DEFAULT nextval('public.signature_field_permissions_id_seq'::regclass);


--
-- Name: signatures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures ALTER COLUMN id SET DEFAULT nextval('public.signatures_id_seq'::regclass);


--
-- Name: spare_part_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spare_part_movements ALTER COLUMN id SET DEFAULT nextval('public.spare_part_movements_id_seq'::regclass);


--
-- Name: spare_parts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spare_parts ALTER COLUMN id SET DEFAULT nextval('public.spare_parts_id_seq'::regclass);


--
-- Name: user_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN id SET DEFAULT nextval('public.user_permissions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: annual_pm_plan_rows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.annual_pm_plan_rows (id, plan_id, machine_id, department, machine_name, machine_location, machine_code, frequency_months, duration, start_date, finish_date, scheduled_months, is_override, created_at, updated_at) FROM stdin;
5	1	5	Production	Karnavati Tablet Press Machine 	production	PDM-01-089	6		2026-08-12	2026-08-12	[8]	f	2026-08-12 05:11:05.222506	2026-08-12 05:11:05.222506
7	1	7	Engineering & Maintenance	Air Handling Unit	Engineering and Maintenance	AC 3/4	6		2026-08-13	2026-08-13	[8]	f	2026-08-13 00:53:48.022774	2026-08-13 00:53:48.022774
6	1	6	Production	KALIX-tube filling machine	production	PDM-03-51	6		2026-08-13	2026-08-13	[8]	f	2026-08-12 22:26:23.234875	2026-08-12 22:26:23.234875
\.


--
-- Data for Name: annual_pm_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.annual_pm_plans (id, year, prepared_by_name, prepared_by_date, approved_engineering_name, approved_engineering_date, approved_production_name, approved_production_date, approved_qc_name, approved_qc_date, approved_rd_name, approved_rd_date, approved_qa_name, approved_qa_date, created_at, updated_at) FROM stdin;
1	2026	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.174291	2026-08-11 04:06:03.174291
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, details, old_value, new_value, created_at) FROM stdin;
1	1	signature_field_permission_granted	signature	1	{"fieldName": "engineering_final", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 2}	\N	\N	2026-08-11 04:30:57.33852
2	1	signature_field_permission_granted	signature	2	{"fieldName": "approved_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 2}	\N	\N	2026-08-11 04:31:28.747032
3	1	signature_field_permission_granted	signature	3	{"fieldName": "department_manager", "documentType": "MONTHLY_PLAN", "eligibleUserId": 2}	\N	\N	2026-08-11 04:31:34.892179
4	1	signature_field_permission_granted	signature	4	{"fieldName": "engineering_manager", "documentType": "MONTHLY_MAINTENANCE_EVALUATION", "eligibleUserId": 2}	\N	\N	2026-08-11 04:31:47.398434
5	1	signature_field_permission_granted	signature	5	{"fieldName": "engineering_manager", "documentType": "ANNUAL_PLAN", "eligibleUserId": 2}	\N	\N	2026-08-11 04:31:52.962107
6	1	signature_field_permission_granted	signature	6	{"fieldName": "maintenance_technician", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:09.763412
7	1	signature_field_permission_granted	signature	7	{"fieldName": "performing_staff", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:16.281482
8	1	signature_field_permission_granted	signature	8	{"fieldName": "engineering_final", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:20.256021
9	1	signature_field_permission_granted	signature	9	{"fieldName": "examiner", "documentType": "PM_RECORD", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:33.607973
10	1	signature_field_permission_granted	signature	10	{"fieldName": "prepared_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:42.693939
11	1	signature_field_permission_granted	signature	11	{"fieldName": "approved_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:45.399404
12	1	signature_field_permission_granted	signature	12	{"fieldName": "prepared_by", "documentType": "MONTHLY_PLAN", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:53.992738
13	1	signature_field_permission_granted	signature	13	{"fieldName": "maintenance_supervisor", "documentType": "MONTHLY_PLAN", "eligibleUserId": 12}	\N	\N	2026-08-11 04:38:56.579946
14	1	signature_field_permission_granted	signature	14	{"fieldName": "prepared_by", "documentType": "MONTHLY_MAINTENANCE_EVALUATION", "eligibleUserId": 12}	\N	\N	2026-08-11 04:39:02.824715
15	1	signature_field_permission_granted	signature	15	{"fieldName": "prepared_by", "documentType": "ANNUAL_PLAN", "eligibleUserId": 12}	\N	\N	2026-08-11 04:39:08.039491
26	1	signature_field_permission_granted	signature	16	{"fieldName": "maintenance_technician", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 14}	\N	\N	2026-08-12 03:10:07.628103
27	1	signature_field_permission_granted	signature	17	{"fieldName": "performing_staff", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 14}	\N	\N	2026-08-12 03:10:12.502303
28	1	signature_field_permission_granted	signature	18	{"fieldName": "engineering_final", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 14}	\N	\N	2026-08-12 03:10:16.240217
29	1	signature_field_permission_granted	signature	19	{"fieldName": "examiner", "documentType": "PM_RECORD", "eligibleUserId": 14}	\N	\N	2026-08-12 03:10:29.272634
30	1	signature_field_permission_granted	signature	20	{"fieldName": "prepared_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 14}	\N	\N	2026-08-12 03:10:41.749419
31	1	signature_field_permission_granted	signature	21	{"fieldName": "maintenance_technician", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 15}	\N	\N	2026-08-12 03:11:01.216863
32	1	signature_field_permission_granted	signature	22	{"fieldName": "performing_staff", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 15}	\N	\N	2026-08-12 03:11:05.210365
33	1	signature_field_permission_granted	signature	23	{"fieldName": "engineering_final", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 15}	\N	\N	2026-08-12 03:11:08.00064
34	1	signature_field_permission_granted	signature	24	{"fieldName": "examiner", "documentType": "PM_RECORD", "eligibleUserId": 15}	\N	\N	2026-08-12 03:11:10.72076
35	1	signature_field_permission_granted	signature	25	{"fieldName": "prepared_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 15}	\N	\N	2026-08-12 03:11:15.920272
36	1	signature_field_permission_granted	signature	26	{"fieldName": "reporting_person", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 13}	\N	\N	2026-08-12 03:11:40.078132
37	1	signature_field_permission_granted	signature	27	{"fieldName": "department_supervisor", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 13}	\N	\N	2026-08-12 03:11:47.772086
38	1	signature_field_permission_granted	signature	28	{"fieldName": "concerned_section_supervisor", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 13}	\N	\N	2026-08-12 03:11:53.014701
39	1	signature_field_permission_granted	signature	29	{"fieldName": "receiver", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 13}	\N	\N	2026-08-12 03:11:57.261505
40	1	signature_field_permission_granted	signature	30	{"fieldName": "machine_receiver", "documentType": "PM_RECORD", "eligibleUserId": 13}	\N	\N	2026-08-12 03:12:00.725361
41	1	signature_field_permission_granted	signature	31	{"fieldName": "maintenance_technician", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 16}	\N	\N	2026-08-12 03:17:45.42984
42	1	signature_field_permission_granted	signature	32	{"fieldName": "performing_staff", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 16}	\N	\N	2026-08-12 03:17:49.62962
43	1	signature_field_permission_granted	signature	33	{"fieldName": "engineering_final", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 16}	\N	\N	2026-08-12 03:17:52.361456
44	1	signature_field_permission_granted	signature	34	{"fieldName": "examiner", "documentType": "PM_RECORD", "eligibleUserId": 16}	\N	\N	2026-08-12 03:17:55.465166
45	1	signature_field_permission_granted	signature	35	{"fieldName": "prepared_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 16}	\N	\N	2026-08-12 03:18:00.998108
46	1	signature_field_permission_granted	signature	36	{"fieldName": "prepared_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 18}	\N	\N	2026-08-12 03:25:33.738796
47	1	signature_field_permission_granted	signature	37	{"fieldName": "approved_by", "documentType": "EQUIPMENT_INFORMATION", "eligibleUserId": 18}	\N	\N	2026-08-12 03:25:36.026217
48	1	signature_field_permission_granted	signature	38	{"fieldName": "production_manager", "documentType": "ANNUAL_PLAN", "eligibleUserId": 19}	\N	\N	2026-08-12 03:31:56.793902
52	13	document_signed	signature	1	{"fieldName": "reporting_person", "documentId": 2, "documentType": "MAINTENANCE_REQUEST", "signatureType": "electronic", "authorizationFieldName": "reporting_person"}	\N	\N	2026-08-12 04:03:09.160998
56	1	signature_field_permission_granted	signature	39	{"fieldName": "qa_supervisor_approval", "documentType": "MAINTENANCE_REQUEST", "eligibleUserId": 20}	\N	\N	2026-08-12 04:06:25.510905
67	13	document_signed	signature	2	{"fieldName": "reporting_person", "documentId": 5, "documentType": "MAINTENANCE_REQUEST", "signatureType": "electronic", "authorizationFieldName": "reporting_person"}	\N	\N	2026-08-12 04:10:18.660354
71	13	document_signed	signature	3	{"fieldName": "reporting_person", "documentId": 6, "documentType": "MAINTENANCE_REQUEST", "signatureType": "electronic", "authorizationFieldName": "reporting_person"}	\N	\N	2026-08-12 04:11:16.293515
76	13	document_signed	signature	4	{"fieldName": "reporting_person", "documentId": 7, "documentType": "MAINTENANCE_REQUEST", "signatureType": "electronic", "authorizationFieldName": "reporting_person"}	\N	\N	2026-08-12 04:12:24.371656
92	16	machine_created	machine	6	\N	\N	{"id": 6, "status": "Active", "location": "production", "createdAt": "2026-08-12T22:26:23.230Z", "deletedAt": null, "updatedAt": "2026-08-12T22:26:23.230Z", "machineName": "KALIX-tube filling machine", "pmStartDate": "2026-08-13", "departmentId": 2, "machineNumber": "PDM-03-51", "departmentName": "Production", "pmFrequencyMonths": 6}	2026-08-12 22:26:23.291631
93	16	equipment_information_created	machine	6	\N	\N	{"id": 2, "others": null, "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-12T22:30:37.953Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": null, "serialNumber": "filling machine  9610\\nuniversal feeder  9617", "utilitiesAir": null, "datePurchased": null, "othersDetails": null, "approvedByDate": null, "approvedByName": null, "preparedByDate": null, "preparedByName": null, "utilitiesOther": null, "utilitiesWater": null, "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": null, "safetyIssuesDetails": null, "identificationNumber": "PDM-03-51", "purchasedFromAddress": null, "utilitiesPowerSupply": null, "manufacturingCompanyName": null, "manufacturingCompanyAddress": null}	2026-08-12 22:30:37.957118
94	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": null, "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-12T22:30:37.953Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": null, "serialNumber": "filling machine  9610\\nuniversal feeder  9617", "utilitiesAir": null, "datePurchased": null, "othersDetails": null, "approvedByDate": null, "approvedByName": null, "preparedByDate": null, "preparedByName": null, "utilitiesOther": null, "utilitiesWater": null, "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": null, "safetyIssuesDetails": null, "identificationNumber": "PDM-03-51", "purchasedFromAddress": null, "utilitiesPowerSupply": null, "manufacturingCompanyName": null, "manufacturingCompanyAddress": null}	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:31:03.838Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\n", "utilitiesAir": "", "datePurchased": "", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	2026-08-12 22:31:03.842263
95	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:31:03.838Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\n", "utilitiesAir": "", "datePurchased": "", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:31:08.573Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	2026-08-12 22:31:08.577456
96	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:31:08.573Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:31:44.805Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "2006", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "KALIX\\n ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	2026-08-12 22:31:44.809377
97	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:31:44.805Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "2006", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "KALIX\\n ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:32:34.778Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "2006", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "KALIX\\nZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "KALIX\\nZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	2026-08-12 22:32:34.782498
98	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:32:34.778Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "2006", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "KALIX\\nZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "KALIX\\nZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "", "manufacturingCompanyName": "", "manufacturingCompanyAddress": ""}	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:32:55.351Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "2006", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	2026-08-12 22:32:55.359529
99	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "", "weightKg": null, "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T05:32:55.351Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "", "datePurchased": "2006", "othersDetails": "", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": null, "dimensionWidthCm": null, "dimensionHeightCm": null, "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T06:49:12.298Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply\\nbefore performing maintenance and cleaning\\nactivities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	2026-08-12 23:49:12.306288
100	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T06:49:12.298Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply\\nbefore performing maintenance and cleaning\\nactivities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T06:49:33.499Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply before performing maintenance and cleaning activities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	2026-08-12 23:49:33.503364
101	16	equipment_information_updated	machine	6	\N	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T06:49:33.499Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply before performing maintenance and cleaning activities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T06:49:49.000Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply before performing maintenance and cleaning activities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	2026-08-12 23:49:49.003962
102	1	equipment_information_updated	machine	6	\N	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T06:49:49.000Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply before performing maintenance and cleaning activities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	{"id": 2, "others": "11.1 Capacity", "weightKg": "990.00", "createdAt": "2026-08-12T22:30:37.953Z", "machineId": 6, "updatedAt": "2026-08-13T07:20:12.058Z", "modelNumber": "filling machine  KX 801\\nuniversal feeder  U-F", "safetyIssues": "12.1", "serialNumber": "filling machine  9610\\nuniversal feeder  9617\\n", "utilitiesAir": "Air pressure = 6 bar", "datePurchased": "2006", "othersDetails": "80 tube / minuet", "approvedByDate": "", "approvedByName": "", "preparedByDate": "", "preparedByName": "", "utilitiesOther": "", "utilitiesWater": "Heating water from asplit heating unit to the\\nproduction tank jacket at range 0 – 100 °C", "nameOfEquipment": "KALIX-tube filling machine", "dimensionDepthCm": "85.00", "dimensionWidthCm": "269.00", "dimensionHeightCm": "216.00", "purchasedFromName": "KALIX\\n", "safetyIssuesDetails": "Disconnect the plug from the main power supply before performing maintenance and cleaning activities.", "identificationNumber": "PDM-03-51", "purchasedFromAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501", "utilitiesPowerSupply": "filling machine :-  380V, 50HZ, power = 4.5 KVA\\n         control voltage = 24V\\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA", "manufacturingCompanyName": "KALIX", "manufacturingCompanyAddress": "ZA.de countaboeuf No 4 , 4Avenue du parana\\nLes ULIS 91978 ,countaboeuf cedex - france\\nTell 33(0)169180500\\nFax 33(0) 169180501"}	2026-08-13 00:20:12.06736
108	1	machine_created	machine	7	\N	\N	{"id": 7, "status": "Active", "location": "", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-13T00:53:48.011Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": null, "machineNumber": "AHU", "departmentName": null, "pmFrequencyMonths": 6}	2026-08-13 00:53:48.084844
109	1	machine_updated	machine	7	\N	{"id": 7, "status": "Active", "location": "", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-13T00:53:48.011Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": null, "machineNumber": "AHU", "departmentName": null, "pmFrequencyMonths": 6}	{"id": 7, "status": "Active", "location": "", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-13T07:53:54.231Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AHU", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	2026-08-13 00:53:54.302195
110	1	equipment_information_created	machine	7	\N	\N	{"id": 3, "others": "11.1 Air flow:\\n11.2 Service area:", "weightKg": "669.00", "createdAt": "2026-08-16T22:49:08.746Z", "machineId": 7, "updatedAt": "2026-08-16T22:49:08.746Z", "modelNumber": "39CF-350", "safetyIssues": "12.1", "serialNumber": "990022EE", "utilitiesAir": "Not Applicable", "datePurchased": "1999", "othersDetails": "3211 L/s\\nOlman preparation, filling and packaging area", "approvedByDate": null, "approvedByName": null, "dimensionsNote": null, "preparedByDate": null, "preparedByName": null, "utilitiesOther": "Not Applicable", "utilitiesWater": "Not Applicable", "nameOfEquipment": "Air Handling Unit", "dimensionDepthCm": "376.80", "dimensionWidthCm": "167.50", "dimensionHeightCm": "104.50", "purchasedFromName": "Carrier – BP 49 Route de Thil", "safetyIssuesDetails": "Disconnect the main power supply circuit breaker before performing any maintenance and cleaning activity.", "identificationNumber": "AC 3/4", "purchasedFromAddress": "01122 Montluel - France\\nTelefax: (+33) 472252121\\nFax: (+33) 472252251", "utilitiesPowerSupply": "400 VAC, 50 Hz", "manufacturingCompanyName": "Carrier – BP 49 Route de Thil", "manufacturingCompanyAddress": "01122 Montluel - France\\nTelefax: (+33) 472252121\\nFax: (+33) 472252251"}	2026-08-16 22:49:08.755995
111	1	machine_updated	machine	7	\N	{"id": 7, "status": "Active", "location": "", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-13T07:53:54.231Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AHU", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	{"id": 7, "status": "Active", "location": "", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-17T07:49:01.241Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AHU", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	2026-08-17 00:49:01.31745
112	1	machine_updated	machine	7	\N	{"id": 7, "status": "Active", "location": "", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-17T07:49:01.241Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AHU", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	{"id": 7, "status": "Active", "location": "Engineering and Maintenance", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-17T07:49:26.341Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AHU", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	2026-08-17 00:49:26.392855
113	1	machine_updated	machine	5	\N	{"id": 5, "status": "Active", "location": "", "createdAt": "2026-08-12T05:11:05.216Z", "deletedAt": null, "updatedAt": "2026-08-12T05:11:05.216Z", "machineName": "Karnavati Tablet Press Machine ", "pmStartDate": "2026-08-12", "departmentId": 2, "machineNumber": "PDM-01-089", "departmentName": "Production", "pmFrequencyMonths": 6}	{"id": 5, "status": "Active", "location": "production", "createdAt": "2026-08-12T05:11:05.216Z", "deletedAt": null, "updatedAt": "2026-08-17T07:49:57.898Z", "machineName": "Karnavati Tablet Press Machine ", "pmStartDate": "2026-08-12", "departmentId": 2, "machineNumber": "PDM-01-089", "departmentName": "Production", "pmFrequencyMonths": 6}	2026-08-17 00:49:57.96575
114	1	machine_updated	machine	7	\N	{"id": 7, "status": "Active", "location": "Engineering and Maintenance", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-17T07:49:26.341Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AHU", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	{"id": 7, "status": "Active", "location": "Engineering and Maintenance", "createdAt": "2026-08-13T00:53:48.011Z", "deletedAt": null, "updatedAt": "2026-08-17T07:50:37.547Z", "machineName": "Air Handling Unit", "pmStartDate": "2026-08-13", "departmentId": 8, "machineNumber": "AC 3/4", "departmentName": "Engineering & Maintenance", "pmFrequencyMonths": 6}	2026-08-17 00:50:37.609583
\.


--
-- Data for Name: closed_corrective_maintenance_log_exclusions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.closed_corrective_maintenance_log_exclusions (id, maintenance_request_id, excluded_at, excluded_by_user_id) FROM stdin;
\.


--
-- Data for Name: closed_corrective_maintenance_manual_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.closed_corrective_maintenance_manual_entries (id, machine_name, machine_number, request_date, request_report_number, priority, closed_date, remarks, created_by_user_id, deleted_at, deleted_by_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: corrective_maintenance_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.corrective_maintenance_events (id, record_id, request_id, machine_id, request_report_number, row_number, preliminary_check_results, expected_work_time_from, expected_work_time_to, technician_name, maintenance_technician_signature, concerned_section_supervisor_signature, actions_taken, remarks_recommendations, performing_staff, receiver_name, receiver_signature, handover_date, engineering_signature, completed_by_user_id, completed_at, created_at, updated_at, repair_time_slots, request_date, maintenance_type, spare_parts_used, engineering_date) FROM stdin;
\.


--
-- Data for Name: corrective_maintenance_handover; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.corrective_maintenance_handover (id, cm_event_id, receiver_name, handover_date, engineering_final_confirmation, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: corrective_maintenance_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.corrective_maintenance_records (id, machine_id, sequence_number, document_number, execution_date, page_count, machine_name, machine_number, machine_location, startup_date, max_rows, status, previous_record_id, created_at, updated_at) FROM stdin;
3	7	1	LOG-00-0102-3	2026-08-17	Page 1 of 1	Air Handling Unit	AHU		2026-08-13	3	active	\N	2026-08-17 00:47:14.41688	2026-08-17 00:47:14.41688
\.


--
-- Data for Name: corrective_maintenance_staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.corrective_maintenance_staff (id, cm_event_id, staff_order, staff_name, created_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, created_at) FROM stdin;
2	Production	2026-08-11 02:31:51.158077
3	Quality Assurance	2026-08-11 02:32:12.576179
4	Quality Control	2026-08-11 02:32:29.464081
6	Supply Chain	2026-08-11 02:35:32.046955
7	Administration	2026-08-11 02:35:41.15931
8	Engineering & Maintenance	2026-08-11 03:39:02.765451
11	Warehouse	2026-08-11 03:39:02.767411
12	R&D	2026-08-11 04:26:17.656619
\.


--
-- Data for Name: eligible_signer_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.eligible_signer_assignments (id, document_type, document_id, field_name, eligible_user_id, granted_by, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: equipment_information_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipment_information_records (id, machine_id, name_of_equipment, model_number, serial_number, identification_number, date_purchased, purchased_from_name, purchased_from_address, manufacturing_company_name, manufacturing_company_address, dimension_width_cm, dimension_height_cm, dimension_depth_cm, weight_kg, utilities_power_supply, utilities_air, utilities_water, utilities_other, others, safety_issues, prepared_by_name, prepared_by_date, approved_by_name, approved_by_date, created_at, updated_at, others_details, safety_issues_details, dimensions_note) FROM stdin;
2	6	KALIX-tube filling machine	filling machine  KX 801\nuniversal feeder  U-F	filling machine  9610\nuniversal feeder  9617\n	PDM-03-51	2006	KALIX\n	ZA.de countaboeuf No 4 , 4Avenue du parana\nLes ULIS 91978 ,countaboeuf cedex - france\nTell 33(0)169180500\nFax 33(0) 169180501	KALIX	ZA.de countaboeuf No 4 , 4Avenue du parana\nLes ULIS 91978 ,countaboeuf cedex - france\nTell 33(0)169180500\nFax 33(0) 169180501	269.00	216.00	85.00	990.00	filling machine :-  380V, 50HZ, power = 4.5 KVA\n         control voltage = 24V\nuniversal feeder:-  220V , 50HZ, power = 0.5 KVA	Air pressure = 6 bar	Heating water from asplit heating unit to the\nproduction tank jacket at range 0 – 100 °C		11.1 Capacity	12.1					2026-08-12 22:30:37.953145	2026-08-13 07:20:12.058	80 tube / minuet	Disconnect the plug from the main power supply before performing maintenance and cleaning activities.	\N
1	5	Karnavati Tablet Press Machine 	NXi-49s	N.A	PDM-01-089	4/21	a- Karnavati Pharma Machinery division\n	b- Ahmad Abad-India	a- Karnavati Pharma Machinery division\n	b- Ahmad Abad-India	\N	\N	\N	4500.00	415V AC/3Q/50-60 HZ 2.5mm  2-5 Core with Earthing	5to8 kg/cm2	Auto Lubrication System	Max Tablet size can be Compresses 25mm	Main Compression Roller Max Pressure	Maximum output Tab/Hr	خليل سعد	2021-09-02			2026-08-12 05:18:17.496711	2026-08-13 07:32:26.184	10 ton/100Kn	234200	As layout
3	7	Air Handling Unit	39CF-350	990022EE	AC 3/4	1999	Carrier – BP 49 Route de Thil	01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251	Carrier – BP 49 Route de Thil	01122 Montluel - France\nTelefax: (+33) 472252121\nFax: (+33) 472252251	167.50	104.50	376.80	669.00	400 VAC, 50 Hz	Not Applicable	Not Applicable	Not Applicable	11.1 Air flow:\n11.2 Service area:	12.1	\N	\N	\N	\N	2026-08-16 22:49:08.746063	2026-08-16 22:49:08.746063	3211 L/s\nOlman preparation, filling and packaging area	Disconnect the main power supply circuit breaker before performing any maintenance and cleaning activity.	\N
\.


--
-- Data for Name: external_maintenance_receipts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_receipts (id, external_maintenance_request_id, maintenance_type, requesting_department, receipt_date, performing_entity, work_acceptance_report, work_failure_cause, examiner_name, examiner_signature, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: external_maintenance_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_maintenance_requests (id, maintenance_request_id, external_request_number, request_date, department_section, required_maintenance, preliminary_findings, technician_suggestions, maintenance_technician_signature, maintenance_technician_date, department_manager_signature, department_manager_date, general_manager_signature, general_manager_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: form_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.form_headers (id, document_type, document_id, company_name, document_name, document_number, effective_or_execution_date, page_number, total_pages, machine_name, machine_number, machine_location, startup_date, created_at, updated_at) FROM stdin;
1	ANNUAL_PM_PLAN	0	Beit Jala Pharmaceutical Co.	Preventive Maintenance Plan	FORM-10-1025-0	18/3/2023	1	1	\N	\N	\N	\N	2026-08-11 04:06:03.173432	2026-08-11 04:06:03.173432
2	MONTHLY_PM_PLAN	0	Beit Jala Pharmaceutical Co.	Monthly Preventive Maintenance Program	FORM-10-0117-3	18/3/2023	1	1	\N	\N	\N	\N	2026-08-11 05:06:36.497789	2026-08-11 05:06:36.497789
3	EQUIPMENT_INFORMATION	0	Beit Jala Pharmaceutical Co.	Equipment Information Record	FORM-10-0118	\N	1	1	\N	\N	\N	\N	2026-08-11 23:10:09.607948	2026-08-11 23:10:09.607948
4	CLOSED_CORRECTIVE_MAINTENANCE_LOG	0	Beit Jala Pharmaceutical Co.	سجل طلبات الصيانة العلاجية للأجهزة / الماكينات	LOG-10-0659-0	18/03/2023	1	1	\N	\N	\N	\N	2026-08-12 04:08:17.571581	2026-08-12 04:08:17.571581
\.


--
-- Data for Name: machines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.machines (id, machine_number, machine_name, department_id, location, status, pm_frequency_months, pm_start_date, deleted_at, created_at, updated_at) FROM stdin;
6	PDM-03-51	KALIX-tube filling machine	2	production	Active	6	2026-08-13	\N	2026-08-12 22:26:23.230283	2026-08-12 22:26:23.230283
5	PDM-01-089	Karnavati Tablet Press Machine 	2	production	Active	6	2026-08-12	\N	2026-08-12 05:11:05.216973	2026-08-17 07:49:57.898
7	AC 3/4	Air Handling Unit	8	Engineering and Maintenance	Active	6	2026-08-13	\N	2026-08-13 00:53:48.011594	2026-08-17 07:50:37.547
\.


--
-- Data for Name: maintenance_request_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_request_status_history (id, request_id, from_status, to_status, changed_by_user_id, notes, created_at) FROM stdin;
\.


--
-- Data for Name: maintenance_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_requests (id, request_report_number, machine_id, requested_by_user_id, department_id, department_section, priority, machine_name, machine_number, request_date, failure_description, reporting_person_name, reporting_person_signature, department_supervisor_name, department_supervisor_signature, qa_decision, qa_supervisor_signature, qa_review_date, status, qa_reviewed_by_user_id, qa_reviewed_at, qa_review_notes, engineering_decision, assigned_technician_user_id, engineering_supervisor_signature, engineering_reviewed_by_user_id, engineering_reviewed_at, engineering_review_notes, expected_work_time_from, expected_work_time_to, created_at, updated_at, closed_at, archived_at, archived_by_user_id) FROM stdin;
\.


--
-- Data for Name: monthly_maintenance_evaluation_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monthly_maintenance_evaluation_reports (id, year, month, delayed_activities, delay_reason, follow_up_included, total_pm_activities, completed_pm_on_time, production_impact, spare_part_shortage, external_maintenance_details, total_external_activities, completed_external_activities, employee_delay_impact, working_days, lost_work_days, prepared_by, engineering_manager_signature, created_by_user_id, created_at, updated_at, corrective_maintenance_details, total_corrective_requests, unclosed_corrective_requests, completed_corrective_requests, prepared_date, engineering_manager_date, manual_corrective_adjustments, manual_preventive_adjustments, total_corrective_requests_is_override, unclosed_corrective_requests_is_override, completed_corrective_requests_is_override, total_external_activities_is_override, total_pm_activities_is_override, completed_pm_on_time_is_override) FROM stdin;
\.


--
-- Data for Name: monthly_pm_plan_rows; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monthly_pm_plan_rows (id, plan_id, annual_plan_row_id, machine_id, row_number, department_name, section_name, machine_name, identification_number, planned_date_from, planned_date_to, actual_date, amendments, status, created_at, updated_at, actual_date_is_override, is_manually_removed, planned_date_is_override) FROM stdin;
6	8	6	6	1	Production	Production	KALIX-tube filling machine	PDM-03-51	2026-08-13	2026-08-13	\N	\N	due	2026-08-12 22:26:23.272666	2026-08-17 07:50:37.597	f	f	f
5	8	5	5	2	Production	Production	Karnavati Tablet Press Machine 	PDM-01-089	2026-08-12	2026-08-12	\N	\N	due	2026-08-12 05:11:05.25774	2026-08-17 07:50:37.597	f	f	f
7	8	7	7	3	Engineering & Maintenance	Engineering & Maintenance	Air Handling Unit	AC 3/4	2026-08-13	2026-08-13	\N	\N	due	2026-08-13 00:53:48.067173	2026-08-17 07:50:37.598	f	f	f
\.


--
-- Data for Name: monthly_pm_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.monthly_pm_plans (id, year, month, prepared_by_name, prepared_by_date, maintenance_supervisor_name, maintenance_supervisor_date, department_manager_name, department_manager_date, approved_by_name, approved_by_date, created_at, updated_at) FROM stdin;
1	2026	1	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.190331	2026-08-11 04:06:03.190331
2	2026	2	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.198107	2026-08-11 04:06:03.198107
3	2026	3	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.209462	2026-08-11 04:06:03.209462
4	2026	4	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.222424	2026-08-11 04:06:03.222424
5	2026	5	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.237613	2026-08-11 04:06:03.237613
6	2026	6	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.246125	2026-08-11 04:06:03.246125
7	2026	7	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.255711	2026-08-11 04:06:03.255711
8	2026	8	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.262312	2026-08-11 04:06:03.262312
9	2026	9	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.267089	2026-08-11 04:06:03.267089
10	2026	10	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.270706	2026-08-11 04:06:03.270706
11	2026	11	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.275479	2026-08-11 04:06:03.275479
12	2026	12	\N	\N	\N	\N	\N	\N	\N	\N	2026-08-11 04:06:03.279273	2026-08-11 04:06:03.279273
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, role_id, type, title, message, related_type, related_id, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, description, created_at) FROM stdin;
1	view_dashboard	view dashboard	2026-08-11 03:39:02.735182
2	view_dashboard_notifications	view dashboard notifications	2026-08-11 03:39:02.735919
3	view_dashboard_machines	view dashboard machines	2026-08-11 03:39:02.736346
4	view_dashboard_users	view dashboard users	2026-08-11 03:39:02.737077
5	view_dashboard_departments	view dashboard departments	2026-08-11 03:39:02.737649
6	view_dashboard_preventive_maintenance	view dashboard preventive maintenance	2026-08-11 03:39:02.738143
7	view_dashboard_maintenance_requests	view dashboard maintenance requests	2026-08-11 03:39:02.738592
8	view_dashboard_corrective_maintenance	view dashboard corrective maintenance	2026-08-11 03:39:02.738975
9	view_dashboard_spare_parts	view dashboard spare parts	2026-08-11 03:39:02.739337
10	view_reports	view reports	2026-08-11 03:39:02.73973
11	edit_reports	edit reports	2026-08-11 03:39:02.740336
12	manage_users	manage users	2026-08-11 03:39:02.740861
13	view_machines	view machines	2026-08-11 03:39:02.741523
14	create_machine	create machine	2026-08-11 03:39:02.742184
15	edit_machine	edit machine	2026-08-11 03:39:02.742702
16	soft_delete_machine	soft delete machine	2026-08-11 03:39:02.743222
17	view_equipment_information	view equipment information	2026-08-11 03:39:02.743716
18	view_machine_maintenance_history	view machine maintenance history	2026-08-11 03:39:02.744147
19	edit_equipment_information	edit equipment information	2026-08-11 03:39:02.744619
20	manage_pm_checklist	manage pm checklist	2026-08-11 03:39:02.745048
21	fill_pm_record	fill pm record	2026-08-11 03:39:02.745433
22	edit_pm_inspection	edit pm inspection	2026-08-11 03:39:02.746028
23	delete_pm_inspection	delete pm inspection	2026-08-11 03:39:02.746641
24	view_pm_records	view pm records	2026-08-11 03:39:02.74727
25	view_maintenance_plans	view maintenance plans	2026-08-11 03:39:02.747825
26	edit_maintenance_plans	edit maintenance plans	2026-08-11 03:39:02.748383
27	edit_monthly_pm_plan_rows	edit monthly pm plan rows	2026-08-11 03:39:02.748933
28	view_annual_maintenance_plan	view annual maintenance plan	2026-08-11 03:39:02.749389
29	edit_annual_maintenance_plan	edit annual maintenance plan	2026-08-11 03:39:02.749799
30	view_monthly_maintenance_plan	view monthly maintenance plan	2026-08-11 03:39:02.750163
31	edit_monthly_maintenance_plan	edit monthly maintenance plan	2026-08-11 03:39:02.750703
32	delete_monthly_pm_plan_rows	delete monthly pm plan rows	2026-08-11 03:39:02.751199
33	submit_maintenance_request	submit maintenance request	2026-08-11 03:39:02.751601
34	review_department_requests	review department requests	2026-08-11 03:39:02.752003
35	view_own_requests	view own requests	2026-08-11 03:39:02.752671
36	qa_review_requests	qa review requests	2026-08-11 03:39:02.75331
37	engineering_review_requests	engineering review requests	2026-08-11 03:39:02.753875
38	assign_technician	assign technician	2026-08-11 03:39:02.754384
39	fill_preliminary_findings	fill preliminary findings	2026-08-11 03:39:02.754863
40	fill_corrective_maintenance	fill corrective maintenance	2026-08-11 03:39:02.755296
41	edit_corrective_maintenance	edit corrective maintenance	2026-08-11 03:39:02.755846
42	delete_corrective_maintenance	delete corrective maintenance	2026-08-11 03:39:02.756333
43	view_corrective_maintenance	view corrective maintenance	2026-08-11 03:39:02.756869
44	manage_maintenance_requests	manage maintenance requests	2026-08-11 03:39:02.757357
45	view_external_maintenance	view external maintenance	2026-08-11 03:39:02.757746
46	edit_external_maintenance	edit external maintenance	2026-08-11 03:39:02.758099
47	view_spare_parts	view spare parts	2026-08-11 03:39:02.758496
48	manage_spare_parts	manage spare parts	2026-08-11 03:39:02.759022
49	record_spare_part_usage	record spare part usage	2026-08-11 03:39:02.759586
50	adjust_spare_parts	adjust spare parts	2026-08-11 03:39:02.760078
51	edit_header	edit header	2026-08-11 03:39:02.7606
52	print_forms	print forms	2026-08-11 03:39:02.761138
53	manage_signatures	manage signatures	2026-08-11 03:39:02.761655
54	sign_assigned_fields	sign assigned fields	2026-08-11 03:39:02.762088
55	review_qa_requests	review qa requests	2026-08-11 03:39:02.762497
56	review_engineering_requests	review engineering requests	2026-08-11 03:39:02.762875
57	archive_maintenance_requests	archive maintenance requests	2026-08-11 03:39:02.763374
58	edit_closed_corrective_maintenance_log	edit closed corrective maintenance log	2026-08-11 03:39:02.763866
59	set_maintenance_request_number_start	set maintenance request number start	2026-08-11 03:39:02.764356
60	edit_approved_maintenance_request_number	edit approved maintenance request number	2026-08-11 03:39:02.764735
\.


--
-- Data for Name: pm_checklist_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_checklist_points (id, machine_id, point_text, result_type, sort_order, is_active, deactivated_at, created_at, updated_at) FROM stdin;
23	5	تم تنظيف فلتر تجميع الاغبرة من البودرة العالقة فيه جهاز Powder Feeding System.	yes_no	22	t	\N	2026-08-12 22:05:26.391405	2026-08-13 05:06:49.787
4	5	تم فحص عجلات الضغط العلوية و السفلية (عددها 4) و تنظيفها من البودرة المتراكمة عليها.	yes_no	4	f	2026-08-13 04:57:08.378	2026-08-12 21:57:01.589208	2026-08-13 04:57:08.378
19	5	تم فحص ايادي تثبيت ابواب الستانلس ستيل السفلية مع جسم الماكينة الخارجي و هي موجودة و سليمة.	yes_no	18	t	\N	2026-08-12 22:03:42.775503	2026-08-13 05:06:49.787
100	7	افحص تأريض الأجزاء المعدنية (جسم الماكينة; الدكت والباب).	text	33	t	\N	2026-08-17 00:34:29.508959	2026-08-17 07:34:59.497
1	5	تم فحص الكامات العلوية و هي سليمة.	yes_no	1	t	\N	2026-08-12 21:55:56.639031	2026-08-13 05:06:49.786
2	5	تم تنظيف لبادات تثبيت نهاية البنشنات (Lube Felts) و إعادة تركيبها و هي سليمة	yes_no	2	t	\N	2026-08-12 21:56:27.131682	2026-08-13 05:06:49.786
3	5	تم فحص الكامات السفلية و هي سليمة	yes_no	3	t	\N	2026-08-12 21:56:49.044707	2026-08-13 05:06:49.786
5	5	تم فحص عجلات الضغط العلوية و السفلية (عددها 4) و تنظيفها من البودرة المتراكمة عليها	yes_no	4	t	\N	2026-08-12 21:57:11.522369	2026-08-13 05:06:49.786
8	5	تم فحص رنجات البنشنات السفلية (Punches Seals) و هي سليمة	yes_no	7	t	\N	2026-08-12 21:58:07.341275	2026-08-13 05:06:49.786
9	5	تم فحص سطح الماكينة الحامل للدايز (Die Plate Contact Surface) و هي سليمة و لا يوجد بها أي خدوش	yes_no	8	t	\N	2026-08-12 21:58:26.826146	2026-08-13 05:06:49.786
10	5	تم فحص مستوى الزيت في التنك و هو بالمستوى المطلوب (زيت نوع Alpha SP-320) (Alpha SP-320/Zn-320).	yes_no	9	t	\N	2026-08-12 21:58:54.620646	2026-08-13 05:06:49.786
7	5	تم فحص لكمات مانعة سقوط البنشنات السفلية (Punch Retaining) و هي سليمة	yes_no	6	t	\N	2026-08-12 21:57:47.248242	2026-08-13 05:06:49.786
11	5	تم فحص جميع انابيب الزيت و هي سليمة	yes_no	10	t	\N	2026-08-12 21:59:49.827108	2026-08-13 05:06:49.786
6	5	تم تزييت السطح الخارجي لعجلات الضغط العلوية و السفلية للماكينة بواسطة زيت نوع (OPTIMOL 1500 Spray)	yes_no	5	t	\N	2026-08-12 21:57:24.23071	2026-08-13 05:06:49.786
12	5	تم التأكد ان جميع نقاط التزييت الموجودة في الماكينة (عددها 2) تعطي زيت للاماكن المخصصة لتزييتها.	yes_no	11	t	\N	2026-08-12 22:00:12.904023	2026-08-13 05:06:49.786
13	5	تم فحص فراشات التعبئة (Filling Wheels) لوحدة Force Feeder و هي سليمة	yes_no	12	t	\N	2026-08-12 22:00:27.778553	2026-08-13 05:06:49.786
15	5	تم تشحيم مسننات نقل الحركة و تنظيف الشحمة القديمة عنها	yes_no	14	t	\N	2026-08-12 22:00:48.960625	2026-08-13 05:06:49.786
16	5	تم فحص بوابة التحكم و التوجيه لحبات الحبوب (الجيدة و الرديئة) و هي سليمة	yes_no	15	t	\N	2026-08-12 22:01:02.212746	2026-08-13 05:06:49.786
14	5	تم فحص مسننات نقل الحركة لوحدة Force Feeder و هي سليمة	yes_no	13	t	\N	2026-08-12 22:00:36.784115	2026-08-13 05:06:49.786
18	5	تم فحص كسكيتات الابواب البلاستيكية العلوية و هي سليمة	yes_no	17	t	\N	2026-08-12 22:01:36.803676	2026-08-13 05:06:49.787
22	5	تم تنظيف جهاز Metal Detector و هو سليم و تم فحصه عن طريق تمرير القطع المعدنية وهو يعمل بشكل جيد.	yes_no	21	t	\N	2026-08-12 22:04:28.494113	2026-08-13 05:06:49.787
17	5	تم فحص الابواب البلاستيكية العلوية و هي سليمة.	yes_no	16	t	\N	2026-08-12 22:01:16.694751	2026-08-13 05:06:49.787
101	7	القطع التي تم استبدالها خلال أعمال الصيانة.	text	34	t	\N	2026-08-17 00:34:44.890541	2026-08-17 07:34:59.497
20	5	تم تنظيف حوض تجميع الأتربة الخاصة بجهاز Tablet Deduster.	yes_no	19	t	\N	2026-08-12 22:03:56.259051	2026-08-13 05:06:49.787
70	7	افحص ساعات الضغط على خطوط المياه، وتأكد من سلامة الساعة وزجاجتها.	text	7	t	\N	2026-08-16 22:55:43.418707	2026-08-17 07:34:59.497
71	7	قم بعمل (Zero Test) لساعات قياس الضغط لخطوط المياه.	text	8	t	\N	2026-08-16 22:56:22.668446	2026-08-17 07:34:59.497
72	7	قم بفحص ساعات الحرارة على خطوط المياه، وتأكد من عدم كسرها وسلامة التدريج.	text	9	t	\N	2026-08-16 22:56:39.170261	2026-08-17 07:34:59.497
73	7	افحص مرابط أبواب الماكينة، وأن إغلاقها يتم بشكل جيد.	text	10	t	\N	2026-08-16 22:56:52.622951	2026-08-17 07:34:59.497
74	7	تأكد من عدم وجود "صوت إزعاج" صادر من الماكينة	text	11	t	\N	2026-08-16 22:57:17.627008	2026-08-17 07:34:59.497
75	7	تأكد أن لون السائل داخل U tube Manometer أحمر ولا يوجد به تقطيع	text	12	t	\N	2026-08-16 22:58:16.427709	2026-08-17 07:34:59.497
76	7	تأكد أن أجهزة U tube Manometer معايرة	text	13	t	\N	2026-08-16 22:58:25.834436	2026-08-17 07:34:59.497
79	7	قم بالتأكد من سلامة الأنابيب 6 ملم الخاصة بالمانوميتر، وأنها عمودية مع مجرى الهواء.	text	16	t	\N	2026-08-16 22:59:51.448657	2026-08-17 07:34:59.497
94	7	قم بفحص أشرطة نقل الحركة من الماتور إلى المروحة وتأكد من عدم وجود اهتراء بالقشاط، وأنه مشدود جيداً وكذلك من استقامة بكرتي نقل الحركة.	yes_no	31	f	2026-08-17 07:31:05.037	2026-08-17 00:30:53.823857	2026-08-17 07:31:05.037
81	7	ضع لافتة - لا تشغل الجهاز تحت الصيانة.	text	18	t	\N	2026-08-16 23:00:28.893701	2026-08-17 07:34:59.497
43	6	تم فحص شد جنزير التوقيت D72 (timing) وهو بحالة جيدة	yes_no	14	t	\N	2026-08-13 00:08:50.821961	2026-08-13 07:15:51.524
40	6	تم تشحيم مسنن نقل الحركة C46	yes_no	11	t	\N	2026-08-13 00:07:50.457287	2026-08-13 07:15:51.524
42	6	تم فحص الجلدة المانعة للغبار C66	yes_no	13	t	\N	2026-08-13 00:08:28.88404	2026-08-13 07:15:51.524
45	6	تم فحص الكامات والدليل الذي يسير على هذه الكامات E75 وهو بحالة جيدة	yes_no	16	t	\N	2026-08-13 00:10:09.03163	2026-08-13 07:15:51.524
44	6	تم فحص قابض نقل الحركة D73 وهو بحالة جيدة	yes_no	15	t	\N	2026-08-13 00:09:07.569833	2026-08-13 07:15:51.524
47	6	تم تشحيم أعمدة نقل الحركة C45	yes_no	18	t	\N	2026-08-13 00:10:41.150196	2026-08-13 07:15:51.524
46	6	تم تشحيم عجلات نقل الحركة C44	yes_no	17	t	\N	2026-08-13 00:10:21.847869	2026-08-13 07:15:51.524
48	6	تم فحص جميع وصلات الهواء المضغوط B65 وهي بحالة جيدة	yes_no	19	t	\N	2026-08-13 00:10:53.644274	2026-08-13 07:15:51.524
50	6	تم فحص pre- fit ring والتأكد من تركيبها وهي مركبة كما يجب	yes_no	21	t	\N	2026-08-13 00:11:51.992736	2026-08-13 07:15:51.524
82	7	قم بقطع التيار الكهربائي من لوحة التحكم ومن اللوحة الرئيسية.	text	19	t	\N	2026-08-16 23:00:40.810806	2026-08-17 07:34:59.497
85	7	افحص عازلية ملفات الماتور	text	22	t	\N	2026-08-16 23:02:07.834272	2026-08-17 07:34:59.497
102	7	الإجراء المتخذ في حال وجد خطأ / انحراف.	text	35	t	\N	2026-08-17 00:34:59.509268	2026-08-17 00:34:59.509268
64	7	سجل قيمة الهيرتز (Hz) الذي تعمل عليه ماكينة معالجة الهواء.	text	1	t	\N	2026-08-16 22:53:18.947561	2026-08-17 07:34:59.497
67	7	تأكد أن الـ Damper مفتوح بنسبة مساوية للعلامة على AHU.	text	4	t	\N	2026-08-16 22:54:37.93487	2026-08-17 07:34:59.497
68	7	افحص عمل محرك خلط الهواء (Mixing air damper)	text	5	t	\N	2026-08-16 22:54:51.131052	2026-08-17 07:34:59.497
69	7	تفقد الوصلات المرنة (Flexible connections) على خطي الدافع والراجع.	text	6	t	\N	2026-08-16 22:55:10.850843	2026-08-17 07:34:59.497
21	5	تم فحص البراغي (عددها 4) المثبتة للمجرى الحلزوني لجهاز Tablet Deduster و وجدت مثبتة بإحكام.	yes_no	20	t	\N	2026-08-12 22:04:10.480945	2026-08-13 05:06:49.787
49	6	تم فحص مركزيه loading vee والتأكد من عدم ارتباطها مع pre- fit ring	yes_no	20	t	\N	2026-08-13 00:11:40.506641	2026-08-13 07:15:51.524
78	7	قم بعمل (Zero Test) لأجهزة U tube Manometer	text	15	t	\N	2026-08-16 22:59:31.963916	2026-08-17 07:34:59.497
80	7	قم بإيقاف تشغيل الماكينة ثم قطع الكهرباء عنها.	text	17	t	\N	2026-08-16 23:00:18.859623	2026-08-17 07:34:59.497
51	6	تم تنظيف الأعمدة وجميع القطع التي تلامس المستحضر او القريبة منه وتعقيمها بالكحول	yes_no	22	t	\N	2026-08-13 00:12:06.587856	2026-08-13 07:15:51.524
58	6	تم فحص كفاءة القابض الخاص بالفيدر (universal feeder) وهو بحالة جيدة (صورة رقم 8)	yes_no	29	t	\N	2026-08-13 00:14:20.196287	2026-08-13 07:15:51.524
24	5	تم فحص أنابيب شفط الاغبرة لجهاز Powder Feeding System و هي سليمة.	yes_no	23	t	\N	2026-08-12 22:05:44.90701	2026-08-13 05:06:49.787
25	5	تم فحص الكوابل الكهربائية الخاصة بجهاز Powder Feeding System و وجدت سليمة.	yes_no	24	t	\N	2026-08-12 22:06:04.040147	2026-08-13 05:06:49.787
26	5	تم فحص الكوابل الكهربائية الخاصة بجهاز Dust Collector و وجدت سليمة.	yes_no	25	t	\N	2026-08-12 22:06:16.136248	2026-08-13 05:06:49.787
27	5	تم تنظيف الفلتر الخاصة بجهاز Dust Collector و جد سليمة من اي ثقوب او تمزق.	yes_no	26	t	\N	2026-08-12 22:06:26.305362	2026-08-13 05:06:49.787
28	5	تم تسجيل نشاطات الصيانة المنجزة في سجل الماكينة (LOG-00-0014) الموجود في القسم.	yes_no	27	t	\N	2026-08-12 22:06:40.000512	2026-08-13 05:06:49.787
29	5	القطع التي تم استبدالها خلال اعمال الصيانة.	yes_no	28	t	\N	2026-08-12 22:06:49.793346	2026-08-12 22:06:49.793346
53	6	تم تشحيم أعمدة نقل الحركة C45 ص9	yes_no	24	t	\N	2026-08-13 00:12:24.066421	2026-08-13 07:15:51.524
60	6	تم فحص وصلات الهواء المضغوط وهي بحالة جيدة ولا يوجد أي تسريب	yes_no	31	t	\N	2026-08-13 00:14:45.626542	2026-08-13 07:15:51.524
65	7	من المؤقت (Timer) سجل زمن بدء عمل الماكينة.	text	2	t	\N	2026-08-16 22:53:30.548732	2026-08-17 07:34:59.497
54	6	تم فحص براغي التثبيت لفك الطوي الأول والثاني + فك الطباعة وهي بحالة جيده	yes_no	25	t	\N	2026-08-13 00:13:17.938427	2026-08-13 07:15:51.524
30	6	تم فحص كابل الكهرباء المغذي للماكينة وهو بحالة جيدة	yes_no	1	t	\N	2026-08-13 00:05:28.339788	2026-08-13 07:15:51.524
52	6	تم تشحيم عجلة نقل الحركة C44 ص 9	yes_no	23	t	\N	2026-08-13 00:12:16.23066	2026-08-13 07:15:51.524
55	6	تم فحص الكامات + الدليل الخاص بها E75 ص9 وهي بحالة جيده	yes_no	26	t	\N	2026-08-13 00:13:32.570821	2026-08-13 07:15:51.524
31	6	تم فحص بربيج الماء الواصل بين وحدة التسخين والجاكيت الخاص بتنك المستحضر وهو بحالة جيدة	yes_no	2	t	\N	2026-08-13 00:05:45.39041	2026-08-13 07:15:51.524
66	7	من المؤقت (Timer) سجل زمن نهاية عمل الماكينة.	text	3	t	\N	2026-08-16 22:54:05.694959	2026-08-17 07:34:59.497
33	6	تم فحص عازلية ومقاومة ملفات جميع ماتورات الماكنة وعددها 4 وهي بحالة جيدة	yes_no	4	t	\N	2026-08-13 00:06:44.535447	2026-08-13 07:15:51.524
56	6	تم فحص شد الجنزير صوره (رقم 8,9) الخاص بالفيدر (universal feeder) وتم تشحيمه وهو بحالة جيده	yes_no	27	t	\N	2026-08-13 00:13:48.442674	2026-08-13 07:15:51.524
57	6	تم فحص شفرات الناقل الخاص بالفيدر (universal feeder) وهي بحالة جيدة صوره (رقم 10, 11)	yes_no	28	t	\N	2026-08-13 00:14:02.072206	2026-08-13 07:15:51.524
59	6	تم فحص أبواب الفيدر وهي بحالة جيده	yes_no	30	t	\N	2026-08-13 00:14:35.544614	2026-08-13 07:15:51.524
62	6	افحص بستون التحكم في التعبئه R329274 والبستون رقم C211131 وجميع الجلد الخاصه بهما وخاصة الجلده رقم R455967 والجلده و C174031 والجلد رقم C280028 وقم باستبدالها اذا كانت معطوبه او مقطوعه (انظر الصوره رقم 14)	yes_no	33	t	\N	2026-08-13 00:15:43.688151	2026-08-13 07:15:51.524
61	6	تم تسجيل نشاطات الصيانة المنجزة في سجل الماكينة (LOG-00-0014) الموجود في القسم.	yes_no	32	t	\N	2026-08-13 00:14:54.484735	2026-08-13 07:15:51.524
63	6	القطع التي تم استبدالها خلال اعمال الصيانة.	yes_no	34	t	\N	2026-08-13 00:15:51.53231	2026-08-13 00:15:51.53231
32	6	تم فحص زنبركات الارجاع لفكات طي الأنبوب.	yes_no	3	t	\N	2026-08-13 00:06:28.030495	2026-08-13 07:15:51.524
34	6	تم تنظيف فلتر شفاط تنظيف الأنابيب وهو بحالة جيدة	yes_no	5	t	\N	2026-08-13 00:06:55.158765	2026-08-13 07:15:51.524
39	6	تم تشحيم الدليل له عمود نقل الحركة C45	yes_no	10	t	\N	2026-08-13 00:07:43.262443	2026-08-13 07:15:51.524
36	6	تم تزييت القطع المؤشر عليها بالرقم C42	yes_no	7	t	\N	2026-08-13 00:07:18.312896	2026-08-13 07:15:51.524
37	6	تم تزييت القطع المؤشر عليها بالرقم C43	yes_no	8	t	\N	2026-08-13 00:07:26.030931	2026-08-13 07:15:51.524
38	6	تم تشحيم عجلة نقل الحركة C44	yes_no	9	t	\N	2026-08-13 00:07:32.766628	2026-08-13 07:15:51.524
35	6	تم فحص فلتر الهواء المضغوط وتغييره اذا حان موعد التغيير وهو بحالة جيدة	yes_no	6	t	\N	2026-08-13 00:07:10.433466	2026-08-13 07:15:51.524
41	6	تم فحص المسنن الحلزوني C63 وهو بحالة جيدة	yes_no	12	t	\N	2026-08-13 00:08:00.080699	2026-08-13 07:15:51.524
77	7	تأكد أن القراءات على أجهزة U tube Manometer واضحة	text	14	t	\N	2026-08-16 22:59:17.073285	2026-08-17 07:34:59.497
84	7	افحص أقشطة نقل الحركة بين الماتور والمروحة، واستقامة بكرتي نقل الحركة.	text	21	t	\N	2026-08-16 23:01:49.715709	2026-08-17 07:34:59.497
86	7	نظف الماكينة من الداخل من كل الحجرات وكذلك ملف التبريد والتدفئة بالماء والصابون وقم بالتجفيف بفوطة جافة.	text	23	t	\N	2026-08-16 23:02:28.146161	2026-08-17 07:34:59.497
83	7	افحص حالة الكوابل الكهربائية، من ناحية جودة العازل، وإحكام وصل الكابل مع قاطع الماكينة الرئيسي.	text	20	t	\N	2026-08-16 23:00:57.523275	2026-08-17 07:34:59.497
98	7	قم بفحص أقشطة نقل الحركة من الماتور إلى المروحة وتأكد من عدم وجود اهتراء بالقشاط، وأنه مشدود جيداً وكذلك من إستقامة بكرتي نقل الحركة.	text	31	t	\N	2026-08-17 00:33:57.061842	2026-08-17 07:34:59.497
95	7	قم بفحص أقشطة نقل الحركة من الماتور إلى المروحة وتأكد من عدم وجود اهتراء بالقشاط، وأنه مشدود جيداً وكذلك من إستقامة بكرتي نقل الحركة.	yes_no	31	f	2026-08-17 07:33:41.305	2026-08-17 00:31:49.341483	2026-08-17 07:33:41.305
99	7	افحص إنارة الماكينة من الداخل وتأكد أنها بحالة جيدة.	text	32	t	\N	2026-08-17 00:34:19.09001	2026-08-17 07:34:59.497
97	7	افحص تأريض الأجزاء المعدنية (جسم الماكينة; الدكت والباب).	yes_no	33	f	2026-08-17 07:33:38.979	2026-08-17 00:33:19.392264	2026-08-17 07:33:38.979
96	7	افحص إنارة الماكينة من الداخل وتأكد أنها بحالة جيدة.	yes_no	32	f	2026-08-17 07:33:39.843	2026-08-17 00:32:04.705557	2026-08-17 07:33:39.843
87	7	في حال الماكينات الخاصة بالأقسام المعقمة، قم بمسح الأجزاء الداخلية بأيزوبروبل الكحول 70%	text	24	t	\N	2026-08-16 23:02:54.100389	2026-08-17 07:34:59.497
88	7	نظف الماكينة من الخارج.	text	25	t	\N	2026-08-16 23:03:05.366958	2026-08-17 07:34:59.497
89	7	تفقد خطوط المياه الدافع والراجع والملفات وتأكد من عدم وجود تسريب.	text	26	t	\N	2026-08-16 23:22:16.478318	2026-08-17 07:34:59.497
90	7	نظف مصافي خطوط المياه (Strainers)، وتأكد من ضغط الشبكة.	text	27	t	\N	2026-08-16 23:22:36.342733	2026-08-17 07:34:59.497
91	7	تأكد من نظافة السيفون الخاص بتصريف مياه التكثيف, ووجود الزيت به صيفاً.	text	28	t	\N	2026-08-16 23:23:00.563068	2026-08-17 07:34:59.497
92	7	أعد توصيل التيار الكهربائي, وأعد تشغيل الماكينة.	text	29	t	\N	2026-08-16 23:23:24.238526	2026-08-17 07:34:59.497
93	7	قم بفحص مروحة دفع الهواء من حيث عدم صدور صوت من بيلها وأنها تدور بشكل جيد وقم بتشحيم هذه البيل.	text	30	t	\N	2026-08-16 23:23:42.075023	2026-08-17 07:34:59.497
\.


--
-- Data for Name: pm_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_headers (id, machine_id, procedure_form_number, effective_date, department, columns_per_record, created_at, updated_at, inspection_columns_per_print_page) FROM stdin;
2	5	LOG-10-0743-0	2024-05-12	Production	5	2026-08-12 21:51:37.792757	2026-08-13 04:55:00.395	3
3	6	LOG-10-0464-1	2020-08-15	Production	5	2026-08-13 00:02:29.769009	2026-08-13 07:04:09.4	3
4	7	LOG-10-0425-5	2022-03-09	Engineering & Maintenance	5	2026-08-16 22:51:53.175252	2026-08-17 06:24:30.895	3
\.


--
-- Data for Name: pm_inspection_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_inspection_results (id, inspection_id, checklist_point_id, value) FROM stdin;
\.


--
-- Data for Name: pm_inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_inspections (id, record_id, machine_id, column_number, inspection_date, inspection_time, action_taken, examiner_name, examiner_signature, machine_receiver_name, machine_receiver_signature, completed_by_user_id, completed_at, execution_month_year) FROM stdin;
\.


--
-- Data for Name: pm_record_checklist_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: pm_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pm_records (id, machine_id, sequence_number, previous_record_id, status, created_at, updated_at) FROM stdin;
3	6	1	\N	active	2026-08-13 00:02:29.776235	2026-08-16 22:39:24.259591
4	5	1	\N	active	2026-08-13 00:41:52.926097	2026-08-16 22:39:24.259591
5	7	1	\N	active	2026-08-16 22:51:53.178171	2026-08-16 22:51:53.178171
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, created_at) FROM stdin;
1	Admin	Full system access	2026-07-17 23:23:27.470268
2	Engineering Manager	\N	2026-08-11 02:37:14.679461
4	Maintenance Technician	Executes and records maintenance work	2026-08-11 03:39:02.726628
6	QA Supervisor	Reviews submitted maintenance requests	2026-08-11 03:39:02.728194
7	Production Manager	Production management approval	2026-08-11 03:39:02.729237
8	Production Engineer	Engineering support for production equipment and processes	2026-08-11 03:39:02.729798
9	Production Employee	Production department employee	2026-08-11 03:39:02.730323
15	QC Manager	QC management approval	2026-08-11 03:39:02.73365
16	R&D Manager	R&D management approval	2026-08-11 03:39:02.734062
17	QA Manager	QA management approval	2026-08-11 03:39:02.734493
18	Water and HVAC system supervisor	\N	2026-08-11 04:30:17.628133
19	Maintenance Supervisor	\N	2026-08-11 04:35:18.890069
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (sid, sess, expire) FROM stdin;
UngTkv8QZnuaCNGwigAzcSh6PMCm8zmW	{"cookie":{"originalMaxAge":86400000,"expires":"2026-08-18T05:36:04.861Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1,"roleId":1,"roleName":"Admin","permissions":["view_dashboard","view_dashboard_notifications","view_dashboard_machines","view_dashboard_users","view_dashboard_departments","view_dashboard_preventive_maintenance","view_dashboard_maintenance_requests","view_dashboard_corrective_maintenance","view_dashboard_spare_parts","view_reports","edit_reports","manage_users","view_machines","create_machine","edit_machine","soft_delete_machine","view_equipment_information","view_machine_maintenance_history","edit_equipment_information","manage_pm_checklist","fill_pm_record","edit_pm_inspection","delete_pm_inspection","view_pm_records","view_maintenance_plans","edit_maintenance_plans","edit_monthly_pm_plan_rows","view_annual_maintenance_plan","edit_annual_maintenance_plan","view_monthly_maintenance_plan","edit_monthly_maintenance_plan","delete_monthly_pm_plan_rows","submit_maintenance_request","review_department_requests","view_own_requests","qa_review_requests","engineering_review_requests","assign_technician","fill_preliminary_findings","fill_corrective_maintenance","edit_corrective_maintenance","delete_corrective_maintenance","view_corrective_maintenance","manage_maintenance_requests","view_external_maintenance","edit_external_maintenance","view_spare_parts","manage_spare_parts","record_spare_part_usage","adjust_spare_parts","edit_header","print_forms","manage_signatures","sign_assigned_fields","review_qa_requests","review_engineering_requests","archive_maintenance_requests","edit_closed_corrective_maintenance_log","set_maintenance_request_number_start","edit_approved_maintenance_request_number"]}	2026-08-18 02:10:51
\.


--
-- Data for Name: signature_field_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signature_field_permissions (id, document_type, field_name, eligible_user_id, granted_by, granted_at, revoked_at) FROM stdin;
1	MAINTENANCE_REQUEST	engineering_final	2	1	2026-08-11 04:30:57.334402	\N
2	EQUIPMENT_INFORMATION	approved_by	2	1	2026-08-11 04:31:28.745772	\N
3	MONTHLY_PLAN	department_manager	2	1	2026-08-11 04:31:34.890022	\N
4	MONTHLY_MAINTENANCE_EVALUATION	engineering_manager	2	1	2026-08-11 04:31:47.394274	\N
5	ANNUAL_PLAN	engineering_manager	2	1	2026-08-11 04:31:52.955026	\N
6	MAINTENANCE_REQUEST	maintenance_technician	12	1	2026-08-11 04:38:09.761023	\N
7	MAINTENANCE_REQUEST	performing_staff	12	1	2026-08-11 04:38:16.274237	\N
8	MAINTENANCE_REQUEST	engineering_final	12	1	2026-08-11 04:38:20.24892	\N
9	PM_RECORD	examiner	12	1	2026-08-11 04:38:33.600864	\N
10	EQUIPMENT_INFORMATION	prepared_by	12	1	2026-08-11 04:38:42.689591	\N
11	EQUIPMENT_INFORMATION	approved_by	12	1	2026-08-11 04:38:45.397526	\N
12	MONTHLY_PLAN	prepared_by	12	1	2026-08-11 04:38:53.985736	\N
13	MONTHLY_PLAN	maintenance_supervisor	12	1	2026-08-11 04:38:56.577784	\N
14	MONTHLY_MAINTENANCE_EVALUATION	prepared_by	12	1	2026-08-11 04:39:02.817982	\N
15	ANNUAL_PLAN	prepared_by	12	1	2026-08-11 04:39:08.032458	\N
16	MAINTENANCE_REQUEST	maintenance_technician	14	1	2026-08-12 03:10:07.623007	\N
17	MAINTENANCE_REQUEST	performing_staff	14	1	2026-08-12 03:10:12.495167	\N
18	MAINTENANCE_REQUEST	engineering_final	14	1	2026-08-12 03:10:16.238128	\N
19	PM_RECORD	examiner	14	1	2026-08-12 03:10:29.270255	\N
20	EQUIPMENT_INFORMATION	prepared_by	14	1	2026-08-12 03:10:41.742068	\N
21	MAINTENANCE_REQUEST	maintenance_technician	15	1	2026-08-12 03:11:01.204127	\N
22	MAINTENANCE_REQUEST	performing_staff	15	1	2026-08-12 03:11:05.208115	\N
23	MAINTENANCE_REQUEST	engineering_final	15	1	2026-08-12 03:11:07.998411	\N
24	PM_RECORD	examiner	15	1	2026-08-12 03:11:10.718551	\N
25	EQUIPMENT_INFORMATION	prepared_by	15	1	2026-08-12 03:11:15.918106	\N
26	MAINTENANCE_REQUEST	reporting_person	13	1	2026-08-12 03:11:40.07115	\N
27	MAINTENANCE_REQUEST	department_supervisor	13	1	2026-08-12 03:11:47.765599	\N
28	MAINTENANCE_REQUEST	concerned_section_supervisor	13	1	2026-08-12 03:11:53.010842	\N
29	MAINTENANCE_REQUEST	receiver	13	1	2026-08-12 03:11:57.254555	\N
30	PM_RECORD	machine_receiver	13	1	2026-08-12 03:12:00.7185	\N
31	MAINTENANCE_REQUEST	maintenance_technician	16	1	2026-08-12 03:17:45.422122	\N
32	MAINTENANCE_REQUEST	performing_staff	16	1	2026-08-12 03:17:49.622739	\N
33	MAINTENANCE_REQUEST	engineering_final	16	1	2026-08-12 03:17:52.359291	\N
34	PM_RECORD	examiner	16	1	2026-08-12 03:17:55.463001	\N
35	EQUIPMENT_INFORMATION	prepared_by	16	1	2026-08-12 03:18:00.991135	\N
36	EQUIPMENT_INFORMATION	prepared_by	18	1	2026-08-12 03:25:33.734624	\N
37	EQUIPMENT_INFORMATION	approved_by	18	1	2026-08-12 03:25:36.0238	\N
38	ANNUAL_PLAN	production_manager	19	1	2026-08-12 03:31:56.79142	\N
\.


--
-- Data for Name: signatures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signatures (id, document_type, document_id, field_name, signature_type, user_id, user_name, eligible_signer_assignment_id, signed_at, signature_data) FROM stdin;
\.


--
-- Data for Name: spare_part_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spare_part_movements (id, spare_part_id, movement_type, quantity, quantity_before, quantity_after, movement_date, reason, reference_type, reference_id, recorded_by_user_id, notes, created_at) FROM stdin;
\.


--
-- Data for Name: spare_parts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spare_parts (id, part_name, part_code, description, category, unit, minimum_quantity, current_quantity, location, status, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (id, user_id, permission_id, created_at) FROM stdin;
1	1	1	2026-08-11 03:39:03.228824
2	1	2	2026-08-11 03:39:03.228824
3	1	3	2026-08-11 03:39:03.228824
4	1	4	2026-08-11 03:39:03.228824
5	1	5	2026-08-11 03:39:03.228824
6	1	6	2026-08-11 03:39:03.228824
7	1	7	2026-08-11 03:39:03.228824
8	1	8	2026-08-11 03:39:03.228824
9	1	9	2026-08-11 03:39:03.228824
10	1	10	2026-08-11 03:39:03.228824
11	1	11	2026-08-11 03:39:03.228824
12	1	12	2026-08-11 03:39:03.228824
13	1	13	2026-08-11 03:39:03.228824
14	1	14	2026-08-11 03:39:03.228824
15	1	15	2026-08-11 03:39:03.228824
16	1	16	2026-08-11 03:39:03.228824
17	1	17	2026-08-11 03:39:03.228824
18	1	18	2026-08-11 03:39:03.228824
19	1	19	2026-08-11 03:39:03.228824
20	1	20	2026-08-11 03:39:03.228824
21	1	21	2026-08-11 03:39:03.228824
22	1	22	2026-08-11 03:39:03.228824
23	1	23	2026-08-11 03:39:03.228824
24	1	24	2026-08-11 03:39:03.228824
25	1	25	2026-08-11 03:39:03.228824
26	1	26	2026-08-11 03:39:03.228824
27	1	27	2026-08-11 03:39:03.228824
28	1	28	2026-08-11 03:39:03.228824
29	1	29	2026-08-11 03:39:03.228824
30	1	30	2026-08-11 03:39:03.228824
31	1	31	2026-08-11 03:39:03.228824
32	1	32	2026-08-11 03:39:03.228824
33	1	33	2026-08-11 03:39:03.228824
34	1	34	2026-08-11 03:39:03.228824
35	1	35	2026-08-11 03:39:03.228824
36	1	36	2026-08-11 03:39:03.228824
37	1	37	2026-08-11 03:39:03.228824
38	1	38	2026-08-11 03:39:03.228824
39	1	39	2026-08-11 03:39:03.228824
40	1	40	2026-08-11 03:39:03.228824
41	1	41	2026-08-11 03:39:03.228824
42	1	42	2026-08-11 03:39:03.228824
43	1	43	2026-08-11 03:39:03.228824
44	1	44	2026-08-11 03:39:03.228824
45	1	45	2026-08-11 03:39:03.228824
46	1	46	2026-08-11 03:39:03.228824
47	1	47	2026-08-11 03:39:03.228824
48	1	48	2026-08-11 03:39:03.228824
49	1	49	2026-08-11 03:39:03.228824
50	1	50	2026-08-11 03:39:03.228824
51	1	51	2026-08-11 03:39:03.228824
52	1	52	2026-08-11 03:39:03.228824
53	1	53	2026-08-11 03:39:03.228824
54	1	54	2026-08-11 03:39:03.228824
55	1	55	2026-08-11 03:39:03.228824
56	1	56	2026-08-11 03:39:03.228824
57	1	57	2026-08-11 03:39:03.228824
58	1	58	2026-08-11 03:39:03.228824
59	1	59	2026-08-11 03:39:03.228824
60	1	60	2026-08-11 03:39:03.228824
575	15	49	2026-08-12 03:09:44.990038
576	15	50	2026-08-12 03:09:44.990038
577	15	52	2026-08-12 03:09:44.990038
578	15	54	2026-08-12 03:09:44.990038
579	15	56	2026-08-12 03:09:44.990038
580	16	1	2026-08-12 03:13:31.26917
581	16	2	2026-08-12 03:13:31.26917
582	16	3	2026-08-12 03:13:31.26917
583	16	4	2026-08-12 03:13:31.26917
584	16	5	2026-08-12 03:13:31.26917
585	16	6	2026-08-12 03:13:31.26917
586	16	7	2026-08-12 03:13:31.26917
587	16	8	2026-08-12 03:13:31.26917
588	16	9	2026-08-12 03:13:31.26917
589	16	10	2026-08-12 03:13:31.26917
590	16	13	2026-08-12 03:13:31.26917
591	16	14	2026-08-12 03:13:31.26917
592	16	15	2026-08-12 03:13:31.26917
593	16	17	2026-08-12 03:13:31.26917
594	16	18	2026-08-12 03:13:31.26917
595	16	19	2026-08-12 03:13:31.26917
596	16	21	2026-08-12 03:13:31.26917
597	16	22	2026-08-12 03:13:31.26917
313	12	1	2026-08-11 04:37:48.458928
314	12	2	2026-08-11 04:37:48.458928
315	12	3	2026-08-11 04:37:48.458928
316	12	4	2026-08-11 04:37:48.458928
317	12	5	2026-08-11 04:37:48.458928
318	12	6	2026-08-11 04:37:48.458928
319	12	7	2026-08-11 04:37:48.458928
320	12	8	2026-08-11 04:37:48.458928
321	12	9	2026-08-11 04:37:48.458928
322	12	10	2026-08-11 04:37:48.458928
323	12	11	2026-08-11 04:37:48.458928
324	12	13	2026-08-11 04:37:48.458928
325	12	14	2026-08-11 04:37:48.458928
326	12	15	2026-08-11 04:37:48.458928
327	12	16	2026-08-11 04:37:48.458928
328	12	17	2026-08-11 04:37:48.458928
329	12	18	2026-08-11 04:37:48.458928
330	12	19	2026-08-11 04:37:48.458928
331	12	20	2026-08-11 04:37:48.458928
332	12	21	2026-08-11 04:37:48.458928
333	12	22	2026-08-11 04:37:48.458928
334	12	23	2026-08-11 04:37:48.458928
335	12	24	2026-08-11 04:37:48.458928
336	12	25	2026-08-11 04:37:48.458928
337	12	26	2026-08-11 04:37:48.458928
338	12	27	2026-08-11 04:37:48.458928
339	12	28	2026-08-11 04:37:48.458928
340	12	29	2026-08-11 04:37:48.458928
341	12	30	2026-08-11 04:37:48.458928
342	12	31	2026-08-11 04:37:48.458928
343	12	32	2026-08-11 04:37:48.458928
344	12	33	2026-08-11 04:37:48.458928
345	12	35	2026-08-11 04:37:48.458928
346	12	37	2026-08-11 04:37:48.458928
347	12	38	2026-08-11 04:37:48.458928
348	12	39	2026-08-11 04:37:48.458928
349	12	40	2026-08-11 04:37:48.458928
350	12	41	2026-08-11 04:37:48.458928
351	12	42	2026-08-11 04:37:48.458928
352	12	43	2026-08-11 04:37:48.458928
353	12	44	2026-08-11 04:37:48.458928
354	12	45	2026-08-11 04:37:48.458928
355	12	46	2026-08-11 04:37:48.458928
356	12	47	2026-08-11 04:37:48.458928
357	12	48	2026-08-11 04:37:48.458928
358	12	49	2026-08-11 04:37:48.458928
359	12	50	2026-08-11 04:37:48.458928
360	12	51	2026-08-11 04:37:48.458928
361	12	52	2026-08-11 04:37:48.458928
362	12	54	2026-08-11 04:37:48.458928
363	12	56	2026-08-11 04:37:48.458928
364	12	57	2026-08-11 04:37:48.458928
365	12	58	2026-08-11 04:37:48.458928
366	12	59	2026-08-11 04:37:48.458928
367	12	60	2026-08-11 04:37:48.458928
368	13	1	2026-08-11 04:46:19.212547
369	13	2	2026-08-11 04:46:19.212547
370	13	3	2026-08-11 04:46:19.212547
371	13	4	2026-08-11 04:46:19.212547
372	13	5	2026-08-11 04:46:19.212547
373	13	13	2026-08-11 04:46:19.212547
374	13	17	2026-08-11 04:46:19.212547
375	13	24	2026-08-11 04:46:19.212547
376	13	33	2026-08-11 04:46:19.212547
377	13	34	2026-08-11 04:46:19.212547
378	13	35	2026-08-11 04:46:19.212547
379	13	52	2026-08-11 04:46:19.212547
380	13	54	2026-08-11 04:46:19.212547
470	14	1	2026-08-11 23:04:31.312252
471	14	2	2026-08-11 23:04:31.312252
472	14	3	2026-08-11 23:04:31.312252
473	14	4	2026-08-11 23:04:31.312252
474	14	5	2026-08-11 23:04:31.312252
475	14	6	2026-08-11 23:04:31.312252
476	14	7	2026-08-11 23:04:31.312252
477	14	8	2026-08-11 23:04:31.312252
478	14	9	2026-08-11 23:04:31.312252
479	14	10	2026-08-11 23:04:31.312252
480	14	13	2026-08-11 23:04:31.312252
481	14	14	2026-08-11 23:04:31.312252
482	14	15	2026-08-11 23:04:31.312252
483	14	17	2026-08-11 23:04:31.312252
484	14	18	2026-08-11 23:04:31.312252
485	14	19	2026-08-11 23:04:31.312252
486	14	21	2026-08-11 23:04:31.312252
487	14	22	2026-08-11 23:04:31.312252
488	14	24	2026-08-11 23:04:31.312252
489	14	25	2026-08-11 23:04:31.312252
490	14	28	2026-08-11 23:04:31.312252
491	14	30	2026-08-11 23:04:31.312252
492	14	33	2026-08-11 23:04:31.312252
493	14	35	2026-08-11 23:04:31.312252
494	14	37	2026-08-11 23:04:31.312252
495	14	38	2026-08-11 23:04:31.312252
496	14	39	2026-08-11 23:04:31.312252
497	14	40	2026-08-11 23:04:31.312252
498	14	41	2026-08-11 23:04:31.312252
499	14	43	2026-08-11 23:04:31.312252
500	14	45	2026-08-11 23:04:31.312252
501	14	46	2026-08-11 23:04:31.312252
502	14	47	2026-08-11 23:04:31.312252
503	14	48	2026-08-11 23:04:31.312252
504	14	49	2026-08-11 23:04:31.312252
505	14	50	2026-08-11 23:04:31.312252
506	14	52	2026-08-11 23:04:31.312252
507	14	54	2026-08-11 23:04:31.312252
508	14	56	2026-08-11 23:04:31.312252
540	15	1	2026-08-12 03:09:44.990038
541	15	2	2026-08-12 03:09:44.990038
542	15	3	2026-08-12 03:09:44.990038
543	15	4	2026-08-12 03:09:44.990038
544	15	5	2026-08-12 03:09:44.990038
545	15	6	2026-08-12 03:09:44.990038
546	15	7	2026-08-12 03:09:44.990038
547	15	8	2026-08-12 03:09:44.990038
548	15	9	2026-08-12 03:09:44.990038
549	15	10	2026-08-12 03:09:44.990038
550	15	13	2026-08-12 03:09:44.990038
551	15	14	2026-08-12 03:09:44.990038
552	15	15	2026-08-12 03:09:44.990038
553	15	17	2026-08-12 03:09:44.990038
554	15	18	2026-08-12 03:09:44.990038
555	15	19	2026-08-12 03:09:44.990038
556	15	21	2026-08-12 03:09:44.990038
557	15	22	2026-08-12 03:09:44.990038
558	15	24	2026-08-12 03:09:44.990038
559	15	25	2026-08-12 03:09:44.990038
560	15	28	2026-08-12 03:09:44.990038
561	15	30	2026-08-12 03:09:44.990038
562	15	33	2026-08-12 03:09:44.990038
563	15	35	2026-08-12 03:09:44.990038
564	15	37	2026-08-12 03:09:44.990038
565	15	38	2026-08-12 03:09:44.990038
566	15	39	2026-08-12 03:09:44.990038
567	15	40	2026-08-12 03:09:44.990038
568	15	41	2026-08-12 03:09:44.990038
569	15	43	2026-08-12 03:09:44.990038
570	15	44	2026-08-12 03:09:44.990038
571	15	45	2026-08-12 03:09:44.990038
572	15	46	2026-08-12 03:09:44.990038
573	15	47	2026-08-12 03:09:44.990038
574	15	48	2026-08-12 03:09:44.990038
598	16	24	2026-08-12 03:13:31.26917
599	16	25	2026-08-12 03:13:31.26917
600	16	28	2026-08-12 03:13:31.26917
601	16	30	2026-08-12 03:13:31.26917
602	16	33	2026-08-12 03:13:31.26917
603	16	35	2026-08-12 03:13:31.26917
604	16	37	2026-08-12 03:13:31.26917
605	16	38	2026-08-12 03:13:31.26917
606	16	39	2026-08-12 03:13:31.26917
607	16	40	2026-08-12 03:13:31.26917
608	16	41	2026-08-12 03:13:31.26917
609	16	43	2026-08-12 03:13:31.26917
610	16	45	2026-08-12 03:13:31.26917
611	16	46	2026-08-12 03:13:31.26917
612	16	47	2026-08-12 03:13:31.26917
613	16	48	2026-08-12 03:13:31.26917
614	16	49	2026-08-12 03:13:31.26917
615	16	50	2026-08-12 03:13:31.26917
616	16	52	2026-08-12 03:13:31.26917
617	16	54	2026-08-12 03:13:31.26917
618	16	56	2026-08-12 03:13:31.26917
619	17	1	2026-08-12 03:13:31.26917
620	17	2	2026-08-12 03:13:31.26917
621	17	3	2026-08-12 03:13:31.26917
622	17	4	2026-08-12 03:13:31.26917
623	17	5	2026-08-12 03:13:31.26917
624	17	6	2026-08-12 03:13:31.26917
625	17	7	2026-08-12 03:13:31.26917
626	17	8	2026-08-12 03:13:31.26917
627	17	9	2026-08-12 03:13:31.26917
628	17	10	2026-08-12 03:13:31.26917
629	17	13	2026-08-12 03:13:31.26917
630	17	14	2026-08-12 03:13:31.26917
631	17	15	2026-08-12 03:13:31.26917
632	17	17	2026-08-12 03:13:31.26917
633	17	18	2026-08-12 03:13:31.26917
634	17	19	2026-08-12 03:13:31.26917
635	17	21	2026-08-12 03:13:31.26917
636	17	22	2026-08-12 03:13:31.26917
637	17	24	2026-08-12 03:13:31.26917
638	17	25	2026-08-12 03:13:31.26917
639	17	28	2026-08-12 03:13:31.26917
640	17	30	2026-08-12 03:13:31.26917
641	17	33	2026-08-12 03:13:31.26917
642	17	35	2026-08-12 03:13:31.26917
643	17	37	2026-08-12 03:13:31.26917
644	17	38	2026-08-12 03:13:31.26917
645	17	39	2026-08-12 03:13:31.26917
646	17	40	2026-08-12 03:13:31.26917
647	17	41	2026-08-12 03:13:31.26917
648	17	43	2026-08-12 03:13:31.26917
649	17	45	2026-08-12 03:13:31.26917
650	17	46	2026-08-12 03:13:31.26917
651	17	47	2026-08-12 03:13:31.26917
652	17	48	2026-08-12 03:13:31.26917
653	17	49	2026-08-12 03:13:31.26917
654	17	50	2026-08-12 03:13:31.26917
655	17	52	2026-08-12 03:13:31.26917
656	17	54	2026-08-12 03:13:31.26917
657	17	56	2026-08-12 03:13:31.26917
658	18	1	2026-08-12 03:25:16.12835
659	18	2	2026-08-12 03:25:16.12835
660	18	3	2026-08-12 03:25:16.12835
661	18	5	2026-08-12 03:25:16.12835
662	18	6	2026-08-12 03:25:16.12835
663	18	7	2026-08-12 03:25:16.12835
664	18	8	2026-08-12 03:25:16.12835
665	18	9	2026-08-12 03:25:16.12835
666	18	10	2026-08-12 03:25:16.12835
667	18	13	2026-08-12 03:25:16.12835
668	18	14	2026-08-12 03:25:16.12835
669	18	15	2026-08-12 03:25:16.12835
670	18	17	2026-08-12 03:25:16.12835
671	18	18	2026-08-12 03:25:16.12835
672	18	19	2026-08-12 03:25:16.12835
673	18	24	2026-08-12 03:25:16.12835
674	18	25	2026-08-12 03:25:16.12835
675	18	28	2026-08-12 03:25:16.12835
676	18	30	2026-08-12 03:25:16.12835
677	18	33	2026-08-12 03:25:16.12835
678	18	34	2026-08-12 03:25:16.12835
679	18	35	2026-08-12 03:25:16.12835
680	18	43	2026-08-12 03:25:16.12835
681	18	45	2026-08-12 03:25:16.12835
682	18	47	2026-08-12 03:25:16.12835
683	18	48	2026-08-12 03:25:16.12835
684	18	49	2026-08-12 03:25:16.12835
685	18	50	2026-08-12 03:25:16.12835
686	18	52	2026-08-12 03:25:16.12835
687	18	54	2026-08-12 03:25:16.12835
713	19	1	2026-08-12 03:31:37.653862
714	19	2	2026-08-12 03:31:37.653862
715	19	3	2026-08-12 03:31:37.653862
716	19	4	2026-08-12 03:31:37.653862
717	19	5	2026-08-12 03:31:37.653862
718	19	13	2026-08-12 03:31:37.653862
719	19	25	2026-08-12 03:31:37.653862
720	19	28	2026-08-12 03:31:37.653862
721	19	30	2026-08-12 03:31:37.653862
722	19	33	2026-08-12 03:31:37.653862
723	19	34	2026-08-12 03:31:37.653862
724	19	35	2026-08-12 03:31:37.653862
725	19	52	2026-08-12 03:31:37.653862
726	19	54	2026-08-12 03:31:37.653862
736	2	1	2026-08-13 00:36:23.32913
737	2	2	2026-08-13 00:36:23.32913
738	2	3	2026-08-13 00:36:23.32913
739	2	4	2026-08-13 00:36:23.32913
740	2	5	2026-08-13 00:36:23.32913
741	2	6	2026-08-13 00:36:23.32913
742	2	7	2026-08-13 00:36:23.32913
743	2	8	2026-08-13 00:36:23.32913
744	2	9	2026-08-13 00:36:23.32913
745	2	10	2026-08-13 00:36:23.32913
746	2	11	2026-08-13 00:36:23.32913
747	2	13	2026-08-13 00:36:23.32913
748	2	14	2026-08-13 00:36:23.32913
749	2	15	2026-08-13 00:36:23.32913
750	2	16	2026-08-13 00:36:23.32913
751	2	17	2026-08-13 00:36:23.32913
752	2	18	2026-08-13 00:36:23.32913
753	2	19	2026-08-13 00:36:23.32913
754	2	20	2026-08-13 00:36:23.32913
755	2	21	2026-08-13 00:36:23.32913
756	2	22	2026-08-13 00:36:23.32913
757	2	23	2026-08-13 00:36:23.32913
758	2	24	2026-08-13 00:36:23.32913
759	2	25	2026-08-13 00:36:23.32913
760	2	26	2026-08-13 00:36:23.32913
761	2	27	2026-08-13 00:36:23.32913
762	2	28	2026-08-13 00:36:23.32913
763	2	29	2026-08-13 00:36:23.32913
764	2	30	2026-08-13 00:36:23.32913
765	2	31	2026-08-13 00:36:23.32913
766	2	32	2026-08-13 00:36:23.32913
767	2	33	2026-08-13 00:36:23.32913
768	2	35	2026-08-13 00:36:23.32913
769	2	37	2026-08-13 00:36:23.32913
770	2	39	2026-08-13 00:36:23.32913
771	2	40	2026-08-13 00:36:23.32913
772	2	41	2026-08-13 00:36:23.32913
773	2	42	2026-08-13 00:36:23.32913
774	2	43	2026-08-13 00:36:23.32913
775	2	44	2026-08-13 00:36:23.32913
776	2	45	2026-08-13 00:36:23.32913
777	2	46	2026-08-13 00:36:23.32913
778	2	47	2026-08-13 00:36:23.32913
779	2	48	2026-08-13 00:36:23.32913
780	2	49	2026-08-13 00:36:23.32913
781	2	50	2026-08-13 00:36:23.32913
782	2	52	2026-08-13 00:36:23.32913
783	2	54	2026-08-13 00:36:23.32913
784	2	56	2026-08-13 00:36:23.32913
785	2	57	2026-08-13 00:36:23.32913
786	2	58	2026-08-13 00:36:23.32913
787	2	59	2026-08-13 00:36:23.32913
788	2	60	2026-08-13 00:36:23.32913
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, full_name, email, role_id, department_id, is_active, created_at, updated_at, signature_data, employee_number) FROM stdin;
1	admin	$2b$10$tM09TNOGQoD94HaA7PP14eU2/6w4VCeSTHcAtsdy13P18/2f0Dyyi	System Administrator	\N	1	8	t	2026-07-17 23:23:27.607332	2026-08-11 03:41:59.438148	\N	EMP-0001
12	Yousef.hamdan	$2b$10$zBu/8Ia2q0IkGqb793UYsOO6cOvMe9.dbBu68EW2oHUYUcxdqrTMe	Yousef Hamdan	\N	19	8	t	2026-08-11 04:36:02.959334	2026-08-12 05:33:34.102	\N	00068
2	salah.alqum	$2b$10$jp3cvr3DBfcEYi6pxZjCze27EiFv4vZFybf3Ca.dh7LY6mlIHDtoa	Salah Alqum	salah@gmail.com	2	8	t	2026-08-11 02:38:44.591932	2026-08-12 05:59:56.775	\N	00063
15	khalil.hasan	$2b$10$boWfiiPdLuTofdsuq3cLveNRogWtVYMdqXcF05cDaElvWUfD.V.lG	Khalil Hasan	\N	4	8	t	2026-08-12 03:07:02.22178	2026-08-12 03:07:02.22178	\N	00595
16	fayez.abuelfelat	$2b$10$afjBs/heNSQOJH9QmjjQsOQn/9GvJ2T0vSiZEWN7ize2Wb.jpUN5q	Fayez Abu Elfelat	\N	4	8	t	2026-08-12 03:13:31.26917	2026-08-12 10:15:45.534	\N	00528
17	wisam.shaheen	$2b$10$8xOtumvSQks58pPPZG3Ko.YFr7MHhvgzmz77yqG20FJuo0xop.JyC	Wisam Shaheen	\N	4	8	t	2026-08-12 03:13:31.26917	2026-08-12 10:19:31.782	\N	00757
18	moath.breghith	$2b$10$drns4FObK/B1cI2VD0qnBOauTof02x2zk/oFK.LRYQIE8koFrT/Be	Moath Breghith	\N	18	8	t	2026-08-12 03:22:44.812622	2026-08-12 03:22:44.812622	\N	00511
19	firas.jaroushi	$2b$10$Bqudw.MkhVPJzPznu.Eiw.0q5Em9/hT8D.2.1ygNgajwtoh3yUvXi	Firas Jaroushi	\N	7	2	t	2026-08-12 03:29:21.38932	2026-08-12 03:29:21.38932	\N	00252
14	nizar.alkhateeb	$2b$10$go4wplymAerNMTnivE0Mi.l8MYNZLybK6A8cX4DHs83JeXTPUhQOG	Nizar Alkhateeb	\N	4	8	t	2026-08-11 22:36:58.290826	2026-08-12 11:00:28.034	\N	00067
13	mohammed.alama	$2b$10$dUg2YCb7bRNm9z/R7sz7O.9qaNbheA1UCdvQnL5wpwMbfoXjFHQQu	Mohammed Alama	\N	8	2	t	2026-08-11 04:43:59.530349	2026-08-12 04:26:08.335629	\N	00530
\.


--
-- Name: annual_pm_plan_rows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.annual_pm_plan_rows_id_seq', 7, true);


--
-- Name: annual_pm_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.annual_pm_plans_id_seq', 1, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 114, true);


--
-- Name: closed_corrective_maintenance_log_exclusions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.closed_corrective_maintenance_log_exclusions_id_seq', 1, false);


--
-- Name: closed_corrective_maintenance_manual_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.closed_corrective_maintenance_manual_entries_id_seq', 1, false);


--
-- Name: corrective_maintenance_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.corrective_maintenance_events_id_seq', 2, true);


--
-- Name: corrective_maintenance_handover_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.corrective_maintenance_handover_id_seq', 1, false);


--
-- Name: corrective_maintenance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.corrective_maintenance_records_id_seq', 3, true);


--
-- Name: corrective_maintenance_staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.corrective_maintenance_staff_id_seq', 1, false);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 12, true);


--
-- Name: eligible_signer_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.eligible_signer_assignments_id_seq', 1, false);


--
-- Name: equipment_information_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipment_information_records_id_seq', 3, true);


--
-- Name: external_maintenance_receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_maintenance_receipts_id_seq', 1, true);


--
-- Name: external_maintenance_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.external_maintenance_requests_id_seq', 1, true);


--
-- Name: form_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.form_headers_id_seq', 4, true);


--
-- Name: machines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.machines_id_seq', 7, true);


--
-- Name: maintenance_request_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_request_status_history_id_seq', 24, true);


--
-- Name: maintenance_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenance_requests_id_seq', 7, true);


--
-- Name: monthly_maintenance_evaluation_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monthly_maintenance_evaluation_reports_id_seq', 1, false);


--
-- Name: monthly_pm_plan_rows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monthly_pm_plan_rows_id_seq', 7, true);


--
-- Name: monthly_pm_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monthly_pm_plans_id_seq', 12, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 60, true);


--
-- Name: pm_checklist_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_checklist_points_id_seq', 102, true);


--
-- Name: pm_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_headers_id_seq', 4, true);


--
-- Name: pm_inspection_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_inspection_results_id_seq', 196, true);


--
-- Name: pm_inspections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_inspections_id_seq', 4, true);


--
-- Name: pm_record_checklist_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_record_checklist_points_id_seq', 28, true);


--
-- Name: pm_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pm_records_id_seq', 5, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 19, true);


--
-- Name: signature_field_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.signature_field_permissions_id_seq', 39, true);


--
-- Name: signatures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.signatures_id_seq', 4, true);


--
-- Name: spare_part_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spare_part_movements_id_seq', 1, false);


--
-- Name: spare_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.spare_parts_id_seq', 1, false);


--
-- Name: user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_permissions_id_seq', 788, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 20, true);


--
-- Name: annual_pm_plan_rows annual_pm_plan_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plan_rows
    ADD CONSTRAINT annual_pm_plan_rows_pkey PRIMARY KEY (id);


--
-- Name: annual_pm_plans annual_pm_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plans
    ADD CONSTRAINT annual_pm_plans_pkey PRIMARY KEY (id);


--
-- Name: annual_pm_plans annual_pm_plans_year_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plans
    ADD CONSTRAINT annual_pm_plans_year_unique UNIQUE (year);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: closed_corrective_maintenance_log_exclusions closed_corrective_maintenance_log_exclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_log_exclusions
    ADD CONSTRAINT closed_corrective_maintenance_log_exclusions_pkey PRIMARY KEY (id);


--
-- Name: closed_corrective_maintenance_manual_entries closed_corrective_maintenance_manual_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_manual_entries
    ADD CONSTRAINT closed_corrective_maintenance_manual_entries_pkey PRIMARY KEY (id);


--
-- Name: corrective_maintenance_events corrective_maintenance_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events
    ADD CONSTRAINT corrective_maintenance_events_pkey PRIMARY KEY (id);


--
-- Name: corrective_maintenance_events corrective_maintenance_events_request_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events
    ADD CONSTRAINT corrective_maintenance_events_request_id_unique UNIQUE (request_id);


--
-- Name: corrective_maintenance_handover corrective_maintenance_handover_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_handover
    ADD CONSTRAINT corrective_maintenance_handover_pkey PRIMARY KEY (id);


--
-- Name: corrective_maintenance_records corrective_maintenance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_records
    ADD CONSTRAINT corrective_maintenance_records_pkey PRIMARY KEY (id);


--
-- Name: corrective_maintenance_staff corrective_maintenance_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_staff
    ADD CONSTRAINT corrective_maintenance_staff_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_unique UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: eligible_signer_assignments eligible_signer_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eligible_signer_assignments
    ADD CONSTRAINT eligible_signer_assignments_pkey PRIMARY KEY (id);


--
-- Name: equipment_information_records equipment_information_records_machine_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_information_records
    ADD CONSTRAINT equipment_information_records_machine_id_unique UNIQUE (machine_id);


--
-- Name: equipment_information_records equipment_information_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_information_records
    ADD CONSTRAINT equipment_information_records_pkey PRIMARY KEY (id);


--
-- Name: external_maintenance_receipts external_maintenance_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_receipts
    ADD CONSTRAINT external_maintenance_receipts_pkey PRIMARY KEY (id);


--
-- Name: external_maintenance_requests external_maintenance_requests_external_request_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_requests
    ADD CONSTRAINT external_maintenance_requests_external_request_number_unique UNIQUE (external_request_number);


--
-- Name: external_maintenance_requests external_maintenance_requests_maintenance_request_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_requests
    ADD CONSTRAINT external_maintenance_requests_maintenance_request_id_unique UNIQUE (maintenance_request_id);


--
-- Name: external_maintenance_requests external_maintenance_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_requests
    ADD CONSTRAINT external_maintenance_requests_pkey PRIMARY KEY (id);


--
-- Name: form_headers form_headers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.form_headers
    ADD CONSTRAINT form_headers_pkey PRIMARY KEY (id);


--
-- Name: machines machines_machine_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_machine_number_unique UNIQUE (machine_number);


--
-- Name: machines machines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_pkey PRIMARY KEY (id);


--
-- Name: maintenance_request_status_history maintenance_request_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_history
    ADD CONSTRAINT maintenance_request_status_history_pkey PRIMARY KEY (id);


--
-- Name: maintenance_requests maintenance_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_pkey PRIMARY KEY (id);


--
-- Name: maintenance_requests maintenance_requests_request_report_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_request_report_number_unique UNIQUE (request_report_number);


--
-- Name: monthly_maintenance_evaluation_reports monthly_maintenance_evaluation_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_maintenance_evaluation_reports
    ADD CONSTRAINT monthly_maintenance_evaluation_reports_pkey PRIMARY KEY (id);


--
-- Name: monthly_pm_plan_rows monthly_pm_plan_rows_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plan_rows
    ADD CONSTRAINT monthly_pm_plan_rows_pkey PRIMARY KEY (id);


--
-- Name: monthly_pm_plans monthly_pm_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plans
    ADD CONSTRAINT monthly_pm_plans_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_unique UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pm_checklist_points pm_checklist_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_checklist_points
    ADD CONSTRAINT pm_checklist_points_pkey PRIMARY KEY (id);


--
-- Name: pm_headers pm_headers_machine_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_headers
    ADD CONSTRAINT pm_headers_machine_id_unique UNIQUE (machine_id);


--
-- Name: pm_headers pm_headers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_headers
    ADD CONSTRAINT pm_headers_pkey PRIMARY KEY (id);


--
-- Name: pm_inspection_results pm_inspection_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspection_results
    ADD CONSTRAINT pm_inspection_results_pkey PRIMARY KEY (id);


--
-- Name: pm_inspections pm_inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspections
    ADD CONSTRAINT pm_inspections_pkey PRIMARY KEY (id);


--
-- Name: pm_record_checklist_points pm_record_checklist_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_record_checklist_points
    ADD CONSTRAINT pm_record_checklist_points_pkey PRIMARY KEY (id);


--
-- Name: pm_records pm_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_records
    ADD CONSTRAINT pm_records_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_unique UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: signature_field_permissions signature_field_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signature_field_permissions
    ADD CONSTRAINT signature_field_permissions_pkey PRIMARY KEY (id);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: spare_part_movements spare_part_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spare_part_movements
    ADD CONSTRAINT spare_part_movements_pkey PRIMARY KEY (id);


--
-- Name: spare_parts spare_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spare_parts
    ADD CONSTRAINT spare_parts_pkey PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: cm_events_record_row_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cm_events_record_row_idx ON public.corrective_maintenance_events USING btree (record_id, row_number);


--
-- Name: cm_events_request_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cm_events_request_number_idx ON public.corrective_maintenance_events USING btree (request_report_number);


--
-- Name: monthly_maintenance_evaluation_year_month_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX monthly_maintenance_evaluation_year_month_idx ON public.monthly_maintenance_evaluation_reports USING btree (year, month);


--
-- Name: monthly_pm_plans_year_month_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX monthly_pm_plans_year_month_idx ON public.monthly_pm_plans USING btree (year, month);


--
-- Name: pm_record_checklist_point_source_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pm_record_checklist_point_source_idx ON public.pm_record_checklist_points USING btree (record_id, source_checklist_point_id);


--
-- Name: spare_parts_part_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX spare_parts_part_code_idx ON public.spare_parts USING btree (part_code);


--
-- Name: annual_pm_plan_rows annual_pm_plan_rows_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plan_rows
    ADD CONSTRAINT annual_pm_plan_rows_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: annual_pm_plan_rows annual_pm_plan_rows_plan_id_annual_pm_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.annual_pm_plan_rows
    ADD CONSTRAINT annual_pm_plan_rows_plan_id_annual_pm_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.annual_pm_plans(id);


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: closed_corrective_maintenance_log_exclusions closed_corrective_maintenance_log_exclusions_excluded_by_user_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_log_exclusions
    ADD CONSTRAINT closed_corrective_maintenance_log_exclusions_excluded_by_user_i FOREIGN KEY (excluded_by_user_id) REFERENCES public.users(id);


--
-- Name: closed_corrective_maintenance_log_exclusions closed_corrective_maintenance_log_exclusions_maintenance_reques; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_log_exclusions
    ADD CONSTRAINT closed_corrective_maintenance_log_exclusions_maintenance_reques FOREIGN KEY (maintenance_request_id) REFERENCES public.maintenance_requests(id);


--
-- Name: closed_corrective_maintenance_manual_entries closed_corrective_maintenance_manual_entries_created_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_manual_entries
    ADD CONSTRAINT closed_corrective_maintenance_manual_entries_created_by_user_id FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: closed_corrective_maintenance_manual_entries closed_corrective_maintenance_manual_entries_deleted_by_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.closed_corrective_maintenance_manual_entries
    ADD CONSTRAINT closed_corrective_maintenance_manual_entries_deleted_by_user_id FOREIGN KEY (deleted_by_user_id) REFERENCES public.users(id);


--
-- Name: corrective_maintenance_events corrective_maintenance_events_completed_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events
    ADD CONSTRAINT corrective_maintenance_events_completed_by_user_id_users_id_fk FOREIGN KEY (completed_by_user_id) REFERENCES public.users(id);


--
-- Name: corrective_maintenance_events corrective_maintenance_events_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events
    ADD CONSTRAINT corrective_maintenance_events_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: corrective_maintenance_events corrective_maintenance_events_record_id_corrective_maintenance_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events
    ADD CONSTRAINT corrective_maintenance_events_record_id_corrective_maintenance_ FOREIGN KEY (record_id) REFERENCES public.corrective_maintenance_records(id);


--
-- Name: corrective_maintenance_events corrective_maintenance_events_request_id_maintenance_requests_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_events
    ADD CONSTRAINT corrective_maintenance_events_request_id_maintenance_requests_i FOREIGN KEY (request_id) REFERENCES public.maintenance_requests(id);


--
-- Name: corrective_maintenance_handover corrective_maintenance_handover_cm_event_id_corrective_maintena; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_handover
    ADD CONSTRAINT corrective_maintenance_handover_cm_event_id_corrective_maintena FOREIGN KEY (cm_event_id) REFERENCES public.corrective_maintenance_events(id);


--
-- Name: corrective_maintenance_records corrective_maintenance_records_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_records
    ADD CONSTRAINT corrective_maintenance_records_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: corrective_maintenance_staff corrective_maintenance_staff_cm_event_id_corrective_maintenance; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.corrective_maintenance_staff
    ADD CONSTRAINT corrective_maintenance_staff_cm_event_id_corrective_maintenance FOREIGN KEY (cm_event_id) REFERENCES public.corrective_maintenance_events(id);


--
-- Name: eligible_signer_assignments eligible_signer_assignments_eligible_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eligible_signer_assignments
    ADD CONSTRAINT eligible_signer_assignments_eligible_user_id_users_id_fk FOREIGN KEY (eligible_user_id) REFERENCES public.users(id);


--
-- Name: eligible_signer_assignments eligible_signer_assignments_granted_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.eligible_signer_assignments
    ADD CONSTRAINT eligible_signer_assignments_granted_by_users_id_fk FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: equipment_information_records equipment_information_records_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipment_information_records
    ADD CONSTRAINT equipment_information_records_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: external_maintenance_receipts external_maintenance_receipts_external_maintenance_request_id_e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_receipts
    ADD CONSTRAINT external_maintenance_receipts_external_maintenance_request_id_e FOREIGN KEY (external_maintenance_request_id) REFERENCES public.external_maintenance_requests(id);


--
-- Name: external_maintenance_requests external_maintenance_requests_maintenance_request_id_maintenanc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_maintenance_requests
    ADD CONSTRAINT external_maintenance_requests_maintenance_request_id_maintenanc FOREIGN KEY (maintenance_request_id) REFERENCES public.maintenance_requests(id);


--
-- Name: machines machines_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.machines
    ADD CONSTRAINT machines_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: maintenance_request_status_history maintenance_request_status_history_changed_by_user_id_users_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_history
    ADD CONSTRAINT maintenance_request_status_history_changed_by_user_id_users_id_ FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id);


--
-- Name: maintenance_request_status_history maintenance_request_status_history_request_id_maintenance_reque; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_request_status_history
    ADD CONSTRAINT maintenance_request_status_history_request_id_maintenance_reque FOREIGN KEY (request_id) REFERENCES public.maintenance_requests(id);


--
-- Name: maintenance_requests maintenance_requests_archived_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_archived_by_user_id_users_id_fk FOREIGN KEY (archived_by_user_id) REFERENCES public.users(id);


--
-- Name: maintenance_requests maintenance_requests_assigned_technician_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_assigned_technician_user_id_users_id_fk FOREIGN KEY (assigned_technician_user_id) REFERENCES public.users(id);


--
-- Name: maintenance_requests maintenance_requests_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: maintenance_requests maintenance_requests_engineering_reviewed_by_user_id_users_id_f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_engineering_reviewed_by_user_id_users_id_f FOREIGN KEY (engineering_reviewed_by_user_id) REFERENCES public.users(id);


--
-- Name: maintenance_requests maintenance_requests_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: maintenance_requests maintenance_requests_qa_reviewed_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_qa_reviewed_by_user_id_users_id_fk FOREIGN KEY (qa_reviewed_by_user_id) REFERENCES public.users(id);


--
-- Name: maintenance_requests maintenance_requests_requested_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_requests
    ADD CONSTRAINT maintenance_requests_requested_by_user_id_users_id_fk FOREIGN KEY (requested_by_user_id) REFERENCES public.users(id);


--
-- Name: monthly_maintenance_evaluation_reports monthly_maintenance_evaluation_reports_created_by_user_id_users; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_maintenance_evaluation_reports
    ADD CONSTRAINT monthly_maintenance_evaluation_reports_created_by_user_id_users FOREIGN KEY (created_by_user_id) REFERENCES public.users(id);


--
-- Name: monthly_pm_plan_rows monthly_pm_plan_rows_annual_plan_row_id_annual_pm_plan_rows_id_; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plan_rows
    ADD CONSTRAINT monthly_pm_plan_rows_annual_plan_row_id_annual_pm_plan_rows_id_ FOREIGN KEY (annual_plan_row_id) REFERENCES public.annual_pm_plan_rows(id);


--
-- Name: monthly_pm_plan_rows monthly_pm_plan_rows_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plan_rows
    ADD CONSTRAINT monthly_pm_plan_rows_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: monthly_pm_plan_rows monthly_pm_plan_rows_plan_id_monthly_pm_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monthly_pm_plan_rows
    ADD CONSTRAINT monthly_pm_plan_rows_plan_id_monthly_pm_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.monthly_pm_plans(id);


--
-- Name: notifications notifications_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: pm_checklist_points pm_checklist_points_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_checklist_points
    ADD CONSTRAINT pm_checklist_points_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: pm_headers pm_headers_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_headers
    ADD CONSTRAINT pm_headers_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: pm_inspection_results pm_inspection_results_checklist_point_id_pm_checklist_points_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspection_results
    ADD CONSTRAINT pm_inspection_results_checklist_point_id_pm_checklist_points_id FOREIGN KEY (checklist_point_id) REFERENCES public.pm_checklist_points(id);


--
-- Name: pm_inspection_results pm_inspection_results_inspection_id_pm_inspections_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspection_results
    ADD CONSTRAINT pm_inspection_results_inspection_id_pm_inspections_id_fk FOREIGN KEY (inspection_id) REFERENCES public.pm_inspections(id);


--
-- Name: pm_inspections pm_inspections_completed_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspections
    ADD CONSTRAINT pm_inspections_completed_by_user_id_users_id_fk FOREIGN KEY (completed_by_user_id) REFERENCES public.users(id);


--
-- Name: pm_inspections pm_inspections_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspections
    ADD CONSTRAINT pm_inspections_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: pm_inspections pm_inspections_record_id_pm_records_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_inspections
    ADD CONSTRAINT pm_inspections_record_id_pm_records_id_fk FOREIGN KEY (record_id) REFERENCES public.pm_records(id);


--
-- Name: pm_record_checklist_points pm_record_checklist_points_record_id_pm_records_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_record_checklist_points
    ADD CONSTRAINT pm_record_checklist_points_record_id_pm_records_id_fk FOREIGN KEY (record_id) REFERENCES public.pm_records(id);


--
-- Name: pm_record_checklist_points pm_record_checklist_points_source_checklist_point_id_pm_checkli; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_record_checklist_points
    ADD CONSTRAINT pm_record_checklist_points_source_checklist_point_id_pm_checkli FOREIGN KEY (source_checklist_point_id) REFERENCES public.pm_checklist_points(id);


--
-- Name: pm_records pm_records_machine_id_machines_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pm_records
    ADD CONSTRAINT pm_records_machine_id_machines_id_fk FOREIGN KEY (machine_id) REFERENCES public.machines(id);


--
-- Name: signature_field_permissions signature_field_permissions_eligible_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signature_field_permissions
    ADD CONSTRAINT signature_field_permissions_eligible_user_id_users_id_fk FOREIGN KEY (eligible_user_id) REFERENCES public.users(id);


--
-- Name: signature_field_permissions signature_field_permissions_granted_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signature_field_permissions
    ADD CONSTRAINT signature_field_permissions_granted_by_users_id_fk FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: signatures signatures_eligible_signer_assignment_id_eligible_signer_assign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_eligible_signer_assignment_id_eligible_signer_assign FOREIGN KEY (eligible_signer_assignment_id) REFERENCES public.eligible_signer_assignments(id);


--
-- Name: signatures signatures_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: spare_part_movements spare_part_movements_recorded_by_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spare_part_movements
    ADD CONSTRAINT spare_part_movements_recorded_by_user_id_users_id_fk FOREIGN KEY (recorded_by_user_id) REFERENCES public.users(id);


--
-- Name: spare_part_movements spare_part_movements_spare_part_id_spare_parts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.spare_part_movements
    ADD CONSTRAINT spare_part_movements_spare_part_id_spare_parts_id_fk FOREIGN KEY (spare_part_id) REFERENCES public.spare_parts(id);


--
-- Name: user_permissions user_permissions_permission_id_permissions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permission_id_permissions_id_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: user_permissions user_permissions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_role_id_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict fqpOngo6UHITdAEDAJGqIGlcsDbHARb46w7n32B2jcPIAprep9Hh8rDXvnififq

