--
-- PostgreSQL database dump
--

\restrict qh3fZ38iDkmNzBOROKbvXa2w2Ed7a09tOVxjSyK6UpM7Dnxuj6rWgsfeB7POWRO

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: financing_applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.financing_applications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    address character varying(200) NOT NULL,
    city character varying(50) NOT NULL,
    state character varying(20) NOT NULL,
    zip_code character varying(10) NOT NULL,
    employment_status character varying(50) NOT NULL,
    monthly_income character varying(50) NOT NULL,
    credit_score character varying(50),
    down_payment character varying(50),
    vehicle_interest text,
    additional_info text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.financing_applications OWNER TO neondb_owner;

--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.inquiries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id character varying,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    interest_type character varying(50) NOT NULL,
    message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.inquiries OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vehicles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    make character varying(50) NOT NULL,
    model character varying(50) NOT NULL,
    year integer NOT NULL,
    "trim" character varying(100),
    price numeric(10,2) NOT NULL,
    mileage integer NOT NULL,
    exterior_color character varying(50) NOT NULL,
    interior_color character varying(50),
    fuel_type character varying(20) NOT NULL,
    transmission character varying(50) NOT NULL,
    drivetrain character varying(10) NOT NULL,
    engine character varying(100),
    seating_capacity integer,
    description text,
    features jsonb,
    images jsonb,
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    stock_number character varying(20),
    vin character varying(17),
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    status_banner character varying(20)
);


ALTER TABLE public.vehicles OWNER TO neondb_owner;

--
-- Data for Name: financing_applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.financing_applications (id, first_name, last_name, email, phone, address, city, state, zip_code, employment_status, monthly_income, credit_score, down_payment, vehicle_interest, additional_info, created_at) FROM stdin;
\.


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.inquiries (id, vehicle_id, first_name, last_name, email, phone, interest_type, message, created_at) FROM stdin;
2b1c7569-1e7c-4ceb-9175-e49cb0f9227f	3d549c5f-e911-4d65-a961-421ca636baf1	Jeremy	Kean	keanonbiz@gmail.com	7653388129	Apply for Financing	test	2025-08-07 20:01:24.002832
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password) FROM stdin;
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicles (id, make, model, year, "trim", price, mileage, exterior_color, interior_color, fuel_type, transmission, drivetrain, engine, seating_capacity, description, features, images, status, stock_number, vin, is_featured, created_at, updated_at, status_banner) FROM stdin;
cd96725b-24ee-4d04-9c39-d45c01064d88	Buick	Enclave	2015		14999.00	113800	RED	beige	gasoline	Automatic	AWD		5	Back up camera, heated/cooled seats, power everything	[]	["https://drive.google.com/thumbnail?id=1bb_pZVJs6djdwzBPLfnjFhQI22nlAT8Z&sz=w800-h600", "https://drive.google.com/thumbnail?id=1edXM2_pSjzfzxnXEdwJkDHhjSR2lr_zS&sz=w800-h600", "https://drive.google.com/thumbnail?id=1ywxZAJeGYfg4Tr5HyfC36GtbMmrWkppb&sz=w800-h600", "https://drive.google.com/thumbnail?id=1fqRPgI_76kv1Fx4_doVUM8fhD4HrPHfV&sz=w800-h600", "https://drive.google.com/thumbnail?id=1taV-CWXPSzWSJ5ydZgo01OfMIDjIO0Y7&sz=w800-h600", "https://drive.google.com/thumbnail?id=1gnGDBMarCzFlhtJBiRglXkV5brSB_deI&sz=w800-h600", "https://drive.google.com/thumbnail?id=1h05reu9Baw_3WosQX0oBV0dSu6af8Vv1&sz=w800-h600", "https://drive.google.com/thumbnail?id=1o40JyB31a37AU638ayRb2KVPnuRSWmYD&sz=w800-h600", "https://drive.google.com/thumbnail?id=1Fq00iT5gVmywixD9oNVrPScbdfZB1xdi&sz=w800-h600"]	available	1053	5GAKVCKD7FJ328533	f	2025-08-07 04:47:45.485008	2025-08-07 19:55:31.984	\N
a9ec77b4-52c0-4c88-a45f-f7ada42ec0c7	Jeep	Wrangler Sahara Unlimited	2014		16999.00	176130	GRAY	black	gasoline	Manual	4WD		5		[]	["https://drive.google.com/thumbnail?id=13TbT7gc8cmH2ZWSa5IbXp7mZMSeb1w8H&sz=w800-h600", "https://drive.google.com/thumbnail?id=1P7rOI87TGv7GhWRmP4Y9DXsf0Z-lxCO_&sz=w800-h600", "https://drive.google.com/thumbnail?id=1sikc4jNMrfdgGKnxtEKXyq2fSAITG43P&sz=w800-h600", "https://drive.google.com/thumbnail?id=1Ud7SsfMO29qUZxCDdBIuNQMn_rlzI4cv&sz=w800-h600", "https://drive.google.com/thumbnail?id=12rq7spZLYWlB_wOdRzgZ8JCx2dte2qiY&sz=w800-h600", "https://drive.google.com/thumbnail?id=1ZLcPzTX_d8jQg7wotgxuSPWkEFpnOHBA&sz=w800-h600", "https://drive.google.com/thumbnail?id=1WO6G2ZI4Vvf4fDd7Q3M8V-edycuoi8ra&sz=w800-h600", "https://drive.google.com/thumbnail?id=14SkYoBSRByGVZ4v_adqVbdzjqJNUPygY&sz=w800-h600"]	available	1057	1C4BJWEG0EL300349	f	2025-08-07 04:48:16.106121	2025-08-07 06:22:40.22	\N
dbc30bc1-a9ba-4104-9a60-b348d410cf0b	Honda	Civic	2018		17999.00	98964	White	Grey	gasoline	CVT	FWD		5	Backup Camera; Cloth Seats; Automatic Climate Control; Moonroof/Sunroof	[]	["https://drive.google.com/thumbnail?id=1ahTVcnbbMsVT3A4sXLXWeErnAp9my3or&sz=w800-h600", "https://drive.google.com/thumbnail?id=1vJTUkQykIFjsc8ekelEkqN96U0F0d1QD&sz=w800-h600", "https://drive.google.com/thumbnail?id=1KT-AtYYWXNFbxJIzxVCWR0W7cDGhZqWa&sz=w800-h600", "https://drive.google.com/thumbnail?id=1d3JadD7LRp498u6TANDH-ezI_G3Iwo8G&sz=w800-h600", "https://drive.google.com/thumbnail?id=1NNJkiysO2yqGuv6CsHKPXeTQhSa35GxH&sz=w800-h600", "https://drive.google.com/thumbnail?id=1LqboP2I5aXqHEqVXnVa61ybKh-UpEWpr&sz=w800-h600", "https://drive.google.com/thumbnail?id=1W08RSFLvDv5Lil7AagQJkVABIyAzsrii&sz=w800-h600", "https://drive.google.com/thumbnail?id=1NaJUnE6fVuoSNByDtl6_fOKVzgZFfAsD&sz=w800-h600", "https://drive.google.com/thumbnail?id=1kyBMnWQn0fRnp2BZPbszLUQae4CUA7MD&sz=w800-h600"]	available	1027	19XFC2F70JE022722	f	2025-08-07 04:47:55.748087	2025-08-07 06:37:15.435	\N
801ec38c-89d8-46bf-acd7-7e247cadb8a3	Ford	Escape SE	2018		11999.00	107070	BLUE	grey	gasoline	Automatic	AWD		5		[]	["https://drive.google.com/thumbnail?id=1G531PPAHtwOXgFtJz2KJumGdhM9zUljj&sz=w800-h600", "https://drive.google.com/thumbnail?id=1gXEp_LtNY3eRlW2yR9SdBYdmKhvRdQn_&sz=w800-h600", "https://drive.google.com/thumbnail?id=15D7hnoIg_aPV1HuNARFa6HlFET1rMkPe&sz=w800-h600", "https://drive.google.com/thumbnail?id=1fH7tZsiwdRUsROebGP83pKKR_FiRvqDr&sz=w800-h600", "https://drive.google.com/thumbnail?id=1UKgcT5GS7Y22D7hjZZ7Lp1sIM2tdMyGZ&sz=w800-h600", "https://drive.google.com/thumbnail?id=1GlwtQIyufm_aIwulH_kYFVkL_qG_0gO3&sz=w800-h600", "https://drive.google.com/thumbnail?id=1Cas_xMwJWcvqX37hY29gyVyF2wIXxkwz&sz=w800-h600", "https://drive.google.com/thumbnail?id=1dAJ_Nmzumo7B4O_ya4KYIx-YtH80Pv2b&sz=w800-h600", "https://drive.google.com/thumbnail?id=1eMlR_NKNq4eewHePm43nZ05MRLpnbPpa&sz=w800-h600", "https://drive.google.com/thumbnail?id=15IB3smdnvR_eFBG4cw6pwyGAeixco-A5&sz=w800-h600"]	available	1072	1FMCU9GD6JUB05744	f	2025-08-07 04:48:33.49966	2025-08-07 06:04:50.944	\N
d11d1f8f-292a-4dff-90cc-bc67fb2a4140	GMC	Yukon XL	2013		15999.00	82404	SILVER	grey	gasoline	Automatic	4WD		5		[]	["https://drive.google.com/thumbnail?id=15_ltuUKwQ_t0FyEbMYd15Bj47glY-x_n&sz=w800-h600", "https://drive.google.com/thumbnail?id=1e5mbk55spqBWATH8an-o_OiWPywQw7eo&sz=w800-h600", "https://drive.google.com/thumbnail?id=1wlzIg2wRDYL1UEE5g7fCR_yTTghjxEhM&sz=w800-h600", "https://drive.google.com/thumbnail?id=1lzch5I7_Wn2Nj54Ki4pJxZFGctX4gUi9&sz=w800-h600", "https://drive.google.com/thumbnail?id=1BYmUO9GjB5ArXMKChb4jVT0nes3PZgDl&sz=w800-h600", "https://drive.google.com/thumbnail?id=1xofsG3IabRxXat1efYFVyFcKZ-Axva0R&sz=w800-h600", "https://drive.google.com/thumbnail?id=1YwvQ3iAh2oGFGOVBC_USFS8zrpGBLzDH&sz=w800-h600", "https://drive.google.com/thumbnail?id=147MQiOrhOKJcOUfGiBPXtqxJdIX0dgKL&sz=w800-h600"]	available	1071	1GKS2HE71DR279584	f	2025-08-07 04:48:31.347877	2025-08-07 06:07:05.99	\N
a3a3363c-dce4-4d65-aae6-8727f9fb7aa2	Subaru	Crosstrek	2018		18999.00	110428	GREY	BLACK/GREY	gasoline	CVT	AWD		5		[]	["https://drive.google.com/thumbnail?id=17_5wmIQmD-EOkKn8XqViMzNENpzK5v_y&sz=w800-h600", "https://drive.google.com/thumbnail?id=1_pkRT12eAt8mBeDTbmt3ylolwkLeeQl5&sz=w800-h600", "https://drive.google.com/thumbnail?id=1YJO1Lp_fUAd0e5pAcbdjeiH7ZMxT3vXR&sz=w800-h600", "https://drive.google.com/thumbnail?id=1jwwDNrQ57we8VPJu-BEfhQawzYOVEt0T&sz=w800-h600", "https://drive.google.com/thumbnail?id=1rZCQhKpWpw0TlOzuc_jqcGotqJLMNUIe&sz=w800-h600", "https://drive.google.com/thumbnail?id=10uyLTm8Zyd85blY5um72V5hTU-0WmnR_&sz=w800-h600", "https://drive.google.com/thumbnail?id=1S1lsHi5yoY-ETqktmIg8F2XVVYelLUvF&sz=w800-h600", "https://drive.google.com/thumbnail?id=1ScJYMuJeae7X5tewtUo5oeCG9nInJbEw&sz=w800-h600"]	available	1070	JF2GTAJC0JH207352	f	2025-08-07 04:48:29.279925	2025-08-07 06:10:07.648	\N
ea14a9a0-f353-42bf-98c1-7929918ae898	Updated Make	Flex SEL	2013		8481.00	155359	white	grey	gasoline	Automatic	AWD		5		[]	["https://drive.google.com/thumbnail?id=1RSnKRCUiAaOv72-RSDSEvBoTGUaOA2q4&sz=w800-h600"]	available	1008	2FMGK5C87DBD26742	f	2025-08-07 04:47:45.485008	2025-08-07 06:40:57.431	\N
a1297286-d490-4106-8d5b-f12672779ff3	Chevrolet	Traverse	2019		19999.00	94186	GRAY	black	gasoline	Automatic	AWD		5	Backup Camera; Cloth Seats; Heated Passenger Seat; Heated Driver	[]	["https://drive.google.com/thumbnail?id=123CwYsiUU-2Okd8un0AvAzJxaxqeoCsI&sz=w800-h600", "https://drive.google.com/thumbnail?id=1dy8K-aqnXB6qvhcVszmtKqDtm3DtnrDR&sz=w800-h600", "https://drive.google.com/thumbnail?id=1p-Wc7qGPZCl6AChaSKehcQu4-_nw75BT&sz=w800-h600", "https://drive.google.com/thumbnail?id=1UuBGUaOUa2HgagaUiAPAOEoVE3-usZjv&sz=w800-h600", "https://drive.google.com/thumbnail?id=1y-UBx90V15x2P0vIqTUOk85s9ZF9Z5TC&sz=w800-h600"]	available	1055	1GNEVGKW9KJ260256	t	2025-08-07 04:47:45.485008	2025-08-07 19:52:58.437	\N
4a526d42-4522-4e00-8a57-03b801d74ecb	Dodge	Challenger	2016		16999.00	105388	RED	black	gasoline	Automatic	RWD		5		[]	["https://drive.google.com/thumbnail?id=1r4CDvH9yNAo12r1mjT4bI2xZ_Z_lUcAb&sz=w800-h600", "https://drive.google.com/thumbnail?id=13RECqopwyXmjLZocrl8uSl3FcQuUZgeK&sz=w800-h600", "https://drive.google.com/thumbnail?id=1Mr75s94QpedKtpNEDB523MFpzPO_b2vd&sz=w800-h600", "https://drive.google.com/thumbnail?id=1zAQLr4hmNZjOLAoqAD_GbdB51VstCaOk&sz=w800-h600", "https://drive.google.com/thumbnail?id=1eyqQz5jsMB_EAR3r612P3VuSXFkPCiY_&sz=w800-h600", "https://drive.google.com/thumbnail?id=1iOn_vx3NvwMiepWdVdCGJ_kA18aGTsQQ&sz=w800-h600", "https://drive.google.com/thumbnail?id=1b-pBgTWXpv_8WAwIhcGh4Y_CZAwOsZm6&sz=w800-h600", "https://drive.google.com/thumbnail?id=1AFgrqr9Yoxnr1vi67Ihpk8m-U5_-zX1D&sz=w800-h600", "https://drive.google.com/thumbnail?id=1DVu2X_Be_eUE3W0MzF6zawTuxj733q1X&sz=w800-h600", "https://drive.google.com/thumbnail?id=1bIg3raAwJf6ufOy2w6iBxOeq-U2g5u-D&sz=w800-h600"]	available	1074	2C3CDZAG3GH290245	t	2025-08-07 04:48:37.671905	2025-08-07 05:57:32.213	\N
dc2672a8-5cef-47ba-99f3-d085f1d66122	Ford	F150 XLT	2018		24999.00	105355	GREY	grey	gasoline	Automatic	4WD		5		[]	["https://drive.google.com/thumbnail?id=1F-uXnkHmW3MCFLgs4klqTlD2KGoGKsBY&sz=w800-h600", "https://drive.google.com/thumbnail?id=1A7j-t6rzf-XlNN_YK2dOu5d4iszEUbb2&sz=w800-h600", "https://drive.google.com/thumbnail?id=1mc5pPrYr4topbAWbhCeZvx3bdPE6ziuj&sz=w800-h600", "https://drive.google.com/thumbnail?id=1SyMbdpBJ3nBK9s29-ATuNuAbCCIXg2NF&sz=w800-h600", "https://drive.google.com/thumbnail?id=1IX_pQebcrWVmnIh20ojLVPSdw7b5LnaR&sz=w800-h600", "https://drive.google.com/thumbnail?id=1Oi6Ghtx-9LPCUVFzlnAUXI8flk8-txLE&sz=w800-h600", "https://drive.google.com/thumbnail?id=180sk-2huqzg4FTpjozwQnBW3AMREEjV4&sz=w800-h600", "https://drive.google.com/thumbnail?id=1tyfzwcPEhaPcodxbKzFqpbwghoaqx7CI&sz=w800-h600", "https://drive.google.com/thumbnail?id=1dCYFHoKYLu86fvBWOQY26GDD9Vpx-4RZ&sz=w800-h600", "https://drive.google.com/thumbnail?id=1fc0YOf8Obj6ydldMDBe-TNJV3KRu8Foe&sz=w800-h600"]	available	1073	1FTEW1EG1JKD72971	t	2025-08-07 04:48:35.575828	2025-08-07 06:01:35.725	\N
c9eae3c8-83fc-4b1a-a379-54a8dc48254c	Buick	Encore	2016		10999.00	124242	RED	tan	gasoline	Automatic	AWD		5		[]	["https://drive.google.com/thumbnail?id=1kp-0eTjp9wAl4A7G8yocr8WKvMK3pTzP&sz=w800-h600", "https://drive.google.com/thumbnail?id=14uzzl6kdc_J5AIZGHhJTFeOtspZ-w7rA&sz=w800-h600", "https://drive.google.com/thumbnail?id=1xh6VodXkUBybIRnOC2TzPN3gdqXEByJD&sz=w800-h600", "https://drive.google.com/thumbnail?id=1XIl5z80HrO9NyHXWsHVPwB5MYDQgFT5u&sz=w800-h600", "https://drive.google.com/thumbnail?id=1xzCnPesPWj4no-5Z5uWu8LL1v_tunQ-2&sz=w800-h600", "https://drive.google.com/thumbnail?id=1sWgpBEFSK9SScuR2DkwPna0c9yGY7tyb&sz=w800-h600", "https://drive.google.com/thumbnail?id=1U5Fl51AQzelUAYnrY5vuxvU5ZVR6GleI&sz=w800-h600", "https://drive.google.com/thumbnail?id=1efszN10y4eID4lzXZua2-ad-Yl0Q0Jum&sz=w800-h600"]	available	1068	KL4CJ2SM3GB691491	f	2025-08-07 04:48:27.555408	2025-08-07 06:12:32.319	\N
4c4b9226-f9c1-4ae4-9df9-e9bd42ea133f	Kia	Forte	2020		17999.00	52972	WHITE	Black	gasoline	CVT	FWD		5	Backup Camera; Cloth Seats; Daytime Running Lights; Touch Screen	[]	["https://drive.google.com/thumbnail?id=1B5_0Gu5SJxDfPeEolwzvMq-NO8ODx5OO&sz=w800-h600", "https://drive.google.com/thumbnail?id=1t-IhpuVx1umqwXk3gU-0FrFUSwfGsm5B&sz=w800-h600", "https://drive.google.com/thumbnail?id=1t6BrbYQa1BAwXOat64dMl9f0-XKBqdKE&sz=w800-h600", "https://drive.google.com/thumbnail?id=139WIF523zmwUyf_tXV2OOQXFb5ToW-YK&sz=w800-h600", "https://drive.google.com/thumbnail?id=1SgyAYUF9YOyw5i4zkGqwCJML8UvTM7yB&sz=w800-h600", "https://drive.google.com/thumbnail?id=1y38Rx74vLiUUhA6hRPp2xspaiadrjwme&sz=w800-h600", "https://drive.google.com/thumbnail?id=18fkPeTlOeXTgDJXYNpBGLBL4VHf5IV4D&sz=w800-h600", "https://drive.google.com/thumbnail?id=1nt15-xDRJMAdXp_enlpJDKasWZMBRSVk&sz=w800-h600", "https://drive.google.com/thumbnail?id=13UCZd2PwwHVBs2RfEN6gyWBMYayeqrok&sz=w800-h600", "https://drive.google.com/thumbnail?id=1XtMF0OAT0fo_sAkM1lOxlhTcCDzL-jiQ&sz=w800-h600"]	available	1061	3KPF24ADXLE140629	f	2025-08-07 04:48:19.714677	2025-08-07 06:15:44.829	low-miles
9d1a4243-b593-4f66-9446-7015c3503f88	Hyundai	Santa Fe	2019		13999.00	122171	SILVER	black	gasoline	Automatic	AWD		5	Backup Camera; Cloth Seats; Daytime Running Lights; Touch Screen	[]	["https://drive.google.com/thumbnail?id=19ZTY4gF4tlfiHkii9R67yenkVEu9UA3a&sz=w800-h600", "https://drive.google.com/thumbnail?id=1fak7gedby0dfFqXVLVutiJXs-Cgdmwig&sz=w800-h600", "https://drive.google.com/thumbnail?id=1HHFadgh5_MBs3Nf8jUsVFWjbevLcUiZS&sz=w800-h600", "https://drive.google.com/thumbnail?id=19sX9-BYbbxrznoE70OU-WEpfWXb8L_e0&sz=w800-h600", "https://drive.google.com/thumbnail?id=1L_KZPJ8iFAngy18kNctDv5oh2w4UcC5W&sz=w800-h600", "https://drive.google.com/thumbnail?id=1wgcQzyU3JnDjOgDszI8jCm9GW11hnHtm&sz=w800-h600", "https://drive.google.com/thumbnail?id=14NPZVdMi3kbWfHZoHf1mSahEhvY65AzP&sz=w800-h600", "https://drive.google.com/thumbnail?id=1a9Pwx3ouN_iWvW4QkDPe3fFEz002dqNX&sz=w800-h600", "https://drive.google.com/thumbnail?id=1eIdEZiYrV71938f_np2MNZXrpeS9pERV&sz=w800-h600", "https://drive.google.com/thumbnail?id=14lzE0_3Ugjf8Qfymob8rgRiN7CY6qwND&sz=w800-h600"]	available	1060	5NMS23AD7KH023428	f	2025-08-07 04:48:17.922007	2025-08-07 06:19:40.586	\N
d36a2e82-afb1-4417-9c35-93eebc9dbb57	Dodge	Journey	2019		13499.00	80889	Black	Black	gasoline	Automatic	FWD		5	Backup Camera; Cloth Seats; Dual A/C Zones; Front Fog Lights; Daytime	[]	["https://drive.google.com/thumbnail?id=1AycxHaAZiBE-11ZLrvao2t_0kE-d8PrN&sz=w800-h600", "https://drive.google.com/thumbnail?id=1LVx9y1fAhg-1h7Hor20VMd-kmCeBlCaH&sz=w800-h600", "https://drive.google.com/thumbnail?id=1LVx9y1fAhg-1h7Hor20VMd-kmCeBlCaH&sz=w800-h600", "https://drive.google.com/thumbnail?id=12ap957sP-CyXI2NydkAY76vIrpfT06kK&sz=w800-h600", "https://drive.google.com/thumbnail?id=1uMG_1HYBipdBG05981THFCvPoTyqhvxH&sz=w800-h600", "https://drive.google.com/thumbnail?id=1sk-_fSHEeu1W1jv1OuyrhqbWJJqQGKXU&sz=w800-h600", "https://drive.google.com/thumbnail?id=1vycYRuxjTi_tm7W_OP3hBMo_ChW-ZGtt&sz=w800-h600", "https://drive.google.com/thumbnail?id=1XMvKgNZ3-AAICghfJLRDsdUWxeCnQVVr&sz=w800-h600", "https://drive.google.com/thumbnail?id=13b1PkQmrzLGGEdfVmcJ9AhMety02of73&sz=w800-h600", "https://drive.google.com/thumbnail?id=14qqRYyclJv_ma7HvG_hoTy2Vc5ppa1DN&sz=w800-h600"]	available	1050	3C4PDCBB0KT874261	f	2025-08-07 04:48:14.584018	2025-08-07 06:28:02.818	\N
3d549c5f-e911-4d65-a961-421ca636baf1	Ford	Focus	2016		8999.00	154627	Silver	Black	gasoline	Automatic	FWD		5		[]	["https://drive.google.com/thumbnail?id=1mSNmssOp26l1jbEhNhxtkRiSLDqycsyy&sz=w800-h600", "https://drive.google.com/thumbnail?id=1aK-rkHTdJgl3mfsn4_LvfRdcxpy0xmFb&sz=w800-h600", "https://drive.google.com/thumbnail?id=1mRWvYLOTa1GIkbXvvEPw6bxstBbVvika&sz=w800-h600", "https://drive.google.com/thumbnail?id=1-yLrxk9nbqRXhmChxQGLHLEi2lM4HA5b&sz=w800-h600", "https://drive.google.com/thumbnail?id=1xlCzQuI8VGynsKhjJv428BwL0s1_DPlB&sz=w800-h600", "https://drive.google.com/thumbnail?id=1jdiVD_QoXP_hE2J-ih59JPokH4rY1YWp&sz=w800-h600", "https://drive.google.com/thumbnail?id=11EJTdWA84O7MFkV9JaOYoIENh_87v92A&sz=w800-h600", "https://drive.google.com/thumbnail?id=1gbIr81b8QMjwZN3ioZ7JNY58kiR_fnLz&sz=w800-h600", "https://drive.google.com/thumbnail?id=1VVXPo52UOn5XJCq6UE-NwIxRCU56aVY_&sz=w800-h600"]	available	1044	1FADP3F26GL235069	f	2025-08-07 04:47:55.748087	2025-08-07 06:32:02.612	just-reduced
ae86845c-0dc0-40f8-bf32-03fdfb4d096b	Jeep	Grand Cherokee	2014		12999.00	120955	Red	Grey	gasoline	Automatic	4WD		5	Cloth Seats; Dual A/C Zones; Automatic Climate Control; Front Fog	[]	["https://drive.google.com/thumbnail?id=17Rhp7_I48ACZ8tZFAyhBM7a7xC8qgl1U&sz=w800-h600", "https://drive.google.com/thumbnail?id=113KK13h0A9Nf_GDbh2OCswFnoVqGPJ1L&sz=w800-h600", "https://drive.google.com/thumbnail?id=1QVKdSMjKv2BqhF2e8JV2ZD-o-B8JAw_H&sz=w800-h600", "https://drive.google.com/thumbnail?id=1zHiSAKYLhKiwGHm6eHJJQZpC9Xn5mo2z&sz=w800-h600", "https://drive.google.com/thumbnail?id=1eSmK44scYrsHzO_dfBLyB5GrN1imbIuh&sz=w800-h600", "https://drive.google.com/thumbnail?id=1S6uq-vhsgkOEjWDYXbPwmnnVrGYayi2Y&sz=w800-h600", "https://drive.google.com/thumbnail?id=19k9sNGuqvNlWoa-KS3LqMN2rrsxuslsx&sz=w800-h600", "https://drive.google.com/thumbnail?id=10ZuCOou2q56cSvUnqIh2T7Q1tAmLPiyo&sz=w800-h600"]	available	1024	1C4RJFAG9EC422180	f	2025-08-07 04:47:55.748087	2025-08-07 06:34:48.558	\N
b96c93ff-feef-47ee-b816-28b96519da92	Toyota	Corolla	2015		13999.00	74684	Silver	Gray	gasoline	CVT	FWD		5	back up camera, power windows, power locks, cruise control, cd player, cloth seats	[]	["https://drive.google.com/thumbnail?id=1YwYtc_t3rrJ_b95eJySUY3RppN3gpmKC&sz=w800-h600", "https://drive.google.com/thumbnail?id=10NEaowGZWe0uWjZP6WGrnlNZXpZrneIY&sz=w800-h600", "https://drive.google.com/thumbnail?id=1oOexCjaisvm8Kp36KlXE3Q6piwKMf2jj&sz=w800-h600", "https://drive.google.com/thumbnail?id=1QiX6BUFIwRA-0X0zwjUmtT8z35u_z6LR&sz=w800-h600", "https://drive.google.com/thumbnail?id=1aIsnNuMPUvnXvWp4JLWXI41tcCzHM3jL&sz=w800-h600", "https://drive.google.com/thumbnail?id=1PAuPpqOFM9xRlS79qChuBQhV9139gDxN&sz=w800-h600", "https://drive.google.com/thumbnail?id=1m10YjP19Gqim6zHxWNcTHdsF_RQLOQax&sz=w800-h600", "https://drive.google.com/thumbnail?id=1pKogkCswB4y7oFk-ja6W8Kd5pSvuWgVc&sz=w800-h600", "https://drive.google.com/thumbnail?id=1EIWbF2jLA3kKx89oM7gaDOCKm-z_aQVC&sz=w800-h600", "https://drive.google.com/thumbnail?id=1UW2cL1ok-gPTAiiS2CrfS2-eYgYuKcLP&sz=w800-h600"]	available	1041	2T1BURHE3FC436454	f	2025-08-07 04:47:55.748087	2025-08-07 06:40:24.398	low-miles
9b0336c9-ba40-4cd9-a95e-4bad8e27b6e1	Dodge	Charger	2020		17999.00	96627	White	Black	gasoline	Automatic	RWD		5	Backup Camera; Cloth Seats; Remote Start; Dual A/C Zones	[]	["https://drive.google.com/thumbnail?id=1nnhY2iTj12Evb12qUfqbN5QlZaeZfYlD&sz=w800-h600", "https://drive.google.com/thumbnail?id=1jVVnrAmaKjEjx37MKj5qxb4UqdkGlkju&sz=w800-h600", "https://drive.google.com/thumbnail?id=1coLonvhDepsuMKGKw26ckwTmF0KPi_0Q&sz=w800-h600", "https://drive.google.com/thumbnail?id=1fMgcPHu1K_UdwXfr-GWSuEjOLI3ltVxv&sz=w800-h600", "https://drive.google.com/thumbnail?id=1y63gewgXllfVCxCeTboReamAiOm7lYny&sz=w800-h600", "https://drive.google.com/thumbnail?id=1-RuXNXma2BYAuXa_ptozXIPKJAttwZsL&sz=w800-h600", "https://drive.google.com/thumbnail?id=1WgZIgVc6CHRBZzN3ovWuNe-CKhpQRBeU&sz=w800-h600", "https://drive.google.com/thumbnail?id=1bjvbhgrXQZBlk7UMpvqWDKw4Zuyhf8DX&sz=w800-h600"]	available	1021	2C3CDXBG7LH119687	f	2025-08-07 04:47:45.485008	2025-08-07 06:43:10.725	\N
c02c1dcc-e52c-4dd6-af95-d5afd2ce8988	Chevrolet	Silverado LT	2018		19999.00	125698	White	Gray	gasoline	Automatic	4WD		5	Backup Camera; Cloth Seats; Daytime Running Lights; SiriusXM Equipped	[]	["https://drive.google.com/thumbnail?id=1ko2vxQEKJD_q-O0sxGQa6F3sHrds_q7-&sz=w800-h600", "https://drive.google.com/thumbnail?id=1CaifzJq18ZAMBMkPrq5Sq4aFkSOSJ84Z&sz=w800-h600", "https://drive.google.com/thumbnail?id=1unUPD1HVA67YIrQeH--4K8aJ54TwN2tr&sz=w800-h600", "https://drive.google.com/thumbnail?id=15jRVemkaN2rl4cTgXcUGkgJm5wgg1dUw&sz=w800-h600", "https://drive.google.com/thumbnail?id=1n57pFwGrHUoCJD5CBmVoJWMoPA4-DIki&sz=w800-h600", "https://drive.google.com/thumbnail?id=1meUM7xFlMalkQfA6zeXYXZsM3UOlJEdw&sz=w800-h600", "https://drive.google.com/thumbnail?id=1jr1QeUnMBNDJ3xnm7nYNmKBpL-r2PQxm&sz=w800-h600", "https://drive.google.com/thumbnail?id=12YvzfwRk9BLL_OBNNX9TRr_N3vHyJHiP&sz=w800-h600", "https://drive.google.com/thumbnail?id=19BJAtIZjt2H7r56Z4vyH1Njl5zqBN7CB&sz=w800-h600"]	available	1042	1GCRCREH7JZ369615	f	2025-08-07 04:47:55.748087	2025-08-07 19:40:37.33	\N
8d0e5294-b1be-442d-a52f-8e45f08b428a	Chevrolet	Cruze	2014		9999.00	103903	DARK GREEN	Tan	gasoline	Automatic	FWD		5	one touch windows, folding side/driver mirror, cruise, 12v power outlet	[]	["https://drive.google.com/thumbnail?id=1_V0B4JABwqoPCBPUXFot1SdTfTXEQCD6&sz=w800-h600", "https://drive.google.com/thumbnail?id=1xiIm67K0KESjdPYk-SEPka5kSm76mjRt&sz=w800-h600", "https://drive.google.com/thumbnail?id=1zhx1HQDSV5UMcMYNmeyyUcbRl29jYlX8&sz=w800-h600", "https://drive.google.com/thumbnail?id=1k5wFm-RBOVAJIlBHJeew1cNt3yvXxDpu&sz=w800-h600", "https://drive.google.com/thumbnail?id=1MkkQiYOUXDy_WLiZGtKNmk38TEFSgxuQ&sz=w800-h600", "https://drive.google.com/thumbnail?id=1opr9_Cl5Z--W7rUdIAokdfu-9TZh9Z20&sz=w800-h600", "https://drive.google.com/thumbnail?id=15QXGpnrpQUuvEtTRyG866zyUkh-Yq-8p&sz=w800-h600", "https://drive.google.com/thumbnail?id=1J3qRyuU5dK3u9wsqzGidfNMLnuLrL6PL&sz=w800-h600", "https://drive.google.com/thumbnail?id=1LTm7h6lmObggaDhvJ61p2Z4IndCXzWoB&sz=w800-h600"]	available	1052	1G1PB5SG7E7352046	f	2025-08-07 04:47:45.485008	2025-08-07 19:43:15.415	\N
8dc4e3dd-ebb5-4e28-bdb6-f0bae7675bb6	Wayne Enterprises Defense Division	Batmobile Tumbler X (Mark V)	1995	Dark Knight Tactical Elite Edition	2450000.00	2	black	black	gasoline	 6-speed sequential manual 		Hybrid Jet turbine & V12 turbocharged	5	cool car	[]	["data:image/webp;base64,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"]	available	1	11111111111111111	f	2025-08-10 10:37:07.142746	2025-08-10 10:37:07.142746	\N
\.


--
-- Name: financing_applications financing_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.financing_applications
    ADD CONSTRAINT financing_applications_pkey PRIMARY KEY (id);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_stock_number_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_stock_number_unique UNIQUE (stock_number);


--
-- Name: vehicles vehicles_vin_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_vin_unique UNIQUE (vin);


--
-- Name: inquiries inquiries_vehicle_id_vehicles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_vehicle_id_vehicles_id_fk FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict qh3fZ38iDkmNzBOROKbvXa2w2Ed7a09tOVxjSyK6UpM7Dnxuj6rWgsfeB7POWRO

