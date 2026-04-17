WHENEVER SQLERROR EXIT SQL.SQLCODE
ALTER SESSION SET CONTAINER = XEPDB1;
CREATE USER chuvabot IDENTIFIED BY chuvabot123 DEFAULT TABLESPACE USERS TEMPORARY TABLESPACE TEMP;
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO chuvabot;
ALTER SESSION SET CURRENT_SCHEMA = chuvabot;

-- ============================================
-- 1. APP_USER
-- ============================================
CREATE TABLE app_user (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    full_name       VARCHAR2(150)   NOT NULL,
    email           VARCHAR2(255)   NOT NULL,
    password_hash   VARCHAR2(255)   NOT NULL,
    telegram_chat_id NUMBER,
    is_active       NUMBER(1)       DEFAULT 1 NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_app_user PRIMARY KEY (id),
    CONSTRAINT uq_app_user_email UNIQUE (email),
    CONSTRAINT uq_app_user_telegram UNIQUE (telegram_chat_id),
    CONSTRAINT ck_app_user_active CHECK (is_active IN (0, 1))
);

-- ============================================
-- 2. PROJECT
-- ============================================
CREATE TABLE project (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    project_name    VARCHAR2(100)   NOT NULL,
    description     VARCHAR2(2000),
    status          VARCHAR2(20)    DEFAULT 'ACTIVE' NOT NULL,
    manager         NUMBER          NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_project PRIMARY KEY (id),
    CONSTRAINT fk_project_manager FOREIGN KEY (manager) REFERENCES app_user (id),
    CONSTRAINT ck_project_status CHECK (status IN ('ACTIVE', 'PAUSED', 'CLOSED'))
);

-- ============================================
-- 3. PROJECT_MEMBER
-- ============================================
CREATE TABLE project_member (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    project         NUMBER          NOT NULL,
    employee        NUMBER          NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_project_member PRIMARY KEY (id),
    CONSTRAINT fk_pm_project FOREIGN KEY (project) REFERENCES project (id),
    CONSTRAINT fk_pm_employee FOREIGN KEY (employee) REFERENCES app_user (id),
    CONSTRAINT uq_pm_project_employee UNIQUE (project, employee)
);

-- ============================================
-- 4. SPRINT
-- ============================================
CREATE TABLE sprint (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    project         NUMBER          NOT NULL,
    sprint_name     VARCHAR2(100)   NOT NULL,
    goal            VARCHAR2(500),
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    status          VARCHAR2(20)    DEFAULT 'PLANNING' NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_sprint PRIMARY KEY (id),
    CONSTRAINT fk_sprint_project FOREIGN KEY (project) REFERENCES project (id),
    CONSTRAINT ck_sprint_status CHECK (status IN ('PLANNING', 'ACTIVE', 'CLOSED')),
    CONSTRAINT ck_sprint_dates CHECK (end_date > start_date)
);

-- ============================================
-- 5. TASK
-- ============================================
CREATE TABLE task (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    project         NUMBER          NOT NULL,
    sprint          NUMBER,
    task_name       VARCHAR2(200)   NOT NULL,
    description     VARCHAR2(2000),
    status          VARCHAR2(20)    DEFAULT 'TODO' NOT NULL,
    priority        VARCHAR2(10),
    story_points    NUMBER          NOT NULL,
    assigned_to     NUMBER,
    created_by      NUMBER          NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_task PRIMARY KEY (id),
    CONSTRAINT fk_task_project FOREIGN KEY (project) REFERENCES project (id),
    CONSTRAINT fk_task_sprint FOREIGN KEY (sprint) REFERENCES sprint (id),
    CONSTRAINT fk_task_assigned FOREIGN KEY (assigned_to) REFERENCES app_user (id),
    CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES app_user (id),
    CONSTRAINT ck_task_status CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
    CONSTRAINT ck_task_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH'))
);

-- ============================================
-- 6. TASK_ACTIVITY
-- ============================================
CREATE TABLE task_activity (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    task            NUMBER          NOT NULL,
    employee        NUMBER          NOT NULL,
    activity_type   VARCHAR2(20)    NOT NULL,
    content         VARCHAR2(2000),
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_task_activity PRIMARY KEY (id),
    CONSTRAINT fk_ta_task FOREIGN KEY (task) REFERENCES task (id),
    CONSTRAINT fk_ta_employee FOREIGN KEY (employee) REFERENCES app_user (id),
    CONSTRAINT ck_ta_type CHECK (activity_type IN ('COMMENT', 'STATUS_CHANGE', 'SPRINT_CHANGE'))
);

-- ============================================
-- 7. AUDIT_LOG
-- ============================================
CREATE TABLE audit_log (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    employee        NUMBER          NOT NULL,
    entity_type     VARCHAR2(30)    NOT NULL,
    entity_id       NUMBER          NOT NULL,
    action          VARCHAR2(10)    NOT NULL,
    old_value       CLOB,
    new_value       CLOB,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_audit_log PRIMARY KEY (id),
    CONSTRAINT fk_al_employee FOREIGN KEY (employee) REFERENCES app_user (id),
    CONSTRAINT ck_al_entity_type CHECK (entity_type IN ('PROJECT', 'TASK', 'SPRINT', 'PROJECT_MEMBER')),
    CONSTRAINT ck_al_action CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'))
);

-- ============================================
-- 8. NOTIFICATION_LOG
-- ============================================
CREATE TABLE notification_log (
    id              NUMBER GENERATED ALWAYS AS IDENTITY,
    recipient       NUMBER          NOT NULL,
    event_type      VARCHAR2(30)    NOT NULL,
    channel         VARCHAR2(20)    DEFAULT 'TELEGRAM' NOT NULL,
    message         VARCHAR2(2000),
    delivery_status VARCHAR2(10)    NOT NULL,
    sent_at         TIMESTAMP       NOT NULL,
    CONSTRAINT pk_notification_log PRIMARY KEY (id),
    CONSTRAINT fk_nl_recipient FOREIGN KEY (recipient) REFERENCES app_user (id),
    CONSTRAINT ck_nl_event_type CHECK (event_type IN ('SPRINT_DEADLINE', 'TASK_BLOCKED', 'TASK_STATUS_CHANGE')),
    CONSTRAINT ck_nl_status CHECK (delivery_status IN ('SENT', 'FAILED'))
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_task_sprint ON task (sprint);
CREATE INDEX idx_task_project ON task (project);
CREATE INDEX idx_task_assigned ON task (assigned_to);
CREATE INDEX idx_task_status ON task (status);
CREATE INDEX idx_sprint_proj_status ON sprint (project, status);
CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_notif_recipient ON notification_log (recipient);
