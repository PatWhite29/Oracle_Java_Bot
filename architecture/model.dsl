workspace {

    model {
        teamMember = person "Team Member" "A user creating and managing tasks and sprints."
        projectManager = person "Project Manager" "Supervises projects, sprints, tasks."
        administrator = person "Administrator" "Platform operations, log/business intelligence monitoring."

        telegramAPI = softwareSystem "Telegram API" "Sends/receives bot messages."
        github = softwareSystem "GitHub" "Houses code and CI/CD actions."
        oci = softwareSystem "Oracle Cloud Infrastructure" "Cloud host (OKE, OCI, ADB, etc.)."

        bot = softwareSystem "Oracle Java Bot Platform" "Automates task management, NLU-based chat interactions, and integrations." {
            webApp = container "Web App" "Task/project dashboard." "React.js"
            telegramBot = container "Telegram Bot Adapter" "Handles message and chat routing with NLU workflow." "Node.js" {
                url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/bot.puml"
            }
            nlu = container "NLU Service" "Parses and classifies user intent/entities for commands via text/chat." "Java Spring Boot or Python" {
                url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/nlu.puml"
            }
            backend = container "Spring Boot Backend" "Skill orchestration, data/services, notifications, and security." "Java, Spring Boot" {
                userController = component "User Controller" "User CRUD, authZ/authN." "REST Controller" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/controllers.puml"
                }
                taskController = component "Task Controller" "CRUD for tasks, status management, assignment." "REST Controller" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/controllers.puml"
                }
                sprintController = component "Sprint Controller" "Sprint planning/execution." "REST Controller" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/controllers.puml"
                }
                projectService = component "Project Service" "Business/project logic." "Spring Service" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/services.puml"
                }
                taskService = component "Task Service" "Task rules, assignment, priorities." "Spring Service" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/services.puml"
                }
                notificationService = component "Notification Service" "User notifications via web/Telegram." "Spring Service" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/notification.puml"
                }
                repositoryLayer = component "Repository Layer" "Repository for all system entities." "Spring Data/JPA" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/repositories.puml"
                }
                dbAccess = component "Database Access Layer" "Performs SQL/PLSQL DB connection." "JDBC/Spring Data" {
                    url "https://github.com/PatWhite29/Oracle_Java_Bot/blob/master/docs/diagrams/repositories.puml"
                }
            }
            db = container "Oracle Autonomous Database" "Persistence for users, tasks, sprints, projects, logs." "Oracle Autonomous DB" {
                tag "database"
            }
            ciCd = container "DevOps & CI/CD" "CI pipeline and images for OCI/OKE." "GitHub Actions & Docker"
        }

        teamMember -> webApp "Uses Web dashboard"
        projectManager -> webApp "Configures projects/sprints"
        administrator -> webApp "Admin, logs, platform health"
        teamMember -> telegramBot "Chats with bot"

        telegramBot -> telegramAPI "Integrates with"
        webApp -> backend "REST API"
        telegramBot -> nlu "Sends user message for NLU"
        nlu -> backend "Sends structured intent JSON"
        telegramBot -> backend "Forwards chat and attachments"
        backend -> db "Full persistence"
        backend -> oci "Uses cloud services"
        ciCd -> github "Pushes/PR/CI"
        ciCd -> oci "Deployment"
        oci -> db "Provisions and manages"

        webApp -> userController "REST/JSON"
        telegramBot -> taskController "HTTP/JSON"
        nlu -> taskController "Dispatches task intent"
        nlu -> sprintController "Dispatches sprint intent"
        nlu -> userController "Dispatches user intent"
        userController -> projectService "Business rules"
        taskController -> taskService "Business rules"
        sprintController -> taskService "Sprint/task association"
        projectService -> repositoryLayer "CRUD"
        taskService -> repositoryLayer "CRUD and business rules"
        taskService -> notificationService "Triggers notification"
        notificationService -> telegramBot "Notify user via Telegram"
        notificationService -> webApp "Notify user via Web"
        repositoryLayer -> dbAccess "For all DB entities"
        dbAccess -> db "SQL"

        deploymentEnvironment "Production" {
            deploymentNode "OCI Kubernetes Engine OKE" {
                deploymentNode "OKE Namespace java-bot" {
                    deploymentNode "Docker Pod Web App" {
                        containerInstance webApp
                    }
                    deploymentNode "Docker Pod Telegram Bot Adapter" {
                        containerInstance telegramBot
                    }
                    deploymentNode "Docker Pod Spring Boot Backend" {
                        containerInstance backend
                    }
                    deploymentNode "Docker Pod NLU Service" {
                        containerInstance nlu
                    }
                }
            }

            deploymentNode "Oracle Autonomous Database Service" {
                containerInstance db
            }

            deploymentNode "Telegram Cloud" {
                softwareSystemInstance telegramAPI
            }

            deploymentNode "GitHub Cloud" {
                softwareSystemInstance github
                containerInstance ciCd
            }
        }
    }

    views {
        systemLandscape "SystemLandscape" {
            include *
            autoLayout lr
        }

        systemContext bot "SystemContext" {
            include *
            autoLayout lr
        }

        container bot "Containers" {
            include *
            autoLayout lr
        }

        component backend "BackendComponents" {
            include *
            autoLayout lr
        }

        deployment bot "Production" "Deployment" {
            include *
            autoLayout lr
        }

        dynamic backend "CreateTaskViaTelegramAndNLU" {
            teamMember -> telegramBot "Sends create task message"
            telegramBot -> nlu "Passes text message"
            nlu -> taskController "Intent resolved as createTask"
            taskController -> taskService "Runs createTask business logic"
            taskService -> repositoryLayer "Save task"
            repositoryLayer -> dbAccess "Insert row"
            dbAccess -> db "SQL insert"
            taskService -> notificationService "Trigger notification"
            notificationService -> telegramBot "Notifies task created"
            telegramBot -> teamMember "Confirms new task created"
            autoLayout lr
        }

        styles {
            element "database" {
                shape cylinder
            }
        }
    }
}
