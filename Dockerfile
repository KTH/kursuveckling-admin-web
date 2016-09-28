FROM kthse/kth-nodejs-web:1.4

# Maintainer
MAINTAINER Webmaster "webmaster@kth.se"

LABEL name="KTH Node Base Image"
LABEL vendor="KTH Royal Institute of Technology"
LABEL license="The MIT License (MIT)"

RUN mkdir -p /npm
RUN mkdir -p /application


# We do this to avoid npm install when we're only changing code
WORKDIR /npm

COPY ["package.json", "package.json"]

RUN npm install

# Add the code and copy over the node_modules

WORKDIR /application
COPY [".", "."]

RUN cp -a /npm/node_modules /application
RUN cp -a /config/localSettings.js.in /config/localSettings.js 

EXPOSE 3000

ENTRYPOINT ["node", "app.js"]