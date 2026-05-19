# Plan de Certificación ISO 9001 - 3 Semanas
**Oracle_Java_Bot Task Management System**

**Fecha Inicio:** 19 de Mayo de 2026  
**Fecha Objetivo:** 9 de Junio de 2026 (21 días)  
**Versión:** 1.0

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Requisitos ISO 9001:2015](#requisitos-iso-90012015)
3. [Análisis de Brecha Actual](#análisis-de-brecha-actual)
4. [Plan Detallado por Semana](#plan-detallado-por-semana)
5. [Documentación Requerida](#documentación-requerida)
6. [Roles y Responsabilidades](#roles-y-responsabilidades)
7. [Cronograma Detallado](#cronograma-detallado)
8. [Métricas y KPIs](#métricas-y-kpis)
9. [Riesgos y Mitigación](#riesgos-y-mitigación)
10. [Checklist Pre-Auditoría](#checklist-pre-auditoría)

---

## Resumen Ejecutivo

Este plan establece una estrategia acelerada de **21 días** para implementar un Sistema de Gestión de Calidad (SGC) conforme a ISO 9001:2015. El objetivo es alcanzar la certificación a través de un auditor acreditado, asegurando que el sistema de gestión de tareas (Spring Boot API + React Frontend + Telegram Bot) cumpla con todos los requisitos de calidad, documentación, y mejora continua.

**Criterios de Éxito:**
- ✅ Todas las cláusulas ISO 9001:2015 documentadas e implementadas
- ✅ Procesos mapeados y estandarizados
- ✅ Plantillas de calidad en uso operativo
- ✅ Auditoría interna exitosa (0 hallazgos mayores)
- ✅ Documentación de no-conformidades resueltas
- ✅ Auditor externo acreditado certifica el SGC

---

## Requisitos ISO 9001:2015

### Estructura Alta (High Level Structure - HLS)

| Cláusula | Descripción | Aplica a Oracle_Java_Bot |
|----------|-------------|--------------------------|
| **4. Contexto de la Organización** | Entender el contexto interno/externo | ✅ SÍ |
| **5. Liderazgo** | Compromiso de la dirección | ✅ SÍ |
| **6. Planificación** | Objetivos de calidad, riesgos, cambios | ✅ SÍ |
| **7. Soporte** | Recursos, competencia, infraestructura, comunicación | ✅ SÍ |
| **8. Operación** | Diseño/desarrollo, control de cambios, externalización | ✅ SÍ |
| **9. Evaluación del Desempeño** | Seguimiento, auditorías internas, revisión de dirección | ✅ SÍ |
| **10. Mejora** | No-conformidades, acciones correctivas, mejora continua | ✅ SÍ |

### Elementos Clave para el Desarrollo de Software

1. **Gestión de Cambios** - Control de versiones de código y BD
2. **Gestión de Riesgos** - Identificación y mitigación pre-incidente
3. **Trazabilidad de Requisitos** - Cada feature traza a requisito → test → deployment
4. **Testing y QA** - Planes de prueba, reportes de defectos, trazabilidad
5. **Gestión de Proveedores** - OCI, Oracle DB, dependencias npm/maven
6. **Documentación Técnica** - Arquitectura, API, BD, deployment
7. **Auditorías Internas** - Revisiones periódicas, hallazgos, acciones
8. **Capacitación** - Registros de entrenamiento, competencia verificada
9. **Incident/Issue Management** - Registro, análisis, resolución
10. **Revisión de Dirección** - Reuniones trimestrales con objetivos/métricas

---

## Análisis de Brecha Actual

### Estado Actual (Baseline)

**Fortalezas Existentes:**
- ✅ Arquitectura bien documentada (CLAUDE.md, skills/)
- ✅ Base de datos normalizada con audit_log y TASK_ACTIVITY
- ✅ Control de versiones (Git)
- ✅ Infraestructura como código (Terraform/OCI)
- ✅ Documentación de API (SpringDoc OpenAPI)

**Brechas Identificadas:**

| Área | Brecha | Impacto | Esfuerzo |
|------|--------|--------|---------|
| **Documentación de Procesos** | Falta manual de procedimientos operativos | Alto | Alto |
| **Gestión de Cambios** | Sin procedimiento formal para cambios en BD/código | Alto | Alto |
| **Testing** | Sin plan formal de pruebas ni matriz de trazabilidad | Alto | Alto |
| **Gestión de Riesgos** | Sin registro de riesgos ni evaluación formal | Medio | Medio |
| **Auditorías Internas** | Sin programa de auditorías internas | Medio | Medio |
| **Capacitación** | Sin registro de competencia de personal | Medio | Bajo |
| **KPIs de Calidad** | Sin métricas definidas | Medio | Bajo |
| **Gestión de Proveedores** | Sin evaluación formal de OCI/dependencias | Bajo | Bajo |

**Brecha Total Estimada:** 70 días-persona → **Comprimido a 21 días con equipo de 3-4 personas**

---

## Plan Detallado por Semana

### SEMANA 1: Fundamentos y Documentación (19-23 Mayo)

#### Día 1-2: Setup SGC y Contexto Organizacional

**Actividades:**
1. Establecer autoridad de calidad (Representante de Dirección)
2. Crear estructura de documentación (Procedimientos, Formularios, Registros)
3. Documentar Declaración de Política de Calidad

**Entregables:**
- `QMS/Policy_Statement.md` - Política de Calidad firmada
- `QMS/Organization_Context.md` - Contexto, stakeholders, amenazas/oportunidades
- `QMS/Quality_Objectives_2026.md` - 5-7 objetivos medibles

**Responsable:** Gerente Proyecto  
**Duración:** 2 días

---

#### Día 3-5: Mapeo de Procesos Principales

**Procesos a Documentar:**
1. **GP-01: Desarrollo de Features** (Sprint Planning → Deployment)
2. **GP-02: Gestión de Cambios** (Code review → DB migration → Production)
3. **GP-03: Testing y QA** (Plan → Ejecución → Reporte)
4. **GP-04: Gestión de Incidentes** (Report → Triage → Resolution)
5. **GP-05: Gestión de Riesgos** (Identificar → Evaluar → Mitigar)

**Entregables:**
- `QMS/Processes/` carpeta con 5 archivos `.md`
- Diagramas BPMN en `QMS/Processes/BPMN/`
- Matriz RACI por proceso

**Responsable:** Tech Lead + QA Lead  
**Duración:** 3 días

---

### SEMANA 2: Implementación de Controles (26-30 Mayo)

#### Día 6-8: Gestión de Cambios y Control de Versiones

**Implementar:**
1. Procedimiento formal de PR review (mínimo 2 reviewers)
2. Pipeline de CI/CD documentado (GitHub Actions, tests obligatorios)
3. Cambios de DB requieren script de reversión
4. Changelog y versionado (SemVer)

**Entregables:**
- `QMS/GP-02-Change_Management.md` (detallado)
- `.github/workflows/` mejorados con auditoría
- `CHANGELOG.md` con formato ISO 9001
- `QMS/Change_Register.xlsx` (registro de cambios)

**Responsable:** DevOps + Backend Lead  
**Duración:** 3 días

---

#### Día 9-11: Testing, Trazabilidad y QA

**Implementar:**
1. Plan de Pruebas (Unit, Integration, E2E)
2. Matriz de trazabilidad Requisito → Test Case → Bug Report
3. Reportes de defectos (template en `QMS/Forms/`)
4. Coverage goal: ≥80% en código crítico

**Entregables:**
- `QMS/GP-03-Testing_Plan.md`
- `QMS/Requirements_Traceability_Matrix.xlsx`
- `QMS/Forms/Defect_Report_Template.md`
- Reporte de coverage actual

**Responsable:** QA Lead + Backend  
**Duración:** 3 días

---

#### Día 12: Gestión de Riesgos

**Implementar:**
1. Registro de Riesgos (Risk Register)
2. Matriz de Riesgo (Probabilidad × Impacto)
3. Planes de mitigación para riesgos Alto
4. Review trimestral

**Entregables:**
- `QMS/Risk_Register.xlsx` (≥20 riesgos identificados)
- `QMS/Risk_Assessment.md` (metodología)
- Planes de mitigación para 5-7 riesgos críticos

**Responsable:** Gerente Proyecto  
**Duración:** 1 día

---

### SEMANA 3: Auditoría Interna y Certificación (2-6 Junio)

#### Día 13-15: Auditoría Interna y Correcciones

**Ejecutar:**
1. Auditoría interna de 2 días (auditores independientes/externos)
2. Inspección de: documentación, procesos, registros, infraestructura
3. Reporte de hallazgos
4. Planes de acción para no-conformidades

**Entregables:**
- `QMS/Internal_Audit_Report.md`
- `QMS/Corrective_Action_Plan.md` (si hay hallazgos)
- Registros de cierre de acciones

**Responsable:** Auditores Internos (personal independiente del proyecto)  
**Duración:** 3 días

---

#### Día 16-18: Revisión de Dirección y Cierre de Brechas

**Ejecutar:**
1. Reunión de Revisión de Dirección (Management Review)
2. Cierre de todas las no-conformidades menores
3. Validación de implementación
4. Preparación para auditoría externa

**Entregables:**
- `QMS/Management_Review_Minutes.md`
- Lista de verificación final (checklista)
- Declaración de cumplimiento

**Responsable:** Dirección + Representante de Calidad  
**Duración:** 3 días

---

#### Día 19-21: Auditoría Externa y Certificación

**Auditoría Externa (3 días completos):**
1. Día 1: Auditoría inicial (scope, documentación, interviews)
2. Día 2: Auditoría en profundidad (procesos, registros, pruebas)
3. Día 3: Cierre de auditoría, hallazgos, certificación

**Entregables:**
- Reporte de Auditoría Externa (de auditores acreditados)
- Certificado ISO 9001:2015 (si es exitoso)
- Plan de mejora continua post-certificación

**Responsable:** Auditores Externos Acreditados  
**Duración:** 3 días

---

## Documentación Requerida

### Estructura de Carpetas QMS

```
QMS/
├── Policy_Statement.md                    # Política de Calidad
├── Organization_Context.md                 # Contexto organizacional
├── Quality_Objectives_2026.md              # Objetivos de calidad
├── Quality_Management_System_Overview.md   # Descripción del SGC
│
├── Processes/
│   ├── BPMN/                              # Diagramas en formato BPMN
│   ├── GP-01-Feature_Development.md
│   ├── GP-02-Change_Management.md
│   ├── GP-03-Testing_and_QA.md
│   ├── GP-04-Incident_Management.md
│   ├── GP-05-Risk_Management.md
│   ├── GP-06-Supplier_Management.md
│   ├── GP-07-Training_and_Competence.md
│   ├── GP-08-Internal_Audit.md
│   ├── GP-09-Management_Review.md
│   └── GP-10-Corrective_Action.md
│
├── Forms/
│   ├── Defect_Report_Template.md
│   ├── Change_Request_Template.md
│   ├── Risk_Assessment_Form.md
│   ├── Training_Record_Template.md
│   ├── Audit_Checklist.md
│   ├── Non_Conformity_Report.md
│   └── Corrective_Action_Form.md
│
├── Registers/
│   ├── Change_Register.xlsx               # Control de cambios
│   ├── Risk_Register.xlsx                 # Registro de riesgos
│   ├── Defect_Register.xlsx               # Defectos encontrados
│   ├── Training_Register.xlsx             # Capacitación del personal
│   ├── Non_Conformity_Register.xlsx       # No-conformidades
│   └── Audit_Register.xlsx                # Auditorías realizadas
│
├── Standards/
│   ├── Code_Review_Standard.md            # Estándar de revisión
│   ├── Testing_Standard.md                # Estándar de testing
│   ├── Documentation_Standard.md          # Estándar de documentación
│   ├── API_Design_Standard.md             # Estándar de API
│   └── Database_Standard.md               # Estándar de BD
│
├── Guidelines/
│   ├── Requirements_Traceability_Guide.md
│   ├── Risk_Assessment_Methodology.md
│   ├── Supplier_Evaluation_Criteria.md
│   └── Competence_Assessment_Guide.md
│
├── Reports/
│   ├── Internal_Audit_Report.md
│   ├── Management_Review_Minutes.md
│   ├── Quality_Metrics_Report.md
│   ├── Defect_Trend_Analysis.md
│   └── Corrective_Action_Effectiveness.md
│
└── Compliance/
    ├── ISO_9001_2015_Mapping.xlsx         # Mapeo de requisitos
    ├── Compliance_Statement.md
    └── Certificates/
        └── ISO_9001_Certificate.pdf       # Certificado final
```

---

## Roles y Responsabilidades

### Estructura de Gobernanza

```
┌─────────────────────────────────────────┐
│   Dirección General / CEO               │ ← Patrocinador (compromiso)
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    ┌────v─────────────────┴────┐
    │ Comité de Calidad         │
    │ (Mensual)                 │
    │ - Gerente Proyecto        │
    │ - Tech Lead               │
    │ - QA Lead                 │
    │ - Representante Calidad   │
    └────┬─────────────────┬────┘
         │                 │
    ┌────v────┐       ┌────v────┐
    │ Equipo  │       │ Auditores│
    │Técnico  │       │Internos  │
    │(12 personas)    │(2-3 independientes)
    └─────────┘       └──────────┘
```

| Rol | Responsabilidad | % Dedicación |
|-----|-----------------|--------------|
| **Representante de Dirección para Calidad** | Aprueba política, supervisa SGC, media en conflictos | 20% |
| **Gerente de Proyecto** | Coordina planes, timeline, recursos | 100% |
| **Tech Lead (Backend)** | Documenta procesos técnicos, gestión de cambios | 30% |
| **QA Lead** | Plan de testing, matriz de trazabilidad, auditorías | 40% |
| **DevOps/DBA** | CI/CD, control de cambios BD, infraestructura | 25% |
| **Desarrolladores (3)** | Implementan estándares, capacitación, auditorías internas | 15% cada uno |
| **Auditores Internos (2-3)** | Ejecutan auditoría interna (Día 13-15) | 100% por 3 días |
| **Auditores Externos (acreditados)** | Auditoría externa (Día 19-21) | Contratados |

---

## Cronograma Detallado

### Timeline Gantt (21 días)

```
SEMANA 1: Fundamentos (19-23 Mayo)
├─ Día 1-2:   [████] Setup SGC, Contexto
├─ Día 3-5:   [████] Mapeo Procesos
└─ Día 6:     [██  ] Revisión Dirección (kickoff)

SEMANA 2: Implementación (26-30 Mayo)
├─ Día 6-8:   [████] Gestión de Cambios
├─ Día 9-11:  [████] Testing & Trazabilidad
├─ Día 12:    [██  ] Gestión de Riesgos
└─ Día 13:    [██  ] Capacitación de personal

SEMANA 3: Certificación (2-6 Junio)
├─ Día 14-16: [████] Auditoría Interna
├─ Día 17-18: [████] Correcciones & Management Review
└─ Día 19-21: [████] Auditoría Externa & Certificación
```

### Hitos Críticos

| Fecha | Hito | Criterio de Éxito | Responsable |
|-------|------|------------------|-------------|
| **23 May** | Documentación de Procesos Completa | 10 procedimientos finalizados | Tech Lead |
| **27 May** | Gestión de Cambios Implementada | Pipeline CI/CD auditado, 100% compliance | DevOps |
| **30 May** | Plan de Testing Aprobado | Coverage ≥80%, matriz de trazabilidad | QA Lead |
| **30 May** | Registro de Riesgos Completado | ≥20 riesgos, planes de mitigación | Gerente |
| **2 Jun** | Auditoría Interna Iniciada | Auditores designados, scope confirmado | Dirección |
| **4 Jun** | No-conformidades Resueltas | 100% acciones correctivas cerradas | Equipo |
| **6 Jun** | Auditoría Externa Completada | Certificado otorgado (0 no-conf. mayores) | Auditores Externos |

---

## Métricas y KPIs

### Indicadores de Desempeño de Calidad

#### 1. **Cumplimiento de Procesos**

```
Métrica: Adherencia a Procedimientos Documentados
Fórmula: (Procesos seguidos / Procesos documentados) × 100
Meta: ≥95%
Frecuencia: Semanal
Responsable: QA Lead
```

#### 2. **Cobertura de Testing**

```
Métrica: Cobertura de Código
Fórmula: (Líneas ejecutadas en tests / Líneas totales) × 100
Meta: ≥80% (mínimo), ≥90% (ideal)
Frecuencia: Por release
Responsable: QA Lead
```

#### 3. **Trazabilidad de Requisitos**

```
Métrica: Requirements Traceability Index (RTI)
Fórmula: (Requisitos con test case y bugtrack / Total requisitos) × 100
Meta: 100%
Frecuencia: Por sprint
Responsable: QA Lead
```

#### 4. **Gestión de Cambios**

```
Métrica: Cambios revisados y aprobados
Fórmula: (Cambios con aprobación / Total cambios) × 100
Meta: 100%
Frecuencia: Diaria
Responsable: DevOps
```

#### 5. **Defect Rate (Densidad de Defectos)**

```
Métrica: Defectos por 1000 líneas de código
Fórmula: (Total defectos críticos + mayores / KLOC) × 1000
Meta: <2 defectos / KLOC
Frecuencia: Mensual
Responsable: QA Lead
```

#### 6. **Mean Time to Resolution (MTTR)**

```
Métrica: Tiempo promedio de resolución de incidentes
Fórmula: Σ(tiempo resolución) / número de incidentes
Meta: <8 horas (críticos), <24 horas (mayores)
Frecuencia: Diaria
Responsable: Gerente de Proyecto
```

#### 7. **Cumplimiento de Auditorías Internas**

```
Métrica: Hallazgos de auditoría interna
Fórmula: (No-conformidades encontradas / Puntos auditados) × 100
Meta: <5% (hallazgos menores)
Frecuencia: Trimestral
Responsable: Auditores Internos
```

#### 8. **Capacitación y Competencia**

```
Métrica: Personal capacitado en ISO 9001
Fórmula: (Empleados completados / Total empleados) × 100
Meta: 100%
Frecuencia: Al inicio, luego anual
Responsable: HR + Representante de Calidad
```

### Dashboard de Métricas

```
┌─────────────────────────────────────────────────┐
│  ISO 9001 Quality Dashboard (actualizado semanal)│
├─────────────────────────────────────────────────┤
│ ✅ Cumplimiento de Procesos: 94%    [████░░░░] │
│ ✅ Code Coverage: 82%                [████████░] │
│ ✅ RTI (Trazabilidad): 97%          [████████░░] │
│ ✅ Cambios Aprobados: 100%          [█████████░] │
│ ✅ Defect Rate: 1.2/KLOC            [████░░░░░] │
│ ⏳ MTTR: 6.5 horas                  [████░░░░░] │
│ ✅ Auditoría Interna: 97%           [████████░░] │
│ ✅ Capacitación: 100%               [█████████░] │
└─────────────────────────────────────────────────┘
```

---

## Riesgos y Mitigación

### Registro de Riesgos (Risk Register)

| ID | Riesgo | Probabilidad | Impacto | Riesgo | Mitigación | Responsable |
|----|--------|--------------|---------|--------|-----------|-------------|
| R01 | Falta de comprensión del ISO 9001 por equipo | Media | Alto | **ALTO** | Capacitación externa de 2 días (Día 1-2) | Gerente |
| R02 | Documentación incompleta en Semana 1 | Alta | Medio | **ALTO** | Asignación de recursos dedicados (2 personas) | Tech Lead |
| R03 | Auditoría interna descubre hallazgos mayores | Media | Alto | **ALTO** | Mock-audit en Día 12 | QA Lead |
| R04 | Cambios de última hora en Semana 3 | Baja | Alto | **MEDIO** | Freeze de cambios desde Día 17 | DevOps |
| R05 | Auditores externos no disponibles | Baja | Alto | **MEDIO** | Reservar auditores en Día 1 | Dirección |
| R06 | Baja participación de equipo técnico | Media | Medio | **MEDIO** | Plan de comunicación semanal, incentivos | Gerente |
| R07 | Incidentes en producción durante implementación | Baja | Alto | **MEDIO** | On-call team, escalation procedure | DevOps |
| R08 | Bases de datos/infraestructura cambio inconsistente | Media | Medio | **MEDIO** | Procedimiento de cambios con rollback | DBA |
| R09 | Falta de coordinación entre equipos | Media | Bajo | **BAJO** | Meetings diarias de 15 min (standup) | Gerente |
| R10 | Presupuesto excedido | Baja | Medio | **BAJO** | Tracking semanal de costos, auditores baratos | CFO |

### Estrategia de Mitigación

1. **Capacitación Intensiva (Día 1):** Taller de 8 horas sobre ISO 9001 para todo el equipo
2. **Recursos Dedicados:** 2 personas full-time en documentación (Días 1-5)
3. **Mock Audit (Día 12):** Simulacro de auditoría para identificar gaps antes de auditoría real
4. **Freeze de Cambios (Día 17+):** Solo cambios críticos permitidos
5. **Reserva de Auditores (Día 1):** Contratación formal de auditores externos
6. **Comunicación Semanal:** Reunión de Dirección todos los viernes

---

## Checklist Pre-Auditoría

### Lista de Verificación Final (Día 18)

#### Documentación (30 puntos)

- [ ] Política de Calidad aprobada y publicada
- [ ] 10 Procedimientos documentados (GP-01 a GP-10)
- [ ] 8+ Formularios de registro (Defect, Change, Risk, etc.)
- [ ] Documentación de Procesos con diagramas BPMN
- [ ] Manual de Calidad actualizado
- [ ] Documento de Contexto Organizacional
- [ ] Matriz RACI por proceso

#### Implementación Técnica (25 puntos)

- [ ] CI/CD pipeline con auditoría de cambios
- [ ] Control de versiones con política de branches
- [ ] Database migration scripts con rollback
- [ ] Cobertura de código ≥80% en módulos críticos
- [ ] Matriz de Trazabilidad Requisito→Test→Bug
- [ ] API documentada con OpenAPI/Swagger
- [ ] Configuración de infraestructura (Terraform) versionada

#### Registros y Evidencia (20 puntos)

- [ ] Registro de Cambios (≥50 cambios auditados)
- [ ] Registro de Riesgos (≥20 riesgos identificados)
- [ ] Registro de Defectos (≥30 defectos encontrados/resueltos)
- [ ] Registro de Capacitación (100% del equipo)
- [ ] Registro de Auditoría Interna completado
- [ ] Registro de No-conformidades y correcciones
- [ ] Acta de Reuniones de Dirección

#### Gestión de Cambios (10 puntos)

- [ ] Procedimiento GP-02 documentado e implementado
- [ ] Cambios de BD requieren rollback scripts
- [ ] Code reviews con mínimo 2 aprobadores
- [ ] CI/CD bloquea merge sin tests verdes
- [ ] Changelog mantenido en formato SemVer

#### Testing y Calidad (10 puntos)

- [ ] Plan de Testing documentado
- [ ] Test cases cubiertos en matriz de trazabilidad
- [ ] Defect reports en formato estándar
- [ ] Trazabilidad de defectos a requisitos
- [ ] MTTR < 8 horas para críticos

#### Competencia y Capacitación (5 puntos)

- [ ] Todos los empleados capacitados en ISO 9001 (registro firmado)
- [ ] Evaluación de competencia completada
- [ ] Plan de entrenamiento de nuevos empleados documentado

---

## Implementación por Componentes

### 1. Spring Boot REST API

**Cambios Requeridos:**

```java
// Audit interceptor para trazabilidad
@Component
public class AuditInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) {
        // Log de cambios de API: usuario, timestamp, endpoint, método
        auditService.log(request.getUserPrincipal(), 
                        request.getRequestURI(),
                        request.getMethod());
        return true;
    }
}

// Control de cambios en service layer
@Service
public class ChangeManagementService {
    public void logChange(String entityType, Long entityId, 
                         String oldValue, String newValue) {
        // Registrar en AUDIT_LOG conforme a GP-02
        auditLog.save(new AuditLogEntry(
            entityType, entityId, 
            Action.UPDATE, oldValue, newValue
        ));
    }
}
```

**Documentación Requerida:**
- `docs/API_Audit_Trail.md`
- `docs/Change_Control_Integration.md`

---

### 2. React Frontend

**Cambios Requeridos:**
- Componentes de auditoría de usuario (quién cambió qué)
- Validaciones conforme a estándares
- Logging de errores y excepciones

**Documentación Requerida:**
- `docs/Frontend_Testing_Plan.md`
- `docs/Frontend_Code_Standards.md`

---

### 3. Telegram Bot

**Cambios Requeridos:**
- Logging de interacciones de usuario
- Manejo de errores conforme a GP-04
- Integración con sistema de notificaciones

**Documentación Requerida:**
- `docs/Bot_Testing_Plan.md`
- `docs/Bot_Error_Handling.md`

---

### 4. Infraestructura OCI

**Cambios Requeridos:**
- Terraforming documentado con change log
- Backups automatizados (evidencia de disponibilidad)
- Monitoring y alertas (cumplimiento de SLA)

**Documentación Requerida:**
- `terraform/CHANGE_LOG.md`
- `docs/Infrastructure_Disaster_Recovery.md`

---

## Plantillas Clave

### Plantilla 1: Procedimiento (GP-XX)

```markdown
# Procedimiento: [Nombre]
**Código:** GP-XX  
**Versión:** 1.0  
**Fecha Efectiva:** [Fecha]  
**Responsable:** [Rol]  
**Aprobado Por:** [Dirección]

## 1. Propósito
[Descripción clara del objetivo]

## 2. Alcance
- ¿A quién aplica?
- ¿Qué procesos cubre?

## 3. Definiciones
- Términos técnicos
- Acrónimos

## 4. Responsabilidades
| Rol | Responsabilidad |
|-----|-----------------|
| [Rol] | [Acción] |

## 5. Procedimiento Paso a Paso
1. Paso 1: [Acción]
   - Sub-paso 1a
   - Sub-paso 1b
2. Paso 2: [Acción]
3. ...

## 6. Registros y Documentación
- [Formulario] - [Ubicación]
- [Registro] - [Responsable]

## 7. Revisión y Mejora
- Frecuencia de revisión: Anual (o cuando cambie el proceso)
- Historial de cambios: [Ver tabla abajo]

| Versión | Fecha | Cambio | Autor |
|---------|-------|--------|-------|
| 1.0 | [Fecha] | Creación inicial | [Nombre] |
```

### Plantilla 2: Reporte de Auditoría Interna

```markdown
# Reporte de Auditoría Interna
**Fecha:** [Fecha]  
**Período Auditado:** [Rango de Fechas]  
**Auditores:** [Nombres]  
**Área Auditada:** [Proceso/Departamento]

## Hallazgos

### No-conformidades Mayores
| ID | Descripción | Evidencia | Proceso | Acción Correctiva | Fecha de Cierre |
|----|-------------|-----------|---------|------------------|-----------------|
| H01 | [Descripción] | [Evidencia] | GP-XX | [Acción] | [Fecha] |

### No-conformidades Menores
| ID | Descripción | Evidencia | Proceso | Acción Mejora |
|----|-------------|-----------|---------|---------------|
| H02 | [Descripción] | [Evidencia] | GP-XX | [Acción] |

### Oportunidades de Mejora
- [Oportunidad 1]
- [Oportunidad 2]

## Conclusión
[Evaluación general del cumplimiento]

**Firmado por Auditores:** __________________ **Fecha:** __________
```

---

## Timeline Visual Expandido

### Línea de Tiempo Diaria (21 días)

```
MAYO
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ 19 Mayo  │ 20 Mayo  │ 21 Mayo  │ 22 Mayo  │ 23 Mayo  │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ [Día 1]  │ [Día 2]  │ [Día 3]  │ [Día 4]  │ [Día 5]  │
│ Setup    │ Política │ Mapeo    │ BPMN     │ RACI     │
│ Contexto │ Objetivos│ Procesos │ Diagramas│ Matriz   │
└──────────┴──────────┴──────────┴──────────┴──────────┘

│ 26 Mayo  │ 27 Mayo  │ 28 Mayo  │ 29 Mayo  │ 30 Mayo  │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ [Día 6]  │ [Día 7]  │ [Día 8]  │ [Día 9]  │ [Día 10] │
│ Cambios  │ CI/CD    │ Versión  │ Testing  │ Coverage │
│ PR Rules │ Pipeline │ SemVer   │ Plan     │ ≥80%     │
└──────────┴──────────┴──────────┴──────────┴──────────┘

JUNIO
│ 2 Junio  │ 3 Junio  │ 4 Junio  │ 5 Junio  │ 6 Junio  │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│ [Día 13] │ [Día 14] │ [Día 15] │ [Día 16] │ [Día 17] │
│ Audit    │ Auditoría│ Auditoría│ Correc   │ Final    │
│ Interna  │ Interna  │ Interna  │ Acciones │ Review   │
└──────────┴──────────┴──────────┴──────────┴──────────┘

│ 9 Junio  │
├──────────┤
│ [Día 21] │
│ Certif.  │
│ Otorgada │
└──────────┘
```

---

## Estimación de Recursos

### Equipo Requerido

| Rol | Cantidad | Dedicación | Costo (Ejemplo) | Total |
|-----|----------|-----------|---|---|
| Gerente de Proyecto | 1 | 100% (21 días) | $100/día | $2,100 |
| Tech Lead | 1 | 30% (21 días) | $120/día | $756 |
| QA Lead | 1 | 40% (21 días) | $110/día | $924 |
| DevOps/DBA | 1 | 25% (21 días) | $115/día | $604 |
| Desarrolladores | 3 | 15% (21 días) | $90/día | $1,134 |
| Auditores Internos | 2 | 100% (3 días) | $150/día | $900 |
| Auditores Externos (acreditados) | 2-3 | 100% (3 días) | $200/día | $1,200 |
| Capacitador ISO 9001 | 1 | 100% (1 día) | $500 | $500 |
| **Total Recursos Internos** | | | | **$5,518** |
| **Total Recursos Externos** | | | | **$2,600** |
| **Total del Proyecto** | | | | **$8,118** |

### Herramientas Requeridas

| Herramienta | Uso | Costo | Duración |
|-------------|-----|-------|---------|
| Audit Management Software (opcional) | Registro de auditorías | Gratuito (Excel) o $50/mes | 21 días |
| Diseño de BPMN (draw.io / Lucidchart) | Diagramas de procesos | Gratuito o $50/mes | 5 días |
| GitHub Actions CI/CD | Control de cambios | Incluido en GitHub | Permanente |
| Jira/Azure DevOps (opcional) | Tracking de tareas | Gratuito (pequeño equipo) | Permanente |
| **Costo Total Herramientas** | | **$0-200** | **21 días** |

---

## Próximos Pasos Post-Certificación

### Plan de Sostenimiento (Año 1)

1. **Auditorías Internas Trimestrales** (4/año)
   - Cada auditoría cubre 25% de los procesos
   - Duración: 2 días por auditoría

2. **Revisión de Dirección Trimestral**
   - Evaluación de KPIs
   - Análisis de no-conformidades
   - Actualización de objetivos

3. **Mantenimiento de Documentación**
   - Revisión anual de procedimientos
   - Actualización si hay cambios en procesos

4. **Auditoría Externa de Vigilancia**
   - Año 1 (6 meses post-certificación): Auditoría de seguimiento
   - Año 2: Auditoría de seguimiento
   - Año 3: Re-certificación (nueva auditoría completa)

5. **Mejora Continua**
   - Recopilar sugerencias del equipo
   - Implementar mejoras identificadas en auditorías
   - Actualizar matriz de riesgos

---

## Anexo A: Mapeo ISO 9001:2015 → Procesos de Oracle_Java_Bot

| Cláusula ISO | Requisito | Proceso(s) Aplicable(s) | Evidencia |
|--------------|-----------|-------------------------|-----------|
| 4.1 | Comprender contexto de la organización | Documento de Contexto | `QMS/Organization_Context.md` |
| 4.2 | Comprender stakeholders | Análisis de stakeholders | `QMS/Stakeholder_Analysis.md` |
| 5.1 | Liderazgo de dirección | Política de Calidad | `QMS/Policy_Statement.md` |
| 6.1 | Planificación cambios | GP-02 Gestión de Cambios | `QMS/Processes/GP-02-Change_Management.md` |
| 6.2 | Objetivos de calidad | Objetivos 2026 | `QMS/Quality_Objectives_2026.md` |
| 7.1 | Recursos | Plan de Recursos | `QMS/Resource_Plan.md` |
| 7.2 | Competencia | Registro de Capacitación | `QMS/Registers/Training_Register.xlsx` |
| 7.3 | Conciencia | Inducción ISO 9001 | `Training Materials/ISO9001_Induction.pptx` |
| 8.1 | Planificación operacional | GP-01 Desarrollo de Features | `QMS/Processes/GP-01-Feature_Development.md` |
| 8.2 | Requisitos del cliente | GP-01 Requirements Gathering | `QMS/Requirements_Traceability_Matrix.xlsx` |
| 8.3 | Diseño y desarrollo | GP-01 Design Review | `Code Review Standards` |
| 8.4 | Control de cambios externos | GP-02 Change Management | `QMS/Processes/GP-02-Change_Management.md` |
| 8.5 | Gestión de cambios | GP-02 Configuration Management | `.github/workflows/` + `terraform/` |
| 8.6 | Liberación de productos | GP-01 Deployment Procedure | `Deployment_Checklist.md` |
| 9.1 | Seguimiento | Dashboard de KPIs | `QMS/Metrics_Dashboard.md` |
| 9.2 | Auditoría interna | GP-08 Internal Audit | `QMS/Processes/GP-08-Internal_Audit.md` |
| 9.3 | Revisión de dirección | GP-09 Management Review | `QMS/Processes/GP-09-Management_Review.md` |
| 10.2 | No-conformidad | GP-10 Corrective Action | `QMS/Processes/GP-10-Corrective_Action.md` |
| 10.3 | Mejora continua | Registro de Mejoras | `QMS/Continuous_Improvement_Log.md` |

---

## Anexo B: Matriz de Responsabilidades (RACI)

```
         Setup  Docs  Impl  Test  Audit Review Cert
GP-01    A      R     C     C     R     A      I
GP-02    A      R     C     C     R     A      I
GP-03    A      R     C     C     R     A      I
GP-04    A      R     C     C     R     A      I
GP-05    A      R     C     C     R     A      I
GP-06    A      R     C     C     R     A      I
GP-07    A      R     C     I     R     A      I
GP-08    I      R     C     C     C     A      R
GP-09    I      R     I     I     I     C      A
GP-10    I      R     C     C     R     A      I

A = Accountable (Responsable)
R = Responsible (Responsable de hacer)
C = Consulted (Consultado)
I = Informed (Informado)
```

---

## Conclusión

Este plan de 21 días proporciona una ruta clara y realista para alcanzar la certificación ISO 9001:2015. Los elementos clave son:

✅ **Documentación Completa** (10 procedimientos + registros)  
✅ **Implementación Técnica** (CI/CD, Testing, Auditoría)  
✅ **Auditorías Internas** (identificación y corrección de gaps)  
✅ **Equipo Dedicado** (3-4 personas a tiempo completo)  
✅ **Presupuesto Realista** (~$8,000 USD total)  

**La clave del éxito es:** documentar + implementar + auditar + mejorar en paralelo, no secuencialmente.

El proyecto Oracle_Java_Bot está bien posicionado para la certificación gracias a su arquitectura sólida, control de versiones, y auditoría de BD. La brecha principal es la **formalización documentaria**, que se cierra en Semana 1-2.

**Próxima Acción:** Designar Representante de Calidad en Día 1 y reservar auditores externos.

---

**Documento preparado para:** PatWhite29/Oracle_Java_Bot  
**Versión:** 1.0  
**Fecha:** 19 de Mayo de 2026  
**Clasificación:** Interno - ISO 9001 Planning
