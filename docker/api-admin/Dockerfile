FROM node:12-alpine

# Add gcc and git support for native dependencies.
RUN apk --no-cache --virtual build-dependencies add g++ gcc git make python postgresql

# Change the working directory.
WORKDIR /home/node/app

# Workaround because `WORKDIR` always runs as root.
RUN chown -R node /home/node

# Change the user to avoid running as `root`.
USER node

# Copy yarn.lock and package.json.
COPY package.json yarn.lock ./

# Run yarn.
RUN yarn

# Copy project directory.
COPY . ./

# Change to `root` so we can change the ownership of the copied files.
USER root

# Change ownership to user `node`.
RUN chown -R node .

# Change the user to `node` to run the application.
USER node

# Create public directory.
RUN mkdir /home/node/app/public

# Rebuild packages.
RUN npm rebuild

# Setup node entrypoint.
ENTRYPOINT ["/home/node/app/docker-entrypoint.sh"]

# Command.
CMD node apps/api-admin
