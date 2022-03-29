FROM jboss/keycloak:14.0.0

RUN sed -i -E "s/(<staticMaxAge>)2592000(<\/staticMaxAge>)/\1\-1\2/" /opt/jboss/keycloak/standalone/configuration/standalone.xml
RUN sed -i -E "s/(<cacheThemes>)true(<\/cacheThemes>)/\1false\2/" /opt/jboss/keycloak/standalone/configuration/standalone.xml
RUN sed -i -E "s/(<cacheTemplates>)true(<\/cacheTemplates>)/\1false\2/" /opt/jboss/keycloak/standalone/configuration/standalone.xml