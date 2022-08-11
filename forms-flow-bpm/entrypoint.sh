printenv >> /app/.env

java -Dserver.port=${BPM_PORT} -Djava.security.egd=file:/dev/./urandom -jar /app/forms-flow-bpm.jar
