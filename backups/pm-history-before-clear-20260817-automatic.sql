--
-- PostgreSQL database dump
--

\restrict MT6yKaeeAJVVezNFrjS6rdc26AkULvt2dxGZRNNh6QWN2Q8RU1wyLOXFaN1Rrqb

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

--
-- Data for Name: monthly_pm_plan_rows; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.monthly_pm_plan_rows (id, plan_id, annual_plan_row_id, machine_id, row_number, department_name, section_name, machine_name, identification_number, planned_date_from, planned_date_to, actual_date, amendments, status, created_at, updated_at, actual_date_is_override, is_manually_removed, planned_date_is_override) VALUES (5, 8, 5, 5, 2, 'Production', 'Production', 'Karnavati Tablet Press Machine ', 'PDM-01-089', '2026-08-12', '2026-08-12', '2026-08-13', NULL, 'completed', '2026-08-12 05:11:05.25774', '2026-08-13 07:53:54.285', false, false, false);
INSERT INTO public.monthly_pm_plan_rows (id, plan_id, annual_plan_row_id, machine_id, row_number, department_name, section_name, machine_name, identification_number, planned_date_from, planned_date_to, actual_date, amendments, status, created_at, updated_at, actual_date_is_override, is_manually_removed, planned_date_is_override) VALUES (7, 8, 7, 7, 3, 'Engineering & Maintenance', 'Engineering & Maintenance', 'Air Handling Unit', 'AHU', '2026-08-13', '2026-08-13', NULL, NULL, 'due', '2026-08-13 00:53:48.067173', '2026-08-13 07:53:54.286', false, false, false);
INSERT INTO public.monthly_pm_plan_rows (id, plan_id, annual_plan_row_id, machine_id, row_number, department_name, section_name, machine_name, identification_number, planned_date_from, planned_date_to, actual_date, amendments, status, created_at, updated_at, actual_date_is_override, is_manually_removed, planned_date_is_override) VALUES (6, 8, 6, 6, 1, 'Production', 'Production', 'KALIX-tube filling machine', 'PDM-03-51', '2026-08-13', '2026-08-13', NULL, NULL, 'due', '2026-08-12 22:26:23.272666', '2026-08-13 07:53:54.285', false, false, false);


--
-- Data for Name: pm_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pm_records (id, machine_id, sequence_number, previous_record_id, status, created_at, updated_at) VALUES (3, 6, 1, NULL, 'active', '2026-08-13 00:02:29.776235', '2026-08-13 00:02:29.776235');
INSERT INTO public.pm_records (id, machine_id, sequence_number, previous_record_id, status, created_at, updated_at) VALUES (2, 5, 1, NULL, 'archived', '2026-08-12 21:51:37.795424', '2026-08-13 07:41:52.923');
INSERT INTO public.pm_records (id, machine_id, sequence_number, previous_record_id, status, created_at, updated_at) VALUES (4, 5, 2, 2, 'active', '2026-08-13 00:41:52.926097', '2026-08-13 07:54:42.235');


--
-- Data for Name: pm_inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pm_inspections (id, record_id, machine_id, column_number, inspection_date, inspection_time, action_taken, examiner_name, examiner_signature, machine_receiver_name, machine_receiver_signature, completed_by_user_id, completed_at, execution_month_year) VALUES (1, 2, 5, 1, '2024-10-13', '08:13', '', 'فايز', 'Fayez Abu Elfelat', NULL, NULL, 16, '2026-08-12 22:14:59.932557', '2024-10');
INSERT INTO public.pm_inspections (id, record_id, machine_id, column_number, inspection_date, inspection_time, action_taken, examiner_name, examiner_signature, machine_receiver_name, machine_receiver_signature, completed_by_user_id, completed_at, execution_month_year) VALUES (2, 2, 5, 2, '2026-08-13', '10:41', '', 'System Administrator', 'System Administrator', NULL, NULL, 1, '2026-08-13 00:41:39.853336', '2026-08');
INSERT INTO public.pm_inspections (id, record_id, machine_id, column_number, inspection_date, inspection_time, action_taken, examiner_name, examiner_signature, machine_receiver_name, machine_receiver_signature, completed_by_user_id, completed_at, execution_month_year) VALUES (3, 2, 5, 3, '2026-08-13', '10:41', '', 'System Administrator', 'System Administrator', NULL, NULL, 1, '2026-08-13 00:41:47.101324', '2026-08');


--
-- Data for Name: pm_inspection_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (85, 1, 1, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (86, 1, 2, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (87, 1, 3, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (88, 1, 5, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (89, 1, 6, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (90, 1, 7, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (91, 1, 8, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (92, 1, 9, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (93, 1, 10, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (94, 1, 11, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (95, 1, 12, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (96, 1, 13, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (97, 1, 14, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (98, 1, 15, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (99, 1, 16, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (100, 1, 17, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (101, 1, 18, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (102, 1, 19, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (103, 1, 20, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (104, 1, 21, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (105, 1, 22, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (106, 1, 23, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (107, 1, 24, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (108, 1, 25, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (109, 1, 26, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (110, 1, 27, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (111, 1, 28, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (112, 1, 29, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (113, 2, 1, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (114, 2, 2, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (115, 2, 3, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (116, 2, 5, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (117, 2, 6, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (118, 2, 7, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (119, 2, 8, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (120, 2, 9, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (121, 2, 10, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (122, 2, 11, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (123, 2, 12, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (124, 2, 13, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (125, 2, 14, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (126, 2, 15, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (127, 2, 16, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (128, 2, 17, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (129, 2, 18, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (130, 2, 19, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (131, 2, 20, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (132, 2, 21, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (133, 2, 22, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (134, 2, 23, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (135, 2, 24, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (136, 2, 25, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (137, 2, 26, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (138, 2, 27, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (139, 2, 28, 'نعم');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (140, 2, 29, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (141, 3, 1, 'لا');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (142, 3, 2, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (143, 3, 3, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (144, 3, 5, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (145, 3, 6, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (146, 3, 7, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (147, 3, 8, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (148, 3, 9, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (149, 3, 10, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (150, 3, 11, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (151, 3, 12, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (152, 3, 13, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (153, 3, 14, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (154, 3, 15, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (155, 3, 16, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (156, 3, 17, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (157, 3, 18, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (158, 3, 19, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (159, 3, 20, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (160, 3, 21, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (161, 3, 22, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (162, 3, 23, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (163, 3, 24, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (164, 3, 25, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (165, 3, 26, '');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (166, 3, 27, 'لا');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (167, 3, 28, 'لا');
INSERT INTO public.pm_inspection_results (id, inspection_id, checklist_point_id, value) VALUES (168, 3, 29, '');


--
-- Data for Name: pm_record_checklist_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (1, 2, 1, 'تم فحص الكامات العلوية و هي سليمة.', 'yes_no', 1, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (2, 2, 2, 'تم تنظيف لبادات تثبيت نهاية البنشنات (Lube Felts) و إعادة تركيبها و هي سليمة', 'yes_no', 2, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (3, 2, 3, 'تم فحص الكامات السفلية و هي سليمة', 'yes_no', 3, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (4, 2, 5, 'تم فحص عجلات الضغط العلوية و السفلية (عددها 4) و تنظيفها من البودرة المتراكمة عليها', 'yes_no', 4, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (5, 2, 6, 'تم تزييت السطح الخارجي لعجلات الضغط العلوية و السفلية للماكينة بواسطة زيت نوع (OPTIMOL 1500 Spray)', 'yes_no', 5, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (6, 2, 7, 'تم فحص لكمات مانعة سقوط البنشنات السفلية (Punch Retaining) و هي سليمة', 'yes_no', 6, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (7, 2, 8, 'تم فحص رنجات البنشنات السفلية (Punches Seals) و هي سليمة', 'yes_no', 7, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (8, 2, 9, 'تم فحص سطح الماكينة الحامل للدايز (Die Plate Contact Surface) و هي سليمة و لا يوجد بها أي خدوش', 'yes_no', 8, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (9, 2, 10, 'تم فحص مستوى الزيت في التنك و هو بالمستوى المطلوب (زيت نوع Alpha SP-320) (Alpha SP-320/Zn-320).', 'yes_no', 9, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (10, 2, 11, 'تم فحص جميع انابيب الزيت و هي سليمة', 'yes_no', 10, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (11, 2, 12, 'تم التأكد ان جميع نقاط التزييت الموجودة في الماكينة (عددها 2) تعطي زيت للاماكن المخصصة لتزييتها.', 'yes_no', 11, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (12, 2, 13, 'تم فحص فراشات التعبئة (Filling Wheels) لوحدة Force Feeder و هي سليمة', 'yes_no', 12, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (13, 2, 14, 'تم فحص مسننات نقل الحركة لوحدة Force Feeder و هي سليمة', 'yes_no', 13, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (14, 2, 15, 'تم تشحيم مسننات نقل الحركة و تنظيف الشحمة القديمة عنها', 'yes_no', 14, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (15, 2, 16, 'تم فحص بوابة التحكم و التوجيه لحبات الحبوب (الجيدة و الرديئة) و هي سليمة', 'yes_no', 15, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (16, 2, 17, 'تم فحص الابواب البلاستيكية العلوية و هي سليمة.', 'yes_no', 16, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (17, 2, 18, 'تم فحص كسكيتات الابواب البلاستيكية العلوية و هي سليمة', 'yes_no', 17, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (18, 2, 19, 'تم فحص ايادي تثبيت ابواب الستانلس ستيل السفلية مع جسم الماكينة الخارجي و هي موجودة و سليمة.', 'yes_no', 18, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (19, 2, 20, 'تم تنظيف حوض تجميع الأتربة الخاصة بجهاز Tablet Deduster.', 'yes_no', 19, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (20, 2, 21, 'تم فحص البراغي (عددها 4) المثبتة للمجرى الحلزوني لجهاز Tablet Deduster و وجدت مثبتة بإحكام.', 'yes_no', 20, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (21, 2, 22, 'تم تنظيف جهاز Metal Detector و هو سليم و تم فحصه عن طريق تمرير القطع المعدنية وهو يعمل بشكل جيد.', 'yes_no', 21, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (22, 2, 23, 'تم تنظيف فلتر تجميع الاغبرة من البودرة العالقة فيه جهاز Powder Feeding System.', 'yes_no', 22, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (23, 2, 24, 'تم فحص أنابيب شفط الاغبرة لجهاز Powder Feeding System و هي سليمة.', 'yes_no', 23, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (24, 2, 25, 'تم فحص الكوابل الكهربائية الخاصة بجهاز Powder Feeding System و وجدت سليمة.', 'yes_no', 24, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (25, 2, 26, 'تم فحص الكوابل الكهربائية الخاصة بجهاز Dust Collector و وجدت سليمة.', 'yes_no', 25, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (26, 2, 27, 'تم تنظيف الفلتر الخاصة بجهاز Dust Collector و جد سليمة من اي ثقوب او تمزق.', 'yes_no', 26, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (27, 2, 28, 'تم تسجيل نشاطات الصيانة المنجزة في سجل الماكينة (LOG-00-0014) الموجود في القسم.', 'yes_no', 27, '2026-08-13 00:41:47.111057');
INSERT INTO public.pm_record_checklist_points (id, record_id, source_checklist_point_id, point_text, result_type, sort_order, created_at) VALUES (28, 2, 29, 'القطع التي تم استبدالها خلال اعمال الصيانة.', 'yes_no', 28, '2026-08-13 00:41:47.111057');


--
-- Name: monthly_pm_plan_rows_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.monthly_pm_plan_rows_id_seq', 7, true);


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

SELECT pg_catalog.setval('public.pm_records_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict MT6yKaeeAJVVezNFrjS6rdc26AkULvt2dxGZRNNh6QWN2Q8RU1wyLOXFaN1Rrqb

