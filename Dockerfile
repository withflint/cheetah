# pull official base image
FROM 717566463867.dkr.ecr.ca-central-1.amazonaws.com/dep:node-alpine

ARG GIT_VERSION=${GIT_VERSION}
ENV GIT_VERSION=${GIT_VERSION}

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --quiet

# add app
COPY . ./

EXPOSE 9090

# start app
CMD ["node", "src/server.js"]
