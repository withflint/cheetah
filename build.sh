#!/bin/sh

docker build . -t "cheetah:$GIT_VERSION" --build-arg "GIT_VERSION=$GIT_VERSION"
docker tag cheetah:$GIT_VERSION "717566463867.dkr.ecr.ca-central-1.amazonaws.com/cheetah:$GIT_VERSION"
docker push "717566463867.dkr.ecr.ca-central-1.amazonaws.com/cheetah:$GIT_VERSION"
echo "- published cheetah:$GIT_VERSION" >> output
