workspace {
    model {
        user = person "End User" "A person interacting with the Oracle Java Bot via supported interfaces (web, chat, etc.)"
        telegram = softwareSystem "Telegram API" "External messaging API used for chat interface."
        oci = softwareSystem "Oracle Cloud Infrastructure (OCI)" "Cloud environment and hosting for the bot and database."

        bot = softwareSystem "Oracle Java Bot" "Multilingual AI chatbot supporting Java and Oracle Cloud interactions." {
            webui = container "Web UI" "JavaScript, HTML/CSS" "Browser-based interface."
            logic = container "Application Logic" "Java" "Bot logic, connects frontends to services."
            telegramadapter = container "Telegram Adapter" "JavaScript" "Handles Telegram message integration."
            db = container "Oracle Autonomous Database" "Oracle Autonomous DB" "Stores persistent data, users, logs, etc." {
                tag "database"
            }
        }
        
        user -> webui "Uses"
        user -> telegramadapter "Chats via" 
        webui -> logic "Submits requests to"
        telegramadapter -> logic "Forwards chat messages to"
        logic -> db "Reads/Writes data to"
        logic -> oci "Leverages OCI APIs/services"
        db <- oci "Managed/Provisioned by"
        telegramadapter -> telegram "Uses"
    }
    views {
        systemLandscape {
            include *
            autoLayout
        }
        systemContext bot {
            include *
            autoLayout
        }
        container bot {
            include *
            autoLayout
        }
        component logic {
            include *
            autoLayout
        }
        deployment {
            node "OCI Compute (VM)" {
                containerInstance logic
                containerInstance telegramadapter
            }
            node "Browser" {
                containerInstance webui
            }
            node "Oracle Autonomous DB" {
                containerInstance db
            }
            autoLayout
        }
        dynamic logic "User Registration Sequence" {
            user -> webui "Submits registration form"
            webui -> logic "Sends registration details"
            logic -> db "Persists user"
            autoLayout
        }
    }
    themes default
}