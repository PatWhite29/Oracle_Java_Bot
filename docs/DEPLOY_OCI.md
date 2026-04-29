# Oracle Java Bot OCI Deploy

Esta guia deja `Oracle_Java_Bot` listo para desplegar la app completa en OCI OKE con imagen Docker, Autonomous Database y secretos traidos desde OCI Vault.

## 1. Preparar branch

```bash
cd /Users/yaelgarciam/Oracle_Java_Bot
git checkout -b deploy-oci-autonomous-db
git status
git add MtdrSpring/backend/src/main/resources/application.properties \
  MtdrSpring/backend/src/main/resources/todolistapp-springboot.yaml \
  MtdrSpring/backend/src/main/resources/db/oracle-schema.sql \
  MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/config/OracleConfiguration.java \
  MtdrSpring/backend/src/main/java/com/springboot/MyTodoList/controller/ToDoItemBotController.java \
  MtdrSpring/backend/deploy.sh \
  MtdrSpring/utils/db-setup.sh \
  MtdrSpring/scripts/create-k8s-secrets-from-vault.sh \
  docs/DEPLOY_OCI.md
git commit -m "Prepare Oracle Java Bot for OCI deploy"
git push -u origin deploy-oci-autonomous-db
```

## 2. Variables que necesita la app

La app ya no guarda tokens ni passwords en `application.properties`. En OKE se leen desde Kubernetes Secrets:

- `dbuser`, key `dbpassword`: password del usuario `TODOUSER` y/o admin password si usas el flujo del workshop.
- `telegrambot`, key `token`: token de BotFather.
- `frontendadmin`, key `password`: password de acceso UI.
- `deepseek`, key `api-key`: opcional, solo si usaras DeepSeek.

El deployment tambien inyecta:

- `DB_URL=jdbc:oracle:thin:@<DB_NAME>_tp?TNS_ADMIN=/mtdrworkshop/creds`
- `DB_USER=TODOUSER`
- `ORACLE_JDBC_DRIVER_TYPE=thin`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=update`

## 3. Crear secretos en OCI Vault

En OCI Console:

1. Ve a `Identity & Security > Vault`.
2. Crea o usa un Vault y una Encryption Key.
3. Crea estos secretos:
   - `oracle-java-bot-db-password`
   - `oracle-java-bot-telegram-token`
   - `oracle-java-bot-ui-password`
   - `oracle-java-bot-deepseek-api-key`, opcional
4. Copia el OCID de cada secreto.

En Cloud Shell o tu terminal con OCI CLI configurado:

```bash
cd /Users/yaelgarciam/Oracle_Java_Bot
export DB_PASSWORD_SECRET_OCID="ocid1.vaultsecret.oc1..."
export TELEGRAM_BOT_TOKEN_SECRET_OCID="ocid1.vaultsecret.oc1..."
export UI_PASSWORD_SECRET_OCID="ocid1.vaultsecret.oc1..."
export DEEPSEEK_API_KEY_SECRET_OCID="ocid1.vaultsecret.oc1..." # opcional
export K8S_NAMESPACE="mtdrworkshop"
chmod +x MtdrSpring/scripts/create-k8s-secrets-from-vault.sh
MtdrSpring/scripts/create-k8s-secrets-from-vault.sh
```

Ese script lee los valores desde OCI Vault y crea/actualiza los Kubernetes Secrets que consume el deployment.

## 4. Conectar a tu Autonomous Database existente

Si ya tienes una Autonomous Database vacia, necesitas wallet y usuario/schema.

```bash
export DB_OCID="ocid1.autonomousdatabase.oc1..."
export DB_NAME="NOMBRE_DE_TU_ADB"
export DB_PASSWORD="PasswordSeguro123"
mkdir -p /tmp/oracle-java-bot-wallet
oci db autonomous-database generate-wallet \
  --autonomous-database-id "$DB_OCID" \
  --file /tmp/oracle-java-bot-wallet/wallet.zip \
  --password "$DB_PASSWORD" \
  --generate-type ALL
unzip -o /tmp/oracle-java-bot-wallet/wallet.zip -d /tmp/oracle-java-bot-wallet
```

Edita `/tmp/oracle-java-bot-wallet/sqlnet.ora` para que use el path de Kubernetes:

```text
WALLET_LOCATION = (SOURCE = (METHOD = file) (METHOD_DATA = (DIRECTORY="/mtdrworkshop/creds")))
SSL_SERVER_DN_MATCH=yes
```

Crea/actualiza el secret de wallet:

```bash
kubectl create secret generic db-wallet-secret \
  -n mtdrworkshop \
  --from-file=/tmp/oracle-java-bot-wallet/README \
  --from-file=/tmp/oracle-java-bot-wallet/cwallet.sso \
  --from-file=/tmp/oracle-java-bot-wallet/ewallet.p12 \
  --from-file=/tmp/oracle-java-bot-wallet/keystore.jks \
  --from-file=/tmp/oracle-java-bot-wallet/ojdbc.properties \
  --from-file=/tmp/oracle-java-bot-wallet/sqlnet.ora \
  --from-file=/tmp/oracle-java-bot-wallet/tnsnames.ora \
  --from-file=/tmp/oracle-java-bot-wallet/truststore.jks \
  --dry-run=client -o yaml | kubectl apply -f -
```

Crea el usuario y tablas. Puedes correr el schema desde SQL Developer, Database Actions o SQLcl conectado como `admin`:

```sql
CREATE USER TODOUSER IDENTIFIED BY "PasswordSeguro123" DEFAULT TABLESPACE data QUOTA UNLIMITED ON data;
GRANT CREATE SESSION, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE TO TODOUSER;
GRANT CREATE TABLE, CREATE TRIGGER, CREATE TYPE, CREATE MATERIALIZED VIEW TO TODOUSER;
GRANT CONNECT, RESOURCE, pdb_dba, SODA_APP TO TODOUSER;
```

Luego conecta como `TODOUSER` y ejecuta:

```bash
sqlplus TODOUSER/"$DB_PASSWORD"@"${DB_NAME}_tp" @MtdrSpring/backend/src/main/resources/db/oracle-schema.sql
```

## 5. Build Docker y deploy

```bash
cd /Users/yaelgarciam/Oracle_Java_Bot/MtdrSpring/backend
mvn -DskipTests package

export DOCKER_REGISTRY="<region>.ocir.io/<namespace>/<repo>"
docker build -t "$DOCKER_REGISTRY/todolistapp-springboot:0.1" .
docker push "$DOCKER_REGISTRY/todolistapp-springboot:0.1"

export TODO_PDB_NAME="$DB_NAME"
export OCI_REGION="<tu-region>"
export UI_USERNAME="<usuario-ui>"
export TELEGRAM_BOT_NAME="OracleBot101_bot"
./deploy.sh
```

Verifica:

```bash
kubectl get pods -n mtdrworkshop
kubectl logs -n mtdrworkshop deployment/todolistapp-springboot-deployment --tail=120
kubectl get svc -n mtdrworkshop todolistapp-springboot-service
```

La URL publica sale en `EXTERNAL-IP` del service `todolistapp-springboot-service`.
