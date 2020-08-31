// This Jenkins build requires a configmap called jenkin-config with the following in it:
//
// password_qtxn=<cfms-postman-operator userid password>
// password_nonqtxn=<cfms-postman-non-operator userid password>
// client_secret=<keycloak client secret>
// zap_with_url=<zap command including dev url for analysis> 
// namespace=<openshift project namespace>
// url=<url of api>/api/v1/
// authurl=<Keycloak domain>
// clientid=<keycload Client ID>
// realm=<keycloak realm>

def WAIT_TIMEOUT = 10
def TAG_NAMES = ['dev', 'test', 'production']
def BUILDS = ['forms-flow-analytics', 'forms-flow-bpm', 'forms-flow-forms', 'forms-flow-web', 'forms-flow-webapi']
def DEP_ENV_NAMES = ['dev', 'test', 'prod']
def label = "mypod-${UUID.randomUUID().toString()}"
def API_IMAGE_HASH = ""
def FRONTEND_IMAGE_HASH = ""
def APPOINTMENT_IMAGE_HASH = ""
def REMINDER_IMAGE_HASH = ""

String getNameSpace() {
    def NAMESPACE = sh (
        script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^namespace/{print $2}\'',
        returnStdout: true
    ).trim()
    return NAMESPACE
}

// Get an image's hash tag
String getImageTagHash(String imageName, String tag = "") {

  if(!tag?.trim()) {
    tag = "latest"
  }

  def istag = openshift.raw("get istag ${imageName}:${tag} -o template --template='{{.image.dockerImageReference}}'")
  return istag.out.tokenize('@')[1].trim()
}

podTemplate(
    label: label, 
    name: 'jenkins-python3nodejs', 
    serviceAccount: 'jenkins', 
    cloud: 'openshift', 
    containers: [
        containerTemplate(
            name: 'jnlp',
            image: '172.50.0.2:5000/openshift/jenkins-slave-python3nodejs',
            resourceRequestCpu: '1000m',
            resourceLimitCpu: '2000m',
            resourceRequestMemory: '2Gi',
            resourceLimitMemory: '4Gi',
            workingDir: '/tmp',
            command: '',
            args: '${computer.jnlpmac} ${computer.name}'
        )
    ]
){
    node(label) {

        stage('Checkout Source') {
            echo "checking out source"
            checkout scm
        }
            
        stage('SonarQube Analysis') {
            echo ">>> Performing static analysis <<<"
            SONAR_ROUTE_NAME = 'sonarqube'
            SONAR_ROUTE_NAMESPACE = sh (
                script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^namespace/{print $2}\'',
                returnStdout: true
            ).trim()
            SONAR_PROJECT_NAME = 'formsflow-ai'
            SONAR_PROJECT_KEY = 'formsflow-ai'
            SONAR_PROJECT_BASE_DIR = '../'
            SONAR_SOURCES = './'

            SONARQUBE_PWD = sh (
                script: 'oc set env dc/sonarqube --list | awk  -F  "=" \'/SONARQUBE_ADMINPW/{print $2}\'',
                returnStdout: true
            ).trim()

            SONARQUBE_URL = sh (
                script: 'oc get routes -o wide --no-headers | awk \'/sonarqube/{ print match($0,/edge/) ?  "https://"$2 : "http://"$2 }\'',
                returnStdout: true
            ).trim()

            echo "PWD: ${SONARQUBE_PWD}"
            echo "URL: ${SONARQUBE_URL}"

            dir('sonar-runner') {
                sh (
                    returnStdout: true,
                    script: "./gradlew sonarqube --stacktrace --info \
                        -Dsonar.verbose=true \
                        -Dsonar.login=admin \
                        -Dsonar.password=${SONARQUBE_PWD} \
                        -Dsonar.host.url=${SONARQUBE_URL} \
                        -Dsonar.projectName='${SONAR_PROJECT_NAME}' \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.projectBaseDir=${SONAR_PROJECT_BASE_DIR} \
                        -Dsonar.sources=${SONAR_SOURCES}"
                )
            }
        }
        /*
        stage("Build Analytics (Redash)..") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {
                        // Find all of the build configurations associated to the application using labels ...
                        def bc = openshift.selector("bc", "${BUILDS[0]}")
                        echo "Started builds: ${bc.names()}"
                        bc.startBuild("--wait").logs("-f")
                    }
                    echo "Redash Build complete ..."
                }
            }
        }
        stage("Build BPM (Camunda)..") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {

                        // Find all of the build configurations associated to the application using labels ...
                        def bc = openshift.selector("bc", "${BUILDS[1]}")
                        echo "Started builds: ${bc.names()}"
                        bc.startBuild("--wait").logs("-f")
                    }
                    echo "Camunda Build complete ..."
                }
            }
        }
        stage("Build Forms (FormIO)..") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {

                        // Find all of the build configurations associated to the application using labels ...
                        bc = openshift.selector("bc", "${BUILDS[2]}")
                        echo "Started builds: ${bc.names()}"
                        bc.startBuild("--wait").logs("-f")
                    }
                    echo "FormIO complete ..."
                }
            }
        }
        stage("Build Web") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {

                        // Find all of the build configurations associated to the application using labels ...
                        bc = openshift.selector("bc", "${BUILDS[3]}")
                        echo "Started builds: ${bc.names()}"
                        bc.startBuild("--wait").logs("-f")
                    }
                    echo "Web complete ..."
                }
            }
        }
        stage("Build Web API") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {

                        // Find all of the build configurations associated to the application using labels ...
                        bc = openshift.selector("bc", "${BUILDS[4]}")
                        echo "Started builds: ${bc.names()}"
                        bc.startBuild("--wait").logs("-f")
                    }
                    echo "Web API complete ..."
                }
            }
        }
        */
        /*
        stage("Deploy Redash to Dev") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {
                        echo "Tagging ${BUILDS[0]} for deployment to ${TAG_NAMES[0]} ..."

                        // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                        // Tag the images for deployment based on the image's hash
                        API_IMAGE_HASH = getImageTagHash("${BUILDS[0]}")
                        echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                        openshift.tag("${BUILDS[0]}@${API_IMAGE_HASH}", "${BUILDS[0]}:${TAG_NAMES[0]}")
                    }

                    def NAME_SPACE = getNameSpace()
                    openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[0]}") {
                        def dc = openshift.selector('dc', "${BUILDS[0]}")
                        // Wait for the deployment to complete.
                        // This will wait until the desired replicas are all available
                        dc.rollout().status()
                    }
                    echo "API Deployment Complete."
                }
            }
        }
        stage("Deploy Camunda to Dev") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {
                        echo "Tagging ${BUILDS[1]} for deployment to ${TAG_NAMES[0]} ..."

                        // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                        // Tag the images for deployment based on the image's hash
                        API_IMAGE_HASH = getImageTagHash("${BUILDS[1]}")
                        echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                        openshift.tag("${BUILDS[1]}@${API_IMAGE_HASH}", "${BUILDS[1]}:${TAG_NAMES[0]}")
                    }

                    def NAME_SPACE = getNameSpace()
                    openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[0]}") {
                        def dc = openshift.selector('dc', "${BUILDS[1]}")
                        // Wait for the deployment to complete.
                        // This will wait until the desired replicas are all available
                        dc.rollout().status()
                    }
                    echo "API Deployment Complete."
                }
            }
        }
        stage("Deploy FormIO to Dev") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {
                        echo "Tagging ${BUILDS[2]} for deployment to ${TAG_NAMES[0]} ..."

                        // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                        // Tag the images for deployment based on the image's hash
                        API_IMAGE_HASH = getImageTagHash("${BUILDS[2]}")
                        echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                        openshift.tag("${BUILDS[2]}@${API_IMAGE_HASH}", "${BUILDS[2]}:${TAG_NAMES[0]}")
                    }

                    def NAME_SPACE = getNameSpace()
                    openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[0]}") {
                        def dc = openshift.selector('dc', "${BUILDS[2]}")
                        // Wait for the deployment to complete.
                        // This will wait until the desired replicas are all available
                        dc.rollout().status()
                    }
                    echo "API Deployment Complete."
                }
            }
        }
        stage("Deploy Web UI to Dev") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {
                        echo "Tagging ${BUILDS[3]} for deployment to ${TAG_NAMES[0]} ..."

                        // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                        // Tag the images for deployment based on the image's hash
                        API_IMAGE_HASH = getImageTagHash("${BUILDS[3]}")
                        echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                        openshift.tag("${BUILDS[3]}@${API_IMAGE_HASH}", "${BUILDS[3]}:${TAG_NAMES[0]}")
                    }

                    def NAME_SPACE = getNameSpace()
                    openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[0]}") {
                        def dc = openshift.selector('dc', "${BUILDS[3]}")
                        // Wait for the deployment to complete.
                        // This will wait until the desired replicas are all available
                        dc.rollout().status()
                    }
                    echo "API Deployment Complete."
                }
            }
        }
        stage("Deploy Web API to Dev") {
            script: {
                openshift.withCluster() {
                    openshift.withProject() {
                        echo "Tagging ${BUILDS[4]} for deployment to ${TAG_NAMES[0]} ..."

                        // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                        // Tag the images for deployment based on the image's hash
                        API_IMAGE_HASH = getImageTagHash("${BUILDS[4]}")
                        echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                        openshift.tag("${BUILDS[4]}@${API_IMAGE_HASH}", "${BUILDS[4]}:${TAG_NAMES[0]}")
                    }

                    def NAME_SPACE = getNameSpace()
                    openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[0]}") {
                        def dc = openshift.selector('dc', "${BUILDS[4]}")
                        // Wait for the deployment to complete.
                        // This will wait until the desired replicas are all available
                        dc.rollout().status()
                    }
                    echo "API Deployment Complete."
                }
            }
        }*/
        /*
        stage('Newman Tests') {
            dir('api/postman') {
                sh "ls -alh"

                sh (
                    returnStdout: true,
                    script: "npm init -y"
                )

                sh (
                    returnStdout: true,
                    script: "npm install newman@4.6.1"
                )

                USERID = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^userid_qtxn/{print $2}\'',
                    returnStdout: true
                ).trim()

                PASSWORD = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^password_qtxn/{print $2}\'',
                    returnStdout: true
                ).trim()

                USERID_NONQTXN = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^userid_nonqtxn/{print $2}\'',
                    returnStdout: true
                ).trim()

                PASSWORD_NONQTXN = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^password_nonqtxn/{print $2}\'',
                    returnStdout: true
                ).trim()

                CLIENT_SECRET = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^client_secret/{print $2}\'',
                    returnStdout: true
                ).trim()

                REALM = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^realm/{print $2}\'',
                    returnStdout: true
                ).trim()

                API_URL = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^url/{print $2}\'',
                    returnStdout: true
                ).trim()

                AUTH_URL = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/auth_url/{print $2}\'',
                    returnStdout: true
                ).trim()

                CLIENTID = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^clientid/{print $2}\'',
                    returnStdout: true
                ).trim()

                PUBLIC_USERID = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^public_user_id/{print $2}\'',
                    returnStdout: true
                ).trim()

                PASSWORD_PUBLIC_USER = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^public_user_password/{print $2}\'',
                    returnStdout: true
                ).trim()

                PUBLIC_API_URL = sh (
                    script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^public_url/{print $2}\'',
                    returnStdout: true
                ).trim()

                NODE_OPTIONS='--max_old_space_size=2048'

                sh (
                    returnStdout: true,
                    script: "./node_modules/newman/bin/newman.js run API_Test_TheQ_Booking.json --delay-request 250 -e postman_env.json --global-var 'userid=${USERID}' --global-var 'password=${PASSWORD}' --global-var 'userid_nonqtxn=${USERID_NONQTXN}' --global-var 'password_nonqtxn=${PASSWORD_NONQTXN}' --global-var 'client_secret=${CLIENT_SECRET}' --global-var 'url=${API_URL}' --global-var 'auth_url=${AUTH_URL}' --global-var 'clientid=${CLIENTID}' --global-var 'realm=${REALM}' --global-var public_url=${PUBLIC_API_URL} --global-var public_user_id=${PUBLIC_USERID} --global-var public_user_password=${PASSWORD_PUBLIC_USER}"
                )
            }
        }
        */
    }
}
/*
def owaspPodLabel = "owasp-zap-${UUID.randomUUID().toString()}"
podTemplate(
    label: owaspPodLabel, 
    name: owaspPodLabel, 
    serviceAccount: 'jenkins', 
    cloud: 'openshift', 
    containers: [ containerTemplate(
        name: 'jnlp',
        image: '172.50.0.2:5000/openshift/jenkins-slave-zap',
        resourceRequestCpu: '500m',
        resourceLimitCpu: '1000m',
        resourceRequestMemory: '3Gi',
        resourceLimitMemory: '4Gi',
        workingDir: '/home/jenkins',
        command: '',
        args: '${computer.jnlpmac} ${computer.name}'
    )]
) {
    node(owaspPodLabel) {
        stage('ZAP Security Scan') {
            sleep 60
            ZAP_WITH_URL = sh (
                script: 'oc describe configmap jenkin-config | awk  -F  "=" \'/^zap_with_url/{print $2}\'',
                returnStdout: true
            ).trim()            
            def retVal = sh (
                returnStatus: true, 
                script: "${ZAP_WITH_URL}"
            )
            publishHTML([
                allowMissing: false, 
                alwaysLinkToLastBuild: false, 
                keepAll: true, 
                reportDir: '/zap/wrk', 
                reportFiles: 'baseline.html', 
                reportName: 'ZAP_Baseline_Scan', 
                reportTitles: 'ZAP_Baseline_Scan'
            ])
            echo "Return value is: ${retVal}"

            script {
                if (retVal != 0) {
                    echo "MARKING BUILD AS UNSTABLE"
                    currentBuild.result = 'UNSTABLE'
                }
            }
        }
    }
} 

node {
    stage("Deploy Redash - test") {
        input "Deploy to test?"
        script: {
            openshift.withCluster() {
                openshift.withProject() {
                    echo "Tagging ${BUILDS[0]} for deployment to ${TAG_NAMES[1]} ..."

                    // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                    // Tag the images for deployment based on the image's hash
                    echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                    openshift.tag("${BUILDS[0]}@${API_IMAGE_HASH}", "${BUILDS[0]}:${TAG_NAMES[1]}")
                }

                def NAME_SPACE = getNameSpace()
                openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[1]}") {
                    def dc = openshift.selector('dc', "${BUILDS[0]}")
                    // Wait for the deployment to complete.
                    // This will wait until the desired replicas are all available
                    dc.rollout().status()
                }
                echo "API Deployment Complete."
            }
        }
    }
}
node {
    stage("Update Stable") {
        input "Deploy to Prod?"
        script: {
            openshift.withCluster() {
                openshift.withProject() {
                    echo "Tagging Production to Stable"
                    openshift.tag("${BUILDS[0]}:production", "${BUILDS[0]}:stable")
                    openshift.tag("${BUILDS[1]}:production", "${BUILDS[1]}:stable")
                    openshift.tag("${BUILDS[2]}:production", "${BUILDS[2]}:stable")
                    openshift.tag("${BUILDS[3]}:production", "${BUILDS[3]}:stable")
                    openshift.tag("${BUILDS[4]}:production", "${BUILDS[4]}:stable")
                }
            }
        }
    }
}
node {
    stage("Deploy Redash - Prod") {
        script: {
            openshift.withCluster() {
                openshift.withProject() {
                    echo "Tagging ${BUILDS[0]} for deployment to ${TAG_NAMES[2]} ..."

                    // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
                    // Tag the images for deployment based on the image's hash
                    echo "API_IMAGE_HASH: ${API_IMAGE_HASH}"
                    openshift.tag("${BUILDS[0]}@${API_IMAGE_HASH}", "${BUILDS[0]}:${TAG_NAMES[2]}")
                }

                def NAME_SPACE = getNameSpace()
                openshift.withProject("${NAME_SPACE}-${DEP_ENV_NAMES[2]}") {
                    def dc = openshift.selector('dc', "${BUILDS[0]}")
                    // Wait for the deployment to complete.
                    // This will wait until the desired replicas are all available
                    dc.rollout().status()
                }
                echo "API Deployment Complete."
            }
        }
    }
}
*/