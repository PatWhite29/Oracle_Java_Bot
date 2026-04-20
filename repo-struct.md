# Repository Structure Overview — `PatWhite29/Oracle_Java_Bot`

## 1) Top-level structure

```text
Oracle_Java_Bot/
├── .claude/
├── .git/
├── CLAUDE.md
├── LICENSE
├── LICENSE.txt
├── MtdrSpring/
├── README.md
├── build_spec.yaml
├── java_checks.xml
└── videos/
```

## 2) Main project folder: `MtdrSpring/`

```text
MtdrSpring/
├── .env.example
├── .env.prod.example
├── backend/
├── destroy.sh
├── docker/
├── docker-compose.prod.yml
├── docker-compose.yml
├── env.sh
├── setup.sh
├── terraform/
└── utils/
```

### Relevant infra/deployment subfolders inside `MtdrSpring/`

- `backend/`: Spring Boot app + embedded React frontend source + Dockerfile + deploy/build scripts.
- `docker/`: local Oracle DB initialization artifacts (`initdb/`).
- `terraform/`: OCI infrastructure provisioning (`containerengine.tf`, `database.tf`, `repositories.tf`, etc.).
- `utils/`: helper scripts used by workshop/deployment flow (`main-setup.sh`, `oke-setup.sh`, `terraform.sh`, etc.).

## 3) Backend module structure (`MtdrSpring/backend/`)

```text
backend/
├── .dockerignore
├── .mvn/
├── Dockerfile
├── build.sh
├── deploy.sh
├── mvnw
├── mvnw.cmd
├── pom.xml
├── src/
│   └── main/
│       ├── frontend/
│       ├── java/
│       │   └── com/springboot/MyTodoList/
│       │       ├── MyTodoListApplication.java
│       │       ├── audit/
│       │       ├── auth/
│       │       ├── common/
│       │       ├── config/
│       │       ├── notification/
│       │       ├── project/
│       │       ├── sprint/
│       │       ├── task/
│       │       ├── telegram/
│       │       └── user/
│       └── resources/
│           ├── application-local.yml
│           ├── application.properties
│           ├── application.yml
│           └── todolistapp-springboot.yaml
└── undeploy.sh
```

## 4) Frontend module structure (`MtdrSpring/backend/src/main/frontend/`)

```text
frontend/
├── package.json
├── package-lock.json
├── postcss.config.js
├── public/
├── src/
│   ├── App.jsx
│   ├── components/
│   ├── context/
│   ├── index.css
│   ├── index.js
│   ├── pages/
│   └── services/
└── tailwind.config.js
```

Notes:
- Frontend is built with React (`react-scripts`) and integrated into the backend packaging process via Maven (see section 9).

## 5) Docker-related files

### 5.1 `MtdrSpring/backend/Dockerfile` (full content)

```dockerfile
# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# Stage 2: Run
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/MyTodoList-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 5.2 `MtdrSpring/backend/.dockerignore`

```dockerignore
target/
src/main/frontend/node_modules/
src/main/frontend/build/
*.md
```

### 5.3 `MtdrSpring/docker-compose.yml` (full content)

```yaml
services:

  db:
    image: gvenzl/oracle-xe:21-slim
    container_name: chuvabot-db
    environment:
      ORACLE_PASSWORD: admin123
    ports:
      - "1521:1521"
    volumes:
      - oracle_data:/opt/oracle/oradata
      - ./docker/initdb:/container-entrypoint-initdb.d
    healthcheck:
      test: ["CMD", "healthcheck.sh"]
      interval: 20s
      timeout: 10s
      retries: 20
      start_period: 60s

  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chuvabot-app
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DB_URL: ${DB_URL:-jdbc:oracle:thin:@//db:1521/XEPDB1}
      DB_USERNAME: ${DB_USERNAME:-chuvabot}
      DB_PASSWORD: ${DB_PASSWORD:-chuvabot123}
      JWT_SECRET: ${JWT_SECRET:-chuvabot_local_dev_secret_key_minimo32chars!!}
      JWT_EXPIRATION_MS: ${JWT_EXPIRATION_MS:-86400000}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:-}
      # Activar para ver queries SQL en docker logs:
      # SPRING_PROFILES_ACTIVE: local

volumes:
  oracle_data:
```

### 5.4 `MtdrSpring/docker-compose.prod.yml` (full content)

```yaml
services:

  app:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: chuvabot-app
    ports:
      - "8080:8080"
    volumes:
      - ${WALLET_DIR}:/wallet:ro
    environment:
      DB_URL: "jdbc:oracle:thin:@${TODO_PDB_NAME}_tp?TNS_ADMIN=/wallet"
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION_MS: ${JWT_EXPIRATION_MS:-86400000}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN:-}
```

## 6) Kubernetes manifests found

### 6.1 `MtdrSpring/backend/src/main/resources/todolistapp-springboot.yaml` (full content)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todolistapp-springboot-service
  annotations:
    oci.oraclecloud.com/loadbalancer-policy: "IP_HASH"
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local

  ports:
    - port: 80
      protocol: TCP
      targetPort: 8080
  selector:
    app: todolistapp-springboot
---
#this is new stuff for hosting on the load balancer
apiVersion: v1
kind: Service
metadata:
  name: todolistapp-backend-router
spec:
  selector:
    app: todolistapp-springboot
  ports:
    - protocol: TCP
      port: 80
      targetPort: http
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todolistapp-springboot-deployment
spec:
  selector:
    matchLabels:
      app: todolistapp-springboot
  replicas: 2
  template:
    metadata:
      labels:
        app: todolistapp-springboot
        version: v1
    spec:
      containers:
        - name: todolistapp-springboot
          image: %DOCKER_REGISTRY%/todolistapp-springboot:0.1
          imagePullPolicy: Always
          env:
            - name: db_user
              value: "TODOUSER"
            - name: db_url
              value: "jdbc:oracle:thin:@%TODO_PDB_NAME%_tp?TNS_ADMIN=/mtdrworkshop/creds"
            - name: todo.table.name
              value: "todoitem"
            - name: driver_class_name
              value: "oracle.jdbc.OracleDriver"
            - name: OCI_REGION
              value: "%OCI_REGION%"
            - name: dbpassword
              valueFrom:
                secretKeyRef:
                  name: dbuser
                  key: dbpassword
                  optional: true
            - name: ui_username
              value: "%UI_USERNAME%"
            - name: ui_password
              valueFrom:
                secretKeyRef:
                  name: frontendadmin
                  key: password
                  optional: true
          volumeMounts:
            - name: creds
              mountPath: /mtdrworkshop/creds
          ports:
            - containerPort: 8080
      restartPolicy: Always
      volumes:
        - name: creds
          secret:
            secretName: db-wallet-secret
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: todolistapp-springboot
---
```

## 7) Shell scripts requested

### 7.1 `MtdrSpring/backend/build.sh` (full content)

```bash
#!/bin/bash

export IMAGE_NAME=todolistapp-springboot
export IMAGE_VERSION=0.1


if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

export IMAGE=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_VERSION}

mvn clean package spring-boot:repackage
docker build -f Dockerfile -t $IMAGE .

docker push $IMAGE
if [  $? -eq 0 ]; then
    docker rmi "$IMAGE" #local
fi
```

### 7.2 `MtdrSpring/backend/deploy.sh` (full content)

```bash
#!/bin/bash
SCRIPT_DIR=$(pwd)

#Validation
if [ -z "$DOCKER_REGISTRY" ]; then
    export DOCKER_REGISTRY=$(state_get DOCKER_REGISTRY)
    echo "DOCKER_REGISTRY set."
fi
if [ -z "$DOCKER_REGISTRY" ]; then
    echo "Error: DOCKER_REGISTRY env variable needs to be set!"
    exit 1
fi

if [ -z "$TODO_PDB_NAME" ]; then
    export TODO_PDB_NAME=$(state_get MTDR_DB_NAME)
    echo "TODO_PDB_NAME set."
fi
if [ -z "$TODO_PDB_NAME" ]; then
    echo "Error: TODO_PDB_NAME env variable needs to be set!"
    exit 1
fi

if [ -z "$OCI_REGION" ]; then
    echo "OCI_REGION not set. Will get it with state_get"
    export OCI_REGION=$(state_get REGION)
fi
if [ -z "$OCI_REGION" ]; then
    echo "Error: OCI_REGION env variable needs to be set!"
    exit 1
fi

if [ -z "$UI_USERNAME" ]; then
    echo "UI_USERNAME not set. Will get it with state_get"
    export UI_USERNAME=$(state_get UI_USERNAME)
fi
if [ -z "$UI_USERNAME" ]; then
    echo "Error: UI_USERNAME env variable needs to be set!"
    exit 1
fi

echo "Creating springboot deplyoment and service"
export CURRENTTIME=$( date '+%F_%H:%M:%S' )
echo CURRENTTIME is $CURRENTTIME  ...this will be appended to generated deployment yaml
cp src/main/resources/todolistapp-springboot.yaml todolistapp-springboot-$CURRENTTIME.yaml

sed -i "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" todolistapp-springboot-$CURRENTTIME.yaml

sed -e "s|%DOCKER_REGISTRY%|${DOCKER_REGISTRY}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-${CURRENTTIME}.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%TODO_PDB_NAME%|${TODO_PDB_NAME}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-${CURRENTTIME}.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%OCI_REGION%|${OCI_REGION}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-$CURRENTTIME.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
sed -e "s|%UI_USERNAME%|${UI_USERNAME}|g" todolistapp-springboot-${CURRENTTIME}.yaml > /tmp/todolistapp-springboot-$CURRENTTIME.yaml
mv -- /tmp/todolistapp-springboot-$CURRENTTIME.yaml todolistapp-springboot-$CURRENTTIME.yaml
if [ -z "$1" ]; then
    kubectl apply -f $SCRIPT_DIR/todolistapp-springboot-$CURRENTTIME.yaml -n mtdrworkshop
else
    kubectl apply -f <(istioctl kube-inject -f $SCRIPT_DIR/todolistapp-springboot-$CURRENTTIME.yaml) -n mtdrworkshop
fi
```

### 7.3 `MtdrSpring/setup.sh` (full content)

```bash
#!/bin/bash
# Copyright (c) 2022 Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.


#Make sure this is run via source or .
if ! (return 0 2>/dev/null); then
  echo "ERROR: Usage 'source setup.sh'"
  exit
fi

if state_done SETUP; then
  echo "The setup has been completed"
  return
fi

SETUP_SCRIPT="$MTDRWORKSHOP_LOCATION/utils/main-setup.sh"
if ps -ef | grep "$SETUP_SCRIPT" | grep -v grep; then
  echo "The $SETUP_SCRIPT is already running.  If you want to restart it then kill it and then rerun."
else
  $SETUP_SCRIPT 2>&1 | tee -ai $MTDRWORKSHOP_LOG/main-setup.log
fi
```

## 8) Backend application config and environment files

> Redaction note: values that look like credentials/secrets are masked.

### 8.1 `MtdrSpring/backend/src/main/resources/application.properties`

```properties
# Configuration migrated to application.yml
```

### 8.2 `MtdrSpring/backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    database-platform: org.hibernate.dialect.OracleDialect
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        format_sql: false

jwt:
  secret: ${JWT_SECRET}
  expiration-ms: ${JWT_EXPIRATION_MS:86400000}

telegram:
  bot:
    token: ${TELEGRAM_BOT_TOKEN:}
    username: ${TELEGRAM_BOT_USERNAME:}

springdoc:
  swagger-ui:
    path: /swagger-ui.html
  api-docs:
    path: /v3/api-docs

logging:
  level:
    root: INFO
    com.springboot.MyTodoList: DEBUG
  pattern:
    console: "%d{HH:mm:ss} [%X{requestId:--}] %-5level %logger{36} - %msg%n"
```

### 8.3 `MtdrSpring/backend/src/main/resources/application-local.yml`

```yaml
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  logging:
    level:
      org.hibernate.SQL: DEBUG
      org.hibernate.orm.jdbc.bind: TRACE
```

### 8.4 `MtdrSpring/.env.example` (redacted)

```env
# Local dev overrides — copy this file to .env and fill in the values
# Docker Compose loads .env automatically from this directory

# Oracle DB (local)
DB_URL=jdbc:oracle:thin:@//db:1521/XEPDB1
DB_USERNAME=chuvabot
DB_PASSWORD=[REDACTED]

# JWT
JWT_SECRET=[REDACTED]
JWT_EXPIRATION_MS=86400000

# Telegram Bot — leave empty to disable the bot
TELEGRAM_BOT_TOKEN=
```

### 8.5 `MtdrSpring/.env.prod.example` (redacted)

```env
# Ruta local a la carpeta del Wallet descargado de OCI
# (la carpeta que contiene cwallet.sso, tnsnames.ora, sqlnet.ora, etc.)
WALLET_DIR=/ruta/a/tu/Wallet_NombreDB

# Nombre del PDB en Autonomous Database (sin el sufijo _tp)
TODO_PDB_NAME=tu_pdb_name

# Credenciales del schema en Autonomous DB
DB_USERNAME=chuvabot
DB_PASSWORD=[REDACTED]

# JWT — usar una clave larga y aleatoria en prod
JWT_SECRET=[REDACTED]

# Telegram Bot (opcional)
TELEGRAM_BOT_TOKEN=
```

### 8.6 `MtdrSpring/env.sh`

```bash
#!/bin/bash
# Copyright (c) 2022 Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

# Make sure this is run via source or .
if ! (return 0 2>/dev/null); then
  echo "ERROR: Usage 'source env.sh'"
  exit
fi

# POSIX compliant find and replace
function sed_i(){
  local OP="$1"
  local FILE="$2"
  sed -e "$OP" "$FILE" >"/tmp/$FILE"
  mv -- "/tmp/$FILE" "$FILE"
}
export -f sed_i

# Java Home
# -d true if file is a directory, so it's testing if this directory exists, if it does
# we are on Mac doing local dev
function set_javahome(){
  if test -d ~/graalvm-community-openjdk-22.0.2+9.1/bin; then
    # We are on Linux
    export JAVA_HOME=~/graalvm-community-openjdk-22.0.2+9.1;
  else
    # Assume MacOS
    export JAVA_HOME=~/graalvm-community-openjdk-22.0.2+9.1/Contents/Home
  fi
  export PATH=$JAVA_HOME/bin:$PATH
}

#set mtdrworkshop_location
export MTDRWORKSHOP_LOCATION="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $MTDRWORKSHOP_LOCATION
echo "MTDRWORKSHOP_LOCATION: $MTDRWORKSHOP_LOCATION"



JAVA_TEST=$(java -version 2>&1)
if echo "$JAVA_TEST" | grep -q "22\."; then
  echo "JAVA Found: $JAVA_TEST"
else
  set_javahome
fi

#state directory
if test -d ~/mtdrworkshop-state; then
  export MTDRWORKSHOP_STATE_HOME=~/mtdrworkshop-state
else
  export MTDRWORKSHOP_STATE_HOME=$MTDRWORKSHOP_LOCATION
fi
echo "MTDRWORKSOP_STATE_HOME: $MTDRWORKSHOP_STATE_HOME"
#Log Directory
export MTDRWORKSHOP_LOG=$MTDRWORKSHOP_STATE_HOME/log
mkdir -p $MTDRWORKSHOP_LOG

source $MTDRWORKSHOP_LOCATION/utils/state-functions.sh

# SHORTCUT ALIASES AND UTILS...
alias k='kubectl'
alias kt='kubectl --insecure-skip-tls-verify'
alias pods='kubectl get po --all-namespaces'
alias services='kubectl get services --all-namespaces'
alias gateways='kubectl get gateways --all-namespaces'
alias secrets='kubectl get secrets --all-namespaces'
alias ingresssecret='kubectl get secrets --all-namespaces | grep istio-ingressgateway-certs'
alias virtualservices='kubectl get virtualservices --all-namespaces'
alias deployments='kubectl get deployments --all-namespaces'
alias mtdrworkshop='echo deployments... ; deployments|grep mtdrworkshop ; echo pods... ; pods|grep mtdrworkshop ; echo services... ; services | grep mtdrworkshop ; echo secrets... ; secrets|grep mtdrworkshop ; echo "other shortcut commands... most can take partial podname as argument, such as [logpod front] or [deletepod order]...  pods  services secrets deployments " ; ls $MTDRWORKSHOP_LOCATION/utils/'
alias sshpod1='kubectl exec -i -t $(kubectl get pod --namespace mtdrworkshop --selector='"'"'app=hud'"'"' --output jsonpath='"'"'{.items[0].metadata.name}'"'"') -n mtdrworkshop -- /bin/bash'


export PATH=$PATH:$MTDRWORKSHOP_LOCATION/utils/
```

## 9) Build files that affect JAR packaging

### 9.1 Maven build file

- File: `MtdrSpring/backend/pom.xml`
- Packaging impact highlights:
  - Uses `spring-boot-maven-plugin` with `repackage` goal to produce an executable Spring Boot JAR.
  - Main class: `com.springboot.MyTodoList.MyTodoListApplication`.
  - Frontend build is integrated via `frontend-maven-plugin` (`install-node-and-npm`, `npm install`, `npm run build`).
  - Built frontend static files are copied into backend classpath using `maven-resources-plugin` to `${project.build.outputDirectory}/static`.
  - Dockerfile expects artifact: `target/MyTodoList-0.0.1-SNAPSHOT.jar`.

### 9.2 OCI Build specification (auxiliary)

- File: `build_spec.yaml`
- Relevant behavior:
  - Logs into OCIR, sources `env.sh`, then runs backend `build.sh`.
  - `build.sh` executes `mvn clean package spring-boot:repackage` and builds/pushes image.

